#!/bin/bash
set -euo pipefail
set -x
# Define variables
#sudo apt-get update
#sudo apt-get -y upgrade
sudo adduser --system ggc_user
sudo addgroup --system ggc_group
sudo apt-get -y install rpi-update
sudo rpi-update
echo "deb http://ftp.debian.org/debian jessie-backports main" | sudo tee --append /etc/apt/sources.list.d/raspi.list;
sudo apt-get -y update
sudo apt-get -y -t jessie-backports install libssl-dev --force-yes
sudo apt-get -y install sqlite3
echo "fs.protected_hardlinks = 1" | sudo tee --append /etc/sysctl.d/98-rpi.conf;
echo "fs.protected_symlinks = 1" | sudo tee --append /etc/sysctl.d/98-rpi.conf;
echo "cgroup /sys/fs/cgroup cgroup defaults 0 0" | sudo tee --append /etc/fstab;
sudo apt-get -y install sense-hat
sudo pip install awscli
sudo pip install AWSIoTPythonSDK
# Add memory subsystem
# cgroup_memory=1 to /boot/cmdline.txt
sudo apt-get -y install --reinstall raspberrypi-bootloader raspberrypi-kernel
sudo reboot
