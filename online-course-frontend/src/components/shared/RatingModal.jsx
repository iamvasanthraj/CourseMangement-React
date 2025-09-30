import React, { useState, useEffect } from 'react';
import { enrollmentAPI } from '../../services/api'; // Use enrollmentAPI instead
import './RatingModal.css';

const RatingModal = ({ enrollment, onClose, onRatingUpdated }) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (enrollment) {
      // Pre-fill with existing rating if available
      if (enrollment.rating) {
        setStars(enrollment.rating);
      }
      if (enrollment.feedback) {
        setComment(enrollment.feedback);
      }
    }
  }, [enrollment]);

  const submitRating = async () => {
    if (!enrollment?.id) {
      setError('No enrollment selected');
      return;
    }

    if (stars === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use enrollmentAPI to complete course with rating
      const response = await enrollmentAPI.completeCourse(enrollment.id, {
        rating: stars,
        feedback: comment
      });

      // Callback to parent component
      onRatingUpdated && onRatingUpdated(response);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Rating submission error:', err);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starValue) => {
    setStars(starValue);
    if (error) setError('');
  };

  if (!enrollment) {
    return null;
  }

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal-container">
        <div className="rating-modal-glass">
          <div className="modal-header">
            <h2 className="modal-title">Rate this Course</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="course-info">
            <h3>{enrollment.course?.title}</h3>
            <p>by {enrollment.course?.instructor?.name || 'Instructor'}</p>
            <p className="completion-status">
              {enrollment.completed ? 'Course Completed ✅' : 'Marking as completed...'}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {!submitted ? (
            <div className="rating-section">
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star-btn ${stars >= star ? 'selected' : ''} ${loading ? 'loading' : ''}`}
                    onClick={() => handleStarClick(star)}
                    disabled={loading}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="stars-label">
                {stars === 0 ? 'Select your rating' : `${stars} star${stars > 1 ? 's' : ''}`}
              </div>

              <div className="comment-section">
                <label htmlFor="comment" className="comment-label">
                  Optional Comment:
                </label>
                <textarea
                  id="comment"
                  className="comment-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this course..."
                  rows="4"
                  disabled={loading}
                />
              </div>

              <div className="rating-actions">
                <button
                  onClick={submitRating}
                  disabled={loading || stars === 0}
                  className="submit-rating-btn"
                >
                  {loading ? 'Submitting...' : 'Submit Rating & Complete Course'}
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="cancel-rating-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="submission-success">
              <div className="success-icon">✅</div>
              <h3>Thank You!</h3>
              <p>Your rating has been submitted and course marked as completed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingModal;