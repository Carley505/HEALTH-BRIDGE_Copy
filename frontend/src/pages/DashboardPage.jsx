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
    // Check if onboarding is needed
    if (!loading && user?.uid) {
      const skipKey = `onboarding_skipped_${user.uid}`;
      const isSkipped = localStorage.getItem(skipKey);

      if (!profile?.age_band && !isSkipped) {
        navigate('/onboarding');
      }
    }
  }, [loading, profile, navigate, user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg w-full"
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-color)'
        }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-2">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                <span className="text-white font-bold text-base sm:text-lg">H</span>
              </div>
              <span className="text-base sm:text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                HealthBridge
              </span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <ThemeToggle />

              {/* User Avatar */}
              {(profile?.photo_url || user?.photoURL) ? (
                <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-offset-2 flex-shrink-0"
                  style={{ ringColor: 'var(--color-primary)' }}
                  src={profile?.photo_url || user.photoURL} alt={user?.displayName || 'User'} />
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '?')}
                </div>
              )}

              <span className="text-sm font-medium hidden md:block truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                {user?.displayName || user?.email?.split('@')[0]}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:scale-105"
                style={{
                  color: 'var(--color-accent)',
                  background: 'rgba(var(--color-accent-rgb), 0.1)'
                }}>
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 w-full">

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 break-words" style={{ color: 'var(--text-primary)' }}>
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            Here's an overview of your health journey
          </p>
        </div>

        {/* Alert Banner */}
        {!profile && !loading && (
          <div className="mb-6 sm:mb-8 p-4 rounded-xl animate-fadeIn"
            style={{
              background: 'rgba(var(--color-primary-rgb), 0.1)',
              border: '1px solid rgba(var(--color-primary-rgb), 0.3)'
            }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-primary)' }}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--color-primary)' }}>Complete Your Profile</p>
                <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>Add health info for personalized insights</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Assessment Card */}
          <div className="rounded-2xl p-5 sm:p-6 animate-fadeIn flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
              boxShadow: '0 10px 40px rgba(var(--color-primary-rgb), 0.25)'
            }}>
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">AI Health Assessment</h3>
              <p className="text-white/85 text-sm sm:text-base mb-6 leading-relaxed">
                Chat with your personal AI health coach for personalized insights, habit tracking, and risk reduction.
              </p>
            </div>
            <div>
              <Link to="/chat"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 shadow-md"
                style={{ background: 'white', color: 'var(--color-primary)' }}>
                Start Chat
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>

          {/* Profile Section */}
          <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            {(isEditing || !profile) ? (
              <ProfileForm existingProfile={profile} onSuccess={() => setIsEditing(false)} />
            ) : (
              <div className="rounded-2xl overflow-hidden glass-card w-full">
                <div className="px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center"
                  style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden glass shadow-sm border border-white/20 flex-shrink-0">
                      {(profile?.photo_url || user?.photoURL) ? (
                        <img src={profile?.photo_url || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-brand text-white font-bold text-base sm:text-xl">
                          {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>Profile Summary</h3>
                      <p className="text-xs opacity-60" style={{ color: 'var(--text-primary)' }}>Personal Details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                    style={{
                      color: 'var(--color-primary)',
                      background: 'rgba(var(--color-primary-rgb), 0.1)'
                    }}>
                    Edit
                  </button>
                </div>

                <div className="divide-y w-full" style={{ borderColor: 'var(--border-color)' }}>
                  {[
                    { label: 'Age Band', value: profile.age_band },
                    { label: 'Sex', value: profile.sex, capitalize: true },
                    { label: 'Family History', value: [profile.family_history_hypertension && 'Hypertension', profile.family_history_diabetes && 'Diabetes'].filter(Boolean).join(', ') || 'None reported' },
                    { label: 'Smoking', value: profile.smoking_status, capitalize: true },
                    { label: 'Alcohol', value: profile.alcohol_consumption, capitalize: true },
                    { label: 'Activity Level', value: profile.activity_level, capitalize: true },
                  ].map((item, idx) => (
                    <div key={idx} className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-4 w-full"
                      style={{ background: idx % 2 === 0 ? 'var(--bg-elevated)' : 'transparent' }}>
                      <span className="text-xs sm:text-sm font-normal" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span className={`text-xs sm:text-sm font-medium break-anywhere ${item.capitalize ? 'capitalize' : ''}`}
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
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: Activity, label: 'Activity', value: profile.activity_level || 'Not set', color: 'var(--color-primary)' },
              { icon: User, label: 'Age Group', value: profile.age_band || 'Not set', color: 'var(--color-accent)' },
              { icon: MessageSquare, label: 'Assessments', value: 'Ready to chat', color: 'var(--color-accent-dark)' },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-xl p-4 sm:p-5 w-full"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)'
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${stat.color}20` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                    <p className="font-semibold capitalize text-sm sm:text-base truncate" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
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
