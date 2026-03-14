import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Hammer, User, Search, Globe, LayoutDashboard, ChevronDown, LogIn, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const toggleLang = () => {
        setLanguage(language === 'hi' ? 'en' : 'hi');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        if (user.type === 'worker') return '/worker-dashboard';
        if (user.type === 'employer') return '/employer-dashboard';
        if (user.type === 'contractor') return '/contractor-dashboard';
        return '/';
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-brand-orange p-2 rounded-lg text-white">
                            <Hammer size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-brand-dark leading-tight">WorkSathi</h1>
                            <span className="text-xs text-brand-orange font-semibold tracking-wider">Labourer/Contractors Platform</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="font-medium text-gray-600 hover:text-brand-orange">
                            {t('home')}
                        </Link>
                        <Link to="/about" className="font-medium text-gray-600 hover:text-brand-orange">
                            {t('about')}
                        </Link>

                        <button
                            onClick={toggleLang}
                            className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 text-sm font-medium hover:bg-gray-50"
                        >
                            <Globe size={16} />
                            {language === 'hi' ? 'English' : 'हिंदी'}
                        </button>

                        {/* Conditional Rendering: Logged In vs Logged Out */}
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to={getDashboardLink()}
                                    className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="font-medium text-gray-800">{user.name || 'User'}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Login Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsLoginOpen(!isLoginOpen)}
                                        className="flex items-center gap-1 font-medium text-gray-600 hover:text-brand-orange"
                                    >
                                        <LogIn size={18} />
                                        {t('login')}
                                        <ChevronDown size={14} />
                                    </button>

                                    {isLoginOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in-down">
                                            <Link
                                                to="/employer-login"
                                                onClick={() => setIsLoginOpen(false)}
                                                className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                                            >
                                                Login as Employer
                                            </Link>
                                            <Link
                                                to="/contractor-login"
                                                onClick={() => setIsLoginOpen(false)}
                                                className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                                            >
                                                Login as Contractor
                                            </Link>
                                            <Link
                                                to="/worker-login"
                                                onClick={() => setIsLoginOpen(false)}
                                                className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                                            >
                                                Login as Worker
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <Link to="/register-worker" className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                                    <User size={18} />
                                    {t('registerWorker')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-600 focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isOpen && (
                    <div className="md:hidden pb-4">
                        <div className="flex flex-col gap-4 mt-4">
                            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-gray-600 border-b border-gray-100">
                                {t('home')}
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        to={getDashboardLink()}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 py-2 border-b border-gray-100"
                                    >
                                        <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{user.name || 'User'}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user.type}</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-2 py-2 text-red-600 font-medium"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="py-2 border-b border-gray-100">
                                        <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Login As</p>
                                        <Link to="/employer-login" onClick={() => setIsOpen(false)} className="block py-1 text-brand-dark font-medium">
                                            Employer
                                        </Link>
                                        <Link to="/contractor-login" onClick={() => setIsOpen(false)} className="block py-1 text-brand-dark font-medium">
                                            Contractor
                                        </Link>
                                        <Link to="/worker-login" onClick={() => setIsOpen(false)} className="block py-1 text-brand-dark font-medium">
                                            Worker
                                        </Link>
                                    </div>
                                    <Link to="/register-worker" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center justify-center">
                                        {t('registerWorker')}
                                    </Link>
                                </>
                            )}

                            <button
                                onClick={() => { toggleLang(); setIsOpen(false); }}
                                className="flex items-center gap-2 py-2 text-gray-600 border-b border-gray-100"
                            >
                                <Globe size={20} />
                                Switch to {language === 'hi' ? 'English' : 'हिंदी'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
