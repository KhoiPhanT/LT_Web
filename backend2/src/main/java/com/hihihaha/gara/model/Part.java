package com.hihihaha.gara.model;

import java.math.BigDecimal;

public class Part {
    private int id;
    private String partCode;
    private String partName;
    private String category;
    private String unit;
    private BigDecimal price;
    private int stockQuantity;
    private String locationBin;

    public Part() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getLocationBin() { return locationBin; }
    public void setLocationBin(String locationBin) { this.locationBin = locationBin; }
}
