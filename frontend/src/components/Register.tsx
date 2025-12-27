import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register(email, password, name);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al registrarse');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
                <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Crear Cuenta</h1>
                <p className="text-center text-slate-500 mb-6 text-sm italic">Únete a la comunidad de Kitchen Pro</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Nombre Completo</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Registrarse
                    </button>
                    <p className="text-center text-sm text-slate-500 mt-4">
                        ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Inicia sesión</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
