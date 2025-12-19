/**
 * Authentication Middleware
 * Protects API routes and validates JWT tokens
 */
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Authenticate user from JWT token
 * @param {Request} request - Next.js request object
 * @returns {Object} { success, user, error }
 */
export async function authenticate(request) {
    try {
        const token = getTokenFromHeader(request);

        if (!token) {
            return {
                success: false,
                error: 'Access denied. No token provided.',
                status: 401
            };
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return {
                success: false,
                error: 'Invalid or expired token.',
                status: 401
            };
        }

        await dbConnect();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return {
                success: false,
                error: 'User not found.',
                status: 404
            };
        }

        if (!user.isActive) {
            return {
                success: false,
                error: 'Account is deactivated.',
                status: 403
            };
        }

        return {
            success: true,
            user: user
        };
    } catch (error) {
        return {
            success: false,
            error: 'Authentication failed.',
            status: 500
        };
    }
}

/**
 * Check if user has required role
 * @param {Object} user - User object
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
    return allowedRoles.includes(user.role);
}

/**
 * Authorize user with specific roles
 * @param {Request} request - Next.js request object
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Object} { success, user, error }
 */
export async function authorize(request, allowedRoles = ['admin', 'teacher']) {
    const authResult = await authenticate(request);

    if (!authResult.success) {
        return authResult;
    }

    if (!hasRole(authResult.user, allowedRoles)) {
        return {
            success: false,
            error: 'Access denied. Insufficient permissions.',
            status: 403
        };
    }

    return authResult;
}

/**
 * Admin only middleware
 * @param {Request} request - Next.js request object
 * @returns {Object} { success, user, error }
 */
export async function adminOnly(request) {
    return authorize(request, ['admin']);
}

/**
 * Teacher only middleware
 * @param {Request} request - Next.js request object
 * @returns {Object} { success, user, error }
 */
export async function teacherOnly(request) {
    return authorize(request, ['teacher']);
}
