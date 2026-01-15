'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminRewardsPage() {
    const { getAuthHeader } = useAuth();
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, reward: null });
    const [deleting, setDeleting] = useState(false);

    const categoryLabels = {
        toy: "O'yinchoq",
        book: 'Kitob',
        game: "O'yin",
        certificate: 'Sertifikat',
        other: 'Boshqa'
    };

    const categoryColors = {
        toy: 'bg-warning',
        book: 'bg-info',
        game: 'bg-success',
        certificate: 'bg-primary',
        other: 'bg-secondary'
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const res = await fetch('/api/rewards');
            const data = await res.json();
            if (data.success) {
                setRewards(data.rewards || []);
            }
        } catch (error) {
            console.error('Failed to fetch rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (reward) => {
        try {
            const res = await fetch(`/api/rewards/${reward._id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ isActive: !reward.isActive })
            });
            const data = await res.json();
            if (data.success) {
                setRewards(rewards.map(r =>
                    r._id === reward._id ? { ...r, isActive: !r.isActive } : r
                ));
            }
        } catch (error) {
            console.error('Failed to update reward:', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.reward) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/rewards/${deleteModal.reward._id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setRewards(rewards.filter(r => r._id !== deleteModal.reward._id));
                setDeleteModal({ show: false, reward: null });
            }
        } catch (error) {
            console.error('Failed to delete reward:', error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Sovg'alar</h1>
                    <p className="text-muted mb-0">{rewards.length} ta sovg'a</p>
                </div>
                <Link href="/admin/rewards/add" className="btn btn-primary rounded-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined">add</span>
                    Yangi sovg'a
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : rewards.length === 0 ? (
                <div className="card border-0 rounded-4 shadow-sm">
                    <div className="card-body text-center py-5">
                        <span className="material-symbols-outlined mb-2 text-muted" style={{ fontSize: '48px' }}>redeem</span>
                        <p className="text-muted mb-3">Hali sovg'a qo'shilmagan</p>
                        <Link href="/admin/rewards/add" className="btn btn-primary rounded-3">
                            Birinchi sovg'ani qo'shish
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {rewards.map((reward) => (
                        <div key={reward._id} className="col-md-6 col-lg-4">
                            <div className={`card border-0 rounded-4 shadow-sm h-100 ${!reward.isActive ? 'opacity-50' : ''}`}>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div
                                            className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '64px',
                                                height: '64px',
                                                backgroundColor: '#f6f7f8'
                                            }}
                                        >
                                            {reward.image ? (
                                                <img src={reward.image} alt={reward.title} className="rounded-3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span className="material-symbols-outlined text-muted" style={{ fontSize: '32px' }}>redeem</span>
                                            )}
                                        </div>
                                        <span className={`badge rounded-pill ${categoryColors[reward.category] || 'bg-secondary'}`}>
                                            {categoryLabels[reward.category] || reward.category}
                                        </span>
                                    </div>

                                    <h3 className="h6 fw-bold mb-1">{reward.title}</h3>
                                    <p className="small text-muted mb-3 text-truncate">{reward.description || '—'}</p>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center gap-1">
                                            <span className="material-symbols-outlined filled text-warning" style={{ fontSize: '20px' }}>star</span>
                                            <span className="fw-bold">{reward.cost}</span>
                                        </div>
                                        <span className="small text-muted">
                                            {reward.stock === -1 ? 'Cheksiz' : `${reward.stock} ta qoldi`}
                                        </span>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Link
                                            href={`/admin/rewards/${reward._id}/edit`}
                                            className="btn btn-sm btn-outline-primary rounded-2 flex-grow-1"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                        </Link>
                                        <button
                                            onClick={() => handleToggleStatus(reward)}
                                            className={`btn btn-sm rounded-2 ${reward.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                                {reward.isActive ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ show: true, reward })}
                                            className="btn btn-sm btn-outline-danger rounded-2"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-body p-4 text-center">
                                <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                    style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2' }}>
                                    <span className="material-symbols-outlined text-danger" style={{ fontSize: '32px' }}>delete</span>
                                </div>
                                <h5 className="fw-bold mb-2">Sovg'ani o'chirish</h5>
                                <p className="text-muted mb-4">
                                    <strong>"{deleteModal.reward?.name || deleteModal.reward?.title}"</strong> sovg'asini o'chirmoqchimisiz?
                                    Bu amalni qaytarib bo'lmaydi.
                                </p>
                                <div className="d-flex gap-3 justify-content-center">
                                    <button
                                        onClick={() => setDeleteModal({ show: false, reward: null })}
                                        className="btn btn-light rounded-3 px-4 py-2"
                                        disabled={deleting}
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-danger rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                                        disabled={deleting}
                                    >
                                        {deleting ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                                        )}
                                        O'chirish
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
