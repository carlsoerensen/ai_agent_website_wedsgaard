# Pre-Merge Checklist

## ✅ Ready to Merge to Main

### Configuration Files
- [x] `clients/wedsgaard.json` - Correct Chat Trigger URL
- [x] `clients/moerup.json` - Correct Chat Trigger URL and subtitle
- [x] Both configs include `ai-agent-website-clients.vercel.app` in allowedDomains
- [x] Both configs have correct company branding

### Code Files
- [x] `lib/clients.ts` - Both clients registered
- [x] `lib/types.ts` - ClientConfig interface defined
- [x] `app/widget/[clientId]/page.tsx` - Dynamic route created
- [x] `app/widget/page.tsx` - Backward compatibility maintained
- [x] `components/Widget.tsx` - Uses config prop with CSS variables
- [x] `app/api/chat/route.ts` - Multi-client support with domain validation
- [x] `public/widget.js` - Supports data-client attribute
- [x] `public/widget.min.js` - Minified version updated

### Backward Compatibility
- [x] Existing Wedsgaard embed at `/widget` still works
- [x] Legacy API flow (without clientId) still works
- [x] Old domain `ai-agent-website-wedsgaard.vercel.app` still in allowedDomains

### Testing
- [x] No linter errors
- [x] Both clients tested locally
- [x] Widget routes work: `/widget/wedsgaard` and `/widget/moerup`

### Documentation
- [x] `ADD_NEW_CLIENT_GUIDE.md` - Complete setup guide
- [x] Guide updated for Chat Trigger (not Webhook Trigger)
- [x] Test HTML files created

## Before Merging

1. **Verify Vercel Domain:**
   - Confirm domain is set to `ai-agent-website-clients.vercel.app` in Vercel dashboard

2. **Test Both Clients:**
   - Test Wedsgaard: `https://ai-agent-website-clients.vercel.app/widget/wedsgaard`
   - Test Moerup: `https://ai-agent-website-clients.vercel.app/widget/moerup`
   - Test legacy route: `https://ai-agent-website-clients.vercel.app/widget`

3. **Verify n8n Workflows:**
   - Wedsgaard Chat Trigger is active
   - Moerup Chat Trigger is active
   - Both return correct response format

4. **Test API Endpoints:**
   ```bash
   # Test Wedsgaard
   curl -X POST https://ai-agent-website-clients.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -H "Origin: https://wedsgaard.dk" \
     -d '{"message": "Test", "clientId": "wedsgaard"}'
   
   # Test Moerup
   curl -X POST https://ai-agent-website-clients.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -H "Origin: https://moerup-algerens.dk" \
     -d '{"message": "Test", "clientId": "moerup"}'
   ```

## After Merging

1. **Monitor Vercel Deployment:**
   - Check deployment logs for errors
   - Verify build succeeds

2. **Test Production:**
   - Test both widget routes
   - Test embed codes on client websites
   - Verify domain validation works

3. **Update Client Embed Codes:**
   - Wedsgaard: Already live (backward compatible)
   - Moerup: Provide new embed code with `data-client="moerup"`

## Rollback Plan

If issues occur after merge:
1. Revert the merge commit
2. Or create a hotfix branch
3. The old system will continue working via backward compatibility

## ✅ Status: READY TO MERGE

All checks passed. The system is backward compatible and ready for production.
