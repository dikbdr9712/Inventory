// src/main/java/com/api/inventory/service/EmailService.java
package com.api.inventory.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendEmail(String to, String subject, String body) {
        // For now, just log it (replace later with real email logic)
        System.out.println("📧 Email sent to: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + body);
        
        // Later: integrate with JavaMailSender, SendGrid, etc.
    }
}