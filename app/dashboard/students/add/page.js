'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import { ArrowLeft, User, Plus } from 'lucide-react';

export default function AddStudentPage() {
    const router = useRouter();
    const { getAuthHeader } = useAuth();
    const { addStudent } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        age: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    ...formData,
                    age: parseInt(formData.age)
                })
            });

            const data = await res.json();

            if (data.success) {
                // Add student to cache immediately
                addStudent(data.student);
                router.push('/dashboard/students');
            } else {
                setError(data.error || "O'quvchi qo'shishda xatolik yuz berdi");
            }
        } catch (err) {
            setError("O'quvchi qo'shishda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content">
            {/* Header */}
            <header className="sticky-top bg-white border-bottom py-3 px-3">
                <div className="d-flex align-items-center gap-3">
                    <Link href="/dashboard/students" className="btn btn-light rounded-circle p-2">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="h5 fw-bold mb-0">Yangi o'quvchi</h1>
                </div>
            </header>

            <main className="p-3">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-danger rounded-4 mb-4">{error}</div>
                    )}

                    <div className="card border-0 rounded-4 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <h3 className="h6 fw-bold mb-4 d-flex align-items-center gap-2">
                                <User size={20} className="text-primary" />
                                O'quvchi ma'lumotlari
                            </h3>

                            <div className="mb-3">
                                <label className="form-label small fw-semibold">Ism</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control rounded-3 py-3"
                                    placeholder="O'quvchi ismi"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-0">
                                <label className="form-label small fw-semibold">Yosh</label>
                                <select
                                    name="age"
                                    className="form-select rounded-3 py-3"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Yoshni tanlang</option>
                                    {[5, 6, 7, 8, 9].map(age => (
                                        <option key={age} value={age}>{age} yosh</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 rounded-4 py-3 fw-bold"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        ) : (
                            <Plus size={20} className="me-2" />
                        )}
                        O'quvchi qo'shish
                    </button>
                </form>
            </main>
        </div>
    );
}
