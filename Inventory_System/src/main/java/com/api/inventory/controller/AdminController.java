package com.api.inventory.controller;

import com.api.inventory.entity.User;
import com.api.inventory.dto.UserDTO;
import com.api.inventory.entity.Role;
import com.api.inventory.repository.UserRepository;
import com.api.inventory.repository.RoleRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Only admins can access these endpoints
public class AdminController {

 @Autowired
 private UserRepository userRepository;

 @Autowired
 private RoleRepository roleRepository;

 @PutMapping("/users/{userId}/role")
 public ResponseEntity<?> updateUserRole(
         @PathVariable Long userId,
         @RequestParam Long roleId) {

     try {
         User user = userRepository.findById(userId)
                 .orElseThrow(() -> new RuntimeException("User not found"));

         Role newRole = roleRepository.findById(roleId)
                 .orElseThrow(() -> new RuntimeException("Role not found"));

         user.setRole(newRole);
         userRepository.save(user);

         return ResponseEntity.ok(new UpdateResponse(
             "success",
             "User role updated successfully to: " + newRole.getName(),
             newRole.getName()
         ));

     } catch (Exception e) {
         return ResponseEntity.status(400).body(new UpdateResponse(
             "error",
             "Update failed: " + e.getMessage(),
             null
         ));
     }
 }

 // DTO for response
 static class UpdateResponse {
     public String status;
     public String message;
     public String newRole;

     public UpdateResponse(String status, String message, String newRole) {
         this.status = status;
         this.message = message;
         this.newRole = newRole;
     }
 }
 
 @GetMapping("/users")
 public List<UserDTO> getAllUsers() {
     return userRepository.findAll().stream()
         .map(UserDTO::new)
         .toList();
 }
}