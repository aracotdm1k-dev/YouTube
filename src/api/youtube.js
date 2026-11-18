import { mapChannel, mapComment, mapVideo, mapVideoCategory } from './mappers.js'
import { categories } from '../data/categories.js'

const API_BASE = 'https://www.googleapis.com/youtube/v3'
const CACHE_TTL = 10 * 60 * 1000
const DEFAULT_REGION_CODE = import.meta.env.VITE_REGION_CODE || 'US'
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY?.trim() ?? ''
const responseCache = new Map()

/**
 * A safe, typed YouTube API error.
 * @param {string} code Stable VidTube error code.
 * @param {string} message Safe message without request credentials.
 * @param {string} [reason] YouTube API reason, when available.
 */
export class YoutubeApiError extends Error {
  constructor(code, message, reason = '') {
    super(message)
    this.name = 'YoutubeApiError'
    this.code = code
    this.reason = reason
  }
}

/**
 * Create a cache key that excludes the API key.
 * @param {string} endpoint API resource endpoint.
 * @param {object} params Query parameters.
 * @returns {string} Stable, credential-free cache key.
 */
function makeCacheKey(endpoint, params) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  return `${endpoint}?${new URLSearchParams(entries.sort(([a], [b]) => a.localeCompare(b))).toString()}`
}

/**
 * Read a fresh memory or sessionStorage cache entry.
 * @param {string} key Credential-free cache key.
 * @returns {object|null} Cached response or null.
 */
function readCache(key) {
  const memoryEntry = responseCache.get(key)
  if (memoryEntry && memoryEntry.expiresAt > Date.now()) return memoryEntry.value
  responseCache.delete(key)
  try {
    const stored = sessionStorage.getItem(`vidtube-api:${key}`)
    if (!stored) return null
    const entry = JSON.parse(stored)
    if (entry.expiresAt <= Date.now()) {
      sessionStorage.removeItem(`vidtube-api:${key}`)
      return null
    }
    responseCache.set(key, entry)
    return entry.value
  } catch { return null }
}

/**
 * Store a successful API response for ten minutes.
 * @param {string} key Credential-free cache key.
 * @param {object} value Successful API response.
 * @returns {void}
 */
function writeCache(key, value) {
  const entry = { value, expiresAt: Date.now() + CACHE_TTL }
  responseCache.set(key, entry)
  try { sessionStorage.setItem(`vidtube-api:${key}`, JSON.stringify(entry)) } catch { /* Storage can be disabled or full. */ }
}

/**
 * Convert an unsuccessful response into a stable, safe error.
 * @param {Response} response Failed fetch response.
 * @returns {Promise<YoutubeApiError>} Typed API error.
 */
async function createApiError(response) {
  const payload = await response.json().catch(() => null)
  const reason = payload?.error?.errors?.[0]?.reason ?? ''
  if (['quotaExceeded', 'dailyLimitExceeded', 'userRateLimitExceeded'].includes(reason)) return new YoutubeApiError('QUOTA_EXCEEDED', 'Daily YouTube API limit reached.', reason)
  if (['keyInvalid', 'invalidKey', 'API_KEY_INVALID', 'accessNotConfigured'].includes(reason)) return new YoutubeApiError('KEY_INVALID', 'The YouTube API key is invalid or unavailable.', reason)
  if (reason === 'commentsDisabled') return new YoutubeApiError('COMMENTS_DISABLED', 'Comments are turned off.', reason)
  if (response.status === 404 || ['videoNotFound', 'channelNotFound', 'commentThreadNotFound', 'videoChartNotFound'].includes(reason)) return new YoutubeApiError('NOT_FOUND', 'The requested YouTube content was not found.', reason)
  return new YoutubeApiError('NETWORK', 'YouTube could not complete the request.', reason)
}

/**
 * Issue one cached YouTube Data API request.
 * @param {string} endpoint API resource endpoint.
 * @param {object} params Query parameters, excluding the key.
 * @param {AbortSignal} [signal] Request cancellation signal.
 * @returns {Promise<object>} Successful JSON response.
 */
