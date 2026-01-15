'use client';

export default function AlertModal({
    show,
    onClose,
    title = "Xabar",
    message = "",
    type = "success", // success, error, warning, info
    buttonText = "OK"
}) {
    if (!show) return null;

    const typeStyles = {
        success: { bg: '#dcfce7', color: 'text-success', icon: 'check_circle' },
        error: { bg: '#fee2e2', color: 'text-danger', icon: 'error' },
        warning: { bg: '#fef3c7', color: 'text-warning', icon: 'warning' },
        info: { bg: '#dbeafe', color: 'text-primary', icon: 'info' }
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
                        <button
                            onClick={onClose}
                            className="btn btn-primary rounded-3 px-5 py-2"
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
