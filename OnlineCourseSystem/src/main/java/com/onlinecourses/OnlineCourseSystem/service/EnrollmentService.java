package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.entity.Enrollment;
import com.onlinecourses.OnlineCourseSystem.repository.EnrollmentRepository;
import com.onlinecourses.OnlineCourseSystem.repository.UserRepository;
import com.onlinecourses.OnlineCourseSystem.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    public Enrollment enrollStudent(Long studentId, Long courseId) {
        // Validate student and course exist
        var student = userRepository.findById(studentId);
        var course = courseRepository.findById(courseId);

        if (student.isEmpty() || !"STUDENT".equals(student.get().getRole())) {
            throw new RuntimeException("Invalid student");
        }
        if (course.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        // Check if already enrolled
        Optional<Enrollment> existing = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (existing.isPresent()) {
            throw new RuntimeException("Already enrolled");
        }

        Enrollment enrollment = new Enrollment(studentId, courseId);
        return enrollmentRepository.save(enrollment);
    }

    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    public void unenrollStudent(Long enrollmentId) {
        enrollmentRepository.deleteById(enrollmentId);
    }
    
    // Add this method to your existing EnrollmentService class
public int getEnrollmentCountByCourse(Long courseId) {
    return enrollmentRepository.countByCourseId(courseId);
}

public List<Enrollment> getCompletedEnrollmentsByCourse(Long courseId) {
    List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
    return enrollments.stream()
        .filter(Enrollment::isCompleted)
        .toList();
}
public Optional<Enrollment> getEnrollmentById(Long enrollmentId) {
    return enrollmentRepository.findById(enrollmentId);
}


   public Enrollment markAsCompleted(Long enrollmentId) {
    Optional<Enrollment> enrollment = enrollmentRepository.findById(enrollmentId);
    if (enrollment.isPresent()) {
        Enrollment enroll = enrollment.get();
        enroll.setCompleted(true); // This will automatically set completionDate
        return enrollmentRepository.save(enroll);
    } else {
        throw new RuntimeException("Enrollment not found with id: " + enrollmentId);
    }
    }
}