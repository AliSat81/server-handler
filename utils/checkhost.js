import fetch from "node-fetch";

// Function to check connectivity to Iran cities using Check Host API
async function checkIranCities(ip) {
    try {
        const nodes = [
            "ir1.node.check-host.net",
            "ir3.node.check-host.net",
            "ir4.node.check-host.net",  
        ];
        const nodesQueryString = nodes.map(node => `node=${node}`).join('&');

        const response = await fetch(`https://check-host.net/check-ping?host=${ip}&${nodesQueryString}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        const responseData = await response.json();
        const request_id = responseData.request_id;

        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const result = await fetch(`https://check-host.net/check-result/${request_id}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                    });
                    const fetchedData = await result.json();
                
                    const resultData = {};
                    Object.assign(resultData, fetchedData);
                
                    const results = {};
                    let allNodesOk = true; // Flag to track if all nodes are OK
                
                    nodes.forEach(node => {
                        const nodeResults = resultData[node][0].map(ping => {
                            if (ping === null) {
                                allNodesOk = false;
                            }
                            return ping && ping[0] === 'OK' ? ['OK', ping[1]] : null;
                        });
                
                        results[node] = nodeResults;
                    });
                
                    console.log(results); // Processed results
                    if (allNodesOk) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (error) {
                    console.error('Error checking ping results:', error);
                    reject(error);
                }
            }, 10000); // Delay for 10 seconds before fetching the results        
        });
    } catch (error) {
        console.error('Error checking connectivity:', error);
        return false;
    }
}

export {
    checkIranCities,
}