/**
 * Student API Routes by ID
 * GET /api/students/:id - Get single student
 * PUT /api/students/:id - Update student
 * DELETE /api/students/:id - Delete student
 */
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import Progress from '@/models/Progress';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError, notFoundResponse } from '@/lib/apiResponse';
import { clearCache } from '@/lib/cache';

// GET - Get single student with progress
export async function GET(request, { params }) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const student = await Student.findById(params.id).lean();

        if (!student) {
            return notFoundResponse('Student');
        }

        // Check ownership (use 'teacher' field, not 'teacherId')
        if (auth.user.role !== 'admin' && student.teacher.toString() !== auth.user._id.toString()) {
            return errorResponse('Access denied', 403);
        }

        // Get completed lessons count (use 'student' field, not 'studentId')
        const completedLessons = await Progress.countDocuments({ student: params.id });

        return successResponse({
            student: {
                ...student,
                completedLessons
            }
        });

    } catch (error) {
        console.error('Get student error:', error);
        return serverError('Failed to fetch student');
    }
}

// PUT - Update student
export async function PUT(request, { params }) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const student = await Student.findById(params.id);

        if (!student) {
            return notFoundResponse('Student');
        }

        // Check ownership (use 'teacher' field)
        if (auth.user.role !== 'admin' && student.teacher.toString() !== auth.user._id.toString()) {
            return errorResponse('Access denied', 403);
        }

        const body = await request.json();
        const { name, age, parentName, parentPhone, stars } = body;

        // Update fields
        if (name) student.name = name;
        if (age) student.age = age;
        if (parentName !== undefined) student.parentName = parentName;
        if (parentPhone !== undefined) student.parentPhone = parentPhone;
        if (stars !== undefined && auth.user.role === 'admin') student.stars = stars;

        await student.save();

        // Clear cache for this teacher's students
        clearCache(`students:${student.teacher}`);
        clearCache(`students:${student.teacher}:false`);
        clearCache(`students:${student.teacher}:true`);

        return successResponse({
            message: 'Student updated successfully',
            student
        });

    } catch (error) {
        console.error('Update student error:', error);
        return serverError('Failed to update student');
    }
}

// DELETE - Delete student
export async function DELETE(request, { params }) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const student = await Student.findById(params.id);

        if (!student) {
            return notFoundResponse('Student');
        }

        // Check ownership (use 'teacher' field)
        if (auth.user.role !== 'admin' && student.teacher.toString() !== auth.user._id.toString()) {
            return errorResponse('Access denied', 403);
        }

        // Delete student and their progress (use 'student' field)
        await Progress.deleteMany({ student: params.id });
        await Student.findByIdAndDelete(params.id);

        // Clear cache for this teacher's students
        clearCache(`students:${student.teacher}`);
        clearCache(`students:${student.teacher}:false`);
        clearCache(`students:${student.teacher}:true`);

        return successResponse({
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        return serverError('Failed to delete student');
    }
}
