package com.example.webgiatui.service;

import com.example.webgiatui.dto.AdminDashboardDto;
import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.Booking.BookingStatus;
import com.example.webgiatui.entity.Booking.PaymentStatus;
import com.example.webgiatui.entity.Feedback;
import com.example.webgiatui.entity.Service;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.repository.BookingRepository;
import com.example.webgiatui.repository.FeedbackRepository;
import com.example.webgiatui.repository.ServiceRepository;
import com.example.webgiatui.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Admin login
     */
    public Map<String, Object> login(String email, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            // Check if user has admin role
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                return null;
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User admin = userRepository.findByEmail(email);
            if (admin == null) {
                return null;
            }

            Map<String, Object> adminData = new HashMap<>();
            adminData.put("id", admin.getId());
            adminData.put("name", admin.getName());
            adminData.put("email", admin.getEmail());
            adminData.put("role", "ADMIN");

            return adminData;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Admin logout
     */
    public void logout() {
        SecurityContextHolder.clearContext();
    }

    /**
     * Get dashboard statistics
     */
    public AdminDashboardDto getDashboardStats() {
        AdminDashboardDto stats = new AdminDashboardDto();

        // Get all entities
        List<Booking> allBookings = bookingRepository.findAll();
        List<User> allUsers = userRepository.findAll();
        List<Service> allServices = serviceRepository.findAll();
        List<Feedback> allFeedback = feedbackRepository.findAll();

        // Count completed bookings
        long completedBookings = allBookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                .count();

        // Calculate total revenue
        double totalRevenue = allBookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(Booking::getTotalPrice)
                .sum();

        // Set basic stats
        stats.setTotalBookings(allBookings.size());
        stats.setTotalCustomers(allUsers.size());
        stats.setTotalRevenue(totalRevenue);
        stats.setCompletedBookings((int) completedBookings);

        // Generate monthly data for charts
        generateMonthlyStatsForCharts(stats, allBookings, allUsers);

        // Generate service stats
        generateServiceStats(stats, allBookings, allServices);

        return stats;
    }

    /**
     * Helper method to generate monthly stats for charts
     */
    private void generateMonthlyStatsForCharts(AdminDashboardDto stats, List<Booking> allBookings, List<User> allUsers) {
        // Get current year
        int currentYear = LocalDate.now().getYear();

        // Initialize chart data with month labels
        Map<String, Object> customerStats = new HashMap<>();
        Map<String, Double> revenueByMonth = new HashMap<>();

        List<String> monthLabels = List.of("T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12");
        customerStats.put("labels", monthLabels);

        // Initialize data arrays
        List<Integer> newCustomers = new ArrayList<>();
        List<Integer> returningCustomers = new ArrayList<>();

        // For each month
        for (int i = 1; i <= 12; i++) {
            final int month = i;
            YearMonth yearMonth = YearMonth.of(currentYear, month);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();
            String monthKey = "T" + month;

            // Count new users registered this month
            int newUsersCount = (int) allUsers.stream()
                    .filter(user -> user.getCreatedAt() != null &&
                            !user.getCreatedAt().toLocalDate().isBefore(startDate) &&
                            !user.getCreatedAt().toLocalDate().isAfter(endDate))
                    .count();

            // Count returning customers (users who made a booking this month but registered before)
            int returningUsersCount = (int) allBookings.stream()
                    .filter(booking -> booking.getCreatedAt() != null &&
                            booking.getCreatedAt().getMonth().getValue() == month &&
                            booking.getCreatedAt().getYear() == currentYear &&
                            booking.getUser() != null &&
                            booking.getUser().getCreatedAt() != null &&
                            booking.getUser().getCreatedAt().toLocalDate().isBefore(startDate))
                    .map(booking -> booking.getUser().getId())
                    .distinct()
                    .count();

            // Calculate monthly revenue
            double monthlyRevenue = allBookings.stream()
                    .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED &&
                            booking.getCreatedAt() != null &&
                            booking.getCreatedAt().getMonth().getValue() == month &&
                            booking.getCreatedAt().getYear() == currentYear)
                    .mapToDouble(Booking::getTotalPrice)
                    .sum();

            newCustomers.add(newUsersCount);
            returningCustomers.add(returningUsersCount);
            revenueByMonth.put(monthKey, monthlyRevenue);
        }

        // Set chart data
        customerStats.put("newCustomers", newCustomers);
        customerStats.put("returningCustomers", returningCustomers);

        stats.setCustomerStats(customerStats);
        stats.setRevenueByMonth(revenueByMonth);
    }

    /**
     * Helper method to generate service stats for charts
     */
    private void generateServiceStats(AdminDashboardDto stats, List<Booking> allBookings, List<Service> allServices) {
        Map<String, Object> serviceStats = new HashMap<>();

        List<String> serviceLabels = allServices.stream()
                .map(Service::getName)
                .collect(Collectors.toList());

        List<Integer> serviceData = allServices.stream()
                .map(service -> (int) allBookings.stream()
                        .filter(booking -> booking.getService().getId().equals(service.getId()))
                        .count())
                .collect(Collectors.toList());

        serviceStats.put("labels", serviceLabels);
        serviceStats.put("data", serviceData);

        stats.setServiceStats(serviceStats);
    }

    /**
     * Get all bookings for admin view
     * @return list of all bookings
     */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    /**
     * Get booking statistics grouped by status
     * @return map of status to count
     */
    public Map<String, Long> getBookingStatsByStatus() {
        List<Booking> allBookings = bookingRepository.findAll();
        return allBookings.stream()
                .collect(Collectors.groupingBy(
                    booking -> booking.getStatus().toString(),
                    Collectors.counting()
                ));
    }

    /**
     * Get revenue statistics by month for the current year
     * @return map of month to revenue amount
     */
    public Map<String, Double> getRevenueByMonth() {
        int currentYear = LocalDate.now().getYear();
        List<Booking> completedBookings = bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED 
                        && booking.getCreatedAt() != null 
                        && booking.getCreatedAt().getYear() == currentYear)
                .collect(Collectors.toList());
                
        Map<String, Double> revenueByMonth = new HashMap<>();
        for (int month = 1; month <= 12; month++) {
            String monthKey = "T" + month;
            final int currentMonth = month;
            double monthlyRevenue = completedBookings.stream()
                    .filter(booking -> booking.getCreatedAt().getMonthValue() == currentMonth)
                    .mapToDouble(Booking::getTotalPrice)
                    .sum();
            revenueByMonth.put(monthKey, monthlyRevenue);
        }
        return revenueByMonth;
    }

    /**
     * Get user statistics
     * @return map containing user count statistics
     */
    public Map<String, Object> getUserStats() {
        List<User> allUsers = userRepository.findAll();
        Map<String, Object> stats = new HashMap<>();
        
        // Count total users
        stats.put("totalUsers", allUsers.size());
        
        // Count users by role
        Map<String, Long> usersByRole = allUsers.stream()
                .flatMap(user -> user.getRoles().stream())
                .collect(Collectors.groupingBy(
                    role -> role.getName(),
                    Collectors.counting()
                ));
        stats.put("usersByRole", usersByRole);
        
        return stats;
    }
} 