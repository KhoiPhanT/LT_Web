package com.hihihaha.gara.model;

public class User {
    private int id;
    private String username;
    private String password;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String role;
    private String pinCode;

    public User() {}

    public User(int id, String username, String fullName, String phoneNumber, String email, String role, String pinCode) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.role = role;
        this.pinCode = pinCode;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }
}
