import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import { generateExcelReport, sendTelegramDocument } from '@/lib/telegram';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('Telegram Webhook received:', body);

        // Callback query ni tekshirish
        if (body.callback_query) {
            const { data, id, message } = body.callback_query;

            if (data.startsWith('export_excel_')) {
                const dateStr = data.replace('export_excel_', '');
                const date = new Date(dateStr);

                await connectDB();

                // Statistika yig'ish (API route dagi mantiq bilan bir xil)
                const uzbekNow = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
                const endOfPeriod = new Date(uzbekNow);
                endOfPeriod.setHours(20, 0, 0, 0);
                const startOfPeriod = new Date(endOfPeriod);
                startOfPeriod.setDate(startOfPeriod.getDate() - 1);

                const users = await User.find({ role: { $ne: 'admin' } }).lean();
                const students = await Student.find().lean();
                const teachers = users.filter(u => u.role === 'teacher');

                const stats = {
                    newTeachersToday: teachers.filter(t => new Date(t.createdAt) >= startOfPeriod && new Date(t.createdAt) < endOfPeriod).length,
                    newStudentsToday: students.filter(s => new Date(s.createdAt) >= startOfPeriod && new Date(s.createdAt) < endOfPeriod).length,
                    activeUsers: users.filter(u => u.lastLogin && new Date(u.lastLogin) >= startOfPeriod && new Date(u.lastLogin) < endOfPeriod).length,
                    activeSubscriptions: teachers.filter(t => t.subscriptionStatus === 'active' && t.subscriptionEndDate && new Date(t.subscriptionEndDate) >= new Date()).length,
                    trialSubscriptions: teachers.filter(t => t.subscriptionStatus === 'trial').length,
                    noSubscription: teachers.filter(t => !t.subscriptionStatus || t.subscriptionStatus === 'inactive').length,
                    totalUsers: users.length,
                    totalTeachers: teachers.length,
                    totalStudents: students.length
                };

                const buffer = await generateExcelReport(startOfPeriod, endOfPeriod, stats);
                const fileName = `Kunlik-Hisobot-${endOfPeriod.toLocaleDateString('uz-UZ').replace(/\//g, '-')}.xlsx`;

                // Telegram bot orqali faylni yuborish
                const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

                // Callback ga javob yuborish (soatni aylanib turishini to'xtatadi)
                await bot.answerCallbackQuery(id, { text: 'Excel fayli tayyorlanmoqda...' });

                // Faylni yuborish
                await bot.sendDocument(message.chat.id, buffer, {
                    caption: `📊 Kunlik hisobot (Excel) - ${endOfPeriod.toLocaleDateString('uz-UZ')}`
                }, {
                    filename: fileName,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });

                return NextResponse.json({ ok: true });
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Telegram Webhook error:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
