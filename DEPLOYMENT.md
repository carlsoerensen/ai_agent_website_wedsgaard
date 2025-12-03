# Deployment Guide

## Prerequisites

- Vercel account
- GitHub account (or GitLab/Bitbucket)
- n8n webhook URL

## Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: AI Agent Widget"
git remote add origin https://github.com/yourusername/ai-agent-widget.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

## Step 3: Configure Environment Variables

1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add the following variable:
   - **Name**: `N8N_WEBHOOK_URL`
   - **Value**: `https://handwork.app.n8n.cloud/webhook-test/wedsgaard_agent`
   - **Environment**: Production, Preview, Development (select all)

3. Click "Save"

## Step 4: Redeploy

After adding environment variables, trigger a new deployment:
- Go to "Deployments" tab
- Click the three dots on the latest deployment
- Select "Redeploy"

Or push a new commit to trigger automatic deployment.

## Step 5: Test Your Deployment

1. Visit your Vercel domain: `https://your-project.vercel.app`
2. You should see the widget in the bottom right corner
3. Test sending a message to verify n8n connection

## Step 6: Get Your Embedding Code

Once deployed, your embedding code will be:

```html
<script src="https://your-project.vercel.app/widget.js"></script>
```

Replace `your-project.vercel.app` with your actual Vercel domain.

## Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain (e.g., `widget.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. Update your embedding code with the new domain

## Environment-Specific Webhooks

You can set different webhook URLs for different environments:

- **Production**: Production webhook URL
- **Preview**: Testing webhook URL  
- **Development**: Local development webhook URL

This allows you to test with different n8n workflows without affecting production.

## Monitoring

- Check Vercel function logs in the "Functions" tab
- Monitor API route performance in "Analytics"
- Set up error tracking (consider adding Sentry or similar)

## Scaling Considerations

- Vercel automatically scales your functions
- Consider implementing rate limiting for production
- Monitor API usage and costs
- Set up alerts for high error rates

## Security Checklist

- ✅ Environment variables are set (not hardcoded)
- ✅ CORS headers are configured
- ✅ API routes validate input
- ✅ Webhook URLs are configurable per client
- ✅ No sensitive data in client-side code

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript compiles without errors

### API Routes Not Working

- Verify environment variables are set
- Check function logs in Vercel
- Test the n8n webhook directly with curl

### Widget Not Loading

- Verify the domain is accessible
- Check browser console for errors
- Ensure `widget.js` is being served correctly
- Verify CORS headers are set

## Next Steps

1. Test the widget on a client website
2. Monitor performance and errors
3. Gather client feedback
4. Iterate on improvements


