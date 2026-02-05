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
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const draggedIndexRef = useRef(null);
  const editInputRef = useRef(null);

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

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  // Focus input when modal opens
  useEffect(() => {
    if (editingId) {
      setTimeout(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      }, 50);
    }
  }, [editingId]);

  const saveEdit = async () => {
    if (editingId && editText.trim()) {
      try {
        await updateChecklistItem(editingId, { text: editText.trim() });
      } catch (error) {
        console.error('Error updating item:', error);
      }
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    draggedIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());

    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndexRef.current !== null && index !== draggedIndexRef.current) {
      setDragOverIndex(index);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the item entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = draggedIndexRef.current;

    if (dragIndex !== null && dragIndex !== dropIndex) {
      const newItems = [...items];
      const draggedItem = newItems[dragIndex];

      // Remove dragged item and insert at new position
      newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);

      // Update local state immediately for smooth UX
      setItems(newItems);

      // Update order in Firestore
      try {
        await updateChecklistOrder(newItems);
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }

    // Clean up
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
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
              className={`checklist-item ${dragOverIndex === index ? 'drag-over' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
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
                onClick={() => startEditing(item)}
                className="edit-btn"
                title="Edit item"
              >
                ✎
              </button>
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

      {editingId && (
        <div className="edit-modal-overlay" onClick={cancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Item</h3>
            <textarea
              ref={editInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit();
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                }
              }}
              className="edit-modal-textarea"
              placeholder="Item text..."
              rows={3}
            />
            <div className="edit-modal-buttons">
              <button onClick={cancelEdit} className="edit-cancel-btn">Cancel</button>
              <button onClick={saveEdit} className="edit-save-btn">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checklist;
