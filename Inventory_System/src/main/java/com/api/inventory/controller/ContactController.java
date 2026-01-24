// src/main/java/com/api/inventory/controller/ContactController.java

package com.api.inventory.controller;

import com.api.inventory.entity.ContactMessage;
import com.api.inventory.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://127.0.0.1:5500") // adjust to your frontend URL
public class ContactController {

    @Autowired
    private ContactMessageRepository repository;

    @PostMapping
    public ResponseEntity<String> submitContactForm(@RequestBody ContactMessage message) {
        repository.save(message);
        return ResponseEntity.ok("Message received!");
    }

    @GetMapping("/all")
    public List<ContactMessage> getAllMessages() {
        return repository.findAll();
    }
}