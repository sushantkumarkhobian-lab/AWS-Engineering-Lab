# AWS IoT Core EC2 Device Simulator

## Overview

This project demonstrates how an Amazon EC2 Ubuntu instance can simulate an IoT edge device and securely communicate with AWS IoT Core using MQTT over TLS and X.509 certificate authentication.

Instead of using a physical Raspberry Pi or ESP32, the EC2 instance continuously generates simulated temperature and humidity readings and publishes them to AWS IoT Core. The published messages can be monitored in real time using the AWS IoT MQTT Test Client.

This project demonstrates secure IoT communication, MQTT messaging, certificate-based authentication, and cloud-based device simulation using AWS services.

---

# Features

- Simulated IoT device running on Amazon EC2
- Secure MQTT communication using TLS
- X.509 certificate authentication
- Random temperature and humidity simulation
- Real-time monitoring using AWS IoT MQTT Test Client
- Python AWS IoT Device SDK v2

---

# Screenshots

## AWS IoT Thing

The registered IoT Thing configured for secure MQTT communication.

<img width="1908" height="512" alt="Screenshot 2026-07-21 190153" src="https://github.com/user-attachments/assets/d593f439-4d5e-48ac-8f1a-eeb13045236f" />

---

## EC2 Publisher Running

The EC2 Ubuntu instance publishing simulated temperature and humidity readings to AWS IoT Core.

<img width="686" height="692" alt="Screenshot 2026-07-21 095441" src="https://github.com/user-attachments/assets/f61731b3-2286-4a2a-8789-eeba6a5cf880" />

---

## MQTT Test Client

AWS IoT Core receiving telemetry published from the EC2 instance after subscribing to the `sensor/data` topic.

<img width="1881" height="795" alt="Screenshot 2026-07-21 095602" src="https://github.com/user-attachments/assets/47a92029-6a46-4c59-93a6-e7eb3589614c" />

---

# Tech Stack

## Cloud

- Amazon EC2
- AWS IoT Core

## Language

- Python

## Protocols

- MQTT
- TLS

## SDK

- AWS IoT Device SDK v2

---

# Architecture

```
        Simulated Sensor Data
                 │
                 ▼
      Python Publisher (EC2 Ubuntu)
                 │
          MQTT over TLS
                 │
                 ▼
            AWS IoT Core
                 │
                 ▼
       MQTT Test Client
```

---

# Prerequisites

- AWS Account
- Ubuntu EC2 Instance
- AWS IoT Core
- SSH Key Pair

---

# Step 1 — Launch an EC2 Instance

Launch an Ubuntu EC2 instance.

Open the following port in the Security Group.

| Port | Purpose |
|------|----------|
|22|SSH|

To connect to the instance, refer to the SSH connection steps in:

```
EC2/Guestbook-Web-App
```

---

# Step 2 — Update Ubuntu

```bash
sudo apt update
sudo apt upgrade -y
```

---

# Step 3 — Install Python

Check if Python is already installed.

```bash
python3 --version
```

Install Python, pip and virtual environment support.

```bash
sudo apt install python3 python3-pip python3-venv -y
```

Verify installation.

```bash
python3 --version

pip3 --version
```

---

# Step 4 — Create a Virtual Environment

```bash
python3 -m venv iot-env
```

Activate it.

```bash
source iot-env/bin/activate
```

You should now see

```
(iot-env)
```

---

# Step 5 — Install AWS IoT SDK

```bash
pip install awsiotsdk
```

Verify installation.

```bash
python3 -c "from awscrt import io, mqtt; print('AWS IoT SDK Installed Successfully')"
```

Expected Output

```
AWS IoT SDK Installed Successfully
```

---

# Step 6 — Create an IoT Thing

Navigate to

```
AWS IoT Core

Manage

    All Devices

        Things
```

Create a new Thing.

Example

```
EC2Simulator
```

---

# Step 7 — Generate Device Certificates

Select

```
Auto-generate a new certificate
```

Download

```
AmazonRootCA1.pem

device-certificate.pem.crt

private.pem.key

public.pem.key
```

Activate the certificate before continuing.

---

# Step 8 — Create and Attach an IoT Policy

Create a policy.

Example

```json
{
    "Version":"2012-10-17",
    "Statement":[
        {
            "Effect":"Allow",
            "Action":"iot:*",
            "Resource":"*"
        }
    ]
}
```

Attach the policy to the generated certificate.

---

# Step 9 — Obtain the AWS IoT Endpoint

Navigate to

```
AWS IoT Core

Connect

    Domain Configurations
```

Open the default domain configuration.

Copy the

```
Device Data Endpoint
```

Example

```
xxxxxxxxxxxxx-ats.iot.us-east-1.amazonaws.com
```

---

# Step 10 — Copy Certificates to EC2

Rename the downloaded certificate files for simplicity.

```
AmazonRootCA1.pem

device-certificate.pem.crt

private.pem.key

public.pem.key
```

Copy the required files to the EC2 instance.

```powershell
scp -i aws-rpi.pem AmazonRootCA1.pem device-certificate.pem.crt private.pem.key ubuntu@<EC2_PUBLIC_IP>:~
```

Verify.

```bash
ls
```

Expected Output

```
AmazonRootCA1.pem

device-certificate.pem.crt

private.pem.key

public.pem.key
```

---

# Step 11 — Configure publisher.py

Open

```bash
nano publisher.py
```

Update the following values.

```python
ENDPOINT = "<YOUR_DEVICE_DATA_ENDPOINT>"

CLIENT_ID = "EC2Simulator"

PATH_TO_CERT = "device-certificate.pem.crt"

PATH_TO_KEY = "private.pem.key"

PATH_TO_ROOT = "AmazonRootCA1.pem"

TOPIC = "sensor/data"
```

Save the file.

```
CTRL + O

ENTER

CTRL + X
```

---

# Step 12 — Run the Publisher

Activate the virtual environment.

```bash
source iot-env/bin/activate
```

Run.

```bash
python3 publisher.py
```

Expected Output

```
Connecting...
Connected!

{'temperature': 27.31, 'humidity': 62.80}

{'temperature': 25.62, 'humidity': 58.41}

{'temperature': 24.93, 'humidity': 60.17}

...
```

---

# Step 13 — Monitor Messages

Navigate to

```
AWS IoT Core

Test

    MQTT Test Client
```

Subscribe to

```
sensor/data
```

Incoming messages

```json
{
    "temperature": 27.31,
    "humidity": 62.80
}
```

---

# Repository Structure

```
AWS-Engineering-Lab/

└── EC2/
    └── AWS-IoT-Core-EC2-Simulator/
            ├── publisher.py
            └── README.md
```

---

# Learning Outcomes

Through this project, I gained practical experience with:

- Simulating IoT devices using Amazon EC2
- AWS IoT Core
- MQTT messaging
- MQTT over TLS
- X.509 certificate authentication
- Python AWS IoT Device SDK v2
- Secure device-to-cloud communication
- Cloud-based IoT experimentation without physical hardware

---

# Future Improvements

- Replace simulated data with a Raspberry Pi
- Replace simulated data with an ESP32
- Use AWS IoT Rules
- Store telemetry in DynamoDB
- Trigger AWS Lambda functions
- Build a real-time monitoring dashboard
- Simulate multiple IoT devices from multiple EC2 instances

---

# References

For EC2 provisioning, SSH connection, and Ubuntu instance setup, refer to:

```
EC2/Guestbook-Web-App
```

This project focuses specifically on integrating an EC2-hosted simulated IoT device with AWS IoT Core using secure MQTT communication.
