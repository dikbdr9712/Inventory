// src/main/java/com/api/inventory/dto/RoleDTO.java
package com.api.inventory.dto;

import com.api.inventory.entity.Role;
import lombok.Data;

@Data
public class RoleDTO {

    private Long id;
    private String name;

    // Default constructor (required for frameworks like Jackson)
    public RoleDTO() {}

    // Constructor that converts from Role entity
    public RoleDTO(Role role) {
        if (role != null) {
            this.id = role.getId();
            this.name = role.getName();
        }
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
    
}