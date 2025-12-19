'use client';

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

    const typeStyles = {
        danger: { bg: '#fee2e2', color: 'text-danger', icon: 'delete', btnClass: 'btn-danger' },
        warning: { bg: '#fef3c7', color: 'text-warning', icon: 'warning', btnClass: 'btn-warning' },
        success: { bg: '#dcfce7', color: 'text-success', icon: 'check_circle', btnClass: 'btn-success' },
        info: { bg: '#dbeafe', color: 'text-primary', icon: 'info', btnClass: 'btn-primary' }
    };

    const style = typeStyles[type] || typeStyles.info;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow">
                    <div className="modal-body p-4 text-center">
                        <div
                            className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{ width: '64px', height: '64px', backgroundColor: style.bg }}
                        >
                            <span className={`material-symbols-outlined ${style.color}`} style={{ fontSize: '32px' }}>
                                {style.icon}
                            </span>
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
                                className={`btn ${style.btnClass} rounded-3 px-4 py-2 d-flex align-items-center gap-2`}
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
