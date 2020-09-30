//Copyright 200<em>X</em>-200<em>X</em> Amazon.com, Inc. or its affiliates.  All Rights Reserved.  Licensed under the
//Amazon Software License (the "License").  You may not use this file except in compliance with the License. A copy of the
//License is located at http://aws.amazon.com/asl or in the "license" file accompanying this file.  This file is distributed on an "AS
//IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific
//language governing permissions and limitations under the License.

// v1.1.2
var https = require('https');
var http = require('http');
var zlib = require('zlib');
var crypto = require('crypto');
var AWS = require('aws-sdk');
var util = require('util');
var AWS = require('aws-sdk');
// var httpRequest = require('request');

var endpoint = "";
//var weatherApiKey = 'fd3e317a23d1a4f9b0fae72f34abab57';
var iot = new AWS.Iot();
const iotData = new AWS.IotData({endpoint: 'a5ljpj8vm6f08-ats.iot.us-east-1.amazonaws.com'});

exports.handler = function (input, context) {
    // decode input from base64
    console.log('Input :' + input);

    endpoint = process.env.ES_ENDPOINT

    input.Records.forEach((record) => {
        // Kinesis data is base64 encoded so decode here
        const payload = new Buffer(record.kinesis.data, 'base64').toString('utf-8');
        console.log(payload.replace(/u'/g, "'").replace(/'/g, "\""));
        var kinesisData = JSON.parse(payload.replace(/u'/g, "'").replace(/'/g, "\""));
        var params = {
            thingName: 'recycle-arm-deeplens' /* required */
        };
        var roomAttr = {'RoomNumber': 'N/A', 'Capacity' : 'N/A', 'Floor' : 'N/A'}
        iot.describeThing(params, function (err, data) {
            if (err)
                console.log(err, err.stack); // an error occurred
            else
                console.log(data.attributes.Name);
                loadDataIntoES(kinesisData)
                // transform the input to Elasticsearch documents
                var responseBody = '';
//                var options = {
//                    host: 'api.openweathermap.org',
//                    path: '/data/2.5/weather?q=dallas&units=imperial&appid=' + weatherApiKey,
//                    method: 'GET'
//                };
//                callback = function (response) {
//
//                    response.on('data', function (chunk) {
//                        responseBody += chunk;
//                    });
//
//                    response.on('end', function () {
//                        console.log(responseBody);
//                        var info = JSON.parse(responseBody);
//                        loadDataIntoES(info.main.temp, roomAttr, kinesisData)
//                    });
//
//                    response.on('error', function () {
//                        console.log(responseBody);
//                        var info = JSON.parse(responseBody);
//                        loadDataIntoES(-1, roomAttr, kinesisData)
//                    });
//                }

//                var req = http.request(options, callback).end();
        });

        
    });

};

function loadDataIntoES(kinesisData) {
    var elasticsearchBulkData = transform(kinesisData);
    // skip control messages
    if (!elasticsearchBulkData) {
        console.log('Received a control message');
        context.succeed('Control message handled successfully');
        return;
    }

    console.log('elasticsearchBulkData:', elasticsearchBulkData);

    // post documents to the Amazon Elasticsearch Service
    post(elasticsearchBulkData, function (error, success, statusCode, failedItems) {
        console.log('Response: ' + JSON.stringify({
            "statusCode": statusCode
        }));

        if (error) {
            console.log('postElasticSearchBulkData Error: ' + JSON.stringify(error, null, 2));

            if (failedItems && failedItems.length > 0) {
                console.log("Failed Items: " +
                    JSON.stringify(failedItems, null, 2));
            }
            context.fail(JSON.stringify(error));
        } else {
            console.log('Success: ' + JSON.stringify(success));
            context.succeed('Success');
        }
    });
}
function transform(event) {
    if (event.messageType === 'CONTROL_MESSAGE') {
        return null;
    }

    var bulkRequestBody = '';
    var timestamp = new Date();

    // index name format: cwl-YYYY.MM.DD
    var indexName = [
        'recyclearm-' + timestamp.getUTCFullYear(),              // year
        ('0' + (timestamp.getUTCMonth() + 1)).slice(-2),  // month
        ('0' + timestamp.getUTCDate()).slice(-2)          // day
    ].join('.');

    var source = {}
    source['item1'] = event.item1;
    source['timestamp'] = new Date().toISOString();
    source['item1probability'] = event.item1probability;

    var action = { "index": {} };
    action.index._index = indexName;
    action.index._type = event.device;

    bulkRequestBody += [
        JSON.stringify(action),
        JSON.stringify(source),
    ].join('\n') + '\n';

    // var params = {
    //     "topic" : "ccbuddyenriched/"+event.device,
    //     "payload" : JSON.stringify(source)
    // };

    // iotData.publish(params, function(err, data) {
    //     if (err) 
    //         console.log(err.stack, data);
    //     else
    //         console.log("Sent data to the new topic");
    // });

    return bulkRequestBody;
}


