import { useState } from 'react';
import './Checklist.css';

function Checklist() {
  const [items, setItems] = useState([
    { id: 1, text: 'Check trend direction', checked: false },
    { id: 2, text: 'Identify support/resistance', checked: false },
    { id: 3, text: 'Verify volume confirmation', checked: false },
  ]);
  const [newItem, setNewItem] = useState('');

  const toggleItem = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      setItems([...items, {
        id: Date.now(),
        text: newItem,
        checked: false
      }]);
      setNewItem('');
    }
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="checklist">
      <h2 className="checklist-title">Trade Checklist</h2>
      <form onSubmit={addItem} className="checklist-form">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item..."
          className="checklist-input"
        />
        <button type="submit" className="add-btn">+</button>
      </form>
      <div className="checklist-items">
        {items.map(item => (
          <div key={item.id} className="checklist-item">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
              />
              <span className={`checkbox-text ${item.checked ? 'checked' : ''}`}>
                {item.text}
              </span>
            </label>
            <button
              onClick={() => deleteItem(item.id)}
              className="delete-btn"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Checklist;
