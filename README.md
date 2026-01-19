# 📚 Nalanda Library Management System

A robust, scalable backend for a Library Management System built with **Node.js, Express, MongoDB, and GraphQL**.

This project demonstrates a production-grade architecture with **RESTful APIs** and **GraphQL**, featuring advanced security (AES-256 Encryption for JWT) and complex MongoDB Aggregations for analytics.

---

## 🚀 Features

### 🔐 Security & Auth

- **Dual-Layer Authentication:** JWT (JSON Web Tokens) with **AES-256 Encryption** for payload protection.
- **Role-Based Access Control (RBAC):** Strict separation between `Admin` and `Member` roles.
- **Secure Headers:** Implemented using `helmet`.

### 📚 Book Management

- **CRUD Operations:** Admins can Create, Update, and Delete books.
- **Search & Filter:** Public access to list books with pagination, filtering by genre, and author search.
- **Availability Tracking:** Real-time tracking of available copies.

### 🔄 Borrowing System

- **Transaction Logic:** Members can borrow and return books.
- **History:** Users can view their complete borrowing history.
- **Validation:** Prevents borrowing if copies are 0 or if the user already has the book.

### 📊 Analytics & Reports (Aggregations)

- **Most Borrowed Books:** Identifies top performing inventory.
- **Active Members:** Tracks user engagement.
- **Inventory Summary:** Real-time stats on total vs. available books.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **API Standards:** REST & GraphQL
- **Security:** `bcryptjs` (Hashing), `crypto` (AES Encryption), `helmet`
- **Tools:** Postman (Testing), Git (Version Control)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd nalanda-library
```
