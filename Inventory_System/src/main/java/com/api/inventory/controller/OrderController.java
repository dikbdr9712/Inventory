package com.api.inventory.controller;

import com.api.inventory.dto.OrderItemResponseDTO;
import com.api.inventory.dto.OrderRequestDTO;
import com.api.inventory.dto.OrderVerificationDTO;
import com.api.inventory.dto.ShipmentRequest;
import com.api.*;
import com.api.inventory.dto.VerificationRequestDTO;
import com.api.inventory.entity.ItemMaster;
import com.api.inventory.entity.Order;
import com.api.inventory.entity.OrderItem;
import com.api.inventory.entity.Payment;
import com.api.inventory.exception.ResourceNotFoundException;
import com.api.inventory.repository.ItemMasterRepository;
import com.api.inventory.repository.OrderItemRepository;
import com.api.inventory.service.EmailService;
import com.api.inventory.service.OrderService;
import com.api.inventory.service.PaymentService;

import lombok.RequiredArgsConstructor;

import java.util.List;

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
    private PaymentService paymentService;
	@Autowired
    private EmailService emailService;

    // Keep your existing repositories if used elsewhere (e.g., in createOrder logic)
    // If not used, you can remove these — but keeping for safety
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
        return orderService.getOrderItemsByOrderId(orderId);
    }
    
    @GetMapping("/{orderId}")
    public Order getOrderById(@PathVariable Long orderId) {
        return orderService.getOrderById(orderId);
    }

    // ⚠️ Note: This path overlaps with base /api/orders — consider removing "/orders"
    @PostMapping("/{orderId}/confirm-payment")
    public ResponseEntity<Void> confirmPayment(@PathVariable Long orderId) {
        orderService.confirmPayment(orderId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{orderId}/ship")
    public ResponseEntity<Void> shipOrder(@PathVariable Long orderId, 
                                        @RequestBody ShipmentRequest request) {
        orderService.shipOrder(orderId, request.getShipmentId());
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{orderId}/verify")
    public ResponseEntity<Order> verifyOrder(
            @PathVariable Long orderId,
            @RequestBody VerificationRequestDTO request) {

        // 1. Find and update order
        Order order = orderService.findById(orderId);
        order.setOrderStatus(request.getStatus());
        order.setNote(request.getNote());

        // 2. Handle payment status update (if confirmed)
        if ("CONFIRMED".equals(request.getStatus())) {
            // ✅ Use INSTANCE (paymentService), not class name
            Payment payment = paymentService.findByOrderId(orderId);
            if (payment != null) {
                payment.setStatus("confirmed");
                paymentService.save(payment);
            }

            // 3. Send confirmation email
            emailService.sendEmail(
                order.getCustomerEmail(),
                "Your Order #" + order.getOrderId() + " is Confirmed!",
                "Thank you! Your payment has been verified. We’ll process your order shortly."
            );
        }

        // 4. Save updated order
        Order updatedOrder = orderService.save(order);
        return ResponseEntity.ok(updatedOrder);
    }
    
    @GetMapping("/status/{status}")
    public List<OrderVerificationDTO> getOrdersForVerification(@PathVariable String status) {
        return orderService.getOrdersForVerification(status);
    }
}