import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GameProgress from '@/models/GameProgress';
import Progress from '@/models/Progress';
import { verifyToken } from '@/lib/auth';

// GET - Get game progress for a student
export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }

        // Get lesson progress (5 stars = completed)
        const lessonProgress = await Progress.find({
            student: studentId,
            starsEarned: 5
        }).select('lesson');

        // Get game progress
        const gameProgress = await GameProgress.find({
            student: studentId,
            gameWon: true
        }).select('lesson');

        const completedLessons = lessonProgress.map(p => p.lesson.toString());
        const wonGames = gameProgress.map(p => p.lesson.toString());

        return NextResponse.json({
            completedLessons,
            wonGames
        });
    } catch (error) {
        console.error('Get game progress error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST - Record game win
export async function POST(request) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();

        const { studentId, lessonId } = await request.json();

        if (!studentId || !lessonId) {
            return NextResponse.json({ error: 'Student ID and Lesson ID required' }, { status: 400 });
        }

        // Update or create game progress
        const progress = await GameProgress.findOneAndUpdate(
            { student: studentId, lesson: lessonId },
            {
                $set: {
                    gameWon: true,
                    wonAt: new Date(),
                    teacher: decoded.userId
                },
                $inc: { attempts: 1 }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, progress });
    } catch (error) {
        console.error('Record game win error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
