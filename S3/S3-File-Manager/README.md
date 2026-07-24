# S3 File Manager

## Overview

This project demonstrates how to build and integrate a full-stack cloud file management application using **Amazon S3**, **React**, **Node.js**, **Express**, and the **AWS SDK for JavaScript (v3)**.

The application enables users to upload, browse, download, and delete files through a simple web interface. The backend securely communicates with Amazon S3 using IAM credentials, allowing files to be stored and managed in cloud object storage.

The objective of this project is to understand how Amazon S3 can be integrated into a modern full-stack application while following secure authentication practices using **AWS Identity and Access Management (IAM)**.

---

# Features

* Upload files to Amazon S3
* List all uploaded files
* Download files from Amazon S3
* Delete files from Amazon S3
* Responsive React user interface
* Node.js & Express REST API
* Multer-based file upload handling
* AWS SDK for JavaScript (v3) integration
* IAM-based secure authentication
* Health check endpoint for backend verification

---

# Screenshots

---

## Application Interface

<img width="1917" height="966" alt="Screenshot 2026-07-24 211640" src="https://github.com/user-attachments/assets/e7424130-6911-4169-94ea-0107025f0bf0" />

---

## File Upload

<img width="817" height="557" alt="Screenshot 2026-07-24 211704" src="https://github.com/user-attachments/assets/82133565-caa1-48c4-ae1f-33e8caaed2dc" />

<img width="828" height="568" alt="Screenshot 2026-07-24 211712" src="https://github.com/user-attachments/assets/5c4bf748-8ff8-47e6-9471-e0335c731e4a" />

<img width="1917" height="925" alt="Screenshot 2026-07-24 211728" src="https://github.com/user-attachments/assets/8d09c52e-4ad1-4cf8-83ab-12d8382f97b4" />

---

## Uploaded Files in Amazon S3

<img width="1911" height="598" alt="Screenshot 2026-07-24 211737" src="https://github.com/user-attachments/assets/e1101458-da71-474f-9b89-23928f00231c" />

<img width="1906" height="616" alt="Screenshot 2026-07-24 211746" src="https://github.com/user-attachments/assets/f72fb889-a680-4ee4-a370-dc39c7e2e2b8" />

<img width="1917" height="362" alt="Screenshot 2026-07-24 211821" src="https://github.com/user-attachments/assets/76cd44c4-cc08-4a90-bc1f-58b237d1ff37" />

---

## Backend Server Running

<img width="1127" height="256" alt="Screenshot 2026-07-24 211333" src="https://github.com/user-attachments/assets/8fd60ea4-2bd2-4fe1-b19c-21c6b4c66d23" />

<img width="942" height="146" alt="Screenshot 2026-07-24 211840" src="https://github.com/user-attachments/assets/19416955-91d7-482b-a1ca-de3f91f659ee" />

---

## AWS Console

### Amazon S3 Bucket

<img width="1908" height="852" alt="Screenshot 2026-07-24 205612" src="https://github.com/user-attachments/assets/e5854346-8a08-4529-a635-46736229c0aa" />

### IAM User Configuration

<img width="1911" height="645" alt="Screenshot 2026-07-24 205815" src="https://github.com/user-attachments/assets/552a6369-d19b-4c99-9baf-caebde977251" />

<img width="1910" height="846" alt="Screenshot 2026-07-24 205858" src="https://github.com/user-attachments/assets/00380daf-c74d-45a1-87db-c370d5b30dd3" />

<img width="1897" height="849" alt="Screenshot 2026-07-24 205943" src="https://github.com/user-attachments/assets/de36c83b-ffc8-4b67-8daf-1c1b7462f517" />

<img width="1915" height="232" alt="Screenshot 2026-07-24 210004" src="https://github.com/user-attachments/assets/1d05faba-fd61-4c6f-ae74-76a8461d31e8" />

---

# Tech Stack

## Frontend

* React.js
* Vite
* CSS

## Backend

* Node.js
* Express.js
* Multer
* AWS SDK for JavaScript (v3)

## Cloud

* Amazon S3
* AWS Identity and Access Management (IAM)

---

# Architecture

```text
                User
                  │
                  ▼
        React Frontend (Vite)
                  │
          HTTP REST Requests
                  │
                  ▼
        Node.js + Express API
                  │
             AWS SDK v3
                  │
                  ▼
          Amazon S3 Bucket
```

---

# Project Structure

```text
S3/
├── backend
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
└── frontend
    ├── src
    │   ├── App.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package-lock.json
    ├── package.json
    └── vite.config.js
```

---

# API Endpoints

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| POST   | `/upload`        | Upload a file to Amazon S3   |
| GET    | `/files`         | Retrieve all uploaded files  |
| GET    | `/download/:key` | Download a selected file     |
| DELETE | `/files/:key`    | Delete a file from Amazon S3 |
| GET    | `/health`        | Backend health check         |

---

# Deployment Steps

## 1. Create an Amazon S3 Bucket

Create a new Amazon S3 bucket from the AWS Management Console.

Record the following information:

* Bucket Name
* AWS Region

---

## 2. Create an IAM User

Create an IAM user with programmatic access.

Assign the required Amazon S3 permissions and generate:

* Access Key ID
* Secret Access Key

---

## 3. Clone the Repository

```bash
git clone https://github.com/sushantkumarkhobian-lab/AWS-Engineering-Lab.git

cd AWS-Engineering-Lab/S3
```

---

## 4. Install Dependencies

### Backend

```bash
cd backend

npm install
```

### Frontend

```bash
cd ../frontend

npm install
```

---

## 5. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=3001

AWS_REGION=YOUR_REGION

AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID

AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY

S3_BUCKET_NAME=YOUR_BUCKET_NAME
```

---

## 6. Start the Backend

```bash
cd backend

node server.js
```

Expected output:

```text
Backend running at http://localhost:3001
```

---

## 7. Start the Frontend

```bash
cd frontend

npm run dev
```

---

## 8. Access the Application

Open:

```
http://localhost:5173
```

Upload a file and verify that it appears inside the configured Amazon S3 bucket. You can also browse, download, and delete uploaded files through the application.

---

# Learning Outcomes

Through this project, I gained practical experience with:

* Building a full-stack cloud application
* Integrating React with a Node.js REST API
* Processing multipart file uploads using Multer
* Uploading objects to Amazon S3
* Listing objects stored in Amazon S3
* Downloading objects from Amazon S3
* Deleting objects from Amazon S3
* Configuring AWS Identity and Access Management (IAM)
* Managing cloud credentials using environment variables
* Using the AWS SDK for JavaScript (v3)
* Implementing secure cloud storage workflows
* Designing RESTful APIs for cloud-based file management

---

# AWS Services Used

| Service                                  | Purpose                              |
| ---------------------------------------- | ------------------------------------ |
| Amazon S3                                | Cloud object storage                 |
| AWS Identity and Access Management (IAM) | Authentication and access management |

---

# Future Improvements

* Generate secure pre-signed URLs for downloads
* Support drag-and-drop uploads
* Upload multiple files simultaneously
* Display upload progress
* Preview supported file types
* Search uploaded files
* Organize files into folders
* Add user authentication and authorization
* Deploy the application on Amazon EC2
* Integrate Amazon CloudFront for content delivery
* Add object metadata and tagging support
