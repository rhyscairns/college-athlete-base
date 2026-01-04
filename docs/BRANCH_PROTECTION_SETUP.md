# Branch Protection Configuration Guide

This guide provides step-by-step instructions for configuring GitHub repository settings and branch protection rules to enforce CI/CD quality gates.

## Overview

Branch protection rules ensure that code quality standards are met before changes can be merged to the main branch. This configuration implements Requirements 4.1-4.5 from the CI/CD pipeline specification.

## Prerequisites

- Repository admin access
- CI/CD workflows already configured (.github/workflows/pr-check.yml, deploy-dev.yml, deploy-prod.yml)
- GitHub account with appropriate permissions

## Configuration Steps

### 1. Access Branch Protection Settings

1. Navigate to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Branches** under "Code and automation"
4. Click **Add branch protection rule** or edit existing rule for `main`

### 2. Configure Branch Name Pattern

- **Branch name pattern**: `main`

### 3. Enable Required Settings

Check the following options:

#### Require a pull request before merging
- ✅ **Require a pull request before merging**
  - ✅ **Require approvals**: Set to `1` (or higher based on team size)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ⬜ **Require review from Code Owners** (optional, if CODEOWNERS file exists)

#### Require status checks to pass before merging
- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - Add the following required status checks:
    - `build` (from pr-check.yml)
    - `test` (from pr-check.yml)
    - `lint` (from pr-check.yml)
    - `code-quality` (from pr-check.yml - SonarCloud)

#### Additional Protection Rules
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits** (recommended for security)
- ✅ **Require linear history** (optional, prevents merge commits)
- ✅ **Include administrators** (enforces rules on admins too)
  - Note: Admins can still bypass if needed, but it requires explicit action

#### Rules Applied to Everyone
- ✅ **Restrict who can push to matching branches**
  - Leave empty to block all direct pushes (recommended)
  - Or add specific users/teams who can push directly (not recommended)

- ✅ **Allow force pushes**: ⬜ Disabled (recommended)
- ✅ **Allow deletions**: ⬜ Disabled (recommended)

### 4. Save Changes

Click **Create** or **Save changes** at the bottom of the page.

## Verification

After configuration, verify the settings:

1. Create a test branch and make a small change
2. Open a pull request to `main`
3. Verify that:
   - You cannot merge without approval
   - Status checks are required and running
   - Direct push to main is blocked

## Status Checks Reference

The following status checks should appear in your pull requests:

| Status Check | Source Workflow | Purpose |
|-------------|----------------|---------|
| `build` | pr-check.yml | Builds Docker image and Next.js application |
| `test` | pr-check.yml | Runs unit and integration tests |
| `lint` | pr-check.yml | Runs ESLint and TypeScript type checking |
| `code-quality` | pr-check.yml | SonarCloud analysis and quality gates |

## Administrator Bypass

Administrators can bypass branch protection rules when necessary:

1. Navigate to the pull request
2. Click the **Merge** button dropdown
3. Select **Merge without waiting for requirements to be met**
4. Provide justification in the merge commit message

**Important**: Administrator bypass should only be used in exceptional circumstances (e.g., critical hotfixes, CI system outages).

## Troubleshooting

### Status checks not appearing
- Ensure workflows have run at least once on a pull request
- Check that workflow job names match the required status check names
- Verify workflows are enabled in repository settings

### Cannot merge even with passing checks
- Ensure branch is up to date with main
- Check that all conversations are resolved
- Verify you have the required number of approvals

### Need to update required status checks
- Go to Settings → Branches → Edit branch protection rule
- Scroll to "Require status checks to pass before merging"
- Add or remove status checks as needed

## GitHub CLI Alternative

You can also configure branch protection using the GitHub CLI:

```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh

# Authenticate
gh auth login

# Configure branch protection
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["build","test","lint","code-quality"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

Replace `{owner}` and `{repo}` with your GitHub username/organization and repository name.

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
