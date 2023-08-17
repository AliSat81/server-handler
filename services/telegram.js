
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import {     
    listSnapshots,
    createSnapshot,
    createDropletFromSnapshot,
    destroyDroplet,
    getDropletIP,
    getLastDropletId,
    fetchDroplets, } from '../utils/digitalocean.utils.js'
import { checkIranCities } from '../utils/checkhost.js';
import { updateDNSRecord } from '../utils/cloudflare.js';

dotenv.config();


const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

let currentDropletId = null;

const keyboard = {
    reply_markup: {
        keyboard: [['Change Server', 'Change ReservedIP']],
        resize_keyboard: true,
        one_time_keyboard: true,
    },
};

const clearKeyboard = {
    reply_markup: {
        remove_keyboard: true,
    },
};

bot.onText(/\/start/, (msg) => {
    const username = msg.from.first_name;
    const welcomeMessage = `Welcome, ${username}! Click the "/Change_Server" button to proceed.`;
    bot.sendMessage(msg.chat.id, welcomeMessage, keyboard);
});

bot.onText(/Change Server/, async (msg) => {

    // bot.sendMessage(msg.chat.id, `Changing your server ⚙️\nThis may take a few minutes ⌛️`, clearKeyboard);
    // bot.sendMessage(msg.chat.id, "⌛️");

    // currentDropletId = await getLastDropletId()
    // await createSnapshot(currentDropletId)
    // const snapshots = await listSnapshots()
    // const snapshotId = snapshots[0].id;
    // await bot.sendMessage(msg.chat.id,`Snapshot created : ${snapshotId} ✅`)

    // const isAllowed = await checkIranCities("143.244.207.224");

    // const message = isAllowed
    // ? `The Droplet's IP (${"143.244.207.224"}) can successfully reach all Iran cities using Check Host API.`
    // : `The Droplet's IP (${"143.244.207.224"}) cannot reach all Iran cities using Check Host API.`;

    // await bot.sendMessage(msg.chat.id, message);
    // bot.sendMessage(msg.chat.id, `Creating a droplet from snapshot, please wait ⌛️`);
    // const newDropletId = await createDropletFromSnapshot(138612152)
    // const newDropletIP = await getDropletIP(newDropletId)
    // await bot.sendMessage(msg.chat.id, `Droplet created,\nIP:<pre>${newDropletIP}</pre>`, { parse_mode: 'HTML' });

    console.log(await updateDNSRecord("188.166.193.225"))
    // if (newDropletId) {
    //     currentDropletId = newDropletId;
    //     const dropletIP = await getDropletIP(currentDropletId);

    //     const confirmationMarkup = {
    //         reply_markup: {
    //             inline_keyboard: [
    //                 [{ text: 'OK', callback_data: 'confirm' }]
    //             ]
    //         }
    //     };

    //     bot.sendMessage(msg.chat.id, `New droplet created with IP: ${dropletIP}. Click "OK" to confirm.`, confirmationMarkup);
    // }
});

bot.on('callback_query', async (query) => {
    if (query.data === 'confirm') {
        bot.answerCallbackQuery(query.id, 'Server change confirmed. Enjoy your new droplet!');
    }
});