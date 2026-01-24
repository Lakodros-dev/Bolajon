import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GameProgress from '@/models/GameProgress';
import Progress from '@/models/Progress';
import { authenticate } from '@/middleware/authMiddleware';
import { errorResponse } from '@/lib/apiResponse';

// GET - Get game progress for a student (no subscription check - just viewing data)
export async function GET(request) {
    try {
        // Only check authentication
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
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

// POST - Record game win (no subscription check - client-side handles this)
export async function POST(request) {
    try {
        // Only check authentication
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const { studentId, lessonId } = await request.json();

        console.log('Recording game win:', { studentId, lessonId, teacherId: auth.user._id });

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
                    teacher: auth.user._id
                },
                $inc: { attempts: 1 }
            },
            { upsert: true, new: true }
        );

        console.log('Game progress saved:', progress);

        return NextResponse.json({ success: true, progress });
    } catch (error) {
        console.error('Record game win error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
