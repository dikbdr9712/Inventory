// src/main/java/com/api/inventory/dto/PaymentRequestDTO.java

package com.api.inventory.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class PaymentRequestDTO {
    private Long orderId;
    private String paymentMethod;
    private BigDecimal amount;
    private String status;
    private String journalNumber; 
    private Long transactionId; // ✅ Add this to link to transaction
	public Long getOrderId() {
		return orderId;
	}
	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}
	public String getPaymentMethod() {
		return paymentMethod;
	}
	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}
	public BigDecimal getAmount() {
		return amount;
	}
	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	
	public String getJournalNumber() {
		return journalNumber;
	}
	public void setJournalNumber(String journalNumber) {
		this.journalNumber = journalNumber;
	}
	public Long getTransactionId() {
		return transactionId;
	}
	public void setTransactionId(Long transactionId) {
		this.transactionId = transactionId;
	}
    
}