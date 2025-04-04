package com.example.webgiatui.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", nullable = false)
    private Long id;

    @Size(max = 50)
    @Column(name = "Code", length = 50)
    private String code;

    @Size(max = 100)
    @Column(name = "permission_name", length = 100)
    private String permissionName;

    @ManyToMany(mappedBy = "permissions")
    private List<Role> roles = new ArrayList<>();
}