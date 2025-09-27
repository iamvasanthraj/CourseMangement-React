package com.onlinecourses.OnlineCourseSystem.repository;

import com.onlinecourses.OnlineCourseSystem.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByCourseId(Long courseId);
    Optional<Rating> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Rating> findByStudentId(Long studentId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
}