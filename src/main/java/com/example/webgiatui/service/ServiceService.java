package com.example.webgiatui.service;

import com.example.webgiatui.entity.Service;
import java.util.List;

public interface ServiceService {
    
    /**
     * Find all services
     * @return list of all services
     */
    List<Service> findAll();
    
    /**
     * Find all active services
     * @return list of all active services
     */
    List<Service> findAllActive();
    
    /**
     * Find service by id
     * @param id service id
     * @return service if found, null otherwise
     */
    Service findById(Long id);
    
    /**
     * Find service by name
     * @param name service name
     * @return service if found, null otherwise
     */
    Service findByName(String name);
    
    /**
     * Save or update a service
     * @param service service to save or update
     * @return saved or updated service
     */
    Service save(Service service);
    
    /**
     * Delete a service
     * @param id service id
     */
    void delete(Long id);
} 