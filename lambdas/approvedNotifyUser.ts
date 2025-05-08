import {ddbUpdateCommandHelper} from './utils/ddbHelpers'
import {sendEmailBySES} from './utils/sesHelper'

interface Event {
  approvalStatus?: string,
  leaveDetails?: Record<string, string>,
  leaveID?: string,
  userEmail?: string
}

export const notifyUserHandler = async (event: Event) => {
  const leaveID = event?.leaveID;
  const userEmail = event?.userEmail;
  const leaveDetails = event?.leaveDetails;
  const approvalStatus = event.approvalStatus;
  if (!leaveID || !userEmail || !leaveDetails || !approvalStatus) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing required input fields"
      }),
    };
  }
  try {
    const data = {
      TableName: process.env.TABLE_NAME!,
      Key: {
        leaveID: leaveID, // string value directly
      },
      UpdateExpression: "SET #s = :newStatus",
      ExpressionAttributeNames: {
        "#s": "status",
      },
      ExpressionAttributeValues: {
        ":newStatus": approvalStatus, // string value directly
      },
    };
    // changes the status of item in Db
    await ddbUpdateCommandHelper(data)
  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Data unable to send to DynamoDB'
      })
    }
  }
  const emailParams = {
    Destination: { ToAddresses: [userEmail] },
    Message: {
      Body: {
        Html: {
          Data: `
            <h4>Your Leave Request status has been changed to ${approvalStatus}</h4>
            <h5>Details of your leave request ${leaveID}</h5>
            <p>Leave Type - ${leaveDetails.leaveType}</p>
            <p>Start Date - ${leaveDetails.startDate}</p>
            <p>End Date - ${leaveDetails.endDate}</p>
            <p>Reason for the leave is ${leaveDetails.reason}</p>
          `
        }
      },
      Subject: { Data: `Status of your leave request` },
    },
    Source: "jangamchenchugokul@gmail.com"
  };
  try {
    // it will send an email to user
    await sendEmailBySES(emailParams);
    
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
