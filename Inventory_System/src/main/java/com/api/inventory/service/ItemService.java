package com.api.inventory.service;

import com.api.inventory.dto.ItemMasterDTO;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface ItemService {
    ItemMasterDTO createItem(ItemMasterDTO dto);
    List<ItemMasterDTO> getAllItems();
	void deleteItem(Long id);
	ItemMasterDTO updateItem(Long id, ItemMasterDTO dto);
	Integer getItemStock(Long itemId);
	ItemMasterDTO createItem(ItemMasterDTO dto, MultipartFile imageFile);
	ItemMasterDTO updateItem(Long itemId, ItemMasterDTO dto, MultipartFile imageFile);
	ItemMasterDTO getItemById(Long id);
	
	
}
