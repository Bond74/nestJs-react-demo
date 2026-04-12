You are a senior full-stack engineer. Your task is to generate a complete demo application that demonstrates a modern event-driven architecture using Node.js, TypeScript, React, NestJS, MongoDB, and RabbitMQ.

## 🎯 Goal

Build a small but realistic “Order & Notification System” that demonstrates:

- REST API design
- MongoDB aggregation (including `$lookup`)
- Event-driven communication with RabbitMQ
- Clean architecture and best practices in NestJS

The implementation should be **concise but production-like**, suitable for a technical interview demo, and achievable within **1–2 days of development**.

---

## 🧱 Tech Stack

### Backend

- NestJS (TypeScript)
- MongoDB with Mongoose
- RabbitMQ (use amqplib or NestJS microservices)
- ConfigModule for environment variables

### Frontend

- React (Vite or CRA)
- TypeScript
- Minimal UI (no need for heavy styling libraries)

---

## 📦 Core Domain

### Entities

#### User

- id
- name
- email

#### Product

- id
- name
- price

#### Order

- id
- userId
- items: { productId, quantity }
- status: "pending" | "processed"
- createdAt

---

## 🔧 Backend Requirements

### 1. REST API

Implement endpoints:

- POST /users
- POST /products
- GET /products
- POST /orders
- GET /orders
- GET /orders/:id ← must use aggregation

---

### 2. MongoDB Aggregation (IMPORTANT)

Implement a method to fetch order details using `$lookup`:

- Join orders with products
- Return enriched response with product details inside order

Use aggregation pipeline via Mongoose.

---

### 3. RabbitMQ Integration

#### Producer:

- When an order is created:
  - publish message: `{ orderId }`

#### Consumer:

- Listen to queue
- Process order:
  - simulate delay (e.g. 1–2 seconds)
  - update order status → "processed"
  - log processing result

---

### 4. Configuration

- Use `.env` file
- Centralized config using NestJS ConfigModule

Example variables:

- MONGO_URI
- RABBITMQ_URL
- PORT

---

### 5. Centralized Error Handling

- Implement a global exception filter
- Return consistent JSON error format:

  ```json
  {
    "statusCode": number,
    "message": string,
    "timestamp": string,
    "path": string
  }
  ```

---

### 6. Centralized Logging

- Implement logging using NestJS Logger or Winston
- Log:
  - incoming requests
  - errors
  - RabbitMQ events

---

## ⚛️ Frontend Requirements

Create a simple React UI with:

### Pages / Components

1. Product Management
   - Create product
   - List products

2. Order Creation
   - Select products + quantity
   - Submit order

3. Orders List
   - Show all orders
   - Display status (pending / processed)

4. Order Details
   - Show enriched order (with product data from aggregation)

---

## 🔄 Demo Scenarios (Must Work)

1. Create product
2. Create order → status = "pending"
3. RabbitMQ processes order → status = "processed"
4. Fetch order details → includes joined product data
5. Trigger error → see formatted error response
6. Show logs in console

---

## 🧩 Project Structure

Backend:

```
src/
  modules/
    users/
    products/
    orders/
    notifications/
  common/
    filters/
    interceptors/
    logger/
  config/
```

---

## 🐳 Optional (if time permits)

- Docker Compose for MongoDB + RabbitMQ
- Swagger API docs

---

## 📋 Expectations

- Clean, readable, modular code
- Proper separation of concerns
- Minimal but clear UI
- No overengineering
- Add comments explaining important parts (especially aggregation and messaging)

---

## 🚀 Output Format

Generate:

1. Backend project (NestJS)
2. Frontend project (React)
3. Instructions to run both
4. Example `.env` file
5. Key explanation comments in code

---

Focus on clarity and demonstrating real-world backend skills rather than UI polish.
