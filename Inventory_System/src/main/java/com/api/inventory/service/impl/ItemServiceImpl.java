package com.api.inventory.service.impl;

import com.api.inventory.dto.ItemMasterDTO;
import com.api.inventory.entity.InventoryStock;
import com.api.inventory.entity.ItemMaster;
import com.api.inventory.repository.InventoryStockRepository;
import com.api.inventory.repository.ItemMasterRepository;
import com.api.inventory.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.io.IOException;
import java.math.BigDecimal;

@Service
public class ItemServiceImpl implements ItemService {

    @Autowired
    private ItemMasterRepository itemMasterRepository;

    @Autowired
    private InventoryStockRepository inventoryStockRepository;

    @Override
    @Transactional
    public ItemMasterDTO createItem(ItemMasterDTO dto) {
        if (dto.getItemName() == null || dto.getItemName().trim().isEmpty()) {
            throw new IllegalArgumentException("Item name is required");
        }

        ItemMaster item = new ItemMaster();
        item.setItemName(dto.getItemName().trim());
        item.setDescription(dto.getDescription());
        item.setUom(dto.getUom() != null ? dto.getUom().trim() : "pcs");
        item.setCostPrice(dto.getCostPrice());
        item.setSellingPrice(dto.getSellingPrice());
        item.setBarcode(dto.getBarcode());
        item.setSupplierItemCode(dto.getSupplierItemCode());
        item.setCreatedAt(LocalDateTime.now());
        item.setCategory(dto.getCategory().trim());

        // ✅ Generate SKU BEFORE saving
        String autoSku = "ITEM-" + System.currentTimeMillis(); // Temporary unique ID
        item.setSku(autoSku);

        // ✅ Save with SKU already set
        ItemMaster savedItem = itemMasterRepository.save(item);

        // ✅ Now update with real ID-based SKU (optional)
        String finalSku = "ITEM-" + savedItem.getItemId();
        savedItem.setSku(finalSku);
        itemMasterRepository.save(savedItem); // Update again

        // Create stock record
        InventoryStock stock = new InventoryStock();
        stock.setItemId(savedItem.getItemId());
        stock.setCurrentQuantity(0);
        stock.setLastUpdated(LocalDateTime.now());
        stock.setStatus("Unavailable");
        inventoryStockRepository.save(stock);

        return toDTO(savedItem, stock);
    }

    @Override
    public List<ItemMasterDTO> getAllItems() {
        return itemMasterRepository.findAll().stream()
            .map(item -> {
                InventoryStock stock = inventoryStockRepository.findByItemId(item.getItemId())
                    .orElse(null); // ← Get full InventoryStock object
                return toDTO(item, stock);
            })
            .collect(Collectors.toList());
    }

    private ItemMasterDTO toDTO(ItemMaster item, InventoryStock stock) {
        ItemMasterDTO dto = new ItemMasterDTO();
        dto.setItemId(item.getItemId());
        dto.setSku(item.getSku());
        dto.setItemName(item.getItemName());
        dto.setDescription(item.getDescription());
        dto.setUom(item.getUom());
        dto.setSellingPrice(item.getSellingPrice());
        dto.setCurrentStock(stock != null ? stock.getCurrentQuantity() : 0);
        dto.setAvailability(stock != null ? stock.getStatus() : "Unavailable");
        dto.setCategory(item.getCategory());
        dto.setImagePath(item.getImagePath());
        return dto;
    }

    @Override
    @Transactional
    public void deleteItem(Long id) {
        itemMasterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found with ID: " + id));

        itemMasterRepository.deleteById(id);
        

    }

    @Override
    public ItemMasterDTO updateItem(Long id, ItemMasterDTO dto) {
        ItemMaster existingItem = itemMasterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found with ID: " + id));

        existingItem.setItemName(dto.getItemName());
        existingItem.setDescription(dto.getDescription());
        existingItem.setUom(dto.getUom());
        existingItem.setSellingPrice(dto.getSellingPrice());
        
        ItemMaster updatedItem = itemMasterRepository.save(existingItem);
        
        InventoryStock stock = inventoryStockRepository.findByItemId(id)
            .orElse(null);
            
        return toDTO(updatedItem, stock);
    }

	@Override
	public Integer getItemStock(Long itemId) {
	    System.out.println("Fetching stock for itemId: " + itemId); // 👈 DEBUG

	    Optional<InventoryStock> stockOpt = inventoryStockRepository.findByItemId(itemId);
	    
	    if (stockOpt.isPresent()) {
	        int qty = stockOpt.get().getCurrentQuantity();
	        System.out.println("Found stock: " + qty); // 👈 DEBUG
	        return qty;
	    } else {
	        System.out.println("No stock found for itemId: " + itemId); // 👈 DEBUG
	        return 0;
	    }
	}

