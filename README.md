# FMIS Backend

Welcome to the **FMIS Backend** repository! This backend system serves as the API layer for the **Farm Management Information System (FMIS)**, designed to manage farm data, calculate NDVI (Normalized Difference Vegetation Index), and provide real-time insights for farm management.

The backend is built using **Node.js**, **Express**, and **MySQL**. It provides endpoints for creating and managing farms, retrieving NDVI data, and much more.

---

## Table of Contents

- [Technologies](#technologies)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [API Documentation](#api-documentation)

---

## Technologies

- **Node.js** - JavaScript runtime for building scalable network applications.
- **Express.js** - Web framework for Node.js.
- **MySQL** - Relational database for storing farm data and NDVI results.
- **JWT Authentication** - JSON Web Token for securing API routes.

---

## Features

- **Farm Management**: Create, update, delete, and fetch farms for users.
- **NDVI Calculation**: Fetch and store NDVI results for farms based on the farm's boundaries.
- **User Authentication**: JWT-based authentication to protect sensitive API routes.
- **Farm Boundaries**: Store farm boundary coordinates for better farm management and precision farming.

---

## Installation

### Prerequisites

Before setting up the backend, make sure you have the following installed:

- **Node.js** (v14+ recommended)
- **MySQL** or **MariaDB**

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/fmis-backend.git
   cd fmis-backend
2. **Install dependencies**:
   ```bash
   npm install
3. **Set up your MySQL database:**:
- Use the sql file in models to create the databse 

4. **Set environment variables:**:
- Create a .env file in the root directory



---

This should give you a complete profile setup for the `fmis-backend` project. Let me know if you need anything else!
