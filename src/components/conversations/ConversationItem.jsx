import { ChannelBadge } from '../common/ChannelBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatTimestamp, truncate } from '../../utils/format';

export function ConversationItem({ conv, isSelected, onClick }) {
  return (
    <div className={`conv-item${isSelected ? ' selected' : ''}`} onClick={onClick}>
      <div className="conv-item-header">
        <ChannelBadge channel={conv.channel} />
        <span className="conv-item-time">{formatTimestamp(conv.timestamp)}</span>
      </div>
      <div className="conv-item-preview">
        {conv.summarised_data ? truncate(conv.summarised_data, 100) : <em style={{ color: '#aaa' }}>Summary pending...</em>}
      </div>
      <StatusBadge status={conv.processing_status} />
    </div>
  );
}
