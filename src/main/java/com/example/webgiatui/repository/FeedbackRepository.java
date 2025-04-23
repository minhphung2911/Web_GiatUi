package com.example.webgiatui.repository;

import com.example.webgiatui.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    /**
     * Find feedbacks by user id
     */
    List<Feedback> findByUserId(Long userId);
    
    /**
     * Find feedbacks by booking id
     */
    List<Feedback> findByBookingId(Long bookingId);
    
    /**
     * Find feedbacks with rating greater than or equal to the specified value
     */
    List<Feedback> findByRatingGreaterThanEqual(Integer rating);
} 