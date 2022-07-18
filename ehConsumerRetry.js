const { EventHubConsumerClient, earliestEventPosition, latestEventPosition } = require("@azure/event-hubs");
const { ContainerClient } = require("@azure/storage-blob");
const { BlobCheckpointStore } = require("@azure/eventhubs-checkpointstore-blob");

const storageAccountConnectionString = "DefaultEndpointsProtocol=https;AccountName=espsablob;AccountKey=ycld0QgB+JdMLg6hQi9PyUAsJ0tyNBywE6wbsNK4ZB72P8Spw40mrBFcqoWvXLcJ0OeV3OOpyL3w+AStNxTxew==;EndpointSuffix=core.windows.net";
const containerName = "espcontainder";
const eventHubConnectionString = "Endpoint=sb://esp-eh.servicebus.windows.net/;SharedAccessKeyName=myconn;SharedAccessKey=80TMSSezWOd3lGbYCp38jNM5vN34SfmRouky1UsYBXg=";
const consumerGroup = "$Default";
const eventHubName = "myeventhub";
const messageId = 5142

async function processMessage(partitionId, messageId, message) {
  console.log(`processMessage from partition: ${partitionId};Message: ${JSON.stringify(message)}`);
  //console.log(`${messageId}===${message[0].sequenceNumber};${messageId===message[0].sequenceNumber}`);

  return new Promise((resolve, reject) => {
    if (messageId === message[0].sequenceNumber) {
      resolve('resolved');
    } else {
      reject('rejected');
    }
  });
};

async function main() {
  const client = new EventHubConsumerClient(
    consumerGroup,
    eventHubConnectionString,
    eventHubName
  );

  // In this sample, we use the position of earliest available event to start from
  // Other common options to configure would be `maxBatchSize` and `maxWaitTimeInSeconds`
  const subscriptionOptions = {
    maxBatchSize: 1,
    maxWaitTimeInSeconds: 10,
    trackLastEnqueuedEventProperties: true,
    startPosition: {
      isInclusive: true,
      sequenceNumber: 5140
    }
  };

  const subscriptionOptions1 = {
    //Event Position Interface
    startPosition: {
      isInclusive: true,
      sequenceNumber: 5124,
      offset: 1234,
      enqueuedOn: "date in UTC"
    }
  };

  const partitionIds = await client.getPartitionIds();

  const subscription = client.subscribe(
    partitionIds[1],
    {
      processEvents: async (events, context) => {
        // event processing code goes here
        if (events.length === 0) {
          // If the wait time expires (configured via options in maxWaitTimeInSeconds) Event Hubs
          // will pass you an empty array.
          return;
        }

        //console.log(`Partition Id: ${context.partitionId};Message: ${JSON.stringify(events)}`);
        //const result = await processMessage(context.partitionId, messageId, JSON.stringify(events));

        processMessage(context.partitionId, messageId, events).then((result) => {
          console.log(`*** sequence number matched - ${result} ***`);
          subscription.close();
          client.close();
        }, ((error) => {
          console.log(`*** sequence number did not match - ${error} ****`);
        }));

        console.log(`*** after processing message ***`);
      },
      processError: async (err, context) => {
        // error reporting/handling code here
        console.log(`Errors in subscription to partition ${context.partitionId}: ${err}`);
      },
      processClose: async () => {
        console.log(`Process close`);
      },
      processInitialize: async () => {
        console.log(`Process initialize`);
      }
    },
    subscriptionOptions
  );

  // Wait for a few seconds to receive events before closing
  // setTimeout(async () => {
  //   await subscription.close();
  //   await client.close();
  //   console.log(`Exiting sample`);
  // }, 1 * 500);
}

main();