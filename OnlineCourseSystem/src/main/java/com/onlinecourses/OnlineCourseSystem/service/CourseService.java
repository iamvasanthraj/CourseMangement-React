package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.dto.CourseResponse;
import com.onlinecourses.OnlineCourseSystem.entity.Course;
import com.onlinecourses.OnlineCourseSystem.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseService {
    
    @Autowired
    private CourseRepository courseRepository;
    
    public List<CourseResponse> getAllCourses() {
        try {
            System.out.println("🔍 Getting all courses from database...");
            List<Course> courses = courseRepository.findAll();
            System.out.println("✅ Found " + courses.size() + " courses");
            
            List<CourseResponse> response = courses.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
            
            System.out.println("✅ Successfully converted to DTOs");
            return response;
        } catch (Exception e) {
            System.out.println("💥 ERROR in getAllCourses: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to load courses: " + e.getMessage());
        }
    }
    
    public List<CourseResponse> getCoursesByCategory(String category) {
        try {
            List<Course> courses = courseRepository.findByCategory(category);
            return courses.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to load courses by category: " + e.getMessage());
        }
    }
    
    public List<CourseResponse> getInstructorCourses(Long instructorId) {
        try {
            List<Course> courses = courseRepository.findByInstructorId(instructorId);
            return courses.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to load instructor courses: " + e.getMessage());
        }
    }
    
    private CourseResponse convertToResponse(Course course) {
        try {
            String instructorName = "Unknown Instructor";
            Long instructorId = null;
            
            if (course.getInstructor() != null) {
                instructorName = course.getInstructor().getName();
                instructorId = course.getInstructor().getId();
            }
            
            return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getCategory(),
                course.getDuration(),
                course.getBatch(),
                course.getLevel(),
                course.getPrice(),
                instructorName,
                instructorId,
                course.getCreatedAt()
            );
        } catch (Exception e) {
            System.out.println("⚠️ Error converting course: " + e.getMessage());
            // Return safe default values
            return new CourseResponse(
                course.getId(),
                course.getTitle() != null ? course.getTitle() : "Unknown Course",
                course.getCategory() != null ? course.getCategory() : "Unknown",
                course.getDuration() != null ? course.getDuration() : "Unknown",
                course.getBatch() != null ? course.getBatch() : "Unknown",
                course.getLevel() != null ? course.getLevel() : "Unknown",
                course.getPrice() != null ? course.getPrice() : java.math.BigDecimal.ZERO,
                "Unknown Instructor",
                null,
                course.getCreatedAt()
            );
        }
    }
    
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }
    
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
    
   public Optional<Course> getCourseById(Long courseId) {
    try {
        System.out.println("🔍 Service: Getting course by ID: " + courseId);
        return courseRepository.findById(courseId);
    } catch (Exception e) {
        System.out.println("💥 Service Error getting course: " + e.getMessage());
        throw new RuntimeException("Failed to get course: " + e.getMessage());
    }
}
}