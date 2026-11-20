# NEXORA – Cloud-Based E-Commerce System with Infrastructure Simulation

**NEXORA** is a full-stack electronics e-commerce platform integrated with a local cloud infrastructure simulator. It demonstrates core cloud computing principles—including **Round-Robin Load Balancing**, **Horizontal Multi-Instance Processing**, **Dynamic Auto-Scaling**, **Shared Database Persistence**, and **High Availability (Failover)**—entirely on your local machine with zero external cloud dependencies or paid APIs.

---

## 1. System Architecture

```
                                 [ React Frontend (Vite) ]
                                      Port :3000
                                          │
                                 API Calls to Port :5000
                                          │
                                          ▼
                         [ Node.js Load Balancer :5000 ]
                         • Round-Robin Traffic Routing
                         • Real-time Telemetry & Health Probes
                         • Metrics API: /api/infra/metrics
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
          [ Backend Node #1 ]     [ Backend Node #2 ]     [ Backend Node #3 & #4 ]
             (Port :5001)            (Port :5002)           (Ports :5003, :5004)
           [Baseline Node]         [Baseline Node]         [Auto-Scaled Dynamic]
                  │                       │                       │
                  └───────────────────────┼───────────────────────┘
                                          ▼
                               [ Shared MongoDB Database ]
                                    (Port :27017)
                               • Products, Users, Orders
                               • Resilient persistent storage
                                          ▲
                                          │ Monitors RPS
                               [ Auto-Scaling Controller ]
                               • Scale Up Threshold: > 6.0 RPS
                               • Scale Down Threshold: < 3.0 RPS
```

---

## 2. Key Capabilities & Features

### A. Modern E-Commerce Platform
- **Ecosystem:** Smartphones, Laptops & Workstations, Wireless ANC Audio, Smartwatches, and Gaming Peripherals.
- **Pages & Flows:**
  - **Homepage:** Hero showcase, value propositions, curated flagships, community trending items.
  - **Catalog:** Live search, category filters, interactive price range slider, dynamic sorting.
  - **Product Details:** Technical specifications table, stock status, quantity adjust, instant cart additions.
  - **Shopping Cart:** Real-time totals, estimated sales tax (8%), shipping fee calculation.
  - **Checkout:** Customer address, simulated instant card payment authorization, order confirmation.
  - **User Account:** Profile management, sign-in/registration, order history tracking.
- **Routing Awareness:** Every page and product card displays which backend instance served the request and the response latency (`X-Backend-Instance` and `X-Response-Time`).

### B. Local Cloud Infrastructure Simulator
- **Multi-Instance Server Pool:** Independent Express processes running on ports `5001`, `5002`, `5003`, and `5004`.
- **Load Balancer (Port 5000):** Distributes incoming traffic across healthy nodes using round-robin.
- **Dynamic Auto-Scaler:** Spawns real child processes when request traffic crosses thresholds (Min: 2, Max: 4).
- **Chaos & Fault Tolerance:** Simulates node failure; traffic is instantly diverted away from failing nodes to healthy survivors.
- **Shared Database:** Shared MongoDB layer synchronizes orders and inventory across all running nodes.

### C. Cloud Control Center (Dashboard)
- **Live KPI Counters:** Active instances count, cluster RPS, total requests handled, database status.
- **Server Monitoring Grid:** Individual node cards showing port, PID, CPU workload %, memory MB, and health status.
- **Live Recharts Visualizations:**
  - Real-time **Traffic Curve (RPS over time)**.
  - **Load Balancer Request Distribution** across backend instances.
- **Interactive Simulation Bar:**
  - `Simulate High Traffic`: Triggers sudden traffic surge to demonstrate scale-up to 3 or 4 instances.
  - `Simulate Normal Traffic`: Normalizes traffic to demonstrate scale-down back to 2 baseline nodes.
  - `Simulate Low Traffic`: Idles the cluster.
  - `Chaos / Node Outage`: Injects 503 failure into a specific node and verifies zero downtime.
- **Live Infrastructure Event Log:** Timestamped audit trail of scaling, failovers, and recoveries.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, JavaScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend:** Node.js, Express.js (Multi-instance architecture)
- **Database:** MongoDB (with resilient local persistent storage)
- **Networking & Routing:** Node.js HTTP Reverse Proxy, Round-Robin algorithm, Health Monitor

---

## 4. Quick Start Guide

### Step 1: Install Dependencies
Open a terminal in the project root directory and run:

```bash
npm run install:all
```

*(This automatically installs dependencies across `frontend/`, `backend/`, and `infrastructure/`)*

### Step 2: Start the System
Run the unified orchestrator:

```bash
npm start
```

This single command launches:
1. **Load Balancer & Auto-Scaler** on `http://localhost:5000`
2. **Baseline Backend Instances** on `http://localhost:5001` and `http://localhost:5002`
3. **React Frontend** on `http://localhost:3000`

Now open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 5. Demonstration Walkthrough (Viva / Presentation Script)

| Step | Action | Expected Infrastructure Outcome |
| :--- | :--- | :--- |
| **1. Explore Store** | Browse catalog, search products, add items to cart | Notice the header pill: requests are distributed round-robin between `backend-1` and `backend-2`. |
| **2. Complete Checkout** | Checkout with simulated credit card | Order is persisted in the shared database and tagged with the fulfilling instance ID. |
| **3. Open Dashboard** | Click **"Cloud Simulator"** in the top navbar | Inspect live node cards, current RPS, Recharts traffic curve, and request distribution. |
| **4. Trigger Traffic Surge** | Click **"1. Surge Traffic"** button | Cluster RPS spikes. The Auto-Scaler detects high load and spawns `backend-3` (port 5003) and `backend-4` (port 5004). Scaling events log the actions in real time. |
| **5. Observe Load Balancing** | Watch the request distribution graph | Incoming requests are now shared across all 4 running nodes. |
| **6. Normalize Traffic** | Click **"2. Normal Traffic"** button | Traffic drops. The Auto-Scaler gracefully terminates surplus instances down to the 2 baseline nodes. |
| **7. Test Failover (Chaos)** | Click **"Fail Node #2"** button | `backend-2` enters failing state. The Load Balancer immediately routes 100% of traffic to healthy nodes without user-facing downtime. |
| **8. Restore Node** | Click **"Recover #2"** button | Node #2 passes health probes and is reintegrated into the round-robin pool. |

