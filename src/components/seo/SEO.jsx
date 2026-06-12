import { useEffect } from 'react'

const SITE_URL = 'https://txpick.com'
const DEFAULT_IMAGE = `${SITE_URL}/icon-512.png`

function upsertMeta(selector, attributes) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) el.setAttribute(key, value)
  })
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export const seoPages = {
  home: {
    title: 'TXPick | Daily Organizer for Reminders, Bills, Expenses & Business Tasks',
    description: 'TXPick helps busy people and small businesses manage reminders, bills, expenses, payroll, and daily tasks in one simple app.',
    path: '/',
    keywords: 'TXPick, daily organizer, reminder app, bill reminder, expense tracker, small business app',
  },
  profitSplit: {
    title: 'Profit Split & Hui Manager | TXPick',
    description: 'Calculate profit sharing, commissions, partner payouts, revenue splits, and manage Hui rotating savings groups with member tracking, collections, and payout history.',
    path: '/profit-split',
    keywords: 'profit split calculator, commission calculator, revenue split calculator, partner payout calculator, hui manager, rotating savings tracker, chia lợi nhuận, tính hoa hồng, quản lý hụi',
  },
  feedback: {
    title: 'Feedback | TXPick',
    description: 'Send feedback, feature requests, and ideas to help improve TXPick.',
    path: '/feedback',
    keywords: 'TXPick feedback, app feedback, feature request',
  },
  privacy: {
    title: 'Privacy Policy | TXPick',
    description: 'Read the TXPick privacy policy and learn how your information is handled.',
    path: '/privacy',
    keywords: 'TXPick privacy policy',
  },
  terms: {
    title: 'Terms of Service | TXPick',
    description: 'Read the TXPick terms of service.',
    path: '/terms',
    keywords: 'TXPick terms of service',
  },
}

function buildSchema({ title, description, url, pageKey }) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'TXPick',
      alternateName: ['TX Pick'],
      url: `${SITE_URL}/`,
      inLanguage: ['en-US', 'vi-VN'],
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'TXPick',
      url: `${SITE_URL}/`,
      logo: DEFAULT_IMAGE,
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'TXPick',
      url: `${SITE_URL}/`,
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web, iOS, Android',
      browserRequirements: 'Requires a modern browser with JavaScript enabled.',
      inLanguage: ['en-US', 'vi-VN'],
      isAccessibleForFree: true,
      description: 'TXPick is a daily organizer for reminders, bills, expenses, payroll, profit splitting, Hui group tracking, and small business tasks.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: ['en-US', 'vi-VN'],
    },
  ]

  if (pageKey === 'profitSplit') {
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/profit-split#software`,
      name: 'Profit Split & Hui Manager',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, iOS, Android',
      url: `${SITE_URL}/profit-split`,
      inLanguage: ['en-US', 'vi-VN'],
      isAccessibleForFree: true,
      description,
      featureList: [
        'Profit split calculator',
        'Commission calculator',
        'Partner payout tracking',
        'Revenue split history',
        'Hui rotating savings group manager',
        'Member collection tracking',
        'Payout history',
      ],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@id': `${SITE_URL}/#organization` },
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

export default function SEO({ page = 'home' }) {
  useEffect(() => {
    const cfg = seoPages[page] ?? seoPages.home
    const url = `${SITE_URL}${cfg.path}`

    document.title = cfg.title
    upsertMeta('meta[name="description"]', { name: 'description', content: cfg.description })
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: cfg.keywords })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' })
    upsertMeta('meta[name="googlebot"]', { name: 'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' })
    upsertLink('canonical', url)

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'TXPick' })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: cfg.title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: cfg.description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_IMAGE })
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: `${cfg.title} app preview` })

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: cfg.title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: cfg.description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: DEFAULT_IMAGE })

    upsertJsonLd('txpick-page-schema', buildSchema({ title: cfg.title, description: cfg.description, url, pageKey: page }))
  }, [page])

  return null
}
