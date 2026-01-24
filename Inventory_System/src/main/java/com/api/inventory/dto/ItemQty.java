package com.api.inventory.dto;
import lombok.Data;
public class ItemQty {
	private Long itemId;
    private Integer quantity;
	public Long getItemId() {
		return itemId;
	}
	public void setItemId(Long itemId) {
		this.itemId = itemId;
	}
	public Integer getQuantity() {
		return quantity;
	}
	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
    
}
