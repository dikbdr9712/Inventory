// AdminOrderController.java
package com.api.inventory.controller;

import com.api.inventory.dto.AdminOrderResponseDTO;
import com.api.inventory.service.AdminOrderService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {
	@Autowired
    private AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<List<AdminOrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(adminOrderService.getAllOrdersForAdmin());
    }

    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<Void> confirmOrder(@PathVariable Long orderId) {
        adminOrderService.confirmOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        adminOrderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/complete")
    public ResponseEntity<Void> completeOrder(@PathVariable Long orderId) {
        adminOrderService.completeOrder(orderId);
        return ResponseEntity.ok().build();
    }
}