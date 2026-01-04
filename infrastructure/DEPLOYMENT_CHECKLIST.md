# Infrastructure Deployment Checklist

Use this checklist to ensure all steps are completed when setting up the infrastructure.

## Pre-Deployment

### AWS Account Setup
- [ ] AWS account created and accessible
- [ ] AWS CLI installed and configured
- [ ] IAM user/role with appropriate permissions
- [ ] Billing alerts configured
- [ ] Service quotas reviewed

### Domain Setup
- [ ] collegeathletebase-dev.com domain registered
- [ ] collegeathletebase.com domain registered
- [ ] Domain registrar access confirmed

### Tools Installation
- [ ] Node.js 18+ installed
- [ ] AWS CDK installed globally (`npm install -g aws-cdk`)
- [ ] jq installed (for scripts)
- [ ] Git configured

## Initial Setup

### CDK Bootstrap
- [ ] CDK bootstrapped in target region
  ```bash
  cdk bootstrap aws://ACCOUNT-ID/us-east-1
  ```
- [ ] Bootstrap stack verified in CloudFormation

### Infrastructure Dependencies
- [ ] Navigate to infrastructure directory
- [ ] Run `npm install`
- [ ] Verify no dependency errors

## DNS Configuration

### Route53 Hosted Zones
- [ ] Run `./scripts/setup-dns.sh`
- [ ] Note development nameservers
- [ ] Note production nameservers
- [ ] Update domain registrar for collegeathletebase-dev.com
- [ ] Update domain registrar for collegeathletebase.com
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify with `dig NS collegeathletebase-dev.com`
- [ ] Verify with `dig NS collegeathletebase.com`

## SSL Certificates

### Request Certificates
- [ ] Run `./scripts/setup-certificates.sh`
- [ ] Note development certificate ARN
- [ ] Note production certificate ARN
- [ ] Note DNS validation records

### Validate Certificates
- [ ] Run `./scripts/validate-certificates.sh`
- [ ] Wait for certificate validation (5-30 minutes)
- [ ] Verify development certificate status: `ISSUED`
- [ ] Verify production certificate status: `ISSUED`

## Environment Configuration

### Create .env File
- [ ] Copy `.env.example` to `.env`
- [ ] Set `CDK_DEFAULT_ACCOUNT`
- [ ] Set `CDK_DEFAULT_REGION`
- [ ] Set `DEV_CERTIFICATE_ARN`
- [ ] Set `DEV_HOSTED_ZONE_ID`
- [ ] Set `PROD_CERTIFICATE_ARN`
- [ ] Set `PROD_HOSTED_ZONE_ID`
- [ ] Verify all values are correct

## Development Environment Deployment

### Pre-Deployment Checks
- [ ] Review infrastructure code
- [ ] Run `npm run diff:dev` to preview changes
- [ ] Review estimated costs
- [ ] Confirm deployment plan

### Deploy Development
- [ ] Run `npm run deploy:dev`
- [ ] Monitor deployment progress
- [ ] Note any errors or warnings
- [ ] Wait for completion (~15-20 minutes)

### Post-Deployment Verification
- [ ] Note LoadBalancerDNS output
- [ ] Note ServiceURL output
- [ ] Note DatabaseEndpoint output
- [ ] Note RedisEndpoint output
- [ ] Note DatabaseSecretArn output
- [ ] Test health endpoint: `curl https://collegeathletebase-dev.com/api/health`
- [ ] Verify DNS resolution
- [ ] Verify SSL certificate

### Development Environment Testing
- [ ] Access application via browser
- [ ] Check CloudWatch Logs
- [ ] Verify ECS service is running
- [ ] Check target group health
- [ ] Test database connectivity
- [ ] Test Redis connectivity

## Production Environment Deployment

### Pre-Deployment Checks
- [ ] Development environment fully tested
- [ ] Review production configuration
- [ ] Run `npm run diff:prod` to preview changes
- [ ] Review estimated costs
- [ ] Confirm deployment plan
- [ ] Schedule deployment window
- [ ] Notify team of deployment

### Deploy Production
- [ ] Run `npm run deploy:prod`
- [ ] Approve deployment when prompted
- [ ] Monitor deployment progress
- [ ] Note any errors or warnings
- [ ] Wait for completion (~20-25 minutes)

### Post-Deployment Verification
- [ ] Note all stack outputs
- [ ] Test health endpoint: `curl https://collegeathletebase.com/api/health`
- [ ] Verify DNS resolution
- [ ] Verify SSL certificate
- [ ] Check Multi-AZ configuration
- [ ] Verify deletion protection enabled

