package com.example.webgiatui.entity;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Customer extends BaseEntity<Long> {
    private String fullName;
    private String phoneNumber;
    private String address;
    private String email;
}
