import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './TradeCalendar.css';

function TradeCalendar({ trades, onDateClick }) {
  const [value, setValue] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const onChange = (date) => {
    setValue(date);
    const dateStr = date.toDateString();
    const tradesOnDate = trades.filter(trade =>
      new Date(trade.date).toDateString() === dateStr
    );
    onDateClick(date, tradesOnDate);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      const tradesOnDate = trades.filter(trade =>
        new Date(trade.date).toDateString() === dateStr
      );

      if (tradesOnDate.length > 0) {
        const totalPnL = tradesOnDate.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
        const profitClass = totalPnL >= 0 ? 'profit' : 'loss';

        // If more than 2 trades, show count
        if (tradesOnDate.length > 2) {
          return (
            <div className="trade-indicator">
              <div className={`trade-count ${profitClass}`}>
                {tradesOnDate.length} trades
              </div>
            </div>
          );
        }

        // Otherwise show individual trades
        return (
          <div className="trade-indicator">
            {tradesOnDate.map((trade, idx) => (
              <div key={idx} className={`trade-dot ${trade.type}`}>
                {trade.pair}
              </div>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  // Calculate monthly P&L for the navigation label
  const navigationLabel = ({ date, label, locale, view }) => {
    if (view === 'month') {
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthlyTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate.getMonth() === month && tradeDate.getFullYear() === year;
      });

      const monthlyPnL = monthlyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

      if (monthlyPnL !== 0) {
        const pnlClass = monthlyPnL >= 0 ? 'monthly-profit' : 'monthly-loss';
        return (
          <span className="month-label-container">
            <span className="month-label">{label}</span>
            <span className={`monthly-pnl ${pnlClass}`}>
              {monthlyPnL >= 0 ? '+' : ''}${monthlyPnL.toFixed(0)}
            </span>
          </span>
        );
      }
    }
    return label;
  };

  return (
    <div className="trade-calendar-container">
      <Calendar
        onChange={onChange}
        value={value}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
        tileContent={tileContent}
        navigationLabel={navigationLabel}
      />
    </div>
  );
}

export default TradeCalendar;