async function request(endpoint, params, signal) {
  if (!API_KEY) throw new YoutubeApiError('KEY_INVALID', 'Set VITE_YOUTUBE_API_KEY in your local .env file.')
  const cacheKey = makeCacheKey(endpoint, params)
  const cached = readCache(cacheKey)
  if (cached) return cached

  const url = new URL(`${API_BASE}/${endpoint}`)
  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(name, String(value))
  })
  url.searchParams.set('key', API_KEY)
  let response
  try { response = await fetch(url, { signal }) }
  catch (error) {
    if (signal?.aborted || error.name === 'AbortError') throw error
    throw new YoutubeApiError('NETWORK', 'Unable to reach YouTube. Check your connection.')
  }
  if (!response.ok) throw await createApiError(response)
  const payload = await response.json()
  writeCache(cacheKey, payload)
  return payload
}

/**
 * Resolve up to 50 channel records in a single request.
 * @param {string[]} channelIds YouTube channel IDs.
 * @param {AbortSignal} [signal] Request cancellation signal.
 * @returns {Promise<Map<string, object>>} Channel records indexed by ID.
 */
async function getChannelMap(channelIds, signal) {
  const ids = [...new Set(channelIds.filter(Boolean))].slice(0, 50)
  if (!ids.length) return new Map()
  const payload = await request('channels', { part: 'snippet,statistics,brandingSettings,contentDetails', id: ids.join(','), maxResults: ids.length }, signal)
  return new Map((payload.items ?? []).map((item) => [item.id, mapChannel(item)]))
}

/**
 * Add real channel avatars to a page of normalized video resources.
 * @param {object[]} items Raw videos.list resources.
 * @param {AbortSignal} [signal] Request cancellation signal.
 * @returns {Promise<object[]>} Videos with channel metadata and compatibility aliases.
 */
async function enrichVideos(items, signal) {
  const channelMap = await getChannelMap(items.map((item) => item.snippet?.channelId), signal)
  return items.map((item) => {
    const video = mapVideo(item, channelMap.get(item.snippet?.channelId)?.avatar ?? '')
    return { ...video, channel: video.channelTitle, youtubeId: video.id }
  })
}

/**
 * Fetch popular videos, or use category search for categories without a chart.
 * @param {object} [options] Query options.
 * @param {string} [options.regionCode] ISO region; defaults to VITE_REGION_CODE or US.
 * @param {string} [options.categoryId] YouTube video category ID.
 * @param {string} [options.pageToken] Pagination token.
 * @param {number} [options.maxResults=24] Number of results, capped at 50.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<{items: object[], nextPageToken: string}>} Normalized page of videos.
 */
export async function getPopularVideos({ regionCode = DEFAULT_REGION_CODE, categoryId, pageToken, maxResults = 24, signal } = {}) {
  const category = categories.find((entry) => entry.videoCategoryId === String(categoryId))
  return getVideosByCategory({ slug: category?.slug ?? 'home', regionCode, pageToken, maxResults, signal })
}

/**
 * Fetch API categories and match the sidebar's named categories to IDs.
 * @param {string} [regionCode] ISO region; defaults to VITE_REGION_CODE or US.
 * @param {object} [options] Optional request options.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<object[]>} Sidebar categories annotated with API availability.
 */
export async function getVideoCategories(regionCode = DEFAULT_REGION_CODE, { signal } = {}) {
  const payload = await request('videoCategories', { part: 'snippet', regionCode }, signal)
  const apiCategories = new Map((payload.items ?? []).map((item) => [item.id, mapVideoCategory(item)]))
  return categories.map((category) => {
    const apiCategory = category.videoCategoryId ? apiCategories.get(category.videoCategoryId) : null
    return { ...category, apiTitle: apiCategory?.title ?? category.label, available: !category.videoCategoryId || Boolean(apiCategory), assignable: apiCategory?.assignable ?? true }
  })
}

/**
 * Fetch a category page from mostPopular, falling back to search for unsupported or empty charts.
 * @param {object} [options] Category request options.
 * @param {string} [options.slug='home'] Slug from the shared category config.
 * @param {string} [options.regionCode] ISO region; defaults to VITE_REGION_CODE or US.
 * @param {string} [options.pageToken] Pagination token.
 * @param {number} [options.maxResults=24] Number of results, capped at 50.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<{items: object[], nextPageToken: string}>} Normalized videos and next page token.
 */
