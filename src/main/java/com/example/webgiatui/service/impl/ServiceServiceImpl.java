package com.example.webgiatui.service.impl;

import com.example.webgiatui.entity.Service;
import com.example.webgiatui.repository.ServiceRepository;
import com.example.webgiatui.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@org.springframework.stereotype.Service
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;

    @Autowired
    public ServiceServiceImpl(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Override
    public List<Service> findAll() {
        List<Service> services = serviceRepository.findAll();
        if (services.isEmpty()) {
            createDefaultServices();
            services = serviceRepository.findAll();
        }
        return services;
    }
    
    /**
     * Find all active services
     */
    public List<Service> findAllActive() {
        List<Service> services = serviceRepository.findByStatus(Service.Status.ACTIVE);
        if (services.isEmpty()) {
            createDefaultServices();
            services = serviceRepository.findByStatus(Service.Status.ACTIVE);
        }
        return services;
    }

    @Override
    public Service findById(Long id) {
        return serviceRepository.findById(id).orElse(null);
    }

    @Override
    public Service findByName(String name) {
        return serviceRepository.findByNameIgnoreCase(name);
    }

    @Override
    @Transactional
    public Service save(Service service) {
        if (service.getCreatedAt() == null) {
            service.setCreatedAt(LocalDateTime.now());
        }
        service.setUpdatedAt(LocalDateTime.now());
        return serviceRepository.save(service);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        serviceRepository.deleteById(id);
    }

    private void createDefaultServices() {
        Service standardWash = new Service();
        standardWash.setName("Standard Wash");
        standardWash.setDescription("Regular washing service with standard detergent.");
        standardWash.setPricePerKg(50000.0);
        standardWash.setImageUrl("/img/services/wash-fold.jpg");
        standardWash.setStatus(Service.Status.ACTIVE);
        standardWash.setCreatedAt(LocalDateTime.now());
        standardWash.setUpdatedAt(LocalDateTime.now());
        save(standardWash);

        Service premiumWash = new Service();
        premiumWash.setName("Premium Wash");
        premiumWash.setDescription("Premium washing with fabric softener and stain removal.");
        premiumWash.setPricePerKg(70000.0);
        premiumWash.setImageUrl("/img/services/premium-wash.jpg");
        premiumWash.setStatus(Service.Status.ACTIVE);
        premiumWash.setCreatedAt(LocalDateTime.now());
        premiumWash.setUpdatedAt(LocalDateTime.now());
        save(premiumWash);

        Service dryCleaning = new Service();
        dryCleaning.setName("Dry Cleaning");
        dryCleaning.setDescription("Professional dry cleaning for delicate fabrics.");
        dryCleaning.setPricePerKg(100000.0);
        dryCleaning.setImageUrl("/img/services/dry-cleaning.jpg");
        dryCleaning.setStatus(Service.Status.ACTIVE);
        dryCleaning.setCreatedAt(LocalDateTime.now());
        dryCleaning.setUpdatedAt(LocalDateTime.now());
        save(dryCleaning);
    }
} 