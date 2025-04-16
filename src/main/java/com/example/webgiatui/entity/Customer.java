package com.example.webgiatui.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * This entity has been deprecated as we're using the User entity instead.
 * Will be removed in future versions.
 * @deprecated Use {@link User} entity instead with appropriate role.
 */
@Deprecated(forRemoval = true)
@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends BaseEntity<Long> {
    private static final long serialVersionUID = 1L;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String email;

    public Customer(Long id, String fullName, String phoneNumber, String address, String email) {
        super(id);
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.email = email;
    }
}
