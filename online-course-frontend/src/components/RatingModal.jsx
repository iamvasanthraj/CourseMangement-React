import React from 'react';
import './RatingModal.css';

const RatingModal = ({ course, rating, onRatingChange, onSubmit, onClose }) => {
  if (!course) return null;

  const [hovered, setHovered] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-submit when star is clicked
  const handleStarClick = async (star) => {
    if (isSubmitting) return;
    
    const newRating = { stars: star, comment: '' }; // No comments
    onRatingChange(newRating);
    
    setIsSubmitting(true);
    try {
      await onSubmit();
      // Auto-close after successful submission
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Rating submission failed:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal-container">
        <div className="rating-modal-glass">
          <button className="modal-close-btn" onClick={onClose}>×</button>
          
          <div className="modal-header">
            <h3 className="modal-title">Rate This Course [ {course.title} ]</h3>
           
            {/* <p className="course-name">{course.title}</p> */}
          </div>

          <div className="rating-section">
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${rating.stars === star ? 'selected' : ''} ${isSubmitting ? 'disabled' : ''}`}
                  onMouseEnter={() => !isSubmitting && setHovered(star)}
                  onMouseLeave={() => !isSubmitting && setHovered(0)}
                  onClick={() => handleStarClick(star)}
                  disabled={isSubmitting}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <span className="star-shape">★</span>
                  <span className="star-glow"></span>
                </button>
              ))}
            </div>
            
            <div className="rating-feedback">
              {rating.stars === 0 && (
                <span className="feedback-text">Click a star to rate</span>
              )}
              {rating.stars > 0 && (
                <span className="feedback-text">
                  You rated: <strong>{rating.stars}</strong> star{rating.stars !== 1 ? 's' : ''}
                  {!isSubmitting && <span className="change-text"> (Click another star to change)</span>}
                </span>
              )}
            </div>
          </div>

          {isSubmitting && (
            <div className="submission-overlay">
              <div className="confirmation-animation">
                <div className="checkmark">✓</div>
                <p>Rating Submitted!</p>
                <p className="auto-close">Closing automatically...</p>
              </div>
            </div>
          )}

          {!isSubmitting && rating.stars > 0 && (
            <div className="action-buttons">
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingModal;