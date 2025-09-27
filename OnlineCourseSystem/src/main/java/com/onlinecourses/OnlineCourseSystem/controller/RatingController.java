package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.dto.RatingDto;
import com.onlinecourses.OnlineCourseSystem.entity.Rating;
import com.onlinecourses.OnlineCourseSystem.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "http://localhost:5173")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping
    public ResponseEntity<?> addRating(@RequestBody RatingDto ratingDto) {
        try {
            Rating rating = ratingService.addRating(ratingDto);
            return ResponseEntity.ok(rating);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRating(@PathVariable Long id, @RequestBody RatingDto ratingDto) {
        try {
            Rating rating = ratingService.updateRating(id, ratingDto);
            return ResponseEntity.ok(rating);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/course/{courseId}")
    public List<Rating> getCourseRatings(@PathVariable Long courseId) {
        return ratingService.getRatingsByCourse(courseId);
    }

    @GetMapping("/student/{studentId}")
    public List<Rating> getStudentRatings(@PathVariable Long studentId) {
        return ratingService.getRatingsByStudent(studentId);
    }

    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<?> getStudentCourseRating(@PathVariable Long studentId, @PathVariable Long courseId) {
        try {
            Optional<Rating> rating = ratingService.getRatingByStudentAndCourse(studentId, courseId);
            if (rating.isPresent()) {
                return ResponseEntity.ok(rating.get());
            } else {
                return ResponseEntity.ok().body("No rating found");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRating(@PathVariable Long id) {
        try {
            ratingService.deleteRating(id);
            return ResponseEntity.ok().body("Rating deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}