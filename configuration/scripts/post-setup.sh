#!/bin/bash
set -euo pipefail
set -x
sudo apt-get install sense-hat
sudo apt-get install git
sudo pip install AWSIoTPythonSDK
sudo pip install urllib3
sudo reboot
