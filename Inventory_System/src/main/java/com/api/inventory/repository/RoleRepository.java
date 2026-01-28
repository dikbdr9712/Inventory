// src/main/java/com/api/inventory/repository/RoleRepository.java
package com.api.inventory.repository;

import com.api.inventory.entity.Role;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
	Optional<Role> findByName(String name);
}