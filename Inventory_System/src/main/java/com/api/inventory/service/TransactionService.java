package com.api.inventory.service;

import com.api.inventory.dto.TransactionRequestDTO;

public interface TransactionService {
    void recordSale(TransactionRequestDTO request);
    void recordPurchase(TransactionRequestDTO request);
}