import React, { useState } from 'react';
// import styles from './CourseCard.module.css';

const CourseCard = ({
  course,
  isEnrolled = false,
  enrollmentId,
  canRate = false,
  onEnroll,
  onUnenroll,
  onRating,  // This should be used consistently
  loading = false
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!course) return null;

  const handleRatingSubmit = () => {
    if (rating > 0) {
      onRating(course.id, rating, comment);
      setShowRatingModal(false);
      setRating(0);
      setComment('');
    }
  };

  // Fix the button click handler
  const handleRateClick = () => {
    setShowRatingModal(true);
  };

  return (
    <div className={styles.courseCard}>
      <div className={styles.courseHeader}>
        <h3>{course.title}</h3>
        <span className={styles.categoryBadge}>{course.category}</span>
      </div>

      <div className={styles.courseInfo}>
        <p className={styles.courseDescription}>{course.description}</p>
      </div>

      <div className={styles.courseActions}>
        {!isEnrolled ? (
          <button
            className={`${styles.button} ${styles.enrollBtn}`}
            onClick={() => onEnroll(course.id)}
            disabled={loading}
          >
            {loading ? 'Enrolling...' : 'Enroll Now'}
          </button>
        ) : (
          <>
            {canRate && (
              <button 
                onClick={handleRateClick} 
                className={`${styles.button} ${styles.rateBtn}`}
              >
                ⭐ Rate
              </button>
            )}
            <button
              className={`${styles.button} ${styles.unenrollBtn}`}
              onClick={() => onUnenroll(enrollmentId)}
              disabled={loading}
            >
              {loading ? 'Unenrolling...' : 'Unenroll'}
            </button>
          </>
        )}
      </div>

      {showRatingModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.ratingModal}>
            <h3>Rate {course.title}</h3>
            <div className={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
                  onClick={() => setRating(star)}
                  type="button"
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={styles.commentTextarea}
            />
            <div className={styles.modalActions}>
              <button 
                className={styles.button} 
                onClick={() => setShowRatingModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.button} ${styles.submitBtn}`}
                onClick={handleRatingSubmit}
                disabled={rating === 0}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;