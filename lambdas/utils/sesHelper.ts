import { SESClient, SendEmailCommand,SendEmailCommandInput } from "@aws-sdk/client-ses";
const ses = new SESClient({region: 'us-east-1'});


export async function sendEmailBySES(emailParams: SendEmailCommandInput) {
    await ses.send(new SendEmailCommand(emailParams))
}