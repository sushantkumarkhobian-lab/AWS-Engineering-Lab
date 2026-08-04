require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Create S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Home Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Generate Presigned URL
app.post("/generate-upload-url", async (req, res) => {
    try {
        const { filename, contentType } = req.body;

        if (!filename || !contentType) {
            return res.status(400).json({
                error: "filename and contentType are required",
            });
        }

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filename,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300, // URL valid for 5 minutes
        });

        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

        res.json({
            uploadUrl,
            fileUrl,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to generate presigned URL",
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});