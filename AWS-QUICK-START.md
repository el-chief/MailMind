# 🚀 AWS Elastic Beanstalk - Quick Deploy Guide

## Your Fastest Path to AWS Deployment

Follow these steps exactly - you'll be live in ~30 minutes!

---

## Step 1: Install AWS Tools (5 minutes)

### Install AWS CLI

**PowerShell (Run as Administrator):**
```powershell
# Install AWS CLI
winget install Amazon.AWSCLI

# Verify
aws --version
```

### Install EB CLI

```powershell
# Install pip if not already installed
python -m ensurepip --upgrade

# Install EB CLI
pip install awsebcli --upgrade --user

# Verify
eb --version
```

**If `eb` command not found:**
```powershell
# Add to PATH
$env:Path += ";$env:USERPROFILE\AppData\Roaming\Python\Python311\Scripts"
```

---

## Step 2: Configure AWS (3 minutes)

### Create AWS Account
1. Go to https://aws.amazon.com
2. Sign up (free tier)
3. Verify email and payment method

### Get Access Keys
1. Go to AWS Console → **IAM**
2. Users → **Add user**
   - Name: `mailmind-deploy`
   - Access type: ✅ **Programmatic access**
3. Permissions → Attach policies:
   - ✅ `AdministratorAccess-AWSElasticBeanstalk`
   - ✅ `AmazonEC2FullAccess`
4. **Save Access Key ID and Secret Access Key**

### Configure CLI

```powershell
aws configure
```

**Enter:**
```
AWS Access Key ID: YOUR_ACCESS_KEY
AWS Secret Access Key: YOUR_SECRET_KEY
Default region: us-east-1
Default output format: json
```

---

## Step 3: Prepare Project (2 minutes)

### Create Required Files

**1. Create `.ebignore` in project root:**

```powershell
cd d:\Projects\Startup\MailMind
```

**`.ebignore` content:**
```
node_modules/
.git/
.env
.vscode/
*.log
dist/
coverage/
.github/
frontend/
docs/
*.md
!README.md
.DS_Store
```

**2. Update package.json scripts:**

Your `backend/package.json` should have:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "postinstall": "npm run build"
  }
}
```

**3. Create Procfile in backend/:**

```
web: npm start
```

---

## Step 4: Initialize Elastic Beanstalk (3 minutes)

```powershell
cd d:\Projects\Startup\MailMind\backend

# Initialize
eb init
```

**Follow prompts:**
```
Select a default region: 10 (us-east-1)
Application name: mailmind-backend
Platform: Node.js
Platform version: Node.js 20 (latest)
Set up SSH: y (yes)
Select keypair: Create new (or use existing)
```

---

## Step 5: Create Environment (5-10 minutes)

```powershell
# Create production environment
eb create mailmind-production --instance-type t3.micro
```

**This creates:**
- EC2 instance (t3.micro)
- Load balancer
- Security groups
- Auto-scaling group

**Wait for completion...** ☕

---

## Step 6: Set Environment Variables (2 minutes)

```powershell
# Set all environment variables at once
eb setenv `
  MONGODB_URI="" `
  GOOGLE_CLIENT_ID="" `
  GOOGLE_CLIENT_SECRET="" `
  GEMINI_API_KEY="" `
  NODE_ENV="production" `
  PORT="8080"
```

**Note:** EB uses port 8080 by default, not 5000.

**Get your URL:**
```powershell
eb status
```

**Copy the CNAME (your app URL):**
```
mailmind-production.us-east-1.elasticbeanstalk.com
```

---

## Step 7: Update Google OAuth (2 minutes)

### Update Redirect URI

1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Your OAuth Client
4. Authorized redirect URIs → Add:
   ```
   https://mailmind-production.us-east-1.elasticbeanstalk.com/api/gmail/callback
   ```
5. Save

### Update Environment Variable

```powershell
eb setenv GOOGLE_REDIRECT_URI=""
```

---

## Step 8: Configure Health Check (3 minutes)

### Via AWS Console:

1. Go to **Elastic Beanstalk Console**
2. Select `mailmind-production`
3. Configuration → **Load balancer**
4. Edit → Processes → **default**
5. Health check settings:
   - Path: `/health`
   - Timeout: 5 seconds
   - Interval: 30 seconds
   - Unhealthy threshold: 2
   - Healthy threshold: 5
6. **Apply**

---

## Step 9: Test Your Deployment (2 minutes)

```powershell
# Open in browser
eb open

# Test health endpoint
curl https://mailmind-production.us-east-1.elasticbeanstalk.com/health

# View logs
eb logs

# Check status
eb status
```

**Test API endpoints:**
```powershell
# Health check
curl https://mailmind-production.us-east-1.elasticbeanstalk.com/health/detailed

