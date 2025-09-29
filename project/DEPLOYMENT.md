# SafarSaga Vercel Deployment Guide

## 🚀 Automatic Deployment Setup

### Prerequisites
1. GitHub/GitLab/Bitbucket repository
2. Vercel account (free tier available)
3. Node.js project with Next.js

### Deployment Configuration

#### Output Directory
- **Framework**: Next.js
- **Output Directory**: `.next`
- **Build Command**: `npm run build`
- **Install Command**: `npm install`

### 🔄 Automatic Deployment Setup

#### Step 1: Connect Repository to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your Git provider
3. Click "New Project"
4. Import your SafarSaga repository
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or `./project` if your code is in a subfolder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### Step 2: Environment Variables (if needed)
Add any environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add variables like:
  - `NEXT_PUBLIC_API_URL`
  - `CONTACT_EMAIL`
  - etc.

#### Step 3: Automatic Deployments
Once connected, Vercel will automatically:
- ✅ Deploy on every push to main/master branch
- ✅ Create preview deployments for pull requests
- ✅ Run builds and tests automatically
- ✅ Provide instant rollbacks if needed

### 📁 Project Structure for Vercel
```
project/
├── app/                 # Next.js 13+ App Router
├── components/          # React components
├── public/             # Static assets
├── package.json        # Dependencies and scripts
├── next.config.js      # Next.js configuration
├── vercel.json         # Vercel deployment config
└── .vercelignore       # Files to ignore during deployment
```

### 🔧 Build Configuration

#### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

#### package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 🌐 Custom Domain Setup
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provided

### 📊 Deployment Status
- **Production URL**: Assigned automatically (e.g., `safarsaga-travel.vercel.app`)
- **Preview URLs**: Generated for each branch/PR
- **Build Logs**: Available in Vercel dashboard
- **Analytics**: Built-in performance monitoring

### 🔄 Deployment Workflow
1. **Push Code** → Automatic build triggers
2. **Build Process** → Vercel runs `npm install` and `npm run build`
3. **Deploy** → New version goes live instantly
4. **Rollback** → Previous versions available for instant rollback

### 🚨 Troubleshooting

#### Common Issues:
1. **Build Failures**: Check build logs in Vercel dashboard
2. **Environment Variables**: Ensure all required env vars are set
3. **Import Errors**: Check file paths and case sensitivity
4. **Memory Issues**: Upgrade to Pro plan if needed

#### Build Optimization:
- Use `next/image` for optimized images
- Implement proper code splitting
- Use dynamic imports for large components
- Enable compression in next.config.js

### 📈 Performance Monitoring
Vercel provides built-in analytics:
- Core Web Vitals
- Page load times
- Function execution times
- Error tracking

### 🔐 Security
- Automatic HTTPS/SSL
- DDoS protection
- Edge network delivery
- Secure environment variables

## 🎯 Quick Deployment Checklist
- [ ] Repository connected to Vercel
- [ ] Build command configured: `npm run build`
- [ ] Output directory set: `.next`
- [ ] Environment variables added (if any)
- [ ] Custom domain configured (optional)
- [ ] Automatic deployments enabled
- [ ] Preview deployments working for PRs

Your SafarSaga website will now automatically deploy every time you push code to your repository!