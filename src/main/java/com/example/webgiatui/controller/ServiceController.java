package com.example.webgiatui.controller;

import com.example.webgiatui.entity.Service;
import com.example.webgiatui.repository.ServiceRepository;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private static final Logger logger = LoggerFactory.getLogger(ServiceController.class);
    private final ServiceRepository serviceRepository;

    @Autowired
    public ServiceController(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllServices() {
        try {
            logger.info("Fetching all services");
            List<Service> services = serviceRepository.findAll();
            logger.info("Retrieved {} services", services.size());
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            logger.error("Error retrieving services: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving services");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> createService(@RequestBody Service service) {
        try {
            logger.info("Creating new service: {}", service.getName());
            Service saved = serviceRepository.save(service);
            logger.info("Service created with ID: {}", saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            logger.error("Error creating service: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error creating service");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceById(@PathVariable Long id) {
        try {
            logger.info("Fetching service with ID: {}", id);
            Optional<Service> serviceOptional = serviceRepository.findById(id);
            
            if (serviceOptional.isPresent()) {
                Service service = serviceOptional.get();
                logger.info("Service found: {}", service.getName());
                return ResponseEntity.ok(service);
            } else {
                logger.warn("Service not found with ID: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Service not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            logger.error("Error retrieving service with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving service");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Service service) {
        try {
            logger.info("Updating service with ID: {}", id);
            Optional<Service> serviceOptional = serviceRepository.findById(id);
            
            if (serviceOptional.isPresent()) {
                service.setId(id);
                Service updated = serviceRepository.save(service);
                logger.info("Service updated: {}", updated.getName());
                return ResponseEntity.ok(updated);
            } else {
                logger.warn("Service not found with ID: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Service not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            logger.error("Error updating service with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating service");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        try {
            logger.info("Deleting service with ID: {}", id);
            if (serviceRepository.existsById(id)) {
                serviceRepository.deleteById(id);
                logger.info("Service deleted with ID: {}", id);
                Map<String, String> response = new HashMap<>();
                response.put("message", "Service deleted successfully");
                return ResponseEntity.ok(response);
            }
            logger.warn("Service not found with ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Service not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            logger.error("Error deleting service with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error deleting service");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
