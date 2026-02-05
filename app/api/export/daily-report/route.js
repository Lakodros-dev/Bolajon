import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import { generateExcelReport } from '@/lib/telegram';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    await connectDB();

    // Asia/Tashkent vaqti bilan ishlash
    const now = date ? new Date(date) : new Date();

    // O'zbekiston vaqti bilan hisoblash
    const uzbekNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));

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

    // Professional styled Excel generatsiya qilish
    const buffer = await generateExcelReport(startOfPeriod, endOfPeriod, stats);

    const dateStr = endOfPeriod.toLocaleDateString('uz-UZ').replace(/\//g, '-');
    const fileName = `Kunlik-Hisobot-${dateStr}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error) {
    console.error('Excel export xatosi:', error);
    return NextResponse.json({
      error: 'Excel fayl yaratishda xatolik',
      details: error.message
    }, { status: 500 });
  }
}
