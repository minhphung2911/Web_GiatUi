package com.example.webgiatui;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Permission  {
    @Id
    @Column(name = "Id", nullable = false)
    private Long id;

    @Size(max = 50)
    @Column(name = "Code", length = 50)
    private String code;

    @Size(max = 100)
    @Column(name = "permission_name", length = 100)
    private String permissionName;

}