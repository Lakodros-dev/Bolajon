import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Progress from '@/models/Progress';
import GameProgress from '@/models/GameProgress';
import Redemption from '@/models/Redemption';
import Lesson from '@/models/Lesson';
import { sendDailyReport } from '@/lib/telegram';

export async function GET(request) {
  try {
    // Cron job uchun autentifikatsiya
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Kecha soat 20:00 dan bugun soat 20:00 gacha (O'zbekiston vaqti)
    const now = new Date();
    const uzbekNow = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    
    // Bugun soat 20:00
    const endOfPeriod = new Date(uzbekNow);
    endOfPeriod.setHours(20, 0, 0, 0);
    
    // Kecha soat 20:00
    const startOfPeriod = new Date(endOfPeriod);
    startOfPeriod.setDate(startOfPeriod.getDate() - 1);

    // Statistikani yig'ish (kecha 20:00 dan bugun 20:00 gacha)
    // Admin hisobga olinmaydi
    const [
      totalUsers,
      newUsersToday,
      newTeachersToday,
      newStudentsToday,
      activeUsers,
      totalTeachers,
      totalStudents,
      activeSubscriptions,
      trialSubscriptions,
      noSubscription
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        createdAt: { $gte: startOfPeriod, $lt: endOfPeriod } 
      }),
      User.countDocuments({ 
        role: 'teacher',
        createdAt: { $gte: startOfPeriod, $lt: endOfPeriod } 
      }),
      Student.countDocuments({ 
        createdAt: { $gte: startOfPeriod, $lt: endOfPeriod } 
      }),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        lastLogin: { $gte: startOfPeriod, $lt: endOfPeriod } 
      }),
      User.countDocuments({ role: 'teacher' }),
      Student.countDocuments(),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        subscriptionStatus: 'active',
        subscriptionEndDate: { $gte: new Date() }
      }),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        subscriptionStatus: 'trial',
        trialStartDate: { $exists: true }
      }),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        $or: [
          { subscriptionStatus: { $exists: false } },
          { subscriptionStatus: null },
          { subscriptionStatus: 'inactive' }
        ]
      })
    ]);

    const stats = {
      totalUsers,
      newUsersToday,
      newTeachersToday,
      newStudentsToday,
      activeUsers,
      totalTeachers,
      totalStudents,
      activeSubscriptions,
      trialSubscriptions,
      noSubscription
    };

    // Telegram ga yuborish
    const sent = await sendDailyReport(stats, startOfPeriod, endOfPeriod);

    return NextResponse.json({ 
      success: true, 
      sent,
      stats 
    });
  } catch (error) {
    console.error('Kunlik hisobot xatosi:', error);
    return NextResponse.json({ 
      error: 'Xatolik yuz berdi',
      details: error.message 
    }, { status: 500 });
  }
}
