package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.dto.CourseDto;
import com.onlinecourses.OnlineCourseSystem.entity.Course;
import com.onlinecourses.OnlineCourseSystem.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // Get all courses
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        try {
            List<Course> courses = courseService.getAllCourses();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get course by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        try {
            Optional<Course> course = courseService.getCourseById(id);
            if (course.isPresent()) {
                return ResponseEntity.ok(course.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching course: " + e.getMessage());
        }
    }

    // Create new course
    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CourseDto courseDto) {
        try {
            Course course = courseService.createCourse(
                courseDto.getTitle(),
                courseDto.getDescription(),
                courseDto.getCategory(),
                courseDto.getPrice(),
                courseDto.getInstructorName(),
                courseDto.getInstructorId(),
                courseDto.getBatch()
            );
            return ResponseEntity.ok(course);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating course: " + e.getMessage());
        }
    }

    // Update course
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody CourseDto courseDto) {
        try {
            Course updatedCourse = courseService.updateCourse(
                id,
                courseDto.getTitle(),
                courseDto.getDescription(),
                courseDto.getCategory(),
                courseDto.getPrice(),
                courseDto.getBatch()
            );
            return ResponseEntity.ok(updatedCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating course: " + e.getMessage());
        }
    }

    // Delete course
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok().body("Course deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting course: " + e.getMessage());
        }
    }

    // Get courses by instructor
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<?> getCoursesByInstructor(@PathVariable Long instructorId) {
        try {
            List<Course> courses = courseService.getCoursesByInstructor(instructorId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching instructor courses: " + e.getMessage());
        }
    }

    // Get courses by category
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getCoursesByCategory(@PathVariable String category) {
        try {
            List<Course> courses = courseService.getCoursesByCategory(category);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching courses by category: " + e.getMessage());
        }
    }

    // Get courses by batch
    @GetMapping("/batch/{batch}")
    public ResponseEntity<?> getCoursesByBatch(@PathVariable String batch) {
        try {
            List<Course> courses = courseService.getCoursesByBatch(batch);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching courses by batch: " + e.getMessage());
        }
    }

    // Search courses by title or description
    @GetMapping("/search")
    public ResponseEntity<?> searchCourses(@RequestParam String query) {
        try {
            // This would require a new method in CourseService for search functionality
            List<Course> allCourses = courseService.getAllCourses();
            List<Course> filteredCourses = allCourses.stream()
                .filter(course -> 
                    course.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                    course.getDescription().toLowerCase().contains(query.toLowerCase()) ||
                    course.getCategory().toLowerCase().contains(query.toLowerCase()) ||
                    course.getInstructorName().toLowerCase().contains(query.toLowerCase())
                )
                .toList();
            return ResponseEntity.ok(filteredCourses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching courses: " + e.getMessage());
        }
    }

    // Get popular courses (highest rated)
    @GetMapping("/popular")
    public ResponseEntity<?> getPopularCourses() {
        try {
            List<Course> allCourses = courseService.getAllCourses();
            List<Course> popularCourses = allCourses.stream()
                .filter(course -> course.getRating() != null && course.getRating() >= 4.0)
                .sorted((c1, c2) -> Double.compare(c2.getRating(), c1.getRating()))
                .limit(10)
                .toList();
            return ResponseEntity.ok(popularCourses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching popular courses: " + e.getMessage());
        }
    }

    // Get courses with discount (optional feature)
    @GetMapping("/discounted")
    public ResponseEntity<?> getDiscountedCourses() {
        try {
            List<Course> allCourses = courseService.getAllCourses();
            List<Course> discountedCourses = allCourses.stream()
                .filter(course -> course.getPrice() < 50.0) // Courses under $50
                .sorted((c1, c2) -> Double.compare(c1.getPrice(), c2.getPrice()))
                .toList();
            return ResponseEntity.ok(discountedCourses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching discounted courses: " + e.getMessage());
        }
    }
}