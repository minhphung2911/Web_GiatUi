package com.example.webgiatui.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "staffs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Staff extends BaseEntity<Long> {
    private static final long serialVersionUID = 1L;
    private String fullName;
    private String phoneNumber;
    private String shift; // Sáng, chiều, tối

    public Staff(Long id, String fullName, String phoneNumber, String shift) {
        super(id);
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.shift = shift;
    }
}
