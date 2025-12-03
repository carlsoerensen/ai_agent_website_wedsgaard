# Local Testing Guide

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Environment File

Create a `.env.local` file in the root directory:

```env
N8N_WEBHOOK_URL=https://handwork.app.n8n.cloud/webhook-test/wedsgaard_agent
```

### Step 3: Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Testing Methods

### Method 1: Direct Component Test (Easiest)

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000` in your browser
3. You'll see the widget in the bottom right corner
4. Click the purple button to open the chat
5. Type a message and send it
6. The message will be sent to your n8n webhook

**This is the fastest way to test the widget UI and functionality.**

### Method 2: Embedded Widget Test (Real-world simulation)

This simulates how clients will embed the widget on their website.

1. Start the dev server: `npm run dev`
2. Open `test-embed-local.html` in your browser (double-click the file)
3. The widget should appear in the bottom right corner
4. Test the full embedding experience

**Note:** Make sure the dev server is running on `http://localhost:3000` for this to work.

### Method 3: Test the Widget Page Directly

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000/widget` in your browser
3. This shows the widget in an iframe (how it appears when embedded)

## Testing Checklist

- [ ] Widget button appears in bottom right
- [ ] Clicking button opens chat interface
- [ ] Welcome screen shows "Mira, Your All-in-One Assistant"
- [ ] Can type in input field
- [ ] Send button works (purple button with paper plane icon)
- [ ] Messages appear in chat bubbles
- [ ] Loading indicator shows while waiting for response
- [ ] n8n webhook receives messages
- [ ] Responses appear in chat
- [ ] Close button (X) closes the widget
- [ ] Widget is responsive (try resizing browser)

## Testing the n8n Connection

### Test Webhook Directly

Before testing the widget, verify your n8n webhook works:

```bash
curl -X POST https://handwork.app.n8n.cloud/webhook-test/wedsgaard_agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, this is a test"}'
```

### Check API Route

Test the API route directly:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

## Troubleshooting

### Widget doesn't appear

- Check that the dev server is running
- Open browser console (F12) and look for errors
- Verify you're on `http://localhost:3000`

### Messages not sending

- Check browser console for errors
- Verify `.env.local` file exists and has `N8N_WEBHOOK_URL`
- Check terminal for API errors
- Test the n8n webhook directly with curl

### API errors

- Check terminal output for error messages
- Verify environment variable is set correctly
- Make sure n8n webhook URL is accessible
- Check network tab in browser DevTools

### Styling issues

- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check that CSS files are loading in Network tab

## Mobile Testing

1. Open `http://localhost:3000` on your phone
2. Make sure your phone is on the same network
3. Find your computer's local IP (e.g., `192.168.1.100`)
4. Visit `http://192.168.1.100:3000` on your phone
5. Test the widget on mobile viewport

Or use browser DevTools:
1. Press F12 to open DevTools
2. Click the device toggle icon (or press Ctrl+Shift+M)
3. Select a mobile device
4. Test the widget

## Next Steps After Local Testing

Once everything works locally:

1. Deploy to Vercel (see `DEPLOYMENT.md`)
2. Test on the Vercel deployment
3. Embed on a real website
4. Gather client feedback


