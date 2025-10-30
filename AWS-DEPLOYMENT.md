# 🚀 AWS Deployment Guide for MailMind

## Overview

This guide covers deploying MailMind backend to AWS using different services:

1. **AWS Elastic Beanstalk** (Easiest - Recommended for beginners)
2. **AWS EC2** (Most flexible)
3. **AWS ECS (Docker)** (Containerized)
4. **AWS Lambda + API Gateway** (Serverless)

---

## Option 1: AWS Elastic Beanstalk (Recommended)

### Why Elastic Beanstalk?
- ✅ Easiest AWS deployment
- ✅ Auto-scaling
- ✅ Load balancing
- ✅ Health monitoring
- ✅ Automatic updates
- ✅ Free tier eligible (750 hours/month)

### Prerequisites

1. **AWS Account** - Create at https://aws.amazon.com
2. **AWS CLI** - Install AWS Command Line Interface
3. **EB CLI** - Elastic Beanstalk CLI

### Step 1: Install AWS CLI

**Windows (PowerShell):**
```powershell
# Download AWS CLI installer
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify installation
aws --version
```

**Or use:**
```powershell
winget install Amazon.AWSCLI
```

### Step 2: Configure AWS Credentials

```powershell
aws configure
```

**Enter:**
- AWS Access Key ID: (from AWS Console → IAM → Users → Security credentials)
- AWS Secret Access Key: (from same place)
- Default region: `us-east-1` (or your preferred region)
- Default output format: `json`

### Step 3: Install EB CLI

```powershell
pip install awsebcli --upgrade --user
```

**Verify:**
```powershell
eb --version
```

### Step 4: Prepare Your Application

**Create `.ebignore` file:**
```bash
# In project root
cd d:\Projects\Startup\MailMind
```

Create `.ebignore`:
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
```

**Create `.platform` folder for Node.js configuration:**
```powershell
mkdir -p .platform/nginx/conf.d
```

Create `.platform/nginx/conf.d/proxy.conf`:
```nginx
client_max_body_size 20M;
```

### Step 5: Initialize Elastic Beanstalk

```powershell
cd d:\Projects\Startup\MailMind\backend

# Initialize EB
eb init
```

**Follow prompts:**
1. Select region: `us-east-1` (or your preferred)
2. Application name: `mailmind-backend`
3. Platform: `Node.js`
4. Platform version: `Node.js 20`
5. Set up SSH: `Yes` (for debugging)

### Step 6: Create Environment

```powershell
# Create production environment
eb create mailmind-production

# Or create with specific instance type
eb create mailmind-production --instance-type t3.micro
```

**This will:**
- Create an EC2 instance
- Set up load balancer
- Configure auto-scaling
- Deploy your app
- Assign a URL

### Step 7: Set Environment Variables

```powershell
# Set environment variables
eb setenv MONGODB_URI="" \
  GOOGLE_CLIENT_ID="" \
  GOOGLE_CLIENT_SECRET="" \
  GEMINI_API_KEY="" \
  NODE_ENV="production" \
  PORT="8080"
```

**Or set in AWS Console:**
1. Go to Elastic Beanstalk console
2. Select your environment
3. Configuration → Software
4. Add environment properties

### Step 8: Update Google OAuth Redirect URI

**Important:** Update your Google Console redirect URI:
```
https://mailmind-production.us-east-1.elasticbeanstalk.com/api/gmail/callback
```

Then update the environment variable:
```powershell
eb setenv GOOGLE_REDIRECT_URI="https://mailmind-production.us-east-1.elasticbeanstalk.com/api/gmail/callback"
```

### Step 9: Deploy

```powershell
# Deploy current code
eb deploy

# Check status
eb status

# Open in browser
eb open

# View logs
eb logs
```

### Step 10: Configure Health Checks

1. Go to AWS Console → Elastic Beanstalk
2. Select your environment
3. Configuration → Load balancer
4. Edit health check settings:
   - Path: `/health`
   - Timeout: 5 seconds
   - Interval: 30 seconds
   - Unhealthy threshold: 2
   - Healthy threshold: 5

### Step 11: Enable HTTPS

**Option A: Use AWS Certificate Manager (Free)**

1. Go to AWS Console → Certificate Manager
2. Request certificate
3. Domain: `yourdomain.com`
4. Validate (DNS or Email)
5. Go to Elastic Beanstalk → Configuration → Load balancer
6. Add listener:
   - Port: 443
   - Protocol: HTTPS
   - Certificate: Select your certificate

**Option B: Use Elastic Beanstalk's default HTTPS**

Elastic Beanstalk provides HTTPS on their domain automatically.

### Step 12: Set Up Auto-Scaling

1. Go to Configuration → Capacity
2. Environment type: `Load balanced`
3. Instances:
   - Min: 1
   - Max: 4
4. Scaling triggers:
   - Metric: `CPUUtilization`
   - Upper threshold: 70%
   - Lower threshold: 20%

### Useful EB Commands

```powershell
# Deploy
eb deploy

