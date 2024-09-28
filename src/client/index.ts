
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from "qrcode-terminal";

const client = new Client({
    qrMaxRetries: 3,
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

export default client