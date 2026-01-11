package com.api.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;
    @Column(name = "sku", unique = true, nullable = false)
    private String sku;
    @Column(name = "item_name", nullable = false)
    private String itemName;
    private String barcode;
    private String supplierItemCode;
    private String description;
    private String uom;
    private BigDecimal pricePerUnit;
    private LocalDateTime createdAt;
    @Column(name = "category", length = 100)
    private String category;
    @Column(name = "image_path")
    private String imagePath;
    
	public Long getItemId() {
		return itemId;
	}
	public void setItemId(Long itemId) {
		this.itemId = itemId;
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
	public BigDecimal getPricePerUnit() {
		return pricePerUnit;
	}
	public void setPricePerUnit(BigDecimal bigDecimal) {
		this.pricePerUnit = bigDecimal;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public String getSku() {
		return sku;
	}
	public void setSku(String sku) {
		this.sku = sku;
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
	
	@PrePersist
    public void generateSku() {
        if (this.sku == null || this.sku.trim().isEmpty()) {
            this.sku = "ITEM-" + Instant.now().toEpochMilli();
        }
    }
	public String getImagePath() {
		return imagePath;
	}
	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	
}
	