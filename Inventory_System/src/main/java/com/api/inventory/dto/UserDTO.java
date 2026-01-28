package com.api.inventory.dto;

import com.api.inventory.entity.User;

public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private RoleDTO role; 
    
    
    public UserDTO() {}

    // Constructor to convert from User entity
    public UserDTO(User user) {
        if (user != null) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.phone = user.getPhone();
            this.role = user.getRole() != null ? new RoleDTO(user.getRole()) : null;
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
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public RoleDTO getRole() {
		return role;
	}
	public void setRole(RoleDTO role) {
		this.role = role;
	}
    
}
