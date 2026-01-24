package com.api.inventory.repository;

import com.api.inventory.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
}