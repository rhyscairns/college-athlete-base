# Dev Environment Deployment Guide

This guide will get your development environment live on AWS. Follow every step in order. Don't skip anything.

When you see something like `<your-value-here>`, replace the whole thing including the `< >` brackets with your actual value.

---

## What you need before you start

- A Mac or Linux computer (these commands are written for Terminal)
- An AWS account — [create one here](https://aws.amazon.com) if you don't have one
- The domain `collegeathletebase-dev.com` registered somewhere (GoDaddy, Namecheap, Google Domains, etc.)
- A Stripe account — [create one here](https://stripe.com) if you don't have one
- This codebase on your computer

---

## Part 1 — Install the tools you need

Open your Terminal app and run each of these commands one at a time. Wait for each one to finish before running the next.

### Install Homebrew (if you don't have it)

Homebrew is a tool that makes installing other tools easy on Mac.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Install Node.js

```bash
brew install node
```

Verify it worked:

```bash
node --version
```

You should see something like `v20.x.x`. Anything 20 or higher is fine.

### Install the AWS CLI

This is the tool that lets you control AWS from your Terminal.

```bash
brew install awscli
```

Verify it worked:

```bash
aws --version
```

### Install the AWS CDK

CDK is the tool that creates all your AWS infrastructure from code.

```bash
npm install -g aws-cdk
```

Verify it worked:

```bash
cdk --version
```

### Install jq

A small tool for reading JSON output from AWS commands.

```bash
brew install jq
```

---

## Part 2 — Connect your Terminal to AWS

You need to give your Terminal permission to create things in your AWS account.

### Step 2a — Create an AWS access key

1. Go to [https://console.aws.amazon.com](https://console.aws.amazon.com) and sign in
2. Click your account name in the top-right corner
3. Click **Security credentials**
4. Scroll down to **Access keys** and click **Create access key**
5. Choose **Command Line Interface (CLI)**
6. Check the confirmation box and click **Next**, then **Create access key**
7. You'll see an **Access key ID** and a **Secret access key** — copy both somewhere safe. You won't be able to see the secret key again after closing this page.

### Step 2b — Configure the AWS CLI

Run this command and paste in your keys when prompted:

```bash
aws configure
```

It will ask four questions:

- `AWS Access Key ID` → paste your access key ID
- `AWS Secret Access Key` → paste your secret access key
- `Default region name` → type `us-east-1`
- `Default output format` → type `json`

### Step 2c — Verify it works

```bash
aws sts get-caller-identity
```

You should see your account ID and username printed out. If you get an error, double-check your keys.

---

## Part 3 — Set up DNS for your domain

AWS needs to control the DNS for your domain so it can route traffic to your app.

### Step 3a — Create a hosted zone in Route53

Route53 is AWS's DNS service. Run this command:

```bash
aws route53 create-hosted-zone \
  --name collegeathletebase-dev.com \
  --caller-reference $(date +%s)
```

In the output, find two things and write them down:

1. The **hosted zone ID** — it looks like `/hostedzone/Z1234567890ABC`. You only need the part after the last slash: `Z1234567890ABC`
2. The **nameservers** — there will be four of them, they look like `ns-123.awsdns-45.com`

### Step 3b — Point your domain to Route53

Log into wherever you bought `collegeathletebase-dev.com` (GoDaddy, Namecheap, etc.) and find the nameserver settings for that domain. Replace whatever nameservers are there with the four Route53 nameservers from the step above.

Every registrar's interface is slightly different but you're looking for something called "Nameservers" or "DNS" in your domain settings.

> This change can take anywhere from a few minutes to 48 hours to fully take effect. Usually it's under an hour.

---

## Part 4 — Get an SSL certificate

This gives your site the padlock / `https://` in the browser.

### Step 4a — Request the certificate

```bash
aws acm request-certificate \
  --domain-name collegeathletebase-dev.com \
  --subject-alternative-names "*.collegeathletebase-dev.com" \
  --validation-method DNS \
  --region us-east-1
```

The output will contain a `CertificateArn` that looks like:
`arn:aws:acm:us-east-1:123456789012:certificate/abc-123-...`

Write that down.

### Step 4b — Get the DNS validation record

AWS needs to verify you own the domain. Run this, replacing the ARN with yours:

```bash
aws acm describe-certificate \
  --certificate-arn <your-certificate-arn> \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord'
```

You'll get output like this:

```json
{
    "Name": "_abc123.collegeathletebase-dev.com.",
    "Type": "CNAME",
    "Value": "_xyz789.acm-validations.aws."
}
```

### Step 4c — Add the validation record to Route53

Run this command, replacing the three placeholder values with what you got above, and replacing `ZONE_ID` with your hosted zone ID from Part 3:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id <your-hosted-zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "<Name from above>",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "<Value from above>"}]
      }
    }]
  }'
