package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.dto.CourseRequest;
import com.onlinecourses.OnlineCourseSystem.dto.CourseResponse;
import com.onlinecourses.OnlineCourseSystem.entity.Course;
import com.onlinecourses.OnlineCourseSystem.entity.User;
import com.onlinecourses.OnlineCourseSystem.service.CourseService;
import com.onlinecourses.OnlineCourseSystem.service.UserService;
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
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllCourses() {
        try {
            System.out.println("🔍 === GET ALL COURSES REQUESTED ===");
            List<CourseResponse> courses = courseService.getAllCourses();
            
            // ✅ ADD: Debug logging for course data
            courses.forEach(course -> {
                System.out.println("📊 Course: " + course.getTitle() + 
                                 " | Avg Rating: " + course.getAverageRating() + 
                                 " | Total Ratings: " + course.getTotalRatings() + 
                                 " | Students: " + course.getEnrolledStudents() +
                                 " | Instructor: " + course.getInstructorName());
            });
            
            System.out.println("✅ Successfully retrieved " + courses.size() + " courses");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            System.out.println("💥 ERROR in getAllCourses: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error loading courses: " + e.getMessage());
        }
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCourseById(@PathVariable Long courseId) {
        try {
            System.out.println("🔍 === GET COURSE BY ID: " + courseId + " ===");
            Optional<CourseResponse> courseResponse = courseService.getCourseResponseById(courseId);
            
            if (courseResponse.isPresent()) {
                CourseResponse course = courseResponse.get();
                System.out.println("✅ Course found: " + course.getTitle());
                System.out.println("📊 Course Details - Avg Rating: " + course.getAverageRating() + 
                                 ", Total Ratings: " + course.getTotalRatings() + 
                                 ", Students: " + course.getEnrolledStudents());
                return ResponseEntity.ok(course);
            } else {
                // Fallback: try to get raw Course entity
                Optional<Course> course = courseService.getCourseById(courseId);
                if (course.isPresent()) {
                    System.out.println("⚠️ Using fallback Course entity for: " + course.get().getTitle());
                    return ResponseEntity.ok(course.get());
                } else {
                    System.out.println("❌ Course not found: " + courseId);
                    return ResponseEntity.notFound().build();
                }
            }
        } catch (Exception e) {
            System.out.println("💥 ERROR in getCourseById: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error getting course: " + e.getMessage());
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getCoursesByCategory(@PathVariable String category) {
        try {
            System.out.println("🔍 === GET COURSES BY CATEGORY: " + category + " ===");
            List<CourseResponse> courses = courseService.getCoursesByCategory(category);
            
            // ✅ ADD: Debug logging
            courses.forEach(course -> {
                System.out.println("📊 " + category + " Course: " + course.getTitle() + 
                                 " | Rating: " + course.getAverageRating());
            });
            
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            System.out.println("💥 ERROR in getCoursesByCategory: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<?> getInstructorCourses(@PathVariable Long instructorId) {
        try {
            System.out.println("🔍 === GET INSTRUCTOR COURSES: " + instructorId + " ===");
            List<CourseResponse> courses = courseService.getInstructorCourses(instructorId);
            
            // ✅ ADD: Debug logging
            courses.forEach(course -> {
                System.out.println("📊 Instructor Course: " + course.getTitle() + 
                                 " | Avg Rating: " + course.getAverageRating() + 
                                 " | Students: " + course.getEnrolledStudents());
            });
            
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            System.out.println("💥 ERROR in getInstructorCourses: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest courseRequest) {
        try {
            System.out.println("🔍 === CREATE COURSE REQUESTED ===");
            Optional<User> instructor = userService.findById(courseRequest.getInstructorId());
            if (instructor.isEmpty()) {
                return ResponseEntity.badRequest().body("Instructor not found");
            }

            Course course = new Course();
            course.setTitle(courseRequest.getTitle());
            course.setCategory(courseRequest.getCategory());
            course.setDuration(courseRequest.getDuration());
            course.setBatch(courseRequest.getBatch());
            course.setLevel(courseRequest.getLevel());
            course.setPrice(courseRequest.getPrice());
            course.setInstructor(instructor.get());

            Course savedCourse = courseService.createCourse(course);
            
            // ✅ ADD: Convert to CourseResponse for consistent response
            CourseResponse response = courseService.convertToResponse(savedCourse);
            System.out.println("✅ Course created successfully: " + response.getTitle());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("💥 ERROR in createCourse: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to create course: " + e.getMessage());
        }
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long courseId,
            @RequestBody Course updatedCourse) {
        
        try {
            System.out.println("🔄 === UPDATE COURSE REQUESTED ===");
            System.out.println("📝 Course ID: " + courseId);
            System.out.println("📝 Update Data - Title: " + updatedCourse.getTitle() + 
                             ", Duration: " + updatedCourse.getDuration() + 
                             ", Category: " + updatedCourse.getCategory());
            
            Course updated = courseService.updateCourse(courseId, updatedCourse);
            
            // ✅ ADD: Convert to CourseResponse for consistent response
            CourseResponse response = courseService.convertToResponse(updated);
            
            System.out.println("✅ Course updated successfully: " + response.getTitle());
            System.out.println("📊 Updated Course Stats - Avg Rating: " + response.getAverageRating() + 
                             ", Total Ratings: " + response.getTotalRatings());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.out.println("❌ ERROR updating course: " + e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body("Failed to update course: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("💥 UNEXPECTED ERROR updating course: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Internal server error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            System.out.println("🗑️ === DELETE COURSE REQUESTED: " + id + " ===");
            courseService.deleteCourse(id);
            System.out.println("✅ Course deleted successfully: " + id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println("💥 ERROR in deleteCourse: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to delete course");
        }
    }
}