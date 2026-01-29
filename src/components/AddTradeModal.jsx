import { useState, useEffect } from 'react';
import './AddTradeModal.css';

function AddTradeModal({ isOpen, onClose, onAddTrade }) {
  const [date, setDate] = useState('');
  const [pair, setPair] = useState('EUR/USD');
  const [direction, setDirection] = useState('Long');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [calculatedPnL, setCalculatedPnL] = useState(null);

  const forexPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
    'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP',
    'GBP/JPY', 'EUR/JPY', 'AUD/JPY', 'XAU/USD'
  ];

  // Pip size for each pair
  const pipSizes = {
    'EUR/USD': 0.0001,
    'GBP/USD': 0.0001,
    'AUD/USD': 0.0001,
    'NZD/USD': 0.0001,
    'USD/JPY': 0.01,
    'USD/CHF': 0.0001,
    'USD/CAD': 0.0001,
    'EUR/GBP': 0.0001,
    'GBP/JPY': 0.01,
    'EUR/JPY': 0.01,
    'AUD/JPY': 0.01,
    'XAU/USD': 0.10, // Gold: 1 pip = $0.10 movement
  };

  // Pip value per standard lot (100,000 units) in USD
  const pipValuePerStandardLot = {
    'EUR/USD': 10,
    'GBP/USD': 10,
    'AUD/USD': 10,
    'NZD/USD': 10,
    'USD/JPY': 9.09,
    'USD/CHF': 10.20,
    'USD/CAD': 7.69,
    'EUR/GBP': 12.50,
    'GBP/JPY': 9.09,
    'EUR/JPY': 9.09,
    'AUD/JPY': 9.09,
    'XAU/USD': 10, // Gold: $10 per pip per standard lot (100 oz)
  };

  // Calculate P&L automatically
  useEffect(() => {
    if (entry && exit && lotSize && pair) {
      const entryPrice = parseFloat(entry);
      const exitPrice = parseFloat(exit);
      const lots = parseFloat(lotSize);

      const pipSize = pipSizes[pair] || 0.0001;
      const pipValue = pipValuePerStandardLot[pair] || 10;

      // Calculate pips difference
      let pips = (exitPrice - entryPrice) / pipSize;

      // If short, reverse the sign
      if (direction === 'Short') {
        pips = -pips;
      }

      // Calculate P&L in USD
      const pnl = pips * pipValue * lots;

      setCalculatedPnL(pnl);
    } else {
      setCalculatedPnL(null);
    }
  }, [entry, exit, lotSize, pair, direction]);

  // Set default date to today when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setPair('EUR/USD');
      setDirection('Long');
      setEntry('');
      setExit('');
      setLotSize('');
      setCalculatedPnL(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!date || !pair || !entry || !exit || !lotSize) {
      alert('Please fill in all fields');
      return;
    }

    if (calculatedPnL === null) {
      alert('Unable to calculate P&L. Please check your inputs.');
      return;
    }

    // Create date at noon local time to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const tradeDate = new Date(year, month - 1, day, 12, 0, 0);

    const newTrade = {
      date: tradeDate,
      pair,
      direction,
      entry,
      exit,
      lotSize,
      pnl: parseFloat(calculatedPnL.toFixed(2)),
      type: calculatedPnL >= 0 ? 'win' : 'loss',
      comments: ''
    };

    onAddTrade(newTrade);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-trade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Trade</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-trade-form">
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Currency Pair</label>
              <select
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="form-input"
                required
              >
                {forexPairs.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="form-input"
                required
              >
                <option value="Long">Long (Buy)</option>
                <option value="Short">Short (Sell)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Entry Price</label>
              <input
                type="number"
                step="0.00001"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="1.0850"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Exit Price</label>
              <input
                type="number"
                step="0.00001"
                value={exit}
                onChange={(e) => setExit(e.target.value)}
                placeholder="1.0900"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Lot Size</label>
              <input
                type="number"
                step="0.01"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                placeholder="0.5"
                className="form-input"
                required
              />
            </div>
          </div>

          {calculatedPnL !== null && (
            <div className="calculated-pnl">
              <span className="pnl-label">Calculated P&L:</span>
              <span className={`pnl-value ${calculatedPnL >= 0 ? 'profit' : 'loss'}`}>
                {calculatedPnL >= 0 ? '+' : ''}${calculatedPnL.toFixed(2)}
              </span>
            </div>
          )}

          <button type="submit" className="submit-btn">
            Add Trade
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTradeModal;
