import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { getRedisClient } from './redis.js';

dotenv.config();

async function fetchDroplets() {
    const apiToken = process.env.DIGITAL_OCEAN_API_TOKEN;
    
    const response = await fetch('https://api.digitalocean.com/v2/droplets', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });
  
    const data = await response.json();
    return data.droplets;
}

async function getLastDropletId() {
    const droplets = await fetchDroplets();
    if (droplets.length > 0) {
        const lastDroplet = droplets[droplets.length - 1];

        // Save the value to Redis
        const redisClient = await getRedisClient();
        await redisClient.set('currentDropletId', lastDroplet.id);

        return lastDroplet.id;
    } else {
        throw new Error('No droplets found.');
    }
}

async function createSnapshot(dropletId) {
    const accessToken = process.env.DIGITAL_OCEAN_API_TOKEN;
    const snapshotName = `GE${Date.now().toLocaleString()}`;

    const response = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}/actions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            type: 'snapshot',
            name: snapshotName,
        }),
    });

    const data = await response.json();

    // Continue checking the status until it's completed
    while (data.action.status === 'in-progress') {
        await new Promise((resolve) => setTimeout(resolve, 30*1000)); // Wait for 30 second
        const checkResponse = await fetch(`https://api.digitalocean.com/v2/actions/${data.action.id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const checkData = await checkResponse.json();
        console.log('Snapshot status:', checkData.action.status);
        if (checkData.action.completed_at) {
            console.log('Snapshot completed at:', checkData.action.completed_at);
            break;
        }
    }
    return data.action.id;
}

async function listSnapshots() {
    const response = await fetch('https://api.digitalocean.com/v2/snapshots', {
        headers: {
            'Authorization': `Bearer ${process.env.DIGITAL_OCEAN_API_TOKEN}`,
        },
    });

    const data = await response.json();
    return data.snapshots;
}

async function createDropletFromSnapshot(snapshotId) {
    const accessToken = process.env.DIGITAL_OCEAN_API_TOKEN;

    const response = await fetch('https://api.digitalocean.com/v2/droplets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            name: 'new-droplet',
            region: 'fra1',
            size: 's-1vcpu-1gb',
            image: snapshotId,
            user_data: `#!/bin/bash\npasswd <<EOF\nalireza13381Sa\nalireza13381Sa\nEOF`,
        }),
    });

    const data = await response.json();
    const dropletId = data.droplet.id;

    // Continue checking the status until the Droplet is created
    while (true) {
        await new Promise((resolve) => setTimeout(resolve, 30*1000)); // Wait for 30 seconds
        const checkResponse = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const checkData = await checkResponse.json();
        console.log('Droplet status:', checkData.droplet.status);
        if (checkData.droplet.status === 'active') {
            console.log('Droplet created successfully');
            return dropletId;
        }
    }
}

async function destroyDroplet(dropletId) {
    const response = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.DIGITAL_OCEAN_API_TOKEN}`,
        },
    });

    if (response.status === 204) {
        return true;
    } else {
        const data = await response.json();
        throw new Error(data.message);
    }
}

async function getDropletIP(dropletId) {
    const response = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
        headers: {
            'Authorization': `Bearer ${process.env.DIGITAL_OCEAN_API_TOKEN}`,
        },
    });

    const data = await response.json();
    return data.droplet.networks.v4[0].ip_address;
}



export {
    fetchDroplets,
    getLastDropletId,
    listSnapshots,
    createSnapshot,
    createDropletFromSnapshot,
    destroyDroplet,
    getDropletIP,
  };