// src/main/java/com/api/inventory/entity/Transaction.java

package com.api.inventory.entity;

import org.hibernate.annotations.Formula;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId; // ✅ Matches payments.transaction_id

    private Long itemId;

    @Column(length = 255)
    private String transactionType;

    private Integer quantity;

    @Column(precision = 19, scale = 2) // ✅ Better than 38,2
    private BigDecimal unitPrice;

    @Formula("quantity * unit_price")
    private BigDecimal totalAmount;

    @Column(length = 100)
    private String customerOrSupplier;

    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    private Long referenceId;

    @Column(length = 20)
    private String referenceType;

	public Long getTransactionId() {
		return transactionId;
	}

	public void setTransactionId(Long transactionId) {
		this.transactionId = transactionId;
	}

	public Long getItemId() {
		return itemId;
	}

	public void setItemId(Long itemId) {
		this.itemId = itemId;
	}

	public String getTransactionType() {
		return transactionType;
	}

	public void setTransactionType(String transactionType) {
		this.transactionType = transactionType;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public BigDecimal getUnitPrice() {
		return unitPrice;
	}

	public void setUnitPrice(BigDecimal unitPrice) {
		this.unitPrice = unitPrice;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getCustomerOrSupplier() {
		return customerOrSupplier;
	}

	public void setCustomerOrSupplier(String customerOrSupplier) {
		this.customerOrSupplier = customerOrSupplier;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public Long getReferenceId() {
		return referenceId;
	}

	public void setReferenceId(Long referenceId) {
		this.referenceId = referenceId;
	}

	public String getReferenceType() {
		return referenceType;
	}

	public void setReferenceType(String referenceType) {
		this.referenceType = referenceType;
	}
    
    
}