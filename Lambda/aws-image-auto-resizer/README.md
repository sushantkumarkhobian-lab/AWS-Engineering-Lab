# AWS Image Auto Resizer

## Overview

AWS Image Auto Resizer is a serverless image processing application that automatically resizes images uploaded to an Amazon S3 bucket. Whenever a new image is uploaded, an Amazon S3 event triggers an AWS Lambda function, which processes the image using the Pillow library and stores the resized version in a separate S3 bucket.

This project demonstrates event-driven cloud architecture using AWS managed services without requiring any server management.

---

## Screenshots

### Lambda Function Overview

> Insert screenshot showing the Lambda function overview and S3 trigger.

---

### S3 Upload Bucket

> Insert screenshot showing the original uploaded image.

---

### Lambda Layer

> Insert screenshot showing the attached Pillow Lambda Layer.

---

### S3 Output Bucket

> Insert screenshot showing the resized image.

---

### CloudWatch Logs

> Insert screenshot showing a successful Lambda execution.

---

## Features

* Automatic image resizing using AWS Lambda
* Event-driven architecture with Amazon S3 Event Notifications
* Image processing using Pillow
* Serverless deployment
* CloudWatch logging for monitoring and debugging
* IAM Role-based secure access
* Lambda Layer for dependency management
* Lightweight deployment package

---

## Architecture

```text
                Upload Image
                      │
                      ▼
           Amazon S3 Upload Bucket
                      │
         ObjectCreated Event Notification
                      │
                      ▼
               AWS Lambda Function
          (Python 3.12 + Pillow Layer)
                      │
      Download → Resize → Upload
                      │
                      ▼
          Amazon S3 Output Bucket
```

---

## AWS Services Used

| Service         | Purpose                                          |
| --------------- | ------------------------------------------------ |
| AWS Lambda      | Executes the image resizing function             |
| Amazon S3       | Stores original and resized images               |
| IAM             | Grants Lambda permission to access AWS resources |
| CloudWatch Logs | Monitors execution and logs                      |
| Lambda Layers   | Provides the Pillow dependency                   |

---

## Tech Stack

* Python 3.12
* AWS Lambda
* Amazon S3
* AWS IAM
* Amazon CloudWatch
* Pillow (PIL)

---

## Project Structure

```text
aws-image-auto-resizer/
│
├── lambda_function.py
├── requirements.txt
├── README.md
├── .gitignore

```

---

## Workflow

1. User uploads an image to the S3 Upload Bucket.
2. Amazon S3 generates an **ObjectCreated** event.
3. The event automatically invokes the AWS Lambda function.
4. Lambda downloads the uploaded image into its temporary storage (`/tmp`).
5. Pillow resizes the image to **300 × 300 pixels**.
6. The resized image is saved temporarily.
7. Lambda uploads the processed image to the S3 Output Bucket.
8. Execution logs are recorded in Amazon CloudWatch.

---

## Prerequisites

Before deploying this project, ensure you have:

* AWS Account
* AWS Lambda
* Amazon S3
* IAM Permissions
* Python 3.12
* Pillow
* Visual Studio Code (recommended)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/aws-image-auto-resizer.git
cd aws-image-auto-resizer
```

---

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

Activate the environment.

Windows

```bash
.venv\Scripts\activate
```

Linux/macOS

```bash
source .venv/bin/activate
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Create Amazon S3 Buckets

Create two buckets.

**Upload Bucket**

```
image-auto-resizer-upload
```

**Output Bucket**

```
image-auto-resizer-output
```

---

### 5. Create the Lambda Function

Configuration

* Runtime: Python 3.12
* Architecture: x86_64
* Trigger: Amazon S3 ObjectCreated Event

---

### 6. Configure IAM

Attach the following permissions to the Lambda execution role:

* AmazonS3FullAccess *(for learning purposes)*
* AWSLambdaBasicExecutionRole

---

### 7. Configure Lambda Layer

Attach the Pillow Lambda Layer compatible with Python 3.12.

---

### 8. Deploy

Upload the Lambda deployment package containing:

```
lambda_function.py
```

The Pillow dependency is supplied through the Lambda Layer.

---

### 9. Test

Upload an image such as:

```
cat.jpg
```

Expected output:

```
resized_cat.jpg
```

appears in the output bucket.

---

## Example Flow

```text
cat.jpg

        │

        ▼

Amazon S3 Upload Bucket

        │

ObjectCreated Event

        │

        ▼

AWS Lambda

        │

Resize to 300 × 300

        │

        ▼

Amazon S3 Output Bucket

        │

        ▼

resized_cat.jpg
```

---

## Logging

Amazon CloudWatch automatically records:

* Lambda invocation
* Image download
* Image processing
* Upload completion
* Errors (if any)

---

## Error Handling

The project is designed to handle common scenarios such as:

* Invalid file uploads
* Missing objects
* Permission errors
* Upload failures
* Corrupted image files

---

## Future Improvements

* Preserve image aspect ratio
* Support additional image formats
* Generate multiple thumbnail sizes
* Read resize dimensions from Lambda environment variables
* Store resized images in organized folders
* Add AWS SAM deployment
* Use least-privilege IAM policies
* Integrate Amazon SNS notifications
* Add automated unit tests

---

## Learning Outcomes

This project demonstrates practical experience with:

* Serverless Computing
* Event-Driven Architecture
* AWS Lambda
* Amazon S3
* IAM Roles and Policies
* Lambda Layers
* CloudWatch Monitoring
* Python Image Processing
* Cloud Application Deployment

---

## Author

**Sushant Kumar Khobian**

Computer Science & Engineering (IoT, Blockchain & Cyber Security)

Feel free to connect, raise issues, or contribute to further improvements.
