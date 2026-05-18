# TXPick Google Play public beta prep

Current direction:
- Android first can use PWA/TWA or Capacitor wrapper.
- iOS stays PWA Add to Home Screen for now.
- No native App Store build in this phase.

Required before Google Play submission:

1. App identity
- App name: TXPick
- Short name: TXPick
- Icons: public/icon-192.png and public/icon-512.png already exist.
- Keep manifest.webmanifest start_url as /today for logged-in daily use.

2. Legal/support pages
- Privacy Policy: /privacy
- Terms: /terms
- Support/feedback: /feedback
- Support email: danghoai@icloud.com

3. Account deletion
Minimum public beta requirement:
- Add a visible Delete Account entry in Settings before Play Store production release.
- Use confirm modal.
- Delete user-owned data first, then profile/auth account through a safe server endpoint.
- Do not expose service-role keys to the client.

4. Native wrapper readiness
- Keep routes browser-safe and refresh-safe.
- Keep service worker stable.
- Keep notification refresh flow in Settings.
- Keep layout mobile-first.

5. Payment
- Not included in this phase.
- Plus/Pro are internal placeholders only.
- Do not submit subscription metadata until Stripe/Play Billing is actually built.
