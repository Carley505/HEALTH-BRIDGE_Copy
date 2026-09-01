import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupWithEmail, loginWithGoogle } from '../features/auth/authSlice';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function SignupPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (isAuthenticated) {
        return <Navigate to="/onboarding" replace />;
    }

    const handleGoogleLogin = () => {
        dispatch(loginWithGoogle());
    };

    const handleSignup = (e) => {
        e.preventDefault();
        if (password.length < 6) return;
        dispatch(signupWithEmail({ email, password, name }));
    };

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col justify-between py-4 sm:py-8 px-3.5 sm:px-6 lg:px-8 relative w-full max-w-full overflow-x-hidden"
            style={{ background: 'var(--bg-primary)' }}>

            {/* Background Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-64 sm:w-80 h-64 sm:h-80 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-20 -right-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }} />
            </div>

            {/* Header */}
            <div className="w-full max-w-md mx-auto flex justify-between items-center mb-4 sm:mb-6 relative z-10 flex-shrink-0">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                        <span className="text-white font-bold text-base sm:text-lg">H</span>
                    </div>
                    <span className="font-bold text-lg sm:text-xl" style={{ color: 'var(--text-primary)' }}>HealthBridge</span>
                </Link>
                <ThemeToggle />
            </div>

            <div className="max-w-md w-full mx-auto animate-fadeIn relative z-10 my-auto">
                {/* Card */}
                <div className="rounded-2xl p-5 sm:p-8 shadow-2xl glass-card w-full">

                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                            Create Account
                        </h2>
                        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Start your personalized health journey
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-xl text-sm"
                            style={{
                                background: 'rgba(var(--color-accent-rgb), 0.1)',
                                border: '1px solid rgba(var(--color-accent-rgb), 0.3)',
                                color: 'var(--color-accent)'
                            }}>
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSignup}>
                        <div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input w-full"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        <div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input w-full"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="Password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input w-full"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full text-center"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="my-8 flex items-center">
                        <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                        <span className="px-4 text-sm" style={{ color: 'var(--text-muted)' }}>or continue with</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="btn-secondary w-full flex items-center justify-center gap-3"
                    >
                        <img className="h-5 w-5" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                        Google
                    </button>

                    <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
