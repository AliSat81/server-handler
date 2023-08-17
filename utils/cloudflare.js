import fetch from "node-fetch";

// Cloudflare API Key and Zone ID
const apiKey = process.env.CLOUDFLARE_API_KEY;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

const subdomain = 'test.alrza.store';


// Update DNS Record
async function updateDNSRecord(newDropletIP) {
    try {
        const dnsRecordId = 'bbd23d72b169d8723520f58946449005';

        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${dnsRecordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                type: 'A',
                name: subdomain, 
                content: newDropletIP,
                ttl: 1,
            }),
        });

        const data = await response.json();
        if (data.success) {
            console.log('DNS Record updated successfully.');
        } else {
            console.error('Failed to update DNS Record:', data.errors);
        }
    } catch (error) {
        console.error('Error updating DNS Record:', error);
    }
}

// Fetch and display all DNS records for the zone
async function listDNSRecords() {
    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        const data = await response.json();
        const dnsRecords = data.result;

        // Find the DNS record with the matching subdomain
        const dnsRecord = dnsRecords.find(record => record.name === subdomain);

        if (dnsRecord) {
            console.log(`DNS Record ID for ${subdomain}: ${dnsRecord.id}`);
        } else {
            console.log(`DNS Record for ${subdomain} not found.`);
        }
    } catch (error) {
        console.error('Error listing DNS Records:', error);
    }
}

export {
    updateDNSRecord,
    listDNSRecords,
}
