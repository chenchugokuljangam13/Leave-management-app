import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb";
const dynamo = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamo);

export async function ddbPutCommandHelper(
    TableName: string,
    item: Record<string, string|number|boolean>){
    await docClient.send(new PutCommand({
        TableName,
        Item: item
    }));
}

export async function ddbUpdateCommandHelper(
    data:any
) {
    await docClient.send(new UpdateCommand(data));
}