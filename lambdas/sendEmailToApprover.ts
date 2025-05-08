import {sendEmailBySES} from './utils/sesHelper'

interface Event {
  approvalStatus?: string,
  leaveDetails?: Record<string, string>,
  leaveID?: string,
  userEmail?: string,
  approverEmail?: string,
  taskToken?: string,
  apiBaseUrl?: string
}

export const sendEmailToApproverHandler = async (event: Event) => {
  try {
    const { leaveID, userEmail, approverEmail, leaveDetails, taskToken, apiBaseUrl  } = event;
    if (!leaveID || !userEmail || !approverEmail || !leaveDetails || !taskToken || !apiBaseUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing parameters in the Event"
        }),
      };
    }
    // we send these two links to invoke another process approval lambda
    const approvalLink = `${apiBaseUrl}/process-approval?leaveID=${leaveID}&status=Approved&taskToken=${encodeURIComponent(taskToken)}`;
    const rejectionLink = `${apiBaseUrl}/process-approval?leaveID=${leaveID}&status=Rejected&taskToken=${encodeURIComponent(taskToken)}`;
    const emailParams = {
      Destination: { ToAddresses: [approverEmail] },
      Message: {
        Body: {
          Html: {
            Data :`
            <h4>Leave Approval Request from ${userEmail}</h3>
            <h5>Details of leave request ${leaveID}</h5>
            <p>Leave Type - ${leaveDetails.leaveType}</p>
            <p>Start Date - ${leaveDetails.startDate}</p>
            <p>End Date - ${leaveDetails.endDate}</p>
            <p>Reason for the leave is ${leaveDetails.reason}</p>
            <p>Click any one of the below approve or reject the leave Request.</p>
            <a href=${approvalLink} target="_blank" style=
              "background-color: #2f855a;
              color: white;
              padding: 14px 25px;
              text-align: center;
              text-decoration: none;
              display: inline-block;">Approve</a>
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
        Subject: { Data: `Leave Request ${leaveID} has been sent from the ${userEmail}` },
      },
      Source: "jangamchenchugokul@gmail.com"
    };
    // sends the mail to approver
    await sendEmailBySES(emailParams);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Message sent to Approver"
      }),
    };
  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send email"
      }),
    };
  }
};
