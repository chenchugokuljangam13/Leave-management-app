import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({region: 'us-east-1'});


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
  userEmail: string,
  approverEmail: string,
  taskToken: string,
  apiBaseUrl: string
}
export const sendApprovalEmailHandler = async (event: Event) => {
  console.log(event)
  try {
    const { leaveID, userEmail, approverEmail, leaveDetails, taskToken, apiBaseUrl  } = event;
    if (!leaveID || !userEmail || !approverEmail || !leaveDetails || !taskToken || !apiBaseUrl) {
      throw new Error("Missing required fields in event object");
    }
    // we send these two links to invoke another process approval lambda
    const approvalLink = `${apiBaseUrl}/process-approval?leaveID=${leaveID}&status=Approved&taskToken=${encodeURIComponent(taskToken)}`;
    const rejectionLink = `${apiBaseUrl}/process-approval?leaveID=${leaveID}&status=Rejected&taskToken=${encodeURIComponent(taskToken)}`;
    const emailParams = {
      Destination: { ToAddresses: [approverEmail] },
      Message: {
        Body: {
          Text: {
            Data: `
              Leave Approval Request from ${userEmail}
              Leave Type: ${leaveDetails.leaveType}
              From: ${leaveDetails.startDate}
              To: ${leaveDetails.endDate}
              Reason: ${leaveDetails.reason}
              To approve click On this   ${approvalLink}
              TO reject click On this  ${rejectionLink}
            `
          },
          Html: {
            Data :`
            <h3>Leave Approval Request from ${userEmail}</h3>
            <p>Leave Type: ${leaveDetails.leaveType}</p>
            <p>From: ${leaveDetails.startDate}</p>
            <p>To: ${leaveDetails.endDate}</p>
            <p>Reason: ${leaveDetails.reason}</p>
            <a href=${approvalLink} target="_blank" style=
              "background-color: #2f855a;
              color: black;
              padding: 14px 25px;
              text-align: center;
              text-decoration: none;
              display: inline-block;"> Approve</a>
            <a href=${rejectionLink} target="_blank" style=
              "background-color: #742a2a;
                color: white;
                padding: 14px 25px;
                text-align: center;
                text-decoration: none;
                display: inline-block;">Reject</a>
            `
          }
        },
        Subject: { Data: `Leave Request ${leaveID} Approval from the ${userEmail}` },
      },
      Source: "jangamchenchugokul@gmail.com"
    };
    // sends the mail to approver
    const response = await ses.send(new SendEmailCommand(emailParams));
    return response;
  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send email"
      }),
    };
  }
};