```

### Step 4d — Wait for the certificate to be validated

```bash
aws acm wait certificate-validated \
  --certificate-arn <your-certificate-arn> \
  --region us-east-1
```

This command will just sit there until the certificate is ready, then return. It usually takes 5-10 minutes.

---

## Part 5 — Configure the project

### Step 5a — Install project dependencies

```bash
cd infrastructure
npm install
```

### Step 5b — Create your config file

```bash
cp .env.example .env
```

Now open the `.env` file in a text editor and fill it in:

```
CDK_DEFAULT_ACCOUNT=<your 12-digit AWS account ID>
CDK_DEFAULT_REGION=us-east-1
DEV_CERTIFICATE_ARN=<the certificate ARN from Part 4>
DEV_HOSTED_ZONE_ID=<the hosted zone ID from Part 3, without the /hostedzone/ prefix>
```

To find your AWS account ID:

```bash
aws sts get-caller-identity --query Account --output text
```

### Step 5c — Bootstrap CDK

This is a one-time setup that prepares your AWS account to receive CDK deployments. Run it from inside the `infrastructure` folder:

```bash
cdk bootstrap
```

---

## Part 6 — Deploy the infrastructure

This is the big step. It creates everything in AWS — the servers, database, cache, Lambdas, and all the networking. It takes about 15-20 minutes.

First, preview what it's going to create (optional but recommended):

```bash
npm run diff:dev
```

Then deploy:

```bash
npm run deploy:dev
```

You'll see a lot of output scrolling by. That's normal. When it finishes you'll see a section called **Outputs** with a list of values. Copy the entire outputs section and save it somewhere — you'll need several of these values in the next steps.

The outputs will include things like:
- `AuthLambdaUrl` — the URL for your auth Lambda
- `PaymentWebhookUrl` — the URL Stripe will send payment events to
- `LoadBalancerDNS` — the address of your load balancer

---

## Part 7 — Add your Stripe keys

The deployment created a placeholder in AWS for your Stripe keys, but you need to fill it in.

### Step 7a — Get your Stripe test keys

1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **Test mode** (there's a toggle in the top-right of the Stripe dashboard)
3. You need:
   - **Publishable key** — starts with `pk_test_`
   - **Secret key** — starts with `sk_test_` (click "Reveal" to see it)

### Step 7b — Get your Stripe Price IDs

1. In Stripe, go to **Product catalog**
2. Find your monthly subscription product and click it
3. Copy the **Price ID** — it starts with `price_`
4. Do the same for your annual subscription product

### Step 7c — Save the keys to AWS

Run this command, filling in all your real values:

```bash
aws secretsmanager put-secret-value \
  --secret-id "development/college-athlete-base/stripe-keys" \
  --secret-string '{
    "publishable_key": "pk_test_...",
    "secret_key": "sk_test_...",
    "webhook_secret": "placeholder_update_in_step_8",
    "monthly_price_id": "price_...",
    "annual_price_id": "price_..."
  }'
```

---

## Part 8 — Register the Stripe webhook

Stripe needs to know where to send payment events. You'll give it the `PaymentWebhookUrl` from your deployment outputs.

1. Go to [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. In the **Endpoint URL** field, paste your `PaymentWebhookUrl` from the deployment outputs
4. Under **Select events**, add these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. On the next screen, click **Reveal** next to **Signing secret** and copy the value — it starts with `whsec_`

### Update the webhook secret in AWS

Now go back and update the secret you saved in Step 7c with the real webhook secret:

```bash
aws secretsmanager put-secret-value \
  --secret-id "development/college-athlete-base/stripe-keys" \
  --secret-string '{
    "publishable_key": "pk_test_...",
    "secret_key": "sk_test_...",
    "webhook_secret": "whsec_<your-real-signing-secret>",
    "monthly_price_id": "price_...",
    "annual_price_id": "price_..."
  }'
```

---

## Part 9 — Deploy the Lambdas for the first time

The infrastructure deployment created the Lambda functions but they need your actual code uploaded to them. Run these commands from the root of the project (not the `infrastructure` folder).

### Auth Lambda

```bash
cd infrastructure/lambdas/auth
npm install
npm run build
cd dist
zip -r ../auth-lambda.zip .
cd ..
aws lambda update-function-code \
  --function-name "development-college-athlete-base-auth" \
  --zip-file fileb://auth-lambda.zip \
  --publish
aws lambda wait function-updated \
  --function-name "development-college-athlete-base-auth"
