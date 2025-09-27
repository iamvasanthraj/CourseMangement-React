package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.entity.Course;
import com.onlinecourses.OnlineCourseSystem.entity.User;
import com.onlinecourses.OnlineCourseSystem.repository.CourseRepository;
import com.onlinecourses.OnlineCourseSystem.repository.EnrollmentRepository;
import com.onlinecourses.OnlineCourseSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public Course createCourse(String title, String description, String category, 
                              Double price, String instructorName, Long instructorId, String batch) {
        Optional<User> instructor = userRepository.findById(instructorId);
        if (instructor.isEmpty() || !"INSTRUCTOR".equals(instructor.get().getRole())) {
            throw new RuntimeException("Invalid instructor ID or user is not an instructor");
        }

        // Validate price
        if (price < 0) {
            throw new RuntimeException("Price cannot be negative");
        }

        // Validate category
        if (!isValidCategory(category)) {
            throw new RuntimeException("Invalid course category");
        }

        Course course = new Course(title, description, category, price, instructorName, instructorId);
        if (batch != null && !batch.trim().isEmpty()) {
            course.setBatch(batch);
        }
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByInstructor(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category.toUpperCase());
    }

    public List<Course> getCoursesByBatch(String batch) {
        return courseRepository.findByBatch(batch);
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public Course updateCourse(Long courseId, String title, String description, String category, 
                              Double price, String batch) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            
            if (title != null && !title.trim().isEmpty()) {
                course.setTitle(title);
            }
            if (description != null) {
                course.setDescription(description);
            }
            if (category != null && isValidCategory(category)) {
                course.setCategory(category.toUpperCase());
            }
            if (price != null && price >= 0) {
                course.setPrice(price);
            }
            if (batch != null && !batch.trim().isEmpty()) {
                course.setBatch(batch);
            }
            
            return courseRepository.save(course);
        }
        throw new RuntimeException("Course not found with ID: " + courseId);
    }

    public void deleteCourse(Long id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
        } else {
            throw new RuntimeException("Course not found with ID: " + id);
        }
    }

    // Search courses by multiple criteria
    public List<Course> searchCourses(String query) {
        List<Course> allCourses = courseRepository.findAll();
        return allCourses.stream()
            .filter(course -> 
                course.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                course.getDescription().toLowerCase().contains(query.toLowerCase()) ||
                course.getCategory().toLowerCase().contains(query.toLowerCase()) ||
                course.getInstructorName().toLowerCase().contains(query.toLowerCase()) ||
                course.getBatch().toLowerCase().contains(query.toLowerCase())
            )
            .toList();
    }

    // Get featured courses (high rating and reasonable price)
    public List<Course> getFeaturedCourses() {
        List<Course> allCourses = courseRepository.findAll();
        return allCourses.stream()
            .filter(course -> 
                course.getRating() != null && 
                course.getRating() >= 4.0 && 
                course.getPrice() <= 100.0
            )
            .sorted((c1, c2) -> Double.compare(c2.getRating(), c1.getRating()))
            .limit(6)
            .toList();
    }

    // Validate category
    private boolean isValidCategory(String category) {
        String[] validCategories = {"BACKEND", "FRONTEND", "CYBERSECURITY", "DATABASE", "MOBILE", "DEVOPS", "CLOUD", "AI"};
        for (String validCat : validCategories) {
            if (validCat.equalsIgnoreCase(category)) {
                return true;
            }
        }
        return false;
    }

    // Get course statistics for instructor dashboard
  public InstructorStats getInstructorStats(Long instructorId) {
    List<Course> instructorCourses = courseRepository.findByInstructorId(instructorId);
    
    long totalCourses = instructorCourses.size();
    
    // Calculate total enrollments across all instructor's courses
    long totalEnrollments = instructorCourses.stream()
        .mapToLong(course -> enrollmentRepository.countByCourseId(course.getId()))
        .sum();
    
    double averageRating = instructorCourses.stream()
        .filter(course -> course.getRating() != null && course.getRating() > 0)
        .mapToDouble(Course::getRating)
        .average()
        .orElse(0.0);
    
    // Calculate revenue (price * enrollments)
    double totalRevenue = instructorCourses.stream()
        .mapToDouble(course -> course.getPrice() * enrollmentRepository.countByCourseId(course.getId()))
        .sum();
    
    return new InstructorStats(totalCourses, totalEnrollments, averageRating, totalRevenue);
}
// Add this method to your existing CourseService
public void updateCourseRating(Long courseId, double averageRating, int totalRatings) {
    Optional<Course> courseOpt = courseRepository.findById(courseId);
    if (courseOpt.isPresent()) {
        Course course = courseOpt.get();
        course.setRating(averageRating);
        course.setTotalRatings(totalRatings);
        courseRepository.save(course);
    }
}

// Create a proper DTO class for stats
public static class InstructorStats {
    private final long totalCourses;
    private final long totalEnrollments;
    private final double averageRating;
    private final double totalRevenue;
    
    public InstructorStats(long totalCourses, long totalEnrollments, double averageRating, double totalRevenue) {
        this.totalCourses = totalCourses;
        this.totalEnrollments = totalEnrollments;
        this.averageRating = Math.round(averageRating * 10.0) / 10.0;
        this.totalRevenue = Math.round(totalRevenue * 100.0) / 100.0;
    }
    
    // Getters
    public long getTotalCourses() { return totalCourses; }
    public long getTotalEnrollments() { return totalEnrollments; }
    public double getAverageRating() { return averageRating; }
    public double getTotalRevenue() { return totalRevenue; }
}
}