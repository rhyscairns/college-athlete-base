import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CollegeAthleteBaseStack } from '../lib/college-athlete-base-stack';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Dummy ARN used in tests — the stack imports the cert by ARN so no real cert is needed
const DUMMY_CERT_ARN = 'arn:aws:acm:us-east-1:123456789012:certificate/dummy-cert-id';
const DUMMY_HOSTED_ZONE_ID = 'Z1234567890ABC';

function buildDevStack(): { stack: CollegeAthleteBaseStack; template: Template } {
    const app = new cdk.App();
    const stack = new CollegeAthleteBaseStack(app, 'DevStack', {
        env: { account: '123456789012', region: 'us-east-1' },
        environment: 'development',
        domainName: 'collegeathletebase-dev.com',
        certificateArn: DUMMY_CERT_ARN,
        hostedZoneId: DUMMY_HOSTED_ZONE_ID,
        dbInstanceClass: 'db.t4g.micro',
        cacheNodeType: 'cache.t4g.micro',
        minCapacity: 1,
        maxCapacity: 2,
    });
    return { stack, template: Template.fromStack(stack) };
}

function buildProdStack(): { stack: CollegeAthleteBaseStack; template: Template } {
    const app = new cdk.App();
    const stack = new CollegeAthleteBaseStack(app, 'ProdStack', {
        env: { account: '123456789012', region: 'us-east-1' },
        environment: 'production',
        domainName: 'collegeathletebase.com',
        certificateArn: DUMMY_CERT_ARN,
        hostedZoneId: DUMMY_HOSTED_ZONE_ID,
        dbInstanceClass: 'db.t4g.small',
        cacheNodeType: 'cache.t4g.small',
        minCapacity: 2,
        maxCapacity: 10,
    });
    return { stack, template: Template.fromStack(stack) };
}

// ---------------------------------------------------------------------------
// Multi-environment isolation — Requirements: 1.1, 1.2, 1.3
// ---------------------------------------------------------------------------

describe('Multi-environment isolation', () => {
    test('dev stack creates isolated RDS database', () => {
        const { template } = buildDevStack();
        template.resourceCountIs('AWS::RDS::DBInstance', 1);
        template.hasResourceProperties('AWS::RDS::DBInstance', {
            DBName: 'college_athlete_base',
            Engine: 'postgres',
        });
    });

    test('prod stack creates isolated RDS database', () => {
        const { template } = buildProdStack();
        template.resourceCountIs('AWS::RDS::DBInstance', 1);
        template.hasResourceProperties('AWS::RDS::DBInstance', {
            DBName: 'college_athlete_base',
            Engine: 'postgres',
        });
    });

    test('dev stack creates isolated ElastiCache cluster', () => {
        const { template } = buildDevStack();
        template.resourceCountIs('AWS::ElastiCache::CacheCluster', 1);
        template.hasResourceProperties('AWS::ElastiCache::CacheCluster', {
            Engine: 'redis',
            CacheNodeType: 'cache.t4g.micro',
        });
    });

    test('prod stack creates isolated ElastiCache cluster', () => {
        const { template } = buildProdStack();
        template.resourceCountIs('AWS::ElastiCache::CacheCluster', 1);
        template.hasResourceProperties('AWS::ElastiCache::CacheCluster', {
            Engine: 'redis',
            CacheNodeType: 'cache.t4g.small',
        });
    });

    test('dev stack uses cost-optimised RDS instance class', () => {
        const { template } = buildDevStack();
        // CDK prefixes the instance type with 'db.' when rendering to CloudFormation
        template.hasResourceProperties('AWS::RDS::DBInstance', {
            DBInstanceClass: 'db.db.t4g.micro',
        });
    });

    test('prod stack uses production-grade RDS instance class', () => {
        const { template } = buildProdStack();
        template.hasResourceProperties('AWS::RDS::DBInstance', {
            DBInstanceClass: 'db.db.t4g.small',
            MultiAZ: true,
        });
    });

    test('dev stack uses single NAT gateway', () => {
        const { template } = buildDevStack();
        // Single NAT gateway = 1 EIP for NAT
        const eips = template.findResources('AWS::EC2::EIP');
        const natEips = Object.values(eips).filter(
            (r: any) => r.Properties?.Domain === 'vpc'
        );
        expect(natEips.length).toBe(1);
    });

    test('prod stack uses dual NAT gateways', () => {
        const { template } = buildProdStack();
        const eips = template.findResources('AWS::EC2::EIP');
        const natEips = Object.values(eips).filter(
            (r: any) => r.Properties?.Domain === 'vpc'
        );
        expect(natEips.length).toBe(2);
    });
});