echo "✅ Auth Lambda deployed"
```

### Payment Lambda

```bash
cd ../payment
npm install
npm run build
cd dist
zip -r ../payment-lambda.zip .
cd ..
aws lambda update-function-code \
  --function-name "development-college-athlete-base-payment" \
  --zip-file fileb://payment-lambda.zip \
  --publish
aws lambda wait function-updated \
  --function-name "development-college-athlete-base-payment"
echo "✅ Payment Lambda deployed"
```

---

## Part 10 — Connect GitHub Actions

GitHub Actions is what automatically deploys your code every time you push to `main`. You need to give it your AWS credentials and tell it which ECS resources to update.

### Step 10a — Find your ECS resource names

Run these commands to get the exact names of your ECS cluster, service, and task family:

```bash
# Get cluster name
aws ecs list-clusters --query 'clusterArns[]' --output text

# Get service name (replace the cluster name if different)
aws ecs list-services \
  --cluster development-college-athlete-base \
  --query 'serviceArns[]' --output text

# Get task definition family name
aws ecs list-task-definition-families \
  --family-prefix development \
  --query 'families[]' --output text
```

Write down the short names (the part after the last `/`).

### Step 10b — Add secrets to GitHub

1. Go to your GitHub repository in a browser
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each of the following:

| Secret name | What to put in it |
|---|---|
| `DEV_AWS_ACCESS_KEY_ID` | Your AWS access key ID from Part 2 |
| `DEV_AWS_SECRET_ACCESS_KEY` | Your AWS secret access key from Part 2 |
| `DEV_AWS_REGION` | `us-east-1` |
| `DEV_ECS_CLUSTER` | The cluster name from the command above |
| `DEV_ECS_SERVICE` | The service name from the command above |
| `DEV_ECS_TASK_FAMILY` | The task family name from the command above |

---

## Part 11 — Verify everything is working

### Check the app is up

```bash
curl https://collegeathletebase-dev.com/api/health
```

You should get a `200` response. If you get a connection error, DNS may still be propagating — wait a few minutes and try again.

### Check the auth Lambda

```bash
curl -X POST <your-AuthLambdaUrl>/auth/login/player \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'
```

You should get back a `401` error response (not a timeout or 502). A 401 means the Lambda is running and connected to the database correctly — it just rejected the wrong password, which is expected.

### Check the payment webhook

In the Stripe dashboard, go to your webhook endpoint and click **Send test webhook**. Select any event type and send it. You should see a `200` response in the delivery attempts.

### Trigger a full CI/CD deployment

Push any small change to your `main` branch (even just a comment in a file). Then go to your GitHub repo → **Actions** tab and watch the `Deploy to Development` workflow run. It should go green end-to-end.

---

## Troubleshooting

**"The app isn't loading / I get a connection error"**
DNS is probably still propagating. Wait up to an hour and try again. You can check if DNS has propagated by running `dig collegeathletebase-dev.com` — if it returns an IP address, DNS is working.

**"ECS tasks keep restarting / the app crashes on startup"**
Go to AWS Console → ECS → your cluster → your service → Logs tab. The error message there will tell you what's wrong. Usually it's a missing environment variable or the database isn't reachable yet.

**"The auth Lambda returns a 502 error"**
Go to AWS Console → Lambda → `development-college-athlete-base-auth` → Monitor → View logs in CloudWatch. The error there will explain what went wrong. Most common cause: the Lambda can't connect to the database.

**"Stripe webhook returns a 400 error"**
The webhook signing secret in Secrets Manager doesn't match the one in the Stripe dashboard. Go back to Step 8 and re-copy the `whsec_` value, then re-run the `put-secret-value` command.

**"The GitHub Actions deployment fails on the 'Fetch secrets' step"**
The AWS user you added to GitHub doesn't have permission to read from Secrets Manager. Go to AWS Console → IAM → Users → your user → Add permissions → attach the `SecretsManagerReadWrite` policy (or a more scoped version if you prefer).

**"cdk deploy fails with 'not bootstrapped'"**
Run `cdk bootstrap` again from inside the `infrastructure` folder and make sure your `.env` file has the correct `CDK_DEFAULT_ACCOUNT` value.

---

## Quick reference — values to keep handy

Fill this in as you go through the guide:

```
AWS Account ID:          ___________________________
Hosted Zone ID:          ___________________________
Certificate ARN:         ___________________________
AuthLambdaUrl:           ___________________________
PaymentWebhookUrl:       ___________________________
LoadBalancerDNS:         ___________________________
ECS Cluster name:        ___________________________
ECS Service name:        ___________________________
ECS Task Family name:    ___________________________
```
