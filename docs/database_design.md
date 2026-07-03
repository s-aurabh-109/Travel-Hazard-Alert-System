# Database Design
## Travel Hazard Alert System

Version: 1.0

---

# Purpose

This document defines the database architecture for the Travel Hazard Alert System.

The goal is to clearly specify:

- Why PostgreSQL is required
- Which service owns which database
- What data each service stores
- What data must not be stored
- Data ownership rules
- Future scalability

---

# Overall Architecture

                Frontend
                    │
                    ▼
            backend-service
                    │
      ┌─────────────┴─────────────┐
      ▼                           ▼
 ai-service              blockchain-service
      │
      ▼
 model-service

Redis stores live state.

PostgreSQL stores persistent business data.

Blockchain stores tamper-proof proof.

---

# Storage Responsibilities

Redis
- Live tourist location
- Cache
- Temporary data
- Fast lookup

PostgreSQL
- Historical AI data
- AI decisions
- Safety scores
- Alerts
- Blockchain metadata

Blockchain
- Hashes
- Integrity verification
- Tamper-proof proof

---

# PostgreSQL Architecture

One PostgreSQL Server

├── ai_db
│
└── blockchain_db

Each microservice owns exactly one database.

No service writes directly into another service's database.

---

# Database Ownership

backend-service

Database:
None (currently)

Responsibilities

- API Gateway
- Redis communication
- Service orchestration

Persistent storage:
No

---

ai-service

Database:
ai_db

Responsibilities

- Geofence analysis
- Risk prediction
- Safety score generation
- Anomaly detection
- Historical AI records

---

blockchain-service

Database:
blockchain_db

Responsibilities

- Hash generation
- Hash verification
- Audit records
- Blockchain metadata

---

model-service

Database:
None

Responsibilities

- Machine Learning inference
- Prediction generation

Model service remains stateless.

---

# AI Database Contents

The AI database stores persistent AI knowledge.

Examples include

- Location snapshots
- Risk predictions
- Safety scores
- Anomaly alerts
- Prediction logs
- Analytics data

The AI database DOES NOT store

- Passwords
- Email
- Aadhaar
- Passport
- User profile
- Authentication data

These belong to the real backend/authentication service.

---

# Blockchain Database Contents

The Blockchain database stores metadata.

Examples

- Hash records
- Verification history
- Audit logs
- Transaction metadata

It does NOT store

- Safety scores
- AI predictions
- GPS history
- Hospital data

Those belong to ai_db.

---

# Data Flow

Tourist

↓

Backend receives GPS

↓

Redis updated

↓

AI Service reads data

↓

Geofence Analysis

↓

Risk Prediction

↓

Safety Score

↓

Alert Generated

↓

Stored inside ai_db

↓

Hash Generated

↓

Hash stored in blockchain_db

↓

Hash anchored to Blockchain

---

# Design Principles

Principle 1

Every piece of data has exactly one owner.

---

Principle 2

Services own their own database.

No cross-service writes.

---

Principle 3

Redis stores temporary state.

PostgreSQL stores permanent history.

---

Principle 4

Blockchain stores proof,
not business data.

---

Principle 5

The AI database stores only the minimum evidence
required to explain every AI decision.

---

# Future Expansion

Future databases may include

analytics_db

notification_db

authentication_db

logging_db

without affecting existing services.

---

End of Document