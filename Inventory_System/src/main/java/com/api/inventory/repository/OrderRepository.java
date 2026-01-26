package com.api.inventory.repository;

import com.api.inventory.dto.SalesReportDTO;
import com.api.inventory.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

	List<Order> findByCustomerEmail(String customerEmail);
	List<Order> findAllByOrderByCreatedAtDesc();
	List<Order> findByOrderStatus(String status);
	List<Order> findBySource(String source);
	 @Query("""
		        SELECT NEW com.api.inventory.dto.SalesReportDTO(
		            DATE(o.createdAt),
		            SUM(o.totalAmount),
		            COUNT(o.orderId),
		            COALESCE(SUM(o.taxAmount), 0),
		            COALESCE(SUM(o.discountAmount), 0)
		        )
		        FROM Order o
		        WHERE o.createdAt >= :start AND o.createdAt < :end
		        GROUP BY DATE(o.createdAt)
		        ORDER BY DATE(o.createdAt) DESC
		        """)
		    List<SalesReportDTO> findSalesReportByDateRange(@Param("start") LocalDateTime start,
		                                                   @Param("end") LocalDateTime end);
	}