export async function getVideosByCategory({ slug = 'home', regionCode = DEFAULT_REGION_CODE, pageToken, maxResults = 24, signal } = {}) {
  const category = categories.find((entry) => entry.slug === slug)
  if (!category) throw new RangeError(`Unknown video category: ${slug}`)
  const limit = Math.min(maxResults, 50)
  const cacheKey = makeCacheKey('categoryVideos', { slug, regionCode, pageToken, maxResults: limit })
  const cached = readCache(cacheKey)
  if (cached) return cached

  const searchFallback = () => searchVideos({
    query: category.searchKeyword,
    categoryId: category.videoCategoryId ?? undefined,
    pageToken,
    maxResults: limit,
    regionCode,
    order: 'viewCount',
    eventType: slug === 'live' ? 'live' : undefined,
    signal,
  })

  let result
  if (slug === 'live') {
    result = await searchFallback()
  } else {
    try {
      const payload = await request('videos', {
        part: 'snippet,contentDetails,statistics',
        chart: 'mostPopular',
        regionCode,
        videoCategoryId: category.videoCategoryId ?? undefined,
        pageToken,
        maxResults: limit,
      }, signal)
      result = payload.items?.length || slug === 'home'
        ? { items: await enrichVideos(payload.items ?? [], signal), nextPageToken: payload.nextPageToken ?? '' }
        : await searchFallback()
    } catch (error) {
      if (slug !== 'home' && error.code === 'NOT_FOUND') result = await searchFallback()
      else throw error
    }
  }

  writeCache(cacheKey, result)
  return result
}

/**
 * Prefetch a category's first page only when no fresh normalized page is cached.
 * @param {object} options Category options accepted by getVideosByCategory.
 * @returns {Promise<void>} Resolves after a quiet prefetch attempt.
 */
export async function prefetchVideosByCategory(options = {}) {
  const slug = options.slug ?? 'home'
  const regionCode = options.regionCode ?? DEFAULT_REGION_CODE
  const cacheKey = makeCacheKey('categoryVideos', { slug, regionCode, maxResults: Math.min(options.maxResults ?? 24, 50) })
  if (readCache(cacheKey)) return
  await getVideosByCategory({ ...options, slug, regionCode }).catch(() => undefined)
}

/**
 * Search videos and enrich all returned IDs in one videos.list batch.
 * @param {object} options Search options.
 * @param {string} options.query Search text.
 * @param {string} [options.pageToken] Pagination token.
 * @param {number} [options.maxResults=24] Number of results, capped at 50.
 * @param {string} [options.categoryId] Optional YouTube category restriction.
 * @param {string} [options.regionCode] ISO region restriction.
 * @param {'live'|'completed'|'upcoming'} [options.eventType] Search for live broadcast status.
 * @param {'date'|'rating'|'relevance'|'title'|'videoCount'|'viewCount'} [options.order='relevance'] Search result ordering.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<{items: object[], nextPageToken: string}>} Enriched video results.
 */
export async function searchVideos({ query, pageToken, maxResults = 24, categoryId, regionCode, eventType, order = 'relevance', signal }) {
  const page = await request('search', { part: 'snippet', type: 'video', q: query, videoCategoryId: categoryId, regionCode, eventType, order, pageToken, maxResults: Math.min(maxResults, 50) }, signal)
  const ids = (page.items ?? []).map((item) => item.id?.videoId).filter(Boolean).slice(0, 50)
  if (!ids.length) return { items: [], nextPageToken: page.nextPageToken ?? '' }
  const details = await request('videos', { part: 'snippet,contentDetails,statistics', id: ids.join(','), maxResults: ids.length }, signal)
  const searchOrder = new Map(ids.map((id, index) => [id, index]))
  const ordered = (details.items ?? []).sort((left, right) => (searchOrder.get(left.id) ?? 0) - (searchOrder.get(right.id) ?? 0))
  return { items: await enrichVideos(ordered, signal), nextPageToken: page.nextPageToken ?? '' }
}

