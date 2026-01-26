package com.api.inventory.dto;

import lombok.Data;
import java.util.List;

@Data
public class PosSaleRequestDTO {
    private String customerName;
    private String customerPhone;
    private String paymentMethod; // "CASH", "CARD", "UPI", etc.
    private java.math.BigDecimal discountTotal; // total discount amount (not %)
    private List<TaxInfoDTO> taxes;               // list of applied taxes
    private List<ItemQty> items;
	public String getCustomerName() {
		return customerName;
	}
	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}
	public String getCustomerPhone() {
		return customerPhone;
	}
	public void setCustomerPhone(String customerPhone) {
		this.customerPhone = customerPhone;
	}
	public String getPaymentMethod() {
		return paymentMethod;
	}
	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}
	public List<ItemQty> getItems() {
		return items;
	}
	public void setItems(List<ItemQty> items) {
		this.items = items;
	}
	public java.math.BigDecimal getDiscountTotal() {
		return discountTotal;
	}
	public void setDiscountTotal(java.math.BigDecimal discountTotal) {
		this.discountTotal = discountTotal;
	}
	public List<TaxInfoDTO> getTaxes() {
		return taxes;
	}
	public void setTaxes(List<TaxInfoDTO> taxes) {
		this.taxes = taxes;
	}
    
    
}
