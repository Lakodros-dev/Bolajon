export default function AdminLoading() {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
                <p className="text-muted small">Yuklanmoqda...</p>
            </div>
        </div>
    );
}
