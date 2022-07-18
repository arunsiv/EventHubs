const { EventHubConsumerClient } = require("@azure/event-hubs");
const { ContainerClient } = require("@azure/storage-blob");
const { BlobCheckpointStore } = require("@azure/eventhubs-checkpointstore-blob");
const { processMessage } = require("./processMessage");

const storageAccountConnectionString = "DefaultEndpointsProtocol=https;AccountName=espsablob;AccountKey=ycld0QgB+JdMLg6hQi9PyUAsJ0tyNBywE6wbsNK4ZB72P8Spw40mrBFcqoWvXLcJ0OeV3OOpyL3w+AStNxTxew==;EndpointSuffix=core.windows.net";
const containerName = "espcontainder";
const eventHubConnectionString = "Endpoint=sb://esp-eh.servicebus.windows.net/;SharedAccessKeyName=myconn;SharedAccessKey=80TMSSezWOd3lGbYCp38jNM5vN34SfmRouky1UsYBXg=";
const consumerGroup = "$Default";
const eventHubName = "myeventhub";

async function main() {
  const blobContainerClient = new ContainerClient(storageAccountConnectionString, containerName);

  if (!(await blobContainerClient.exists())) {
    await blobContainerClient.create();
  }

  const checkpointStore = new BlobCheckpointStore(blobContainerClient);
  const consumerClient = new EventHubConsumerClient(
    consumerGroup,
    eventHubConnectionString,
    eventHubName,
    checkpointStore
  );

  console.log(`Connected to EH...`);

  const subscription = consumerClient.subscribe({
    processEvents: async (events, context) => {
      // event processing code goes here
      if (events.length === 0) {
        // If the wait time expires (configured via options in maxWaitTimeInSeconds) Event Hubs
        // will pass you an empty array.
        return;
      }

      //console.log(`Partition Id: ${context.partitionId};Message: ${JSON.stringify(events)}`);
      const result = await processMessage(context.partitionId, JSON.stringify(events));
      console.log(`*** after processMessage ***`);

      // Checkpointing will allow your service to pick up from where it left off when restarting.
      // You'll want to balance how often you checkpoint with the performance of your underlying checkpoint store.
      await context.updateCheckpoint(events[events.length - 1]);
    },
    processError: async (err, context) => {
      // handle any errors that occur during the course of this subscription
      console.log(`Errors in subscription to partition ${context.partitionId}; ${err}`);
    }
  });

  // Wait for a few seconds to receive events before closing
  // await new Promise((resolve) => setTimeout(resolve, 10 * 1000));

  // await subscription.close();
  // await consumerClient.close();
  // console.log(`Exiting sample`);
}

main();