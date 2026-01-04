import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export interface CollegeAthleteBaseStackProps extends cdk.StackProps {
    environment: 'development' | 'production';
    domainName: string;
    certificateArn?: string;
    hostedZoneId?: string;
    dbInstanceClass: string;
    cacheNodeType: string;
    minCapacity: number;
    maxCapacity: number;
}

export class CollegeAthleteBaseStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CollegeAthleteBaseStackProps) {
        super(scope, id, props);

        const { environment, domainName, certificateArn, hostedZoneId } = props;

        // VPC with public and private subnets
        const vpc = new ec2.Vpc(this, 'VPC', {
            maxAzs: 2,
            natGateways: environment === 'production' ? 2 : 1,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'Private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
                {
                    cidrMask: 28,
                    name: 'Isolated',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });

        // Security group for database
        const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
            vpc,
            description: `Database security group for ${environment}`,
            allowAllOutbound: false,
        });

        // Security group for cache
        const cacheSecurityGroup = new ec2.SecurityGroup(this, 'CacheSecurityGroup', {
            vpc,
            description: `Cache security group for ${environment}`,
            allowAllOutbound: false,
        });

        // Security group for application
        const appSecurityGroup = new ec2.SecurityGroup(this, 'AppSecurityGroup', {
            vpc,
            description: `Application security group for ${environment}`,
            allowAllOutbound: true,
        });

        // Allow app to connect to database
        dbSecurityGroup.addIngressRule(
            appSecurityGroup,
            ec2.Port.tcp(5432),
            'Allow PostgreSQL access from application'
        );

        // Allow app to connect to cache
        cacheSecurityGroup.addIngressRule(
            appSecurityGroup,
            ec2.Port.tcp(6379),
            'Allow Redis access from application'
        );

        // Database credentials secret
        const dbCredentials = new secretsmanager.Secret(this, 'DatabaseCredentials', {
            secretName: `${environment}/college-athlete-base/db-credentials`,
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'postgres' }),
                generateStringKey: 'password',
                excludePunctuation: true,
                includeSpace: false,
                passwordLength: 32,
            },
        });

        // RDS PostgreSQL database
        const database = new rds.DatabaseInstance(this, 'Database', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_16,
            }),
            instanceType: new ec2.InstanceType(props.dbInstanceClass),
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
            securityGroups: [dbSecurityGroup],
            credentials: rds.Credentials.fromSecret(dbCredentials),
            databaseName: 'college_athlete_base',
            allocatedStorage: environment === 'production' ? 100 : 20,
            maxAllocatedStorage: environment === 'production' ? 500 : 100,
            backupRetention: environment === 'production' ? cdk.Duration.days(7) : cdk.Duration.days(1),
            deleteAutomatedBackups: environment !== 'production',
            removalPolicy: environment === 'production' ? cdk.RemovalPolicy.SNAPSHOT : cdk.RemovalPolicy.DESTROY,
            deletionProtection: environment === 'production',
            multiAz: environment === 'production',
            storageEncrypted: true,
            cloudwatchLogsExports: ['postgresql'],
            cloudwatchLogsRetention: logs.RetentionDays.ONE_MONTH,
        });

        // ElastiCache Redis subnet group
        const cacheSubnetGroup = new elasticache.CfnSubnetGroup(this, 'CacheSubnetGroup', {
            description: `Cache subnet group for ${environment}`,
            subnetIds: vpc.isolatedSubnets.map(subnet => subnet.subnetId),
            cacheSubnetGroupName: `${environment}-cache-subnet-group`,
        });

        // ElastiCache Redis cluster
        const cacheCluster = new elasticache.CfnCacheCluster(this, 'CacheCluster', {
            cacheNodeType: props.cacheNodeType,
            engine: 'redis',
            numCacheNodes: 1,
            cacheSubnetGroupName: cacheSubnetGroup.ref,
            vpcSecurityGroupIds: [cacheSecurityGroup.securityGroupId],
            engineVersion: '7.0',
            autoMinorVersionUpgrade: true,
            preferredMaintenanceWindow: 'sun:05:00-sun:06:00',
            snapshotRetentionLimit: environment === 'production' ? 7 : 1,
            snapshotWindow: '03:00-04:00',
        });

        cacheCluster.addDependency(cacheSubnetGroup);

        // ECS Cluster
        const cluster = new ecs.Cluster(this, 'Cluster', {
            vpc,
            clusterName: `${environment}-college-athlete-base`,
            containerInsights: environment === 'production',
        });

        // Certificate (import existing or reference)
        let certificate: acm.ICertificate | undefined;
        if (certificateArn) {
            certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
        }

        // Hosted Zone (import existing)
        let hostedZone: route53.IHostedZone | undefined;
        if (hostedZoneId) {
            hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
                hostedZoneId,
                zoneName: domainName,
            });
        }

        // Fargate service with ALB
        const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
            this,
            'FargateService',
            {
                cluster,
                serviceName: `${environment}-college-athlete-base`,
                cpu: environment === 'production' ? 1024 : 512,
                memoryLimitMiB: environment === 'production' ? 2048 : 1024,
                desiredCount: environment === 'production' ? 2 : 1,
                taskImageOptions: {
                    image: ecs.ContainerImage.fromRegistry('nginx:alpine'), // Placeholder - will be replaced by CI/CD
                    containerPort: 3000,
                    environment: {
                        NODE_ENV: environment,
                        ENVIRONMENT: environment,
                        LOG_LEVEL: environment === 'production' ? 'info' : 'debug',
                    },
                    secrets: {
                        DATABASE_URL: ecs.Secret.fromSecretsManager(dbCredentials),
                    },
                    logDriver: ecs.LogDrivers.awsLogs({
                        streamPrefix: `${environment}-app`,
                        logRetention: logs.RetentionDays.ONE_MONTH,
                    }),
                },
                publicLoadBalancer: true,
                certificate: certificate,
                domainName: certificate && hostedZone ? domainName : undefined,
                domainZone: hostedZone,
                redirectHTTP: true,
                securityGroups: [appSecurityGroup],
            }
        );

        // Auto-scaling configuration
        const scaling = fargateService.service.autoScaleTaskCount({
            minCapacity: props.minCapacity,
            maxCapacity: props.maxCapacity,
        });

        scaling.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 70,
            scaleInCooldown: cdk.Duration.seconds(60),
            scaleOutCooldown: cdk.Duration.seconds(60),
        });

        scaling.scaleOnMemoryUtilization('MemoryScaling', {
            targetUtilizationPercent: 80,
            scaleInCooldown: cdk.Duration.seconds(60),
            scaleOutCooldown: cdk.Duration.seconds(60),
        });

        // Health check configuration
        fargateService.targetGroup.configureHealthCheck({
            path: '/api/health',
            interval: cdk.Duration.seconds(30),
            timeout: cdk.Duration.seconds(5),
            healthyThresholdCount: 2,
            unhealthyThresholdCount: 3,
        });

        // Add environment variables for Redis connection
        fargateService.taskDefinition.defaultContainer?.addEnvironment(
            'REDIS_URL',
            `redis://${cacheCluster.attrRedisEndpointAddress}:${cacheCluster.attrRedisEndpointPort}`
        );

        // Outputs
        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
            value: fargateService.loadBalancer.loadBalancerDnsName,
            description: 'Load Balancer DNS Name',
        });

        new cdk.CfnOutput(this, 'ServiceURL', {
            value: certificate && hostedZone ? `https://${domainName}` : `http://${fargateService.loadBalancer.loadBalancerDnsName}`,
            description: 'Service URL',
        });

        new cdk.CfnOutput(this, 'DatabaseEndpoint', {
            value: database.dbInstanceEndpointAddress,
            description: 'Database Endpoint',
        });

        new cdk.CfnOutput(this, 'RedisEndpoint', {
            value: `${cacheCluster.attrRedisEndpointAddress}:${cacheCluster.attrRedisEndpointPort}`,
            description: 'Redis Endpoint',
        });

        new cdk.CfnOutput(this, 'DatabaseSecretArn', {
            value: dbCredentials.secretArn,
            description: 'Database Credentials Secret ARN',
        });
    }
}
