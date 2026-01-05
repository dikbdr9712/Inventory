// src/main/java/com/api/inventory/service/AdminOrderService.java
package com.api.inventory.service;

import java.util.List;
import com.api.inventory.dto.AdminOrderResponseDTO;

public interface AdminOrderService {
    List<AdminOrderResponseDTO> getAllOrdersForAdmin();
    void confirmOrder(Long orderId);
    void cancelOrder(Long orderId);
    void completeOrder(Long orderId);
    
    // Optional: pre-check for UI
    boolean canOrderBeConfirmed(Long orderId);
}