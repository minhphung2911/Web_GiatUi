package com.example.webgiatui.repository;

import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.Booking.BookingStatus;
import com.example.webgiatui.entity.Booking.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    /**
     * Find bookings by user id
     */
    List<Booking> findByUserId(Long userId);
    
    /**
     * Find bookings by status
     */
    List<Booking> findByStatus(BookingStatus status);
    
    /**
     * Find bookings by payment status
     */
    List<Booking> findByPaymentStatus(PaymentStatus paymentStatus);
    
    /**
     * Find by booking code
     */
    Booking findByBookingCode(String bookingCode);
    
    /**
     * Find bookings by booking date between start and end dates
     */
    List<Booking> findByBookingDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find bookings by pickup date between start and end dates
     */
    List<Booking> findByPickupDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find bookings by delivery date between start and end dates
     */
    List<Booking> findByDeliveryDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find bookings by service id
     */
    List<Booking> findByServiceId(Long serviceId);
} 