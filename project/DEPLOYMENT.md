# Deployment Guide for SafarSaga

## 🚀 Deploy to Vercel (Recommended)

### Method 1: GitHub Integration (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/safarsaga-travel.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and deploy

3. **Configure Domain (Optional)**
   - In Vercel dashboard, go to your project
   - Go to Settings > Domains
   - Add your custom domain

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Link to existing project or create new
   - Choose settings (defaults are fine)

## 🔧 Environment Variables

If you need environment variables:

1. Create `.env.local` (for local development)
2. In Vercel dashboard: Settings > Environment Variables
3. Add your variables there

## 📊 Performance Optimization

Your project is already optimized with:
- ✅ Next.js 13 App Router
- ✅ Image optimization enabled
- ✅ CSS optimization
- ✅ Proper metadata for SEO
- ✅ Responsive design

## 🌐 Custom Domain Setup

1. **Buy a domain** (Namecheap, GoDaddy, etc.)
2. **In Vercel Dashboard:**
   - Go to your project
   - Settings > Domains
   - Add your domain
3. **Update DNS records** as instructed by Vercel

## 📈 Analytics (Optional)

Add Google Analytics:
1. Get GA4 tracking ID
2. Add to environment variables: `NEXT_PUBLIC_GA_ID`
3. Update layout.tsx to include GA script

## 🔍 SEO Checklist

- ✅ Meta tags configured
- ✅ Open Graph tags
- ✅ Twitter cards
- ✅ Robots.txt friendly
- ✅ Sitemap ready
- ✅ Fast loading times

## 🚨 Troubleshooting

**Build fails?**
- Check Node.js version (18+)
- Run `npm install` to update dependencies
- Check for TypeScript errors: `npm run lint`

**Images not loading?**
- Ensure images are in `/public` folder
- Check image paths start with `/`

**Slow loading?**
- Images are optimized automatically
- Use Next.js Image component when possible