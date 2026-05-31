import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, X, Send, ChevronDown, ChevronRight,
  Loader2, Check, User, Bot, Headphones, Clock, AlertCircle,
  RefreshCw, Star, Zap, Shield, DollarSign, Lock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

// ── Types ────────────────────────────────────────────────────
interface Msg {
  id: string;
  from: 'bot' | 'user' | 'agent';
  text: string;
  time: Date;
  options?: string[];
  isTyping?: boolean;
}

interface TicketStatus {
  status: string;
  assignedAgentName?: string;
  priority?: string;
  lastMessageAt?: string;
}

// ── Bot question flow ────────────────────────────────────────
const BOT_FLOW = {
  start: {
    text: "Hi! 👋 Welcome to **WorkSupport360** support. I'm here to help! Let me ask you a few quick questions so I can route you to the right person.",
    next: 'whoAreYou',
  },
  whoAreYou: {
    text: "First — who are you?",
    options: ['👤 I\'m a Client (hiring)', '🧑‍💻 I\'m a Freelancer', '🌐 Just browsing / New here'],
    next: 'whatHelp',
  },
  whatHelp: {
    text: "What do you need help with?",
    clientOptions: ['💳 Payment / Invoice issue', '👤 Expert / Project question', '📊 My subscription / plan', '🔒 Account or login issue', '⚡ Quick Support booking', '📝 Other'],
    freelancerOptions: ['💰 Payout not received', '📋 Project assignment question', '🔐 Profile / Identity issue', '⏱ Timesheet / Approval issue', '🏦 Bank details / Payout setup', '📝 Other'],
    visitorOptions: ['💡 How does it work?', '💰 Pricing & plans', '🔒 Identity safety question', '📞 Talk to sales', '📝 Other'],
    next: 'urgency',
  },
  urgency: {
    text: "How urgent is this?",
    options: ['🔴 Critical — affecting my project right now', '🟡 Important — need help today', '🟢 Can wait — general question'],
    next: 'contact',
  },
  contact: {
    text: "What's your email address so our agent can follow up with you?\n\nPlease enter a valid email (e.g. name@company.com) or type **skip** to continue without one.",
    allowSkip: true,
    next: 'describe',
  },
  describe: {
    text: "Almost done! Briefly describe your issue in 1-2 sentences — the more detail you give, the faster our agent can help:",
    next: 'submit',
  },
};

// ── AI smart replies ─────────────────────────────────────────
const getAiReply = (text: string): string | null => {
  const l = text.toLowerCase();
  if (l.match(/payment|invoice|billing|pay now|overdue/))
    return "💳 **Payments** — Invoices are generated after timesheet approval. Admin sends bank details via email. Pay within 7 days. Overdue invoices get a 2% monthly fee. Check `/client/invoices` for status.";
  if (l.match(/payout|receive money|not paid|bank transfer|utr/))
    return "💰 **Payouts** — Processed within 3 business days after client payment. Add your bank details in My Profile → Bank Details. Still waiting? WhatsApp **+91-9441363687**.";
  if (l.match(/hire|expert|browse|find developer|request demo/))
    return "🎯 **Hiring** — Browse → Click Request → Admin schedules demo in 4 hrs → Approve → Project starts. All experts are ID-verified MNC professionals.";
  if (l.match(/gst|tax|18%|gstin/))
    return "🇮🇳 **GST** — 18% GST is added for Indian clients. Add your GSTIN in profile for input tax credit. International clients: no GST.";
  if (l.match(/quick support|urgent help|30 min|call now/))
    return "⚡ **Quick Support** — Pick an available expert on the homepage, describe your problem, they join Zoom/Meet in ~30 minutes. 20% platform fee applies.";
  if (l.match(/password|login|sign in|forgot|reset/))
    return "🔐 **Login issues** — Use 'Sign in with Google' for instant access, or click 'Forgot password' on the login page. Still stuck? Email **help@worksupport360.com**.";
  if (l.match(/privacy|employer|company|anonymous|alias|identity/))
    return "🔒 **Your privacy** — Clients only see your alias name (e.g. 'Rahul S.'). Your real name and employer are NEVER shared. Your company will never know you're freelancing.";
  if (l.match(/commission|platform fee|percentage|how much/))
    return "💼 **Fees** — Platform commission: 15% (PAYG/Starter), 12% (Growth), 10% (Enterprise). Quick Support: 20% per session. Subscriptions from $199/month.";
  if (l.match(/project|assignment|start|activate|pending payment/))
    return "📋 **Projects** — Projects start after client pays the invoice. Status: Pending Payment → Active → Completed. Check /freelancer/assignments or /client/projects.";
  return null;
};

