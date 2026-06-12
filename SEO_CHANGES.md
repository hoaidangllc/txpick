# SEO update summary

Updated TXPick SEO in one pass.

## Changed

- Added route-aware SEO component: `src/components/seo/SEO.jsx`
- Added dynamic title, description, keywords, canonical, Open Graph, Twitter tags
- Added JSON-LD schema for:
  - WebSite
  - Organization
  - WebApplication
  - WebPage
  - SoftwareApplication for Profit Split & Hui Manager
- Updated `src/App.jsx` to attach SEO metadata to public pages and Profit Split
- Added `/profit-split` to `public/sitemap.xml`
- Added `/profit-split` allow rule to `public/robots.txt`
- Updated base `index.html` title/description/schema to include profit splitting and Hui group tracking
- Built production `dist/` successfully

## SEO title for Profit Split

Profit Split & Hui Manager | TXPick

## SEO description for Profit Split

Calculate profit sharing, commissions, partner payouts, revenue splits, and manage Hui rotating savings groups with member tracking, collections, and payout history.

## Verify after deploy

1. Open `https://txpick.com/sitemap.xml`
2. Confirm `/profit-split` exists
3. Open Google Search Console → URL Inspection
4. Inspect `https://txpick.com/profit-split`
5. Click Request Indexing

## Local checks completed

- `npm run lint` passed
- `npm run build` passed
