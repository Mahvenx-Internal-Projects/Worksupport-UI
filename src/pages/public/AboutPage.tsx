import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-16 px-4">
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
      <div className="mb-6">
        <div className="text-sm uppercase tracking-[0.25em] text-blue-600 font-bold mb-2">About WorkSupport360</div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">We protect your identity while you earn freelance work.</h1>
        <p className="text-sm text-slate-600 leading-relaxed">WorkSupport360 is an identity-safe freelancer marketplace for professionals who want to work privately, get paid securely, and keep their employer unaware. We connect clients with verified, vetted experts while preserving privacy and legal compliance.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">For freelancers</h2>
          <p className="text-sm text-slate-600 leading-relaxed">Create a private profile, show only an alias to clients, and keep your employer out of the loop. Admin verifies identity and manages client communication.</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">For clients</h2>
          <p className="text-sm text-slate-600 leading-relaxed">Hire verified experts for short-term projects with secure payments and admin-managed coordination. No employer exposure, no direct contact bypass.</p>
        </div>
      </div>

      <div className="mt-8 space-y-4 text-sm text-slate-600 leading-relaxed">
        <p><strong>Privacy first:</strong> Freelancers appear under aliases, their company and real name are never shown to clients. We keep the working relationship safe and compliant.</p>
        <p><strong>Secure coordination:</strong> Our admins handle scheduling, payment approvals, and dispute support so both clients and freelancers can focus on work.</p>
        <p><strong>Transparent policy:</strong> We charge a platform commission on every project and provide full terms, privacy, and contact support for every user.</p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Link to="/" className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-6 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors">Back to home</Link>
        <Link to="/terms" className="inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-900 px-6 py-3 text-sm font-semibold hover:bg-slate-100 transition-colors">View terms</Link>
      </div>
    </div>
  </div>
);

export default AboutPage;