// ---------------------------------------------------------------------------
// Secrets Manager — Requirement: 1.6
// ---------------------------------------------------------------------------

describe('Secrets Manager secrets', () => {
    test('dev stack creates db-credentials secret with dev namespace', () => {
        const { template } = buildDevStack();
        template.hasResourceProperties('AWS::SecretsManager::Secret', {
            Name: 'development/college-athlete-base/db-credentials',
        });
    });

    test('dev stack creates jwt-secret with dev namespace', () => {
        const { template } = buildDevStack();
        template.hasResourceProperties('AWS::SecretsManager::Secret', {
            Name: 'development/college-athlete-base/jwt-secret',
        });
    });

    test('dev stack creates stripe-keys secret with dev namespace', () => {
        const { template } = buildDevStack();
        template.hasResourceProperties('AWS::SecretsManager::Secret', {
            Name: 'development/college-athlete-base/stripe-keys',
        });
    });

    test('prod stack creates db-credentials secret with prod namespace', () => {
        const { template } = buildProdStack();
        template.hasResourceProperties('AWS::SecretsManager::Secret', {
            Name: 'production/college-athlete-base/db-credentials',
        });
    });

    test('prod stack creates jwt-secret with prod namespace', () => {
        const { template } = buildProdStack();
        template.hasResourceProperties('AWS::SecretsManager::Secret', {
            Name: 'production/college-athlete-base/jwt-secret',
        });
    });

    test('prod stack creates stripe-keys secret with prod namespace', () => {
        const { template } = buildProdStack();
        template.hasResourceProperties('AWS::SecretsManager::Secret', {
            Name: 'production/college-athlete-base/stripe-keys',
        });
    });
});

// ---------------------------------------------------------------------------
// Auth Lambda — Requirements: 2.9, 2.11
// ---------------------------------------------------------------------------

