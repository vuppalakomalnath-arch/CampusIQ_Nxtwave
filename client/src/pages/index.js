import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Search,
  BookOpen,
  FileCheck,
  ArrowRight,
  Bot,
  Layers,
  Award,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const features = [
    {
      icon: ShieldCheck,
      title: '100% Grounded College Answers',
      description:
        'Every answer is derived directly from verified institutional circulars, academic regulations, syllabi, and official policies.',
    },
    {
      icon: Layers,
      title: 'Hybrid Vector & Semantic Search',
      description:
        'Combines dense vector embeddings with exact keyword matching to find precise paragraphs, figures, and rules.',
    },
    {
      icon: FileCheck,
      title: 'Auditable Source Citations',
      description:
        'Inspect exact page numbers, document titles, relevance scores, and highlighting for complete transparency.',
    },
    {
      icon: BookOpen,
      title: 'Department-Wise Knowledge Bases',
      description:
        'Scoped document collections for Admissions, Examination Cell, Computer Science, Hostel Life, Placements, and more.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-slate-800/80 px-6 md:px-12 backdrop-blur-md bg-slate-950/60 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 shadow-lg shadow-brand-500/25">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold font-display tracking-tight text-white">CampusIQ</span>
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-brand-400">Institutional AI Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-500 hover:to-brand-400"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 md:px-12 md:pt-28 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/40 px-4 py-1.5 text-xs font-semibold text-brand-300 mb-8 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Next-Generation RAG Knowledge Engine for Campuses</span>
        </div>

        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
          Your Campus Knowledge, <br />
          <span className="bg-gradient-to-r from-brand-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Grounded & Instant.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
          Ask questions about college admissions, exam schedules, hostel rules, courses, fees, and placements. Receive
          grounded answers with exact citations from approved institution documents.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-500/30 transition hover:from-brand-500 hover:to-cyan-400"
          >
            <span>Ask the AI Assistant</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-8 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            <span>Admin & Faculty Portal</span>
          </Link>
        </div>

        {/* Interactive Query Preview Banner */}
        <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl shadow-2xl text-left max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 mb-3 uppercase tracking-wider">
            <Bot className="h-4 w-4" />
            <span>Sample Question & Verified Citation</span>
          </div>
          <p className="text-sm font-semibold text-slate-100">
            "What is the minimum attendance required to appear for final semester exams?"
          </p>
          <div className="mt-3 rounded-xl bg-slate-950/80 p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
            <p>
              Students must maintain at least <strong>75% attendance</strong> in each theory and laboratory course.
              Attendance between 65% and 74% may be condoned on valid medical grounds approved by the Academic Dean.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-brand-400 pt-1 border-t border-slate-800/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Source: Academic Regulations & Examination Guidelines (Page 1) — 96% Match</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Built for Complete Academic Trust</h2>
          <p className="mt-2 text-sm text-slate-400">
            Zero hallucination architecture designed strictly to serve verified campus facts.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-4 border border-brand-500/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-100">{f.title}</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-8 md:px-12 text-center text-xs text-slate-400">
        <p>© 2026 CampusIQ RAG College Platform. All college information grounded on institutional records.</p>
      </footer>
    </div>
  );
}
