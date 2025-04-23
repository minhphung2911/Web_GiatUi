package com.example.webgiatui.service.impl;

import com.example.webgiatui.dto.FeedbackDto;
import com.example.webgiatui.entity.Feedback;
import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.exception.ResourceNotFoundException;
import com.example.webgiatui.repository.FeedbackRepository;
import com.example.webgiatui.repository.BookingRepository;
import com.example.webgiatui.repository.UserRepository;
import com.example.webgiatui.service.FeedbackService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public FeedbackServiceImpl(FeedbackRepository feedbackRepository, UserRepository userRepository, BookingRepository bookingRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public List<Feedback> findAll() {
        return feedbackRepository.findAll();
    }

    @Override
    public Feedback save(Feedback feedback) {
        if (feedback.getCreatedAt() == null) {
            feedback.setCreatedAt(LocalDateTime.now());
        }
        return feedbackRepository.save(feedback);
    }

    @Override
    public Feedback findById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id " + id));
    }

    /**
     * Updates a feedback
     */
    private Feedback update(Long id, Feedback feedbackDetails) {
        Feedback feedback = findById(id);
        
        feedback.setRating(feedbackDetails.getRating());
        feedback.setComment(feedbackDetails.getComment());
        
        if (feedbackDetails.getUser() != null && feedbackDetails.getUser().getId() != null) {
            User user = userRepository.findById(feedbackDetails.getUser().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            feedback.setUser(user);
        }
        
        if (feedbackDetails.getBooking() != null && feedbackDetails.getBooking().getId() != null) {
            Booking booking = bookingRepository.findById(feedbackDetails.getBooking().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            feedback.setBooking(booking);
        }
        
        return feedbackRepository.save(feedback);
    }

    @Override
    public void delete(Long id) {
        Feedback feedback = findById(id);
        feedbackRepository.delete(feedback);
    }

    @Override
    public List<Feedback> findByUserId(Long userId) {
        return feedbackRepository.findByUserId(userId);
    }

    @Override
    public List<Feedback> findByBookingId(Long bookingId) {
        return feedbackRepository.findByBookingId(bookingId);
    }

    /**
     * Find feedback with rating greater than or equal to specified value
     */
    @Override
    public List<Feedback> findByRatingGreaterThanEqual(Integer rating) {
        return feedbackRepository.findByRatingGreaterThanEqual(rating);
    }

    @Override
    public FeedbackDto convertToDto(Feedback feedback) {
        FeedbackDto dto = new FeedbackDto();
        dto.setId(feedback.getId());
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setCreatedAt(feedback.getCreatedAt());
        
        if (feedback.getUser() != null) {
            dto.setUserId(feedback.getUser().getId());
            dto.setUserName(feedback.getUser().getName());
        }
        
        if (feedback.getBooking() != null) {
            dto.setBookingId(feedback.getBooking().getId());
            dto.setBookingCode(feedback.getBooking().getBookingCode());
        }
        
        return dto;
    }

    @Override
    public Feedback convertToEntity(FeedbackDto dto) {
        Feedback feedback = new Feedback();
        
        // Set ID only for updates, not for creation
        if (dto.getId() != null) {
            feedback.setId(dto.getId());
        }
        
        feedback.setRating(dto.getRating());
        feedback.setComment(dto.getComment());
        
        if (dto.getCreatedAt() != null) {
            feedback.setCreatedAt(dto.getCreatedAt());
        } else {
            feedback.setCreatedAt(LocalDateTime.now());
        }
        
        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + dto.getUserId()));
            feedback.setUser(user);
        }
        
        if (dto.getBookingId() != null) {
            Booking booking = bookingRepository.findById(dto.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + dto.getBookingId()));
            feedback.setBooking(booking);
        }
        
        return feedback;
    }

    /**
     * Get all feedback DTOs
     */
    private List<FeedbackDto> getAllFeedbackDtos() {
        return findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
} 