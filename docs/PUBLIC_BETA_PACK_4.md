# TXPick Public Beta Pack 4

This pack keeps the app simple and production-safe. No rewrite, no Stripe, no chatbot.

## Included

### Smart Assistant Lite v2
- Stronger local parser
- Vietnamese + English keyword support
- Date parser: today, tomorrow, weekdays, day-of-month, month/day
- Time parser: morning/noon/afternoon/night, AM/PM, Vietnamese periods
- Intent detection: reminder / bill / expense
- Confidence score
- AI fallback architecture route added but intentionally disabled

### Notification System Polish
- Refresh notifications flow preserved
- Unsubscribe/resubscribe flow preserved
- Server cleanup route for stale push subscriptions
- Diagnostics remain available in Settings

### Monetization Foundation
- Free / Plus / Pro plan config
- Feature gate helpers
- Ads placeholder component for Free plan
- No payment, no Stripe, no popup spam

### Google Play Readiness
- Delete account API route
- Delete account UI in Settings
- Privacy copy updated to mention in-app delete
- Manifest remains PWA/TWA friendly

## Verified

- npm run lint: pass
- npm run build: pass

## Not Enabled Yet

- Real AI fallback
- Stripe/payment
- Real ad network
- Native Android AAB build
