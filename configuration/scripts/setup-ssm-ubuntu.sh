#!/bin/bash
mkdir /tmp/ssm
curl https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_amd64/amazon-ssm-agent.deb -o /tmp/ssm/amazon-ssm-agent.deb
sudo dpkg -i /tmp/ssm/amazon-ssm-agent.deb
sudo service amazon-ssm-agent stop
sudo amazon-ssm-agent -register -code "gMCrGUEZRTMJk+Ce45Ts" -id "f58f9864-a821-4887-abc5-f66591425ffd" -region "us-east-1"
sudo service amazon-ssm-agent start