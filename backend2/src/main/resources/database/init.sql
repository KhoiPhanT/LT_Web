-- ========================================================
-- DATABASE SCHEMA CHO HIHIHAHA AUTO - BACKEND 2 (CRUD ĐƠN GIẢN)
-- ========================================================

CREATE DATABASE IF NOT EXISTS hihihaha_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hihihaha_db;

-- 1. Bảng Users (Nhân viên gara)
DROP TABLE IF EXISTS work_order_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS work_orders;
DROP TABLE IF EXISTS workshop_bays;
DROP TABLE IF EXISTS parts;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(30) NOT NULL, -- SERVICE_ADVISOR, TECHNICIAN, WORKSHOP_MANAGER, OWNER
    pin_code VARCHAR(10) DEFAULT '1234',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Customers (Khách hàng)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Vehicles (Xe ô tô)
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    manufacture_year INT DEFAULT 2022,
    odo_km INT DEFAULT 10000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 4. Bảng Workshop Bays (Khoang nâng xưởng)
CREATE TABLE workshop_bays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bay_code VARCHAR(20) NOT NULL UNIQUE,
    bay_name VARCHAR(50) NOT NULL,
    bay_type VARCHAR(50) NOT NULL, -- TWO_POST_LIFT, FOUR_POST_LIFT, ELECTRICAL, WHEEL_ALIGNMENT
    is_occupied BOOLEAN DEFAULT FALSE
);

-- 5. Bảng Parts (Kho phụ tùng)
CREATE TABLE parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_code VARCHAR(50) NOT NULL UNIQUE,
    part_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) DEFAULT 'Cái',
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    location_bin VARCHAR(50) DEFAULT 'KHO-A1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Work Orders (Lệnh sửa chữa & Kanban)
CREATE TABLE work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id INT NOT NULL,
    advisor_id INT NOT NULL,
    bay_id INT NULL,
    technician_id INT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED', 
    -- RECEIVED, WAITING_APPROVAL, WAITING_PARTS, IN_PROGRESS, INSPECTION, WAITING_PAYMENT, COMPLETED
    customer_symptoms TEXT,
    advisor_diagnosis TEXT,
    total_parts_amount DECIMAL(12,2) DEFAULT 0.00,
    total_labor_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    is_quote_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (advisor_id) REFERENCES users(id),
    FOREIGN KEY (bay_id) REFERENCES workshop_bays(id),
    FOREIGN KEY (technician_id) REFERENCES users(id)
);

-- 7. Bảng Work Order Items (Chi tiết phụ tùng & tiền công của lệnh)
CREATE TABLE work_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_order_id INT NOT NULL,
    part_id INT NULL,
    item_type VARCHAR(20) NOT NULL, -- PART hoặc LABOR
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    is_done BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(id)
);

-- 8. Bảng Invoices (Hóa đơn thanh toán)
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_code VARCHAR(50) NOT NULL UNIQUE,
    work_order_id INT NOT NULL UNIQUE,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'VIETQR', -- CASH, VIETQR
    payment_status VARCHAR(20) DEFAULT 'UNPAID', -- UNPAID, PAID
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
);

-- ========================================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ========================================================

-- Nhân viên
INSERT INTO users (username, password, full_name, phone_number, email, role, pin_code) VALUES
('advisor', '123456', 'Nguyễn Cố Vấn', '0901234567', 'advisor@hihihaha.vn', 'SERVICE_ADVISOR', '1111'),
('tech1', '123456', 'Trần Thợ Máy 1', '0902345678', 'tech1@hihihaha.vn', 'TECHNICIAN', '2222'),
('tech2', '123456', 'Lê Thợ Máy 2', '0903456789', 'tech2@hihihaha.vn', 'TECHNICIAN', '3333'),
('manager', '123456', 'Phạm Quản Lý', '0904567890', 'manager@hihihaha.vn', 'WORKSHOP_MANAGER', '4444'),
('owner', '123456', 'Hoàng Giám Đốc', '0905678901', 'owner@hihihaha.vn', 'OWNER', '5555');

-- Khách hàng
INSERT INTO customers (full_name, phone_number, email, address) VALUES
('Quách Tài Lợi', '0912345678', 'tailoi1606@gmail.com', '123 Nguyễn Văn Cừ, Quận 5, TP.HCM'),
('Nguyễn Văn A', '0988776655', 'nguyenvana@gmail.com', '456 Lê Duẩn, Quận 1, TP.HCM'),
('Trần Thị B', '0977665544', 'tranthib@gmail.com', '789 Võ Văn Ngân, Thủ Đức, TP.HCM');

-- Xe
INSERT INTO vehicles (license_plate, customer_id, brand, model, manufacture_year, odo_km) VALUES
('51H-123.45', 1, 'Toyota', 'Camry 2.5Q', 2022, 25000),
('51K-999.88', 2, 'Honda', 'Civic RS', 2023, 15000),
('59A-888.66', 3, 'Mazda', 'CX-5 2.0 Premium', 2021, 32000);

