/**
 * API Response Helpers
 * Standardized response format for all API routes
 */
import { NextResponse } from 'next/server';

/**
 * Success response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 */
export function successResponse(data, status = 200) {
    return NextResponse.json({
        success: true,
        ...data
    }, { status });
}

/**
 * Error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 400)
 */
export function errorResponse(message, status = 400) {
    return NextResponse.json({
        success: false,
        error: message
    }, { status });
}

/**
 * Validation error response
 * @param {Object} errors - Validation errors object
 */
export function validationError(errors) {
    return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors
    }, { status: 400 });
}

/**
 * Not found response
 * @param {string} resource - Resource name
 */
export function notFoundResponse(resource = 'Resource') {
    return NextResponse.json({
        success: false,
        error: `${resource} not found`
    }, { status: 404 });
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
    return NextResponse.json({
        success: false,
        error: message
    }, { status: 401 });
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message = 'Access denied') {
    return NextResponse.json({
        success: false,
        error: message
    }, { status: 403 });
}

/**
 * Server error response
 */
export function serverError(message = 'Internal server error') {
    return NextResponse.json({
        success: false,
        error: message
    }, { status: 500 });
}
