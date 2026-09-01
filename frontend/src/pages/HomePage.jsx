import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ThemeToggle from '../components/ThemeToggle';
import { Sparkles, MessageSquare, Activity, ShieldCheck, ChevronRight, ArrowRight, User } from 'lucide-react';

export default function HomePage() {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col justify-between w-full max-w-full overflow-x-hidden"
            style={{ background: 'var(--bg-primary)' }}>

            {/* Background Ambient Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-24 -left-24 w-80 sm:w-[30rem] h-80 sm:h-[30rem] rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }} />
            </div>

            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 backdrop-blur-lg w-full"
                style={{
                    background: 'rgba(var(--bg-surface-rgb, 255, 255, 255), 0.85)',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 gap-2">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                                <span className="text-white font-bold text-base sm:text-lg">H</span>
                            </div>
                            <span className="text-base sm:text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                                HealthBridge
                            </span>
                        </Link>

                        {/* Navigation Right */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <ThemeToggle />
                            {isAuthenticated ? (
                                <Link to="/dashboard"
                                    className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-105"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                                        color: 'white'
                                    }}>
                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Dashboard</span>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login"
                                        className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                                        style={{ color: 'var(--text-primary)' }}>
                                        Sign In
                                    </Link>
                                    <Link to="/signup"
                                        className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-16 text-center relative z-10 w-full">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-6 animate-fadeIn"
                    style={{
                        background: 'rgba(var(--color-primary-rgb), 0.12)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(var(--color-primary-rgb), 0.25)'
                    }}>
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>AI-Powered Preventive Health Coach</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight break-words"
                    style={{ color: 'var(--text-primary)' }}>
                    Personalized Health & Risk Reduction for{' '}
                    <span className="text-gradient">Every Lifestyle</span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
                    style={{ color: 'var(--text-secondary)' }}>
                    Transform clinical guidelines into realistic, actionable daily micro-habits tailored to your unique health profile, genetics, and environment.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-14 sm:mb-20 w-full px-2">
                    <Link to="/chat"
                        className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base py-3.5 px-6 shadow-xl hover:scale-105 active:scale-95">
                        Start Health Assessment
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <Link to={isAuthenticated ? "/dashboard" : "/login"}
                        className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base py-3.5 px-6 hover:scale-105 active:scale-95">
                        View Dashboard
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                </div>

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left w-full">
                    {[
                        {
                            icon: MessageSquare,
                            title: 'AI Health Coach',
                            desc: 'Engage with an intelligent assistant for 24/7 lifestyle and nutrition guidance.',
                            color: 'var(--color-primary)'
                        },
                        {
                            icon: Activity,
                            title: 'Targeted Prevention',
                            desc: 'Specialized habit roadmaps for hypertension and Type 2 diabetes risk reduction.',
                            color: 'var(--color-accent)'
                        },
                        {
                            icon: ShieldCheck,
                            title: 'Context-Aware Care',
                            desc: 'Actionable micro-habits adapted to your socioeconomic and daily environment.',
                            color: '#10b981'
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="glass-card p-5 sm:p-6 rounded-2xl transition-all hover:scale-[1.02] w-full">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
                                style={{ background: `${feature.color}20` }}>
                                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: feature.color }} />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                {feature.title}
                            </h3>
                            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

            </main>

            {/* Footer */}
            <footer className="py-6 border-t text-center relative z-10 w-full"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                    © {new Date().getFullYear()} HealthBridge AI • Preventive Health for Everyone
                </p>
            </footer>

        </div>
    );
}
