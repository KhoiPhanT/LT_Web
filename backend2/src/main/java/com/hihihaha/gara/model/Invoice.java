package com.hihihaha.gara.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Invoice {
    private int id;
    private String invoiceCode;
    private int workOrderId;
    private String orderCode;
    private String customerName;
    private String licensePlate;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private Timestamp paidAt;
    private Timestamp createdAt;

    public Invoice() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getInvoiceCode() { return invoiceCode; }
    public void setInvoiceCode(String invoiceCode) { this.invoiceCode = invoiceCode; }

    public int getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(int workOrderId) { this.workOrderId = workOrderId; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Timestamp getPaidAt() { return paidAt; }
    public void setPaidAt(Timestamp paidAt) { this.paidAt = paidAt; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
