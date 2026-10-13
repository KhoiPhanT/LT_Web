package com.hihihaha.gara.model;

public class Vehicle {
    private int id;
    private String licensePlate;
    private int customerId;
    private String customerName;
    private String customerPhone;
    private String brand;
    private String model;
    private int manufactureYear;
    private int odoKm;

    public Vehicle() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public int getCustomerId() { return customerId; }
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getManufactureYear() { return manufactureYear; }
    public void setManufactureYear(int manufactureYear) { this.manufactureYear = manufactureYear; }

    public int getOdoKm() { return odoKm; }
    public void setOdoKm(int odoKm) { this.odoKm = odoKm; }
}
