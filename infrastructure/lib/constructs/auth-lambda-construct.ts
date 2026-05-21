import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

export interface AuthLambdaConstructProps {
    environment: 'development' | 'production';
    vpc: ec2.IVpc;
    /** Security group that the Lambda will be placed in (private subnet) */
    lambdaSecurityGroup: ec2.ISecurityGroup;
    /** Secrets Manager secret containing DB credentials */
    dbCredentialsSecret: secretsmanager.ISecret;
    /** Secrets Manager secret containing the JWT signing secret */
    jwtSecret: secretsmanager.ISecret;
}

/**
 * CDK construct that deploys the Auth Lambda and its API Gateway HTTP API.
 *
 * The Lambda is placed in the VPC private subnet so it can reach the isolated
 * RDS database subnet. It reads DB credentials and the JWT secret from
 * Secrets Manager at runtime.
 *
 * Requirements: 2.5, 2.6, 2.9, 2.11
 */
export class AuthLambdaConstruct extends Construct {
    /** The HTTP API URL — injected into the ECS task as AUTH_LAMBDA_URL */
    public readonly apiUrl: string;

    constructor(scope: Construct, id: string, props: AuthLambdaConstructProps) {
        super(scope, id);

        const { environment, vpc, lambdaSecurityGroup, dbCredentialsSecret, jwtSecret } = props;

        // Auth Lambda function
        const authLambda = new lambda.Function(this, 'AuthLambda', {
            functionName: `${environment}-college-athlete-base-auth`,
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'index.handler',
            // The bundled dist is built by CI/CD before CDK deploy.
            // During initial synth the placeholder asset is used.
            code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/auth/dist'), {
                // If dist doesn't exist yet (first synth), fall back to an inline placeholder
                // that will be replaced on the first real deploy.
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
                // DB connection details are injected at runtime from Secrets Manager
                // via the addEnvironment calls below after secret resolution.
            },
            logRetention: logs.RetentionDays.ONE_MONTH,
        });

        // Grant the Lambda read access to the DB credentials secret
        dbCredentialsSecret.grantRead(authLambda);

        // Grant the Lambda read access to the JWT secret
        jwtSecret.grantRead(authLambda);

        // Inject secret ARNs so the Lambda can fetch them at runtime
        authLambda.addEnvironment('DB_CREDENTIALS_SECRET_ARN', dbCredentialsSecret.secretArn);
        authLambda.addEnvironment('JWT_SECRET_ARN', jwtSecret.secretArn);

        // API Gateway HTTP API — routes to the Lambda
        const httpApi = new apigatewayv2.HttpApi(this, 'AuthHttpApi', {
            apiName: `${environment}-college-athlete-base-auth`,
            corsPreflight: {
                allowHeaders: ['Content-Type'],
                allowMethods: [apigatewayv2.CorsHttpMethod.POST, apigatewayv2.CorsHttpMethod.OPTIONS],
                allowOrigins: ['*'], // Tightened per environment via ALLOWED_ORIGINS env var on Lambda
            },
        });

        const lambdaIntegration = new apigatewayv2Integrations.HttpLambdaIntegration(
            'AuthLambdaIntegration',
            authLambda
        );

        // Register auth routes
        const routes = [
            '/auth/login/player',
            '/auth/login/coach',
            '/auth/register/player',
            '/auth/register/coach',
        ];

        for (const routePath of routes) {
            httpApi.addRoutes({
                path: routePath,
                methods: [apigatewayv2.HttpMethod.POST],
                integration: lambdaIntegration,
            });
        }

        this.apiUrl = httpApi.apiEndpoint;

        // Stack outputs
        new cdk.CfnOutput(scope, 'AuthLambdaUrl', {
            value: httpApi.apiEndpoint,
            description: `Auth Lambda API Gateway URL (${environment})`,
            exportName: `${environment}-auth-lambda-url`,
        });

        new cdk.CfnOutput(scope, 'AuthLambdaArn', {
            value: authLambda.functionArn,
            description: `Auth Lambda ARN (${environment})`,
        });
    }
}
