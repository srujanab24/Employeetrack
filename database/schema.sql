-- Employee Information Management System
-- MySQL Schema

CREATE DATABASE IF NOT EXISTS employee_db;
USE employee_db;

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(50) NOT NULL,
  designation VARCHAR(50) NOT NULL,
  salary DECIMAL(10, 2) NOT NULL,
  date_of_joining DATE NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO employees (first_name, last_name, email, phone, department, designation, salary, date_of_joining, status) VALUES
('Alice',   'Johnson', 'alice.johnson@company.com',  '9876543210', 'Engineering',  'Senior Developer',    85000.00, '2021-03-15', 'Active'),
('Bob',     'Smith',   'bob.smith@company.com',      '9876543211', 'Marketing',    'Marketing Manager',   72000.00, '2020-07-01', 'Active'),
('Carol',   'Williams','carol.williams@company.com', '9876543212', 'HR',           'HR Specialist',       60000.00, '2022-01-10', 'Active'),
('David',   'Brown',   'david.brown@company.com',    '9876543213', 'Finance',      'Financial Analyst',   68000.00, '2019-11-20', 'Inactive'),
('Eva',     'Davis',   'eva.davis@company.com',      '9876543214', 'Engineering',  'Junior Developer',    55000.00, '2023-06-01', 'Active');
