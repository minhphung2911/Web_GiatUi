package com.example.webgiatui.repository;

import com.example.webgiatui.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    /**
     * Find services by name containing the given string (case-insensitive)
     */
    List<Service> findByNameContaining(String name);
    
}
