'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/dashboard/Header';
import ConfirmModal from '@/components/ConfirmModal';
import AlertModal from '@/components/AlertModal';
import { Star, ShoppingCart, X, Plus, Minus, Trash2, Gift, Eye, Ban, Check, ShoppingBag } from 'lucide-react';

const categoryColors = {
    toy: '#fce7f3',
    book: '#dbeafe',
    game: '#dcfce7',
    certificate: '#fef3c7',
    other: '#f1f5f9'
};

const categoryIcons = {
    toy: '🧸',
    book: '📚',
    game: '🎮',
    certificate: '🏆',
    other: '🎁'
};

export default function RewardsPage() {
    const { rewards, dashboard, initialLoading, students, refreshStudents, refreshDashboard } = useData();
    const { getAuthHeader } = useAuth();

    // Cart state
    const [cart, setCart] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [showCart, setShowCart] = useState(false);

    // Modal states
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });
    const [processing, setProcessing] = useState(false);

    // Reward detail modal
    const [selectedReward, setSelectedReward] = useState(null);
    const [rewardQuantity, setRewardQuantity] = useState(1);
    const [quickStudent, setQuickStudent] = useState('');

    // Add to cart
    const addToCart = (reward) => {
        const existingItem = cart.find(item => item._id === reward._id);
        if (existingItem) {
            // Check stock
            if (reward.stock !== -1 && existingItem.quantity >= reward.stock) {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: `Bu sovg'adan faqat ${reward.stock} ta qolgan`,
                    type: 'error'
                });
                return;
            }
            setCart(cart.map(item =>
                item._id === reward._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...reward, quantity: 1 }]);
        }
    };

    // Remove from cart
    const removeFromCart = (rewardId) => {
        setCart(cart.filter(item => item._id !== rewardId));
    };

    // Update quantity
    const updateQuantity = (rewardId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(rewardId);
            return;
        }
        const reward = rewards.find(r => r._id === rewardId);
        if (reward && reward.stock !== -1 && newQuantity > reward.stock) {
            return;
        }
        setCart(cart.map(item =>
            item._id === rewardId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    // Calculate total
    const cartTotal = cart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Get item quantity in cart
    const getCartQuantity = (rewardId) => {
        const item = cart.find(i => i._id === rewardId);
        return item ? item.quantity : 0;
    };

    // Open reward detail modal
    const openRewardModal = (reward) => {
        setSelectedReward(reward);
        setRewardQuantity(1);
        setQuickStudent('');
    };

    // Add to cart from modal
    const addToCartFromModal = () => {
        for (let i = 0; i < rewardQuantity; i++) {
            addToCart(selectedReward);
        }
        setSelectedReward(null);
        setAlertModal({
            show: true,
            title: 'Savatga qo\'shildi',
            message: `${selectedReward.title} (${rewardQuantity} ta) savatga qo'shildi`,
            type: 'success'
        });
    };

    // Quick buy from modal
    const quickBuy = async () => {
        if (!quickStudent) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: "Iltimos, o'quvchini tanlang",
                type: 'error'
            });
            return;
        }

        const student = students.find(s => s._id === quickStudent);
        if (!student) return;

        const totalCost = selectedReward.cost * rewardQuantity;

        if (student.stars < totalCost) {
            setAlertModal({
                show: true,
                title: 'Yetarli yulduz yo\'q',
                message: `${student.name}da ${student.stars} ta yulduz bor, lekin ${totalCost} ta kerak`,
                type: 'error'
            });
            return;
        }

        setProcessing(true);

        try {
            const response = await fetch('/api/redemptions', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    studentId: quickStudent,
                    items: [{
                        rewardId: selectedReward._id,
                        quantity: rewardQuantity
                    }]
                })
            });

            const data = await response.json();

            if (data.success) {
                setSelectedReward(null);
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli!',
                    message: `${student.name}ga "${selectedReward.title}" sovg'asi berildi!`,
                    type: 'success'
                });
                refreshStudents();
                refreshDashboard();
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Xatolik yuz berdi',
                    type: 'error'
                });
            }
        } catch (error) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Server bilan bog\'lanishda xatolik',
                type: 'error'
            });
        } finally {
            setProcessing(false);
        }
    };

    // Checkout
    const handleCheckout = () => {
        if (!selectedStudent) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: "Iltimos, o'quvchini tanlang",
                type: 'error'
            });
            return;
        }

        const student = students.find(s => s._id === selectedStudent);
        if (!student) return;

        if (student.stars < cartTotal) {
            setAlertModal({
                show: true,
                title: 'Yetarli yulduz yo\'q',
                message: `${student.name}da ${student.stars} ta yulduz bor, lekin ${cartTotal} ta kerak`,
                type: 'error'
            });
            return;
        }

        setConfirmModal({
            show: true,
            title: 'Sovg\'alarni tasdiqlash',
            message: `${student.name}ga ${cartItemsCount} ta sovg'a beriladi. Jami: ${cartTotal} yulduz. Tasdiqlaysizmi?`,
            onConfirm: processCheckout
        });
    };

    const processCheckout = async () => {
        setProcessing(true);
        setConfirmModal({ ...confirmModal, show: false });

        try {
            const response = await fetch('/api/redemptions', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    studentId: selectedStudent,
                    items: cart.map(item => ({
                        rewardId: item._id,
                        quantity: item.quantity
                    }))
                })
            });

            const data = await response.json();

            if (data.success) {
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli!',
                    message: `Sovg'alar muvaffaqiyatli berildi!`,
                    type: 'success'
                });
                setCart([]);
                setSelectedStudent('');
                setShowCart(false);
                refreshStudents();
                refreshDashboard();
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Xatolik yuz berdi',
                    type: 'error'
                });
            }
        } catch (error) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Server bilan bog\'lanishda xatolik',
                type: 'error'
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="page-content">
            <Header title="Sovg'alar Do'koni" />

            <main className="p-3">
                {/* Stars Wallet */}
                <div className="card border-0 rounded-4 mb-4 overflow-hidden position-relative" style={{ background: 'linear-gradient(135deg, #2b8cee 0%, #1e40af 100%)' }}>
                    <div className="position-absolute top-0 end-0" style={{ marginTop: '-1rem', marginRight: '-1rem', opacity: 0.1 }}>
                        <Star size={140} fill="white" color="white" style={{ opacity: 0.1 }} />
                    </div>
                    <div className="card-body p-4 text-white text-center position-relative" style={{ zIndex: 1 }}>
                        <p className="small opacity-75 text-uppercase mb-1" style={{ letterSpacing: '0.1em' }}>Jami yulduzlar</p>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            <Star size={40} fill="#fbbf24" className="text-warning" />
                            <h1 className="display-4 fw-bold mb-0">{initialLoading ? '-' : dashboard.totalStars.toLocaleString()}</h1>
                        </div>
                    </div>
                </div>

                {initialLoading && (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {!initialLoading && (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h6 fw-bold mb-0">Mavjud sovg'alar</h3>

                            {/* Cart Button */}
                            <button
                                className="btn btn-primary rounded-pill d-flex align-items-center gap-2 position-relative"
                                onClick={() => setShowCart(true)}
                            >
                                <ShoppingCart size={20} />
                                <span className="d-none d-sm-inline">Savatcha</span>
                                {cartItemsCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="row g-3">
                            {rewards.map((reward) => {
                                const inCart = getCartQuantity(reward._id);
                                const isOutOfStock = reward.stock === 0;

                                return (
                                    <div key={reward._id} className="col-6 col-lg-4">
                                        <div
                                            className={`card border rounded-4 h-100 ${isOutOfStock ? 'opacity-50' : 'lesson-card'}`}
                                            style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                                            onClick={() => !isOutOfStock && openRewardModal(reward)}
                                        >
                                            <div className="card-body p-3 d-flex flex-column">
                                                <div
                                                    className="rounded-4 mb-3 d-flex align-items-center justify-content-center position-relative"
                                                    style={{
                                                        aspectRatio: '1',
                                                        backgroundColor: categoryColors[reward.category] || '#f1f5f9'
                                                    }}
                                                >
                                                    {reward.image ? (
                                                        <img src={reward.image} alt={reward.title} className="w-75 h-75" style={{ objectFit: 'contain' }} />
                                                    ) : (
                                                        <span style={{ fontSize: '64px' }}>{categoryIcons[reward.category] || '🎁'}</span>
                                                    )}

                                                    {/* Stock badge */}
                                                    {reward.stock !== -1 && (
                                                        <span
                                                            className={`position-absolute top-0 end-0 m-2 badge rounded-pill ${reward.stock <= 5 ? 'bg-danger' : 'bg-secondary'}`}
                                                            style={{ fontSize: '10px' }}
                                                        >
                                                            {reward.stock === 0 ? 'Tugadi' : `${reward.stock} ta`}
                                                        </span>
                                                    )}

                                                    {/* In cart badge */}
                                                    {inCart > 0 && (
                                                        <span className="position-absolute top-0 start-0 m-2 badge rounded-pill bg-primary" style={{ fontSize: '10px' }}>
                                                            Savatda: {inCart}
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className="fw-bold mb-1" style={{ fontSize: '15px' }}>{reward.title}</h4>
                                                {reward.description && (
                                                    <p className="small text-muted mb-2" style={{ fontSize: '12px' }}>{reward.description}</p>
                                                )}

                                                {/* Price */}
                                                <div className="d-flex align-items-center gap-1 mb-3">
                                                    <Star size={20} fill="#fbbf24" className="text-warning" />
                                                    <span className="fw-bold text-dark" style={{ fontSize: '18px' }}>{reward.cost}</span>
                                                    <span className="text-muted small">yulduz</span>
                                                </div>

                                                {/* View button */}
                                                <button
                                                    className={`btn ${inCart > 0 ? 'btn-success' : 'btn-outline-primary'} rounded-3 py-2 mt-auto d-flex align-items-center justify-content-center gap-2 fw-semibold`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isOutOfStock) openRewardModal(reward);
                                                    }}
                                                    disabled={isOutOfStock}
                                                >
                                                    {isOutOfStock ? <Ban size={18} /> : inCart > 0 ? <Check size={18} /> : <Eye size={18} />}
                                                    {isOutOfStock ? 'Tugagan' : inCart > 0 ? `Savatda (${inCart})` : 'Ko\'rish'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {rewards.length === 0 && (
                                <div className="col-12 text-center py-5">
                                    <Gift size={64} className="text-muted mb-3" />
                                    <p className="text-muted">Hozircha sovg'alar yo'q</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Cart Sidebar */}
            {showCart && (
                <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050 }}>
                    {/* Backdrop */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                        onClick={() => setShowCart(false)}
                    />

                    {/* Cart Panel */}
                    <div
                        className="position-absolute top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column"
                        style={{ width: '100%', maxWidth: '400px' }}
                    >
                        {/* Header */}
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Savatcha ({cartItemsCount})</h5>
                            <button className="btn btn-link text-dark p-0" onClick={() => setShowCart(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Student Select */}
                        <div className="p-3 border-bottom bg-light">
                            <label className="form-label small fw-semibold mb-2">O'quvchini tanlang</label>
                            <select
                                className="form-select rounded-3"
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                            >
                                <option value="">-- Tanlang --</option>
                                {students.map(student => (
                                    <option key={student._id} value={student._id}>
                                        {student.name} ({student.stars} ⭐)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-grow-1 overflow-auto p-3">
                            {cart.length === 0 ? (
                                <div className="text-center py-5">
                                    <ShoppingCart size={48} className="text-muted mb-2" />
                                    <p className="text-muted">Savatcha bo'sh</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {cart.map(item => (
                                        <div key={item._id} className="card border rounded-3">
                                            <div className="card-body p-3">
                                                <div className="d-flex gap-3">
                                                    <div
                                                        className="rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            backgroundColor: categoryColors[item.category] || '#f1f5f9'
                                                        }}
                                                    >
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.title} className="w-75 h-75" style={{ objectFit: 'contain' }} />
                                                        ) : (
                                                            <span style={{ fontSize: '28px' }}>{categoryIcons[item.category] || '🎁'}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="fw-bold mb-1" style={{ fontSize: '14px' }}>{item.title}</h6>
                                                        <div className="d-flex align-items-center gap-1 mb-2">
                                                            <Star size={14} fill="#fbbf24" className="text-warning" />
                                                            <span className="fw-semibold small">{item.cost} x {item.quantity} = {item.cost * item.quantity}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                                style={{ width: '28px', height: '28px' }}
                                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <span className="fw-bold">{item.quantity}</span>
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                                style={{ width: '28px', height: '28px' }}
                                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger ms-auto rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                                style={{ width: '28px', height: '28px' }}
                                                                onClick={() => removeFromCart(item._id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-4 border-top bg-white">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="fw-semibold">Jami:</span>
                                    <div className="d-flex align-items-center gap-1">
                                        <Star size={24} fill="#fbbf24" className="text-warning" />
                                        <span className="fw-bold h4 mb-0">{cartTotal}</span>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary w-100 rounded-3 py-3 fw-bold"
                                    onClick={handleCheckout}
                                    disabled={processing || cart.length === 0}
                                >
                                    {processing ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        <>
                                            <Gift size={20} className="me-2" />
                                            Sovg'a berish
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reward Detail Modal */}
            {selectedReward && (
                <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1060 }}>
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                        onClick={() => setSelectedReward(null)}
                    />
                    <div className="position-absolute top-50 start-50 translate-middle" style={{ width: '90%', maxWidth: '450px' }}>
                        <div className="card border-0 rounded-4 shadow-lg overflow-hidden">
                            {/* Header with image */}
                            <div
                                className="p-4 d-flex align-items-center justify-content-center position-relative"
                                style={{
                                    backgroundColor: categoryColors[selectedReward.category] || '#f1f5f9',
                                    minHeight: '180px'
                                }}
                            >
                                <button
                                    className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 p-0 d-flex align-items-center justify-content-center"
                                    style={{ width: '36px', height: '36px' }}
                                    onClick={() => setSelectedReward(null)}
                                >
                                    <X size={20} />
                                </button>
                                {selectedReward.image ? (
                                    <img src={selectedReward.image} alt={selectedReward.title} style={{ maxHeight: '120px', objectFit: 'contain' }} />
                                ) : (
                                    <span style={{ fontSize: '80px' }}>{categoryIcons[selectedReward.category] || '🎁'}</span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-2">{selectedReward.title}</h4>
                                {selectedReward.description && (
                                    <p className="text-muted mb-3">{selectedReward.description}</p>
                                )}

                                {/* Price */}
                                <div className="d-flex align-items-center gap-2 mb-4 p-3 rounded-3" style={{ backgroundColor: '#fef3c7' }}>
                                    <Star size={32} fill="#fbbf24" className="text-warning" />
                                    <span className="fw-bold h3 mb-0">{selectedReward.cost}</span>
                                    <span className="text-muted">yulduz</span>
                                    {selectedReward.stock !== -1 && (
                                        <span className="ms-auto badge bg-secondary">{selectedReward.stock} ta qoldi</span>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Miqdor</label>
                                    <div className="d-flex align-items-center gap-3">
                                        <button
                                            className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                                            style={{ width: '40px', height: '40px' }}
                                            onClick={() => setRewardQuantity(Math.max(1, rewardQuantity - 1))}
                                        >
                                            <Minus size={20} />
                                        </button>
                                        <span className="fw-bold h4 mb-0" style={{ minWidth: '40px', textAlign: 'center' }}>{rewardQuantity}</span>
                                        <button
                                            className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                                            style={{ width: '40px', height: '40px' }}
                                            onClick={() => {
                                                if (selectedReward.stock === -1 || rewardQuantity < selectedReward.stock) {
                                                    setRewardQuantity(rewardQuantity + 1);
                                                }
                                            }}
                                        >
                                            <Plus size={20} />
                                        </button>
                                        <span className="text-muted ms-2">
                                            = <span className="fw-bold text-warning">{selectedReward.cost * rewardQuantity}</span> yulduz
                                        </span>
                                    </div>
                                </div>

                                {/* Student select for quick buy */}
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Tezkor sotib olish uchun o'quvchi</label>
                                    <select
                                        className="form-select rounded-3"
                                        value={quickStudent}
                                        onChange={(e) => setQuickStudent(e.target.value)}
                                    >
                                        <option value="">-- O'quvchini tanlang --</option>
                                        {students.map(student => (
                                            <option key={student._id} value={student._id}>
                                                {student.name} ({student.stars} ⭐)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Action buttons */}
                                <div className="d-flex gap-3">
                                    <button
                                        className="btn btn-outline-primary flex-grow-1 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2"
                                        onClick={addToCartFromModal}
                                    >
                                        <ShoppingBag size={20} />
                                        Savatga
                                    </button>
                                    <button
                                        className="btn btn-primary flex-grow-1 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2"
                                        onClick={quickBuy}
                                        disabled={processing || !quickStudent}
                                    >
                                        {processing ? (
                                            <span className="spinner-border spinner-border-sm" />
                                        ) : (
                                            <>
                                                <Gift size={20} />
                                                Sotib olish
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                type="info"
            />
            <AlertModal
                show={alertModal.show}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
            />
        </div>
    );
}
