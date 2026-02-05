// Native fetch is used (available in Node.js 18+)
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bolajoon.uz';
const WEBHOOK_URL = `${APP_URL}/api/telegram/webhook`;

async function setWebhook() {
    console.log(`Setting webhook to: ${WEBHOOK_URL}`);

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`);
        const data = await response.json();

        if (data.ok) {
            console.log('✅ Webhook successfully set!');
            console.log(data);
        } else {
            console.error('❌ Failed to set webhook:');
            console.error(data);
        }
    } catch (error) {
        console.error('Error setting webhook:', error);
    }
}

setWebhook();
