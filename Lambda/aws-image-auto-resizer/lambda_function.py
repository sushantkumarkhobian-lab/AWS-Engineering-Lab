import os
import boto3
from PIL import Image

s3 = boto3.client("s3")

OUTPUT_BUCKET = "image-auto-resizer-output"


def lambda_handler(event, context):
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = event["Records"][0]["s3"]["object"]["key"]

    input_path = f"/tmp/{os.path.basename(key)}"
    output_path = f"/tmp/resized_{os.path.basename(key)}"

    # Download uploaded image
    s3.download_file(bucket, key, input_path)

    # Resize
    image = Image.open(input_path)
    image = image.resize((300, 300))
    image.save(output_path)

    # Upload resized image
    s3.upload_file(
        output_path,
        OUTPUT_BUCKET,
        f"resized_{key}"
    )

    return {
        "statusCode": 200,
        "body": "Image resized successfully"
    }