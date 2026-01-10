package com.api.inventory.service.impl;

import com.api.inventory.dto.OrderItemResponseDTO;
import com.api.inventory.dto.OrderRequestDTO;
import com.api.inventory.dto.OrderVerificationDTO;
import com.api.inventory.entity.*;
import com.api.inventory.exception.OrderNotFoundException;
import com.api.inventory.exception.ResourceNotFoundException;
import com.api.inventory.repository.*;
import com.api.inventory.service.OrderService;
import com.api.inventory.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

	@Autowired
    private OrderRepository orderRepository;
	
	@Autowired
    private OrderItemRepository orderItemRepository;
	
	@Autowired
    private InventoryStockRepository inventoryStockRepository;
	
	@Autowired
    private TransactionRepository transactionRepository;
	
	@Autowired
    private ItemMasterRepository itemMasterRepository;
	@Autowired
	private  PaymentService paymentService; 


	@Override
	@Transactional
	public Order createOrder(OrderRequestDTO dto) {
	    List<OrderItem> orderItems = new ArrayList<>();
	    BigDecimal totalAmount = BigDecimal.ZERO;

	    for (OrderRequestDTO.Item item : dto.getItems()) {
	        // ✅ Get current price from item_master (source of truth)
	    	ItemMaster itemMaster = itemMasterRepository.findById(item.getItemId())
	    		    .orElseThrow(() -> new RuntimeException("Item not found: " + item.getItemId()));

	        // ✅ Use system price — NOT client input
	        BigDecimal unitPrice = itemMaster.getPricePerUnit();
	        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
	        totalAmount = totalAmount.add(lineTotal);

	        // Build order item
	        OrderItem orderItem = new OrderItem();
	        orderItem.setOrderId(null); // will be set later
	        orderItem.setItemId(item.getItemId());
	        orderItem.setQuantity(item.getQuantity());
	        orderItem.setUnitPrice(unitPrice); // ← from item_master
	        orderItems.add(orderItem);
	    }

	    // Save order
	    Order order = new Order();
	    order.setCustomerName(dto.getCustomerName());
	    order.setCustomerEmail(dto.getCustomerEmail());
	    order.setOrderStatus("CREATED"); // or "PENDING_PAYMENT"
	    order.setPaymentStatus("PENDING");
	    order.setTotalAmount(totalAmount);
	    order.setCreatedAt(LocalDateTime.now());
	    order.setUpdatedAt(LocalDateTime.now());
	    Order savedOrder = orderRepository.save(order);

	    // Set orderId and save items
	    for (OrderItem item : orderItems) {
	        item.setOrderId(savedOrder.getOrderId());
	        orderItemRepository.save(item);
	    }

	    return savedOrder;
	}

    @Override
    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"PENDING".equals(order.getOrderStatus())) {
            throw new IllegalStateException("Order is not pending");
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        // ✅ Validate stock for all items
        for (OrderItem item : items) {
            InventoryStock stock = inventoryStockRepository.findByItemId(item.getItemId())
                    .orElseThrow(() -> new RuntimeException("Stock not initialized for item"));
            if (stock.getCurrentQuantity() < item.getQuantity()) {
                throw new IllegalStateException(
                        "Insufficient stock for item ID: " + item.getItemId());
            }
        }

        // ✅ Reduce stock and record transactions
        for (OrderItem item : items) {
            // Reduce stock
            inventoryStockRepository.adjustStockByDelta(item.getItemId(), -item.getQuantity());

            // Record SALE transaction with order reference
            Transaction tx = new Transaction();
            tx.setItemId(item.getItemId());
            tx.setTransactionType("SALE");
            tx.setQuantity(item.getQuantity());
            tx.setUnitPrice(item.getUnitPrice());
            tx.setCustomerOrSupplier(order.getCustomerName());
            tx.setReferenceId(orderId);        // ← Link to order
            tx.setReferenceType("ORDER");      // ← Type = ORDER
            tx.setCreatedAt(LocalDateTime.now());
            transactionRepository.save(tx);
        }

        // ✅ Update order status
        order.setOrderStatus("CONFIRMED");
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("CANCELLED".equals(order.getOrderStatus())) {
            return;
        }

        if ("CONFIRMED".equals(order.getOrderStatus())) {
            List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
            for (OrderItem item : items) {
                inventoryStockRepository.adjustStockByDelta(item.getItemId(), item.getQuantity());
                
                Transaction tx = new Transaction();
                tx.setItemId(item.getItemId());
                tx.setTransactionType("SALE_RETURN");
                tx.setQuantity(item.getQuantity());
                tx.setUnitPrice(item.getUnitPrice());
                tx.setCustomerOrSupplier(order.getCustomerName());
                tx.setReferenceId(orderId);
                tx.setReferenceType("ORDER_CANCEL");
                tx.setCreatedAt(LocalDateTime.now());
                transactionRepository.save(tx);
            }
        }

        order.setOrderStatus("CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void completeOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"CONFIRMED".equals(order.getOrderStatus())) {
            throw new IllegalStateException("Only CONFIRMED orders can be completed");
        }

        order.setOrderStatus("COMPLETED"); 
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    public List<Order> getOrdersByCustomerEmail(String email) {
        return orderRepository.findByCustomerEmail(email);
    }

 // OrderServiceImpl.java

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemResponseDTO> getOrderItemsByOrderId(Long orderId) {
        // Verify order exists (optional but good practice)
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found: " + orderId);
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        
        return items.stream().map(item -> {
            OrderItemResponseDTO dto = new OrderItemResponseDTO();
            dto.setItemId(item.getItemId());
            dto.setQuantity(item.getQuantity());
            dto.setUnitPrice(item.getUnitPrice());
            
            // Fetch item name and image from ItemMaster
            ItemMaster itemMaster = itemMasterRepository.findById(item.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found: " + item.getItemId()));
            dto.setItemName(itemMaster.getItemName());
            dto.setImagePath(itemMaster.getImagePath()); // nullable is OK
            
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }
    
    
 // OrderServiceImpl.java
    @Transactional
    public void confirmPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"PENDING".equals(order.getPaymentStatus())) {
            throw new IllegalStateException("Payment already processed");
        }

        // ✅ 1. Verify all items are in stock
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            InventoryStock stock = inventoryStockRepository.findByItemId(item.getItemId())
                    .orElseThrow(() -> new RuntimeException("Stock not found for item"));
            
            if (stock.getCurrentQuantity() < item.getQuantity()) {
                // ❌ Not enough stock → mark as partially fulfillable
                order.setOrderStatus("PARTIALLY_FULFILLABLE");
                order.setPaymentStatus("PAID");
                orderRepository.save(order);
                throw new IllegalStateException("Insufficient stock for item: " + item.getItemId());
            }
        }

        // ✅ 2. All items available → CONFIRMED
        order.setOrderStatus("CONFIRMED");
        order.setPaymentStatus("PAID");
        orderRepository.save(order);

        // ✅ 3. Reduce stock (only after payment + availability confirmed)
        for (OrderItem item : items) {
            inventoryStockRepository.adjustStockByDelta(item.getItemId(), -item.getQuantity());
            // Record transaction...
        }
    }
   


    @Override
    public void shipOrder(Long orderId, String shipmentId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + orderId));
        
        if (!"CONFIRMED".equals(order.getOrderStatus())) {
            throw new IllegalStateException("Order must be confirmed before shipping");
        }
        
        // ✅ Use provided ID, or generate if null/empty
        String finalShipmentId = shipmentId;
        if (shipmentId == null || shipmentId.trim().isEmpty()) {
            finalShipmentId = "SHIP-" + LocalDate.now().getYear() + "-" + 
                              String.format("%04d", order.getOrderId());
        }
        
        order.setOrderStatus("SHIPPED");
        order.setShipmentId(finalShipmentId);
        orderRepository.save(order);
    }

    @Override
    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    @Override
    public Order save(Order order) {
        return orderRepository.save(order);
    }
    @Override
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByOrderStatus(status);
    }
    
    
    @Override
    public List<OrderVerificationDTO> getOrdersForVerification(String status) {
        List<Order> orders = orderRepository.findByOrderStatus(status);
        return orders.stream().map(order -> {
            OrderVerificationDTO dto = new OrderVerificationDTO();
            dto.setOrderId(order.getOrderId());
            dto.setCustomerName(order.getCustomerName());
            dto.setCustomerEmail(order.getCustomerEmail());
            dto.setOrderStatus(order.getOrderStatus());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setCreatedAt(order.getCreatedAt());
            dto.setNote(order.getNote());

            Payment payment = paymentService.findByOrderId(order.getOrderId());
            if (payment != null) {
                dto.setPaymentMethod(payment.getPaymentMethod());
                dto.setJournalNumber(payment.getJournalNumber());
                dto.setPaymentAmount(payment.getAmount());
            }

            return dto;
        }).collect(Collectors.toList());
    }
}