const { EventHubProducerClient } = require("@azure/event-hubs");

async function main() {
    const eventHubConnectionString = "";
    const eventHubName = "myeventhub";
    const producerClient = new EventHubProducerClient(eventHubConnectionString, eventHubName);

    const eventDataBatch = await producerClient.createBatch();
    let numberOfEventsToSend = 1;

    while (numberOfEventsToSend > 0) {
        const date = new Date().toLocaleString();
        let wasAdded = eventDataBatch.tryAdd({
            body: `my-event-body-${date}`
        });

        if (!wasAdded) {
            break;
        }
        numberOfEventsToSend--;
    }

    await producerClient.sendBatch(eventDataBatch);
    await producerClient.close();
}

main();