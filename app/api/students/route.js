/**
 * Students API Routes
 * POST /api/students - Create new student
 * GET /api/students - Get all students for teacher
 */
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// GET - Get all students for the authenticated teacher
export async function GET(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        // Teachers see only their students, admins see all
        // Only show active students
        const query = auth.user.role === 'admin'
            ? { isActive: true }
            : { teacher: auth.user._id, isActive: true };

        const students = await Student.find(query)
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
        const { name, age, parentName, parentPhone } = body;

        // Validation
        if (!name || !age) {
            return errorResponse('Name and age are required');
        }

        if (age < 5 || age > 9) {
            return errorResponse('Age must be between 5 and 9');
        }

        const student = await Student.create({
            name,
            age,
            teacher: auth.user._id,
            parentName: parentName || '',
            parentPhone: parentPhone || '',
            stars: 0
        });

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
