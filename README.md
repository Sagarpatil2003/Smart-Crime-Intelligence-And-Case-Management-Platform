# 🚔 Crime Response & Tracking System (CRTS)

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Redis](https://img.shields.io/badge/Redis-Queue-red)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

# 📖 Executive Summary

Crime Response & Tracking System (CRTS) is a real-time emergency incident management platform designed to digitize the complete crime-response lifecycle.

The platform enables:

- Crime Reporting
- Officer Assignment
- Case Investigation
- Evidence Management
- Real-Time Tracking
- Alert Broadcasting
- Audit Logging
- Geospatial Analytics

The system is built using a scalable service-oriented architecture powered by:

```txt
React + Node.js + Express + MongoDB + Redis + BullMQ + Socket.IO
```

---

# 🌐 Live Demo

### Frontend

[https://your-frontend-url.vercel.app](https://smart-crime-intelligence-and-case-management-platfor-cnfa7zaq2.vercel.app/dashboard)

### Backend API

[https://your-backend-url.onrender.com](https://smart-crime-intelligence-and-case.onrender.com)

---

# 📸 Application Screenshots

## 🏠 Dashboard

<img src="./screenshots/Dashbored.jpg" width="100%" alt="Dashboard"/>

Real-time command center displaying active incidents, crime metrics, alerts, and operational insights.

---

## 🔐 Login Page

<img src="./screenshots/Login.jpg" width="100%" alt="Login Page"/>

Secure authentication interface supporting JWT-based login and role-based access control.

---

## 🚨 Report Crime

<img src="./screenshots/ReportCase.jpg" width="100%" alt="Report Crime"/>

Multi-step crime reporting interface allowing citizens to submit incident details and evidence.

---

## 🌍 Crime Hotspot Analytics

<img src="./screenshots/CrimeHotspot.jpg" width="100%" alt="Crime Hotspot"/>

Interactive geospatial crime analysis dashboard highlighting crime-prone zones and hotspots.

---

## 📋 Crime Details Page

<img src="./screenshots/CrimeDetailePage.jpg" width="100%" alt="Crime Details"/>

Detailed investigation dashboard containing case information, evidence, officer assignment, and workflow status.

---

## 📑 Created Crime List

<img src="./screenshots/CreatedCrimeList.jpg" width="100%" alt="Crime List"/>

Centralized incident repository with advanced filtering, searching, and status tracking.

---

# 🎯 Business Problem

Traditional incident management systems often face:

- Manual officer assignment
- Delayed communication
- Lack of transparency
- Poor evidence tracking
- No real-time updates
- Limited analytics

These limitations increase response time and reduce operational efficiency.

CRTS solves these problems through:

✅ Real-Time Communication

✅ Workflow Automation

✅ GIS-Based Location Tracking

✅ Intelligent Officer Assignment

✅ Audit Logging

---

# 🏗️ High Level Architecture

```mermaid
flowchart TD

A[Citizen Portal]
B[React Frontend]
C[Express API Layer]

D[Authentication Service]
E[Case Service]
F[Evidence Service]

G[(MongoDB)]
H[(Redis)]

I[BullMQ]
J[Workers]

K[Socket.IO]

A --> B
B --> C

C --> D
C --> E
C --> F

D --> G
E --> G
F --> G

E --> H

H --> I
I --> J

J --> K
K --> B
```

---

# ⚙️ System Design

## Backend Architecture

```txt
Routes
  │
  ▼

Controllers
  │
  ▼

Services
  │
  ▼

Models
  │
  ▼

MongoDB
```

### Benefits

- Clean Separation of Concerns
- Easy Testing
- Better Maintainability
- Horizontal Scalability

---

# 🛠️ Technology Stack

| Layer | Technology |
|---------|------------|
| Frontend | React |
| State Management | Redux Toolkit |
| Styling | Tailwind CSS |
| Backend | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| Queue System | BullMQ |
| Cache Layer | Redis |
| Realtime | Socket.IO |
| Authentication | JWT |
| Validation | Joi |
| File Upload | Multer |

---

# 🔐 Authentication & Authorization

## Authentication Flow

```txt
Login
  │
  ▼

Validate Credentials
  │
  ▼

Generate JWT
  │
  ▼

Generate Refresh Token
  │
  ▼

Return Tokens
```

### Security Features

- JWT Access Tokens
- Refresh Tokens
- Password Hashing
- Bcrypt
- Secure Cookies
- Token Rotation

---

# 👮 Role Based Access Control

| Role | Permissions |
|---------|------------|
| Admin | Full System Access |
| Officer | Manage Assigned Cases |
| Dispatch | Officer Allocation |
| Citizen | Report Crimes |

---

# 📂 Case Lifecycle Engine

```mermaid
stateDiagram-v2

OPEN --> ASSIGNED
ASSIGNED --> INVESTIGATING
INVESTIGATING --> RESOLVED
RESOLVED --> CLOSED
```

Workflow middleware prevents invalid transitions.

```txt
OPEN -> ASSIGNED      ✅ Allowed
OPEN -> CLOSED        ❌ Blocked
```

---

# 🌍 Geospatial Intelligence

### Features

- Nearby Incident Detection
- Radius Search
- Crime Heatmaps
- Distance Calculations
- Officer Routing

### Technologies

```txt
GeoJSON
Haversine Formula
MongoDB Geospatial Queries
```

---

# ⚡ Real-Time Communication

Implemented using:

```txt
Socket.IO
```

### Real-Time Events

```txt
CASE_CREATED
CASE_UPDATED
OFFICER_ASSIGNED
ALERT_CREATED
LOCATION_UPDATED
```

Benefits:

- Instant Updates
- Reduced API Polling
- Better User Experience

---

# 🔄 Queue Based Processing

Heavy operations are processed asynchronously.

### Queue Flow

```mermaid
flowchart LR

A[Create Alert]
--> B[Redis]

B --> C[BullMQ Queue]

C --> D[Worker]

D --> E[Send Notification]
```

### Processed Jobs

- Alert Delivery
- Officer Matching
- Analytics Generation
- Scheduled Tasks

---

# 📊 Database Collections

## User

```js
{
  name,
  email,
  password,
  role,
  department
}
```

## Case

```js
{
  title,
  description,
  category,
  location,
  status,
  assignedOfficer
}
```

## Evidence

```js
{
  caseId,
  fileUrl,
  type,
  uploadedBy
}
```

## AuditLog

```js
{
  action,
  actor,
  timestamp,
  metadata
}
```

---

# 🚀 Scalability Strategy

```txt
Load Balancer
      │

 ┌────┼────┐

Node1 Node2 Node3

      │

Redis Cluster

      │

MongoDB Replica Set
```

---

# 🧪 Engineering Challenges Solved

### Real-Time Synchronization

**Solution:** Socket.IO Event Architecture

### Heavy Processing

**Solution:** BullMQ + Redis Workers

### Unauthorized Access

**Solution:** RBAC + JWT + Permission Middleware

### Location-Based Assignment

**Solution:** GeoJSON + Haversine Calculations

---

# 📈 Skills Demonstrated

- REST API Design
- Authentication
- Authorization
- RBAC
- MongoDB Schema Design
- Redis
- BullMQ
- Socket.IO
- Geospatial Computing
- Queue Processing
- Service Layer Architecture
- Error Handling
- Scalable System Design
- Real-Time Systems

---

# 🔮 Future Enhancements

### Phase 2

- AI Crime Classification
- Predictive Analytics
- Push Notifications
- Mobile Application

### Phase 3

- Kafka
- Kubernetes
- Microservices
- Event Sourcing

---

# 👨‍💻 Author

## Sagar

Full Stack Developer

### Tech Stack

```txt
JavaScript | React | Node.js | Express.js | MongoDB | Redis | Socket.IO
```

### Connect With Me

- GitHub: https://github.com/yourusername
- LinkedIn: https://linkedin.com/in/yourprofile

---

# ⭐ If you found this project useful, please give it a star.
