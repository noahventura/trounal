import { useState, useEffect } from 'react';
import './TradeModal.css';

function TradeModal({ isOpen, onClose, date, trades }) {
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [comments, setComments] = useState('');

  // Reset modal state when opening or when date changes
  useEffect(() => {
    if (isOpen) {
      setSelectedTrade(null);
      setScreenshot(null);
      setComments('');
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
    setScreenshot(null);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackToList = () => {
    setSelectedTrade(null);
    setScreenshot(null);
    setComments('');
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
                {totalPnL >= 0 ? '+' : ''}{totalPnL}
              </span>
            </div>

            <div className="trades-items">
              {trades.map((trade, idx) => (
                <div
                  key={idx}
                  className={`trade-item ${trade.pnl >= 0 ? 'profit' : 'loss'}`}
                  onClick={() => handleTradeClick(trade)}
                >
                  <span className="trade-pair">{trade.pair}</span>
                  <span className="trade-pnl">
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="trade-details">
            <button className="back-btn" onClick={handleBackToList}>
              ← Back to list
            </button>

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

            <div className="screenshot-section">
              <label className="section-label">Screenshot</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="file-input"
                id="screenshot-upload"
              />
              <label htmlFor="screenshot-upload" className="upload-btn">
                {screenshot ? 'Change Screenshot' : 'Upload Screenshot'}
              </label>
              {screenshot && (
                <div className="screenshot-preview">
                  <img src={screenshot} alt="Trade screenshot" />
                </div>
              )}
            </div>

            <div className="comments-section">
              <label className="section-label">Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your notes about this trade..."
                className="comments-textarea"
                rows="6"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradeModal;
