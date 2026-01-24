// src/main/java/com/api/inventory/service/PaymentService.java

package com.api.inventory.service;

import com.api.inventory.dto.PaymentRequestDTO;
import com.api.inventory.entity.Payment;

public interface PaymentService {
    Payment createPayment(PaymentRequestDTO dto);
    Payment updatePaymentStatus(Long paymentId, String status);
    Payment getPaymentByOrderId(Long orderId);
    Payment findByOrderId(Long orderId);
    Payment save(Payment payment);
    Payment findById(Long paymentId);
}