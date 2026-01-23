'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ConfirmModal';
import AlertModal from '@/components/AlertModal';
import { formatPhone } from '@/lib/formatPhone';

export default function UsersPage() {
    const { getAuthHeader } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
    const [viewModal, setViewModal] = useState({ show: false, user: null });
    const [editModal, setEditModal] = useState({ show: false, user: null, loading: false });
    const [subscriptionModal, setSubscriptionModal] = useState({ show: false, user: null });
    const [studentsModal, setStudentsModal] = useState({ show: false, user: null, students: [], loading: false });
    const [deleting, setDeleting] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });
    const [activatingId, setActivatingId] = useState(null);
    const [selectedDays, setSelectedDays] = useState(30);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        password: '',
        role: 'teacher'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [copiedPassword, setCopiedPassword] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedPassword(true);
            setTimeout(() => setCopiedPassword(false), 2000);
        });
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/teachers', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.teachers || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const openViewModal = (user) => {
        setViewModal({ show: true, user });
    };

    const openEditModal = (user) => {
        setEditForm({
            name: user.name,
            phone: user.phone,
            password: '',
            role: user.role
        });
        setShowPassword(false);
        setEditModal({ show: true, user, loading: false });
    };

    const handleUpdateUser = async () => {
        const user = editModal.user;
        if (!user) return;

        if (!editForm.name.trim()) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Ism kiritilishi shart',
                type: 'danger'
            });
            return;
        }

        setEditModal(prev => ({ ...prev, loading: true }));
        try {
            const updateData = {
                name: editForm.name,
                phone: editForm.phone,
                role: editForm.role
            };
            
            if (editForm.password) {
                updateData.password = editForm.password;
            }

            const res = await fetch(`/api/teachers/${user._id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(updateData)
            });
            const data = await res.json();
            
            if (data.success) {
                const updatedUser = { ...user, ...updateData };
                if (data.user.plainPassword) {
                    updatedUser.plainPassword = data.user.plainPassword;
                }
                setUsers(users.map(u => u._id === user._id ? updatedUser : u));
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: 'Foydalanuvchi ma\'lumotlari yangilandi',
                    type: 'success'
                });
                setEditModal({ show: false, user: null, loading: false });
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Ma\'lumotlarni yangilashda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Ma\'lumotlarni yangilashda xatolik',
                type: 'danger'
            });
        } finally {
            setEditModal(prev => ({ ...prev, loading: false }));
        }
    };

    const openSubscriptionModal = (user) => {
        setSelectedDays(30);
        setSubscriptionModal({ show: true, user });
    };

    const openStudentsModal = async (user) => {
        if (user.role === 'admin') {
            setAlertModal({
                show: true,
                title: 'Ma\'lumot',
                message: 'Admin foydalanuvchilarda o\'quvchilar yo\'q',
                type: 'info'
            });
            return;
        }

        setStudentsModal({ show: true, user, students: [], loading: true });
        try {
            const res = await fetch(`/api/teachers/${user._id}/students`, {
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
        const user = subscriptionModal.user;
        if (!user) return;

        setActivatingId(user._id);
        try {
            const res = await fetch('/api/admin/subscription', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ userId: user._id, days: selectedDays })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh users to get updated subscription info
                await fetchUsers();
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: data.message || `${user.name} uchun ${selectedDays} kunlik obuna qo'shildi`,
                    type: 'success'
                });
                setSubscriptionModal({ show: false, user: null });
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
        const user = deleteModal.user;
        if (!user) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/teachers/${user._id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter(u => u._id !== user._id));
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: `${user.name} o'chirildi`,
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        } finally {
            setDeleting(false);
            setDeleteModal({ show: false, user: null });
        }
    };

    const getSubscriptionBadge = (user) => {
        const status = user.subscriptionStatus || 'trial';
        const daysRemaining = user.daysRemaining || 0;

        if (status === 'trial') {
            return (
                <span 
                    className="badge rounded-pill px-3 py-2"
                    style={{ 
                        fontSize: '11px',
                        backgroundColor: '#ff9500',
                        color: 'white',
                        fontWeight: '600'
                    }}
                >
                    Sinov: {daysRemaining} kun
                </span>
            );
        } else if (status === 'active') {
            return (
                <span 
                    className="badge rounded-pill px-3 py-2"
                    style={{ 
                        fontSize: '11px',
                        backgroundColor: '#34c759',
                        color: 'white',
                        fontWeight: '600'
                    }}
                >
                    Faol: {daysRemaining} kun
                </span>
            );
        } else {
            return (
                <span 
                    className="badge rounded-pill px-3 py-2"
                    style={{ 
                        fontSize: '11px',
                        backgroundColor: '#ff3b30',
                        color: 'white',
                        fontWeight: '600'
                    }}
                >
                    Tugagan
                </span>
            );
        }
    };

    const getSubscriptionColor = (user) => {
        const status = user.subscriptionStatus || 'trial';
        if (status === 'trial') return '#ff9500';
        if (status === 'active') return '#34c759';
        return '#ff3b30';
    };

    const getSubscriptionBgColor = (user) => {
        const status = user.subscriptionStatus || 'trial';
        if (status === 'trial') return '#fff3e0';
        if (status === 'active') return '#e8f5e9';
        return '#ffebee';
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.phone || '').includes(searchQuery);
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        teachers: users.filter(u => u.role === 'teacher').length
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-3">
                <h1 className="h4 fw-bold mb-1" style={{ color: '#1d1d1f' }}>Foydalanuvchilar</h1>
                <p className="mb-0" style={{ color: '#86868b', fontSize: '13px' }}>
                    {stats.total} ta foydalanuvchi
                </p>
            </div>

            {/* Stats Cards */}
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="card border-0 rounded-3 shadow-sm h-100" style={{ backgroundColor: 'white' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px', backgroundColor: '#007aff' }}>
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>group</span>
                                </div>
                                <div>
                                    <h3 className="h4 fw-bold mb-0" style={{ color: '#1d1d1f' }}>{stats.total}</h3>
                                    <p className="text-secondary mb-0" style={{ fontSize: '12px' }}>Jami foydalanuvchi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 rounded-3 shadow-sm h-100" style={{ backgroundColor: 'white' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px', backgroundColor: '#ff3b30' }}>
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>admin_panel_settings</span>
                                </div>
                                <div>
                                    <h3 className="h4 fw-bold mb-0" style={{ color: '#1d1d1f' }}>{stats.admins}</h3>
                                    <p className="text-secondary mb-0" style={{ fontSize: '12px' }}>Administrator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 rounded-3 shadow-sm h-100" style={{ backgroundColor: 'white' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px', backgroundColor: '#007aff' }}>
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>school</span>
                                </div>
                                <div>
                                    <h3 className="h4 fw-bold mb-0" style={{ color: '#1d1d1f' }}>{stats.teachers}</h3>
                                    <p className="text-secondary mb-0" style={{ fontSize: '12px' }}>O'qituvchi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 rounded-3 shadow-sm mb-3" style={{ backgroundColor: 'white' }}>
                <div className="card-body p-3">
                    <div className="row g-2">
                        <div className="col-md-8">
                            <label className="form-label small fw-semibold mb-1" style={{ color: '#86868b', fontSize: '11px' }}>Qidirish</label>
                            <div className="position-relative">
                                <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-2" style={{ fontSize: '18px', color: '#86868b' }}>search</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm rounded-3 ps-4 border-0"
                                    placeholder="Ism yoki telefon..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f', fontSize: '13px' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-semibold mb-1" style={{ color: '#86868b', fontSize: '11px' }}>Rol</label>
                            <select
                                className="form-select form-select-sm rounded-3 border-0"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f', fontSize: '13px' }}
                            >
                                <option value="all">Barchasi</option>
                                <option value="admin">Admin</option>
                                <option value="teacher">O'qituvchi</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users List - Horizontal Cards */}
            <div className="row g-2">
                {loading ? (
                    <div className="col-12">
                        <div className="text-center py-4">
                            <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: '#007aff' }}></div>
                            <p className="mt-2 mb-0" style={{ color: '#86868b', fontSize: '13px' }}>Yuklanmoqda...</p>
                        </div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="col-12">
                        <div className="text-center py-4">
                            <div className="mb-2" style={{ fontSize: '48px' }}>👥</div>
                            <h6 className="fw-bold mb-1" style={{ color: '#1d1d1f' }}>Foydalanuvchi topilmadi</h6>
                            <p className="mb-0 small" style={{ color: '#86868b' }}>Qidiruv natijasi bo'yicha hech narsa topilmadi</p>
                        </div>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user._id} className="col-12">
                            <div className="card border-0 rounded-3 shadow-sm" style={{ backgroundColor: 'white' }}>
                                <div className="card-body p-2">
                                    <div className="row align-items-center g-2">
                                        {/* Avatar & Name */}
                                        <div className="col-12 col-md-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="rounded-circle flex-shrink-0"
                                                    style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${user.role === 'admin' ? 'ff3b30' : '007aff'}&color=fff&bold=true&size=88')`,
                                                        backgroundSize: 'cover'
                                                    }}
                                                />
                                                <div className="flex-grow-1 min-w-0">
                                                    <h6 className="fw-bold mb-0 text-truncate" style={{ color: '#1d1d1f', fontSize: '14px' }}>{user.name}</h6>
                                                    <p className="small mb-0 text-truncate" style={{ color: '#86868b', fontSize: '12px' }}>{formatPhone(user.phone)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Role Badge */}
                                        <div className="col-6 col-md-2">
                                            <div className="text-center text-md-start">
                                                <span 
                                                    className="badge rounded-pill px-2 py-1"
                                                    style={{ 
                                                        fontSize: '10px',
                                                        backgroundColor: user.role === 'admin' ? '#ff3b30' : '#007aff',
                                                        color: 'white',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    {user.role === 'admin' ? 'Admin' : 'O\'qituvchi'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Students Count */}
                                        <div className="col-6 col-md-2">
                                            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                                                <button
                                                    onClick={() => openStudentsModal(user)}
                                                    className="btn btn-sm rounded-circle p-0 border-0"
                                                    style={{ width: '32px', height: '32px', backgroundColor: '#e3f2fd' }}
                                                    title="O'quvchilarni ko'rish"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2196f3' }}>school</span>
                                                </button>
                                                <div>
                                                    <p className="fw-bold mb-0" style={{ fontSize: '14px', color: '#1d1d1f' }}>{user.studentCount || 0}</p>
                                                    <p className="small mb-0" style={{ color: '#86868b', fontSize: '10px' }}>O'quvchi</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subscription */}
                                        <div className="col-6 col-md-2">
                                            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: getSubscriptionBgColor(user) }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: getSubscriptionColor(user) }}>calendar_today</span>
                                                </div>
                                                <div>
                                                    <p className="fw-bold mb-0" style={{ fontSize: '14px', color: '#1d1d1f' }}>{user.daysRemaining || 0}</p>
                                                    <p className="small mb-0" style={{ color: '#86868b', fontSize: '10px' }}>Kun qoldi</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-6 col-md-3">
                                            <div className="d-flex gap-1 justify-content-end">
                                                <button
                                                    onClick={() => openViewModal(user)}
                                                    className="btn btn-sm rounded-3 d-flex align-items-center gap-1"
                                                    style={{ 
                                                        backgroundColor: '#f5f5f7',
                                                        border: 'none',
                                                        color: '#007aff',
                                                        padding: '6px 10px',
                                                        fontSize: '12px'
                                                    }}
                                                    title="Ko'rish"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                                                    <span className="d-none d-lg-inline">Ko'rish</span>
                                                </button>
                                                <button
                                                    onClick={() => openSubscriptionModal(user)}
                                                    className="btn btn-sm rounded-3"
                                                    style={{ 
                                                        backgroundColor: '#34c759',
                                                        border: 'none',
                                                        color: 'white',
                                                        padding: '6px 10px'
                                                    }}
                                                    title="Obuna"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_card</span>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ show: true, user })}
                                                    className="btn btn-sm rounded-3"
                                                    style={{ 
                                                        backgroundColor: '#ff3b30',
                                                        border: 'none',
                                                        color: 'white',
                                                        padding: '6px 10px'
                                                    }}
                                                    title="O'chirish"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View User Modal */}
            {viewModal.show && viewModal.user && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-3 border-0">
                            <div className="modal-header border-0 pb-2">
                                <h6 className="modal-title fw-bold mb-0">Foydalanuvchi ma'lumotlari</h6>
                                <button
                                    type="button"
                                    className="btn-close btn-close-sm"
                                    onClick={() => setViewModal({ show: false, user: null })}
                                ></button>
                            </div>
                            <div className="modal-body py-3">
                                <div className="text-center mb-3">
                                    <div
                                        className="rounded-circle mx-auto mb-2"
                                        style={{
                                            width: '70px',
                                            height: '70px',
                                            backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(viewModal.user.name)}&background=${viewModal.user.role === 'admin' ? 'ff3b30' : '007aff'}&color=fff&bold=true&size=140')`,
                                            backgroundSize: 'cover'
                                        }}
                                    />
                                    <h6 className="fw-bold mb-1">{viewModal.user.name}</h6>
                                    {getSubscriptionBadge(viewModal.user)}
                                </div>

                                <div className="row g-2">
                                    <div className="col-6">
                                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f5f5f7' }}>
                                            <div className="d-flex align-items-center gap-1 mb-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#007aff' }}>phone</span>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>Telefon</small>
                                            </div>
                                            <p className="fw-semibold mb-0" style={{ fontSize: '12px' }}>{formatPhone(viewModal.user.phone)}</p>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f5f5f7' }}>
                                            <div className="d-flex align-items-center gap-1 mb-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#007aff' }}>badge</span>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>Rol</small>
                                            </div>
                                            <p className="fw-semibold mb-0" style={{ fontSize: '12px' }}>{viewModal.user.role === 'admin' ? 'Administrator' : 'O\'qituvchi'}</p>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f5f5f7' }}>
                                            <div className="d-flex align-items-center gap-1 mb-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#007aff' }}>school</span>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>O'quvchilar</small>
                                            </div>
                                            <p className="fw-semibold mb-0" style={{ fontSize: '12px' }}>{viewModal.user.studentCount || 0} ta</p>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f5f5f7' }}>
                                            <div className="d-flex align-items-center gap-1 mb-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#007aff' }}>calendar_today</span>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>Ro'yxatdan o'tgan</small>
                                            </div>
                                            <p className="fw-semibold mb-0" style={{ fontSize: '12px' }}>{new Date(viewModal.user.createdAt).toLocaleDateString('uz-UZ')}</p>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="p-2 rounded-3 position-relative" style={{ backgroundColor: '#fff3e0' }}>
                                            <div className="d-flex align-items-center justify-content-between mb-1">
                                                <div className="d-flex align-items-center gap-1">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ff9500' }}>lock</span>
                                                    <small className="text-muted" style={{ fontSize: '10px' }}>Parol</small>
                                                </div>
                                                <button
                                                    className="btn btn-sm p-0 border-0"
                                                    onClick={() => copyToClipboard(viewModal.user.plainPassword || viewModal.user.phone)}
                                                    title="Parolni nusxalash"
                                                    style={{ backgroundColor: 'transparent' }}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: copiedPassword ? '#34c759' : '#ff9500' }}>
                                                        {copiedPassword ? 'check' : 'content_copy'}
                                                    </span>
                                                </button>
                                            </div>
                                            <p className="fw-semibold mb-0" style={{ fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                {viewModal.user.plainPassword || viewModal.user.phone}
                                            </p>
                                            <small className="text-muted" style={{ fontSize: '9px' }}>
                                                {viewModal.user.plainPassword ? 'Foydalanuvchi paroli' : 'Default parol (telefon raqami)'}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0 pb-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-light rounded-3"
                                    onClick={() => setViewModal({ show: false, user: null })}
                                    style={{ fontSize: '12px' }}
                                >
                                    Yopish
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary rounded-3 d-flex align-items-center gap-1"
                                    onClick={() => {
                                        setViewModal({ show: false, user: null });
                                        openEditModal(viewModal.user);
                                    }}
                                    style={{ fontSize: '12px' }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                                    Tahrirlash
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editModal.show && editModal.user && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content rounded-3 border-0">
                            <div className="modal-header border-0 pb-2">
                                <h6 className="modal-title fw-bold mb-0">Foydalanuvchini tahrirlash</h6>
                                <button
                                    type="button"
                                    className="btn-close btn-close-sm"
                                    onClick={() => setEditModal({ show: false, user: null, loading: false })}
                                ></button>
                            </div>
                            <div className="modal-body py-3">
                                <div className="mb-2">
                                    <label className="form-label small fw-semibold mb-1" style={{ fontSize: '11px' }}>Ism</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm rounded-3 border-0"
                                        style={{ backgroundColor: '#f5f5f7', fontSize: '13px' }}
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Ism kiriting"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-semibold mb-1" style={{ fontSize: '11px' }}>Telefon</label>
                                    <input
                                        type="tel"
                                        className="form-control form-control-sm rounded-3 border-0"
                                        style={{ backgroundColor: '#f5f5f7', fontSize: '13px' }}
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        placeholder="+998901234567"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-semibold mb-1" style={{ fontSize: '11px' }}>Rol</label>
                                    <select
                                        className="form-select form-select-sm rounded-3 border-0"
                                        style={{ backgroundColor: '#f5f5f7', fontSize: '13px' }}
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    >
                                        <option value="teacher">O'qituvchi</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-semibold mb-1" style={{ fontSize: '11px' }}>Yangi parol (ixtiyoriy)</label>
                                    <div className="input-group input-group-sm">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control rounded-start-3 border-0"
                                            style={{ backgroundColor: '#f5f5f7', fontSize: '13px' }}
                                            value={editForm.password}
                                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                            placeholder="Bo'sh qoldiring agar o'zgartirmasangiz"
                                        />
                                        <button
                                            className="btn border-0 rounded-end-3"
                                            type="button"
                                            style={{ backgroundColor: '#f5f5f7' }}
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#86868b' }}>
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                    <small className="text-muted" style={{ fontSize: '10px' }}>Parolni o'zgartirmaslik uchun bo'sh qoldiring</small>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0 pb-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-light rounded-3"
                                    onClick={() => setEditModal({ show: false, user: null, loading: false })}
                                    disabled={editModal.loading}
                                    style={{ fontSize: '12px' }}
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary rounded-3 d-flex align-items-center gap-1"
                                    onClick={handleUpdateUser}
                                    disabled={editModal.loading}
                                    style={{ fontSize: '12px' }}
                                >
                                    {editModal.loading ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                                    )}
                                    Saqlash
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    onClick={() => setSubscriptionModal({ show: false, user: null })}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted mb-3">
                                    <strong>{subscriptionModal.user?.name}</strong> uchun obuna muddatini kiriting:
                                </p>

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

                                <p className="small text-muted mb-2">Tezkor tanlash:</p>
                                <div className="d-flex flex-wrap gap-2">
                                    {[1, 3, 7, 15, 20, 30, 60, 90, 180, 365].map(days => (
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
                                    onClick={() => setSubscriptionModal({ show: false, user: null })}
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
                                    {studentsModal.user?.name} ning o'quvchilari
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setStudentsModal({ show: false, user: null, students: [], loading: false })}
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
                                                            <div className="col-6">
                                                                <div className="bg-warning bg-opacity-10 rounded-3 p-2">
                                                                    <span className="material-symbols-outlined filled text-warning" style={{ fontSize: '20px' }}>star</span>
                                                                    <p className="fw-bold mb-0 small">{student.stars || 0}</p>
                                                                    <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Yulduz</p>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="bg-success bg-opacity-10 rounded-3 p-2">
                                                                    <span className="material-symbols-outlined text-success" style={{ fontSize: '20px' }}>task_alt</span>
                                                                    <p className="fw-bold mb-0 small">{student.completedLessons || 0}</p>
                                                                    <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Dars</p>
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
                                    onClick={() => setStudentsModal({ show: false, user: null, students: [], loading: false })}
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
                onClose={() => setDeleteModal({ show: false, user: null })}
                onConfirm={handleDelete}
                title="Foydalanuvchini o'chirish"
                message={`${deleteModal.user?.name} ni o'chirmoqchimisiz? ${deleteModal.user?.role === 'teacher' ? 'Bu barcha o\'quvchilarini ham o\'chiradi.' : ''}`}
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
