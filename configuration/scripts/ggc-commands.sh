#!/usr/bin/env bash
set -euo pipefail
set -x
rm -rf /greengrass
rm -rf /home/pi/IOT
mkdir -p /home/pi/IOT/GG
chmod -R 777 /home/pi/IOT
cd /home/pi/IOT/GG
aws s3 cp s3://masterbuilder-iot-varun/Greengrass/Core/ . --recursive
#/greengrass/ggc/packages/1.1.0/greengrassd stop
rm -rf /greengrass
cd /home/pi/IOT
tar -xvf greengrass-linux-armv7l-1.1.0.tar.gz -C /
mv *-certificate.pem.crt certificate.pem.crt
mv *-private.pem.key private.pem.key
cp certificate.pem.crt root-ca-cert.pem private.pem.key /greengrass/certs/
cp config.json /greengrass/config/
/greengrass/ggc/packages/1.1.0/greengrassd start
#tail -f /greengrass/ggc/var/log/system/localwatch/localwatch.log *.log
tail -f /greengrass/ggc/var/log/system/runtime.log