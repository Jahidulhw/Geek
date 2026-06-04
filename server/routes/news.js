import { Router } from 'express'
import { XMLParser } from 'fast-xml-parser'

const router = Router()

// 30-minute in-memory cache
let cache = { data: null, at: 0 }
const TTL = 30 * 60 * 1000

const FEEDS = [
  { url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml', source: 'FDA' },
  { url: 'https://medlineplus.gov/rss/news.xml', source: 'MedlinePlus' },
]

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

async function fetchFeed({ url, source }) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Geek-App/1.0' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`${source} feed returned ${res.status}`)
  const xml = await res.text()
  const doc = parser.parse(xml)
  const items = doc?.rss?.channel?.item ?? []
  const list = Array.isArray(items) ? items : [items]

  return list.map(item => ({
    title:       String(item.title ?? '').trim(),
    source,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    url:         String(item.link ?? item['atom:link']?.['@_href'] ?? '').trim(),
    urlToImage:  item['media:content']?.['@_url'] ?? item.enclosure?.['@_url'] ?? null,
  })).filter(a => a.title && a.url)
}

router.get('/', async (req, res) => {
  if (cache.data && Date.now() - cache.at < TTL) {
    return res.json(cache.data)
  }

  try {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed))

    const articles = results
      .flatMap(r => r.status === 'fulfilled' ? r.value : [])
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 20)

    if (!articles.length) throw new Error('All feeds returned empty')

    cache = { data: articles, at: Date.now() }
    res.json(articles)
  } catch (err) {
    console.error('RSS fetch error:', err.message)
    res.json(cache.data ?? [])
  }
})

export default router
