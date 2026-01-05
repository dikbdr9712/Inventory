package com.api.inventory.controller;

import com.api.inventory.dto.OrderItemResponseDTO;
import com.api.inventory.dto.OrderRequestDTO;
import com.api.inventory.dto.ShipmentRequest;
import com.api.inventory.entity.ItemMaster;
import com.api.inventory.entity.Order;
import com.api.inventory.entity.OrderItem;
import com.api.inventory.repository.ItemMasterRepository;
import com.api.inventory.repository.OrderItemRepository;
import com.api.inventory.repository.OrderRepository;
import com.api.inventory.service.OrderService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

	@Autowired
    private OrderService orderService;
	
	@Autowired
    private OrderItemRepository orderItemRepository;
	
	@Autowired
	private ItemMasterRepository itemMasterRepository;
	

    @PostMapping
    public Order createOrder(@RequestBody OrderRequestDTO dto) {
        return orderService.createOrder(dto);
    }
    
    @PostMapping("/{orderId}/cancel")
    public void cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
    }

    @PostMapping("/{orderId}/confirm")
    public void confirmOrder(@PathVariable Long orderId) {
        orderService.confirmOrder(orderId);
    }
    
    @PostMapping("/{orderId}/complete")
    public void completeOrder(@PathVariable Long orderId) {
        orderService.completeOrder(orderId);
    }
    
    @GetMapping("/customer/{email}")
    public List<Order> getOrdersByCustomer(@PathVariable String email) {
        return orderService.getOrdersByCustomerEmail(email);
    }

    @GetMapping("/{orderId}/items")
    public List<OrderItemResponseDTO> getOrderItems(@PathVariable Long orderId) {
        return orderService.getOrderItemsByOrderId(orderId); // ✅ Clean!
    }
    @GetMapping("/{orderId}")
    public Order getOrderById(@PathVariable Long orderId) {
        return orderService.getOrderById(orderId); // ✅ Clean!
    }
 // OrderController.java
    @PostMapping("/orders/{orderId}/confirm-payment")
    public ResponseEntity<Void> confirmPayment(@PathVariable Long orderId) {
        orderService.confirmPayment(orderId); // ← NEW method
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/orders/{orderId}/ship")
    public ResponseEntity<Void> shipOrder(@PathVariable Long orderId, 
                                        @RequestBody ShipmentRequest request) {
        // request.getShipmentId() must return String
        orderService.shipOrder(orderId, request.getShipmentId());
        return ResponseEntity.ok().build();
    }
}