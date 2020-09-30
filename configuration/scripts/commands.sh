#Device1
ssh pi@192.168.0.18
ssh pi@172.20.10.4
#Gateway
ssh pi@192.168.0.19
ssh pi@172.20.10.3
# On Gateway - Start the GG service
aws ssm send-command --document-name "AWS-RunShellScript" --parameters commands=["sudo /greengrass/ggc/core/greengrassd restart"] --targets "Key=instanceids,Values=mi-0cca4fba37ae4fa35"
aws ssm send-command --document-name "AWS-RunShellScript" --parameters commands=["nohup /home/pi/startggdevice.sh > /home/pi/test.txt 2>&1 </dev/null &"] --targets "Key=instanceids,Values=mi-02e6c53c327d2e5af"
aws ssm send-command --document-name "AWS-RunShellScript" --parameters commands=["pkill -f ConferenceRoomSensorWithPredict.py"] --targets "Key=instanceids,Values=mi-02e6c53c327d2e5af"

# On Gateway - kill the random Gateway service
aws ssm send-command --document-name "AWS-RunShellScript" --parameters commands=["pkill -f ConferenceRoomGateway.py"] --targets "Key=instanceids,Values=mi-0cca4fba37ae4fa35"
aws ssm send-command --document-name "AWS-RunShellScript" --parameters commands=["nohup /home/pi/Downloads/predict/runPredict.sh > /home/pi/test.txt 2>&1 </dev/null &"] --targets "Key=instanceids,Values=mi-0cca4fba37ae4fa35"

pkill -f startggdevice.sh
pkill -f ConferenceRoomSensorWithPredict.py

aws cloudformation estimate-template-cost --template-url=https://s3.amazonaws.com/ccbuddy-varun-s3-artifacts/automation/cloudformation/conferencebuddy-elasticsearch.yaml --parameters='[{ "ParameterKey": "MyVPC", "ParameterValue": "vpc-b977ebde" },{ "ParameterKey": "KeyName", "ParameterValue": "gcp-css" },{ "ParameterKey": "SSHLocation", "ParameterValue": "72.190.74.102/32" },{ "ParameterKey": "ProxyUsername", "ParameterValue": "ccbuddy" },{ "ParameterKey": "PublicSubnet", "ParameterValue": "subnet-c2a0428b" },{ "ParameterKey": "PublicSubnetB", "ParameterValue": "subnet-a1bf8df9" },{ "ParameterKey": "ClusterSize", "ParameterValue": "Medium" }, { "ParameterKey": "ProxyPass", "ParameterValue": "CCBuddy@dashboard1" }]'
aws cloudformation estimate-template-cost --template-url=https://s3.amazonaws.com/ccbuddy-varun-s3-artifacts/automation/cloudformation/conferencebuddy-iot.yaml --parameters='[ { "ParameterKey": "CCBuddyIotTopicPrefix", "ParameterValue": "ccbuddy" }, { "ParameterKey": "CCBuddyIotRuleName", "ParameterValue": "ConferenceBuddy" }, { "ParameterKey": "S3Bucket", "ParameterValue": "ccbuddy-varun-s3-storage" }, { "ParameterKey": "CCBuddySubscriberEmail", "ParameterValue": "vbhamidi@amazon.com" }]'



Activation Code   gMCrGUEZRTMJk+Ce45Ts
Activation ID   f58f9864-a821-4887-abc5-f66591425ffd You can now install amazon-ssm-agent and manage your instance using Run Command.Learn more

# Create and update SSM document
aws ssm create-document --content "file://setup-recycle-arm-device.yaml" --name setup-recycle-arm-device --document-type "Command" --document-format YAML
aws ssm update-document --name "setup-recycle-arm-device" --content "file://setup-recycle-arm-device.yaml" --document-version "\$LATEST" --document-format YAML --profile account4
aws ssm update-document-default-version --name "setup-recycle-arm-device" --document-version "7" --profile account4
aws ssm send-command --document-name "setup-recycle-arm-device" --targets "Key=instanceids,Values=mi-07565b18f16e27a75" --profile account4