function post(body, callback) {
    console.log('endpoint:', endpoint);
    var requestParams = buildRequest(endpoint, body);
    console.log('requestParams:', requestParams);
    var request = https.request(requestParams, function (response) {
        var responseBody = '';
        response.on('data', function (chunk) {
            responseBody += chunk;
        });
        response.on('end', function () {
            var info = JSON.parse(responseBody);
            var failedItems;
            var success;

            console.log('post info:', info);

            if (response.statusCode >= 200 && response.statusCode < 299) {
                failedItems = info.items.filter(function (x) {
                    console.log('info items', x.index);
                    // return x.index.status >= 300;
                });

                success = {
                    "attemptedItems": info.items.length,
                    "successfulItems": info.items.length - failedItems.length,
                    "failedItems": failedItems.length
                };
            }

            var error = response.statusCode !== 200 || info.errors === true ? {
                "statusCode": response.statusCode,
                "responseBody": responseBody
            } : null;

            console.log('post error:', error);

            callback(error, success, response.statusCode, failedItems);
        });
    }).on('error', function (e) {
        callback(e);
    });
    request.end(requestParams.body);
}

function buildRequest(endpoint, body) {
    var endpointParts = endpoint.match(/^([^\.]+)\.?([^\.]*)\.?([^\.]*)\.amazonaws\.com$/);
    var region = endpointParts[2];
    var service = endpointParts[3];
    var datetime = (new Date()).toISOString().replace(/[:\-]|\.\d{3}/g, '');
    var date = datetime.substr(0, 8);
    var kDate = hmac('AWS4' + process.env.AWS_SECRET_ACCESS_KEY, date);
    var kRegion = hmac(kDate, region);
    var kService = hmac(kRegion, service);
    var kSigning = hmac(kService, 'aws4_request');

    var request = {
        host: endpoint,
        method: 'POST',
        path: '/_bulk',
        body: body,
        headers: {
            'Content-Type': 'application/json',
            'Host': endpoint,
            'Content-Length': Buffer.byteLength(body),
            'X-Amz-Security-Token': process.env.AWS_SESSION_TOKEN,
            'X-Amz-Date': datetime
        }
    };

    var canonicalHeaders = Object.keys(request.headers)
        .sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; })
        .map(function (k) { return k.toLowerCase() + ':' + request.headers[k]; })
        .join('\n');

    var signedHeaders = Object.keys(request.headers)
        .map(function (k) { return k.toLowerCase(); })
        .sort()
        .join(';');

    var canonicalString = [
        request.method,
        request.path, '',
        canonicalHeaders, '',
        signedHeaders,
        hash(request.body, 'hex'),
    ].join('\n');

    var credentialString = [date, region, service, 'aws4_request'].join('/');

    var stringToSign = [
        'AWS4-HMAC-SHA256',
        datetime,
        credentialString,
        hash(canonicalString, 'hex')
    ].join('\n');

    request.headers.Authorization = [
        'AWS4-HMAC-SHA256 Credential=' + process.env.AWS_ACCESS_KEY_ID + '/' + credentialString,
        'SignedHeaders=' + signedHeaders,
        'Signature=' + hmac(kSigning, stringToSign, 'hex')
    ].join(', ');

    return request;
}

function hmac(key, str, encoding) {
    return crypto.createHmac('sha256', key).update(str, 'utf8').digest(encoding);
}

function hash(str, encoding) {
    return crypto.createHash('sha256').update(str, 'utf8').digest(encoding);
}
