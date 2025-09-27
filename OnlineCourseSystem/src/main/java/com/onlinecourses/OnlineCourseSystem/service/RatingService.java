package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.entity.Rating;
import com.onlinecourses.OnlineCourseSystem.entity.Course;
import com.onlinecourses.OnlineCourseSystem.entity.Enrollment;
import com.onlinecourses.OnlineCourseSystem.dto.RatingDto;
import com.onlinecourses.OnlineCourseSystem.repository.RatingRepository;
import com.onlinecourses.OnlineCourseSystem.repository.CourseRepository;
import com.onlinecourses.OnlineCourseSystem.repository.EnrollmentRepository;
import com.onlinecourses.OnlineCourseSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseService courseService;

    public Rating addRating(RatingDto ratingDto) {
        // Validate student exists and is a student
        var student = userRepository.findById(ratingDto.getStudentId());
        if (student.isEmpty() || !"STUDENT".equals(student.get().getRole())) {
            throw new RuntimeException("Invalid student");
        }

        // Validate course exists
        var course = courseRepository.findById(ratingDto.getCourseId());
        if (course.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        // Check if student is enrolled in the course
        Optional<Enrollment> enrollment = enrollmentRepository.findByStudentIdAndCourseId(
            ratingDto.getStudentId(), ratingDto.getCourseId());
        if (enrollment.isEmpty()) {
            throw new RuntimeException("Student is not enrolled in this course");
        }

        // Check if student has already rated this course
        if (ratingRepository.existsByStudentIdAndCourseId(ratingDto.getStudentId(), ratingDto.getCourseId())) {
            throw new RuntimeException("Student has already rated this course");
        }

        // Validate rating stars (1-5)
        if (ratingDto.getStars() < 1 || ratingDto.getStars() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5 stars");
        }

        Rating rating = new Rating();
        rating.setStars(ratingDto.getStars());
        rating.setComment(ratingDto.getComment());
        rating.setStudentId(ratingDto.getStudentId());
        rating.setCourse(course.get());

        Rating savedRating = ratingRepository.save(rating);
        
        // Update course rating average
        updateCourseRating(ratingDto.getCourseId());
        
        return savedRating;
    }

    public Rating updateRating(Long ratingId, RatingDto ratingDto) {
        Optional<Rating> existingRating = ratingRepository.findById(ratingId);
        if (existingRating.isEmpty()) {
            throw new RuntimeException("Rating not found");
        }

        Rating rating = existingRating.get();
        
        // Validate rating stars (1-5)
        if (ratingDto.getStars() != null && (ratingDto.getStars() < 1 || ratingDto.getStars() > 5)) {
            throw new RuntimeException("Rating must be between 1 and 5 stars");
        }

        if (ratingDto.getStars() != null) {
            rating.setStars(ratingDto.getStars());
        }
        if (ratingDto.getComment() != null) {
            rating.setComment(ratingDto.getComment());
        }

        Rating updatedRating = ratingRepository.save(rating);
        
        // Update course rating average
        updateCourseRating(rating.getCourse().getId());
        
        return updatedRating;
    }

    public List<Rating> getRatingsByCourse(Long courseId) {
        return ratingRepository.findByCourseId(courseId);
    }

    public List<Rating> getRatingsByStudent(Long studentId) {
        return ratingRepository.findByStudentId(studentId);
    }

    public Optional<Rating> getRatingByStudentAndCourse(Long studentId, Long courseId) {
        return ratingRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    public void deleteRating(Long ratingId) {
        Optional<Rating> rating = ratingRepository.findById(ratingId);
        if (rating.isPresent()) {
            Long courseId = rating.get().getCourse().getId();
            ratingRepository.deleteById(ratingId);
            updateCourseRating(courseId);
        }
    }

    private void updateCourseRating(Long courseId) {
        List<Rating> ratings = ratingRepository.findByCourseId(courseId);
        
        if (ratings.isEmpty()) {
            courseService.updateCourseRating(courseId, 0.0, 0);
            return;
        }

        double average = ratings.stream()
            .mapToInt(Rating::getStars)
            .average()
            .orElse(0.0);
        
        int totalRatings = ratings.size();
        
        courseService.updateCourseRating(courseId, average, totalRatings);
    }
}