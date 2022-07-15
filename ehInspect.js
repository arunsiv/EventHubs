const { EventHubProducerClient } = require("@azure/event-hubs");

async function main() {
    const eventHubConnectionString = "Endpoint=sb://esp-eh.servicebus.windows.net/;SharedAccessKeyName=myconn;SharedAccessKey=80TMSSezWOd3lGbYCp38jNM5vN34SfmRouky1UsYBXg=";
    const eventHubName = "myeventhub";
    const client = new EventHubProducerClient(eventHubConnectionString, eventHubName);

    const partitionIds = await client.getPartitionIds();

    console.log("partitionIds: " + partitionIds);

    await client.close();
}

main();