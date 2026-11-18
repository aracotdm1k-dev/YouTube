import { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { IoTrashOutline } from 'react-icons/io5'
import { getVideoComments } from '../api/youtube.js'
import useFetch from '../hooks/useFetch.js'

function CommentSection({ videoId }) {
  const { data, loading } = useFetch(useCallback((signal) => getVideoComments({ videoId, signal }), [videoId]), [videoId])
  const apiComments = data?.items ?? []
  const [comments, setComments] = useState([])
  const [draft, setDraft] = useState('')
  const submitComment = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setComments((current) => [{ id: `${videoId}-${Date.now()}`, author: 'You', text }, ...current])
    setDraft('')
  }
  const combinedComments = [...comments, ...apiComments]
  return <section className="comments-section" aria-labelledby="comments-heading"><h2 id="comments-heading">{combinedComments.length} Comments</h2><form className="comment-form" onSubmit={submitComment}><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces" alt="" /><label className="visually-hidden" htmlFor="comment-input">Add a comment</label><input id="comment-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a comment..." /><button type="submit" disabled={!draft.trim()}>Comment</button></form>{loading && <p className="api-loading" role="status">Loading comments…</p>}<ul className="comment-list">{combinedComments.map((comment) => <li className="comment-item" key={comment.id}><span className="comment-avatar">{comment.author === 'You' ? 'Y' : (comment.author?.[0] ?? 'V')}</span><div className="comment-body"><strong>{comment.author}</strong><p>{comment.text}</p></div>{comment.author === 'You' && <button className="icon-button comment-delete" type="button" aria-label="Delete your comment" onClick={() => setComments((current) => current.filter((entry) => entry.id !== comment.id))}><IoTrashOutline /></button>}</li>)}</ul></section>
}
CommentSection.propTypes = { videoId: PropTypes.string.isRequired }
export default CommentSection