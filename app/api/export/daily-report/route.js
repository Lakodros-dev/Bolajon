import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import ExcelJS from 'exceljs';
import { sendTelegramDocument } from '@/lib/telegram';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const sendToTelegram = searchParams.get('sendToTelegram') === 'true';

    await connectDB();

    // Asia/Tashkent vaqti bilan ishlash
    const now = date ? new Date(date) : new Date();

    // O'zbekiston vaqti bilan hisoblash
    const uzbekNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));

    const endOfPeriod = new Date(uzbekNow);
    endOfPeriod.setHours(20, 0, 0, 0);

    const startOfPeriod = new Date(endOfPeriod);
    startOfPeriod.setDate(startOfPeriod.getDate() - 1);

    // Barcha foydalanuvchilarni olish (admin bundan mustasno)
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name phone role subscriptionStatus subscriptionEndDate trialStartDate createdAt lastLogin')
      .lean();

    const students = await Student.find()
      .select('name phone teacherId createdAt')
      .lean();

    // Excel fayl yaratish
    const workbook = new ExcelJS.Workbook();

    // O'qituvchilar sheet
    const teachersSheet = workbook.addWorksheet('O\'qituvchilar');
    teachersSheet.columns = [
      { header: 'Ism', key: 'name', width: 25 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Obuna holati', key: 'subscription', width: 15 },
      { header: 'Obuna tugashi', key: 'endDate', width: 20 },
      { header: 'Ro\'yxatdan o\'tgan', key: 'createdAt', width: 20 },
      { header: 'Oxirgi kirish', key: 'lastLogin', width: 20 }
    ];

    const teachers = users.filter(u => u.role === 'teacher');
    teachers.forEach(teacher => {
      teachersSheet.addRow({
        name: teacher.name,
        phone: teacher.phone,
        subscription: teacher.subscriptionStatus === 'active' ? 'Faol' :
          teacher.subscriptionStatus === 'trial' ? 'Trial' : 'Obunasiz',
        endDate: teacher.subscriptionEndDate ?
          new Date(teacher.subscriptionEndDate).toLocaleDateString('uz-UZ') : '-',
        createdAt: new Date(teacher.createdAt).toLocaleDateString('uz-UZ'),
        lastLogin: teacher.lastLogin ?
          new Date(teacher.lastLogin).toLocaleDateString('uz-UZ') : '-'
      });
    });

    // O'quvchilar sheet
    const studentsSheet = workbook.addWorksheet('O\'quvchilar');
    studentsSheet.columns = [
      { header: 'Ism', key: 'name', width: 25 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Ro\'yxatdan o\'tgan', key: 'createdAt', width: 20 }
    ];

    students.forEach(student => {
      studentsSheet.addRow({
        name: student.name,
        phone: student.phone,
        createdAt: new Date(student.createdAt).toLocaleDateString('uz-UZ')
      });
    });

    // Statistika sheet
    const statsSheet = workbook.addWorksheet('Statistika');
    statsSheet.columns = [
      { header: 'Ko\'rsatkich', key: 'label', width: 30 },
      { header: 'Qiymat', key: 'value', width: 15 }
    ];

    const newTeachers = teachers.filter(t =>
      new Date(t.createdAt) >= startOfPeriod && new Date(t.createdAt) < endOfPeriod
    ).length;

    const newStudents = students.filter(s =>
      new Date(s.createdAt) >= startOfPeriod && new Date(s.createdAt) < endOfPeriod
    ).length;

    const activeSubscriptions = teachers.filter(t =>
      t.subscriptionStatus === 'active' &&
      t.subscriptionEndDate &&
      new Date(t.subscriptionEndDate) >= new Date()
    ).length;

    const trialSubscriptions = teachers.filter(t =>
      t.subscriptionStatus === 'trial'
    ).length;

    const activeUsersToday = users.filter(u =>
      u.lastLogin && new Date(u.lastLogin) >= startOfPeriod && new Date(u.lastLogin) < endOfPeriod
    ).length;

    statsSheet.addRow({ label: 'Davr', value: `${startOfPeriod.toLocaleDateString('uz-UZ')} - ${endOfPeriod.toLocaleDateString('uz-UZ')}` });
    statsSheet.addRow({ label: '', value: '' });
    statsSheet.addRow({ label: 'BUGUN RO\'YXATDAN O\'TDI', value: '' });
    statsSheet.addRow({ label: 'O\'qituvchilar', value: newTeachers });
    statsSheet.addRow({ label: 'O\'quvchilar', value: newStudents });
    statsSheet.addRow({ label: 'Faol', value: activeUsersToday });
    statsSheet.addRow({ label: '', value: '' });
    statsSheet.addRow({ label: 'OBUNALAR', value: '' });
    statsSheet.addRow({ label: 'Faol obuna', value: activeSubscriptions });
    statsSheet.addRow({ label: 'Trial', value: trialSubscriptions });
    statsSheet.addRow({ label: '', value: '' });
    statsSheet.addRow({ label: 'UMUMIY', value: '' });
    statsSheet.addRow({ label: 'Jami foydalanuvchilar', value: users.length });
    statsSheet.addRow({ label: 'O\'qituvchilar', value: teachers.length });
    statsSheet.addRow({ label: 'O\'quvchilar', value: students.length });

    // Excel faylni buffer ga yozish
    const buffer = await workbook.xlsx.writeBuffer();

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
