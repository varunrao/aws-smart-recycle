#!/usr/bin/env bash

if [ $# -ne 1 ]
then
    echo 'publish_test_message.sh <TOPIC_NAME>'
    echo '  <TOPIC_NAME> -   topic name'
    exit 1
fi

topic_name=$1

aws iot-data publish --topic $topic_name --payload '{ 
   "image" : "https://s3.amazonaws.com/recyclearm.masterbuilder.cloud/images/1542053744-dd13dd55ebc8a097f58337a5fbc7b298.jpg",
   "confidence" :10,
   "secondary_labels" : [],
   "item" : "box",
   "classification" : "unknown"
 }'

