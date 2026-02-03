import { useState, useEffect } from 'react';
import './TradeModal.css';

function TradeModal({ isOpen, onClose, date, trades, onDeleteTrade, onUpdateTrade }) {
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [comments, setComments] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset modal state when opening or when date changes
  useEffect(() => {
    if (isOpen) {
      setSelectedTrade(null);
      setComments('');
      setHasChanges(false);
    }
  }, [isOpen, date]);

  if (!isOpen) return null;

  const dateStr = date?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleTradeClick = (trade) => {
    setSelectedTrade(trade);
    setComments(trade.comments || '');
    setHasChanges(false);
  };

  const handleCommentsChange = (e) => {
    setComments(e.target.value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedTrade || !onUpdateTrade) return;

    setIsSaving(true);
    try {
      await onUpdateTrade(selectedTrade.id, { comments });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Failed to save. Please try again.');
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedTrade || !onDeleteTrade) return;

    if (window.confirm('Are you sure you want to delete this trade?')) {
      try {
        await onDeleteTrade(selectedTrade.id);
        setSelectedTrade(null);
        // If this was the last trade, close the modal
        if (trades.length === 1) {
          onClose();
        }
      } catch (error) {
        console.error('Error deleting trade:', error);
        alert('Failed to delete. Please try again.');
      }
    }
  };

  const handleBackToList = () => {
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Discard them?')) {
        return;
      }
    }
    setSelectedTrade(null);
    setComments('');
    setHasChanges(false);
  };

  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{dateStr}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!selectedTrade ? (
          <div className="trades-list">
            <div className="day-summary">
              <span className="summary-label">Total P&L:</span>
              <span className={`summary-value ${totalPnL >= 0 ? 'profit' : 'loss'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </span>
            </div>

            <div className="trades-items">
              {trades.map((trade, idx) => (
                <div
                  key={trade.id || idx}
                  className={`trade-item ${trade.pnl >= 0 ? 'profit' : 'loss'}`}
                  onClick={() => handleTradeClick(trade)}
                >
                  <span className="trade-pair">{trade.pair}</span>
                  <span className="trade-pnl">
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="trade-details">
            <div className="details-header">
              <button className="back-btn" onClick={handleBackToList}>
                ← Back to list
              </button>
              <button className="delete-trade-btn" onClick={handleDelete}>
                Delete Trade
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <label>Pair</label>
                <span>{selectedTrade.pair}</span>
              </div>
              <div className="detail-item">
                <label>Direction</label>
                <span>{selectedTrade.direction || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Entry</label>
                <span>{selectedTrade.entry || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Exit</label>
                <span>{selectedTrade.exit || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Lot Size</label>
                <span>{selectedTrade.lotSize || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>P&L</label>
                <span className={selectedTrade.pnl >= 0 ? 'profit-text' : 'loss-text'}>
                  {selectedTrade.pnl >= 0 ? '+' : ''}${selectedTrade.pnl}
                </span>
              </div>
            </div>

            <div className="comments-section">
              <label className="section-label">Comments</label>
              <textarea
                value={comments}
                onChange={handleCommentsChange}
                placeholder="Add your notes about this trade..."
                className="comments-textarea"
                rows="4"
              />
            </div>

            <button
              className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradeModal;
