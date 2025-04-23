package com.example.webgiatui.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Feedback extends BaseEntity<Long> {
    private static final long serialVersionUID = 1L;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @Column(nullable = false)
    private Integer rating; // From 1-5 stars
    
    @Column(length = 500)
    private String comment;
    
    private LocalDateTime createdAt = LocalDateTime.now();
} 