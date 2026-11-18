/**
 * Select the highest-resolution thumbnail returned by YouTube.
 * @param {Record<string, {url: string}>} thumbnails YouTube thumbnail variants.
 * @returns {string} The highest available thumbnail URL.
 */
export function highestThumbnail(thumbnails = {}) {
  return thumbnails.maxres?.url ?? thumbnails.high?.url ?? thumbnails.medium?.url ?? thumbnails.standard?.url ?? thumbnails.default?.url ?? ''
}

/**
 * Convert an ISO 8601 duration into a player-friendly label.
 * @param {string} isoDuration An ISO duration such as PT4M13S.
 * @returns {string} A duration such as 4:13 or 1:04:13.
 */
export function formatIsoDuration(isoDuration = '') {
  const match = isoDuration.match(/^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!match) return ''
  const hours = Number(match[2] ?? 0) + Number(match[1] ?? 0) * 24
  const minutes = Number(match[3] ?? 0)
  const seconds = String(Number(match[4] ?? 0)).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`
}

/**
 * Normalize a videos.list or search.list result to VidTube's video shape.
 * @param {object} item Raw YouTube video resource.
 * @param {string} [channelAvatar] Resolved channel avatar URL.
 * @returns {object} Normalized video data.
 */
export function mapVideo(item, channelAvatar = '') {
  const snippet = item.snippet ?? {}
  return {
    id: typeof item.id === 'string' ? item.id : item.id?.videoId ?? '',
    title: snippet.title ?? '',
    thumbnail: highestThumbnail(snippet.thumbnails),
    channelId: snippet.channelId ?? '',
    channelTitle: snippet.channelTitle ?? '',
    channelAvatar,
    views: Number(item.statistics?.viewCount ?? 0),
    likeCount: Number(item.statistics?.likeCount ?? 0),
    publishedAt: snippet.publishedAt ?? '',
    duration: formatIsoDuration(item.contentDetails?.duration ?? ''),
    description: snippet.description ?? '',
    tags: snippet.tags ?? [],
    categoryId: snippet.categoryId ?? '',
  }
}

/**
 * Normalize a channels.list result.
 * @param {object} item Raw YouTube channel resource.
 * @returns {object} Channel profile and upload playlist metadata.
 */
export function mapChannel(item) {
  const snippet = item.snippet ?? {}
  return {
    id: item.id ?? '',
    title: snippet.title ?? '',
    description: snippet.description ?? '',
    avatar: highestThumbnail(snippet.thumbnails),
    subscriberCount: Number(item.statistics?.subscriberCount ?? 0),
    videoCount: Number(item.statistics?.videoCount ?? 0),
    banner: item.brandingSettings?.image?.bannerExternalUrl ?? '',
    uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads ?? '',
  }
}

/**
 * Normalize a commentThreads.list result.
 * @param {object} thread Raw YouTube comment thread resource.
 * @returns {object} Top-level comment data.
 */
export function mapComment(thread) {
  const comment = thread.snippet?.topLevelComment
  const snippet = comment?.snippet ?? {}
  return {
    id: comment?.id ?? thread.id ?? '',
    text: snippet.textDisplay ?? snippet.textOriginal ?? '',
    author: snippet.authorDisplayName ?? 'YouTube user',
    authorAvatar: snippet.authorProfileImageUrl ?? '',
    likeCount: Number(snippet.likeCount ?? 0),
    publishedAt: snippet.publishedAt ?? '',
    replyCount: Number(thread.snippet?.totalReplyCount ?? 0),
  }
}

/**
 * Normalize a videoCategories.list result.
 * @param {object} item Raw YouTube video category.
 * @returns {{id: string, title: string, assignable: boolean}} Category metadata.
 */
export function mapVideoCategory(item) {
  return { id: item.id, title: item.snippet?.title ?? '', assignable: item.snippet?.assignable !== false }
}