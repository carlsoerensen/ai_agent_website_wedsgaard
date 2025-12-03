# AI Agent Website Widget

An embeddable AI agent chat widget that connects to n8n webhooks. This widget can be easily embedded on any website with a simple script tag.

## Features

- 🎨 Beautiful, modern chat interface matching the Mira design
- 📱 Fully responsive (mobile and desktop)
- 🔒 Secure API proxy to n8n webhooks
- 🚀 Easy embedding with a single script tag
- ⚡ Built with Next.js and optimized for Vercel
- 🎯 Customizable webhook URLs per client

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
N8N_WEBHOOK_URL=https://handwork.app.n8n.cloud/webhook-test/wedsgaard_agent
```

### 3. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the widget in action.

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the `N8N_WEBHOOK_URL` environment variable in Vercel settings
4. Deploy

## Client Embedding

Once deployed, provide your clients with this code snippet:

### Basic Embedding (Uses default webhook from environment)

The widget URL is automatically detected from the script source, so you only need:

```html
<script src="https://your-vercel-domain.vercel.app/widget.js"></script>
```

### Custom Webhook URL (Per Client)

If you want each client to use their own n8n webhook:

```html
<script 
  src="https://your-vercel-domain.vercel.app/widget.js"
  data-webhook-url="https://handwork.app.n8n.cloud/webhook-test/client-specific-agent"
></script>
```

**Place the script tag just before the closing `</body>` tag for best performance.**

## How It Works

1. **Widget Script** (`/public/widget.js`): A lightweight script that clients embed on their website
2. **Widget Page** (`/app/widget/page.tsx`): The actual chat interface loaded in an iframe
3. **API Route** (`/app/api/chat/route.ts`): Proxies chat messages to your n8n webhook securely
4. **Widget Component** (`/components/Widget.tsx`): The React component that renders the chat UI

## Architecture

```
Client Website
    ↓
widget.js (embed script)
    ↓
Widget iframe (/widget)
    ↓
Widget Component (React)
    ↓
API Route (/api/chat)
    ↓
n8n Webhook
```

## Security Considerations

- ✅ CORS headers configured for cross-origin requests
- ✅ API routes validate input before forwarding to n8n
- ✅ Webhook URLs can be customized per client
- ✅ Environment variables for sensitive configuration

## Customization

### Changing Colors

Edit `components/Widget.module.css` and update the `#8b5cf6` color values to your brand color.

### Modifying n8n Response Format

Update the response parsing in `app/api/chat/route.ts` to match your n8n webhook response structure:

```typescript
const responseText =
  data.response ||
  data.message ||
  data.text ||
  data.output ||
  JSON.stringify(data);
```

## Testing the Webhook

You can test your n8n webhook directly:

```bash
curl -X POST https://handwork.app.n8n.cloud/webhook-test/wedsgaard_agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, this is a test"}'
```

## Future Enhancements

- [ ] Add authentication/API keys for additional security
- [ ] Implement rate limiting
- [ ] Add analytics tracking
- [ ] Support for file attachments
- [ ] Multi-language support
- [ ] Customizable widget appearance per client

## Support

For issues or questions, please contact the development team.

