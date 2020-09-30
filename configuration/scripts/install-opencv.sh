#!/bin/bash
set -euo pipefail
set -x
# Define variables
sudo apt-get install build-essential cmake pkg-config
sudo apt-get install libjpeg8-dev libtiff4-dev libjasper-dev libpng12-dev
sudo apt-get -y install libgtk2.0-dev
sudo apt-get -y install libavcodec-dev libavformat-dev libswscale-dev libv4l-dev
sudo apt-get -y install libatlas-base-dev gfortran
sudo pip install virtualenv virtualenvwrapper
sudo rm -rf ~/.cache/pip
echo "export WORKON_HOME=$HOME/.virtualenvs" | sudo tee --append ~/.profile;
echo "source /usr/local/bin/virtualenvwrapper.sh" | sudo tee --append ~/.profile;
#mkvirtualenv cv
sudo apt-get -y install python2.7-dev
pip install numpy
cd ~
wget -O opencv.zip https://github.com/Itseez/opencv/archive/3.1.0.zip
unzip opencv.zip
wget -O opencv_contrib.zip https://github.com/Itseez/opencv_contrib/archive/3.1.0.zip
unzip opencv_contrib.zip
cd ~/opencv-3.1.0/
mkdir build
cd build
cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D INSTALL_PYTHON_EXAMPLES=ON \
    -D ENABLE_PRECOMPILED_HEADERS=OFF \
    -D OPENCV_EXTRA_MODULES_PATH=~/opencv_contrib-3.1.0/modules \
    -D BUILD_EXAMPLES=ON ..
make -j4
make clean
make
sudo make install
sudo ldconfig