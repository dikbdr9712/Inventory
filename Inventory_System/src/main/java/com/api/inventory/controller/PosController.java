package com.api.inventory.controller;

import com.api.inventory.entity.Order;
import com.api.inventory.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class PosController {

    @Autowired
    private OrderService orderService;

    // Get all POS sales (for history page)
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<List<Order>> getPosSalesHistory() {
        List<Order> posSales = orderService.getPosSales();
        return ResponseEntity.ok(posSales);
    }
}