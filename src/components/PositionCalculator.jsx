import { useState } from 'react';
import './PositionCalculator.css';

function PositionCalculator() {
  const [accountSize, setAccountSize] = useState('');
  const [riskPercent, setRiskPercent] = useState('1');
  const [stopLossPips, setStopLossPips] = useState('');
  const [pair, setPair] = useState('EUR/USD');

  // Sorted alphabetically
  const forexPairs = [
    'AUD/JPY', 'AUD/USD', 'EUR/GBP', 'EUR/JPY', 'EUR/USD',
    'GBP/JPY', 'GBP/USD', 'NZD/USD', 'USD/CAD', 'USD/CHF',
    'USD/CNY', 'USD/JPY', 'XAU/USD'
  ];

  // Pip values per standard lot (100,000 units) in USD
  // For XXX/USD pairs: $10 per pip
  // For USD/XXX pairs: $10 / exchange rate (approximate)
  // For XXX/JPY pairs: ~$6.67 per pip (100,000 / 150 JPY rate)
  const pipValuePerStandardLot = {
    'AUD/JPY': 6.67,
    'AUD/USD': 10,
    'EUR/GBP': 12.50,
    'EUR/JPY': 6.67,
    'EUR/USD': 10,
    'GBP/JPY': 6.67,
    'GBP/USD': 10,
    'NZD/USD': 10,
    'USD/CAD': 7.35,
    'USD/CHF': 11.36,
    'USD/CNY': 1.37,
    'USD/JPY': 6.67,
    'XAU/USD': 10,
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
