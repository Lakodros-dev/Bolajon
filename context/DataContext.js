'use client';

/**
 * Global Data Context
 * Caches all data on app load, prevents re-fetching on page navigation
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export function DataProvider({ children }) {
    const { token, isAuthenticated, getAuthHeader } = useAuth();

    // All cached data
    const [lessons, setLessons] = useState([]);
    const [students, setStudents] = useState([]);
    const [rewards, setRewards] = useState([]);
    const [dashboard, setDashboard] = useState({ totalStudents: 0, totalStars: 0, completedLessons: 0 });
    const [statistics, setStatistics] = useState(null);

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    // Load all data once when authenticated
    const loadAllData = useCallback(async () => {
        if (!isAuthenticated || !token) return;

        setInitialLoading(true);
        setLoadingTimeout(false);

        // Set 4 second timeout
        const timeoutId = setTimeout(() => {
            setLoadingTimeout(true);
            setInitialLoading(false);
        }, 4000);

        try {
            const headers = getAuthHeader();

            // Fetch all data in parallel
            const [lessonsRes, studentsRes, rewardsRes, dashboardRes, statsRes] = await Promise.all([
                fetch('/api/lessons').catch(() => ({ ok: false })),
                fetch('/api/students', { headers }).catch(() => ({ ok: false })),
                fetch('/api/rewards').catch(() => ({ ok: false })),
                fetch('/api/dashboard', { headers }).catch(() => ({ ok: false })),
                fetch('/api/statistics', { headers }).catch(() => ({ ok: false }))
            ]);

            // Clear timeout if data loaded successfully
            clearTimeout(timeoutId);

            // Parse all responses in parallel
            const results = await Promise.all([
                lessonsRes.ok ? lessonsRes.json() : { success: false },
                studentsRes.ok ? studentsRes.json() : { success: false },
                rewardsRes.ok ? rewardsRes.json() : { success: false },
                dashboardRes.ok ? dashboardRes.json() : { success: false },
                statsRes.ok ? statsRes.json() : { success: false }
            ]);

            const [lessonsData, studentsData, rewardsData, dashboardData, statsData] = results;

            if (lessonsData.success) setLessons(lessonsData.lessons || []);
            if (studentsData.success) setStudents(studentsData.students || []);
            if (rewardsData.success) setRewards(rewardsData.rewards || []);
            if (dashboardData.success) {
                setDashboard({
                    totalStudents: dashboardData.totalStudents || 0,
                    totalStars: dashboardData.totalStars || 0,
                    completedLessons: dashboardData.completedLessons || 0
                });
            }
            if (statsData.success) setStatistics(statsData);

            setDataLoaded(true);
            setLoadingTimeout(false);
        } catch (error) {
            console.error('Failed to load data:', error);
            clearTimeout(timeoutId);
        } finally {
            setInitialLoading(false);
        }
    }, [isAuthenticated, token, getAuthHeader]);

    // Load data when authenticated
    useEffect(() => {
        if (isAuthenticated && token && !dataLoaded) {
            loadAllData();
        } else if (!isAuthenticated) {
            setInitialLoading(false);
        }
    }, [isAuthenticated, token, dataLoaded, loadAllData]);

    // Refresh specific data
    const refreshLessons = useCallback(async () => {
        try {
            const res = await fetch('/api/lessons');
            const data = await res.json();
            if (data.success) setLessons(data.lessons || []);
        } catch (error) {
            console.error('Failed to refresh lessons:', error);
        }
    }, []);

    const refreshStudents = useCallback(async () => {
        try {
            const res = await fetch('/api/students', { headers: getAuthHeader() });
            const data = await res.json();
            if (data.success) setStudents(data.students || []);
        } catch (error) {
            console.error('Failed to refresh students:', error);
        }
    }, [getAuthHeader]);

    const refreshRewards = useCallback(async () => {
        try {
            const res = await fetch('/api/rewards');
            const data = await res.json();
            if (data.success) setRewards(data.rewards || []);
        } catch (error) {
            console.error('Failed to refresh rewards:', error);
        }
    }, []);

    const refreshDashboard = useCallback(async () => {
        try {
            const res = await fetch('/api/dashboard', { headers: getAuthHeader() });
            const data = await res.json();
            if (data.success) {
                setDashboard({
                    totalStudents: data.totalStudents || 0,
                    totalStars: data.totalStars || 0,
                    completedLessons: data.completedLessons || 0
                });
            }
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    }, [getAuthHeader]);

    const refreshStatistics = useCallback(async () => {
        try {
            const res = await fetch('/api/statistics', { headers: getAuthHeader() });
            const data = await res.json();
            if (data.success) setStatistics(data);
        } catch (error) {
            console.error('Failed to refresh statistics:', error);
        }
    }, [getAuthHeader]);

    // Refresh all data
    const refreshAll = useCallback(() => {
        return loadAllData();
    }, [loadAllData]);

    // Add student to cache
    const addStudent = useCallback((student) => {
        setStudents(prev => [...prev, student]);
        setDashboard(prev => ({ 
            ...prev, 
            totalStudents: prev.totalStudents + 1,
            totalStars: prev.totalStars + (student.stars || 0)
        }));
    }, []);

    // Update student in cache
    const updateStudent = useCallback((id, updates) => {
        setStudents(prev => prev.map(s => s._id === id ? { ...s, ...updates } : s));
        
        // Update dashboard totalStars if stars changed
        if (updates.stars !== undefined) {
            setDashboard(prev => {
                const oldStudent = students.find(s => s._id === id);
                const oldStars = oldStudent?.stars || 0;
                const newStars = updates.stars;
                const starsDiff = newStars - oldStars;
                
                return {
                    ...prev,
                    totalStars: Math.max(0, prev.totalStars + starsDiff)
                };
            });
        }
    }, [students]);

    // Recalculate total stars when students change
    useEffect(() => {
        if (students.length > 0 && dataLoaded) {
            const totalStars = students.reduce((sum, s) => sum + (s.stars || 0), 0);
            setDashboard(prev => ({
                ...prev,
                totalStars
            }));
        }
    }, [students, dataLoaded]);

    // Delete student from cache
    const deleteStudent = useCallback((id) => {
        const student = students.find(s => s._id === id);
        setStudents(prev => prev.filter(s => s._id !== id));
        setDashboard(prev => ({ 
            ...prev, 
            totalStudents: Math.max(0, prev.totalStudents - 1),
            totalStars: Math.max(0, prev.totalStars - (student?.stars || 0))
        }));
    }, [students]);

    // Add lesson to cache
    const addLesson = useCallback((lesson) => {
        setLessons(prev => [...prev, lesson]);
    }, []);

    // Update lesson in cache
    const updateLesson = useCallback((id, updates) => {
        setLessons(prev => prev.map(l => l._id === id ? { ...l, ...updates } : l));
    }, []);

    // Delete lesson from cache
    const deleteLesson = useCallback((id) => {
        setLessons(prev => prev.filter(l => l._id !== id));
    }, []);

    // Add reward to cache
    const addReward = useCallback((reward) => {
        setRewards(prev => [...prev, reward]);
    }, []);

    // Update reward in cache
    const updateReward = useCallback((id, updates) => {
        setRewards(prev => prev.map(r => r._id === id ? { ...r, ...updates } : r));
    }, []);

    // Delete reward from cache
    const deleteReward = useCallback((id) => {
        setRewards(prev => prev.filter(r => r._id !== id));
    }, []);

    // Update dashboard stats
    const updateDashboard = useCallback((updates) => {
        setDashboard(prev => ({ ...prev, ...updates }));
    }, []);

    const contextValue = useMemo(() => ({
        // Data
        lessons,
        students,
        rewards,
        dashboard,
        statistics,

        // Loading states
        initialLoading,
        dataLoaded,
        loadingTimeout,

        // Refresh functions
        refreshLessons,
        refreshStudents,
        refreshRewards,
        refreshDashboard,
        refreshStatistics,
        refreshAll,

        // Student CRUD helpers
        addStudent,
        updateStudent,
        deleteStudent,

        // Lesson CRUD helpers
        addLesson,
        updateLesson,
        deleteLesson,

        // Reward CRUD helpers
        addReward,
        updateReward,
        deleteReward,

        // Dashboard helper
        updateDashboard
    }), [
        lessons, students, rewards, dashboard, statistics,
        initialLoading, dataLoaded, loadingTimeout,
        refreshLessons, refreshStudents, refreshRewards, refreshDashboard, refreshStatistics, refreshAll,
        addStudent, updateStudent, deleteStudent,
        addLesson, updateLesson, deleteLesson,
        addReward, updateReward, deleteReward,
        updateDashboard
    ]);

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

export default DataContext;
