import React from 'react';
import { Link } from 'react-router-dom';

const BlogPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-16 px-4">
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
      <div className="mb-6">
        <div className="text-sm uppercase tracking-[0.25em] text-blue-600 font-bold mb-2">WorkSupport360 blog</div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Insights, privacy advice, and freelancer best practices.</h1>
        <p className="text-sm text-slate-600 leading-relaxed">This space shares news about identity-safe freelancing, platform updates, hiring tips, and project success stories.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <article className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Why privacy-first freelancing matters</h2>
          <p className="text-sm text-slate-600 leading-relaxed">Learn how to protect your professional identity while taking extra work, without exposing your employer or violating company policy.</p>
        </article>
        <article className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">How clients can hire safely</h2>
          <p className="text-sm text-slate-600 leading-relaxed">Understand the rules for hiring anonymous experts, paying through the platform, and avoiding off-platform risks.</p>
        </article>
      </div>

      <div className="mt-8 space-y-4 text-sm text-slate-600 leading-relaxed">
        <p>More articles and case studies will appear here as the platform grows. For now, contact us directly if you want updates or want to publish a story.</p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Link to="/" className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-6 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors">Back to home</Link>
        <Link to="/privacy" className="inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-900 px-6 py-3 text-sm font-semibold hover:bg-slate-100 transition-colors">Privacy policy</Link>
      </div>
    </div>
  </div>
);

export default BlogPage;
