package com.example.webgiatui.repository;

import com.example.webgiatui.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    /**
     * Find services by name containing the given pattern (case-insensitive)
     */
    List<Service> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find service by exact name (case-insensitive)
     */
    Service findByNameIgnoreCase(String name);
    
    /**
     * Find active services
     */
    List<Service> findByStatus(Service.Status status);
}
