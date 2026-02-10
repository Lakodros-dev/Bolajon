/**
 * Input Validation Schemas using Zod
 * Type-safe validation for API requests
 */
import { z } from 'zod';

// Phone number validation (Uzbek format)
const phoneRegex = /^(\+998)?[0-9]{9,12}$/;

// Common schemas
export const phoneSchema = z.string()
    .regex(phoneRegex, 'Telefon raqam noto\'g\'ri formatda')
    .transform(val => val.replace(/\s+/g, '').replace(/-/g, '').replace(/[^\d+]/g, ''));

export const passwordSchema = z.string()
    .min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
    .max(100, 'Parol juda uzun');

export const nameSchema = z.string()
    .min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak')
    .max(100, 'Ism juda uzun')
    .trim();

export const objectIdSchema = z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Noto\'g\'ri ID format');

// Auth schemas
export const registerSchema = z.object({
    name: nameSchema,
    phone: phoneSchema,
    password: passwordSchema,
    role: z.enum(['admin', 'teacher']).optional()
});

export const loginSchema = z.object({
    phone: phoneSchema,
    password: passwordSchema
});

export const updateProfileSchema = z.object({
    name: nameSchema.optional(),
    avatar: z.string().url().optional(),
    phone: phoneSchema.optional()
});

// Student schemas
export const createStudentSchema = z.object({
    name: nameSchema,
    age: z.number()
        .int('Yosh butun son bo\'lishi kerak')
        .min(5, 'Yosh kamida 5 bo\'lishi kerak')
        .max(9, 'Yosh ko\'pi bilan 9 bo\'lishi kerak'),
    parentName: z.string().max(100).optional(),
    parentPhone: phoneSchema.optional()
});

export const updateStudentSchema = z.object({
    name: nameSchema.optional(),
    age: z.number().int().min(5).max(9).optional(),
    parentName: z.string().max(100).optional(),
    parentPhone: phoneSchema.optional(),
    avatar: z.string().url().optional()
});

export const awardStarsSchema = z.object({
    stars: z.number()
        .int('Yulduzlar butun son bo\'lishi kerak')
        .min(1, 'Kamida 1 yulduz berish kerak')
        .max(5, 'Ko\'pi bilan 5 yulduz berish mumkin')
});

// Lesson schemas
export const createLessonSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
    videoUrl: z.string().url('Video URL noto\'g\'ri'),
    thumbnail: z.string().url().optional(),
    level: z.number().int().min(1).max(10),
    duration: z.number().int().min(0).optional(),
    order: z.number().int().min(0).optional(),
    vocabulary: z.array(z.object({
        word: z.string().min(1),
        translation: z.string().min(1),
        image: z.string().url().optional()
    })).optional(),
    gameType: z.enum([
        'none',
        'vocabulary',
        'catch-the-number',
        'pop-the-balloon',
        'drop-to-basket',
        'shopping-basket',
        'build-the-body',
        'movements'
    ]).optional()
});

export const updateLessonSchema = createLessonSchema.partial();

// Reward schemas
export const createRewardSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().max(1000).optional(),
    cost: z.number().int().min(1, 'Narx kamida 1 yulduz bo\'lishi kerak'),
    image: z.string().url().optional(),
    category: z.enum(['toy', 'book', 'game', 'certificate', 'other']).optional(),
    stock: z.number().int().optional()
});

export const updateRewardSchema = createRewardSchema.partial();

// Progress schemas
export const completeProgressSchema = z.object({
    studentId: objectIdSchema,
    lessonId: objectIdSchema,
    starsEarned: z.number().int().min(1).max(5),
    notes: z.string().max(500).optional()
});

// Redemption schemas
export const redeemRewardSchema = z.object({
    studentId: objectIdSchema,
    rewardId: objectIdSchema
});

// Subscription schemas
export const activateSubscriptionSchema = z.object({
    userId: objectIdSchema,
    days: z.number().int().min(1).max(365)
});

// Payment schemas
export const createPaymentSchema = z.object({
    amount: z.number()
        .int('Summa butun son bo\'lishi kerak')
        .min(1000, 'Minimal to\'lov 1000 so\'m')
        .max(10000000, 'Maksimal to\'lov 10,000,000 so\'m')
});

// Settings schemas
export const updateSettingsSchema = z.object({
    adminPhone: phoneSchema.optional(),
    cardNumber: z.string().regex(/^[0-9]{16}$/, 'Karta raqami 16 ta raqamdan iborat bo\'lishi kerak').optional(),
    cardHolder: z.string().min(3).max(100).optional(),
    dailyPrice: z.number().int().min(100).max(100000).optional()
});

/**
 * Validate request body against schema
 * @param {object} schema - Zod schema
 * @param {object} data - Data to validate
 * @returns {object} { success: boolean, data?: any, error?: string }
 */
export function validateRequest(schema, data) {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
            return { success: false, error: messages.join(', ') };
        }
        return { success: false, error: 'Validation xatosi' };
    }
}

/**
 * Middleware wrapper for validation
 */
export function validate(schema) {
    return (data) => {
        const result = validateRequest(schema, data);
        if (!result.success) {
            throw new Error(result.error);
        }
        return result.data;
    };
}
