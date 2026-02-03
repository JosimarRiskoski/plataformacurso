import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, CheckCircle, Smartphone } from 'lucide-react';

export default function SetupPending() {
    const { tenantSlug } = useParams();

    // Em produção, viria do banco ou contexto
    const whatsappNumber = "5511999999999";
    const message = encodeURIComponent(`Olá! Acabei de criar minha conta na Flix (slug: ${tenantSlug}) e gostaria de ativar minha plataforma e personalizar o design.`);

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                        <CheckCircle className="text-green-500 w-10 h-10" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                    Sua estrutura está <span className="text-green-500">reservada!</span>
                </h1>

                <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-lg mx-auto">
                    Você deu o primeiro passo. Agora, vamos deixar a plataforma com a <strong>sua cara</strong> e configurar seus meios de pagamento.
                </p>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-10 text-left">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Smartphone size={20} className="text-red-600" /> Próximos Passos:
                    </h3>
                    <ol className="space-y-4 text-zinc-300">
                        <li className="flex items-start gap-3">
                            <span className="bg-zinc-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                            <span>Nosso time vai entrar em contato para entender seu projeto.</span>
                        </li>
                        <li className="flex flex-col gap-2">
                            <div className="flex items-start gap-3">
                                <span className="bg-zinc-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                <span>Personalização do Design (Logo, Cores e Domínio).</span>
                            </div>

                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-zinc-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                            <span>Liberação do Painel Administrativo para cadastro de cursos.</span>
                        </li>
                    </ol>
                </div>

                <a
                    href={`https://wa.me/${whatsappNumber}?text=${message}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-green-900/20"
                >
                    <MessageCircle size={24} />
                    Ativar Minha Plataforma via WhatsApp
                </a>

                <p className="mt-8 text-zinc-500 text-sm">
                    Já falou com a gente? <Link to="/netflix/login" className="text-white hover:underline">Faça login aqui</Link>.
                </p>
            </div>
        </div>
    );
}
