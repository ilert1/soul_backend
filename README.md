# SOUL TMA Backend

This repository contains the backend for the **SOUL TMA** application.  
The backend consists of three main components:

- **Database — PostgreSQL**  
  Runs in its own Docker container.

- **Backend Service — NestJS + Prisma ORM**  
  Located in `./apps/backend`. Deployed in its own Docker container.

- **Admin Panel — AdminJS**  
  Located in `./apps/admin`. Deployed in its own Docker container.

---

## 🎯 Goal

To create a convenient tool for organizing a local community anywhere in the world, providing the minimum necessary functionality to launch marketing activities, engage users, and demonstrate the product to investors.

---

## 🚀 Core Functionality

### 1. Event Management

- Create and participate in events  
- Check-in confirmation via QR code at the event location  
- Interactive map and event list  
- Earn in-game points and experience for creating and attending events  

---

### 2. Gamification

- Earn game points for daily farming and completing tasks  
  (subscriptions, check-ins, inviting friends, etc.)  
- User leaderboard with country-based filtering  

---

### 3. Referral Program

- Generate a personal referral link  
- View a list of invited users (referrals)  

---

### 4. User Profile

- Avatar generation; edit name, country, and description  
- Display gaming statistics: points, rank, experience, activity history  
- Public profile visible to other users  
- Display user geolocation (with permission) on an interactive map  

---
