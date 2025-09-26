package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.entity.Course;
import com.onlinecourses.OnlineCourseSystem.repository.CourseRepository;
import com.onlinecourses.OnlineCourseSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public Course createCourse(String title, String description, Long instructorId) {
        // Simple validation - check if user exists and is instructor
        var instructor = userRepository.findById(instructorId);
        if (instructor.isEmpty()) {
            throw new RuntimeException("Instructor not found");
        }
        if (!"INSTRUCTOR".equals(instructor.get().getRole())) {
            throw new RuntimeException("User is not an instructor");
        }

        Course course = new Course(title, description, instructorId);
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByInstructor(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}