-- Phụ trách phần mới: Khởi (schema nghiệp vụ), Tân (kho/dịch vụ), Kiệt (tiến độ), Lợi (thanh toán).
-- CSDL demo riêng; chạy lại script không xóa dữ liệu đã tạo.
-- Khởi: buộc kết nối nạp file UTF-8 để tên tiếng Việt không bị đọc theo latin1.
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS hihihaha_simple_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hihihaha_simple_db;
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role ENUM('MANAGER','TECHNICIAN') NOT NULL
);
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL
);
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  license_plate VARCHAR(30) NOT NULL UNIQUE,
  model VARCHAR(100) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
-- Tân: giá và số lượng tồn không được âm, kể cả khi ghi trực tiếp vào MySQL.
CREATE TABLE IF NOT EXISTS parts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  part_code VARCHAR(50) NOT NULL UNIQUE,
  part_name VARCHAR(150) NOT NULL,
  unit VARCHAR(30) NOT NULL DEFAULT 'Cái',
  price DECIMAL(12,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  CONSTRAINT chk_parts_price CHECK (price >= 0),
  CONSTRAINT chk_parts_stock CHECK (stock_quantity >= 0)
);
-- Tân: nhiều dịch vụ có thể thuộc một lệnh; mỗi dịch vụ có thể dùng một phụ tùng mặc định hoặc chỉ có tiền công.
CREATE TABLE IF NOT EXISTS services (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_code VARCHAR(60) NOT NULL UNIQUE,
  service_name VARCHAR(150) NOT NULL,
  labor_price DECIMAL(12,2) NOT NULL,
  default_part_id BIGINT NULL,
  default_part_quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (default_part_id) REFERENCES parts(id),
  CONSTRAINT chk_service_labor_price CHECK (labor_price >= 0),
  CONSTRAINT chk_service_part_quantity CHECK (default_part_quantity > 0)
);
-- Tân: chuyển giá công cũ đang nằm ở parts sang danh mục services trước khi bỏ cột cũ.
SET @has_service_name = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='parts' AND COLUMN_NAME='service_name');
SET @has_service_price = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='parts' AND COLUMN_NAME='service_price');
SET @schema_sql = IF(@has_service_name=1 AND @has_service_price=1,
 'INSERT IGNORE INTO services(service_code,service_name,labor_price,default_part_id,default_part_quantity) SELECT CONCAT(''SVC-'',part_code),service_name,service_price,id,1 FROM parts WHERE service_name IS NOT NULL AND service_name<>'''' AND service_price IS NOT NULL',
 'SELECT 1');
PREPARE service_stmt FROM @schema_sql; EXECUTE service_stmt; DEALLOCATE PREPARE service_stmt;
SET @has_old_service_check = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='parts' AND CONSTRAINT_NAME='chk_service_price');
SET @schema_sql = IF(@has_old_service_check=1,'ALTER TABLE parts DROP CHECK chk_service_price','SELECT 1');
PREPARE service_stmt FROM @schema_sql; EXECUTE service_stmt; DEALLOCATE PREPARE service_stmt;
SET @schema_sql = IF(@has_service_name=1,'ALTER TABLE parts DROP COLUMN service_name','SELECT 1');
PREPARE service_stmt FROM @schema_sql; EXECUTE service_stmt; DEALLOCATE PREPARE service_stmt;
SET @schema_sql = IF(@has_service_price=1,'ALTER TABLE parts DROP COLUMN service_price','SELECT 1');
PREPARE service_stmt FROM @schema_sql; EXECUTE service_stmt; DEALLOCATE PREPARE service_stmt;
CREATE TABLE IF NOT EXISTS work_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  vehicle_id BIGINT NOT NULL,
  created_by BIGINT NOT NULL,
  assigned_to BIGINT NULL,
  symptoms TEXT,
  status ENUM('RECEIVED','IN_PROGRESS','WAITING_PAYMENT','COMPLETED') NOT NULL DEFAULT 'RECEIVED',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP NULL,
  finished_at TIMESTAMP NULL,
  stock_deducted_at TIMESTAMP NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
-- Khởi: hạng mục của lệnh; Tân: số lượng phụ tùng phải dương.
CREATE TABLE IF NOT EXISTS work_order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  work_order_id BIGINT NOT NULL,
  part_id BIGINT NULL,
  service_id BIGINT NULL,
  item_type ENUM('PART','LABOR') NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  progress_percent TINYINT NOT NULL DEFAULT 0,
  FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
  FOREIGN KEY (part_id) REFERENCES parts(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  CONSTRAINT chk_item_quantity CHECK (quantity > 0),
  CONSTRAINT chk_item_progress CHECK (progress_percent IN (0,50,100))
);
-- Khởi: liên kết hạng mục công với dịch vụ đã chọn; lệnh lịch sử vẫn giữ bản chụp tên/giá.
SET @has_order_service = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='work_order_items' AND COLUMN_NAME='service_id');
SET @schema_sql = IF(@has_order_service=0,'ALTER TABLE work_order_items ADD COLUMN service_id BIGINT NULL, ADD CONSTRAINT fk_order_item_service FOREIGN KEY (service_id) REFERENCES services(id)','SELECT 1');
PREPARE service_stmt FROM @schema_sql; EXECUTE service_stmt; DEALLOCATE PREPARE service_stmt;
-- Kiệt: thêm tiến độ từng công việc cho volume MySQL đã có.
SET @has_item_progress = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='work_order_items' AND COLUMN_NAME='progress_percent');
SET @schema_sql = IF(@has_item_progress=0,'ALTER TABLE work_order_items ADD COLUMN progress_percent TINYINT NOT NULL DEFAULT 0','SELECT 1');
PREPARE progress_stmt FROM @schema_sql; EXECUTE progress_stmt; DEALLOCATE PREPARE progress_stmt;
CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  work_order_id BIGINT NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  payment_status ENUM('UNPAID','PENDING_VERIFICATION','PAID') NOT NULL DEFAULT 'UNPAID',
  payment_method VARCHAR(20) NOT NULL DEFAULT 'VIETQR',
  reported_at TIMESTAMP NULL,
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
);
-- Mật khẩu demo 123456 (BCrypt). Chỉ dùng tài khoản mẫu trong môi trường học tập.
INSERT IGNORE INTO users (id,full_name,phone_number,password_hash,role) VALUES
 (1,'Quản lý gara','0988888802','$2a$10$uLTP2XnLJAhYKCkxfT8C..G2abLVxblge9KgN383MySuwNeunLHbO','MANAGER'),
 (2,'Kỹ thuật viên An','0988888803','$2a$10$uLTP2XnLJAhYKCkxfT8C..G2abLVxblge9KgN383MySuwNeunLHbO','TECHNICIAN'),
 (3,'Kỹ thuật viên Bình','0988888804','$2a$10$uLTP2XnLJAhYKCkxfT8C..G2abLVxblge9KgN383MySuwNeunLHbO','TECHNICIAN');
INSERT IGNORE INTO parts (id,part_code,part_name,unit,price,stock_quantity) VALUES
 (1,'OIL-01','Dầu động cơ 4L','Can',850000,10),
 (2,'FILTER-01','Lọc dầu','Cái',180000,10),
 (3,'BRAKE-01','Má phanh trước','Bộ',1200000,5);

-- Tân: thêm vài mặt hàng để form chọn phụ tùng có dữ liệu đa dạng ngay lần đầu chạy.
INSERT IGNORE INTO parts (part_code,part_name,unit,price,stock_quantity) VALUES
 ('BATTERY-01','Ắc quy 12V','Bình',1650000,4),
 ('AIRFILTER-01','Lọc gió động cơ','Cái',320000,8),
 ('COOLANT-01','Nước làm mát 4L','Can',420000,6);

-- Tân: phụ tùng và dịch vụ là hai danh mục độc lập; một xe có thể chọn nhiều dịch vụ.
INSERT IGNORE INTO parts (part_code,part_name,unit,price,stock_quantity) VALUES
 ('SPARK-01','Bugi iridium','Bộ',980000,6),
 ('BELT-01','Dây curoa tổng','Cái',750000,4),
 ('WIPER-01','Gạt mưa trước','Cặp',420000,8),
 ('TIRE-01','Lốp xe 185/65R15','Cái',1450000,8),
 ('BRAKEFLUID-01','Dầu phanh DOT4','Chai',250000,10),
 ('GEAROIL-01','Dầu hộp số 4L','Can',980000,5),
 ('CABINFILTER-01','Lọc gió điều hòa','Cái',280000,8),
 ('HEADLIGHT-01','Bóng đèn pha','Cái',350000,8);
INSERT IGNORE INTO services (service_code,service_name,labor_price,default_part_id,default_part_quantity)
SELECT CONCAT('SVC-',p.part_code),s.service_name,s.labor_price,p.id,1 FROM parts p JOIN (
 SELECT 'OIL-01' code,'Thay dầu động cơ' service_name,150000 labor_price UNION ALL
 SELECT 'FILTER-01','Thay lọc dầu',100000 UNION ALL
 SELECT 'BRAKE-01','Thay má phanh trước',300000 UNION ALL
 SELECT 'BATTERY-01','Thay ắc quy',120000 UNION ALL
 SELECT 'AIRFILTER-01','Thay lọc gió động cơ',90000 UNION ALL
 SELECT 'COOLANT-01','Thay nước làm mát',180000 UNION ALL
 SELECT 'SPARK-01','Thay bugi',180000 UNION ALL
 SELECT 'BELT-01','Thay dây curoa',350000 UNION ALL
 SELECT 'WIPER-01','Thay gạt mưa',70000 UNION ALL
 SELECT 'TIRE-01','Thay lốp và cân bằng',180000 UNION ALL
 SELECT 'BRAKEFLUID-01','Thay dầu phanh',220000 UNION ALL
 SELECT 'GEAROIL-01','Thay dầu hộp số',350000 UNION ALL
 SELECT 'CABINFILTER-01','Thay lọc gió điều hòa',80000 UNION ALL
 SELECT 'HEADLIGHT-01','Thay bóng đèn pha',120000
) s ON s.code=p.part_code;
-- Tân: hai dịch vụ chỉ có tiền công chứng minh lệnh không bắt buộc dùng phụ tùng.
INSERT IGNORE INTO services (service_code,service_name,labor_price,default_part_id,default_part_quantity) VALUES
 ('SVC-INSPECT','Kiểm tra tổng quát',200000,NULL,1),
 ('SVC-ELECTRIC','Chẩn đoán hệ thống điện',250000,NULL,1);

-- Khởi: hai hồ sơ khách và xe mẫu để trình bày lệnh. Email ví dụ dùng với DEMO_MODE=true;
-- khi gửi OTP thật, quản lý dữ liệu cần thay email bằng địa chỉ thật của người trình diễn.
INSERT IGNORE INTO customers (full_name,phone_number,email) VALUES
 ('Nguyễn Minh Anh','0901234567','demo.khach1@example.com'),
 ('Trần Quốc Nam','0902345678','demo.khach2@example.com');
SET @demo_customer_1 = (SELECT id FROM customers WHERE phone_number='0901234567');
SET @demo_customer_2 = (SELECT id FROM customers WHERE phone_number='0902345678');
INSERT IGNORE INTO vehicles (customer_id,license_plate,model) VALUES
 (@demo_customer_1,'59A-12345','Toyota Vios'),
 (@demo_customer_2,'51H-67890','Honda City');
SET @demo_vehicle_1 = (SELECT id FROM vehicles WHERE license_plate='59A-12345');
SET @demo_vehicle_2 = (SELECT id FROM vehicles WHERE license_plate='51H-67890');
SET @demo_tech_an = (SELECT id FROM users WHERE phone_number='0988888803');
SET @demo_tech_binh = (SELECT id FROM users WHERE phone_number='0988888804');

-- Khởi: năm lệnh tương ứng chưa phân công, đang sửa, chờ khách trả tiền,
-- đã hoàn tất và chờ quản lý đối soát. INSERT IGNORE giữ dữ liệu người dùng khi chạy lại.
INSERT IGNORE INTO work_orders
 (order_code,vehicle_id,created_by,assigned_to,symptoms,status,total_amount,created_at,assigned_at,finished_at,stock_deducted_at) VALUES
 ('DEMO-001',@demo_vehicle_1,@demo_tech_an,NULL,'Kiểm tra lọc dầu và tiếng máy','RECEIVED',280000,NOW()-INTERVAL 2 DAY,NULL,NULL,NULL),
 ('DEMO-002',@demo_vehicle_2,@demo_tech_binh,@demo_tech_an,'Thay dầu định kỳ','IN_PROGRESS',1000000,NOW()-INTERVAL 1 DAY,NOW()-INTERVAL 1 DAY,NULL,NULL),
 ('DEMO-003',@demo_vehicle_1,@demo_tech_an,@demo_tech_binh,'Thay má phanh trước','WAITING_PAYMENT',1500000,NOW()-INTERVAL 4 DAY,NOW()-INTERVAL 4 DAY,NOW()-INTERVAL 3 DAY,NOW()-INTERVAL 3 DAY),
 ('DEMO-004',@demo_vehicle_2,@demo_tech_binh,@demo_tech_an,'Thay lọc dầu','COMPLETED',280000,NOW()-INTERVAL 7 DAY,NOW()-INTERVAL 7 DAY,NOW()-INTERVAL 6 DAY,NOW()-INTERVAL 6 DAY),
 ('DEMO-005',@demo_vehicle_2,@demo_tech_binh,@demo_tech_binh,'Bảo dưỡng dầu động cơ','WAITING_PAYMENT',1050000,NOW()-INTERVAL 3 DAY,NOW()-INTERVAL 3 DAY,NOW()-INTERVAL 2 DAY,NOW()-INTERVAL 2 DAY);
SET @demo_order_1 = (SELECT id FROM work_orders WHERE order_code='DEMO-001');
SET @demo_order_2 = (SELECT id FROM work_orders WHERE order_code='DEMO-002');
SET @demo_order_3 = (SELECT id FROM work_orders WHERE order_code='DEMO-003');
SET @demo_order_4 = (SELECT id FROM work_orders WHERE order_code='DEMO-004');
SET @demo_order_5 = (SELECT id FROM work_orders WHERE order_code='DEMO-005');
SET @demo_filter = (SELECT id FROM parts WHERE part_code='FILTER-01');
SET @demo_oil = (SELECT id FROM parts WHERE part_code='OIL-01');
SET @demo_brake = (SELECT id FROM parts WHERE part_code='BRAKE-01');

-- Khởi: ID hạng mục cố định giúp seed chạy lại mà không nhân đôi dòng.
-- Tân: tồn kho ban đầu là số còn hiện tại; các lệnh lịch sử đã được tính trước khi lấy mốc tồn này.
INSERT IGNORE INTO work_order_items
 (id,work_order_id,part_id,item_type,item_name,quantity,unit_price,total_price) VALUES
 (1001,@demo_order_1,@demo_filter,'PART','Lọc dầu',1,180000,180000),
 (1002,@demo_order_1,NULL,'LABOR','Kiểm tra và thay lọc',1,100000,100000),
 (1003,@demo_order_2,@demo_oil,'PART','Dầu động cơ 4L',1,850000,850000),
 (1004,@demo_order_2,NULL,'LABOR','Thay dầu động cơ',1,150000,150000),
 (1005,@demo_order_3,@demo_brake,'PART','Má phanh trước',1,1200000,1200000),
 (1006,@demo_order_3,NULL,'LABOR','Thay má phanh',1,300000,300000),
 (1007,@demo_order_4,@demo_filter,'PART','Lọc dầu',1,180000,180000),
 (1008,@demo_order_4,NULL,'LABOR','Thay lọc dầu',1,100000,100000),
 (1009,@demo_order_5,@demo_oil,'PART','Dầu động cơ 4L',1,850000,850000),
 (1010,@demo_order_5,NULL,'LABOR','Bảo dưỡng động cơ',1,200000,200000);
-- Kiệt: các lệnh mẫu đã sửa xong có checklist hoàn tất; lệnh đang sửa giữ 0%.
UPDATE work_order_items i JOIN work_orders w ON w.id=i.work_order_id
SET i.progress_percent=100
WHERE i.item_type='LABOR' AND w.status IN ('WAITING_PAYMENT','COMPLETED') AND i.progress_percent=0;

-- Lợi: đủ ba trạng thái hóa đơn để demo báo chuyển khoản và đối soát VietQR.
INSERT IGNORE INTO invoices (work_order_id,amount,payment_status,payment_method,reported_at,paid_at) VALUES
 (@demo_order_1,280000,'UNPAID','VIETQR',NULL,NULL),
 (@demo_order_2,1000000,'UNPAID','VIETQR',NULL,NULL),
 (@demo_order_3,1500000,'UNPAID','VIETQR',NULL,NULL),
 (@demo_order_4,280000,'PAID','VIETQR',NOW()-INTERVAL 6 DAY,NOW()-INTERVAL 5 DAY),
 (@demo_order_5,1050000,'PENDING_VERIFICATION','VIETQR',NOW()-INTERVAL 1 DAY,NULL);

-- Khởi: chỉ sửa các giá trị seed bị đọc nhầm UTF-8 thành latin1 ở bản chạy cũ.
-- So khớp chính xác chuỗi lỗi trước khi cập nhật để không đè dữ liệu người dùng đã sửa.
UPDATE users u JOIN (
 SELECT '0988888802' phone, 'Quản lý gara' name UNION ALL
 SELECT '0988888803', 'Kỹ thuật viên An' UNION ALL
 SELECT '0988888804', 'Kỹ thuật viên Bình'
) s ON s.phone=u.phone_number SET u.full_name=s.name
WHERE u.full_name=CONVERT(CAST(s.name AS BINARY) USING latin1);
UPDATE customers c JOIN (
 SELECT '0901234567' phone, 'Nguyễn Minh Anh' name UNION ALL
 SELECT '0902345678', 'Trần Quốc Nam'
) s ON s.phone=c.phone_number SET c.full_name=s.name
WHERE c.full_name=CONVERT(CAST(s.name AS BINARY) USING latin1);
UPDATE parts p JOIN (
 SELECT 'OIL-01' code, 'Dầu động cơ 4L' name, 'Can' unit UNION ALL
 SELECT 'FILTER-01', 'Lọc dầu', 'Cái' UNION ALL
 SELECT 'BRAKE-01', 'Má phanh trước', 'Bộ' UNION ALL
 SELECT 'BATTERY-01', 'Ắc quy 12V', 'Bình' UNION ALL
 SELECT 'AIRFILTER-01', 'Lọc gió động cơ', 'Cái' UNION ALL
 SELECT 'COOLANT-01', 'Nước làm mát 4L', 'Can'
) s ON s.code=p.part_code
SET p.part_name=IF(p.part_name=CONVERT(CAST(s.name AS BINARY) USING latin1),s.name,p.part_name),
    p.unit=IF(p.unit=CONVERT(CAST(s.unit AS BINARY) USING latin1),s.unit,p.unit);
UPDATE work_orders w JOIN (
 SELECT 'DEMO-001' code, 'Kiểm tra lọc dầu và tiếng máy' name UNION ALL
 SELECT 'DEMO-002', 'Thay dầu định kỳ' UNION ALL
 SELECT 'DEMO-003', 'Thay má phanh trước' UNION ALL
 SELECT 'DEMO-004', 'Thay lọc dầu' UNION ALL
 SELECT 'DEMO-005', 'Bảo dưỡng dầu động cơ'
) s ON s.code=w.order_code SET w.symptoms=s.name
WHERE w.symptoms=CONVERT(CAST(s.name AS BINARY) USING latin1);
UPDATE work_order_items i JOIN (
 SELECT 1001 id, 'Lọc dầu' name UNION ALL
 SELECT 1002, 'Kiểm tra và thay lọc' UNION ALL
 SELECT 1003, 'Dầu động cơ 4L' UNION ALL
 SELECT 1004, 'Thay dầu động cơ' UNION ALL
 SELECT 1005, 'Má phanh trước' UNION ALL
 SELECT 1006, 'Thay má phanh' UNION ALL
 SELECT 1007, 'Lọc dầu' UNION ALL
 SELECT 1008, 'Thay lọc dầu' UNION ALL
 SELECT 1009, 'Dầu động cơ 4L' UNION ALL
 SELECT 1010, 'Bảo dưỡng động cơ'
) s ON s.id=i.id SET i.item_name=s.name
WHERE i.item_name=CONVERT(CAST(s.name AS BINARY) USING latin1);
