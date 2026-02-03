# Local Testing Guide - Multi-Client Widget System

## Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Note the port number (usually `3000`, but may be `3001`, `3002`, etc. if 3000 is busy)

2. **Test both clients using the test HTML files:**
   - Open `test-wedsgaard-local.html` in your browser (double-click the file)
   - Open `test-moerup-local.html` in another tab
   - **Important:** Update the port number in the HTML files if your server is not on port 3000

## Testing Methods

### Method 1: Direct Widget Routes (Easiest)

Test the widget pages directly in your browser:

**Wedsgaard Widget:**
- URL: `http://localhost:3000/widget/wedsgaard`
- Or legacy route: `http://localhost:3000/widget` (backward compatible)

**Moerup Widget:**
- URL: `http://localhost:3000/widget/moerup`

### Method 2: Test HTML Files (Real Embedding Simulation)

1. **Wedsgaard Test:**
   - Open `test-wedsgaard-local.html` in your browser
   - Make sure the port in the script tag matches your dev server port
   - Widget should appear in bottom right with **green color (#6b8068)**

2. **Moerup Test:**
   - Open `test-moerup-local.html` in your browser
   - Make sure the port in the script tag matches your dev server port
   - Widget should appear in bottom right with **dark green color (#2d5a27)**

### Method 3: Main Demo Page

- URL: `http://localhost:3000/`
- Shows Wedsgaard widget (default for demo)

## What to Verify for Each Client

### Wedsgaard Widget Should Show:
- ✅ Button color: **Green (#6b8068)**
- ✅ Company name: **"Tømrerfirmaet Wedsgaard"**
- ✅ Subtitle: **"Digital Svend"**
- ✅ Popup message: **"Hej! Har du spørgsmål? Skriv til os her!"**
- ✅ Welcome message: **"Hej! 👋 Velkommen til Tømrerfirmaet Wedsgaard..."**
- ✅ Logo: Wedsgaard logo from `https://wedsgaard.dk/storage/wedsgaard/logo.png`

### Moerup Widget Should Show:
- ✅ Button color: **Dark Green (#2d5a27)**
- ✅ Company name: **"Mørup Algerens"**
- ✅ Subtitle: **"Digital Assistent"**
- ✅ Popup message: **"Hej! Har du spørgsmål om algebehandling? Skriv til os her!"**
- ✅ Welcome message: **"Hej! 👋 Velkommen til Mørup Algerens..."**
- ✅ Logo: Moerup logo from their website

## Testing Checklist

### Visual Tests:
- [ ] Widget button appears in bottom right corner
- [ ] Button has correct color for each client
- [ ] Breathing glow animation works
- [ ] Popup bubble appears after 1.5 seconds
- [ ] Popup message is correct for each client
- [ ] Clicking button opens chat interface
- [ ] Chat header shows correct company name and logo
- [ ] Welcome message types out correctly
- [ ] Colors match client branding (buttons, links, etc.)

### Functional Tests:
- [ ] Can type in input field
- [ ] Send button works
- [ ] Messages appear in chat bubbles
- [ ] Loading indicator shows while waiting
- [ ] API calls use correct webhook URL for each client
- [ ] Domain validation works (test with different origins)
- [ ] Close button (X) closes the widget
- [ ] Widget is responsive (mobile/desktop)

## Testing API Endpoints

### Test Wedsgaard API:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"message": "Test message", "clientId": "wedsgaard"}'
```

### Test Moerup API:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"message": "Test message", "clientId": "moerup"}'
```

## Port Configuration

If your dev server runs on a different port (e.g., 3004):

1. **Update test HTML files:**
   - Change `http://localhost:3000` to `http://localhost:3004` in:
     - `test-wedsgaard-local.html`
     - `test-moerup-local.html`

2. **Or use the direct routes:**
   - `http://localhost:3004/widget/wedsgaard`
   - `http://localhost:3004/widget/moerup`

## Troubleshooting

### Widget doesn't appear:
- Check browser console (F12) for errors
- Verify dev server is running
- Check that the port in HTML files matches your server port
- Verify `data-client` attribute is set correctly

### API returns 403 Forbidden:
- Check that `localhost` is in the client's `allowedDomains` array
- Verify the `Origin` header matches an allowed domain
- Check browser console for specific error messages

### Wrong client appears:
- Verify `data-client` attribute matches a client ID in `clients/` folder
- Check that the client config file exists and is valid JSON
- Look for errors in browser console

### Colors/branding incorrect:
- Verify `primaryColor` in client config JSON
- Check that CSS variables are being applied
- Hard refresh browser (Ctrl+Shift+R)

## Next Steps

Once local testing passes:
1. Push changes to GitHub
2. Verify Vercel deployment
3. Test on production URLs
4. Provide embed code to clients
