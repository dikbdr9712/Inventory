package com.api.inventory.repository;

import com.api.inventory.entity.Order;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

	List<Order> findByCustomerEmail(String customerEmail);
	 List<Order> findAllByOrderByCreatedAtDesc();
	}