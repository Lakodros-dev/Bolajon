/**
 * React Query hooks for data fetching
 * Professional caching with real-time updates
 * 
 * STRATEGY:
 * 1. Cache for speed (instant loading)
 * 2. Optimistic updates (instant UI changes)
 * 3. Manual invalidation (force refresh after mutations)
 * 4. Background refetching (keep data fresh)
 * 
 * POTENTIAL ISSUES & SOLUTIONS:
 * ❌ Issue: Cache shows old data for 5 minutes
 * ✅ Solution: Invalidate cache after every mutation
 * 
 * ❌ Issue: Multiple users - one user's changes not visible to others
 * ✅ Solution: Polling (refetch every 30s) or WebSocket (future)
 * 
 * ❌ Issue: Network error during mutation
 * ✅ Solution: Rollback to previous state automatically
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys
export const QUERY_KEYS = {
    lessons: ['lessons'],
    students: ['students'],
    rewards: ['rewards'],
    dashboard: ['dashboard'],
    statistics: ['statistics'],
    gameProgress: (studentId) => ['gameProgress', studentId],
};

// Fetch functions
async function fetchLessons() {
    const res = await fetch('/api/lessons');
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch lessons');
    return data.lessons || [];
}

async function fetchStudents(headers) {
    const res = await fetch('/api/students', { headers });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch students');
    return data.students || [];
}

async function fetchRewards() {
    const res = await fetch('/api/rewards');
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch rewards');
    return data.rewards || [];
}

async function fetchDashboard(headers) {
    const res = await fetch('/api/dashboard', { headers });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch dashboard');
    return {
        totalStudents: data.totalStudents || 0,
        totalStars: data.totalStars || 0,
        completedLessons: data.completedLessons || 0
    };
}

async function fetchGameProgress(studentId, headers) {
    const res = await fetch(`/api/game-progress?studentId=${studentId}`, { headers });
    const data = await res.json();
    return data;
}

// Custom hooks with smart caching
export function useLessons(options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.lessons,
        queryFn: fetchLessons,
        staleTime: 3 * 60 * 1000, // 3 minutes - darslar kam o'zgaradi
        refetchOnWindowFocus: true, // Window focus bo'lganda yangilash
        refetchInterval: 5 * 60 * 1000, // Har 5 daqiqada fonda yangilash
        ...options,
    });
}

export function useStudents(getAuthHeader, options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.students,
        queryFn: () => fetchStudents(getAuthHeader()),
        staleTime: 1 * 60 * 1000, // 1 minute - o'quvchilar tez-tez o'zgaradi
        refetchOnWindowFocus: true,
        refetchInterval: 2 * 60 * 1000, // Har 2 daqiqada yangilash
        enabled: !!getAuthHeader,
        ...options,
    });
}

export function useRewards(options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.rewards,
        queryFn: fetchRewards,
        staleTime: 3 * 60 * 1000, // 3 minutes
        refetchOnWindowFocus: true,
        refetchInterval: 5 * 60 * 1000,
        ...options,
    });
}

export function useDashboard(getAuthHeader, options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.dashboard,
        queryFn: () => fetchDashboard(getAuthHeader()),
        staleTime: 30 * 1000, // 30 seconds - dashboard tez o'zgaradi
        refetchOnWindowFocus: true,
        refetchInterval: 1 * 60 * 1000, // Har 1 daqiqada yangilash
        enabled: !!getAuthHeader,
        ...options,
    });
}

export function useGameProgress(studentId, getAuthHeader, options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.gameProgress(studentId),
        queryFn: () => fetchGameProgress(studentId, getAuthHeader()),
        staleTime: 10 * 1000, // 10 seconds - o'yin progressi tez o'zgaradi
        refetchOnWindowFocus: true,
        refetchInterval: 30 * 1000, // Har 30 soniyada yangilash
        enabled: !!studentId && !!getAuthHeader,
        ...options,
    });
}

// Mutation hooks with optimistic updates and instant invalidation
export function useAddStudent(getAuthHeader) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (studentData) => {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(studentData)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to add student');
            return data.student;
        },
        onMutate: async (newStudent) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.students });
            
            // Snapshot previous value
            const previousStudents = queryClient.getQueryData(QUERY_KEYS.students);
            
            // Optimistically update - DARHOL UI da ko'rsatiladi
            queryClient.setQueryData(QUERY_KEYS.students, (old) => [
                ...(old || []),
                { ...newStudent, _id: 'temp-' + Date.now(), stars: 0 }
            ]);
            
            return { previousStudents };
        },
        onError: (err, newStudent, context) => {
            // Rollback on error - xato bo'lsa qaytaradi
            queryClient.setQueryData(QUERY_KEYS.students, context.previousStudents);
            console.error('Failed to add student:', err);
        },
        onSuccess: () => {
            // INSTANT INVALIDATION - darhol yangi ma'lumot oladi
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
        },
    });
}

export function useUpdateStudent(getAuthHeader) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ id, updates }) => {
            const res = await fetch(`/api/students/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to update student');
            return data.student;
        },
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.students });
            const previousStudents = queryClient.getQueryData(QUERY_KEYS.students);
            
            // Optimistic update
            queryClient.setQueryData(QUERY_KEYS.students, (old) =>
                (old || []).map(s => s._id === id ? { ...s, ...updates } : s)
            );
            
            return { previousStudents };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(QUERY_KEYS.students, context.previousStudents);
            console.error('Failed to update student:', err);
        },
        onSuccess: () => {
            // Instant invalidation
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
            // Invalidate game progress if stars changed
            queryClient.invalidateQueries({ queryKey: ['gameProgress'] });
        },
    });
}

export function useDeleteStudent(getAuthHeader) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/students/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to delete student');
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.students });
            const previousStudents = queryClient.getQueryData(QUERY_KEYS.students);
            
            // Optimistic update
            queryClient.setQueryData(QUERY_KEYS.students, (old) =>
                (old || []).filter(s => s._id !== id)
            );
            
            return { previousStudents };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(QUERY_KEYS.students, context.previousStudents);
            console.error('Failed to delete student:', err);
        },
        onSuccess: () => {
            // Instant invalidation
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
        },
    });
}

// Similar mutations for lessons and rewards
export function useAddLesson(getAuthHeader) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (lessonData) => {
            const res = await fetch('/api/admin/lessons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(lessonData)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to add lesson');
            return data.lesson;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lessons });
        },
    });
}

export function useUpdateLesson(getAuthHeader) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ id, updates }) => {
            const res = await fetch(`/api/admin/lessons`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ id, ...updates })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to update lesson');
            return data.lesson;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lessons });
        },
    });
}

export function useDeleteLesson(getAuthHeader) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/admin/lessons`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to delete lesson');
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lessons });
        },
    });
}

// Manual refresh helper
export function useRefreshAll() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries(); // Barcha cache ni yangilash
    };
}
