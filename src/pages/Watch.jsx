import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IoCheckmarkCircle, IoShareSocialOutline, IoThumbsDownOutline, IoThumbsUpOutline } from 'react-icons/io5'
import { useAppContext } from '../context/useAppContext.js'
import { getChannelDetails, getVideoDetails } from '../api/youtube.js'
import useFetch from '../hooks/useFetch.js'
import { channels } from '../data/channels.js'
import { videos } from '../data/videos.js'
import formatViews from '../utils/formatViews.js'
import timeAgo from '../utils/timeAgo.js'
import CommentSection from '../components/CommentSection.jsx'
import RecommendedList from '../components/RecommendedList.jsx'
import VideoPlayer from '../components/VideoPlayer.jsx'
import NotFound from './NotFound.jsx'

function Watch() {
  const { id } = useParams()
  const fallbackVideo = videos.find((entry) => entry.id === id || entry.youtubeId === id)
  const apiVideoId = fallbackVideo?.youtubeId ?? id
  const fetchVideo = useCallback(async (signal) => {
    const video = await getVideoDetails(apiVideoId, { signal })
    let channel = null
    if (video.channelId) {
      try { channel = await getChannelDetails(video.channelId, { signal }) } catch { /* Video details remain usable if channel lookup fails. */ }
    }
    return { video: { ...video, channel: video.channelTitle, channelAvatar: channel?.avatar ?? '' }, channel }
  }, [apiVideoId])
  const { data, loading, error } = useFetch(fetchVideo, [apiVideoId])
  const video = data?.video ?? fallbackVideo
  const apiChannel = data?.channel
  const { subscribedChannelIds, setSubscribedChannelIds } = useAppContext()
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [reaction, setReaction] = useState('')
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => { document.title = video ? `${video.title} - VidTube` : 'Watch - VidTube' }, [video])

  if (!fallbackVideo && loading) return <div className="api-loading" role="status">Loading video…</div>
  if (!video) return <NotFound />
  const channel = apiChannel ?? channels.find((entry) => entry.id === video.channelId)
  const subscribed = subscribedChannelIds.includes(video.channelId)
  const toggleSubscription = () => setSubscribedChannelIds((current) => subscribed ? current.filter((channelId) => channelId !== video.channelId) : [...current, video.channelId])
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShareMessage('Link copied') }
    catch { setShareMessage('Copy the link from your address bar') }
    window.setTimeout(() => setShareMessage(''), 2200)
  }
  return <div className="watch-layout"><div className="watch-primary">{error?.code === 'KEY_INVALID' && <p className="api-notice" role="status">Showing sample video details; YouTube API is not configured</p>}<VideoPlayer youtubeId={video.youtubeId ?? video.id} title={video.title} /><h1 className="watch-title">{video.title}</h1><div className="watch-toolbar"><Link className="watch-channel" to={`/search?q=${encodeURIComponent(video.channelTitle ?? video.channel ?? '')}`}><img src={channel?.avatar ?? video.channelAvatar} alt="" /><span><strong>{channel?.title ?? video.channelTitle ?? video.channel}</strong><small>{channel?.handle ?? ''}</small></span><IoCheckmarkCircle aria-label="Verified" /></Link><button className={`subscribe-button ${subscribed ? 'subscribe-button--active' : ''}`} type="button" onClick={toggleSubscription}>{subscribed ? 'Subscribed' : 'Subscribe'}</button><div className="watch-actions"><div className="reaction-group" aria-label="Video reactions"><button className={reaction === 'like' ? 'is-selected' : ''} type="button" aria-label="Like video" onClick={() => setReaction(reaction === 'like' ? '' : 'like')}><IoThumbsUpOutline /><span>Like</span></button><span className="action-divider" /><button className={reaction === 'dislike' ? 'is-selected' : ''} type="button" aria-label="Dislike video" onClick={() => setReaction(reaction === 'dislike' ? '' : 'dislike')}><IoThumbsDownOutline /></button></div><button className="share-button" type="button" onClick={share}><IoShareSocialOutline /><span>Share</span></button>{shareMessage && <span className="share-feedback" role="status">{shareMessage}</span>}</div></div><div className="video-description"><p className="description-metadata">{formatViews(video.views)} views <span>•</span> {timeAgo(video.publishedAt)}</p><p>{video.description}</p>{descriptionOpen && <p>Subscribe for more videos, new releases, and weekly highlights.</p>}<button type="button" onClick={() => setDescriptionOpen((open) => !open)}>{descriptionOpen ? 'Show less' : 'Show more'}</button></div><CommentSection videoId={video.youtubeId ?? video.id} /></div><RecommendedList currentVideoId={video.youtubeId ?? video.id} /></div>
}
export default Watch