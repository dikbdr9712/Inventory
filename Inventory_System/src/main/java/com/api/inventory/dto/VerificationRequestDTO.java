package com.api.inventory.dto;

public class VerificationRequestDTO {
    private String status; 
    private String paymentStatus;
    private String note;     
	public String getupdatedBy;
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	
	public String getPaymentStatus() {
		return paymentStatus;
	}
	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}
	public String getNote() {
		return note;
	}
	public void setNote(String note) {
		this.note = note;
	}
	public String getGetupdatedBy() {
		return getupdatedBy;
	}
	public void setGetupdatedBy(String getupdatedBy) {
		this.getupdatedBy = getupdatedBy;
	}

	
    // Getters & Setters

    
}
