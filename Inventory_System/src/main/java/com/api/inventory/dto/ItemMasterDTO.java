package com.api.inventory.dto;

import java.math.BigDecimal;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemMasterDTO {
    private Long itemId;
    private String sku; 
    private String itemName;
    private String description;
    private String uom;
    private BigDecimal sellingPrice;
    private BigDecimal costPrice;
    private BigDecimal taxRate;
    private Boolean discountAllowed;
    private BigDecimal maxDiscountPercent;
    private Integer currentStock;
    private String availability;
    private String barcode;  
    private String supplierItemCode;  
    private String category;
    private String imagePath;
	public Long getItemId() {
		return itemId;
	}
	public void setItemId(Long itemId) {
		this.itemId = itemId;
	}
	public String getSku() {
		return sku;
	}
	public void setSku(String sku) {
		this.sku = sku;
	}
	public String getItemName() {
		return itemName;
	}
	public void setItemName(String itemName) {
		this.itemName = itemName;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getUom() {
		return uom;
	}
	public void setUom(String uom) {
		this.uom = uom;
	}
	public BigDecimal getSellingPrice() {
		return sellingPrice;
	}
	public void setSellingPrice(BigDecimal sellingPrice) {
		this.sellingPrice = sellingPrice;
	}
	public BigDecimal getCostPrice() {
		return costPrice;
	}
	public void setCostPrice(BigDecimal costPrice) {
		this.costPrice = costPrice;
	}
	public BigDecimal getTaxRate() {
		return taxRate;
	}
	public void setTaxRate(BigDecimal taxRate) {
		this.taxRate = taxRate;
	}
	public Boolean getDiscountAllowed() {
		return discountAllowed;
	}
	public void setDiscountAllowed(Boolean discountAllowed) {
		this.discountAllowed = discountAllowed;
	}
	public BigDecimal getMaxDiscountPercent() {
		return maxDiscountPercent;
	}
	public void setMaxDiscountPercent(BigDecimal maxDiscountPercent) {
		this.maxDiscountPercent = maxDiscountPercent;
	}
	public Integer getCurrentStock() {
		return currentStock;
	}
	public void setCurrentStock(Integer currentStock) {
		this.currentStock = currentStock;
	}
	public String getAvailability() {
		return availability;
	}
	public void setAvailability(String availability) {
		this.availability = availability;
	}
	public String getBarcode() {
		return barcode;
	}
	public void setBarcode(String barcode) {
		this.barcode = barcode;
	}
	public String getSupplierItemCode() {
		return supplierItemCode;
	}
	public void setSupplierItemCode(String supplierItemCode) {
		this.supplierItemCode = supplierItemCode;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public String getImagePath() {
		return imagePath;
	}
	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}
    
    
    
}