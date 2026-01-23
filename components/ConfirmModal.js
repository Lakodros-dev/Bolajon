'use client';

import { Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ConfirmModal({
    show,
    onClose,
    onConfirm,
    title = "Tasdiqlash",
    message = "Bu amalni bajarishni xohlaysizmi?",
    confirmText = "Ha",
    cancelText = "Bekor qilish",
    type = "danger", // danger, warning, success, info
    loading = false
}) {
    if (!show) return null;

    const typeConfig = {
        danger: { bg: '#fee2e2', color: 'text-danger', Icon: Trash2, btnClass: 'btn-danger' },
        warning: { bg: '#fef3c7', color: 'text-warning', Icon: AlertTriangle, btnClass: 'btn-warning' },
        success: { bg: '#dcfce7', color: 'text-success', Icon: CheckCircle, btnClass: 'btn-success' },
        info: { bg: '#dbeafe', color: 'text-primary', Icon: Info, btnClass: 'btn-primary' }
    };

    const config = typeConfig[type] || typeConfig.info;
    const IconComponent = config.Icon;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow">
                    <div className="modal-body p-4 text-center">
                        <div
                            className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{ width: '64px', height: '64px', backgroundColor: config.bg }}
                        >
                            <IconComponent size={32} className={config.color} />
                        </div>
                        <h5 className="fw-bold mb-2">{title}</h5>
                        <p className="text-muted mb-4">{message}</p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                onClick={onClose}
                                className="btn btn-light rounded-3 px-4 py-2"
                                disabled={loading}
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`btn ${config.btnClass} rounded-3 px-4 py-2 d-flex align-items-center gap-2`}
                                disabled={loading}
                            >
                                {loading && <span className="spinner-border spinner-border-sm"></span>}
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