const priorityFromUrgency = (u: string) => {
  if (u.includes('Critical')) return 'urgent';
  if (u.includes('Important')) return 'high';
  return 'normal';
};

const categoryFromTopic = (t: string) => {
  if (t.includes('Payment') || t.includes('Invoice') || t.includes('Payout') || t.includes('Bank')) return 'payments';
  if (t.includes('Project') || t.includes('Expert') || t.includes('Assignment')) return 'project';
  if (t.includes('Account') || t.includes('Login') || t.includes('Profile')) return 'account';
  if (t.includes('subscription') || t.includes('plan')) return 'billing';
  if (t.includes('Quick Support')) return 'quick_support';
  if (t.includes('pricing') || t.includes('How')) return 'general';
  return 'general';
};

// ── Chat Bubble Component ─────────────────────────────────────
const Bubble: React.FC<{ msg: Msg; agentName?: string }> = ({ msg, agentName }) => {
  const isUser = msg.from === 'user';
  const isAgent = msg.from === 'agent';

  const formattedText = msg.text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  return (
    <div className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 text-white text-xs font-black ${isAgent ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
          {isAgent ? (agentName?.[0] || 'A') : 'W'}
        </div>
      )}

      <div className={`flex flex-col gap-0.5 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Sender label */}
        {isAgent && (
          <span className="text-xs font-semibold text-green-700 px-1">{agentName || 'Support Agent'}</span>
        )}
        {!isUser && !isAgent && (
          <span className="text-xs font-semibold text-slate-500 px-1">WS360 Bot</span>
        )}

        {/* Bubble */}
        {msg.isTyping ? (
          <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>
            ))}
          </div>
        ) : (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'text-white rounded-tr-sm'
              : isAgent
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-gray-800 border border-green-100 rounded-bl-sm'
              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
          }`}
            style={isUser ? { background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' } : {}}>
            <span dangerouslySetInnerHTML={{ __html: formattedText }}/>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-300 px-1">
          {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN WIDGET COMPONENT
// ══════════════════════════════════════════════════════════════
const SupportChatWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'idle' | 'bot' | 'waiting' | 'live'>('idle');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<keyof typeof BOT_FLOW>('start');
  const [botData, setBotData] = useState({ userType: '', topic: '', urgency: '', email: '', description: '' });
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState<TicketStatus | null>(null);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [pollTimer, setPollTimer] = useState<any>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);
  // Use a ref so the restore useEffect can call submitTicket without stale closure
  const submitTicketRef = useRef<(data: any) => Promise<void>>(async () => {});

  // ── Persist chat to sessionStorage ────────────────────────
  const CHAT_KEY = 'ws360_chat_state';

  const saveChatState = useCallback((
    m: Msg[], s: string, st: string, bd: typeof botData
  ) => {
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify({
        msgs: m.map(msg => ({ ...msg, time: msg.time.toISOString() })),
        stage: s, step: st, botData: bd,
        savedAt: Date.now(),
      }));
    } catch {}
  }, []);

  const clearChatState = useCallback(() => {
    try { sessionStorage.removeItem(CHAT_KEY); } catch {}
  }, []);

  const scroll = useCallback(() => {
    setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  // Auto-save chat state on every change
  useEffect(() => {
    if (msgs.length > 0 && stage !== 'idle') {
      saveChatState(msgs, stage, step, botData);
    }
  }, [msgs, stage, step, botData, saveChatState]);

  // ── Add message helper ─────────────────────────────────────
  const addMsg = useCallback((from: Msg['from'], text: string, options?: string[]) => {
    const msg: Msg = { id: crypto.randomUUID(), from, text, time: new Date(), options };
    setMsgs(prev => [...prev, msg]);
    scroll();
  }, [scroll]);

  const addTyping = useCallback(() => {
    const id = crypto.randomUUID();
    setMsgs(prev => [...prev, { id, from: 'bot', text: '', time: new Date(), isTyping: true }]);
    return id;
  }, []);

  const removeTyping = useCallback((id: string) => {
    setMsgs(prev => prev.filter(m => m.id !== id));
  }, []);

  const botSay = useCallback((text: string, options?: string[], delay = 900) => {
    return new Promise<void>(resolve => {
      const typId = addTyping();
      setTimeout(() => {
        removeTyping(typId);
        addMsg('bot', text, options);
        resolve();
      }, delay);
    });
  }, [addTyping, removeTyping, addMsg]);

  // ── Start bot flow ─────────────────────────────────────────
  const startBot = useCallback(async () => {
    setStage('bot');
    setStep('start');
    await botSay(BOT_FLOW.start.text, undefined, 500);
    await botSay(BOT_FLOW.whoAreYou.text, BOT_FLOW.whoAreYou.options);
    setStep('whoAreYou');
  }, [botSay]);

  // Open handler
  const handleOpen = () => {
    setOpen(true);
    if (stage === 'idle') startBot();
  };

  // ── Handle option selection (bot flow) ────────────────────
  const handleOption = useCallback(async (option: string) => {
    addMsg('user', option);

    // Handle restore options
    if (option === 'Continue where I left off') {
      await botSay("Great! Let's continue. What would you like to do?", undefined, 400);
      return;
    }
    if (option === 'Start fresh') {
      setMsgs([]);
      setBotData({ userType: '', topic: '', urgency: '', email: '', description: '' });
      setStep('start');
      clearChatState();
      await botSay(BOT_FLOW.start.text, undefined, 400);
      await botSay(BOT_FLOW.whoAreYou.text, BOT_FLOW.whoAreYou.options);
      setStep('whoAreYou');
      return;
    }


    if (step === 'whoAreYou') {
      const userType = option.includes('Client') ? 'client' : option.includes('Freelancer') ? 'freelancer' : 'visitor';
      setBotData(d => ({ ...d, userType }));

      const opts = userType === 'client' ? BOT_FLOW.whatHelp.clientOptions :
                   userType === 'freelancer' ? BOT_FLOW.whatHelp.freelancerOptions :
                   BOT_FLOW.whatHelp.visitorOptions;

      await botSay(BOT_FLOW.whatHelp.text, opts);
      setStep('whatHelp');

    } else if (step === 'whatHelp') {
      setBotData(d => ({ ...d, topic: option }));

      // Try AI reply first
      const aiReply = getAiReply(option);
      if (aiReply) {
        await botSay(aiReply);
        await botSay("Did that answer your question?", ['✅ Yes, solved!', '❌ No, I still need help', '💬 I want to talk to a person']);
        setStep('urgency');
      } else {
        await botSay(BOT_FLOW.urgency.text, BOT_FLOW.urgency.options);
        setStep('urgency');
      }

    } else if (step === 'urgency') {
      if (option === '✅ Yes, solved!') {
        await botSay("🎉 Great! Glad I could help. Let me know if anything else comes up!");
        setStage('idle'); return;
      }
      if (option === '💬 I want to talk to a person') {
        setBotData(d => ({ ...d, urgency: 'high' }));
        await botSay("Sure! Let me connect you with a support agent. One moment...");
        await submitTicket({ ...botData, urgency: 'high', description: 'User requested human agent' });
        return;
      }
      setBotData(d => ({ ...d, urgency: option }));
      await botSay(BOT_FLOW.contact.text);
      setStep('contact');

    } else if (step === 'contact') {
      // Only reaches here if user typed (skip handled in submit)
    }
  }, [step, botData, botSay, addMsg]);

  // ── Handle text input during bot flow ─────────────────────
  const handleUserText = useCallback(async (text: string) => {
    addMsg('user', text);
    setInput('');

    if (stage === 'bot') {
      if (step === 'contact') {
        const isSkip = text.toLowerCase() === 'skip' || text.toLowerCase() === '/skip';
        if (!isSkip) {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(text.trim())) {
            await botSay(`⚠️ That doesn't look like a valid email address. Please enter a valid email (e.g. **name@company.com**) or type **skip** to continue without one.`);
            return; // stay on contact step, don't advance
          }
        }
        const email = isSkip ? (user?.email || '') : text.trim();
        setBotData(d => ({ ...d, email }));
        await botSay(BOT_FLOW.describe.text);
        setStep('describe');

      } else if (step === 'describe') {
        setBotData(d => ({ ...d, description: text }));

        // Smart AI check before escalating
        const aiReply = getAiReply(text);
        if (aiReply) {
          await botSay(aiReply);
          await botSay("Did that help?", ['✅ Yes, thanks!', '❌ No, connect me to an agent']);
          setStep('urgency');
        } else {
          await submitTicket({ ...botData, description: text });
        }

      } else if (step === 'urgency') {
        // Text after AI reply
        if (text.toLowerCase().includes('yes')) {
          await botSay("Great! Feel free to ask anything else. 😊");
          setStage('idle');
        } else {
          await submitTicket(botData);
        }
      }
    } else if (stage === 'live' && ticketId) {
      // Live chat — send to backend
      setSending(true);
      try {
        await api.post(`/support/tickets/${ticketId}/messages`,
          JSON.stringify(text), { headers: { 'Content-Type': 'application/json' } });
      } catch { addMsg('bot', '⚠️ Message failed to send. Please try again.'); }
      finally { setSending(false); }
    } else if (stage === 'waiting') {
      // User types while waiting — add to ticket
      if (ticketId) {
        await api.post(`/support/tickets/${ticketId}/messages`,
          JSON.stringify(text), { headers: { 'Content-Type': 'application/json' } });
        addMsg('bot', "✅ Message added to your ticket. Agent will respond soon.");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, step, botData, ticketId, user, botSay, addMsg, clearChatState]);

  // ── Submit ticket to backend ───────────────────────────────
  const submitTicket = useCallback(async (data: typeof botData) => {
    setStage('waiting');
    const typId = addTyping();
    await new Promise(r => setTimeout(r, 800));
    removeTyping(typId);

    try {
      // Build clean payload — always include all fields the API expects
      const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      const rawEmail = data.email || user?.email || '';
      const safeEmail = validEmail(rawEmail) ? rawEmail : (user?.email || '');
      const payload: Record<string,string> = {
        subject:      data.topic || 'Support Request',
        category:     categoryFromTopic(data.topic),
        priority:     priorityFromUrgency(data.urgency),
        userType:     data.userType || 'visitor',
        botSummary:   `User type: ${data.userType} | Topic: ${data.topic} | Urgency: ${data.urgency} | Description: ${data.description}`,
        firstMessage: data.description || data.topic || 'Support request',
        contactPhone: '',   // always send empty string so backend doesn't get undefined
      };
      if (safeEmail) payload.contactEmail = safeEmail;
      const res = await api.post('/support/tickets', payload);
      setTicketId(res.data.ticketId);

      addMsg('bot',
        `✅ **Ticket created!** (#${res.data.ticketId.slice(0, 8).toUpperCase()})\n\nA support agent will be assigned shortly. Typical response time: **15–60 minutes** during business hours.\n\nYou can continue chatting here — I'll notify you the moment an agent joins.`
      );
      addMsg('bot', "While you wait, feel free to ask more questions below and I'll do my best to help.");

      // Start polling for agent
      startPolling(res.data.ticketId);

    } catch (err) {
      removeTyping(typId);
      addMsg('bot', "Our team is ready to help you directly!\n\n📧 **Email:** help@worksupport360.com\n💬 **WhatsApp:** +91-9441363687\n\nWe respond within 4 hours. Mention your issue when you reach out.");
      setStage('bot');
    }
  }, [botData, user, addMsg, addTyping, removeTyping]);

  // Keep ref in sync with latest submitTicket
  useEffect(() => {
    submitTicketRef.current = submitTicket;
  }, [submitTicket]);

  // ── Poll for agent messages ────────────────────────────────
  const startPolling = useCallback((tid: string) => {
    let lastMsgId: string | null = null;

    const poll = async () => {
      try {
        // Check ticket status
        const statusRes = await api.get(`/support/tickets/${tid}/status`);
        const status: TicketStatus = statusRes.data;
        setTicketStatus(status);

        if (status.status === 'assigned' && stage !== 'live') {
          setStage('live');
          addMsg('bot', `🟢 **${status.assignedAgentName || 'Agent'} has joined the chat!** You can now have a live conversation.`);
        }

        // Fetch new messages
        const msgsRes = await api.get(`/support/tickets/${tid}/messages`);
        const serverMsgs = msgsRes.data as any[];
        const agentMsgs = serverMsgs.filter(m => m.senderRole === 'agent');

        if (agentMsgs.length > 0) {
          const latestAgent = agentMsgs[agentMsgs.length - 1];
          if (latestAgent.id !== lastMsgId) {
            lastMsgId = latestAgent.id;
            // Only add if not already in UI
            setMsgs(prev => {
              const exists = prev.some(m => m.id === latestAgent.id);
              if (exists) return prev;
              const newMsg: Msg = {
                id: latestAgent.id, from: 'agent',
                text: latestAgent.content, time: new Date(latestAgent.sentAt),
              };
              if (!open) setUnread(u => u + 1);
              return [...prev, newMsg];
            });
            scroll();
          }
        }

        if (status.status === 'resolved') {
          clearInterval(timer);
          addMsg('bot', "✅ **Ticket resolved.** Hope we helped! Rate your experience below.");
          setStage('idle');
        }
      } catch { /* ignore polling errors */ }
    };

    const timer = setInterval(poll, 5000); // poll every 5s
    setPollTimer(timer);
    return () => clearInterval(timer);
  }, [open, scroll, addMsg, stage]);

  // Cleanup
  useEffect(() => () => { if (pollTimer) clearInterval(pollTimer); }, [pollTimer]);

  // Reset unread on open
  useEffect(() => { if (open) setUnread(0); }, [open]);

  // ── Restore chat after login ──────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || restoredRef.current) return;

    try {
      const raw = sessionStorage.getItem('ws360_chat_state');
      if (!raw) return;
      const saved = JSON.parse(raw);

      // Only restore if saved within last 30 minutes
      if (Date.now() - saved.savedAt > 30 * 60 * 1000) {
        sessionStorage.removeItem('ws360_chat_state');
        return;
      }

      restoredRef.current = true;

      // Restore messages with proper Date objects
      const restoredMsgs: Msg[] = (saved.msgs || []).map((m: any) => ({
        ...m,
        time: new Date(m.time),
        options: undefined, // clear options so user doesn't re-click old buttons
      }));

      // Restore bot data but fill in the email from the now-logged-in user
      const restoredBotData = {
        ...saved.botData,
        email: user?.email || saved.botData?.email || '',
      };

      setMsgs(restoredMsgs);
      setBotData(restoredBotData);
      setUnread(0);

      // Determine what step to resume from
      const savedStep = saved.step as keyof typeof BOT_FLOW;
      const savedStage = saved.stage;

      if (savedStage === 'waiting' || savedStage === 'live') {
        // Ticket was already submitted — just restore
        setStage(savedStage);
        setStep(savedStep);
        setOpen(true);
        setTimeout(() => {
          addMsg('bot', `👋 Welcome back, **${user?.name || 'there'}**! Your previous support session has been restored.`);
        }, 600);
      } else if (savedStep === 'contact') {
        // Was on the email step — now logged in, skip it and continue to describe
        setStage('bot');
        setStep('describe');
        setOpen(true);
        setTimeout(async () => {
          addMsg('bot', `✅ You're now logged in as **${user?.name || user?.email}**. I'll use your account email — no need to enter it again!

Now, ${BOT_FLOW.describe.text}`);
          // Submit if we have enough data, otherwise ask for description
          if (!restoredBotData.description) {
            setStep('describe');
          } else {
            await submitTicketRef.current(restoredBotData);
          }
        }, 700);
      } else if (savedStep === 'describe') {
        // Was about to describe — restore and continue
        setStage('bot');
        setStep('describe');
        setOpen(true);
        setTimeout(() => {
          addMsg('bot', `👋 Welcome back, **${user?.name || 'there'}**! Your chat has been restored. Please continue describing your issue below.`);
        }, 600);
      } else if (savedStage === 'bot' && restoredBotData.description) {
        // Had all data — just submit the ticket now
        setStage('bot');
        setOpen(true);
        setTimeout(async () => {
          addMsg('bot', `✅ Welcome back, **${user?.name || 'there'}**! Now that you're logged in, I'll create your support ticket right away...`);
          setTimeout(() => submitTicketRef.current(restoredBotData), 800);
        }, 600);
      } else {
        // Generic restore — just show the chat
        setStage(savedStage || 'bot');
        setStep(savedStep || 'whoAreYou');
        setOpen(true);
        setTimeout(() => {
          addMsg('bot', `👋 Welcome back, **${user?.name || 'there'}**! Your previous chat has been restored. How can I continue helping you?`,
            ['Continue where I left off', 'Start fresh']);
        }, 600);
      }

      clearChatState();
    } catch {
      sessionStorage.removeItem('ws360_chat_state');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, addMsg, clearChatState]);

  // ── UI ─────────────────────────────────────────────────────
  const stageColor = { idle: '#0f172a', bot: '#0f172a', waiting: '#d97706', live: '#059669' }[stage];
  const stageLabel = { idle: 'Support', bot: 'AI Assistant', waiting: 'Waiting for agent...', live: ticketStatus?.assignedAgentName || 'Live chat' }[stage];

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Chat window */}
      {open && (
        <div className="absolute bottom-16 right-0 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" id="ws-chat-popup"
          style={{ width: 'min(360px, calc(100vw - 2rem))', height: 'min(480px, calc(100vh - 6rem))', animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)' }}>

          {/* Header */}
          <div className="shrink-0 px-4 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: stageColor + '44', border: `1px solid ${stageColor}` }}>
                {stage === 'live' ? (ticketStatus?.assignedAgentName?.[0] || 'A') : 'WS'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900"
                style={{ background: stage === 'live' ? '#22c55e' : stage === 'waiting' ? '#f59e0b' : '#3b82f6' }}/>
            </div>
            <div className="flex-1">
              <div className="text-white font-black text-sm">WorkSupport360</div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold" style={{ color: stage === 'live' ? '#86efac' : stage === 'waiting' ? '#fde68a' : '#93c5fd' }}>
                  {stageLabel}
                </span>
                {stage === 'waiting' && <Loader2 size={10} className="animate-spin text-amber-300"/>}
                {stage === 'live' && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>}
              </div>
            </div>

            {/* Ticket ID if exists */}
            {ticketId && (
              <div className="text-xs text-slate-400 font-mono">#{ticketId.slice(0,6).toUpperCase()}</div>
            )}

            <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <X size={14}/>
            </button>
          </div>

          {/* Stage banner */}
          {stage === 'waiting' && (
            <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-amber-50 border-b border-amber-100 text-amber-800">
              <Clock size={13}/> Agent connecting — avg. wait: 15 min during business hours
            </div>
          )}
          {stage === 'live' && (
            <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-green-50 border-b border-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
              {ticketStatus?.assignedAgentName} is online and typing responses
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50/50" style={{ overflowY: 'auto' }}>
            {msgs.map(m => (
              <div key={m.id}>
                <Bubble msg={m} agentName={ticketStatus?.assignedAgentName}/>
                {/* Render option buttons */}
                {m.options && m.id === msgs[msgs.length - 1]?.id && (
                  <div className="flex flex-col gap-1.5 ml-9 mb-3">
                    {m.options.map(opt => (
                      <button key={opt} onClick={() => handleOption(opt)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border-2 border-slate-200 text-slate-700 bg-white hover:border-slate-800 hover:bg-slate-800 hover:text-white transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={msgEndRef}/>
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-gray-100 p-3 bg-white">
            {/* Quick chips when waiting */}
            {stage === 'waiting' && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['How long is the wait?','Cancel my ticket','Check ticket status'].map(q => (
                  <button key={q} onClick={() => { setInput(q); }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (input.trim()) handleUserText(input.trim()); } }}
                placeholder={stage === 'live' ? 'Type your message…' : stage === 'waiting' ? 'Add more details to your ticket…' : 'Type here or pick an option above…'}
                rows={1}
                className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-slate-400 resize-none bg-gray-50 focus:bg-white transition-all"
                style={{ maxHeight: 80, overflowY: 'auto' }}/>
              <button
                onClick={() => { if (input.trim()) handleUserText(input.trim()); }}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40 shrink-0"
                style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
                {sending ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-0.5">
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <Shield size={10}/> Secure · Encrypted
              </span>
              <span className="text-xs text-gray-300">
                {stage !== 'idle' ? 'Enter to send' : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={open ? () => setOpen(false) : handleOpen}
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all relative"
        style={{ background: stage === 'live' ? 'linear-gradient(135deg,#059669,#047857)' : stage === 'waiting' ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
        {open
          ? <X size={22} className="text-white"/>
          : stage === 'live' ? <Headphones size={22} className="text-white"/>
          : stage === 'waiting' ? <Clock size={22} className="text-white"/>
          : <MessageCircle size={22} className="text-white"/>
        }
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full text-white text-xs font-black flex items-center justify-center px-1 border-2 border-white">
            {unread}
          </span>
        )}
        {/* Live indicator */}
        {!open && stage === 'live' && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"/>
        )}
      </button>
    </div>
  );
};

export default SupportChatWidget;
