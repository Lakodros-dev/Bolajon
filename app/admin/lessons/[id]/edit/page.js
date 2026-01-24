'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function EditLessonPage() {
    const router = useRouter();
    const params = useParams();
    const { getAuthHeader, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [videoSource, setVideoSource] = useState('url');
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const [uploadingImageIndex, setUploadingImageIndex] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnail: '',
        level: 1,
        duration: 0,
        order: 0,
        vocabulary: [],
        gameType: 'vocabulary',
        gameSettings: {
            numberRange: {
                min: 1,
                max: 10
            },
            duration: 60
        }
    });

    const gameTypes = [
        { value: 'none', label: "O'yinsiz", icon: 'block', color: '#6b7280' },
        { value: 'vocabulary', label: "Lug'at o'yini", icon: 'dictionary', color: '#2563eb' },
        { value: 'catch-the-number', label: 'Catch the Number', icon: '🔢', color: '#f59e0b', isEmoji: true },
        { value: 'shopping-basket', label: 'Shopping Basket', icon: '🛒', color: '#9333ea', isEmoji: true },
        { value: 'build-the-body', label: 'Build the Body', icon: '🧍', color: '#ec4899', isEmoji: true },
        { value: 'pop-the-balloon', label: 'Sharni yorish', icon: '🎈', color: '#dc2626', isEmoji: true },
        { value: 'drop-to-basket', label: 'Savatga tashlash', icon: '🧺', color: '#16a34a', isEmoji: true },
        { value: 'movements', label: "Fe'llarni o'rganish", icon: '🏃', color: '#d97706', isEmoji: true }
    ];

    useEffect(() => {
        fetchLesson();
    }, [params.id]);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${params.id}`, {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                const lesson = data.lesson;
                setFormData({
                    title: lesson.title ?? '',
                    description: lesson.description ?? '',
                    videoUrl: lesson.videoUrl ?? '',
                    thumbnail: lesson.thumbnail ?? '',
                    level: lesson.level ?? 1,
                    duration: lesson.duration ?? 0,
                    order: lesson.order ?? 0,
                    vocabulary: lesson.vocabulary ?? [],
                    gameType: lesson.gameType ?? 'vocabulary',
                    gameSettings: lesson.gameSettings ?? {
                        numberRange: { min: 1, max: 10 },
                        duration: 60
                    }
                });
                // Set video source based on current URL
                if (lesson.videoUrl?.startsWith('/api/video/')) {
                    setVideoSource('upload');
                }
            }
        } catch (error) {
            console.error('Failed to fetch lesson:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : parseInt(value) || 0) : (value || '')
        }));
    };

    // Vocabulary functions
    const addVocabularyItem = () => {
        setFormData(prev => ({
            ...prev,
            vocabulary: [...prev.vocabulary, { word: '', translation: '', image: '' }]
        }));
    };

    const removeVocabularyItem = (index) => {
        setFormData(prev => ({
            ...prev,
            vocabulary: prev.vocabulary.filter((_, i) => i !== index)
        }));
    };

    const updateVocabularyItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            vocabulary: prev.vocabulary.map((item, i) =>
                i === index ? { ...item, [field]: value || '' } : item
            )
        }));
    };

    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Faqat JPG, PNG, GIF, WebP formatlar qabul qilinadi');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Rasm hajmi 5MB dan oshmasligi kerak');
            return;
        }

        setUploadingImageIndex(index);
        setError('');

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const res = await fetch('/api/upload/image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            const data = await res.json();
            if (data.success) {
                updateVocabularyItem(index, 'image', data.imageUrl);
            } else {
                setError(data.error || 'Rasm yuklashda xatolik');
            }
        } catch (err) {
            setError('Rasm yuklashda xatolik');
        } finally {
            setUploadingImageIndex(null);
        }
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            setError('Faqat MP4, WebM, OGG formatlar qabul qilinadi');
            return;
        }

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

        // Validate vocabulary for games that need it
        const gamesNeedingVocabulary = ['vocabulary', 'shopping-basket', 'build-the-body', 'pop-the-balloon', 'drop-to-basket', 'movements'];
        if (gamesNeedingVocabulary.includes(formData.gameType) && formData.vocabulary.length === 0) {
            setError(`${formData.gameType === 'shopping-basket' ? 'Shopping Basket' : formData.gameType === 'build-the-body' ? 'Build the Body' : 'Bu'} o'yin uchun kamida bitta so'z qo'shish kerak!`);
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            const res = await fetch(`/api/lessons/${params.id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin/lessons');
            } else {
                setError(data.error || "Darsni yangilashda xatolik");
            }
        } catch (err) {
            setError("Darsni yangilashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link href="/admin/lessons" className="btn btn-light rounded-circle p-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="h3 fw-bold mb-0">Darsni tahrirlash</h1>
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
                                <label className="form-label fw-semibold">Video fayl yuklash</label>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                    onChange={handleVideoUpload}
                                    className="d-none"
                                />

                                {formData.videoUrl?.startsWith('/api/video/') ? (
                                    <div className="border rounded-4 p-4 bg-success bg-opacity-10">
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="material-symbols-outlined text-success" style={{ fontSize: '32px' }}>check_circle</span>
                                            <div className="flex-grow-1">
                                                <p className="mb-0 fw-semibold text-success">Video yuklangan</p>
                                                <small className="text-muted">{formData.videoUrl}</small>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm rounded-3 me-2"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm rounded-3"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, videoUrl: '' }));
                                                    setVideoSource('url');
                                                }}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
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
                                                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
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
                                )}
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Rasm URL</label>
                            <input
                                type="url"
                                name="thumbnail"
                                className="form-control rounded-3 py-2"
                                value={formData.thumbnail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Game Type Section */}
                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="mb-4">
                            <h3 className="h6 fw-bold mb-1">O'yin turi</h3>
                            <p className="text-muted small mb-0">Bu dars uchun qaysi o'yin ishlatilsin</p>
                        </div>

                        <div className="row g-3">
                            {gameTypes.map((game) => (
                                <div key={game.value} className="col-6 col-md-4">
                                    <div
                                        className={`card border-2 rounded-3 h-100 ${formData.gameType === game.value ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => setFormData(prev => ({ ...prev, gameType: game.value }))}
                                    >
                                        <div className="card-body p-3 text-center">
                                            {game.isEmoji ? (
                                                <span style={{ fontSize: '32px' }}>{game.icon}</span>
                                            ) : (
                                                <span
                                                    className="material-symbols-outlined mb-2"
                                                    style={{ fontSize: '32px', color: game.color }}
                                                >
                                                    {game.icon}
                                                </span>
                                            )}
                                            <p className="small fw-semibold mb-0 mt-2">{game.label}</p>
                                            {formData.gameType === game.value && (
                                                <span className="badge bg-primary rounded-pill mt-2">Tanlangan</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {formData.gameType === 'catch-the-number' && (
                            <div className="alert alert-info mt-3 mb-0 rounded-3">
                                <small>
                                    <span className="material-symbols-outlined me-1" style={{ fontSize: '16px', verticalAlign: 'middle' }}>info</span>
                                    Catch the Number o'yini uchun raqamlar oralig'i va vaqtni sozlang
                                </small>
                            </div>
                        )}

                        {formData.gameType === 'shopping-basket' && (
                            <div className="alert alert-warning mt-3 mb-0 rounded-3">
                                <small>
                                    <span className="material-symbols-outlined me-1" style={{ fontSize: '16px', verticalAlign: 'middle' }}>warning</span>
                                    <strong>Diqqat!</strong> Shopping Basket o'yini uchun quyida lug'at qo'shish MAJBURIY
                                </small>
                            </div>
                        )}

                        {formData.gameType === 'build-the-body' && (
                            <div className="alert alert-warning mt-3 mb-0 rounded-3">
                                <small>
                                    <span className="material-symbols-outlined me-1" style={{ fontSize: '16px', verticalAlign: 'middle' }}>warning</span>
                                    <strong>Diqqat!</strong> Build the Body o'yini uchun tana a'zolari lug'atini qo'shish MAJBURIY
                                </small>
                            </div>
                        )}
                    </div>
                </div>

                {/* Game Settings for Catch the Number */}
                {formData.gameType === 'catch-the-number' && (
                    <div className="card border-0 rounded-4 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <div className="mb-4">
                                <h3 className="h6 fw-bold mb-1">O'yin sozlamalari</h3>
                                <p className="text-muted small mb-0">Catch the Number o'yini uchun sozlamalar</p>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Minimal raqam</label>
                                    <input
                                        type="number"
                                        className="form-control rounded-3 py-2"
                                        min="1"
                                        max="999"
                                        value={formData.gameSettings.numberRange.min}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            gameSettings: {
                                                ...prev.gameSettings,
                                                numberRange: {
                                                    ...prev.gameSettings.numberRange,
                                                    min: parseInt(e.target.value) || 1
                                                }
                                            }
                                        }))}
                                    />
                                    <small className="text-muted">1 dan 999 gacha</small>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Maksimal raqam</label>
                                    <input
                                        type="number"
                                        className="form-control rounded-3 py-2"
                                        min="2"
                                        max="1000"
                                        value={formData.gameSettings.numberRange.max}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            gameSettings: {
                                                ...prev.gameSettings,
                                                numberRange: {
                                                    ...prev.gameSettings.numberRange,
                                                    max: parseInt(e.target.value) || 10
                                                }
                                            }
                                        }))}
                                    />
                                    <small className="text-muted">2 dan 1000 gacha</small>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">O'yin davomiyligi (soniya)</label>
                                    <input
                                        type="number"
                                        className="form-control rounded-3 py-2"
                                        min="30"
                                        max="300"
                                        value={formData.gameSettings.duration}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            gameSettings: {
                                                ...prev.gameSettings,
                                                duration: parseInt(e.target.value) || 60
                                            }
                                        }))}
                                    />
                                    <small className="text-muted">30 dan 300 soniya gacha</small>
                                </div>
                            </div>

                            <div className="alert alert-light mt-3 mb-0 rounded-3">
                                <small>
                                    <strong>Namuna:</strong> Min: {formData.gameSettings.numberRange.min}, Max: {formData.gameSettings.numberRange.max} 
                                    {' '}→ O'yinda {formData.gameSettings.numberRange.min} dan {formData.gameSettings.numberRange.max} gacha raqamlar ishtirok etadi
                                    <br />
                                    <strong>Vaqt:</strong> {formData.gameSettings.duration} soniya = {Math.floor(formData.gameSettings.duration / 60)} daqiqa {formData.gameSettings.duration % 60} soniya
                                </small>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vocabulary Section */}
                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="h6 fw-bold mb-1">Lug'at</h3>
                                <p className="text-muted small mb-0">O'yin uchun so'zlar va rasmlar</p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1"
                                onClick={addVocabularyItem}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                                So'z qo'shish
                            </button>
                        </div>

                        {formData.vocabulary.length === 0 ? (
                            <div className="text-center py-4 bg-light rounded-3">
                                <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '40px' }}>dictionary</span>
                                <p className="text-muted mb-0">Hali so'z qo'shilmagan</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {formData.vocabulary.map((item, index) => (
                                    <div key={index} className="border rounded-3 p-3 bg-light">
                                        <div className="row g-3 align-items-center">
                                            <div className="col-md-3">
                                                <label className="form-label small fw-semibold">Inglizcha</label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    placeholder="Apple"
                                                    value={item.word || ''}
                                                    onChange={(e) => updateVocabularyItem(index, 'word', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-semibold">O'zbekcha</label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    placeholder="Olma"
                                                    value={item.translation || ''}
                                                    onChange={(e) => updateVocabularyItem(index, 'translation', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-semibold">Rasm</label>
                                                <div className="d-flex gap-2 align-items-center">
                                                    {item.image ? (
                                                        <div className="position-relative">
                                                            <img
                                                                src={item.image}
                                                                alt={item.word}
                                                                className="rounded-2"
                                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle p-0"
                                                                style={{ width: '20px', height: '20px', transform: 'translate(30%, -30%)' }}
                                                                onClick={() => updateVocabularyItem(index, 'image', '')}
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label
                                                            className="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center gap-1"
                                                            style={{ cursor: uploadingImageIndex === index ? 'not-allowed' : 'pointer' }}
                                                        >
                                                            {uploadingImageIndex === index ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                <>
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                                                                    Yuklash
                                                                </>
                                                            )}
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                                className="d-none"
                                                                onChange={(e) => handleImageUpload(e, index)}
                                                                disabled={uploadingImageIndex === index}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-2 text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm rounded-3"
                                                    onClick={() => removeVocabularyItem(index)}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h3 className="h6 fw-bold mb-4">Sozlamalar</h3>

                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Daraja</label>
                                <select
                                    name="level"
                                    className="form-select rounded-3 py-2"
                                    value={formData.level}
                                    onChange={handleChange}
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
                        disabled={loading || uploading}
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
