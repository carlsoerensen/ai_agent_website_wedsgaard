# Client Embedding Guide

## Quick Start

Once your widget is deployed to Vercel, provide your clients with one of these embedding options:

### Option 1: Simple Embedding (Recommended)

This uses the default webhook URL from your environment variables:

```html
<script src="https://your-vercel-domain.vercel.app/widget.js"></script>
```

The script will automatically detect the widget URL from its own source.

### Option 2: Custom Webhook URL (Per Client)

If you want each client to use their own n8n webhook:

```html
<script 
  src="https://your-vercel-domain.vercel.app/widget.js"
  data-webhook-url="https://handwork.app.n8n.cloud/webhook-test/client-specific-agent"
></script>
```

### Option 3: Explicit Widget URL

If you need to explicitly specify the widget URL:

```html
<script 
  src="https://your-vercel-domain.vercel.app/widget.js"
  data-widget-url="https://your-vercel-domain.vercel.app"
  data-webhook-url="https://handwork.app.n8n.cloud/webhook-test/client-specific-agent"
></script>
```

## Placement

Place the script tag just before the closing `</body>` tag for best performance:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- AI Agent Widget -->
  <script src="https://your-vercel-domain.vercel.app/widget.js"></script>
</body>
</html>
```

## How It Works

1. The script tag loads `widget.js` from your Vercel domain
2. The script automatically creates an iframe pointing to `/widget` on your domain
3. The widget communicates with your API route at `/api/chat`
4. Your API route proxies messages to the n8n webhook
5. Responses flow back through the same chain

## Security

- The widget uses an iframe for isolation
- CORS headers are configured to allow embedding
- Webhook URLs can be customized per client
- All communication goes through your secure API route

## Customization

### Per-Client Webhooks

You can provide different webhook URLs to different clients by including the `data-webhook-url` attribute:

```html
<!-- Client A -->
<script 
  src="https://your-vercel-domain.vercel.app/widget.js"
  data-webhook-url="https://handwork.app.n8n.cloud/webhook-test/client-a-agent"
></script>

<!-- Client B -->
<script 
  src="https://your-vercel-domain.vercel.app/widget.js"
  data-webhook-url="https://handwork.app.n8n.cloud/webhook-test/client-b-agent"
></script>
```

## Troubleshooting

### Widget doesn't appear

1. Check browser console for errors
2. Verify the script URL is correct
3. Ensure the Vercel deployment is live
4. Check that no ad blockers are interfering

### Messages not sending

1. Verify the n8n webhook URL is correct
2. Check the browser network tab for API errors
3. Verify CORS headers are configured correctly
4. Check Vercel function logs for errors

### Widget looks broken

1. Clear browser cache
2. Check that CSS is loading properly
3. Verify the iframe is loading correctly
4. Check browser console for CSS errors

## Support

For technical support, contact your development team.


