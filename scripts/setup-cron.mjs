import cron from 'node-cron';

const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const sendReport = async () => {
  console.log('Kunlik hisobot yuborilmoqda...');

  try {
    const response = await fetch(`${API_URL}/api/cron/daily-report`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('Kunlik hisobot muvaffaqiyatli yuborildi');
    } else {
      console.error('Kunlik hisobot yuborishda xato:', data);
    }
  } catch (error) {
    console.error('Cron job xatosi:', error);
  }
};

// Har kuni soat 10:40 da (O'zbekiston vaqti)
cron.schedule('40 10 * * *', sendReport, {
  timezone: "Asia/Tashkent"
});

// Har kuni soat 20:00 da (O'zbekiston vaqti)
cron.schedule('0 20 * * *', sendReport, {
  timezone: "Asia/Tashkent"
});

console.log('Cron job ishga tushdi. Har kuni soat 10:40 va 20:00 da hisobot yuboriladi.');