# Create user
curl -X POST https://mailmind-production.us-east-1.elasticbeanstalk.com/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@gmail.com","name":"Test User"}'
```

---

## Step 10: Set Up Auto-Deploy (Optional)

### GitHub Actions Integration

Your repo already has deployment workflow. Update `.github/workflows/deploy.yml`:

```yaml
- name: Deploy to Elastic Beanstalk
  run: |
    cd backend
    eb deploy mailmind-production
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

**Add GitHub Secrets:**
1. GitHub repo → Settings → Secrets → Actions
2. Add:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

---

## Common Commands

```powershell
# Deploy updates
eb deploy

# View logs
eb logs

# Restart app
eb restart

# SSH into instance
eb ssh

# Open in browser
eb open

# Check status
eb status

# View health
eb health

# Terminate environment (DELETE)
eb terminate mailmind-production
```

---

## Updating Your App

When you make code changes:

```powershell
# 1. Commit changes
git add .
git commit -m "Update feature"

# 2. Deploy to EB
cd backend
eb deploy

# 3. Wait 2-3 minutes
# 4. Test
eb open
```

---

## Costs Estimate

**t3.micro instance:**
- First year (free tier): **$0/month** ✅
- After free tier: **~$10-15/month**

**Breakdown:**
- EC2 t3.micro: $7.50/month
- Load Balancer: $5/month
- Data transfer: $1-2/month

**Free tier includes:**
- 750 hours/month EC2
- 750 hours/month Load Balancer
- 15 GB data transfer

---

## Troubleshooting

### Deployment fails

**Check logs:**
```powershell
eb logs
```

**Common issues:**
- Missing `start` script in package.json
- Port not set to 8080
- Build errors (check TypeScript)

**Fix:**
```powershell
# Update and redeploy
git add .
git commit -m "Fix deployment"
eb deploy
```

### Health check failing

**Check:**
1. App is listening on port 8080 (not 5000)
2. Health endpoint returns 200
3. Security groups allow traffic

**Update PORT:**
```powershell
eb setenv PORT="8080"
```

**Update your index.ts:**
```typescript
const PORT = process.env.PORT || 8080;
```

### Can't access app

**Check security groups:**
1. AWS Console → EC2 → Security Groups
2. Find `elasticbeanstalk-...`
3. Inbound rules should have:
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere

---

## Monitor Your App

### CloudWatch (Built-in)

1. Go to **CloudWatch Console**
2. Metrics → All metrics → **Elastic Beanstalk**
3. View:
   - CPU utilization
   - Network traffic
   - Request count
   - Response time

### Set up Alarms

```powershell
# Create high CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name mailmind-high-cpu \
  --alarm-description "CPU exceeds 80%" \
  --namespace AWS/ElasticBeanstalk \
  --metric-name CPUUtilization \
  --dimensions Name=EnvironmentName,Value=mailmind-production \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## Enable HTTPS

### Option 1: Use AWS Certificate Manager

1. **Request certificate:**
   - AWS Console → Certificate Manager
   - Request certificate
   - Domain: `api.yourdomain.com`
   - Validate (DNS or Email)

2. **Add to Load Balancer:**
   - Elastic Beanstalk → Configuration → Load balancer
   - Add listener:
     - Port: 443
     - Protocol: HTTPS
     - Certificate: Select from ACM

### Option 2: Use Default EB HTTPS

Elastic Beanstalk provides HTTPS on their domain:
```
https://mailmind-production.us-east-1.elasticbeanstalk.com
```

Already works! Just use `https://` instead of `http://`

---

## Scale Your App

### Auto-Scaling

1. Configuration → **Capacity**
2. Environment type: **Load balanced**
3. Set:
   - Min instances: 1
   - Max instances: 4
4. Scaling triggers:
   - Metric: CPU Utilization
   - Upper: 70%
   - Lower: 20%

### Manual Scaling

```powershell
# Scale to 2 instances
eb scale 2

# Scale back to 1
eb scale 1
```

---

## ✅ Quick Checklist

- [ ] AWS CLI installed
- [ ] EB CLI installed
- [ ] AWS configured (access keys)
- [ ] `.ebignore` created
- [ ] `eb init` completed
- [ ] `eb create` completed
- [ ] Environment variables set
- [ ] Google OAuth redirect updated
- [ ] Health check configured
- [ ] App tested and working
- [ ] Auto-deploy set up (optional)
- [ ] Monitoring enabled
- [ ] HTTPS enabled

---

## 🎉 You're Live on AWS!

Your MailMind backend is now running on AWS Elastic Beanstalk!

**Your API URL:**
```
https://mailmind-production.us-east-1.elasticbeanstalk.com
```

**Test it:**
```
https://mailmind-production.us-east-1.elasticbeanstalk.com/health/detailed
```

---

## Next Steps

1. ✅ **Point custom domain** (optional)
2. ✅ **Set up monitoring** alarms
3. ✅ **Configure auto-scaling**
4. ✅ **Build frontend** and connect to API
5. ✅ **Set up CI/CD** for auto-deploy

**Need help?** Check `AWS-DEPLOYMENT.md` for detailed guides!