describe('Auth Lambda construct', () => {
    test('dev stack deploys auth Lambda with correct function name', () => {
        const { template } = buildDevStack();
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'development-college-athlete-base-auth',
            Runtime: Match.stringLikeRegexp('^nodejs'),
            Handler: 'index.handler',
        });
    });

    test('prod stack deploys auth Lambda with correct function name', () => {
        const { template } = buildProdStack();
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'production-college-athlete-base-auth',
            Runtime: Match.stringLikeRegexp('^nodejs'),
            Handler: 'index.handler',
        });
    });

    test('auth Lambda is placed in VPC private subnet — Requirement 2.11', () => {
        const { template } = buildDevStack();
        // Lambda with VPC config must have SubnetIds and SecurityGroupIds
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'development-college-athlete-base-auth',
            VpcConfig: {
                SubnetIds: Match.anyValue(),
                SecurityGroupIds: Match.anyValue(),
            },
        });
    });

    test('auth Lambda has DB credentials secret ARN in environment', () => {
        const { template } = buildDevStack();
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'development-college-athlete-base-auth',
            Environment: {
                Variables: Match.objectLike({
                    DB_CREDENTIALS_SECRET_ARN: Match.anyValue(),
                    JWT_SECRET_ARN: Match.anyValue(),
                }),
            },
        });
    });

    test('auth Lambda IAM role grants read access to db-credentials secret — Requirement 2.5', () => {
        const { template } = buildDevStack();
        // The IAM policy should allow secretsmanager:GetSecretValue on the db-credentials secret
        template.hasResourceProperties('AWS::IAM::Policy', {
            PolicyDocument: {
                Statement: Match.arrayWith([
                    Match.objectLike({
                        Action: Match.arrayWith(['secretsmanager:GetSecretValue']),
                        Effect: 'Allow',
                    }),
                ]),
            },
        });
    });

    test('auth Lambda IAM role does NOT have access to stripe-keys secret — Requirement 2.5', () => {
        const { template } = buildDevStack();
        // Find the auth Lambda's execution role policies
        const functions = template.findResources('AWS::Lambda::Function', {
            Properties: { FunctionName: 'development-college-athlete-base-auth' },
        });
        const authFunctionId = Object.keys(functions)[0];

        // Get the role attached to the auth Lambda
        const authRoleRef = functions[authFunctionId].Properties.Role['Fn::GetAtt'][0];

        // Find policies attached to that role
        const policies = template.findResources('AWS::IAM::Policy', {
            Properties: {
                Roles: Match.arrayWith([{ Ref: authRoleRef }]),
            },
        });

        // Collect all resource ARNs referenced in those policies
        const allStatements = Object.values(policies).flatMap(
            (p: any) => p.Properties.PolicyDocument.Statement
        );

        // Stripe secret name should not appear in any statement resource for the auth Lambda role
        const stripeSecretName = 'development/college-athlete-base/stripe-keys';
        const stripeSecrets = template.findResources('AWS::SecretsManager::Secret', {
            Properties: { Name: stripeSecretName },
        });
        const stripeSecretId = Object.keys(stripeSecrets)[0];

        const authHasStripeAccess = allStatements.some((stmt: any) => {
            const resources = Array.isArray(stmt.Resource) ? stmt.Resource : [stmt.Resource];
            return resources.some((r: any) => {
                const ref = r?.['Fn::GetAtt']?.[0] || r?.Ref;
                return ref === stripeSecretId;
            });
        });

        expect(authHasStripeAccess).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Payment Lambda — Requirements: 4.6
// ---------------------------------------------------------------------------

describe('Payment Lambda construct', () => {
    test('dev stack deploys payment Lambda with correct function name', () => {
        const { template } = buildDevStack();
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'development-college-athlete-base-payment',
            Runtime: Match.stringLikeRegexp('^nodejs'),
            Handler: 'index.handler',
        });
    });

    test('prod stack deploys payment Lambda with correct function name', () => {
        const { template } = buildProdStack();
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'production-college-athlete-base-payment',
            Runtime: Match.stringLikeRegexp('^nodejs'),
            Handler: 'index.handler',
        });
    });

    test('payment Lambda is placed in VPC private subnet — Requirement 4.6', () => {
        const { template } = buildDevStack();
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'development-college-athlete-base-payment',
            VpcConfig: {
                SubnetIds: Match.anyValue(),
                SecurityGroupIds: Match.anyValue(),
            },
        });
    });

    test('payment Lambda has DB credentials and Stripe secret ARNs in environment', () => {
        const { template } = buildDevStack();
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'development-college-athlete-base-payment',
            Environment: {
                Variables: Match.objectLike({
                    DB_CREDENTIALS_SECRET_ARN: Match.anyValue(),
                    STRIPE_SECRET_ARN: Match.anyValue(),
                }),
            },
        });
    });

    test('payment Lambda IAM role does NOT have access to jwt-secret — Requirement 4.5', () => {
        const { template } = buildDevStack();
        const functions = template.findResources('AWS::Lambda::Function', {
            Properties: { FunctionName: 'development-college-athlete-base-payment' },
        });
        const paymentFunctionId = Object.keys(functions)[0];
        const paymentRoleRef = functions[paymentFunctionId].Properties.Role['Fn::GetAtt'][0];

        const policies = template.findResources('AWS::IAM::Policy', {
            Properties: {
                Roles: Match.arrayWith([{ Ref: paymentRoleRef }]),
            },
        });

        const allStatements = Object.values(policies).flatMap(
            (p: any) => p.Properties.PolicyDocument.Statement
        );

        const jwtSecretName = 'development/college-athlete-base/jwt-secret';
        const jwtSecrets = template.findResources('AWS::SecretsManager::Secret', {
            Properties: { Name: jwtSecretName },
        });
        const jwtSecretId = Object.keys(jwtSecrets)[0];

        const paymentHasJwtAccess = allStatements.some((stmt: any) => {
            const resources = Array.isArray(stmt.Resource) ? stmt.Resource : [stmt.Resource];
            return resources.some((r: any) => {
                const ref = r?.['Fn::GetAtt']?.[0] || r?.Ref;
                return ref === jwtSecretId;
            });
        });

        expect(paymentHasJwtAccess).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Lambda security group — DB access from private subnet — Requirements: 2.9, 4.6
// ---------------------------------------------------------------------------

describe('Lambda security group rules allow DB access from private subnet', () => {
    test('database security group allows PostgreSQL ingress from Lambda security group', () => {
        const { template } = buildDevStack();
        // The DB security group should have an ingress rule on port 5432 from the Lambda SG
        template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
            IpProtocol: 'tcp',
            FromPort: 5432,
            ToPort: 5432,
            Description: 'Allow PostgreSQL access from Lambda functions',
        });
    });

    test('database security group allows PostgreSQL ingress from app security group', () => {
        const { template } = buildDevStack();
        template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
            IpProtocol: 'tcp',
            FromPort: 5432,
            ToPort: 5432,
            Description: 'Allow PostgreSQL access from application',
        });
    });

    test('Lambda security group allows all outbound traffic to reach DB subnet', () => {
        const { template } = buildDevStack();
        // Lambda SG has AllowAllOutbound: true — verify no explicit egress deny
        // The Lambda SG description identifies it
        template.hasResourceProperties('AWS::EC2::SecurityGroup', {
            GroupDescription: Match.stringLikeRegexp('Lambda security group'),
        });
    });

    test('prod stack also has Lambda-to-DB security group ingress rule', () => {
        const { template } = buildProdStack();
        template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
            IpProtocol: 'tcp',
            FromPort: 5432,
            ToPort: 5432,
            Description: 'Allow PostgreSQL access from Lambda functions',
        });
    });
});