# View status
eb status

# Open app in browser
eb open

# View logs
eb logs

# SSH into instance
eb ssh

# View health
eb health

# Restart app
eb restart

# Terminate environment
eb terminate mailmind-production
```

---

## Option 2: AWS EC2 (Manual Setup)

### Why EC2?
- ✅ Full control
- ✅ Flexible configuration
- ✅ Can install anything
- ✅ Free tier: t2.micro (750 hours/month)

### Step 1: Launch EC2 Instance

1. **Go to EC2 Dashboard**
2. **Click "Launch Instance"**
3. **Configure:**
   - Name: `mailmind-backend`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: `t2.micro` (free tier) or `t3.micro`
   - Key pair: Create new or use existing
   - Security group:
     - SSH (22) - Your IP only
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (5000) - Anywhere (for Node.js)
   - Storage: 8 GB (default)

4. **Launch instance**

### Step 2: Connect to Instance

```powershell
# Download your .pem key file
# Set permissions (skip on Windows)

# Connect via SSH
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

**Or use EC2 Instance Connect (browser-based SSH)**

### Step 3: Install Node.js

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 4: Install Git and Clone Repo

```bash
# Install Git
sudo apt install git -y

# Clone your repository
git clone https://github.com/el-noir/Mailmind.git
cd Mailmind/backend
```

### Step 5: Set Up Environment Variables

```bash
# Create .env file
nano .env
```

**Paste:**
```env
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://YOUR-EC2-IP:5000/api/gmail/callback
GEMINI_API_KEY=
NODE_ENV=production
PORT=5000
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Install Dependencies and Build

```bash
# Install dependencies
npm ci

# Build TypeScript
npm run build
```

### Step 7: Start with PM2

```bash
# Start app with PM2
pm2 start npm --name "mailmind" -- start

# Save PM2 process list
pm2 save

# Set PM2 to start on boot
pm2 startup
# Run the command it outputs

# Check status
pm2 status
pm2 logs mailmind
```

### Step 8: Set Up Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/mailmind
```

**Paste:**
```nginx
server {
    listen 80;
    server_name YOUR-EC2-IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/mailmind /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 9: Set Up SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (need a domain name)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

### Step 10: Set Up Firewall

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Useful PM2 Commands

```bash
# View logs
pm2 logs mailmind

# Restart app
pm2 restart mailmind

# Stop app
pm2 stop mailmind

# Monitor
pm2 monit

# Update code
cd ~/Mailmind/backend
git pull
npm ci
npm run build
pm2 restart mailmind
```

---

## Option 3: AWS ECS (Docker Container)

### Why ECS?
- ✅ Container orchestration
- ✅ Auto-scaling
- ✅ Integration with AWS services
- ✅ Production-grade

### Prerequisites

1. Docker installed locally
2. AWS CLI configured
3. ECR (Elastic Container Registry) access

### Step 1: Build Docker Image

```powershell
# From project root
cd d:\Projects\Startup\MailMind

# Build
docker build -t mailmind-backend .

# Test locally
docker run -p 5000:5000 --env-file backend/.env mailmind-backend
```

### Step 2: Create ECR Repository

```powershell
# Create repository
aws ecr create-repository --repository-name mailmind-backend --region us-east-1

# Get login credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com
```

### Step 3: Tag and Push Image

```powershell
# Tag image
docker tag mailmind-backend:latest YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/mailmind-backend:latest

# Push to ECR
docker push YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/mailmind-backend:latest
```

### Step 4: Create ECS Cluster

1. Go to AWS Console → ECS
2. Create cluster:
   - Name: `mailmind-cluster`
   - Infrastructure: Fargate (serverless)

### Step 5: Create Task Definition

1. Create new task definition
2. Configure:
   - Name: `mailmind-task`
   - Launch type: Fargate
   - CPU: 0.25 vCPU
   - Memory: 0.5 GB
   - Container:
     - Name: `mailmind`
     - Image: `YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/mailmind-backend:latest`
     - Port mappings: 5000
     - Environment variables: Add all from .env

### Step 6: Create Service

1. Create service
2. Configure:
   - Cluster: `mailmind-cluster`
   - Task definition: `mailmind-task`
   - Service name: `mailmind-service`
   - Desired tasks: 1
   - Load balancing: Application Load Balancer
   - Health check: `/health`

### Step 7: Configure Load Balancer

1. Create Application Load Balancer
2. Configure:
   - Listeners: HTTP:80, HTTPS:443
   - Target group: ECS tasks
   - Health check: `/health`

---

## Option 4: AWS Lambda (Serverless)

### Why Lambda?
- ✅ Pay per request
- ✅ No server management
- ✅ Auto-scaling
- ✅ Free tier: 1M requests/month

### Note on Lambda

Lambda is great for APIs but has limitations:
- 15-minute timeout
- Stateless (no persistent connections)
- Cold starts

**For MailMind:** Lambda works for API endpoints, but daily cron jobs need EventBridge.

### Quick Setup with Serverless Framework

```powershell
# Install Serverless
npm install -g serverless

