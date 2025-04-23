package com.example.webgiatui.service;

import com.example.webgiatui.dto.FeedbackDto;
import com.example.webgiatui.entity.Feedback;

import java.util.List;

public interface FeedbackService {
    /**
     * Find all feedback entries
     * @return list of all feedback
     */
    List<Feedback> findAll();

    /**
     * Find feedback by ID
     * @param id feedback ID
     * @return feedback if found, null otherwise
     */
    Feedback findById(Long id);

    /**
     * Find feedback by user ID
     * @param userId user ID
     * @return list of feedback from the user
     */
    List<Feedback> findByUserId(Long userId);

    /**
     * Find feedback by booking ID
     * @param bookingId booking ID
     * @return list of feedback for the booking
     */
    List<Feedback> findByBookingId(Long bookingId);

    /**
     * Find feedback with rating greater than or equal to specified value
     * @param rating minimum rating
     * @return list of feedback with rating >= specified value
     */
    List<Feedback> findByRatingGreaterThanEqual(Integer rating);

    /**
     * Save or update feedback
     * @param feedback feedback to save or update
     * @return saved or updated feedback
     */
    Feedback save(Feedback feedback);

    /**
     * Delete feedback
     * @param id feedback ID
     */
    void delete(Long id);

    /**
     * Convert Feedback entity to FeedbackDto
     * @param feedback feedback entity
     * @return feedback DTO
     */
    FeedbackDto convertToDto(Feedback feedback);

    /**
     * Convert FeedbackDto to Feedback entity
     * @param feedbackDto feedback DTO
     * @return feedback entity
     */
    Feedback convertToEntity(FeedbackDto feedbackDto);
} 