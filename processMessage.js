async function processMessage(partitionId, message) {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`processMessage from partition: ${partitionId};Message: ${message}`);
            resolve('resolved');
        }, 5000);
    });
};

module.exports = { processMessage };