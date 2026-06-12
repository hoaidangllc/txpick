# TXPick Auth + SEO Deploy Checklist

## Files changed

- `src/App.jsx`
  - Added routes: `/forgot-password`, `/reset-password`, `/auth/callback`.
- `src/pages/Login.jsx`
  - Changed Forgot Password link from `#` to `/forgot-password`.
  - Changed Google OAuth redirect to `/auth/callback`.
  - Reused shared post-login route helper.
- `src/pages/Signup.jsx`
  - Added `emailRedirectTo` for Supabase email confirmation.
  - Shows success message telling user to check email.
  - Handles likely existing-email case returned by Supabase identities.
  - Changed Google OAuth redirect to `/auth/callback`.
- `src/pages/ForgotPassword.jsx`
  - New page for sending Supabase password reset email.
  - Uses redirect `/reset-password`.
  - Shows success/error status.
- `src/pages/ResetPassword.jsx`
  - New page for entering and confirming a new password.
  - Handles Supabase recovery session/code.
  - Updates password with `supabase.auth.updateUser`.
  - Shows success/error status and returns user to login.
- `src/pages/AuthCallback.jsx`
  - New callback page for email confirmation and Google OAuth.
  - Exchanges Supabase auth code for session.
  - Redirects user based on profile: `/business`, `/today`, or `/onboarding`.
- `src/lib/authRedirects.js`
  - New helper for redirect URL and post-login routing.
  - Supports optional `VITE_SITE_URL`, otherwise uses current origin.
- `src/lib/supabase.js`
  - Added fallback stub methods for reset/update/exchange auth calls when env is not configured.

## Supabase settings required

In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://txpick.com`
- Redirect URLs:
  - `https://txpick.com/auth/callback`
  - `https://txpick.com/reset-password`
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/reset-password`

In Supabase Dashboard > Authentication > Providers:

- Email provider enabled.
- Confirm email enabled if you want mandatory confirmation.
- Password recovery email template should use Supabase recovery link normally.
- Google provider enabled with the correct Google OAuth client ID/secret.

In Vercel/production env:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Optional but recommended: `VITE_SITE_URL=https://txpick.com`

## SEO review

Already present and checked:

- `public/sitemap.xml`
- `public/robots.txt`
- Canonical URLs through `src/components/seo/SEO.jsx`
- Meta title/description through `SEO.jsx` and `index.html`
- Open Graph and Twitter Card through `SEO.jsx` and `index.html`
- Structured data/schema through `SEO.jsx` and `index.html`
- App-private routes are disallowed in `robots.txt`.

After deploy, submit/check in Google Search Console:

- URL Inspection: `https://txpick.com/`
- URL Inspection: `https://txpick.com/profit-split`
- Submit sitemap: `https://txpick.com/sitemap.xml`
- Check Coverage and Canonical after Google recrawls.

## Verification completed locally

- `npm ci` completed.
- `npm run build` passed.
- `npm run lint` passed.

