package com.api.inventory.dto;

public class ShipmentRequestDTO {
	private String shipmentId;
	private String Shipment_type;
	
	public String getShipmentId() {
		return shipmentId;
	}
	public void setShipmentId(String shipmentId) {
		this.shipmentId = shipmentId;
	}
	public String getShipment_type() {
		return Shipment_type;
	}
	public void setShipment_type(String shipment_type) {
		Shipment_type = shipment_type;
	}
	
}
