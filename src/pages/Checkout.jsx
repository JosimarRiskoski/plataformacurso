import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, CreditCard, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
    const { tenantSlug, courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        supabase.from('courses').select('*').eq('id', courseId).single()
            .then(({ Data }) => { if (Data) setCourse(Data) }); // Typo fix: data -> Data? No, it's lower case data usually. supabase returns data.
        // Wait, let's allow basic fetch first.
        supabase.from('courses').select('*').eq('id', courseId).single().then(({ data }) => setCourse(data));
    }, [courseId]);

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulating API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/${tenantSlug}/assistir/${courseId}`);
            }, 2000);
        }, 1500);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
                <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h1>
                    <p className="text-gray-600">Redirecionando para o curso...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
                    <h2 className="text-lg font-bold mb-4">Resumo do Pedido</h2>
                    {course ? (
                        <div className="flex gap-4 mb-4">
                            <img src={course.thumbnail_url} className="w-24 h-16 object-cover rounded" alt="" />
                            <div>
                                <h3 className="font-medium line-clamp-2">{course.title}</h3>
                                <p className="text-sm text-gray-500">Acesso Vitalício</p>
                            </div>
                        </div>
                    ) : <div className="animate-pulse bg-gray-200 h-20 rounded mb-4"></div>}

                    <div className="border-t border-gray-100 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span>R$ 197,00</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-2">
                            <span>Total</span>
                            <span>R$ 197,00</span>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-6 text-gray-800">
                        <Lock size={16} className="text-green-600" />
                        <span className="text-sm font-medium">Pagamento Seguro</span>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome no Cartão</label>
                            <input type="text" className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Como impresso no cartão" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                            <div className="relative">
                                <input type="text" className="w-full border border-gray-300 rounded p-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0000 0000 0000 0000" required />
                                <CreditCard className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                                <input type="text" className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="MM/AA" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                <input type="text" className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="123" required />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition mt-6 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processando...' : 'Pagar R$ 197,00'}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            Este é um checkout simulado. Nenhuma cobrança real será feita.
                        </p>
                    </form>
                </div>

            </div>
        </div>
    );
}
