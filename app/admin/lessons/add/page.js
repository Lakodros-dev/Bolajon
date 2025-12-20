'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AddLessonPage() {
    const router = useRouter();
    const { getAuthHeader, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [videoSource, setVideoSource] = useState('url'); // 'url' or 'upload'
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnail: '',
        level: 1,
        duration: 0,
        order: 0
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        });
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            setError('Faqat MP4, WebM, OGG formatlar qabul qilinadi');
            return;
        }

        // Check file size (500MB max)
        if (file.size > 500 * 1024 * 1024) {
            setError('Video hajmi 500MB dan oshmasligi kerak');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('video', file);

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(progress);
                }
            });

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        setFormData(prev => ({ ...prev, videoUrl: data.videoUrl }));
                        setError('');
                    } else {
                        setError(data.error || 'Video yuklashda xatolik');
                    }
                } else {
                    setError('Video yuklashda xatolik');
                }
                setUploading(false);
            };

            xhr.onerror = () => {
                setError('Video yuklashda xatolik');
                setUploading(false);
            };

            xhr.open('POST', '/api/upload/video');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formDataUpload);

        } catch (err) {
            setError('Video yuklashda xatolik');
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/lessons', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin/lessons');
            } else {
                setError(data.error || "Dars qo'shishda xatolik");
            }
        } catch (err) {
            setError("Dars qo'shishda xatolik");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link href="/admin/lessons" className="btn btn-light rounded-circle p-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="h3 fw-bold mb-0">Yangi dars qo'shish</h1>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="alert alert-danger rounded-3 mb-4">{error}</div>
                )}

                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h3 className="h6 fw-bold mb-4">Asosiy ma'lumotlar</h3>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Dars nomi *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-control rounded-3 py-2"
                                placeholder="Masalan: Salomlashish"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Tavsif *</label>
                            <textarea
                                name="description"
                                className="form-control rounded-3"
                                rows="3"
                                placeholder="Dars haqida qisqacha ma'lumot"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Video Section */}
                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h3 className="h6 fw-bold mb-4">Video</h3>

                        {/* Video Source Toggle */}
                        <div className="btn-group w-100 mb-4" role="group">
                            <button
                                type="button"
                                className={`btn ${videoSource === 'url' ? 'btn-primary' : 'btn-outline-primary'} rounded-start-3`}
                                onClick={() => setVideoSource('url')}
                            >
                                <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>link</span>
                                URL orqali
                            </button>
                            <button
                                type="button"
                                className={`btn ${videoSource === 'upload' ? 'btn-primary' : 'btn-outline-primary'} rounded-end-3`}
                                onClick={() => setVideoSource('upload')}
                            >
                                <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>upload</span>
                                Yuklash
                            </button>
                        </div>

                        {videoSource === 'url' ? (
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Video URL *</label>
                                <input
                                    type="text"
                                    name="videoUrl"
                                    className="form-control rounded-3 py-2"
                                    placeholder="YouTube, Vimeo yoki video fayl havolasi"
                                    value={formData.videoUrl}
                                    onChange={handleChange}
                                    required={videoSource === 'url'}
                                />
                                <small className="text-muted">YouTube, Vimeo yoki boshqa video havolasini kiriting</small>
                            </div>
                        ) : (
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Video fayl yuklash *</label>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                    onChange={handleVideoUpload}
                                    className="d-none"
                                />

                                {!formData.videoUrl || !formData.videoUrl.startsWith('/api/video/') ? (
                                    <div
                                        className="border-2 border-dashed rounded-4 p-5 text-center"
                                        style={{
                                            borderColor: '#dee2e6',
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="spinner-border text-primary mb-3" role="status"></div>
                                                <p className="mb-2 fw-semibold">Yuklanmoqda... {uploadProgress}%</p>
                                                <div className="progress" style={{ height: '8px', maxWidth: '300px', margin: '0 auto' }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-muted mb-3" style={{ fontSize: '48px' }}>cloud_upload</span>
                                                <p className="mb-1 fw-semibold">Video faylni tanlang</p>
                                                <small className="text-muted">MP4, WebM, OGG (max 500MB)</small>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border rounded-4 p-4 bg-success bg-opacity-10">
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="material-symbols-outlined text-success" style={{ fontSize: '32px' }}>check_circle</span>
                                            <div className="flex-grow-1">
                                                <p className="mb-0 fw-semibold text-success">Video yuklandi!</p>
                                                <small className="text-muted">{formData.videoUrl}</small>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm rounded-3"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, videoUrl: '' }));
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <small className="text-muted d-block mt-2">
                                    Video serverda saqlanadi va xavfsiz tarzda uzatiladi
                                </small>
                            </div>
                        )}

                        {/* Hidden input for videoUrl when using upload */}
                        {videoSource === 'upload' && formData.videoUrl && (
                            <input type="hidden" name="videoUrl" value={formData.videoUrl} />
                        )}

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Rasm URL (ixtiyoriy)</label>
                            <input
                                type="url"
                                name="thumbnail"
                                className="form-control rounded-3 py-2"
                                placeholder="https://example.com/image.jpg"
                                value={formData.thumbnail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h3 className="h6 fw-bold mb-4">Sozlamalar</h3>

                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Daraja *</label>
                                <select
                                    name="level"
                                    className="form-select rounded-3 py-2"
                                    value={formData.level}
                                    onChange={handleChange}
                                    required
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                                        <option key={level} value={level}>{level}-daraja</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Davomiylik (daqiqa)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    className="form-control rounded-3 py-2"
                                    min="0"
                                    value={formData.duration}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Tartib raqami</label>
                                <input
                                    type="number"
                                    name="order"
                                    className="form-control rounded-3 py-2"
                                    min="0"
                                    value={formData.order}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-3">
                    <Link href="/admin/lessons" className="btn btn-light rounded-3 px-4 py-2">
                        Bekor qilish
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                        disabled={loading || uploading || !formData.videoUrl}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                        )}
                        Saqlash
                    </button>
                </div>
            </form>
        </div>
    );
}
