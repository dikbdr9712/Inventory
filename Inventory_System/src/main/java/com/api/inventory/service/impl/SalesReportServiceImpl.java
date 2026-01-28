package com.api.inventory.service.impl;

import com.api.inventory.dto.SalesReportDTO;
import com.api.inventory.dto.SalesSummaryDTO;
import com.api.inventory.entity.Order;
import com.api.inventory.repository.OrderRepository;
import com.api.inventory.service.SalesReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesReportServiceImpl implements SalesReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public List<SalesReportDTO> getSalesReportByPeriod(String period, String startDate, String endDate) {
        LocalDateTime start = null;
        LocalDateTime end = null;

        switch (period) {
            case "today":
                start = LocalDate.now().atStartOfDay();
                end = start.plusDays(1);
                break;
            case "thisWeek":
                start = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();
                end = start.plusWeeks(1);
                break;
            case "thisMonth":
                start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
                end = start.plusMonths(1);
                break;
            case "thisYear":
                start = LocalDate.now().withDayOfYear(1).atStartOfDay();
                end = start.plusYears(1);
                break;
            case "custom":
                if (startDate == null || endDate == null) {
                    throw new IllegalArgumentException("Custom period requires startDate and endDate");
                }
                start = LocalDate.parse(startDate).atStartOfDay();
                end = LocalDate.parse(endDate).plusDays(1).atStartOfDay();
                break;
            default:
                // Fallback to today
                start = LocalDate.now().atStartOfDay();
                end = start.plusDays(1);
        }

        return orderRepository.findSalesReportByDateRange(start, end);
    }

    @Override
    public SalesSummaryDTO getSalesSummaryByPeriod(String period, String startDate, String endDate) {
        List<SalesReportDTO> report = getSalesReportByPeriod(period, startDate, endDate);

        BigDecimal totalSales = report.stream()
                .map(SalesReportDTO::getTotalSales)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        Long totalOrders = report.stream()
                .mapToLong(SalesReportDTO::getTotalOrders)
                .sum();

        BigDecimal totalTax = report.stream()
                .map(SalesReportDTO::getTotalTax)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalDiscount = report.stream()
                .map(SalesReportDTO::getTotalDiscount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        return new SalesSummaryDTO(totalSales, totalOrders, totalTax, totalDiscount);
    }
}