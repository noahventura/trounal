import { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { addFeedback, subscribeToAllFeedback, updateFeedbackStatus, deleteFeedback } from '../firebase/tradeService';
import './FeedbackButton.css';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function FeedbackButton() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [feedbackType, setFeedbackType] = useState('feature');
  const [adminFilter, setAdminFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [allFeedback, setAllFeedback] = useState([]);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isAdmin && isAdminView && isModalOpen) {
      const unsubscribe = subscribeToAllFeedback(setAllFeedback);
      return () => unsubscribe();
    }
  }, [isAdmin, isAdminView, isModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await addFeedback(currentUser.uid, currentUser.email, currentUser.displayName, {
        type: feedbackType,
        title: title.trim(),
        description: description.trim()
      });
      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      await updateFeedbackStatus(feedbackId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await deleteFeedback(feedbackId);
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsAdminView(false);
    setSubmitSuccess(false);
    setAdminFilter('all');
  };

  const filteredFeedback = allFeedback.filter(item => {
    if (adminFilter === 'all') return true;
    return item.type === adminFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#22c55e';
      case 'rejected': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <>
      <button
        className="feedback-fab"
        onClick={() => setIsModalOpen(true)}
        title="Send Feedback"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {isModalOpen && (
        <div className="feedback-overlay" onClick={closeModal}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button className="feedback-close" onClick={closeModal}>×</button>

            {!isAdminView ? (
              <>
                <h2>Send Feedback</h2>

                {submitSuccess ? (
                  <div className="feedback-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <p>Thank you for your feedback!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="feedback-type-toggle">
                      <button
                        type="button"
                        className={`type-btn ${feedbackType === 'feature' ? 'active' : ''}`}
                        onClick={() => setFeedbackType('feature')}
                      >
                        Feature Request
                      </button>
                      <button
                        type="button"
                        className={`type-btn ${feedbackType === 'bug' ? 'active' : ''}`}
                        onClick={() => setFeedbackType('bug')}
                      >
                        Report Bug
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="feedback-input"
                      required
                    />

                    <textarea
                      placeholder={feedbackType === 'feature'
                        ? "Describe the feature you'd like to see..."
                        : "Describe the bug and steps to reproduce..."}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="feedback-textarea"
                      rows={5}
                      required
                    />

                    <button
                      type="submit"
                      className="feedback-submit"
                      disabled={isSubmitting || !title.trim() || !description.trim()}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                )}

                {isAdmin && (
                  <button
                    className="admin-view-btn"
                    onClick={() => setIsAdminView(true)}
                  >
                    View Bugs & Feature Requests
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="admin-header">
                  <button className="back-btn" onClick={() => setIsAdminView(false)}>
                    ← Back
                  </button>
                  <h2>All Feedback</h2>
                </div>

                <div className="admin-filter-tabs">
                  <button
                    className={`filter-tab ${adminFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setAdminFilter('all')}
                  >
                    All ({allFeedback.length})
                  </button>
                  <button
                    className={`filter-tab ${adminFilter === 'feature' ? 'active' : ''}`}
                    onClick={() => setAdminFilter('feature')}
                  >
                    Features ({allFeedback.filter(f => f.type === 'feature').length})
                  </button>
                  <button
                    className={`filter-tab ${adminFilter === 'bug' ? 'active' : ''}`}
                    onClick={() => setAdminFilter('bug')}
                  >
                    Bugs ({allFeedback.filter(f => f.type === 'bug').length})
                  </button>
                </div>

                <div className="feedback-list">
                  {filteredFeedback.length === 0 ? (
                    <p className="no-feedback">No feedback submitted yet.</p>
                  ) : (
                    filteredFeedback.map((item) => (
                      <div key={item.id} className="feedback-item">
                        <div className="feedback-item-header">
                          <span className={`feedback-type-badge ${item.type}`}>
                            {item.type === 'feature' ? 'Feature' : 'Bug'}
                          </span>
                          <span
                            className="feedback-status"
                            style={{ color: getStatusColor(item.status) }}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3>{item.title}</h3>
                        <p className="feedback-description">{item.description}</p>
                        <div className="feedback-meta">
                          <span>{item.userName || 'Unknown'} ({item.userEmail})</span>
                          <span>{item.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="feedback-actions">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
