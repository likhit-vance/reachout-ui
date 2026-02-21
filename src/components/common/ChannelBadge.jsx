export function ChannelBadge({ channel }) {
  return <span className={`channel-badge channel-${channel}`}>{channel}</span>;
}
