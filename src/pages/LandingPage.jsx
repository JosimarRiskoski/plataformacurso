import React from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle, Smartphone, Layout, Users, DollarSign } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
            {/* Header */}
            <header className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="text-2xl font-black tracking-tighter text-red-600">FLIX.EDUCATION</div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <a href="#features" className="hover:text-white transition">Funcionalidades</a>
                        <a href="#demo" className="hover:text-white transition">Exemplo</a>
                        <a href="#pricing" className="hover:text-white transition">Preços</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/netflix/login" className="text-sm font-medium text-white hover:underline">Área do Aluno</Link>
                        <Link to="/signup-platform" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded font-bold transition text-sm">
                            Começar Agora
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-red-400 text-xs font-bold uppercase tracking-wide mb-6 border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Plataforma White-label v2.0
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
                        Crie sua própria <span className="text-red-600">Netflix de Cursos</span> sem programar.
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Transforme seu conhecimento em um negócio de assinatura recorrente.
                        Uma experiência de aprendizado premium, focada em engajamento e retenção.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Link to="/signup-platform" className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded font-bold text-lg transition flex items-center justify-center gap-2">
                            Criar Minha Plataforma Grátis
                        </Link>
                        <Link to="/netflix" className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded font-bold text-lg transition flex items-center justify-center gap-2 backdrop-blur-sm">
                            <Play size={20} fill="currentColor" /> Ver Demonstração
                        </Link>
                    </div>

                    <div className="mt-16 relative mx-auto max-w-5xl rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-red-900/20 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                        <img
                            src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
                            alt="Platform UI"
                            className="w-full opacity-80 group-hover:scale-105 transition duration-700"
                        />
                        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">dashboard_preview.png</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Tudo que você precisa para escalar.</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Deixe a tecnologia por nossa conta e foque no que importa: seu conteúdo.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Layout className="text-red-500" size={32} />}
                            title="Identidade Visual Premium"
                            description="Seus alunos vão sentir que estão navegando em um serviço de streaming de ponta. UX otimizada para retenção."
                        />
                        <FeatureCard
                            icon={<Smartphone className="text-red-500" size={32} />}
                            title="100% Responsivo"
                            description="Seu curso acessível em qualquer lugar. Celular, tablet ou desktop, a experiência é sempre perfeita."
                        />
                        <FeatureCard
                            icon={<Users className="text-red-500" size={32} />}
                            title="Área de Membros"
                            description="Controle total sobre quem acessa. Bloqueio sequencial de aulas, comentários e suporte integrado."
                        />
                        <FeatureCard
                            icon={<DollarSign className="text-red-500" size={32} />}
                            title="Checkout Integrado"
                            description="Venda seus cursos e receba pagamentos automaticamente. Sem taxas abusivas."
                        />
                        <FeatureCard
                            icon={<CheckCircle className="text-red-500" size={32} />}
                            title="Certificados Automáticos"
                            description="Emita certificados personalizados assim que o aluno concluir o curso. (Em breve)"
                        />
                        <FeatureCard
                            icon={<Play className="text-red-500" size={32} />}
                            title="Video Player Seguro"
                            description="Hospedagem de vídeo integrada ou use YouTube/Vimeo/Wistia com nossa camada de proteção."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing / CTA */}
            <section className="py-24 border-t border-white/10">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black mb-8">Pronto para lançar sua própria plataforma?</h2>
                    <div className="bg-gradient-to-br from-zinc-900 to-black p-1">
                        <div className="bg-black p-12 rounded-lg border border-zinc-800">
                            <p className="text-gray-400 mb-8 text-lg">Teste gratuitamente. Sem cartão de crédito. Cancele quando quiser.</p>
                            <Link to="/signup-platform" className="inline-block w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded font-bold text-xl transition transform hover:scale-105">
                                COMEÇAR AGORA ➔
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 bg-black">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-zinc-500 text-sm">© 2025 FLIX.EDUCATION. Todos os direitos reservados.</div>
                    <div className="flex gap-6 text-sm text-zinc-400">
                        <a href="#" className="hover:text-white">Termos</a>
                        <a href="#" className="hover:text-white">Privacidade</a>
                        <a href="#" className="hover:text-white">Suporte</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-2xl hover:bg-zinc-900 hover:border-red-500/20 transition duration-300 group">
            <div className="bg-black w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    );
}
