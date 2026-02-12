import { useState, useMemo } from 'react';
import './StatisticsModal.css';

function StatisticsModal({ isOpen, onClose, trades }) {
  // Date range state - default to last 30 days
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Filter trades by date range
  const filteredTrades = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return trades
      .filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= start && tradeDate <= end;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [trades, startDate, endDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredTrades.length === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        tradeCount: 0,
        avgPnL: 0,
        biggestWin: null,
        biggestLoss: null,
        mostTraded: null,
        leastTraded: null,
        cumulativePnL: []
      };
    }

    const wins = filteredTrades.filter(t => t.pnl > 0);
    const losses = filteredTrades.filter(t => t.pnl < 0);
    const totalPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    // Biggest win/loss
    const biggestWin = wins.length > 0
      ? wins.reduce((max, t) => t.pnl > max.pnl ? t : max, wins[0])
      : null;
    const biggestLoss = losses.length > 0
      ? losses.reduce((min, t) => t.pnl < min.pnl ? t : min, losses[0])
      : null;

    // Pair frequency
    const pairCounts = {};
    filteredTrades.forEach(t => {
      pairCounts[t.pair] = (pairCounts[t.pair] || 0) + 1;
    });
    const pairEntries = Object.entries(pairCounts);
    const mostTraded = pairEntries.length > 0
      ? pairEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max)
      : null;
    const leastTraded = pairEntries.length > 0
      ? pairEntries.reduce((min, entry) => entry[1] < min[1] ? entry : min)
      : null;

    // Cumulative P&L for chart
    let cumulative = 0;
    const cumulativePnL = filteredTrades.map(t => {
      cumulative += t.pnl || 0;
      return {
        date: new Date(t.date),
        pnl: t.pnl,
        cumulative
      };
    });

    return {
      totalPnL,
      winRate: (wins.length / filteredTrades.length) * 100,
      tradeCount: filteredTrades.length,
      avgPnL: totalPnL / filteredTrades.length,
      biggestWin,
      biggestLoss,
      mostTraded: mostTraded ? { pair: mostTraded[0], count: mostTraded[1] } : null,
      leastTraded: leastTraded ? { pair: leastTraded[0], count: leastTraded[1] } : null,
      cumulativePnL
    };
  }, [filteredTrades]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content statistics-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Statistics</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Date Range Filter */}
        <div className="date-filter">
          <div className="date-input-group">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="date-input-group">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total P&L</span>
            <span className={`stat-value ${stats.totalPnL >= 0 ? 'profit' : 'loss'}`}>
              {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">{stats.winRate.toFixed(1)}%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Trades</span>
            <span className="stat-value">{stats.tradeCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Avg P&L/Trade</span>
            <span className={`stat-value ${stats.avgPnL >= 0 ? 'profit' : 'loss'}`}>
              {stats.avgPnL >= 0 ? '+' : ''}${stats.avgPnL.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Biggest Win/Loss */}
        <div className="extremes-section">
          <div className="extreme-card win">
            <span className="extreme-label">Biggest Win</span>
            {stats.biggestWin ? (
              <>
                <span className="extreme-pair">{stats.biggestWin.pair}</span>
                <span className="extreme-value profit">+${stats.biggestWin.pnl.toFixed(2)}</span>
                <span className="extreme-date">
                  {new Date(stats.biggestWin.date).toLocaleDateString()}
                </span>
              </>
            ) : <span className="no-data">No wins</span>}
          </div>
          <div className="extreme-card loss">
            <span className="extreme-label">Biggest Loss</span>
            {stats.biggestLoss ? (
              <>
                <span className="extreme-pair">{stats.biggestLoss.pair}</span>
                <span className="extreme-value loss">${stats.biggestLoss.pnl.toFixed(2)}</span>
                <span className="extreme-date">
                  {new Date(stats.biggestLoss.date).toLocaleDateString()}
                </span>
              </>
            ) : <span className="no-data">No losses</span>}
          </div>
        </div>

        {/* Most/Least Traded Pairs */}
        <div className="pairs-section">
          <div className="pair-stat">
            <span className="pair-label">Most Traded</span>
            {stats.mostTraded ? (
              <span className="pair-value">{stats.mostTraded.pair} ({stats.mostTraded.count})</span>
            ) : <span className="no-data">-</span>}
          </div>
          <div className="pair-stat">
            <span className="pair-label">Least Traded</span>
            {stats.leastTraded ? (
              <span className="pair-value">{stats.leastTraded.pair} ({stats.leastTraded.count})</span>
            ) : <span className="no-data">-</span>}
          </div>
        </div>

        {/* Cumulative P&L Chart */}
        <div className="chart-section">
          <h3 className="section-title">Cumulative P&L</h3>
          <PnLChart data={stats.cumulativePnL} />
        </div>
      </div>
    </div>
  );
}

// SVG Chart Component
function PnLChart({ data }) {
  if (data.length === 0) {
    return <div className="chart-empty">No trades in selected period</div>;
  }

  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const values = data.map(d => d.cumulative);
  const minY = Math.min(0, ...values);
  const maxY = Math.max(0, ...values);
  const yRange = maxY - minY || 1;

  // Add 10% padding to Y range
  const yPadding = yRange * 0.1;
  const yMin = minY - yPadding;
  const yMax = maxY + yPadding;

  const scaleY = (value) => {
    return padding.top + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;
  };

  const scaleX = (index) => {
    if (data.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  // Generate polyline points
  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.cumulative)}`).join(' ');

  // Zero line Y position
  const zeroY = scaleY(0);

  // Y-axis labels (5 ticks)
  const yTicks = [];
  for (let i = 0; i <= 4; i++) {
    const value = yMin + (yMax - yMin) * (i / 4);
    yTicks.push({ value, y: scaleY(value) });
  }

  return (
    <div className="pnl-chart-container">
      <svg viewBox={`0 0 ${width} ${height}`} className="pnl-chart">
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={tick.y}
            x2={width - padding.right}
            y2={tick.y}
            className="grid-line"
          />
        ))}

        {/* Zero line */}
        <line
          x1={padding.left}
          y1={zeroY}
          x2={width - padding.right}
          y2={zeroY}
          className="zero-line"
        />

        {/* P&L line */}
        <polyline
          points={points}
          className="pnl-line"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(d.cumulative)}
            r="4"
            className={`data-point ${d.cumulative >= 0 ? 'positive' : 'negative'}`}
          >
            <title>{`${d.date.toLocaleDateString()}: ${d.cumulative >= 0 ? '+' : ''}$${d.cumulative.toFixed(2)}`}</title>
          </circle>
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={padding.left - 8}
            y={tick.y + 4}
            className="axis-label y-label"
          >
            ${tick.value.toFixed(0)}
          </text>
        ))}

        {/* X-axis labels */}
        {data.length > 0 && (
          <>
            <text
              x={padding.left}
              y={height - 8}
              className="axis-label x-label"
            >
              {data[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
            {data.length > 1 && (
              <text
                x={width - padding.right}
                y={height - 8}
                className="axis-label x-label end"
              >
                {data[data.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}

export default StatisticsModal;
