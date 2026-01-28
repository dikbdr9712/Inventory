package com.api.inventory.repository;

import com.api.inventory.entity.TaxDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxDetailRepository extends JpaRepository<TaxDetail, Long> {
}