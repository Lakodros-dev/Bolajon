'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

export default function GameOverModal({ won, score, total, onRestart }) {
    return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card border-0 rounded-4 shadow-lg text-center" style={{ maxWidth: 400 }}>
                <div className="card-body p-5">
                    <div className="mb-4">
                        <span style={{ fontSize: '80px' }}>{won ? '🎉' : '😊'}</span>
                    </div>
                    <h2 className="fw-bold mb-2">{won ? 'Ajoyib!' : 'Yaxshi harakat!'}</h2>
                    {score !== undefined && total !== undefined && (
                        <p className="text-muted mb-4">{score}/{total} to'g'ri</p>
                    )}
                    <div className="d-flex gap-3 justify-content-center">
                        <button 
                            onClick={onRestart} 
                            className="btn btn-outline-secondary rounded-3 px-4 d-flex align-items-center gap-2"
                        >
                            <RotateCcw size={20} />
                            {won ? "Qayta o'ynash" : "Qayta urinish"}
                        </button>
                        <Link href="/dashboard/lessons" className="btn btn-primary rounded-3 px-4">
                            Keyingisi
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
