export default function RegisterLoading() {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{ background: 'linear-gradient(180deg, #6366f1 0%, #2563eb 60%, #1d4ed8 100%)' }}>
            <div className="text-center">
                <div className="spinner-border text-white mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
            </div>
        </div>
    );
}
