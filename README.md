# 🏥 HMIS — Hospital Management Information System

A full-stack Hospital Management Information System built with **React** and **Spring Boot**, designed to streamline hospital operations including patient management, appointments, billing, and more.

---

## 📁 Project Structure

```
New_HIMS_App/
├── hmis-backend/      # Spring Boot REST API
└── hmis-ui/           # React Frontend
```

---

## ✨ Features

- 👤 **Patient Registration & Management** — Register new patients, manage records, search 
- 📅 **Appointment Booking** — Online appointment scheduling with department, doctor, and time slot selection
- 🏨 **OPD / IPD Management** — Handle outpatient and inpatient workflows seamlessly
- 💳 **Billing & Payments** — Generate bills, manage payments, and track dues
- 👨‍⚕️ **Doctor & Staff Management** — Manage doctor profiles, schedules, and staff roles
- 📊 **Reports & Analytics** — Generate operational reports and insights

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Spring Boot (Java) |
| Database | MySQL |
| API Style | REST |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven

---

### 🔧 Backend Setup (Spring Boot)

```bash
# Navigate to backend folder
cd hmis-backend

# Configure your database in src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/hmis
spring.datasource.username=your_username
spring.datasource.password=your_password

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend runs on: `http://localhost:9090`

---

### 🎨 Frontend Setup (React)

```bash
# Navigate to UI folder
cd hmis-ui

# Install dependencies
npm install

# Start the development server
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🗄️ Database Setup

```sql
CREATE DATABASE hmis_db;
```

> Spring Boot will auto-create the tables on first run if `spring.jpa.hibernate.ddl-auto=update` is set in `application.properties`.

---

## 📡 API Overview

| Module | Base Endpoint |
|---|---|
| Auth | `/api/rest/auth/` |
| Patient | `/api/rest/patientRegAppt/` |
| Appointment | `/api/rest/walkinVisit/` |
| Masters | `/api/rest/masters/` |

> Full API reference is available in `Pulse HMS Documentation.pdf`

---

## 📸 Screenshots

> _Add screenshots of your app here_

---

## 🙋‍♂️ Author

**Rizwan Khan**
- GitHub: [@RizwannKhan](https://github.com/RizwannKhan)

---

## 📄 License

This project is for personal use. All rights reserved.
