'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import AlertModal from '@/components/AlertModal';
import { formatPhone } from '@/lib/formatPhone';

export default function TeachersPage() {
    const { getAuthHeader } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, teacher: null });
    const [subscriptionModal, setSubscriptionModal] = useState({ show: false, teacher: null });
    const [studentsModal, setStudentsModal] = useState({ show: false, teacher: null, students: [], loading: false });
    const [deleting, setDeleting] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });
    const [activatingId, setActivatingId] = useState(null);
    const [selectedDays, setSelectedDays] = useState(30);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/teachers', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setTeachers(data.teachers || []);
            }
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (teacher) => {
        try {
            const res = await fetch(`/api/teachers/${teacher._id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ isActive: !teacher.isActive })
            });
            const data = await res.json();
            if (data.success) {
                setTeachers(teachers.map(t =>
                    t._id === teacher._id ? { ...t, isActive: !t.isActive } : t
                ));
            }
        } catch (error) {
            console.error('Failed to update teacher:', error);
        }
    };

    const openSubscriptionModal = (teacher) => {
        setSelectedDays(30);
        setSubscriptionModal({ show: true, teacher });
    };

    const openStudentsModal = async (teacher) => {
        setStudentsModal({ show: true, teacher, students: [], loading: true });
        try {
            const res = await fetch(`/api/teachers/${teacher._id}/students`, {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setStudentsModal(prev => ({ ...prev, students: data.students || [], loading: false }));
            } else {
                setStudentsModal(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudentsModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleActivateSubscription = async () => {
        const teacher = subscriptionModal.teacher;
        if (!teacher) return;

        setActivatingId(teacher._id);
        try {
            const res = await fetch('/api/subscription/activate', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ userId: teacher._id, days: selectedDays })
            });
            const data = await res.json();
            if (data.success) {
                setTeachers(teachers.map(t =>
                    t._id === teacher._id ? {
                        ...t,
                        subscriptionStatus: 'active',
                        subscriptionEndDate: data.subscriptionEndDate,
                        daysRemaining: selectedDays
                    } : t
                ));
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: `${teacher.name} uchun ${selectedDays} kunlik obuna faollashtirildi`,
                    type: 'success'
                });
                setSubscriptionModal({ show: false, teacher: null });
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Obunani faollashtirishda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Failed to activate subscription:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Obunani faollashtirishda xatolik',
                type: 'danger'
            });
        } finally {
            setActivatingId(null);
        }
    };

    const handleDelete = async () => {
        const teacher = deleteModal.teacher;
        if (!teacher) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/teachers/${teacher._id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setTeachers(teachers.filter(t => t._id !== teacher._id));
            }
        } catch (error) {
            console.error('Failed to delete teacher:', error);
        } finally {
            setDeleting(false);
            setDeleteModal({ show: false, teacher: null });
        }
    };

    const getSubscriptionBadge = (teacher) => {
        const status = teacher.subscriptionStatus || 'trial';
        const daysRemaining = teacher.daysRemaining || 0;

        if (status === 'trial') {
            return (
                <span className="badge bg-info rounded-pill">
                    Sinov: {daysRemaining} kun
                </span>
            );
        } else if (status === 'active') {
            return (
                <span className="badge bg-success rounded-pill">
                    Faol: {daysRemaining} kun
                </span>
            );
        } else {
            return (
                <span className="badge bg-danger rounded-pill">
                    Tugagan
                </span>
            );
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.phone || '').includes(searchQuery)
    );

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Foydalanuvchilar</h1>
                    <p className="text-muted mb-0">{teachers.length} ta foydalanuvchi</p>
                </div>
                <Link href="/admin/teachers/add" className="btn btn-primary rounded-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined">add</span>
                    Yangi qo'shish
                </Link>
            </div>

            {/* Search */}
            <div className="card border-0 rounded-4 shadow-sm mb-4">
                <div className="card-body p-3">
                    <div className="position-relative">
                        <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">search</span>
                        <input
                            type="text"
                            className="form-control rounded-3 ps-5 border-0 bg-light"
                            placeholder="O'qituvchi qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Teachers Table */}
            <div className="card border-0 rounded-4 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : filteredTeachers.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <span className="material-symbols-outlined mb-2" style={{ fontSize: '48px' }}>person_off</span>
                            <p>O'qituvchi topilmadi</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-4 py-3">Foydalanuvchi</th>
                                        <th className="border-0 py-3">Telefon</th>
                                        <th className="border-0 py-3">Rol</th>
                                        <th className="border-0 py-3">O'quvchilar</th>
                                        <th className="border-0 py-3">Obuna</th>
                                        <th className="border-0 py-3">Holat</th>
                                        <th className="border-0 pe-4 py-3 text-end">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeachers.map((teacher) => (
                                        <tr key={teacher._id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="rounded-circle"
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=2b8cee&color=fff')`,
                                                            backgroundSize: 'cover'
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="fw-semibold mb-0">{teacher.name}</p>
                                                        <p className="small text-muted mb-0">
                                                            {new Date(teacher.createdAt).toLocaleDateString('uz-UZ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">{formatPhone(teacher.phone)}</td>
                                            <td className="py-3">
                                                <span className={`badge rounded-pill ${teacher.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                    {teacher.role === 'admin' ? 'Admin' : 'O\'qituvchi'}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <button
                                                    onClick={() => openStudentsModal(teacher)}
                                                    className="btn btn-sm btn-link text-primary p-0 text-decoration-none"
                                                >
                                                    <span className="badge bg-primary rounded-pill">{teacher.studentCount || 0}</span>
                                                    <span className="material-symbols-outlined ms-1" style={{ fontSize: '14px', verticalAlign: 'middle' }}>visibility</span>
                                                </button>
                                            </td>
                                            <td className="py-3">
                                                {getSubscriptionBadge(teacher)}
                                            </td>
                                            <td className="py-3">
                                                <span className={`badge rounded-pill ${teacher.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                    {teacher.isActive ? 'Faol' : 'Nofaol'}
                                                </span>
                                            </td>
                                            <td className="pe-4 py-3 text-end">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    <button
                                                        onClick={() => openSubscriptionModal(teacher)}
                                                        className="btn btn-sm btn-outline-primary rounded-2"
                                                        title="Obuna berish"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_card</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(teacher)}
                                                        className={`btn btn-sm rounded-2 ${teacher.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                        title={teacher.isActive ? 'Bloklash' : 'Faollashtirish'}
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                                            {teacher.isActive ? 'block' : 'check_circle'}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ show: true, teacher })}
                                                        className="btn btn-sm btn-outline-danger rounded-2"
                                                        title="O'chirish"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Subscription Modal */}
            {subscriptionModal.show && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Obuna berish</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSubscriptionModal({ show: false, teacher: null })}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted mb-3">
                                    <strong>{subscriptionModal.teacher?.name}</strong> uchun obuna muddatini kiriting:
                                </p>

                                {/* Custom days input */}
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Kun soni</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control form-control-lg border-0 bg-light text-center fw-bold"
                                            value={selectedDays}
                                            onChange={(e) => setSelectedDays(Math.max(1, parseInt(e.target.value) || 1))}
                                            min={1}
                                            style={{ fontSize: '24px' }}
                                        />
                                        <span className="input-group-text bg-light border-0 fw-semibold">kun</span>
                                    </div>
                                </div>

                                {/* Quick select buttons */}
                                <p className="small text-muted mb-2">Tezkor tanlash:</p>
                                <div className="d-flex flex-wrap gap-2">
                                    {[1, 3, 7, 15, 20, 30, 60, 90].map(days => (
                                        <button
                                            key={days}
                                            onClick={() => setSelectedDays(days)}
                                            className={`btn btn-sm rounded-pill px-3 ${selectedDays === days ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        >
                                            {days} kun
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-3"
                                    onClick={() => setSubscriptionModal({ show: false, teacher: null })}
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-3 d-flex align-items-center gap-2"
                                    onClick={handleActivateSubscription}
                                    disabled={activatingId || selectedDays < 1}
                                >
                                    {activatingId ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                                    )}
                                    {selectedDays} kun faollashtirish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Students Modal */}
            {studentsModal.show && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">school</span>
                                    {studentsModal.teacher?.name} ning o'quvchilari
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setStudentsModal({ show: false, teacher: null, students: [], loading: false })}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {studentsModal.loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary"></div>
                                    </div>
                                ) : studentsModal.students.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <span className="material-symbols-outlined mb-2" style={{ fontSize: '48px' }}>person_off</span>
                                        <p>Bu o'qituvchida o'quvchi yo'q</p>
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {studentsModal.students.map((student) => (
                                            <div key={student._id} className="col-12 col-md-6">
                                                <div className="card border rounded-3 h-100">
                                                    <div className="card-body p-3">
                                                        <div className="d-flex align-items-center gap-3 mb-3">
                                                            <div
                                                                className="rounded-circle d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: '50px',
                                                                    height: '50px',
                                                                    backgroundColor: '#E0F2FE',
                                                                    fontSize: '24px'
                                                                }}
                                                            >
                                                                {student.avatar || '👦'}
                                                            </div>
                                                            <div>
                                                                <h6 className="fw-bold mb-0">{student.name}</h6>
                                                                <small className="text-muted">{student.age} yosh</small>
                                                            </div>
                                                        </div>
                                                        <div className="row g-2 text-center">
                                                            <div className="col-3">
                                                                <div className="bg-warning bg-opacity-10 rounded-3 p-2">
                                                                    <span className="material-symbols-outlined filled text-warning" style={{ fontSize: '20px' }}>star</span>
                                                                    <p className="fw-bold mb-0 small">{student.stars || 0}</p>
                                                                    <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Yulduz</p>
                                                                </div>
                                                            </div>
                                                            <div className="col-3">
                                                                <div className="bg-success bg-opacity-10 rounded-3 p-2">
                                                                    <span className="material-symbols-outlined text-success" style={{ fontSize: '20px' }}>task_alt</span>
                                                                    <p className="fw-bold mb-0 small">{student.completedLessons || 0}</p>
                                                                    <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Dars</p>
                                                                </div>
                                                            </div>
                                                            <div className="col-3">
                                                                <div className="bg-primary bg-opacity-10 rounded-3 p-2">
                                                                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>sports_esports</span>
                                                                    <p className="fw-bold mb-0 small">{student.gamesWon || 0}</p>
                                                                    <p className="text-muted mb-0" style={{ fontSize: '10px' }}>O'yin</p>
                                                                </div>
                                                            </div>
                                                            <div className="col-3">
                                                                <div className="bg-info bg-opacity-10 rounded-3 p-2">
                                                                    <span className="material-symbols-outlined text-info" style={{ fontSize: '20px' }}>emoji_events</span>
                                                                    <p className="fw-bold mb-0 small">{student.totalStarsEarned || 0}</p>
                                                                    <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Ball</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-3"
                                    onClick={() => setStudentsModal({ show: false, teacher: null, students: [], loading: false })}
                                >
                                    Yopish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, teacher: null })}
                onConfirm={handleDelete}
                title="O'qituvchini o'chirish"
                message={`${deleteModal.teacher?.name} ni o'chirmoqchimisiz? Bu barcha o'quvchilarini ham o'chiradi.`}
                confirmText="O'chirish"
                type="danger"
                loading={deleting}
            />

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
