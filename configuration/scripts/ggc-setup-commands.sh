#!/usr/bin/env bash
set -euo pipefail
set -x
rm -rf /home/pi/IOT
cd /home/pi/IOT
aws s3 cp s3://masterbuilder-iot-varun/Greengrass/Core/ . --recursive
/greengrass/ggc/packages/1.1.0/greengrassd stop
rm -rf /greengrass
cd /home/pi/IOT/GG
tar -xvf greengrass-linux-armv7l-1.1.0.tar.gz -C /
cp certificate.pem.crt root-ca-cert.pem private.pem.key /greengrass/certs/
cp config.json /greengrass/config/
/greengrass/ggc/packages/1.1.0/greengrassd start
tail -f /greengrass/ggc/var/log/system/localwatch/localwatch.log *.log
tail -f /greengrass/ggc/var/log/user/us-east-1/762525141659/ConferenceBuddy.log