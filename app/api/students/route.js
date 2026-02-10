/**
 * Students API Routes
 * POST /api/students - Create new student
 * GET /api/students - Get all students for teacher
 */
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { validateRequest, createStudentSchema } from '@/lib/validation';
import { broadcastStudentUpdate, broadcastDashboardUpdate } from '@/lib/socket';

// GET - Get all students for the authenticated teacher
export async function GET(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('all') === 'true';

        let query = { isActive: true };

        if (auth.user.role === 'admin' && showAll) {
            query = { isActive: true };
        } else {
            query = { teacher: auth.user._id, isActive: true };
        }

        const students = await Student.find(query)
            .select('name age stars teacher parentName parentPhone createdAt avatar')
            .sort({ createdAt: -1 })
            .lean();

        return successResponse({ students });
    } catch (error) {
        console.error('Get students error:', error);
        return serverError('Failed to fetch students');
    }
}

// POST - Create new student
export async function POST(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();

        // Validate input
        const validation = validateRequest(createStudentSchema, body);
        if (!validation.success) {
            return errorResponse(validation.error, 400);
        }

        const { name, age, parentName, parentPhone } = validation.data;

        const student = await Student.create({
            name,
            age,
            teacher: auth.user._id,
            parentName: parentName || '',
            parentPhone: parentPhone || '',
            stars: 0
        });

        // Broadcast real-time update
        try {
            broadcastStudentUpdate(auth.user._id.toString(), student, 'create');

            // Update dashboard stats
            const totalStudents = await Student.countDocuments({ 
                teacher: auth.user._id, 
                isActive: true 
            });
            const totalStars = await Student.aggregate([
                { $match: { teacher: auth.user._id, isActive: true } },
                { $group: { _id: null, total: { $sum: '$stars' } } }
            ]);

            broadcastDashboardUpdate(auth.user._id.toString(), {
                totalStudents,
                totalStars: totalStars[0]?.total || 0
            });
        } catch (socketError) {
            // Continue even if socket fails
        }

        return successResponse({
            message: 'Student created successfully',
            student
        }, 201);

    } catch (error) {
        console.error('Create student error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return errorResponse(messages.join(', '));
        }

        return serverError('Failed to create student');
    }
}
