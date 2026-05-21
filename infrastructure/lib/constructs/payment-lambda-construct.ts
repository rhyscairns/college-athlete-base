import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

export interface PaymentLambdaConstructProps {
    environment: 'development' | 'production';
    vpc: ec2.IVpc;
    /** Security group that the Lambda will be placed in (private subnet) */
    lambdaSecurityGroup: ec2.ISecurityGroup;
    /** Secrets Manager secret containing DB credentials */
    dbCredentialsSecret: secretsmanager.ISecret;
    /**
     * Secrets Manager secret containing Stripe keys.
     * Expected keys: secret_key, webhook_secret
     * Dev environment uses Stripe test keys; production uses live keys.
     */
    stripeSecret: secretsmanager.ISecret;
}

/**
 * CDK construct that deploys the Payment Lambda and its API Gateway HTTP API.
 *
 * The Lambda is placed in the VPC private subnet so it can reach the isolated
 * RDS database subnet. It reads DB credentials and Stripe secrets from
 * Secrets Manager at runtime.
 *
 * The webhook endpoint URL is emitted as a stack output so it can be registered
 * with Stripe (test mode for dev, live mode for production).
 *
 * Requirements: 4.5, 4.6, 4.7, 4.8
 */
export class PaymentLambdaConstruct extends Construct {
    /** The HTTP API URL — register this as the Stripe webhook endpoint */
    public readonly webhookUrl: string;

    constructor(scope: Construct, id: string, props: PaymentLambdaConstructProps) {
        super(scope, id);

        const { environment, vpc, lambdaSecurityGroup, dbCredentialsSecret, stripeSecret } = props;

        // Payment Lambda function
        const paymentLambda = new lambda.Function(this, 'PaymentLambda', {
            functionName: `${environment}-college-athlete-base-payment`,
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/payment/dist'), {
                exclude: [],
            }),
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [lambdaSecurityGroup],
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                NODE_ENV: environment,
                ENVIRONMENT: environment,
                // DB and Stripe credentials are injected at runtime from Secrets Manager
                // via the addEnvironment calls below after secret ARN injection.
            },
            logRetention: logs.RetentionDays.ONE_MONTH,
        });

        // Grant the Lambda read access to DB credentials and Stripe secrets
        dbCredentialsSecret.grantRead(paymentLambda);
        stripeSecret.grantRead(paymentLambda);

        // Inject secret ARNs so the Lambda can fetch them at runtime
        paymentLambda.addEnvironment('DB_CREDENTIALS_SECRET_ARN', dbCredentialsSecret.secretArn);
        paymentLambda.addEnvironment('STRIPE_SECRET_ARN', stripeSecret.secretArn);

        // API Gateway HTTP API — exposes the Stripe webhook endpoint
        const httpApi = new apigatewayv2.HttpApi(this, 'PaymentHttpApi', {
            apiName: `${environment}-college-athlete-base-payment`,
            // No CORS needed — Stripe calls this server-to-server
        });

        const lambdaIntegration = new apigatewayv2Integrations.HttpLambdaIntegration(
            'PaymentLambdaIntegration',
            paymentLambda
        );

        httpApi.addRoutes({
            path: '/webhooks/stripe',
            methods: [apigatewayv2.HttpMethod.POST],
            integration: lambdaIntegration,
        });

        this.webhookUrl = `${httpApi.apiEndpoint}/webhooks/stripe`;

        // Stack outputs
        new cdk.CfnOutput(scope, 'PaymentWebhookUrl', {
            value: this.webhookUrl,
            description: `Stripe webhook URL — register this in the Stripe dashboard (${environment})`,
            exportName: `${environment}-payment-webhook-url`,
        });

        new cdk.CfnOutput(scope, 'PaymentLambdaArn', {
            value: paymentLambda.functionArn,
            description: `Payment Lambda ARN (${environment})`,
        });
    }
}
