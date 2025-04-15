package com.example.webgiatui.service;

import com.example.webgiatui.entity.Service;
import java.util.List;

public interface ServiceService extends GenericService<Service> {
    
    /**
     * Find all services in the system
     */
    @Override
    List<Service> getAll();
    
    /**
     * Create a new service
     */
    @Override
    Service create(Service service);
    
    /**
     * Get service by ID
     */
    @Override
    Service getById(Long id);
    
    /**
     * Update an existing service
     */
    @Override
    Service update(Long id, Service service);
    
    /**
     * Delete a service
     */
    @Override
    void delete(Long id);
    
    /**
     * Find services by name
     */
    List<Service> findByName(String name);
} 