import { useState } from 'react';
import './PositionCalculator.css';

function PositionCalculator() {
  const [accountSize, setAccountSize] = useState('');
  const [riskPercent, setRiskPercent] = useState('1');
  const [stopLossPips, setStopLossPips] = useState('');
  const [pair, setPair] = useState('EUR/USD');

  const forexPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
    'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP',
    'GBP/JPY', 'EUR/JPY', 'AUD/JPY', 'XAU/USD'
  ];

  // Pip values per standard lot (100,000 units)
  // For pairs where USD is the quote currency (XXX/USD), 1 pip = $10
  // For pairs where USD is base currency (USD/XXX), it varies
  // For JPY pairs, 1 pip = $10 approximately (varies slightly with price)
  const pipValuePerStandardLot = {
    'EUR/USD': 10,
    'GBP/USD': 10,
    'AUD/USD': 10,
    'NZD/USD': 10,
    'USD/JPY': 9.09, // Approximate, varies with price
    'USD/CHF': 10.20, // Approximate, varies with price
    'USD/CAD': 7.69, // Approximate, varies with price
    'EUR/GBP': 12.50, // Approximate
    'GBP/JPY': 9.09, // Approximate
    'EUR/JPY': 9.09, // Approximate
    'AUD/JPY': 9.09, // Approximate
    'XAU/USD': 10, // Gold
  };

  const calculatePosition = () => {
    if (!accountSize || !stopLossPips) return null;

    const account = parseFloat(accountSize);
    const risk = parseFloat(riskPercent);
    const slPips = parseFloat(stopLossPips);

    // Calculate risk amount in dollars
    const riskAmount = (account * risk) / 100;

    // Get pip value for selected pair
    const pipValue = pipValuePerStandardLot[pair] || 10;

    // Calculate lot size
    // Formula: Lot size = Risk amount / (Stop loss in pips × Pip value)
    const lotSize = riskAmount / (slPips * pipValue);

    // Position size in units
    const positionSize = lotSize * 100000;

    return {
      riskAmount: riskAmount.toFixed(2),
      lotSize: lotSize.toFixed(2),
      positionSize: positionSize.toFixed(0),
      pipValue: pipValue.toFixed(2),
    };
  };

  const result = calculatePosition();

  return (
    <div className="position-calculator">
      <h2 className="calculator-title">Position Calculator</h2>

      <div className="calculator-form">
        <div className="form-group">
          <label>Forex Pair</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="calculator-input"
          >
            {forexPairs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Account Size ($)</label>
          <input
            type="number"
            value={accountSize}
            onChange={(e) => setAccountSize(e.target.value)}
            placeholder="10000"
            className="calculator-input"
          />
        </div>

        <div className="form-group">
          <label>Risk (%)</label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            placeholder="1"
            step="0.1"
            className="calculator-input"
          />
        </div>

        <div className="form-group">
          <label>Stop Loss (pips)</label>
          <input
            type="number"
            value={stopLossPips}
            onChange={(e) => setStopLossPips(e.target.value)}
            placeholder="50"
            step="0.1"
            className="calculator-input"
          />
        </div>
      </div>

      {result && (
        <div className="calculator-results">
          <h3 className="results-title">Results</h3>
          <div className="result-item">
            <span className="result-label">Risk Amount:</span>
            <span className="result-value">${result.riskAmount}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Pip Value:</span>
            <span className="result-value">${result.pipValue}/pip</span>
          </div>
          <div className="result-item highlight">
            <span className="result-label">Lot Size:</span>
            <span className="result-value">{result.lotSize} lots</span>
          </div>
          <div className="result-item">
            <span className="result-label">Position Size:</span>
            <span className="result-value">{result.positionSize} units</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PositionCalculator;
