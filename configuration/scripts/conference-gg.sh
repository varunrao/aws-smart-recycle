#!/usr/bin/env bash
#aws greengrass create-group --name "ConferenceBuddy"
#aws greengrass create-core-definition --name "ConferenceBuddy_Core"
#python ConferenceRoomSensor.py -e a2pyp93au31ehd.iot.us-east-1.amazonaws.com -r root-ca-cert.pem -c certificate.pem.crt -k private.pem.key -t ccbuddy --clientId ConferenceBuddy_Room1 --connect-to greengrass
python ConferenceRoomSensorWithPredict.py -e a2pyp93au31ehd.iot.us-east-1.amazonaws.com -r root-ca-cert.pem -c certificate.pem.crt -k private.pem.key -t ccbuddy --clientId ConferenceBuddy_Room1 --connect-to greengrass --conf config.json