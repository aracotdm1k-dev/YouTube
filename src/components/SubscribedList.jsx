import PropTypes from 'prop-types'
import { channels } from '../data/channels.js'

function SubscribedList({ subscribedIds }) {
  const subscribed = channels.filter((channel) => subscribedIds.includes(channel.id))
  return <section className="subscribed-section" aria-label="Subscribed channels"><h2>Subscribed</h2>{subscribed.map((channel) => <div className="subscription-row" key={channel.id} title={channel.name}><img src={channel.avatar} alt="" /><span>{channel.name}</span>{channel.verified && <span className="verified-dot" aria-label="Verified">✓</span>}</div>)}{!subscribed.length && <p className="subscription-empty">No subscriptions yet</p>}</section>
}
SubscribedList.propTypes = { subscribedIds: PropTypes.arrayOf(PropTypes.string).isRequired }
export default SubscribedList