import React from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify, { Auth, PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
import awsconfig from './aws-exports';

import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Badge from 'react-bootstrap/Badge';
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRecycle } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
const receiverTopicName = "recycle/infer";
const publisherTopicName = "recycle/web-app/update"
const threshold = 20;

Amplify.configure(awsconfig);
Amplify.addPluggable(new AWSIoTProvider({
  aws_pubsub_region: 'us-west-2',
  aws_pubsub_endpoint: 'wss://a5ljpj8vm6f08-ats.iot.us-west-2.amazonaws.com/mqtt',
}));

Auth.currentCredentials().then((info) => {
  var credID = fetch('https://n43ve2gr6d.execute-api.us-west-2.amazonaws.com/prod/', {
    method: 'POST',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Origin': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Credentials': true,
      'Accept': 'application/json, text/plain, */*',
    },
    mode: "no-cors",
    body: JSON.stringify({ cognitoIdentityId: info.data.IdentityId }),
  })

  console.log(credID);

});

// USE THE BELOW TO TEST PUBLISHING
PubSub.subscribe(publisherTopicName).subscribe({
  next: data => console.log(data),
  error: error => console.error(error),
  close: () => console.log('Done')
});


class App extends React.Component {
  messages = [];

  collectMessages = (message) => {
    this.messages.unshift(message)
    this.setState({
      value: this.messages
    });
  };

  constructor(props) {
    super(props);
    console.log(props);
    PubSub.subscribe(receiverTopicName).subscribe({
      next: data => this.showMessage(data),
      error: error => console.error(error),
      close: () => console.log('Done')
    });
  }

  showMessage(data) {
    console.log(data["value"]["message"]);
    let message = this.sanityCheckTheMessage(data["value"])
    this.collectMessages(message);
  }

  sanityCheckTheMessage(message) {
    let iotMessage = message;
    if (!iotMessage.image) {
      iotMessage["image"] = "https://s3.amazonaws.com/recyclearm.masterbuilder.cloud/images/1542053744-dd13dd55ebc8a097f58337a5fbc7b298.jpg";
    }

    if (!iotMessage.item) {
      iotMessage["item"] = "no item";
    }

    if (!iotMessage.confidence) {
      iotMessage["confidence"] = -1;
    }

    if (!iotMessage.secondary_labels) {
      iotMessage["secondary_labels"] = [];
    }

    if (!iotMessage.classification) {
      iotMessage["classification"] = "no classification";
    }

    return iotMessage;
  }

  
  render() {
    var messageList = this.messages.map(function (messageFromDevice) {


      let operations = null;
      let classification = "secondary"
      if (messageFromDevice["classification"] === "recycle")
        classification = "success"
      if (messageFromDevice["classification"] === "trash")
        classification = "danger"
      if (messageFromDevice["confidence"] < threshold) {
        operations = (
          <tr>
            <td>Operation</td>
            <td>
              <ButtonToolbar className="operator-toolbar">
                <Button variant="outline-success" className="operators" onClick={() => {
                  const operator = 1;
                  PubSub.publish(publisherTopicName, { "operation": operator , "image" : messageFromDevice["image"] });
                  classification = "success";
                }}><FontAwesomeIcon icon={faRecycle} /></Button>
                <Button variant="outline-danger" className="operators" onClick={() => {
                  const operator = 0;
                  PubSub.publish(publisherTopicName, { "operation": operator , "image" : messageFromDevice["image"] });
                  classification = "danger";
                }}><FontAwesomeIcon icon={faTrash} /></Button>
                <Button variant="outline-secondary" className="operators" onClick={() => {
                  const operator = -1;
                  PubSub.publish(publisherTopicName, { "operation": operator , "image" : messageFromDevice["image"] });
                  classification = "secondary";
                }}><FontAwesomeIcon icon={faQuestionCircle} /></Button>
              </ButtonToolbar>
            </td>
          </tr>
        );

      }

      return (
        
          <Container className="App-card">
            <Row>
              <Col>
                <Card border={classification}>
                  <Card.Img src={messageFromDevice["image"]} />
                </Card>
              </Col>
              <Col>

                <Table striped bordered hover responsive="sm" >
                  <tbody>
                    <tr>
                      <td>Item</td>
                      <td><Badge variant="primary">{messageFromDevice["item"]}</Badge></td>
                    </tr>
                    <tr>
                      <td>Classification</td>
                      <td><Badge variant="primary">{messageFromDevice["classification"]}</Badge></td>
                    </tr>
                    <tr>
                      <td>Confidence</td>
                      <td><Badge variant="primary">{messageFromDevice["confidence"]}</Badge></td>
                    </tr>
                    <tr>
                      <td>Other labels</td>
                      <td>labels</td>
                    </tr>
                    {operations}
                  </tbody>
                </Table>


              </Col>
            </Row>
          </Container>
       

      );
    });

    return (<div className="App">
    <h1>SMART RECYCLE</h1>
    <p>Receiving Messages Now ...</p><div> {messageList} </div> </div>);

  }
}

export default withAuthenticator(App, true);




// { 
//    "image" : "https://cdn.pixabay.com/photo/2014/03/24/13/42/recycling-294079__340.png",
//    "confidence" :51,
//    "secondary_labels" : [],
//    "label" : "",
//    "message" : "hello 1234"
//  }