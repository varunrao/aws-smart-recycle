#!/usr/bin/env bash
set -euo pipefail
set -x
rm -rf /home/pi/IOT
mkdir -p /home/pi/IOT/Device/
cd /home/pi/IOT/Device/
aws s3 cp s3://reinvent2018-builder-fair-recycle-arm-us-east-1/greengrass/devices/device1/ . --recursive
tar -xvf ggd-setup.tar.gz
mv *.cert.pem device.cert.pem
mv *.private.key device.private.key