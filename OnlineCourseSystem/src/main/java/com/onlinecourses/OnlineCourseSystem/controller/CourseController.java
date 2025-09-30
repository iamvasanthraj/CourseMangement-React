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
        Optional<Course> course = courseService.getCourseById(courseId);
        
        if (course.isPresent()) {
            System.out.println("✅ Course found: " + course.get().getTitle());
            return ResponseEntity.ok(course.get());
        } else {
            System.out.println("❌ Course not found: " + courseId);
            return ResponseEntity.notFound().build();
        }
    } catch (Exception e) {
        System.out.println("💥 ERROR in getCourseById: " + e.getMessage());
        return ResponseEntity.internalServerError().body("Error getting course: " + e.getMessage());
    }
}

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getCoursesByCategory(@PathVariable String category) {
        try {
            List<CourseResponse> courses = courseService.getCoursesByCategory(category);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<?> getInstructorCourses(@PathVariable Long instructorId) {
        try {
            List<CourseResponse> courses = courseService.getInstructorCourses(instructorId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest courseRequest) {
        try {
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
            return ResponseEntity.ok(savedCourse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create course: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete course");
        }
    }
}