package com.example.webgiatui.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Service extends BaseEntity<Long> {
    private static final long serialVersionUID = 1L;
    private String name; // Giặt khô, giặt nước...
    private Double pricePerKg;

    public Service(Long id, String name, Double pricePerKg) {
        super(id);
        this.name = name;
        this.pricePerKg = pricePerKg;
    }
}
