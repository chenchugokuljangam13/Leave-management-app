import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

interface leaveDetails {
  leaveType: string,
  startDate: string,
  endDate: string,
  reason: string
}
interface Event {
  approvalStatus: string,
  leaveDetails: leaveDetails,
  leaveID: string,
  userEmail: string
}

const sesClient = new SESClient({});
const dynamo = new DynamoDBClient({});

export const notifyUserHandler = async (event: Event) => {
  console.log(event)
  const leaveID = event?.leaveID;
  const userEmail = event?.userEmail;
  const leaveDetails = event?.leaveDetails;
  const approvalStatus = event.approvalStatus;
  if (!leaveID || !userEmail || !leaveDetails || !approvalStatus) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required input fields" }),
    };
  }
  const data = {
    TableName: process.env.TABLE_NAME,
    Key: {
      leaveID: {S: leaveID}
    },
    UpdateExpression: "SET #s = :newStatus",
    ExpressionAttributeNames: {
      "#s": "status",
    }, 
    ExpressionAttributeValues: {
      ":newStatus": { S: `${approvalStatus}` },
    },
  }
  try {
    // changes the status of item in Db
    await dynamo.send(new UpdateItemCommand(data))
  } catch(error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Data unable to send to DynamoDB'})
    }
  }
  const emailParams = {
    Destination: { ToAddresses: [userEmail] },
    Message: {
      Body: {
        Text: {
          Data: `
            Your Leave Request status has been changed to ${approvalStatus}
            Details-
              Employee: ${userEmail}
              Leave Type: ${leaveDetails.leaveType}
              From: ${leaveDetails.startDate}
              To: ${leaveDetails.endDate}
              Reason: ${leaveDetails.reason}
          `
        }
      },
      Subject: { Data: `Status of your leave request ${leaveID}` },
    },
    Source: "jangamchenchugokul@gmail.com"
  };
  try {
    // it will send an email to user
    const response = await sesClient.send(new SendEmailCommand(emailParams));
    console.log(response)
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "user notified successfully"
      })
    }
  } catch(error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send mail to user"
      })
    }
  }
};
