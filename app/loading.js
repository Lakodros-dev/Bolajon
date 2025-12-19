export default function Loading() {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f6f7f8' }}>
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
                <p className="text-muted small">Yuklanmoqda...</p>
            </div>
        </div>
    );
}
