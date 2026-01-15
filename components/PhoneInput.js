'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * International Phone Input with country selector and auto-formatting
 */

const countries = [
    { code: 'UZ', dialCode: '998', name: "O'zbekiston", flag: '🇺🇿', format: '## ### ## ##', length: 9 },
    { code: 'RU', dialCode: '7', name: 'Rossiya', flag: '🇷🇺', format: '### ### ## ##', length: 10 },
    { code: 'KZ', dialCode: '7', name: "Qozog'iston", flag: '🇰🇿', format: '### ### ## ##', length: 10 },
    { code: 'US', dialCode: '1', name: 'AQSH', flag: '🇺🇸', format: '### ### ####', length: 10 },
    { code: 'GB', dialCode: '44', name: 'Buyuk Britaniya', flag: '🇬🇧', format: '#### ######', length: 10 },
    { code: 'DE', dialCode: '49', name: 'Germaniya', flag: '🇩🇪', format: '### #######', length: 10 },
    { code: 'TR', dialCode: '90', name: 'Turkiya', flag: '🇹🇷', format: '### ### ####', length: 10 },
    { code: 'AE', dialCode: '971', name: 'BAA', flag: '🇦🇪', format: '## ### ####', length: 9 },
    { code: 'SA', dialCode: '966', name: 'Saudiya Arabistoni', flag: '🇸🇦', format: '## ### ####', length: 9 },
    { code: 'KR', dialCode: '82', name: 'Janubiy Koreya', flag: '🇰🇷', format: '## #### ####', length: 10 },
    { code: 'CN', dialCode: '86', name: 'Xitoy', flag: '🇨🇳', format: '### #### ####', length: 11 },
    { code: 'IN', dialCode: '91', name: 'Hindiston', flag: '🇮🇳', format: '##### #####', length: 10 },
    { code: 'PK', dialCode: '92', name: 'Pokiston', flag: '🇵🇰', format: '### #######', length: 10 },
    { code: 'BD', dialCode: '880', name: 'Bangladesh', flag: '🇧🇩', format: '#### ######', length: 10 },
    { code: 'TJ', dialCode: '992', name: 'Tojikiston', flag: '🇹🇯', format: '## ### ####', length: 9 },
    { code: 'KG', dialCode: '996', name: "Qirg'iziston", flag: '🇰🇬', format: '### ### ###', length: 9 },
    { code: 'TM', dialCode: '993', name: 'Turkmaniston', flag: '🇹🇲', format: '## ######', length: 8 },
    { code: 'AZ', dialCode: '994', name: 'Ozarbayjon', flag: '🇦🇿', format: '## ### ## ##', length: 9 },
    { code: 'GE', dialCode: '995', name: 'Gruziya', flag: '🇬🇪', format: '### ### ###', length: 9 },
    { code: 'UA', dialCode: '380', name: 'Ukraina', flag: '🇺🇦', format: '## ### ## ##', length: 9 },
    { code: 'BY', dialCode: '375', name: 'Belarus', flag: '🇧🇾', format: '## ### ## ##', length: 9 },
];

export default function PhoneInput({ value, onChange, className = '', ...props }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Parse initial value
    useEffect(() => {
        if (value && value !== '+') {
            const digits = value.replace(/\D/g, '');
            // Find matching country
            for (const country of countries) {
                if (digits.startsWith(country.dialCode)) {
                    setSelectedCountry(country);
                    const localNumber = digits.slice(country.dialCode.length);
                    setPhoneNumber(localNumber);
                    return;
                }
            }
        }
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format phone number based on country format
    const formatNumber = (digits, format) => {
        let result = '';
        let digitIndex = 0;

        for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
            if (format[i] === '#') {
                result += digits[digitIndex];
                digitIndex++;
            } else {
                result += format[i];
            }
        }

        return result;
    };

    // Handle phone number input
    const handlePhoneChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.length);
        setPhoneNumber(digits);

        // Notify parent with full formatted value
        const fullNumber = `+${selectedCountry.dialCode} ${formatNumber(digits, selectedCountry.format)}`.trim();
        onChange({
            target: {
                name: props.name,
                value: fullNumber
            }
        });
    };

    // Handle country selection
    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        setSearch('');
        setPhoneNumber('');

        // Focus input after selection
        setTimeout(() => inputRef.current?.focus(), 100);

        // Notify parent
        onChange({
            target: {
                name: props.name,
                value: `+${country.dialCode} `
            }
        });
    };

    // Filter countries by search
    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dialCode.includes(search) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    // Get placeholder from format
    const getPlaceholder = () => {
        return selectedCountry.format.replace(/#/g, '0');
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <div className="d-flex">
                {/* Country Selector */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn btn-light border-end-0 rounded-start-4 rounded-end-0 d-flex align-items-center gap-2 px-3"
                    style={{
                        borderColor: '#dee2e6',
                        backgroundColor: '#f8f9fa',
                        minWidth: '100px'
                    }}
                >
                    <span style={{ fontSize: '20px' }}>{selectedCountry.flag}</span>
                    <span className="text-muted small">+{selectedCountry.dialCode}</span>
                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>
                        {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                </button>

                {/* Phone Input */}
                <input
                    ref={inputRef}
                    type="tel"
                    value={formatNumber(phoneNumber, selectedCountry.format)}
                    onChange={handlePhoneChange}
                    className={`${className} rounded-start-0 border-start-0`}
                    placeholder={getPlaceholder()}
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    {...props}
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="position-absolute bg-white border rounded-4 shadow-lg mt-1 overflow-hidden"
                    style={{
                        zIndex: 1050,
                        width: '280px',
                        maxHeight: '300px',
                        left: 0
                    }}
                >
                    {/* Search */}
                    <div className="p-2 border-bottom sticky-top bg-white">
                        <input
                            type="text"
                            className="form-control form-control-sm rounded-3"
                            placeholder="Davlat qidirish..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Country List */}
                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                        {filteredCountries.map((country) => (
                            <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                className={`w-100 border-0 bg-transparent d-flex align-items-center gap-3 px-3 py-2 text-start ${selectedCountry.code === country.code ? 'bg-primary bg-opacity-10' : ''
                                    }`}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = selectedCountry.code === country.code ? 'rgba(43, 140, 238, 0.1)' : 'transparent'}
                            >
                                <span style={{ fontSize: '24px' }}>{country.flag}</span>
                                <div className="flex-grow-1">
                                    <div className="fw-medium" style={{ fontSize: '14px' }}>{country.name}</div>
                                </div>
                                <span className="text-muted small">+{country.dialCode}</span>
                            </button>
                        ))}

                        {filteredCountries.length === 0 && (
                            <div className="text-center text-muted py-3 small">
                                Davlat topilmadi
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
