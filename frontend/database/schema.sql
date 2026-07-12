CREATE DATABASE IF NOT EXISTS dlp_project;
USE dlp_project;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

CREATE TABLE scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255),
    risk VARCHAR(100),
    status VARCHAR(100)
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    action VARCHAR(255),
    timestamp VARCHAR(100)
);
