# Guide: Adding a New Client to the Widget System

This guide walks you through adding a new client to the multi-tenant widget system. Follow these steps in order.

## Prerequisites

- Access to the GitHub repository
- Access to Vercel dashboard
- Access to n8n to create Chat Trigger flows
- Client's domain name
- Client's branding assets (logo URL, company name, colors)

## Step-by-Step Process

### Step 1: Gather Client Information

Before starting, collect the following from your client:

- **Company Name**: e.g., "Mørup Algerens"
- **Subtitle**: e.g., "Digital Assistent"
- **Logo URL**: Full URL to their logo image (must be publicly accessible)
- **Primary Color**: Hex color code (e.g., "#2d5a27")
- **Domain(s)**: Where the widget will be embedded (e.g., "moerup-algerens.dk")
- **Welcome Message**: Custom greeting message in Danish
- **Popup Message**: Short message for the popup bubble

### Step 2: Create Client Configuration File

1. **Create a new JSON file** in the `clients/` directory:
   - Filename: `clients/[client-id].json`
   - Use lowercase, no spaces, no special characters
   - Example: `clients/moerup.json`

2. **Copy this template** and fill in the values:

```json
{
  "id": "client-id",
  "companyName": "Company Name",
  "subtitle": "Subtitle Text",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#hexcolor",
  "welcomeMessage": "Hej! 👋 Velkommen til [Company Name]...",
  "popupMessage": "Hej! Har du spørgsmål? Skriv til os her!",
  "webhookUrl": "https://handwork.app.n8n.cloud/webhook/[uuid]/chat",
  "allowedDomains": [
    "client-domain.dk",
    "www.client-domain.dk",
    "ai-agent-website-clients.vercel.app",
    "localhost",
    "127.0.0.1"
  ]
}
```

3. **Fill in the template:**
   - `id`: Same as filename (without .json)
   - `companyName`: Full company name
   - `subtitle`: Short description (e.g., "Digital Assistent")
   - `logoUrl`: Full URL to logo (must be HTTPS and publicly accessible)
   - `primaryColor`: Hex color for buttons and accents
   - `welcomeMessage`: Long welcome message (will type out when chat opens)
   - `popupMessage`: Short popup message (appears after 1.5 seconds)
   - `webhookUrl`: n8n Chat Trigger URL (see Step 4) - Format: `https://handwork.app.n8n.cloud/webhook/[uuid]/chat`
   - `allowedDomains`: 
     - Client's production domain(s)
     - `ai-agent-website-clients.vercel.app` (always include this)
     - `localhost` and `127.0.0.1` (for local testing)

**Example (Moerup):**
```json
{
  "id": "moerup",
  "companyName": "Mørup Algerens",
  "subtitle": "Digital Assistent",
  "logoUrl": "https://moerup-algerens.dk/wp-content/uploads/2023/01/moerup-algerens-logo.png",
  "primaryColor": "#2d5a27",
  "welcomeMessage": "Hej! 👋 Velkommen til Mørup Algerens. Jeg er din digitale assistent og kan hjælpe dig med alt fra tilbud på algebehandling, fliserens og plænerens, til spørgsmål om imprægnering og tagrens. Hvordan kan jeg hjælpe dig i dag?",
  "popupMessage": "Hej! Har du spørgsmål om algebehandling? Skriv til os her!",
  "webhookUrl": "https://handwork.app.n8n.cloud/webhook/2ff562bb-d8b4-4ef1-b216-830693d724cc/chat",
  "allowedDomains": [
    "moerup-algerens.dk",
    "www.moerup-algerens.dk",
    "ai-agent-website-clients.vercel.app",
    "localhost",
    "127.0.0.1"
  ]
}
```

### Step 3: Register Client in Code

1. **Open `lib/clients.ts`**

2. **Add import at the top:**
```typescript
import newClientConfig from '../clients/newclient.json';
```

3. **Add to the clientConfigs object:**
```typescript
const clientConfigs: Record<string, ClientConfig> = {
  wedsgaard: wedsgaardConfig as ClientConfig,
  moerup: moerupConfig as ClientConfig,
  newclient: newClientConfig as ClientConfig,  // Add this line
};
```

**Example:**
```typescript
import wedsgaardConfig from '../clients/wedsgaard.json';
import moerupConfig from '../clients/moerup.json';
import newClientConfig from '../clients/newclient.json';  // New import

const clientConfigs: Record<string, ClientConfig> = {
  wedsgaard: wedsgaardConfig as ClientConfig,
  moerup: moerupConfig as ClientConfig,
  newclient: newClientConfig as ClientConfig,  // New entry
};
```

### Step 4: Set Up n8n Chat Trigger Flow

