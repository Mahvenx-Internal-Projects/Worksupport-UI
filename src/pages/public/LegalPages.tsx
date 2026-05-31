import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, DollarSign, Lock, Users, FileText, ChevronDown } from 'lucide-react';

// ── Shared layout ─────────────────────────────────────────────
const PageLayout: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode; accentColor?: string }> = ({
  title, subtitle, icon, children, accentColor = '#f97316'
}) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16}/> Back
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ background: `linear-gradient(135deg, ${accentColor}, #dc2626)` }}>WS</div>
            <span className="font-black text-gray-900">WorkSupport<span style={{ color: accentColor }}>360</span></span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="py-12 px-5" style={{ background: `linear-gradient(135deg, #0f172a, #1e3a5f)` }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white" style={{ background: accentColor + '33', border: `1px solid ${accentColor}66` }}>
            {icon}
          </div>
          <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1>
          <p className="text-white/50 text-sm">{subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-10 text-sm text-gray-400">
        © 2025 WorkSupport360 · <a href="mailto:help@worksupport360.com" className="hover:text-gray-600">help@worksupport360.com</a> · WhatsApp: +91-9441363687
      </div>
    </div>
  );
};

// ── Section component ─────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode; highlight?: string }> = ({ title, children, highlight }) => (
  <div className="px-8 py-6 border-b border-gray-50 last:border-0">
    {highlight && (
      <div className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full mb-3 uppercase tracking-wider ${
        highlight === 'critical' ? 'bg-red-50 text-red-600 border border-red-100' :
        highlight === 'important' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
        'bg-blue-50 text-blue-600 border border-blue-100'
      }`}>
        {highlight === 'critical' ? <AlertTriangle size={11}/> : <Shield size={11}/>}
        {highlight}
      </div>
    )}
    <h2 className="text-lg font-black text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

const P: React.FC<{ children: React.ReactNode; bold?: boolean; red?: boolean }> = ({ children, bold, red }) => (
  <p className={`text-sm leading-relaxed mb-2 ${bold ? 'font-bold text-gray-900' : red ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>{children}</p>
);

const Li: React.FC<{ children: React.ReactNode; red?: boolean; green?: boolean }> = ({ children, red, green }) => (
  <li className={`flex items-start gap-2.5 text-sm leading-relaxed mb-1.5 ${red ? 'text-red-700' : green ? 'text-green-700' : 'text-gray-600'}`}>
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: red ? '#dc2626' : green ? '#16a34a' : '#94a3b8' }}/>
    <span>{children}</span>
  </li>
);

const Box: React.FC<{ children: React.ReactNode; type?: 'warning' | 'info' | 'success' }> = ({ children, type = 'info' }) => {
  const styles = {
    warning: 'bg-red-50 border-l-4 border-red-400 text-red-800',
    info: 'bg-blue-50 border-l-4 border-blue-400 text-blue-800',
    success: 'bg-green-50 border-l-4 border-green-400 text-green-800',
  };
  return <div className={`${styles[type]} rounded-r-xl px-4 py-3 text-sm mb-4 leading-relaxed`}>{children}</div>;
};

