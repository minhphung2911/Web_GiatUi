package com.example.webgiatui.controller;

import com.example.webgiatui.dto.FeedbackDto;
import com.example.webgiatui.entity.Feedback;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.FeedbackService;
import com.example.webgiatui.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserService userService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService, UserService userService) {
        this.feedbackService = feedbackService;
        this.userService = userService;
    }

    /**
     * Get all feedbacks
     */
    @GetMapping
    public ResponseEntity<List<FeedbackDto>> getAllFeedbacks() {
        List<Feedback> feedbacks = feedbackService.findAll();
        List<FeedbackDto> feedbackDtos = feedbacks.stream()
                .map(feedbackService::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(feedbackDtos);
    }

    /**
     * Get a feedback by id
     */
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDto> getFeedbackById(@PathVariable Long id) {
        Feedback feedback = feedbackService.findById(id);
        return ResponseEntity.ok(feedbackService.convertToDto(feedback));
    }

    /**
     * Create a new feedback
     */
    @PostMapping
    public ResponseEntity<FeedbackDto> createFeedback(@Valid @RequestBody FeedbackDto feedbackDto) {
        // Get current authenticated user if userId is not provided
        if (feedbackDto.getUserId() == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String email = auth.getName();
                User currentUser = userService.findByEmail(email);
                if (currentUser != null) {
                    feedbackDto.setUserId(currentUser.getId());
                }
            }
        }
        
        Feedback feedback = feedbackService.convertToEntity(feedbackDto);
        Feedback savedFeedback = feedbackService.save(feedback);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feedbackService.convertToDto(savedFeedback));
    }

    /**
     * Update an existing feedback
     */
    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDto> updateFeedback(
            @PathVariable Long id, 
            @Valid @RequestBody FeedbackDto feedbackDto) {
        
        Feedback existingFeedback = feedbackService.findById(id);
        Feedback feedbackToUpdate = feedbackService.convertToEntity(feedbackDto);
        feedbackToUpdate.setId(id);
        
        Feedback updatedFeedback = feedbackService.save(feedbackToUpdate);
        
        return ResponseEntity.ok(feedbackService.convertToDto(updatedFeedback));
    }

    /**
     * Delete a feedback
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get feedbacks by user id
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedbackDto>> getFeedbacksByUserId(@PathVariable Long userId) {
        List<Feedback> feedbacks = feedbackService.findByUserId(userId);
        List<FeedbackDto> feedbackDtos = feedbacks.stream()
                .map(feedbackService::convertToDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(feedbackDtos);
    }

    /**
     * Get feedbacks by booking id
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<FeedbackDto>> getFeedbacksByBookingId(@PathVariable Long bookingId) {
        List<Feedback> feedbacks = feedbackService.findByBookingId(bookingId);
        List<FeedbackDto> feedbackDtos = feedbacks.stream()
                .map(feedbackService::convertToDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(feedbackDtos);
    }
    
    /**
     * Get feedbacks by minimum rating
     */
    @GetMapping("/rating/{minRating}")
    public ResponseEntity<List<FeedbackDto>> getFeedbacksByMinRating(@PathVariable Integer minRating) {
        List<Feedback> feedbacks = feedbackService.findByRatingGreaterThanEqual(minRating);
        List<FeedbackDto> feedbackDtos = feedbacks.stream()
                .map(feedbackService::convertToDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(feedbackDtos);
    }
} 