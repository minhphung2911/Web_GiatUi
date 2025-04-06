package com.example.webgiatui.entity;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Staff extends BaseEntity<Long> {
    private String fullName;
    private String phoneNumber;
    private String shift; // Sáng, chiều, tối

    public Staff() {
        super();
    }
}