### Production Environment Testing
- [ ] Access application via browser
- [ ] Check CloudWatch Logs
- [ ] Verify ECS service is running (2+ tasks)
- [ ] Check target group health
- [ ] Test database connectivity
- [ ] Test Redis connectivity
- [ ] Verify auto-scaling configuration
- [ ] Test load balancer failover

## GitHub Integration

### Repository Secrets
- [ ] Add `AWS_ACCESS_KEY_ID` to GitHub secrets
- [ ] Add `AWS_SECRET_ACCESS_KEY` to GitHub secrets
- [ ] Add `AWS_REGION` to GitHub secrets
- [ ] Add development environment secrets
- [ ] Add production environment secrets

### Workflow Configuration
- [ ] Update deploy-dev.yml with correct values
- [ ] Update deploy-prod.yml with correct values
- [ ] Test development deployment workflow
- [ ] Test production deployment workflow

## Monitoring Setup

### CloudWatch
- [ ] Create custom dashboard for development
- [ ] Create custom dashboard for production
- [ ] Set up CPU utilization alarms
- [ ] Set up memory utilization alarms
- [ ] Set up error rate alarms
- [ ] Set up database connection alarms
- [ ] Configure SNS topics for notifications

### Logging
- [ ] Verify application logs in CloudWatch
- [ ] Verify database logs in CloudWatch
- [ ] Set up log retention policies
- [ ] Configure log insights queries

## Security Configuration

### Secrets Management
- [ ] Verify database credentials in Secrets Manager
- [ ] Configure secret rotation (optional)
- [ ] Review IAM roles and policies
- [ ] Audit security group rules

### Network Security
- [ ] Review VPC configuration
- [ ] Verify security group rules
- [ ] Check NACL rules
- [ ] Confirm no public database access

## Backup and Recovery

### Database Backups
- [ ] Verify automated backup configuration
- [ ] Test manual snapshot creation
- [ ] Document backup retention policy
- [ ] Create disaster recovery plan

### Application Backups
- [ ] Document infrastructure as code in Git
- [ ] Tag stable releases
- [ ] Document rollback procedures

## Documentation

### Update Documentation
- [ ] Document all resource ARNs
- [ ] Document all endpoints
- [ ] Update team wiki/docs
- [ ] Create runbook for common operations
- [ ] Document troubleshooting procedures

### Team Training
- [ ] Share infrastructure documentation
- [ ] Train team on deployment process
- [ ] Share monitoring dashboard access
- [ ] Document on-call procedures

## Cost Management

### Cost Monitoring
- [ ] Set up AWS Cost Explorer
- [ ] Create cost allocation tags
- [ ] Set up budget alerts
- [ ] Review cost optimization opportunities

### Resource Tagging
- [ ] Verify all resources are tagged
- [ ] Confirm Environment tags
- [ ] Confirm Project tags
- [ ] Confirm ManagedBy tags

## Final Verification

### Development Environment
- [ ] Application accessible and functional
- [ ] All services healthy
- [ ] Monitoring working
- [ ] Logs flowing correctly
- [ ] Auto-scaling tested
- [ ] Backups configured

### Production Environment
- [ ] Application accessible and functional
- [ ] All services healthy
- [ ] Multi-AZ verified
- [ ] Monitoring working
- [ ] Logs flowing correctly
- [ ] Auto-scaling tested
- [ ] Backups configured
- [ ] Deletion protection enabled

## Post-Deployment

### Communication
- [ ] Notify team of successful deployment
- [ ] Share access credentials (securely)
- [ ] Share monitoring dashboard links
- [ ] Schedule post-deployment review

### Ongoing Maintenance
- [ ] Schedule regular cost reviews
- [ ] Schedule security audits
- [ ] Plan capacity reviews
- [ ] Document lessons learned

## Rollback Plan

### If Deployment Fails
- [ ] Document error messages
- [ ] Check CloudFormation events
- [ ] Review CloudWatch Logs
- [ ] Run `cdk destroy` if needed
- [ ] Fix issues and retry

### Emergency Procedures
- [ ] Document emergency contacts
- [ ] Document rollback procedures
- [ ] Test rollback process
- [ ] Create incident response plan

---

## Notes

Use this section to track deployment-specific information:

**Deployment Date**: _______________

**Deployed By**: _______________

**Development URL**: _______________

**Production URL**: _______________

**Issues Encountered**: 
- 
- 

**Resolutions**:
- 
- 

**Next Steps**:
- 
- 
