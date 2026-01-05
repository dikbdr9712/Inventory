package com.api.inventory.service;

import java.util.List;

import com.api.inventory.dto.OrderItemResponseDTO;
import com.api.inventory.dto.OrderRequestDTO;
import com.api.inventory.entity.Order;

public interface OrderService {
    Order createOrder(OrderRequestDTO dto);
    void confirmOrder(Long orderId);
    void cancelOrder(Long orderId);
    void completeOrder(Long orderId);
    List<Order> getOrdersByCustomerEmail(String email);
    List<OrderItemResponseDTO> getOrderItemsByOrderId(Long orderId);
    Order getOrderById(Long orderId);
	void confirmPayment(Long orderId);
	 void shipOrder(Long orderId, String shipmentId);
}