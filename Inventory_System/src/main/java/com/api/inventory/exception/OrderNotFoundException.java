// src/main/java/com/api/inventory/exception/OrderNotFoundException.java
package com.api.inventory.exception;

public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(String message) {
        super(message);
    }
}