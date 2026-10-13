package com.hihihaha.gara.model;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public class WorkOrder {
    private int id;
    private String orderCode;
    private int vehicleId;
    private String licensePlate;
    private String vehicleModel;
    private String customerName;
    private String customerPhone;
    private int advisorId;
    private String advisorName;
    private Integer bayId;
    private String bayName;
    private Integer technicianId;
    private String technicianName;
    private String status;
    private String customerSymptoms;
    private String advisorDiagnosis;
    private BigDecimal totalPartsAmount;
    private BigDecimal totalLaborAmount;
    private BigDecimal totalAmount;
    private boolean quoteApproved;
    private Timestamp createdAt;
    private List<WorkOrderItem> items;

    public WorkOrder() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public int getAdvisorId() { return advisorId; }
    public void setAdvisorId(int advisorId) { this.advisorId = advisorId; }

    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }

    public Integer getBayId() { return bayId; }
    public void setBayId(Integer bayId) { this.bayId = bayId; }

    public String getBayName() { return bayName; }
    public void setBayName(String bayName) { this.bayName = bayName; }

    public Integer getTechnicianId() { return technicianId; }
    public void setTechnicianId(Integer technicianId) { this.technicianId = technicianId; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCustomerSymptoms() { return customerSymptoms; }
    public void setCustomerSymptoms(String customerSymptoms) { this.customerSymptoms = customerSymptoms; }

    public String getAdvisorDiagnosis() { return advisorDiagnosis; }
    public void setAdvisorDiagnosis(String advisorDiagnosis) { this.advisorDiagnosis = advisorDiagnosis; }

    public BigDecimal getTotalPartsAmount() { return totalPartsAmount; }
    public void setTotalPartsAmount(BigDecimal totalPartsAmount) { this.totalPartsAmount = totalPartsAmount; }

    public BigDecimal getTotalLaborAmount() { return totalLaborAmount; }
    public void setTotalLaborAmount(BigDecimal totalLaborAmount) { this.totalLaborAmount = totalLaborAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public boolean isQuoteApproved() { return quoteApproved; }
    public void setQuoteApproved(boolean quoteApproved) { this.quoteApproved = quoteApproved; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public List<WorkOrderItem> getItems() { return items; }
    public void setItems(List<WorkOrderItem> items) { this.items = items; }
}
