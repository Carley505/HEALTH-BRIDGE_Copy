import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile } from '../features/profile/profileSlice';
import { logout } from '../features/auth/authSlice';
import ProfileForm from '../features/profile/ProfileForm';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { MessageSquare, User, Activity, LogOut, ChevronRight, Camera } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: profile, loading } = useSelector((state) => state.profile);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        dispatch(updateProfile({ photo_url: dataUrl }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const avatarSrc = profile?.photo_url || user?.photoURL;

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && user?.uid) {
      const skipKey = `onboarding_skipped_${user.uid}`;
      const isSkipped = localStorage.getItem(skipKey);

      if (profile) {
        if (!profile.age_band && !isSkipped) {
          navigate('/onboarding');
        }
      } else {
        if (!isSkipped) {
          navigate('/onboarding');
        }
      }
    }
  }, [loading, profile, navigate, user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg"
        style={{
          background: 'rgba(var(--bg-surface-rgb, 255, 255, 255), 0.8)',
          borderBottom: '1px solid var(--border-color)'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>HealthBridge</span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {/* User Avatar (clickable) */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="relative group"
                title="Change avatar"
              >
                {avatarSrc ? (
                  <img className="h-10 w-10 rounded-full object-cover ring-2 ring-offset-2"
                    style={{ ringColor: 'var(--color-primary)' }}
                    src={avatarSrc} alt={user?.displayName || 'Avatar'} />
                ) : (
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '?')}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </button>

              <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-primary)' }}>
                {user?.displayName || user?.email?.split('@')[0]}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                style={{
                  color: 'var(--color-accent)',
                  background: 'rgba(var(--color-accent-rgb), 0.1)'
                }}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Welcome Section */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Here's an overview of your health journey
          </p>
        </div>

        {/* Alert Banner */}
        {!profile && !loading && (
          <div className="mb-8 p-4 rounded-xl animate-fadeIn"
            style={{
              background: 'rgba(var(--color-primary-rgb), 0.1)',
              border: '1px solid rgba(var(--color-primary-rgb), 0.3)'
            }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--color-primary)' }}>Complete Your Profile</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add your health information to get personalized insights</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Assessment Card */}
          <div className="rounded-2xl p-6 animate-fadeIn"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
              boxShadow: '0 10px 40px rgba(var(--color-primary-rgb), 0.3)'
            }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Health Assessment</h3>
                <p className="text-white/80 mb-6">
                  Chat with your personal AI health coach for personalized insights and recommendations
                </p>
                <Link to="/chat"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{ background: 'white', color: 'var(--color-primary)' }}>
                  Start Chat
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            {(isEditing || !profile) ? (
              <ProfileForm existingProfile={profile} onSuccess={() => setIsEditing(false)} />
            ) : (
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)'
                }}>
                <div className="px-6 py-5 flex justify-between items-center"
                  style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(var(--color-primary-rgb), 0.1)' }}>
                      <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Profile Summary</h3>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{
                      color: 'var(--color-primary)',
                      background: 'rgba(var(--color-primary-rgb), 0.1)'
                    }}>
                    Edit
                  </button>
                </div>

                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {[
                    { label: 'Age Band', value: profile.age_band },
                    { label: 'Sex', value: profile.sex, capitalize: true },
                    { label: 'Family History', value: [profile.family_history_hypertension && 'Hypertension', profile.family_history_diabetes && 'Diabetes'].filter(Boolean).join(', ') || 'None reported' },
                    { label: 'Smoking', value: profile.smoking_status, capitalize: true },
                    { label: 'Alcohol', value: profile.alcohol_consumption, capitalize: true },
                    { label: 'Activity Level', value: profile.activity_level, capitalize: true },
                  ].map((item, idx) => (
                    <div key={idx} className="px-6 py-4 flex justify-between items-center"
                      style={{ background: idx % 2 === 0 ? 'var(--bg-elevated)' : 'transparent' }}>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span className={`text-sm font-medium ${item.capitalize ? 'capitalize' : ''}`}
                        style={{ color: 'var(--text-primary)' }}>
                        {item.value || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Quick Stats */}
        {profile && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: Activity, label: 'Activity', value: profile.activity_level || 'Not set', color: 'var(--color-primary)' },
              { icon: User, label: 'Age Group', value: profile.age_band || 'Not set', color: 'var(--color-accent)' },
              { icon: MessageSquare, label: 'Assessments', value: 'Start your first', color: 'var(--color-accent-dark)' },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-xl p-5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)'
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.color}20` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                    <p className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
