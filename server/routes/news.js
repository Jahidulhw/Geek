import { Router } from 'express'

const router = Router()

// 30-minute in-memory cache to stay within NewsAPI free tier limits
let cache = { data: null, at: 0 }
const TTL = 30 * 60 * 1000

const PLACEHOLDERS = [
  {
    title:       'FDA Approves New Treatment for Chronic Pain Management',
    source:      'Health News',
    publishedAt: new Date().toISOString(),
    url:         'https://www.fda.gov/news-events',
    urlToImage:  null,
  },
  {
    title:       'New Study Links Popular SSRI to Improved Long-Term Outcomes',
    source:      'Medical Journal',
    publishedAt: new Date().toISOString(),
    url:         'https://www.nih.gov/news-events',
    urlToImage:  null,
  },
  {
    title:       'Ozempic and Weight Loss: What the Latest Research Says',
    source:      'Reuters Health',
    publishedAt: new Date().toISOString(),
    url:         'https://www.reuters.com/business/healthcare-pharmaceuticals',
    urlToImage:  null,
  },
  {
    title:       'CDC Updates Antibiotic Resistance Guidelines for 2025',
    source:      'CDC Newsroom',
    publishedAt: new Date().toISOString(),
    url:         'https://www.cdc.gov/media',
    urlToImage:  null,
  },
  {
    title:       'Melatonin Use in Teens: Doctors Warn About Dosage Risks',
    source:      'WebMD',
    publishedAt: new Date().toISOString(),
    url:         'https://www.webmd.com/sleep-disorders/news',
    urlToImage:  null,
  },
]

router.get('/', async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey || apiKey === 'your_newsapi_key_here') {
    return res.json(PLACEHOLDERS)
  }

  // Serve from cache if fresh
  if (cache.data && Date.now() - cache.at < TTL) {
    return res.json(cache.data)
  }

  // Keywords that signal press releases / financial / market noise
  const NOISE = [
    /market (size|report|research|forecast|analysis|share)/i,
    /\bipo\b|\bstock\b|\bshares?\b|\brevenue\b|\bearnings\b|\bquarterly\b/i,
    /press release|globe newswire|business wire|pr newswire|accesswire/i,
    /\binvestors?\b|\bwall street\b|\bnasdaq\b|\bnyse\b/i,
  ]

  try {
    const url = new URL('https://newsapi.org/v2/everything')
    url.searchParams.set('q', 'new drug FDA approved 2025')
    url.searchParams.set('language', 'en')
    url.searchParams.set('sortBy', 'publishedAt')
    url.searchParams.set('pageSize', '40')
    url.searchParams.set('apiKey', apiKey)

    const response = await fetch(url.toString())
    if (!response.ok) throw new Error(`NewsAPI ${response.status}`)

    const json = await response.json()

    const articles = (json.articles ?? [])
      .filter(a =>
        a.title &&
        a.title !== '[Removed]' &&
        a.url &&
        !NOISE.some(rx => rx.test(a.title))
      )
      .map(a => ({
        title:       a.title,
        source:      a.source?.name ?? '',
        publishedAt: a.publishedAt,
        url:         a.url,
        urlToImage:  a.urlToImage ?? null,
      }))
      .slice(0, 12)

    if (!articles.length) return res.json(PLACEHOLDERS)

    cache = { data: articles, at: Date.now() }
    res.json(articles)
  } catch (err) {
    console.error('News fetch error:', err.message)
    res.json(cache.data ?? PLACEHOLDERS)
  }
})

export default router
