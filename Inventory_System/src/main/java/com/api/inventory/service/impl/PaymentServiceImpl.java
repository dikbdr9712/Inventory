package com.api.inventory.service.impl;

import com.api.inventory.repository.TransactionRepository;
import com.api.inventory.dto.PaymentRequestDTO;
import com.api.inventory.entity.Payment;
import com.api.inventory.entity.Transaction;
import com.api.inventory.entity.Order;
import com.api.inventory.exception.ResourceNotFoundException;
import com.api.inventory.repository.OrderRepository;
import com.api.inventory.repository.PaymentRepository;
import com.api.inventory.service.PaymentService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
	@Autowired
    private PaymentRepository paymentRepository;
	@Autowired
    private OrderRepository orderRepository;
	@Autowired
	private TransactionRepository transactionRepository;
	@Override
	public Payment createPayment(PaymentRequestDTO dto) {
	    Order order = orderRepository.findById(dto.getOrderId())
	            .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + dto.getOrderId()));

	    Payment payment = new Payment();
	    payment.setOrderId(dto.getOrderId());
	    payment.setPaymentMethod(dto.getPaymentMethod());
	    payment.setAmount(dto.getAmount() != null ? dto.getAmount() : BigDecimal.ZERO);
	    payment.setStatus(dto.getStatus() != null ? dto.getStatus() : "pending");
	    payment.setPaymentDate(LocalDateTime.now());

	    // ✅ SET THE JOURNAL NUMBER (this was missing!)
	    payment.setJournalNumber(dto.getJournalNumber()); // ← Add this line

	    // Link to existing transaction if provided
	    if (dto.getTransactionId() != null) {
	        Transaction transaction = transactionRepository.findById(dto.getTransactionId())
	                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + dto.getTransactionId()));
	        payment.setTransaction(transaction);
	    }

	    return paymentRepository.save(payment);
	}

    @Override
    public Payment updatePaymentStatus(Long paymentId, String status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        payment.setStatus(status);
        payment.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment found for order ID: " + orderId));
    }

    @Override
    public Payment findByOrderId(Long orderId) {
        System.out.println("Searching for payment with order ID: " + orderId);
        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);
        if (paymentOpt.isPresent()) {
            System.out.println("Found payment: " + paymentOpt.get());
            return paymentOpt.get();
        } else {
            System.out.println("No payment found for order ID: " + orderId);
            return null;
        }
    }

    @Override
    public Payment save(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Override
    public Payment findById(Long paymentId) {
        return paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}