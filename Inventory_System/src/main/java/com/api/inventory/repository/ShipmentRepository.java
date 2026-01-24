package com.api.inventory.repository;

import com.api.inventory.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
	List<Shipment> findByOrder_OrderId(Long orderId);
}