package com.api.inventory.dto;

import java.math.BigDecimal;

public class SalesSummaryDTO {
    private BigDecimal totalSales;
    private Long totalOrders;
    private BigDecimal totalTax;
    private BigDecimal totalDiscount;

    // Constructors
    public SalesSummaryDTO() {}

    public SalesSummaryDTO(BigDecimal totalSales, Long totalOrders, BigDecimal totalTax, BigDecimal totalDiscount) {
        this.totalSales = totalSales;
        this.totalOrders = totalOrders;
        this.totalTax = totalTax;
        this.totalDiscount = totalDiscount;
    }

    // Getters & Setters
    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalTax() { return totalTax; }
    public void setTotalTax(BigDecimal totalTax) { this.totalTax = totalTax; }

    public BigDecimal getTotalDiscount() { return totalDiscount; }
    public void setTotalDiscount(BigDecimal totalDiscount) { this.totalDiscount = totalDiscount; }
}