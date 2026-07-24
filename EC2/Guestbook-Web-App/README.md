# Guestbook Web Application on Amazon EC2

## Overview

This project demonstrates how to deploy a simple full-stack web application on an Amazon EC2 Ubuntu instance.

The application consists of a React frontend, a Node.js + Express backend, and MongoDB Atlas for persistent cloud-based data storage. Visitors can submit a short message, which is stored in the database and displayed on the website in real time.

The objective of this project is to demonstrate the complete deployment workflow—from a locally developed application to a cloud-hosted solution running on AWS EC2.

---

# Features

* Responsive React frontend
* Node.js & Express REST API
* MongoDB Atlas cloud database integration
* Store visitor name, message, and timestamp
* Display all submitted messages
* Deploy on Ubuntu EC2
* Access the application over the public internet

---

# Screenshots

---

## Local application
  
<img width="1918" height="960" alt="Screenshot 2026-07-17 200214" src="https://github.com/user-attachments/assets/5a929c14-5ffb-4921-920b-582a7a61900c" />

<img width="1918" height="961" alt="Screenshot 2026-07-17 200222" src="https://github.com/user-attachments/assets/2d62f965-3499-41f3-999a-58e64d4e2044" />

<img width="1918" height="962" alt="Screenshot 2026-07-17 200234" src="https://github.com/user-attachments/assets/c9c128d4-57d7-4117-90ac-b4b3b857b503" />

<img width="1917" height="992" alt="Screenshot 2026-07-17 200308" src="https://github.com/user-attachments/assets/68a27e85-f8ef-474b-8c22-db24fc259d44" />

---
  
## EC2 instance running

<img width="1918" height="853" alt="Screenshot 2026-07-17 213145" src="https://github.com/user-attachments/assets/00f7b8cb-fd8a-49f2-9c76-cf66ed7d39e6" />

<img width="1235" height="312" alt="Screenshot 2026-07-17 213201" src="https://github.com/user-attachments/assets/8ecaf497-2c1c-4206-88df-86ee831c4be6" />

<img width="1241" height="242" alt="Screenshot 2026-07-17 213208" src="https://github.com/user-attachments/assets/b6562f67-b5ed-4273-ab69-e229cbe36bf7" />

<img width="736" height="705" alt="Screenshot 2026-07-17 213230" src="https://github.com/user-attachments/assets/be6e699a-a93f-41a3-b80e-afff393062dd" />

<img width="887" height="806" alt="Screenshot 2026-07-17 213447" src="https://github.com/user-attachments/assets/eb43b62f-f5c9-4caa-8733-01b56fd38208" />

<img width="873" height="492" alt="Screenshot 2026-07-17 213503" src="https://github.com/user-attachments/assets/d127f451-7adf-4718-a67a-c9a31df70ef2" />

<img width="1575" height="142" alt="Screenshot 2026-07-17 213605" src="https://github.com/user-attachments/assets/7d0246f6-2e98-45d3-9ee3-f99771af36b4" />

<img width="1575" height="197" alt="Screenshot 2026-07-17 213622" src="https://github.com/user-attachments/assets/1d42dd6d-9eac-4d8d-83f5-202122e2bc42" />

---

## SSH connection

<img width="1231" height="901" alt="Screenshot 2026-07-19 164015" src="https://github.com/user-attachments/assets/e7cff740-8689-4fa1-ba3b-17395662d07f" />

---
## Backend server running

<img width="1115" height="90" alt="Screenshot 2026-07-19 171640" src="https://github.com/user-attachments/assets/eecf5d04-4fc2-463f-aded-e1bcd431891a" />

---

## Frontend server running

<img width="1890" height="452" alt="Screenshot 2026-07-19 172157" src="https://github.com/user-attachments/assets/e8dc8c1a-c417-405d-911a-e364c491bc6f" />

---

## MongoDB Atlas cluster

<img width="1912" height="725" alt="Screenshot 2026-07-19 170923" src="https://github.com/user-attachments/assets/7aca2b54-f0ff-482e-8ff6-0bc279092193" />

---

## Stored database records

<img width="1918" height="605" alt="Screenshot 2026-07-19 172000" src="https://github.com/user-attachments/assets/b077fe28-5021-4854-994a-64b88ce6d17e" />

---

## Website hosted on EC2

<img width="1878" height="961" alt="Screenshot 2026-07-19 172013" src="https://github.com/user-attachments/assets/190a7055-0345-4bfe-9c18-5824a53564d4" />

<img width="1876" height="962" alt="Screenshot 2026-07-19 172023" src="https://github.com/user-attachments/assets/f9317530-525c-49d2-b332-fc0b5b879a37" />

<img width="1874" height="952" alt="Screenshot 2026-07-19 172032" src="https://github.com/user-attachments/assets/2752fb8a-1f0e-4eb0-8ae0-7a1caa3a7713" />

---

# Tech Stack

### Frontend

* React
* Vite
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Cloud

* Amazon EC2 (Ubuntu)

---

# Architecture

```text
Browser
     │
     ▼
React Frontend (EC2)
     │
REST API
     ▼
Node.js + Express (EC2)
     │
     ▼
MongoDB Atlas
```

---

# Deployment Steps

## 1. Launch an EC2 Instance

* Launch an Ubuntu EC2 instance.
* Create or use an existing key pair.
* Configure the Security Group.

Open the following ports:

| Port | Purpose                  |
| ---- | ------------------------ |
| 22   | SSH                      |
| 5000 | Backend API              |
| 5173 | React Development Server |

---

## 2. Connect to the Instance

```bash
ssh -i "<your-key>.pem" ubuntu@<EC2-Public-IP>
```

---

## 3. Update Ubuntu

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 4. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

sudo apt install nodejs -y
```

Verify installation:

```bash
node -v
npm -v
```

---

## 5. Clone the Repository

```bash
git clone https://github.com/sushantkumarkhobian-lab/AWS-Engineering-Lab.git

cd AWS-Engineering-Lab/EC2/Guestbook-Web-App
```

---

## 6. Install Dependencies

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd ../frontend
npm install --legacy-peer-deps
```

---

## 7. Configure MongoDB Atlas

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGODB_URI=<your-mongodb-atlas-connection-string>
```

Ensure your MongoDB Atlas cluster allows network access from the EC2 instance.

---

## 8. Start the Backend

```bash
cd backend

node server.js
```

Expected output:

```text
Successfully connected to MongoDB.
Server is running on port 5000.
```

---

## 9. Start the Frontend

Open another terminal.

```bash
cd frontend

npm run dev -- --host
```

---

## 10. Access the Application

Open:

```text
http://<EC2-Public-IP>:5173
```

Submit a message and verify that it is stored in MongoDB Atlas and displayed on the website.

---

# Learning Outcomes

Through this project, I gained practical experience with:

* Deploying applications on Amazon EC2
* Connecting to Linux servers using SSH
* Configuring AWS Security Groups
* Hosting React and Node.js applications
* Using MongoDB Atlas as a managed cloud database
* Managing environment variables
* Deploying a full-stack application to the cloud
* Understanding the interaction between frontend, backend, and database services

---

# Future Improvements

* Deploy the frontend using Nginx
* Use PM2 for backend process management
* Serve a production React build
* Configure a reverse proxy
* Add HTTPS using Let's Encrypt
* Automate deployment with GitHub Actions
* Add a custom domain using Amazon Route 53