1. **Log into n8n** (https://handwork.app.n8n.cloud)

2. **Create a new workflow** or duplicate an existing one (e.g., Wedsgaard workflow)

3. **Configure the Chat Trigger:**
   - Use **"Chat Trigger"** node (NOT Webhook Trigger)
   - The Chat Trigger will automatically generate a unique webhook URL
   - Format: `https://handwork.app.n8n.cloud/webhook/[uuid]/chat`
   - Copy the full URL from the Chat Trigger node

4. **Set up the workflow:**
   - Handle `chatInput` from the Chat Trigger
   - Process the message through your AI/LLM
   - Return response in format: `{ "response": "Your response text" }`

5. **Activate the workflow:**
   - Click "Active" toggle in n8n
   - The Chat Trigger URL is now live

6. **Test the Chat Trigger:**
```bash
curl -X POST https://handwork.app.n8n.cloud/webhook/[uuid]/chat \
  -H "Content-Type: application/json" \
  -d '{"action": "sendMessage", "sessionId": "test123", "chatInput": "Hello test"}'
```

7. **Verify response format:**
   - Should return JSON with `response` field
   - Example: `{"response": "Hello! How can I help you?"}`

**Important Notes:**
- Use **Chat Trigger**, not Webhook Trigger
- The URL format is: `https://handwork.app.n8n.cloud/webhook/[uuid]/chat`
- The UUID is automatically generated by n8n Chat Trigger
- Copy the full URL and use it in the client config file

### Step 5: Test Locally

1. **Start the dev server:**
```bash
npm run dev
```
Note the port number (usually 3000, but may be 3001, 3002, etc.)

2. **Create a test HTML file** (optional):
   - Copy `test-moerup-local.html`
   - Rename to `test-[client-id]-local.html`
   - Update:
     - Title and heading
     - Port number in script tag
     - `data-client` attribute
     - Expected colors and messages

3. **Test the widget:**
   - Open `http://localhost:[port]/widget/[client-id]` in browser
   - Or open your test HTML file
   - Verify:
     - ✅ Button appears with correct color
     - ✅ Popup message is correct
     - ✅ Chat opens with correct branding
     - ✅ Welcome message types out correctly
     - ✅ Logo displays correctly
     - ✅ Can send messages

4. **Test API endpoint:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"message": "Test", "clientId": "[client-id]"}'
```

### Step 6: Commit and Deploy

1. **Stage all changes:**
```bash
git add clients/[client-id].json lib/clients.ts test-[client-id]-local.html
```

2. **Commit:**
```bash
git commit -m "Add new client: [Client Name]"
```

3. **Push to GitHub:**
```bash
git push origin main
```

4. **Wait for Vercel deployment:**
   - Vercel will automatically deploy
   - Check Vercel dashboard for deployment status
   - Usually takes 1-2 minutes

### Step 7: Test on Production

1. **Test the widget route:**
   - Visit: `https://ai-agent-website-clients.vercel.app/widget/[client-id]`
   - Verify widget loads correctly

2. **Test with embed code:**
   - Create a test HTML file with the embed code
   - Verify widget appears and works

3. **Test domain validation:**
   - Try accessing from a non-allowed domain (should fail)
   - Try accessing from allowed domain (should work)

### Step 8: Provide Embed Code to Client

Send the client this embed code:

```html
<!-- Add this before closing </body> tag -->
<script 
  src="https://ai-agent-website-clients.vercel.app/widget.js" 
  data-client="[client-id]"
></script>
```

**Example for Moerup:**
```html
<script 
  src="https://ai-agent-website-clients.vercel.app/widget.js" 
  data-client="moerup"
></script>
```

**Important notes for client:**
- Must be placed before the closing `</body>` tag
- The `data-client` attribute is required
- Widget will only work on domains listed in `allowedDomains`
- No other configuration needed

## Checklist

Use this checklist to ensure nothing is missed:

- [ ] Client config file created in `clients/` directory
- [ ] Config file has correct JSON syntax (validate with JSON linter)
- [ ] Client registered in `lib/clients.ts`
- [ ] n8n Chat Trigger flow created and tested
- [ ] Chat Trigger URL matches config file (format: `https://handwork.app.n8n.cloud/webhook/[uuid]/chat`)
- [ ] Allowed domains include:
  - [ ] Client's production domain(s)
  - [ ] `ai-agent-website-clients.vercel.app`
  - [ ] `localhost` and `127.0.0.1`
- [ ] Tested locally (widget route and embed)
- [ ] Tested API endpoint locally
- [ ] Committed and pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Tested on production URL
- [ ] Embed code provided to client
- [ ] Client has tested on their website

## Troubleshooting

### Widget doesn't appear
- Check browser console (F12) for errors
- Verify `data-client` attribute matches client ID
- Check that dev server is running (for local testing)
- Verify client config file exists and is valid JSON

### API returns 403 Forbidden
- Check that client's domain is in `allowedDomains`
- Verify `Origin` header matches allowed domain
- Check browser console for specific error

### Wrong client appears
- Verify `data-client` attribute matches client ID
- Check that client is registered in `lib/clients.ts`
- Hard refresh browser (Ctrl+Shift+R)

### Colors/branding incorrect
- Verify `primaryColor` in config file
- Check that logo URL is accessible (try in browser)
- Hard refresh browser to clear cache

### n8n Chat Trigger not working
- Test Chat Trigger directly with curl (use the full URL with `/chat` endpoint)
- Verify Chat Trigger URL matches config (must include `/chat` at the end)
- Check n8n workflow is active
- Verify response format matches expected structure (`{"response": "..."}`)
- Make sure you're using Chat Trigger node, not Webhook Trigger node

## Quick Reference

### File Locations
- Client configs: `clients/[client-id].json`
- Client registry: `lib/clients.ts`
- Widget component: `components/Widget.tsx`
- API route: `app/api/chat/route.ts`
- Embed script: `public/widget.js`

### Important URLs
- Production widget: `https://ai-agent-website-clients.vercel.app/widget/[client-id]`
- n8n Chat Trigger URL format: `https://handwork.app.n8n.cloud/webhook/[uuid]/chat`
- Vercel dashboard: Check your Vercel account

### Common Client IDs
- `wedsgaard` - Tømrerfirmaet Wedsgaard
- `moerup` - Mørup Algerens

## Next Steps After Setup

1. Monitor client's usage in n8n
2. Gather feedback from client
3. Iterate on improvements
4. Document any custom requirements

---

**Questions?** Check the codebase or refer to existing client configs as examples.
