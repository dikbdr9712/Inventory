package com.api.inventory.service.impl;

import com.api.inventory.dto.TransactionRequestDTO;
import com.api.inventory.entity.InventoryStock;
import com.api.inventory.entity.ItemMaster;
import com.api.inventory.entity.Transaction;
import com.api.inventory.repository.InventoryStockRepository;
import com.api.inventory.repository.ItemMasterRepository;
import com.api.inventory.repository.TransactionRepository;
import com.api.inventory.service.TransactionService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

	@Autowired
    private TransactionRepository transactionRepository;
	
	@Autowired
    private InventoryStockRepository inventoryStockRepository;
	
	@Autowired
    private ItemMasterRepository itemMasterRepository;

    @Override
    @Transactional
    public void recordSale(TransactionRequestDTO request) {

        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }


        itemMasterRepository.findById(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));


        Optional<InventoryStock> stockOpt = inventoryStockRepository.findByItemId(request.getItemId());
        if (stockOpt.isEmpty()) {
            throw new RuntimeException("Stock not initialized for this item");
        }

        InventoryStock stock = stockOpt.get();
        if (stock.getCurrentQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + stock.getCurrentQuantity());
        }


        Transaction sale = new Transaction();
        sale.setItemId(request.getItemId());
        sale.setTransactionType("SALE");
        sale.setQuantity(request.getQuantity());
        sale.setUnitPrice(request.getUnitPrice());
        sale.setCustomerOrSupplier(request.getCustomerOrSupplier());
        sale.setNotes(request.getNotes());
        sale.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(sale);


        inventoryStockRepository.adjustStockByDelta(request.getItemId(), -request.getQuantity());
    }

    @Override
    @Transactional
    public void recordPurchase(TransactionRequestDTO request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        // Step 1: Find or create item by SKU
        ItemMaster item = itemMasterRepository.findBySku(request.getSku())
            .orElseGet(() -> createNewItemFromPurchase(request));

        // Step 2: Record transaction
        Transaction purchase = new Transaction();
        purchase.setItemId(item.getItemId());
        purchase.setTransactionType("PURCHASE");
        purchase.setQuantity(request.getQuantity()); // ← Now Integer
        purchase.setUnitPrice(request.getUnitPrice()); // Keep as BigDecimal if price has decimals
        purchase.setCustomerOrSupplier(request.getCustomerOrSupplier());
        purchase.setNotes(request.getNotes());
        purchase.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(purchase);

        // Step 3: Ensure stock record exists + update
        InventoryStock stock = inventoryStockRepository.findByItemId(item.getItemId())
            .orElseGet(() -> {
                InventoryStock newStock = new InventoryStock();
                newStock.setItemId(item.getItemId());
                newStock.setCurrentQuantity(0); // ← Integer
                newStock.setStatus("Available");
                return inventoryStockRepository.save(newStock);
            });

        // Update stock
        Integer newQty = stock.getCurrentQuantity() + request.getQuantity();
        stock.setCurrentQuantity(newQty);
        stock.setLastUpdated(LocalDateTime.now());
        stock.setStatus(newQty > 0 ? "Available" : "Unavailable");
        inventoryStockRepository.save(stock);
    }

    private ItemMaster createNewItemFromPurchase(TransactionRequestDTO request) {
        if (request.getItemName() == null || request.getItemName().trim().isEmpty()) {
            throw new IllegalArgumentException("Item name is required when adding a new item during purchase.");
        }

        ItemMaster newItem = new ItemMaster();
        newItem.setSku(request.getSku().trim());
        newItem.setItemName(request.getItemName().trim());

        // Optional fields — set only if provided in DTO
        if (request.getDescription() != null) {
            newItem.setDescription(request.getDescription().trim());
        }
        if (request.getUom() != null && !request.getUom().trim().isEmpty()) {
            newItem.setUom(request.getUom().trim());
        } else {
            newItem.setUom("pcs"); // default unit of measure
        }
        if (request.getPricePerUnit() != null) {
            newItem.setPricePerUnit(request.getPricePerUnit());
        }
        if (request.getBarcode() != null) {
            newItem.setBarcode(request.getBarcode().trim());
        }
        if (request.getSupplierItemCode() != null) {
            newItem.setSupplierItemCode(request.getSupplierItemCode().trim());
        }

        newItem.setCreatedAt(LocalDateTime.now());
        return itemMasterRepository.save(newItem);
    }
}