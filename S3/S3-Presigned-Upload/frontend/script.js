const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const status = document.querySelector(".status");
const urlDiv = document.querySelector(".url");

uploadBtn.addEventListener("click", async () => {

    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    status.innerHTML = "⚡ Step 1/3: Generating secure upload URL...";
    urlDiv.innerHTML = "";

    try {

        // Request presigned URL
        const response = await fetch("http://localhost:3000/generate-upload-url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type
            })
        });

        if (!response.ok) {
            throw new Error("Failed to generate upload URL.");
        }

        const data = await response.json();

        status.innerHTML = "☁️ Step 2/3: Uploading file to Amazon S3...";

        const startTime = performance.now();

        // Upload directly to S3
        const uploadResponse = await fetch(data.uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type": file.type
            },
            body: file
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed (${uploadResponse.status})`);
        }

        const endTime = performance.now();

        status.innerHTML = `
            <span style="color:#00ff88;font-size:22px;font-weight:bold;">
                ✅ Upload Successful
            </span>
            <br><br>
            📄 <strong>File:</strong> ${file.name}<br>
            📦 <strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB<br>
            ⏱ <strong>Upload Time:</strong> ${((endTime - startTime) / 1000).toFixed(2)} seconds
        `;

        urlDiv.innerHTML = `
            <br>
            <strong>Amazon S3 Storage</strong>
            <br><br>
            🪣 Bucket: sushant-presigned-upload<br>
            📂 Object: ${file.name}<br>
            🌎 Region: us-east-1
            <br><br>
            <small>
                File uploaded securely using a Presigned URL.
                Objects are private by default.
            </small>
        `;

    } catch (err) {

        status.innerHTML = `
            <span style="color:red;font-weight:bold;">
                ❌ ${err.message}
            </span>
        `;

    }

});