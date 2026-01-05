package com.api.inventory.repository;

import com.api.inventory.entity.InventoryStock;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {
    Optional<InventoryStock> findByItemId(Long itemId);
    List<InventoryStock> findByItemIdIn(List<Long> itemIds);

    @Modifying
    @Transactional
    @Query("UPDATE InventoryStock s SET s.currentQuantity = s.currentQuantity + :delta WHERE s.itemId = :itemId")
    void adjustStockByDelta(@Param("itemId") Long itemId, @Param("delta") Integer delta);
    
    @Modifying
    @Query("DELETE FROM InventoryStock s WHERE s.itemId = :itemId")
    void deleteByItemId(@Param("itemId") Long itemId);
}