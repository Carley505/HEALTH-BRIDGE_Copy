import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from './profileSlice';
import { updateUserAvatar } from '../auth/authSlice';
import { Check, Camera, User as UserIcon } from 'lucide-react';

const AVATAR_PRESETS = [
    'https://api.dicebear.com/10.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/10.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/10.x/avataaars/svg?seed=Mason',
    'https://api.dicebear.com/10.x/avataaars/svg?seed=Sasha',
    'https://api.dicebear.com/10.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/10.x/avataaars/svg?seed=Kiki',
];

export default function ProfileForm({ existingProfile, onSuccess }) {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.profile);
    const { user } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        photo_url: user?.photoURL || '',
        age_band: '18-29',
        sex: 'male',
        family_history_hypertension: false,
        family_history_diabetes: false,
        smoking_status: 'never',
        alcohol_consumption: 'none',
        activity_level: 'sedentary',
    });

    useEffect(() => {
        if (existingProfile) {
            setFormData({
                photo_url: existingProfile.photo_url || user?.photoURL || '',
                age_band: existingProfile.age_band || '18-29',
                sex: existingProfile.sex || 'male',
                family_history_hypertension: existingProfile.family_history_hypertension || false,
                family_history_diabetes: existingProfile.family_history_diabetes || false,
                smoking_status: existingProfile.smoking_status || 'never',
                alcohol_consumption: existingProfile.alcohol_consumption || 'none',
                activity_level: existingProfile.activity_level || 'sedentary',
            });
        }
    }, [existingProfile, user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAvatarSelect = (url) => {
        setFormData(prev => ({ ...prev, photo_url: url }));
    };

    const handleCustomAvatar = () => {
        const url = prompt('Enter a custom image URL:', formData.photo_url);
        if (url !== null) {
            setFormData(prev => ({ ...prev, photo_url: url }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Update internal database profile
            await dispatch(updateProfile(formData)).unwrap();

            // 2. Sync with Firebase Authentication if avatar changed
            if (formData.photo_url && formData.photo_url !== user?.photoURL) {
                await dispatch(updateUserAvatar(formData.photo_url)).unwrap();
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Failed to save profile:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit}
            className="glass-card overflow-hidden w-full max-w-full">

            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h3 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {existingProfile ? 'Edit Profile' : 'Complete Your Profile'}
                </h3>
                <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Essential details for your health assessment
                </p>
            </div>

            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 w-full">
                {/* Avatar Selection */}
                <div className="animate-fadeIn">
                    <label className="block text-xs sm:text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                        Choose your avatar
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                        <div
                            onClick={handleCustomAvatar}
                            className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
                        >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden glass shadow-xl flex items-center justify-center border-2 transition-all group-hover:border-primary"
                                style={{ borderColor: formData.photo_url ? 'var(--color-primary)' : 'var(--border-color)' }}>
                                {formData.photo_url ? (
                                    <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: 'var(--text-muted)' }} />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-2xl">
                                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-1" />
                                <span className="text-[9px] sm:text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full flex flex-wrap gap-2">
                            {AVATAR_PRESETS.map((url, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAvatarSelect(url)}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden glass border transition-all hover:scale-110 active:scale-95 flex-shrink-0"
                                    style={{
                                        borderColor: formData.photo_url === url ? 'var(--color-primary)' : 'var(--border-color)',
                                        borderWidth: formData.photo_url === url ? '2px' : '1px'
                                    }}>
                                    <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label htmlFor="age_band" className="block text-xs sm:text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                            Age Group
                        </label>
                        <select
                            id="age_band"
                            name="age_band"
                            value={formData.age_band}
                            onChange={handleChange}
                            className="glass-input w-full text-xs sm:text-sm"
                        >
                            <option value="18-29">18-29</option>
                            <option value="30-39">30-39</option>
                            <option value="40-49">40-49</option>
                            <option value="50-59">50-59</option>
                            <option value="60+">60+</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="sex" className="block text-xs sm:text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                            Sex
                        </label>
                        <select
                            id="sex"
                            name="sex"
                            value={formData.sex}
                            onChange={handleChange}
                            className="glass-input w-full text-xs sm:text-sm"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>

                {/* Family History */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2.5" style={{ color: 'var(--text-primary)' }}>
                        Family History
                    </label>
                    <div className="space-y-2.5 sm:space-y-3">
                        {[
                            { name: 'family_history_hypertension', label: 'Hypertension', desc: 'High blood pressure in close family', checked: formData.family_history_hypertension },
                            { name: 'family_history_diabetes', label: 'Diabetes', desc: 'Diabetes in close family', checked: formData.family_history_diabetes },
                        ].map((item) => (
                            <label
                                key={item.name}
                                className="flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all w-full"
                                style={{
                                    background: item.checked ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--bg-elevated)',
                                    border: item.checked ? '2px solid var(--color-primary)' : '1px solid var(--border-color)'
                                }}>
                                <input
                                    type="checkbox"
                                    name={item.name}
                                    checked={item.checked}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg mr-3 sm:mr-4 flex items-center justify-center transition-all flex-shrink-0"
                                    style={{
                                        background: item.checked ? 'var(--color-primary)' : 'var(--bg-surface)',
                                        border: item.checked ? 'none' : '2px solid var(--border-color)'
                                    }}>
                                    {item.checked && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
                                </div>
                                <div className="min-w-0">
                                    <span className="font-medium text-xs sm:text-sm block truncate" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                                    <span className="text-[11px] sm:text-xs truncate block" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Lifestyle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div>
                        <label htmlFor="smoking_status" className="block text-xs sm:text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                            Smoking Status
                        </label>
                        <select
                            id="smoking_status"
                            name="smoking_status"
                            value={formData.smoking_status}
                            onChange={handleChange}
                            className="glass-input w-full text-xs sm:text-sm"
                        >
                            <option value="never">Never Smoked</option>
                            <option value="former">Former Smoker</option>
                            <option value="current">Current Smoker</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="alcohol_consumption" className="block text-xs sm:text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                            Alcohol Consumption
                        </label>
                        <select
                            id="alcohol_consumption"
                            name="alcohol_consumption"
                            value={formData.alcohol_consumption}
                            onChange={handleChange}
                            className="glass-input w-full text-xs sm:text-sm"
                        >
                            <option value="none">None</option>
                            <option value="occasional">Occasional</option>
                            <option value="regular">Regular</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="activity_level" className="block text-xs sm:text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                            Activity Level
                        </label>
                        <select
                            id="activity_level"
                            name="activity_level"
                            value={formData.activity_level}
                            onChange={handleChange}
                            className="glass-input w-full text-xs sm:text-sm"
                        >
                            <option value="sedentary">Sedentary (Little to no exercise)</option>
                            <option value="light">Light (1-3 days/week)</option>
                            <option value="moderate">Moderate (3-5 days/week)</option>
                            <option value="active">Active (6-7 days/week)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 flex justify-end" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-color)' }}>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full sm:w-auto text-xs sm:text-sm py-2.5 sm:py-3 px-5 sm:px-6"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                        </span>
                    ) : 'Save Profile'}
                </button>
            </div>
        </form>
    );
}
