const { EventHubProducerClient } = require("@azure/event-hubs");

async function main() {
    const eventHubConnectionString = "Endpoint=sb://esp-eh.servicebus.windows.net/;SharedAccessKeyName=myconn;SharedAccessKey=80TMSSezWOd3lGbYCp38jNM5vN34SfmRouky1UsYBXg=";
    const eventHubName = "myeventhub";
    const producerClient = new EventHubProducerClient(eventHubConnectionString, eventHubName);

    const eventDataBatch = await producerClient.createBatch();
    let numberOfEventsToSend = 1;

    let message = [
        {
            specversion: "1.0",
            type: "11111",
            id: "1234-5678-90",
            time: "",
            data: {
                payload: ""
            }
        }
    ];

    while (numberOfEventsToSend > 0) {
        const date = new Date().toLocaleString();
        // message[0].time = date;
        // message[0].data.payload = date;
        console.log(date);
        let wasAdded = eventDataBatch.tryAdd({
            body: date
        });
        if (!wasAdded) {
            break;
        }
        numberOfEventsToSend--;
    }

    await producerClient.sendBatch(eventDataBatch);
    await producerClient.close();
}

async function mainWithPartkey() {
    const eventHubConnectionString = "Endpoint=sb://esp-eh.servicebus.windows.net/;SharedAccessKeyName=myconn;SharedAccessKey=80TMSSezWOd3lGbYCp38jNM5vN34SfmRouky1UsYBXg=";
    const eventHubName = "myeventhub";
    const producerClient = new EventHubProducerClient(eventHubConnectionString, eventHubName);

    const date = new Date().toLocaleString();
    let message = [
        {
            specversion: "1.0",
            type: "11111",
            entityID: "00000",
            id: "1234-5678-90",
            data: {
                payload: date
            }
        }
    ];

    let messages = new Map();
    message.map(m => {
        let partKey = `${m.type}|${m.entityID}`;
        let existing = messages.get(partKey);

        if (existing) {
            messages.set(partKey, [...existing, m]);
        } else {
            messages.set(partKey, [m]);
        }
    });

    for (const[partitionKey, partitionMessages] of messages.entries()) {
        producerClient.createBatch({
            partitionKey: partitionKey
        }).then((batch) => {
            //
            partitionMessages.map((message) => {
                message.parentID = "1111-2222-3333"
                const added = batch.tryAdd({
                    body: message
                });
                added ? console.log("Added message to EH") : console.log("Failed to add message to EH");
            });

            //
            if (batch.count === 0) {
                console.log("failed to build batch");
            }

            //
            producerClient.sendBatch(batch).then((result) => {
                producerClient.close();
                console.log("Message posted to EH: " + result);
            }, (sendBatchError) => {
                console.log("Message NOT posted to EH: " + sendBatchError);
            });
        }, (createBatchError) => {
            console.log("Unable to create batch: " + createBatchError);
        });
    }
}

//main();
mainWithPartkey();