# Create serverless.yml in backend/
```

**serverless.yml:**
```yaml
service: mailmind-backend

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    MONGODB_URI: ${env:MONGODB_URI}
    GOOGLE_CLIENT_ID: ${env:GOOGLE_CLIENT_ID}
    GOOGLE_CLIENT_SECRET: ${env:GOOGLE_CLIENT_SECRET}
    GEMINI_API_KEY: ${env:GEMINI_API_KEY}

functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-offline
```

**Deploy:**
```powershell
serverless deploy
```

---

## Cost Comparison

### Elastic Beanstalk (t3.micro)
- **Cost:** ~$10-15/month
- **Free Tier:** 750 hours/month (first year)
- **Includes:** EC2, Load Balancer, Auto-scaling

### EC2 (t2.micro)
- **Cost:** ~$8/month (on-demand)
- **Free Tier:** 750 hours/month (first year)
- **Add-ons:** $3-5/month for Elastic IP, storage

### ECS Fargate
- **Cost:** ~$15-20/month (0.25 vCPU, 0.5 GB)
- **No Free Tier** for Fargate
- **Includes:** Container orchestration

### Lambda
- **Cost:** ~$0-5/month (low traffic)
- **Free Tier:** 1M requests, 400K GB-seconds/month
- **Best for:** Low traffic apps

---

## Recommended Setup

**For Production:**

1. **Elastic Beanstalk** - Easiest, all-in-one
2. **EC2 + Nginx + PM2** - More control
3. **ECS Fargate** - If using Docker already

**For Development/Testing:**

1. **Railway/Render** - Fastest setup
2. **EC2 t2.micro** - Free tier

---

## Monitoring on AWS

### CloudWatch

**Automatic metrics:**
- CPU utilization
- Network traffic
- Disk I/O
- Request count

**Set up alarms:**
```powershell
aws cloudwatch put-metric-alarm \
  --alarm-name mailmind-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Custom Logs

**Install CloudWatch agent:**
```bash
# On EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

---

## Domain Setup

### Route 53 (AWS DNS)

1. **Register/Transfer domain** to Route 53
2. **Create hosted zone**
3. **Add A record:**
   - Name: `api.yourdomain.com`
   - Type: A
   - Value: Your EC2/ELB IP

### Point to Elastic Beanstalk

1. Go to Route 53 → Hosted zones
2. Create record:
   - Type: CNAME
   - Name: `api`
   - Value: `mailmind-production.us-east-1.elasticbeanstalk.com`

---

## Backup Strategy

### MongoDB Atlas

Already backed up automatically (daily snapshots).

### Application Backups

**Create AMI (Amazon Machine Image):**
```powershell
aws ec2 create-image \
  --instance-id i-1234567890abcdef0 \
  --name "mailmind-backup-$(date +%Y%m%d)"
```

---

## Deployment Checklist

- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] EB CLI installed (for Elastic Beanstalk)
- [ ] Application deployed
- [ ] Environment variables set
- [ ] Health check configured (/health)
- [ ] HTTPS enabled
- [ ] Domain configured (optional)
- [ ] Auto-scaling configured
- [ ] CloudWatch alarms set
- [ ] Backup strategy in place
- [ ] Google OAuth redirect URI updated
- [ ] CORS configured for frontend domain
- [ ] Security groups configured
- [ ] IAM roles configured

---

## Troubleshooting

### App won't start

**Check logs:**
```powershell
# Elastic Beanstalk
eb logs

# EC2 with PM2
pm2 logs mailmind
```

**Common issues:**
- Missing environment variables
- Wrong Node.js version
- Port conflicts

### Health check failing

1. Test locally: `curl http://localhost:5000/health`
2. Check security groups allow traffic
3. Verify health check path is correct

### High CPU usage

1. Check CloudWatch metrics
2. Scale up instance type
3. Enable auto-scaling

---

## Next Steps

After deployment:

1. ✅ **Test all endpoints**
2. ✅ **Set up monitoring** (CloudWatch)
3. ✅ **Configure auto-scaling**
4. ✅ **Enable HTTPS**
5. ✅ **Set up backups**
6. ✅ **Update frontend** with API URL

---

## 🎉 You're Live on AWS!

Your MailMind backend is now deployed with enterprise-grade infrastructure!

**Need help?** Check AWS documentation or reach out to AWS support.
