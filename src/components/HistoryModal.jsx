import { useState, useMemo } from 'react';
import './HistoryModal.css';

function HistoryModal({ isOpen, onClose, trades }) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc'); // desc = newest first

  const sortedTrades = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    return [...trades].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'pair':
          comparison = (a.pair || '').localeCompare(b.pair || '');
          break;
        case 'pnl':
          comparison = (a.pnl || 0) - (b.pnl || 0);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [trades, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set default direction
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content history-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Trade History</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="history-summary">
          <span className="trade-count">{trades.length} trades total</span>
        </div>

        {trades.length === 0 ? (
          <div className="no-trades">No trades recorded yet</div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('date')} className="sortable">
                    Date <span className="sort-icon">{getSortIcon('date')}</span>
                  </th>
                  <th onClick={() => handleSort('pair')} className="sortable">
                    Pair <span className="sort-icon">{getSortIcon('pair')}</span>
                  </th>
                  <th>Direction</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Lots</th>
                  <th onClick={() => handleSort('pnl')} className="sortable">
                    P&L <span className="sort-icon">{getSortIcon('pnl')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td className="date-cell">{formatDate(trade.date)}</td>
                    <td className="pair-cell">{trade.pair}</td>
                    <td className={`direction-cell ${trade.direction?.toLowerCase()}`}>
                      {trade.direction}
                    </td>
                    <td className="price-cell">{trade.entry}</td>
                    <td className="price-cell">{trade.exit}</td>
                    <td className="lots-cell">{trade.lotSize}</td>
                    <td className={`pnl-cell ${(trade.pnl || 0) >= 0 ? 'profit' : 'loss'}`}>
                      {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryModal;
