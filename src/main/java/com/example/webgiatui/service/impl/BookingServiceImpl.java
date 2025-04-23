package com.example.webgiatui.service.impl;

import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.Booking.BookingStatus;
import com.example.webgiatui.entity.Booking.PaymentStatus;
import com.example.webgiatui.repository.BookingRepository;
import com.example.webgiatui.repository.UserRepository;
import com.example.webgiatui.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    @Autowired
    public BookingServiceImpl(BookingRepository bookingRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking findById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }
    
    @Override
    public Booking findByBookingCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode);
    }

    @Override
    public List<Booking> findByUserId(Long userId) {
        // Check if user exists first
        if (!userRepository.existsById(userId)) {
            // Return empty list for non-existent users
            return new ArrayList<>();
        }
        return bookingRepository.findByUserId(userId);
    }

    @Override
    public List<Booking> findByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }
    
    @Override
    public List<Booking> findByPaymentStatus(PaymentStatus paymentStatus) {
        return bookingRepository.findByPaymentStatus(paymentStatus);
    }

    @Override
    public List<Booking> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return bookingRepository.findByBookingDateBetween(startDate, endDate);
    }

    @Override
    public List<Booking> findByPickupDate(LocalDateTime pickupDate) {
        return bookingRepository.findByPickupDateBetween(
            pickupDate.withHour(0).withMinute(0).withSecond(0),
            pickupDate.withHour(23).withMinute(59).withSecond(59)
        );
    }

    @Override
    @Transactional
    public Booking save(Booking booking) {
        // If it's a new booking, set initial values
        if (booking.getId() == null) {
            booking.setCreatedAt(LocalDateTime.now());
            booking.setUpdatedAt(LocalDateTime.now());
            booking.setStatus(BookingStatus.PENDING);
            booking.setPaymentStatus(PaymentStatus.PENDING);
            booking.setBookingCode(generateBookingCode());
        } else {
            booking.setUpdatedAt(LocalDateTime.now());
        }
        
        return bookingRepository.save(booking);
    }
    
    @Override
    public String generateBookingCode() {
        LocalDateTime now = LocalDateTime.now();
        String datePrefix = now.format(DateTimeFormatter.ofPattern("yyMMdd"));
        
        // Generate a 4-digit random number
        int randomNum = random.nextInt(10000);
        String randomStr = String.format("%04d", randomNum);
        
        // Create the booking code in format: BK-YYMMDD-XXXX
        String bookingCode = "BK-" + datePrefix + "-" + randomStr;
        
        // Check if the code already exists, if so, regenerate
        if (findByBookingCode(bookingCode) != null) {
            return generateBookingCode();
        }
        
        return bookingCode;
    }

    @Override
    @Transactional
    public Booking updateStatus(Long id, BookingStatus status) {
        Booking booking = findById(id);
        if (booking != null) {
            booking.setStatus(status);
            booking.setUpdatedAt(LocalDateTime.now());
            return bookingRepository.save(booking);
        }
        return null;
    }
    
    @Override
    @Transactional
    public Booking updatePaymentStatus(Long id, PaymentStatus paymentStatus) {
        Booking booking = findById(id);
        if (booking != null) {
            booking.setPaymentStatus(paymentStatus);
            booking.setUpdatedAt(LocalDateTime.now());
            return bookingRepository.save(booking);
        }
        return null;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        bookingRepository.deleteById(id);
    }
} 