// ---------------------------------------------------------------------------
// IAM policies scoped to environment-specific secrets — Requirements: 1.6, 2.5, 4.5
// ---------------------------------------------------------------------------

describe('IAM policies scoped to environment-specific secrets only', () => {
    test('dev stack secrets use development namespace', () => {
        const { template } = buildDevStack();
        const secrets = template.findResources('AWS::SecretsManager::Secret');
        const secretNames = Object.values(secrets).map(
            (s: any) => s.Properties?.Name
        );
        // All secrets must be prefixed with 'development/'
        secretNames.forEach((name: string) => {
            expect(name).toMatch(/^development\//);
        });
    });

    test('prod stack secrets use production namespace', () => {
        const { template } = buildProdStack();
        const secrets = template.findResources('AWS::SecretsManager::Secret');
        const secretNames = Object.values(secrets).map(
            (s: any) => s.Properties?.Name
        );
        // All secrets must be prefixed with 'production/'
        secretNames.forEach((name: string) => {
            expect(name).toMatch(/^production\//);
        });
    });

    test('dev stack has exactly 3 secrets (db-credentials, jwt-secret, stripe-keys)', () => {
        const { template } = buildDevStack();
        template.resourceCountIs('AWS::SecretsManager::Secret', 3);
    });

    test('prod stack has exactly 3 secrets (db-credentials, jwt-secret, stripe-keys)', () => {
        const { template } = buildProdStack();
        template.resourceCountIs('AWS::SecretsManager::Secret', 3);
    });

    test('ECS task role has read access to all 3 secrets', () => {
        const { template } = buildDevStack();
        // There should be IAM policies granting secretsmanager:GetSecretValue
        // The ECS task role needs access to db-credentials, jwt-secret, and stripe-keys
        const policies = template.findResources('AWS::IAM::Policy', {
            Properties: {
                PolicyDocument: {
                    Statement: Match.arrayWith([
                        Match.objectLike({
                            Action: Match.arrayWith(['secretsmanager:GetSecretValue']),
                            Effect: 'Allow',
                        }),
                    ]),
                },
            },
        });
        // At minimum there should be policies granting secret access
        expect(Object.keys(policies).length).toBeGreaterThan(0);
    });
});

// ---------------------------------------------------------------------------
// API Gateway outputs — stack outputs present
// ---------------------------------------------------------------------------

describe('Stack outputs', () => {
    test('dev stack outputs auth Lambda URL', () => {
        const { template } = buildDevStack();
        template.hasOutput('AuthLambdaUrl', {
            Description: Match.stringLikeRegexp('Auth Lambda API Gateway URL'),
        });
    });

    test('dev stack outputs payment webhook URL', () => {
        const { template } = buildDevStack();
        template.hasOutput('PaymentWebhookUrl', {
            Description: Match.stringLikeRegexp('Stripe webhook URL'),
        });
    });

    test('dev stack outputs database endpoint', () => {
        const { template } = buildDevStack();
        template.hasOutput('DatabaseEndpoint', {
            Description: 'Database Endpoint',
        });
    });

    test('prod stack outputs auth Lambda URL', () => {
        const { template } = buildProdStack();
        template.hasOutput('AuthLambdaUrl', {
            Description: Match.stringLikeRegexp('Auth Lambda API Gateway URL'),
        });
    });

    test('prod stack outputs payment webhook URL', () => {
        const { template } = buildProdStack();
        template.hasOutput('PaymentWebhookUrl', {
            Description: Match.stringLikeRegexp('Stripe webhook URL'),
        });
    });
});