-- Khoang nâng
INSERT INTO workshop_bays (bay_code, bay_name, bay_type, is_occupied) VALUES
('BAY-01', 'Khoang 1 - Cầu 2 trụ', 'TWO_POST_LIFT', TRUE),
('BAY-02', 'Khoang 2 - Cầu 2 trụ', 'TWO_POST_LIFT', FALSE),
('BAY-03', 'Khoang 3 - Cầu 4 trụ', 'FOUR_POST_LIFT', FALSE),
('BAY-04', 'Khoang 4 - Điện - Điện lạnh', 'ELECTRICAL', FALSE),
('BAY-05', 'Khoang 5 - Cân chỉnh 3D', 'WHEEL_ALIGNMENT', FALSE);

-- Phụ tùng
INSERT INTO parts (part_code, part_name, category, unit, price, stock_quantity, location_bin) VALUES
('OIL-MOBIL-5W30', 'Dầu nhớt động cơ Mobil 1 5W-30 (Can 4L)', 'LUBRICANT', 'Can', 850000, 50, 'KHO-A1-K1'),
('FLT-OIL-TY01', 'Lọc nhớt Toyota chính hãng', 'FILTRATION', 'Cái', 180000, 100, 'KHO-A1-K2'),
('BRK-PAD-FR-CAM', 'Bộ má phanh trước Toyota Camry', 'BRAKE', 'Bộ', 1250000, 20, 'KHO-B2-K1'),
('SPK-IRIDIUM-DEN', 'Bugi Denso Iridium Tough', 'IGNITION', 'Cái', 220000, 80, 'KHO-B2-K3'),
('AC-GAS-R134A', 'Bơm ga điều hòa R134a', 'ELECTRICAL', 'Bình', 450000, 15, 'KHO-C1-K1'),
('FLT-AIR-HD02', 'Lọc gió động cơ Honda Civic', 'FILTRATION', 'Cái', 250000, 40, 'KHO-A2-K1');

-- Lệnh sửa chữa mẫu
INSERT INTO work_orders (id, order_code, vehicle_id, advisor_id, bay_id, technician_id, status, customer_symptoms, advisor_diagnosis, total_parts_amount, total_labor_amount, total_amount, is_quote_approved) VALUES
(1, 'WO-2026-001', 1, 1, 1, 2, 'IN_PROGRESS', 'Tiếng kêu rít khi đạp phanh, xe đi được 25.000km cần bảo dưỡng định kỳ', 'Má phanh trước mòn quá vạch báo, nhớt động cơ đến hạn thay', 2280000, 300000, 2580000, TRUE),
(2, 'WO-2026-002', 2, 1, NULL, 3, 'WAITING_APPROVAL', 'Máy lạnh không mát khi dừng đèn đỏ', 'Thiếu ga điều hòa, lọc gió cabin bẩn', 700000, 200000, 900000, FALSE),
(3, 'WO-2026-003', 3, 1, NULL, NULL, 'RECEIVED', 'Xe hơi nhao lái sang phải khi chạy tốc độ cao', 'Cần kiểm tra cân chỉnh độ chụm bánh xe 3D', 0, 350000, 350000, FALSE);

-- Chi tiết lệnh 1
INSERT INTO work_order_items (work_order_id, part_id, item_type, item_name, quantity, unit_price, total_price, is_done) VALUES
(1, 1, 'PART', 'Dầu nhớt động cơ Mobil 1 5W-30 (Can 4L)', 1, 850000, 850000, TRUE),
(1, 2, 'PART', 'Lọc nhớt Toyota chính hãng', 1, 180000, 180000, TRUE),
(1, 3, 'PART', 'Bộ má phanh trước Toyota Camry', 1, 1250000, 1250000, FALSE),
(1, NULL, 'LABOR', 'Công thay má phanh & bảo dưỡng phanh 4 bánh', 1, 200000, 200000, FALSE),
(1, NULL, 'LABOR', 'Công thay nhớt và lọc nhớt', 1, 100000, 100000, TRUE);

-- Chi tiết lệnh 2
INSERT INTO work_order_items (work_order_id, part_id, item_type, item_name, quantity, unit_price, total_price, is_done) VALUES
(2, 5, 'PART', 'Bơm ga điều hòa R134a', 1, 450000, 450000, FALSE),
(2, 6, 'PART', 'Lọc gió động cơ Honda Civic', 1, 250000, 250000, FALSE),
(2, NULL, 'LABOR', 'Công vệ sinh dàn lạnh & nạp ga', 1, 200000, 200000, FALSE);

-- Hóa đơn lệnh 1
INSERT INTO invoices (invoice_code, work_order_id, total_amount, payment_method, payment_status) VALUES
('INV-2026-001', 1, 2580000, 'VIETQR', 'UNPAID');
