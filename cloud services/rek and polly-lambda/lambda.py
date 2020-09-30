from __future__ import print_function
import boto3
from decimal import Decimal
import time
import json
import urllib

print('Loading function')

rekognition = boto3.client('rekognition')
s3 = boto3.resource('s3')
polly_client = boto3.client('polly')

# --------------- Helper Functions to call Rekognition and Polly APIs ------------------

def detect_labels(bucket, key, tag):
    response = rekognition.detect_labels(Image={"S3Object": {"Bucket": bucket, "Name": key}})

    labels = [label_prediction['Name'] for label_prediction in response['Labels']]
    confidences = [label_prediction['Confidence'] for label_prediction in response['Labels']]

    copy_source = {
        'Bucket': bucket,
        'Key': key
    }

    new_url = 'recyclearm.masterbuilder.cloud'
    new_bucket = s3.Bucket(new_url)
    local_time = str(int(time.time()))
    new_filename = str('images/' + local_time + '-' + tag + '.jpg')
    new_path = str('https://s3.amazonaws.com/' + str(new_url) + '/' + new_filename)

    obj = new_bucket.Object(new_filename)
    obj.copy(copy_source)

    polly_response = polly_client.start_speech_synthesis_task(VoiceId='Joanna',
                                                              OutputS3BucketName= new_url,
                                                              OutputS3KeyPrefix= 'audio/' + local_time + '-' + tag,
                                                              OutputFormat='mp3',
                                                              TextType= 'ssml',
                                                              Text = '<speak>' + labels[0] + '<break time="1s"/>' + labels[1] + '</speak>')

    polly_path = str(polly_response['SynthesisTask']['OutputUri'])

    table = boto3.resource('dynamodb').Table('trashnet')
    labels_ddb = [{'Confidence': Decimal(str(label_prediction['Confidence'])), 'Name': label_prediction['Name']} for label_prediction in response['Labels']]
    table.put_item(Item={'image': new_path, 'image_labels': labels_ddb, 'timestamp': int(local_time), 'audio': polly_path})

    # Kinesis output for ES
    #


    top_items = '{"Item":{"image":"' + new_path + '", "image_labels":[{"Confidence":"' + str(confidences[0]) + '", "Name":"' + str(labels[0]) + '"},{"Confidence":"' + str(confidences[1]) + '", "Name":"' + str(labels[1]) + '"}], "timestamp":"' + local_time + '", "audio":"' + polly_path + '"}}'

    return top_items

# --------------- Main handler ------------------


def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    tag = event['Records'][0]['s3']['object']['eTag']
    key = urllib.unquote_plus(event['Records'][0]['s3']['object']['key'].encode('utf8'))
    try:

        # Calls rekognition DetectLabels API to detect labels in S3 object
        response = detect_labels(bucket, key, tag)

        # Print response to console.
        print(response)


    except Exception as e:
        print(e)
        print("Error processing object {} from bucket {}. ".format(key, bucket) +
              "Make sure your object and bucket exist and your bucket is in the same region as this function.")
        raise e
