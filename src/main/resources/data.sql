-- Roles initialization
INSERT INTO roles (id, name) VALUES (1, 'ROLE_USER') ON CONFLICT(id) DO NOTHING;
INSERT INTO roles (id, name) VALUES (2, 'ROLE_ADMIN') ON CONFLICT(id) DO NOTHING;

-- Users initialization
-- Note: Passwords are BCrypt encoded, 'password123' for all users
INSERT INTO users (id, name, email, password, phone_number, address) 
VALUES (1, 'Admin User', 'admin@example.com', '$2a$10$rYWHJFcAPLcS1z7JTCDDTu3GY70.yoCeJLo0C8tCxzOI7e2J6FkES', '0987654321', '123 Admin Street')
ON CONFLICT(id) DO UPDATE SET 
    name = excluded.name,
    email = excluded.email,
    password = excluded.password,
    phone_number = excluded.phone_number,
    address = excluded.address;

INSERT INTO users (id, name, email, password, phone_number, address) 
VALUES (2, 'Nguyen Van A', 'nguyenvana@example.com', '$2a$10$rYWHJFcAPLcS1z7JTCDDTu3GY70.yoCeJLo0C8tCxzOI7e2J6FkES', '0901234567', '456 Nguyen Hue St, District 1, HCMC')
ON CONFLICT(id) DO UPDATE SET 
    name = excluded.name,
    email = excluded.email,
    password = excluded.password,
    phone_number = excluded.phone_number,
    address = excluded.address;

INSERT INTO users (id, name, email, password, phone_number, address) 
VALUES (3, 'Tran Thi B', 'tranthib@example.com', '$2a$10$rYWHJFcAPLcS1z7JTCDDTu3GY70.yoCeJLo0C8tCxzOI7e2J6FkES', '0912345678', '789 Le Loi St, District 1, HCMC')
ON CONFLICT(id) DO UPDATE SET 
    name = excluded.name,
    email = excluded.email,
    password = excluded.password,
    phone_number = excluded.phone_number,
    address = excluded.address;

INSERT INTO users (id, name, email, password, phone_number, address) 
VALUES (4, 'Le Van C', 'levanc@example.com', '$2a$10$rYWHJFcAPLcS1z7JTCDDTu3GY70.yoCeJLo0C8tCxzOI7e2J6FkES', '0923456789', '101 Tran Hung Dao St, District 5, HCMC')
ON CONFLICT(id) DO UPDATE SET 
    name = excluded.name,
    email = excluded.email,
    password = excluded.password,
    phone_number = excluded.phone_number,
    address = excluded.address;

-- User-Role assignments
INSERT INTO users_roles (user_id, role_id) VALUES (1, 1) ON CONFLICT(user_id, role_id) DO NOTHING;
INSERT INTO users_roles (user_id, role_id) VALUES (1, 2) ON CONFLICT(user_id, role_id) DO NOTHING;
INSERT INTO users_roles (user_id, role_id) VALUES (2, 1) ON CONFLICT(user_id, role_id) DO NOTHING;
INSERT INTO users_roles (user_id, role_id) VALUES (3, 1) ON CONFLICT(user_id, role_id) DO NOTHING;
INSERT INTO users_roles (user_id, role_id) VALUES (4, 1) ON CONFLICT(user_id, role_id) DO NOTHING;

-- Services initialization
INSERT INTO services (id, name, price_per_kg, description, image_url) 
VALUES (1, 'Giặt thường', 15000, 'Dịch vụ giặt thông thường, giao trong 48 giờ', '/img/services/regular-wash.jpg')
ON CONFLICT(id) DO UPDATE SET 
    name = excluded.name,
    price_per_kg = excluded.price_per_kg,
    description = excluded.description,
    image_url = excluded.image_url;

INSERT INTO services (id, name, price_per_kg, description, image_url) 
VALUES (2, 'Giặt nhanh', 25000, 'Dịch vụ giặt nhanh, giao trong 24 giờ', '/img/services/express-wash.jpg')
ON CONFLICT(id) DO UPDATE SET 
    name = excluded.name,
    price_per_kg = excluded.price_per_kg,
    description = excluded.description,
    image_url = excluded.image_url;

INSERT INTO services (id, name, price_per_kg, description, image_url) 
VALUES (3, 'Giặt hấp', 35000, 'Dịch vụ giặt hấp cao cấp, giao trong 48 giờ', '/img/services/steam-wash.jpg')
ON CONFLICT(id) DO UPDATE SET 
    name = excluded.name,
    price_per_kg = excluded.price_per_kg,
    description = excluded.description,
    image_url = excluded.image_url;

INSERT INTO services (id, name, price_per_kg, description, image_url) 
VALUES (4, 'Giặt khô', 45000, 'Dịch vụ giặt khô chuyên nghiệp, giao trong 72 giờ', '/img/services/dry-clean.jpg')
ON CONFLICT(id) DO UPDATE SET 
    name = excluded.name,
    price_per_kg = excluded.price_per_kg,
    description = excluded.description,
    image_url = excluded.image_url;

-- Orders initialization (sample orders with different statuses for different users)
-- Current date
INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (1, 'ORD-20230501-001', 2, 1, 3.5, date('now', '-7 days'), date('now', '-5 days'), 'COMPLETED', 'Giao vào buổi sáng nếu có thể')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note;

INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (2, 'ORD-20230505-002', 2, 2, 2.0, date('now', '-3 days'), date('now', '-2 days'), 'COMPLETED', 'Có quần áo dễ phai màu')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note;

INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (3, 'ORD-20230510-003', 2, 3, 4.0, date('now', '-1 days'), date('now', '+1 days'), 'WASHING', 'Cần giặt kỹ')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note;

INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (4, 'ORD-20230515-004', 3, 1, 5.0, date('now', '-5 days'), date('now', '-3 days'), 'COMPLETED', 'Không dùng nước xả vải')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note;

INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (5, 'ORD-20230520-005', 3, 4, 1.5, date('now'), date('now', '+3 days'), 'PENDING', 'Quần áo lụa, xử lý cẩn thận')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note;

INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (6, 'ORD-20230525-006', 4, 2, 3.0, date('now', '-2 days'), date('now', '-1 days'), 'COMPLETED', 'Giao vào buổi chiều')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note;

INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (7, 'ORD-20230530-007', 4, 3, 2.5, date('now'), date('now', '+2 days'), 'PENDING', 'Có áo khoác cần giặt hấp kỹ')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note;

-- Future orders (pending)
INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (8, 'ORD-20230601-008', 2, 4, 4.5, date('now', '+1 days'), date('now', '+4 days'), 'PENDING', 'Bộ comple cần giặt khô')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note;

INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (9, 'ORD-20230605-009', 3, 2, 3.2, date('now', '+2 days'), date('now', '+3 days'), 'PENDING', 'Đồ trẻ em, dùng xà phòng nhẹ')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note;

INSERT INTO orders (id, order_code, customer_id, service_id, weight, received_date, return_date, status, note)
VALUES (10, 'ORD-20230610-010', 4, 1, 5.5, date('now', '+3 days'), date('now', '+5 days'), 'PENDING', 'Chăn màn cần giặt kỹ')
ON CONFLICT(id) DO UPDATE SET 
    order_code = excluded.order_code,
    customer_id = excluded.customer_id,
    service_id = excluded.service_id,
    weight = excluded.weight,
    received_date = excluded.received_date,
    return_date = excluded.return_date,
    status = excluded.status,
    note = excluded.note; 