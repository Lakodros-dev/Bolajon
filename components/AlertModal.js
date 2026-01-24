'use client';

import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function AlertModal({
    show,
    onClose,
    title = "Xabar",
    message = "",
    type = "success", // success, error, warning, info
    buttonText = "OK"
}) {
    if (!show) return null;

    const typeConfig = {
        success: { bg: '#dcfce7', color: 'text-success', Icon: CheckCircle },
        error: { bg: '#fee2e2', color: 'text-danger', Icon: XCircle },
        warning: { bg: '#fef3c7', color: 'text-warning', Icon: AlertTriangle },
        info: { bg: '#dbeafe', color: 'text-primary', Icon: Info }
    };

    const config = typeConfig[type] || typeConfig.info;
    const IconComponent = config.Icon;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10500 }}>
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
