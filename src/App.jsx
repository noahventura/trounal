import { useState, useEffect } from 'react';
import { useAuth } from './firebase/AuthContext';
import { subscribeToTrades, addTrade, deleteTrade, updateTrade } from './firebase/tradeService';
import Header from './components/Header';
import Checklist from './components/Checklist';
import TradeCalendar from './components/TradeCalendar';
import PositionCalculator from './components/PositionCalculator';
import TradeModal from './components/TradeModal';
import AddTradeModal from './components/AddTradeModal';
import Login from './components/Login';
import './App.css';

function App() {
  const { currentUser } = useAuth();
  const [trades, setTrades] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateTrades, setSelectedDateTrades] = useState([]);
  const [addTradeModalOpen, setAddTradeModalOpen] = useState(false);

  // Subscribe to user's trades from Firestore
  useEffect(() => {
    if (!currentUser) {
      setTrades([]);
      return;
    }

    const unsubscribe = subscribeToTrades(currentUser.uid, (userTrades) => {
      setTrades(userTrades);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Update selectedDateTrades when trades change (for real-time updates)
  useEffect(() => {
    if (selectedDate && modalOpen) {
      const dateStr = selectedDate.toDateString();
      const updatedTrades = trades.filter(trade =>
        new Date(trade.date).toDateString() === dateStr
      );
      setSelectedDateTrades(updatedTrades);
    }
  }, [trades, selectedDate, modalOpen]);

  const handleDateClick = (date, tradesOnDate) => {
    setSelectedDate(date);
    setSelectedDateTrades(tradesOnDate);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
    setSelectedDateTrades([]);
  };

  const handleAddTrade = async (newTrade) => {
    if (!currentUser) return;

    try {
      await addTrade(currentUser.uid, newTrade);
    } catch (error) {
      console.error('Error adding trade:', error);
      alert('Failed to add trade. Please try again.');
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    try {
      await deleteTrade(tradeId);
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  };

  const handleUpdateTrade = async (tradeId, updates) => {
    try {
      await updateTrade(tradeId, updates);
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  };

  // Show login page if not authenticated
  if (!currentUser) {
    return <Login />;
  }

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
        onDeleteTrade={handleDeleteTrade}
        onUpdateTrade={handleUpdateTrade}
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
