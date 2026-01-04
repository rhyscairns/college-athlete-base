# SonarCloud Setup Guide

This guide walks you through setting up SonarCloud integration for the College Athlete Base project.

## Prerequisites

- GitHub account with admin access to the repository
- SonarCloud account (sign up at https://sonarcloud.io)

## Step 1: Create SonarCloud Project

1. Go to https://sonarcloud.io and sign in with your GitHub account
2. Click the "+" icon in the top right and select "Analyze new project"
3. Select your GitHub organization and the `college-athlete-base` repository
4. Click "Set Up" to create the project

## Step 2: Generate Authentication Token

1. In SonarCloud, click on your profile icon in the top right
2. Go to "My Account" → "Security"
3. Under "Generate Tokens":
   - Name: `college-athlete-base-ci`
   - Type: Select "Project Analysis Token"
   - Expires in: Choose appropriate expiration (recommend 90 days or No expiration for CI/CD)
4. Click "Generate" and copy the token immediately (you won't be able to see it again)

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the following secrets:
   - Name: `SONAR_TOKEN`
   - Value: Paste the token you generated in Step 2
5. Click "Add secret"

## Step 4: Update sonar-project.properties

Update the `sonar-project.properties` file in the project root with your specific values:

```properties
sonar.projectKey=your-github-org_college-athlete-base
sonar.organization=your-sonarcloud-org-key
```

To find these values:
- **projectKey**: In SonarCloud, go to your project → "Information" tab
- **organization**: In SonarCloud, go to "My Organizations" and copy the key

## Step 5: Verify Configuration

The SonarCloud configuration includes:

### Quality Gates (as per requirements)
- ✅ Code Coverage: Minimum 80%
- ✅ Maintainability Rating: A
- ✅ Reliability Rating: A
- ✅ Security Rating: A
- ✅ Duplicated Lines: Less than 3%
- ✅ Zero tolerance for bugs, vulnerabilities, and security hotspots

### Exclusions
The following are excluded from analysis:
- Next.js build artifacts (`.next/`, `out/`, `build/`)
- Node modules
- Configuration files
- Type definition files
- Test files (for coverage calculation)
- Public assets

## Step 6: Test the Integration

Once you've completed the setup:

1. Create a test branch and make a small change
2. Push the branch and create a pull request
3. The CI pipeline will run SonarCloud analysis
4. Check the PR for the SonarCloud status check
5. Click on the SonarCloud check to view the detailed report

## Troubleshooting

### Authentication Failed
- Verify the `SONAR_TOKEN` secret is correctly set in GitHub
- Ensure the token hasn't expired
- Regenerate the token if necessary

### Project Not Found
- Double-check the `sonar.projectKey` and `sonar.organization` values
- Ensure the project exists in SonarCloud
- Verify you have access to the organization

### Quality Gate Failing
- Review the SonarCloud report for specific issues
- Check code coverage percentage
- Address any bugs, vulnerabilities, or code smells
- Ensure test coverage meets the 80% threshold

## Additional Resources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [SonarCloud GitHub Action](https://github.com/SonarSource/sonarcloud-github-action)
- [Quality Gates Documentation](https://docs.sonarcloud.io/improving/quality-gates/)
