package com.example.webgiatui.entity;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Service extends BaseEntity<Long> {
    private String name; // Giặt khô, giặt nước...
    private Double pricePerKg;

    public Service() {
        super();
    }
}
