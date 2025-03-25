package com.example.webgiatui.repository;

import com.example.webgiatui.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Role findByName(String name);
}