/**
 * Fetch a single video's full snippet, duration, and statistics.
 * @param {string} id YouTube video ID.
 * @param {object} [options] Request options.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<object>} Normalized video details.
 */
export async function getVideoDetails(id, { signal } = {}) {
  const payload = await request('videos', { part: 'snippet,contentDetails,statistics', id }, signal)
  if (!payload.items?.length) throw new YoutubeApiError('NOT_FOUND', 'This video is private, removed, or unavailable.')
  const video = mapVideo(payload.items[0])
  return { ...video, channel: video.channelTitle, youtubeId: video.id }
}

/**
 * Fetch one channel's avatar, subscriber count, banner, and uploads playlist.
 * @param {string} channelId YouTube channel ID.
 * @param {object} [options] Request options.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<object>} Normalized channel profile.
 */
export async function getChannelDetails(channelId, { signal } = {}) {
  const channelMap = await getChannelMap([channelId], signal)
  const channel = channelMap.get(channelId)
  if (!channel) throw new YoutubeApiError('NOT_FOUND', 'This channel was not found.')
  return channel
}

/**
 * Resolve channel IDs in batches of no more than 50.
 * @param {string[]} channelIds YouTube channel IDs.
 * @param {object} [options] Request options.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<object[]>} Normalized channel profiles.
 */
export async function getChannelsDetails(channelIds, { signal } = {}) {
  const ids = [...new Set(channelIds.filter(Boolean))]
  const channels = []
  for (let index = 0; index < ids.length; index += 50) {
    const channelMap = await getChannelMap(ids.slice(index, index + 50), signal)
    channels.push(...channelMap.values())
  }
  return channels
}

/**
 * Fetch a page of comments for a video.
 * @param {object} options Comment query options.
 * @param {string} options.videoId YouTube video ID.
 * @param {string} [options.pageToken] Pagination token.
 * @param {'relevance'|'time'} [options.order='relevance'] Comment ordering.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<{items: object[], nextPageToken: string}>} Normalized comments.
 */
export async function getVideoComments({ videoId, pageToken, order = 'relevance', signal }) {
  const payload = await request('commentThreads', { part: 'snippet', videoId, pageToken, order, maxResults: 20, textFormat: 'plainText' }, signal)
  return { items: (payload.items ?? []).map(mapComment), nextPageToken: payload.nextPageToken ?? '' }
}

/**
 * Search for related videos using the selected video's title and available tags.
 * @param {string} videoId YouTube video ID.
 * @param {object} [options] Request options.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<object[]>} Related normalized videos.
 */
export async function getRelatedVideos(videoId, { signal } = {}) {
  const video = await getVideoDetails(videoId, { signal })
  const tags = video.tags.slice(0, 3).join(' ')
  const result = await searchVideos({ query: tags ? `${video.title} ${tags}` : video.title, maxResults: 12, signal })
  return result.items.filter((item) => item.id !== videoId)
}

/**
 * Fetch a channel's uploads playlist and enrich its videos in 50-ID batches.
 * @param {string} channelId YouTube channel ID.
 * @param {string} [pageToken] Playlist page token.
 * @param {object} [options] Request options.
 * @param {AbortSignal} [options.signal] Request cancellation signal.
 * @returns {Promise<{items: object[], nextPageToken: string}>} Normalized channel uploads.
 */
export async function getChannelVideos(channelId, pageToken, { signal } = {}) {
  const channel = await getChannelDetails(channelId, { signal })
  if (!channel.uploadsPlaylistId) throw new YoutubeApiError('NOT_FOUND', 'This channel has no public uploads playlist.')
  const playlist = await request('playlistItems', { part: 'snippet,contentDetails', playlistId: channel.uploadsPlaylistId, pageToken, maxResults: 50 }, signal)
  const ids = (playlist.items ?? []).map((item) => item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId).filter(Boolean).slice(0, 50)
  if (!ids.length) return { items: [], nextPageToken: playlist.nextPageToken ?? '' }
  const details = await request('videos', { part: 'snippet,contentDetails,statistics', id: ids.join(','), maxResults: ids.length }, signal)
  return { items: await enrichVideos(details.items ?? [], signal), nextPageToken: playlist.nextPageToken ?? '' }
}