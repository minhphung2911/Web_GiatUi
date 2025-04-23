package com.example.webgiatui.service;

import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.Booking.BookingStatus;
import com.example.webgiatui.entity.Booking.PaymentStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingService {
    
    /**
     * Find all bookings
     * @return list of all bookings
     */
    List<Booking> findAll();
    
    /**
     * Find booking by id
     * @param id booking id
     * @return booking if found, null otherwise
     */
    Booking findById(Long id);
    
    /**
     * Find booking by booking code
     * @param bookingCode booking code
     * @return booking if found, null otherwise
     */
    Booking findByBookingCode(String bookingCode);
    
    /**
     * Find bookings by user id
     * @param userId user id
     * @return list of bookings for the user
     */
    List<Booking> findByUserId(Long userId);
    
    /**
     * Find bookings by status
     * @param status booking status
     * @return list of bookings with the given status
     */
    List<Booking> findByStatus(BookingStatus status);
    
    /**
     * Find bookings by payment status
     * @param paymentStatus payment status
     * @return list of bookings with the given payment status
     */
    List<Booking> findByPaymentStatus(PaymentStatus paymentStatus);
    
    /**
     * Find bookings between two dates
     * @param startDate start date
     * @param endDate end date
     * @return list of bookings between the given dates
     */
    List<Booking> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find bookings by pickup date
     * @param pickupDate the pickup date
     * @return list of bookings with the given pickup date
     */
    List<Booking> findByPickupDate(LocalDateTime pickupDate);
    
    /**
     * Save or update a booking
     * @param booking booking to save or update
     * @return saved or updated booking
     */
    Booking save(Booking booking);
    
    /**
     * Generate a unique booking code
     * @return unique booking code
     */
    String generateBookingCode();
    
    /**
     * Update booking status
     * @param id booking id
     * @param status new status
     * @return updated booking
     */
    Booking updateStatus(Long id, BookingStatus status);
    
    /**
     * Update payment status
     * @param id booking id
     * @param paymentStatus new payment status
     * @return updated booking
     */
    Booking updatePaymentStatus(Long id, PaymentStatus paymentStatus);
    
    /**
     * Delete a booking
     * @param id booking id
     */
    void delete(Long id);
} 