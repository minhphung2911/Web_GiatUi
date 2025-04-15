package com.example.webgiatui.service.impl;

import com.example.webgiatui.entity.Service;
import com.example.webgiatui.repository.ServiceRepository;
import com.example.webgiatui.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
@Transactional
public class ServiceServiceImpl implements ServiceService {
    
    private final ServiceRepository serviceRepository;
    
    @Autowired
    public ServiceServiceImpl(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Override
    public List<Service> getAll() {
        return serviceRepository.findAll();
    }

    @Override
    public Service create(Service service) {
        return serviceRepository.save(service);
    }

    @Override
    public Service getById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
    }

    @Override
    public Service update(Long id, Service serviceDetails) {
        Service existingService = getById(id);
        
        // Update fields
        if (serviceDetails.getName() != null) {
            existingService.setName(serviceDetails.getName());
        }
        
        if (serviceDetails.getPricePerKg() != null) {
            existingService.setPricePerKg(serviceDetails.getPricePerKg());
        }
        
        return serviceRepository.save(existingService);
    }

    @Override
    public void delete(Long id) {
        serviceRepository.deleteById(id);
    }

    @Override
    public List<Service> findByName(String name) {
        return serviceRepository.findByNameContaining(name);
    }
} 