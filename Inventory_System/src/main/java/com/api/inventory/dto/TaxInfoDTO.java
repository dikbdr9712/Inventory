package com.api.inventory.dto;

import lombok.Data;

@Data
public class TaxInfoDTO {
    private String type;  // e.g., "GST", "ET"
    private Double rate;  // e.g., 18.0
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public Double getRate() {
		return rate;
	}
	public void setRate(Double rate) {
		this.rate = rate;
	}
    
}