	@Override
	@Transactional
	public ItemMasterDTO createItem(ItemMasterDTO dto, MultipartFile imageFile) {
	    if (dto.getItemName() == null || dto.getItemName().trim().isEmpty()) {
	        throw new IllegalArgumentException("Item name is required");
	    }

	    ItemMaster item = new ItemMaster();
	    item.setItemName(dto.getItemName().trim());
	    item.setDescription(dto.getDescription());
	    item.setUom(dto.getUom() != null ? dto.getUom().trim() : "pcs");
	    
	    // ✅ CRITICAL: Set costPrice and category
	    item.setCostPrice(dto.getCostPrice() != null ? dto.getCostPrice() : BigDecimal.ZERO);
	    item.setSellingPrice(dto.getSellingPrice() != null ? dto.getSellingPrice() : item.getCostPrice());
	    item.setCategory(dto.getCategory() != null ? dto.getCategory().trim() : "Uncategorized");
	    
	    // Optional fields
	    item.setBarcode(dto.getBarcode());
	    item.setSupplierItemCode(dto.getSupplierItemCode());
	    item.setDiscountAllowed(dto.getDiscountAllowed() != null ? dto.getDiscountAllowed() : true);
	    item.setMaxDiscountPercent(
	        dto.getMaxDiscountPercent() != null ? dto.getMaxDiscountPercent() : new BigDecimal("100.00")
	    );
	    item.setTaxRate(dto.getTaxRate() != null ? dto.getTaxRate() : BigDecimal.ZERO);

	    // Generate temporary SKU
	    item.setSku("TEMP-" + System.currentTimeMillis());
	    ItemMaster savedItem = itemMasterRepository.save(item);

	    // Update with real SKU
	    String finalSku = "ITEM-" + savedItem.getItemId();
	    savedItem.setSku(finalSku);
	    itemMasterRepository.save(savedItem);

	    // Handle image
	    if (imageFile != null && !imageFile.isEmpty()) {
	        try {
	            String cleanName = savedItem.getItemName().toLowerCase().replaceAll("[^a-z0-9]", "");
	            cleanName = cleanName.substring(0, Math.min(50, cleanName.length()));
	            String filename = cleanName + ".jpg";

	            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");
	            Files.createDirectories(uploadDir);
	            Path filePath = uploadDir.resolve(filename);
	            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

	            savedItem.setImagePath("/uploads/" + filename);
	            itemMasterRepository.save(savedItem);
	            System.out.println("Saved item with imagePath: " + savedItem.getImagePath());
	        } catch (IOException e) {
	            System.err.println("Failed to save image: " + e.getMessage());
	        }
	    }

	    // Create stock record
	    InventoryStock stock = new InventoryStock();
	    stock.setItemId(savedItem.getItemId());
	    stock.setCurrentQuantity(0);
	    stock.setLastUpdated(LocalDateTime.now());
	    stock.setStatus("Unavailable");
	    inventoryStockRepository.save(stock);

	    return toDTO(savedItem, stock);
	}

	@Transactional
	public ItemMasterDTO updateItem(Long itemId, ItemMasterDTO dto, MultipartFile imageFile) {
	    ItemMaster item = itemMasterRepository.findById(itemId)
	        .orElseThrow(() -> new IllegalArgumentException("Item not found"));

	    // Update basic fields
	    item.setItemName(dto.getItemName().trim());
	    item.setDescription(dto.getDescription());
	    item.setUom(dto.getUom() != null ? dto.getUom().trim() : "pcs");
	    item.setSellingPrice(dto.getSellingPrice());
	    item.setBarcode(dto.getBarcode());
	    item.setSupplierItemCode(dto.getSupplierItemCode());

	    // Handle image upload
	    if (imageFile != null && !imageFile.isEmpty()) {
	        try {
	            // Clean filename
	            String rawName = item.getItemName();
	            String cleanName = rawName
	                .toLowerCase()
	                .replaceAll("[^a-z0-9]", "");
	            cleanName = cleanName.substring(0, Math.min(50, cleanName.length()));
	            String filename = cleanName + ".jpg";

	            // Save to "uploads" folder
	            String uploadDirPath = System.getProperty("user.dir") + "/uploads";
	            Path uploadDir = Paths.get(uploadDirPath);
	            if (!Files.exists(uploadDir)) {
	                Files.createDirectories(uploadDir);
	            }
	            Path filePath = uploadDir.resolve(filename);
	            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

	            // Update imagePath
	            item.setImagePath("/uploads/" + filename);
	            System.out.println("Updated image for item " + itemId + ": " + item.getImagePath());

	        } catch (IOException e) {
	            System.err.println("Failed to save updated image: " + e.getMessage());
	        }
	    }

	    // Save updated item
	    ItemMaster savedItem = itemMasterRepository.save(item);

	    // Get stock record
	    InventoryStock stock = inventoryStockRepository.findByItemId(itemId)
	        .orElseThrow(() -> new IllegalArgumentException("Stock record not found"));

	    return toDTO(savedItem, stock);
	}

	@Override
	public ItemMasterDTO getItemById(Long id) {
	    // Fetch item from DB
	    ItemMaster item = itemMasterRepository.findById(id)
	        .orElseThrow(() -> new IllegalArgumentException("Item not found with ID: " + id));

	    // Fetch stock record
	    InventoryStock stock = inventoryStockRepository.findByItemId(id)
	        .orElseThrow(() -> new IllegalArgumentException("Stock record not found for item ID: " + id));

	    // Convert to DTO
	    return toDTO(item, stock);
	}
}