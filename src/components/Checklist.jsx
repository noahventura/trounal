import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../firebase/AuthContext';
import {
  subscribeToChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  updateChecklistOrder
} from '../firebase/tradeService';
import './Checklist.css';

function Checklist() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const dragNode = useRef(null);

  // Subscribe to user's checklist from Firestore
  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      return;
    }

    const unsubscribe = subscribeToChecklist(currentUser.uid, (checklistItems) => {
      setItems(checklistItems);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleItem = async (item) => {
    try {
      await updateChecklistItem(item.id, { checked: !item.checked });
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.trim() && currentUser) {
      try {
        const newOrder = items.length;
        await addChecklistItem(currentUser.uid, newItem, newOrder);
        setNewItem('');
      } catch (error) {
        console.error('Error adding item:', error);
      }
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteChecklistItem(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    dragNode.current = e.target;
    dragNode.current.addEventListener('dragend', handleDragEnd);

    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnter = (e, index) => {
    if (index !== draggedItem) {
      setDragOverItem(index);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = async () => {
    if (draggedItem !== null && dragOverItem !== null && draggedItem !== dragOverItem) {
      const newItems = [...items];
      const draggedItemContent = newItems[draggedItem];

      // Remove dragged item and insert at new position
      newItems.splice(draggedItem, 1);
      newItems.splice(dragOverItem, 0, draggedItemContent);

      // Update local state immediately for smooth UX
      setItems(newItems);

      // Update order in Firestore
      try {
        await updateChecklistOrder(newItems);
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }

    if (dragNode.current) {
      dragNode.current.classList.remove('dragging');
      dragNode.current.removeEventListener('dragend', handleDragEnd);
    }

    setDraggedItem(null);
    setDragOverItem(null);
    dragNode.current = null;
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
        {items.length === 0 ? (
          <p className="empty-message">Add your first checklist item</p>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className={`checklist-item ${dragOverItem === index ? 'drag-over' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
            >
              <span className="drag-handle">⋮⋮</span>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(item)}
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
          ))
        )}
      </div>
    </div>
  );
}

export default Checklist;
