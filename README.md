# Order & Notification Demo

This project demonstrates a modern event-driven architecture using NestJS, React, MongoDB, and RabbitMQ.

## 🚀 How to Run

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v20+)

### 2. Infrastructure (MongoDB & RabbitMQ)
```bash
docker-compose up -d
```

### 3. Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
The backend runs on http://localhost:3000

### 4. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on http://localhost:5173 (or as shown in the console)

## 🎯 Demo Scenario
1. Open the frontend.
2. Add a few products in **Product Management**.
3. Create an order in **Create Order**.
4. Observe the **Orders List**:
   - Status starts as `PENDING`.
   - After 2 seconds (RabbitMQ processing), it changes to `PROCESSED` (auto-polls).
5. Copy an **Order ID** and paste it into **Order Details** to see the enriched data fetched via MongoDB aggregation ($lookup).

## 🧩 Key Features
- **Event-Driven:** Order creation publishes a message to RabbitMQ; a consumer processes it asynchronously.
- **Aggregation:** `$lookup` is used to join products and orders in the backend.
- **Clean Code:** Standard NestJS module structure, global filters, and interceptors.
- **Logging:** All requests and RabbitMQ events are logged in the backend console.
