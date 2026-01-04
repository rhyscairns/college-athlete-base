#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CollegeAthleteBaseStack } from '../lib/college-athlete-base-stack';

const app = new cdk.App();

// Development environment
new CollegeAthleteBaseStack(app, 'DevStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    },
    environment: 'development',
    domainName: 'collegeathletebase-dev.com',
    certificateArn: process.env.DEV_CERTIFICATE_ARN,
    hostedZoneId: process.env.DEV_HOSTED_ZONE_ID,
    dbInstanceClass: 'db.t4g.micro',
    cacheNodeType: 'cache.t4g.micro',
    minCapacity: 1,
    maxCapacity: 2,
    tags: {
        Environment: 'development',
        Project: 'CollegeAthleteBase',
        ManagedBy: 'CDK',
    },
});

// Production environment
new CollegeAthleteBaseStack(app, 'ProdStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    },
    environment: 'production',
    domainName: 'collegeathletebase.com',
    certificateArn: process.env.PROD_CERTIFICATE_ARN,
    hostedZoneId: process.env.PROD_HOSTED_ZONE_ID,
    dbInstanceClass: 'db.t4g.small',
    cacheNodeType: 'cache.t4g.small',
    minCapacity: 2,
    maxCapacity: 10,
    tags: {
        Environment: 'production',
        Project: 'CollegeAthleteBase',
        ManagedBy: 'CDK',
    },
});

app.synth();
