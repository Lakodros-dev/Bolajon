'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AddRewardPage() {
    const router = useRouter();
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cost: 10,
        image: '',
        category: 'other',
        stock: -1
    });

    const categories = [
        { value: 'toy', label: "O'yinchoq" },
        { value: 'book', label: 'Kitob' },
        { value: 'game', label: "O'yin" },
        { value: 'certificate', label: 'Sertifikat' },
        { value: 'other', label: 'Boshqa' }
    ];

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/rewards', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin/rewards');
            } else {
                setError(data.error || "Sovg'a qo'shishda xatolik");
            }
        } catch (err) {
            setError("Sovg'a qo'shishda xatolik");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link href="/admin/rewards" className="btn btn-light rounded-circle p-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="h3 fw-bold mb-0">Yangi sovg'a qo'shish</h1>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="alert alert-danger rounded-3 mb-4">{error}</div>
                )}

                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Sovg'a nomi *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-control rounded-3 py-2"
                                placeholder="Masalan: Yulduz stikeri"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Tavsif</label>
                            <textarea
                                name="description"
                                className="form-control rounded-3"
                                rows="2"
                                placeholder="Sovg'a haqida qisqacha"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Rasm URL</label>
                            <input
                                type="url"
                                name="image"
                                className="form-control rounded-3 py-2"
                                placeholder="https://example.com/image.jpg"
                                value={formData.image}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Narxi (yulduz) *</label>
                                <input
                                    type="number"
                                    name="cost"
                                    className="form-control rounded-3 py-2"
                                    min="1"
                                    value={formData.cost}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Kategoriya</label>
                                <select
                                    name="category"
                                    className="form-select rounded-3 py-2"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Miqdori</label>
                                <input
                                    type="number"
                                    name="stock"
                                    className="form-control rounded-3 py-2"
                                    min="-1"
                                    value={formData.stock}
                                    onChange={handleChange}
                                />
                                <small className="text-muted">-1 = cheksiz</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-3">
                    <Link href="/admin/rewards" className="btn btn-light rounded-3 px-4 py-2">
                        Bekor qilish
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                        )}
                        Saqlash
                    </button>
                </div>
            </form>
        </div>
    );
}
