import json
import random
import time
from awscrt import io, mqtt
from awsiot import mqtt_connection_builder

ENDPOINT = "<YOUR_DEVICE_DATA_ENDPOINT>"

CLIENT_ID = "EC2Simulator"

PATH_TO_CERT = "device-certificate.pem.crt"

PATH_TO_KEY = "private.pem.key"

PATH_TO_ROOT = "AmazonRootCA1.pem"

TOPIC = "sensor/data"

event_loop_group = io.EventLoopGroup(1)
host_resolver = io.DefaultHostResolver(event_loop_group)
client_bootstrap = io.ClientBootstrap(event_loop_group, host_resolver)

mqtt_connection = mqtt_connection_builder.mtls_from_path(
    endpoint=ENDPOINT,
    cert_filepath=PATH_TO_CERT,
    pri_key_filepath=PATH_TO_KEY,
    client_bootstrap=client_bootstrap,
    ca_filepath=PATH_TO_ROOT,
    client_id=CLIENT_ID,
    clean_session=False,
    keep_alive_secs=30,
)

print("Connecting...")
mqtt_connection.connect().result()
print("Connected!")

while True:
    payload = {
        "temperature": round(random.uniform(20, 35), 2),
        "humidity": round(random.uniform(40, 80), 2)
    }

    mqtt_connection.publish(
        topic=TOPIC,
        payload=json.dumps(payload),
        qos=mqtt.QoS.AT_LEAST_ONCE,
    )

    print(payload)
    time.sleep(5)
