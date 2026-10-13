package com.hihihaha.gara.model;

import java.math.BigDecimal;

public class WorkOrderItem {
    private int id;
    private int workOrderId;
    private Integer partId;
    private String itemType; // PART, LABOR
    private String itemName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private boolean done;

    public WorkOrderItem() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(int workOrderId) { this.workOrderId = workOrderId; }

    public Integer getPartId() { return partId; }
    public void setPartId(Integer partId) { this.partId = partId; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }
}
