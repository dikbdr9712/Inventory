package com.api.inventory.service;

import com.api.inventory.dto.SalesReportDTO;
import com.api.inventory.dto.SalesSummaryDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface SalesReportService {
    List<SalesReportDTO> getSalesReportByPeriod(String period, String startDate, String endDate);
    SalesSummaryDTO getSalesSummaryByPeriod(String period, String startDate, String endDate);
}
