package com.example.webgiatui.dto;

import java.util.Map;

/**
 * Data Transfer Object for admin dashboard statistics with comprehensive metrics
 */
public class AdminDashboardDto {
    private int totalBookings;
    private int totalCustomers;
    private double totalRevenue;
    private int completedBookings;
    private int pendingBookings;
    private int cancelledBookings;
    
    private Map<String, Integer> bookingsByStatus;
    private Map<String, Double> revenueByMonth;
    private Map<String, Object> customerStats;
    private Map<String, Object> serviceStats;
    
    public AdminDashboardDto() {
    }

    public int getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(int totalBookings) {
        this.totalBookings = totalBookings;
    }

    public int getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(int totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public int getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(int completedBookings) {
        this.completedBookings = completedBookings;
    }
    
    public int getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(int pendingBookings) {
        this.pendingBookings = pendingBookings;
    }
    
    public int getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(int cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public Map<String, Integer> getBookingsByStatus() {
        return bookingsByStatus;
    }

    public void setBookingsByStatus(Map<String, Integer> bookingsByStatus) {
        this.bookingsByStatus = bookingsByStatus;
    }
    
    public Map<String, Double> getRevenueByMonth() {
        return revenueByMonth;
    }

    public void setRevenueByMonth(Map<String, Double> revenueByMonth) {
        this.revenueByMonth = revenueByMonth;
    }

    public Map<String, Object> getCustomerStats() {
        return customerStats;
    }

    public void setCustomerStats(Map<String, Object> customerStats) {
        this.customerStats = customerStats;
    }

    public Map<String, Object> getServiceStats() {
        return serviceStats;
    }

    public void setServiceStats(Map<String, Object> serviceStats) {
        this.serviceStats = serviceStats;
    }
} 