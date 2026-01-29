import { useState } from 'react';
import Header from './components/Header';
import Checklist from './components/Checklist';
import TradeCalendar from './components/TradeCalendar';
import PositionCalculator from './components/PositionCalculator';
import TradeModal from './components/TradeModal';
import AddTradeModal from './components/AddTradeModal';
import './App.css';

function App() {
  const [trades, setTrades] = useState([
    {
      date: new Date(2026, 0, 15),
      pair: 'EUR/USD',
      direction: 'Long',
      type: 'win',
      pnl: 1500,
      entry: '1.0850',
      exit: '1.0900',
      lotSize: '0.5',
      comments: ''
    },
    {
      date: new Date(2026, 0, 15),
      pair: 'GBP/USD',
      direction: 'Long',
      type: 'loss',
      pnl: -800,
      entry: '1.2650',
      exit: '1.2610',
      lotSize: '0.3',
      comments: ''
    },
    {
      date: new Date(2026, 0, 15),
      pair: 'USD/JPY',
      direction: 'Short',
      type: 'win',
      pnl: 450,
      entry: '148.50',
      exit: '148.00',
      lotSize: '0.5',
      comments: ''
    },
    {
      date: new Date(2026, 0, 20),
      pair: 'USD/JPY',
      direction: 'Long',
      type: 'win',
      pnl: 2000,
      entry: '148.50',
      exit: '149.00',
      lotSize: '0.8',
      comments: ''
    },
    {
      date: new Date(2026, 0, 28),
      pair: 'GBP/JPY',
      direction: 'Long',
      type: 'win',
      pnl: 3200,
      entry: '188.20',
      exit: '189.00',
      lotSize: '1.0',
      comments: ''
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateTrades, setSelectedDateTrades] = useState([]);
  const [addTradeModalOpen, setAddTradeModalOpen] = useState(false);

  const handleDateClick = (date, tradesOnDate) => {
    if (tradesOnDate.length > 0) {
      setSelectedDate(date);
      setSelectedDateTrades(tradesOnDate);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Clear modal state defensively
    setSelectedDate(null);
    setSelectedDateTrades([]);
  };

  const handleAddTrade = (newTrade) => {
    setTrades([...trades, newTrade]);
  };

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <aside className="sidebar left-sidebar">
          <Checklist />
        </aside>
        <main className="calendar-section">
          <TradeCalendar trades={trades} onDateClick={handleDateClick} />
          <button className="add-trade-btn" onClick={() => setAddTradeModalOpen(true)}>
            Add Trade
          </button>
        </main>
        <aside className="sidebar right-sidebar">
          <PositionCalculator />
        </aside>
      </div>
      <TradeModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        date={selectedDate}
        trades={selectedDateTrades}
      />
      <AddTradeModal
        isOpen={addTradeModalOpen}
        onClose={() => setAddTradeModalOpen(false)}
        onAddTrade={handleAddTrade}
      />
    </div>
  );
}

export default App;