// ══════════════════════════════════════════════════════════════
// TERMS & CONDITIONS
// ══════════════════════════════════════════════════════════════
export const TermsPage: React.FC = () => (
  <PageLayout
    title="Terms & Conditions"
    subtitle={`Effective date: January 1, 2025 · Last updated: ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`}
    icon={<FileText size={26}/>}
    accentColor="#f97316">

    {/* Intro */}
    <Section title="1. Agreement to Terms">
      <P>By creating an account, browsing, or using any service on WorkSupport360 ("Platform"), you agree to these Terms & Conditions. If you do not agree, do not use the platform.</P>
      <P>These terms apply to all users — Clients, Freelancers (Experts), and Admins.</P>
      <Box type="info">WorkSupport360 is a managed marketplace. All projects are admin-coordinated. We are not a passive listing board — WorkSupport360 actively coordinates meetings, verifies identity, holds escrow, and manages payments.</Box>
    </Section>

    {/* Commission and payments */}
    <Section title="2. Platform Commission & Fees" highlight="important">
      <P bold>WorkSupport360 earns commission on every project. This is how the platform is funded.</P>
      <div className="overflow-hidden rounded-xl border border-gray-100 mb-4">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="text-left px-4 py-3 font-black text-gray-700">Plan</th><th className="text-left px-4 py-3 font-black text-gray-700">Monthly Fee</th><th className="text-left px-4 py-3 font-black text-gray-700">Commission Rate</th><th className="text-left px-4 py-3 font-black text-gray-700">Hours Included</th></tr></thead>
          <tbody>
            {[
              ['Pay As You Go', 'Free', '15%', '0 hrs'],
              ['Starter', '$199/month', '15%', '10 hrs/month'],
              ['Growth', '$449/month', '12%', '25 hrs/month'],
              ['Enterprise', '$999/month', '10%', '75 hrs/month'],
            ].map(([plan, fee, comm, hrs], i) => (
              <tr key={plan} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-4 py-3 font-semibold text-gray-800">{plan}</td>
                <td className="px-4 py-3 text-gray-600">{fee}</td>
                <td className="px-4 py-3 font-bold text-orange-600">{comm}</td>
                <td className="px-4 py-3 text-gray-600">{hrs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>Quick Support sessions: WorkSupport360 earns <strong>20% platform fee</strong> per session.</P>
      <P>Subscription fees are non-refundable once the billing period starts. Commission is automatically deducted from each invoice.</P>
    </Section>

    {/* CRITICAL: No bypass rule */}
    <Section title="3. Strict Anti-Circumvention Policy" highlight="critical">
      <Box type="warning">
        <strong>⚠️ CRITICAL RULE — Violation results in permanent account ban and legal action.</strong>
      </Box>
      <P bold>You are strictly prohibited from:</P>
      <ul className="mb-4">
        <Li red>Contacting a freelancer/client directly to conduct transactions outside the WorkSupport360 platform</Li>
        <Li red>Sharing personal email addresses, phone numbers, or social media profiles before project activation (other than what admin provides)</Li>
        <Li red>Paying or receiving payment for any work arranged through WorkSupport360 outside our payment system</Li>
        <Li red>Using information obtained through the platform to establish a direct working relationship that bypasses our billing system</Li>
        <Li red>Asking a freelancer for their real employer name, LinkedIn, or any information that would identify them beyond their alias</Li>
        <Li red>Sharing the platform's verified freelancer contact with third parties or competitors</Li>
      </ul>
      <P bold>Consequences of violation:</P>
      <ul className="mb-4">
        <Li red>Immediate permanent ban from the platform for both parties</Li>
        <Li red>Invoice for the full commission that would have been earned (minimum $500 or equivalent)</Li>
        <Li red>Legal action for breach of contract and damages</Li>
        <Li red>Notification to the freelancer's employer if the freelancer was involved in circumvention</Li>
      </ul>
      <Box type="info">
        <strong>Why this rule exists:</strong> WorkSupport360 invests in vetting, verifying identity, managing escrow, coordinating projects, and protecting privacy. Our commission funds all of this. Bypassing it destroys the platform for everyone.
      </Box>
    </Section>

    {/* Payment obligations */}
    <Section title="4. Payment Obligations & Escrow" highlight="important">
      <P bold>Client payment obligations:</P>
      <ul className="mb-3">
        <Li>Client must pay invoices within 7 days of the due date shown on the invoice</Li>
        <Li>Overdue invoices (past 7 days) are subject to a 2% monthly late fee</Li>
        <Li>Continued non-payment beyond 14 days results in project suspension and legal recovery</Li>
        <Li>Payment must be made through the platform's official bank account or payment gateway — not directly to the freelancer</Li>
        <Li>All funds are held in escrow by WorkSupport360 and released to freelancers only after client approval of timesheets</Li>
      </ul>
      <P bold>Freelancer payout schedule:</P>
      <ul className="mb-3">
        <Li green>Payouts processed within 3 business days of client payment confirmation</Li>
        <Li green>Freelancers receive the agreed amount minus commission percentage</Li>
        <Li green>Payout via NEFT/RTGS/UPI to registered bank account only</Li>
        <Li>Freelancers must maintain accurate bank details in their profile for timely payouts</Li>
      </ul>
      <P bold>GST (Indian clients only):</P>
      <ul className="mb-3">
        <Li>18% GST is added to all project invoices for Indian clients</Li>
        <Li>GST-compliant invoices provided — clients can claim input tax credit with their GSTIN</Li>
        <Li>International clients: no GST applicable</Li>
      </ul>
    </Section>

    {/* On-time delivery */}
    <Section title="5. Freelancer Obligations & Service Quality" highlight="important">
      <P bold>As a freelancer on WorkSupport360, you agree to:</P>
      <ul className="mb-3">
        <Li green>Deliver work on time as per agreed project schedule</Li>
        <Li green>Submit accurate weekly timesheets — falsified hours lead to immediate account termination</Li>
        <Li green>Respond to client messages within agreed response time (typically 24 hrs business days)</Li>
        <Li green>Maintain professional conduct at all times during calls, chats, and project work</Li>
        <Li green>Notify admin within 24 hours if you cannot complete a project or need to withdraw</Li>
        <Li green>Keep your availability status accurate — mark yourself unavailable when you cannot take work</Li>
      </ul>
      <Box type="warning">
        <strong>⚠️ If a freelancer fails to deliver on time without valid reason:</strong> WorkSupport360 may reassign the project, withhold the payment for the undelivered milestone, and add a negative record to the freelancer's profile. Repeated failure results in account suspension.
      </Box>
      <P bold>Rule: Do not break the commitment once a project is started.</P>
      <P>We understand emergencies happen. Always communicate early with admin — we will handle client communication professionally. Disappearing without notice is strictly not acceptable.</P>
    </Section>

    {/* Identity and alias */}
    <Section title="6. Identity Protection & Alias System">
      <P>WorkSupport360 provides an alias system to protect freelancers' identities. However:</P>
      <ul className="mb-3">
        <Li>Freelancers must not misrepresent their qualifications, experience, or skills during registration or client interactions</Li>
        <Li>Admin verifies real identity once — this is required for the platform to operate legally and safely</Li>
        <Li>If we discover a freelancer has provided false information, the account is immediately terminated and any pending payouts forfeited</Li>
        <Li>Clients must not attempt to discover a freelancer's real identity beyond what is shared by admin</Li>
      </ul>
    </Section>

    {/* Dispute resolution */}
    <Section title="7. Dispute Resolution">
      <P bold>All disputes are first handled by WorkSupport360 admin.</P>
      <ul className="mb-3">
        <Li>Raise a dispute by emailing help@worksupport360.com with your project ID and issue details</Li>
        <Li>Admin will review within 2 business days and issue a resolution</Li>
        <Li>If client disputes timesheet hours, admin reviews work logs, standups, and deliverables as evidence</Li>
        <Li>Platform decisions on disputes are final for amounts under $500. Above $500, either party may escalate to Indian courts</Li>
        <Li>Jurisdiction: Hyderabad, Telangana, India</Li>
      </ul>
    </Section>

    {/* Termination */}
    <Section title="8. Account Termination">
      <P>WorkSupport360 reserves the right to terminate any account immediately and without refund for:</P>
      <ul className="mb-3">
        <Li red>Anti-circumvention policy violation</Li>
        <Li red>Fraudulent timesheets or billing</Li>
        <Li red>Harassment, abusive conduct, or unprofessional behavior</Li>
        <Li red>Sharing platform data with competitors</Li>
        <Li red>Any activity that harms the platform, other users, or WorkSupport360's reputation</Li>
      </ul>
    </Section>

    <Section title="9. Contact & Governing Law">
      <P>These Terms are governed by Indian law. Any disputes are subject to the jurisdiction of courts in Hyderabad, Telangana.</P>
      <P>Contact: <strong>help@worksupport360.com</strong> · WhatsApp: <strong>+91-9441363687</strong></P>
    </Section>
  </PageLayout>
);

// ══════════════════════════════════════════════════════════════
// PRIVACY POLICY
// ══════════════════════════════════════════════════════════════
export const PrivacyPage: React.FC = () => (
  <PageLayout
    title="Privacy Policy"
    subtitle={`Effective date: January 1, 2025 · Last updated: ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`}
    icon={<Lock size={26}/>}
    accentColor="#3b82f6">

    <Section title="1. Our Core Privacy Promise">
      <Box type="success">
        <strong>🔒 The #1 thing you need to know:</strong> If you are a freelancer, your real name and current employer are NEVER shared with clients. Period. Clients only ever see your alias name (e.g., "Rahul S."). Your company will never know you are freelancing on WorkSupport360.
      </Box>
      <P>WorkSupport360 was built specifically to protect the professional identity of MNC employees who freelance. Privacy is not an afterthought — it is the foundation of our platform.</P>
    </Section>

    <Section title="2. What Information We Collect">
      <P bold>From Freelancers:</P>
      <ul className="mb-4">
        <Li>Real name (stored encrypted, shown only to admin)</Li>
        <Li>Current company and job title (stored encrypted, NEVER shown to clients)</Li>
        <Li>Work email (for verification only — optional)</Li>
        <Li>Mobile number (admin contacts you for project coordination)</Li>
        <Li>Professional experience, skills, hourly rate (shown on public profile as alias)</Li>
        <Li>Bank account details (stored encrypted, used only for payouts)</Li>
        <Li>Availability schedule and timezone</Li>
        <Li>ID verification documents (stored securely, admin-only access)</Li>
      </ul>
      <P bold>From Clients:</P>
      <ul className="mb-4">
        <Li>Company name, contact name, industry, country</Li>
        <Li>Email address and mobile number</Li>
        <Li>GST number (if provided for tax purposes)</Li>
        <Li>Project details, billing information</Li>
        <Li>Payment transaction records</Li>
      </ul>
      <P bold>Automatically collected:</P>
      <ul className="mb-4">
        <Li>Login timestamps and IP address (for security and attendance tracking)</Li>
        <Li>Session activity (pages visited, features used)</Li>
        <Li>Device type and browser (for compatibility)</Li>
      </ul>
    </Section>

    <Section title="3. How We Use Your Data" highlight="important">
      <P bold>We use your data ONLY for:</P>
      <ul className="mb-4">
        <Li green>Operating the platform — matching clients with freelancers</Li>
        <Li green>Sending project notifications, meeting invites, and invoices</Li>
        <Li green>Processing payments and payouts</Li>
        <Li green>Identity verification (admin only, never client-facing)</Li>
        <Li green>Customer support and dispute resolution</Li>
        <Li green>Improving platform functionality</Li>
      </ul>
      <P bold red>We NEVER:</P>
      <ul className="mb-4">
        <Li red>Sell your data to third parties</Li>
        <Li red>Share freelancer real identity with clients or anyone outside admin</Li>
        <Li red>Show your employer name in any public or client-facing context</Li>
        <Li red>Use your data for advertising or marketing without consent</Li>
        <Li red>Share your mobile number with clients (admin contacts freelancers directly)</Li>
        <Li red>Notify your employer about your freelancing activity</Li>
      </ul>
    </Section>

    <Section title="4. Data Shared With Third Parties">
      <P>We share minimal data with trusted service providers necessary to operate:</P>
      <ul className="mb-3">
        <Li><strong>GoDaddy SMTP</strong> — for sending email notifications (email address only)</Li>
        <Li><strong>Google OAuth</strong> — if you sign in with Google, Google receives your login action (no project data)</Li>
        <Li><strong>Payment gateways</strong> — transaction amounts and reference numbers only</Li>
      </ul>
      <Box type="info">None of these providers receive freelancer company/identity information. All third-party data processing complies with GDPR and Indian IT Act 2000.</Box>
    </Section>

    <Section title="5. Data Retention">
      <ul className="mb-3">
        <Li>Account data retained while your account is active + 3 years after deletion (legal requirement)</Li>
        <Li>Invoice and payment records retained for 7 years (Indian tax law)</Li>
        <Li>Project records retained for 3 years after project completion</Li>
        <Li>You may request deletion of personal data (excluding legally required financial records) by emailing help@worksupport360.com</Li>
      </ul>
    </Section>

    <Section title="6. Security Measures">
      <ul className="mb-3">
        <Li green>JWT tokens with 1-hour expiry + 30-day refresh rotation</Li>
        <Li green>BCrypt password hashing — plain text never stored</Li>
        <Li green>Sensitive data (real name, company, bank details) stored with encryption</Li>
        <Li green>HTTPS/TLS for all data in transit</Li>
        <Li green>Admin-only access to identity documents</Li>
        <Li green>MySQL database on private network with restricted access</Li>
        <Li green>Regular security audits and penetration testing</Li>
      </ul>
    </Section>

    <Section title="7. Your Rights">
      <P>You have the right to:</P>
      <ul className="mb-3">
        <Li green>Access all data we hold about you (email request to help@worksupport360.com)</Li>
        <Li green>Correct inaccurate personal data (via profile settings or email)</Li>
        <Li green>Delete your account and data (excluding legal financial records)</Li>
        <Li green>Withdraw consent for marketing communications (unsubscribe link in emails)</Li>
        <Li green>Data portability — receive your data in a machine-readable format</Li>
      </ul>
    </Section>

    <Section title="8. Cookies">
      <P>We use essential cookies only:</P>
      <ul className="mb-3">
        <Li>Authentication session (JWT refresh token storage)</Li>
        <Li>User preferences (theme, language)</Li>
      </ul>
      <P>We do NOT use advertising cookies, tracking pixels, or third-party analytics that profile you.</P>
    </Section>

    <Section title="9. Contact — Data Protection">
      <P>For any privacy concerns, data requests, or to exercise your rights:</P>
      <P bold>Email: help@worksupport360.com</P>
      <P bold>WhatsApp: +91-9441363687</P>
      <P>We respond to all privacy requests within 5 business days.</P>
    </Section>
  </PageLayout>
);
