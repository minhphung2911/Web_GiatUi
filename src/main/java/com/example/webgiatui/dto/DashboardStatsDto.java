package com.example.webgiatui.dto;

import java.util.Map;

/**
 * Data Transfer Object for admin dashboard statistics
 */
public class DashboardStatsDto {
    private int totalBookings;
    private int totalCustomers;
    private double totalRevenue;
    private int completedOrders;
    private Map<String, Object> customerStats;
    private Map<String, Object> revenueStats;
    private Map<String, Object> serviceStats;
    
    public DashboardStatsDto() {
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

    public int getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(int completedOrders) {
        this.completedOrders = completedOrders;
    }

    public Map<String, Object> getCustomerStats() {
        return customerStats;
    }

    public void setCustomerStats(Map<String, Object> customerStats) {
        this.customerStats = customerStats;
    }

    public Map<String, Object> getRevenueStats() {
        return revenueStats;
    }

    public void setRevenueStats(Map<String, Object> revenueStats) {
        this.revenueStats = revenueStats;
    }

    public Map<String, Object> getServiceStats() {
        return serviceStats;
    }

    public void setServiceStats(Map<String, Object> serviceStats) {
        this.serviceStats = serviceStats;
    }
} 