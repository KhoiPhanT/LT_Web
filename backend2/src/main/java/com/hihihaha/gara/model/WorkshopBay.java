package com.hihihaha.gara.model;

public class WorkshopBay {
    private int id;
    private String bayCode;
    private String bayName;
    private String bayType;
    private boolean occupied;

    public WorkshopBay() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getBayCode() { return bayCode; }
    public void setBayCode(String bayCode) { this.bayCode = bayCode; }

    public String getBayName() { return bayName; }
    public void setBayName(String bayName) { this.bayName = bayName; }

    public String getBayType() { return bayType; }
    public void setBayType(String bayType) { this.bayType = bayType; }

    public boolean isOccupied() { return occupied; }
    public void setOccupied(boolean occupied) { this.occupied = occupied; }
}
