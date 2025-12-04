# Client Embedding Guide

## Quick Start - Wedsgaard Ejendomme

### Anbefalet Embed Kode (SEO-optimeret)

```html
<script src="https://ai-agent-website-wedsgaard.vercel.app/widget.min.js" async></script>
```

**Vigtigt:**
- Brug `widget.min.js` (minificeret version) for bedre performance
- `async` attributten sikrer at scriptet ikke blokerer sidens indlæsning
- Placér scriptet lige før `</body>` tag'et

---

## Placering

Indsæt scriptet lige før `</body>` for bedst performance og SEO:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Min Hjemmeside</title>
</head>
<body>
  <!-- Dit website indhold -->
  
  <!-- AI Agent Widget - placér lige før </body> -->
  <script src="https://ai-agent-website-wedsgaard.vercel.app/widget.min.js" async></script>
</body>
</html>
```

---

## Platform-specifikke Instruktioner

### WordPress
1. Installer plugin: **"Insert Headers and Footers"**
2. Gå til Indstillinger → Insert Headers and Footers
3. Indsæt i "Scripts in Footer":
```html
<script src="https://ai-agent-website-wedsgaard.vercel.app/widget.min.js" async></script>
```
4. Gem

### Shopify
1. Gå til Online Store → Themes → Edit code
2. Åbn `theme.liquid`
3. Indsæt lige før `</body>`:
```html
<script src="https://ai-agent-website-wedsgaard.vercel.app/widget.min.js" async></script>
```
4. Gem

### Squarespace
1. Gå til Settings → Advanced → Code Injection
2. Indsæt i "Footer" feltet
3. Gem

### Wix
1. Gå til Settings → Custom Code
2. Klik "Add Code"
3. Indsæt scriptet
4. Vælg "Body - end" og "All pages"
5. Gem

### Webflow
1. Gå til Project Settings → Custom Code
2. Indsæt i "Footer Code"
3. Gem og publish

---

## Avancerede Muligheder

### Brug af ikke-minificeret version (debugging)

```html
<script src="https://ai-agent-website-wedsgaard.vercel.app/widget.js" async></script>
```

### Custom Webhook URL (til andre klienter)

```html
<script 
  src="https://ai-agent-website-wedsgaard.vercel.app/widget.min.js"
  data-webhook-url="https://your-n8n-instance.com/webhook/your-agent"
  async
></script>
```

---

## Fil Størrelser

| Fil | Størrelse | Anbefalet til |
|-----|-----------|---------------|
| `widget.min.js` | ~2 KB | Produktion ✅ |
| `widget.js` | ~4 KB | Debugging/udvikling |

---

## Sådan Virker Det

1. Scriptet loader asynkront (blokerer ikke siden)
2. En iframe oprettes i nederste højre hjørne
3. Brugerens beskeder sendes til `/api/chat`
4. API'et videresender til n8n webhook
5. AI-svar vises i chatten

---

## Sikkerhed

- Widgeten er begrænset til kun at virke på `wedsgaard.dk`
- Al kommunikation går gennem sikker HTTPS
- Webhook URL'er er beskyttet server-side

---

## Fejlfinding

### Widget vises ikke
1. Tjek browser konsol for fejl (F12)
2. Verificér at script URL er korrekt
3. Tjek at ingen ad-blockers blokerer

### Beskeder sendes ikke
1. Tjek at n8n webhook er aktiv
2. Tjek Network tab i browser DevTools
3. Verificér at domænet er på allowed list

### Widget ser forkert ud
1. Ryd browser cache
2. Tjek at iframe loader korrekt
3. Test på en anden browser

---

## Support

Ved tekniske spørgsmål, kontakt udviklingsteamet.
