import React,{useState,useRef,useEffect}from'react';
import{useQuery,useMutation,useQueryClient}from'@tanstack/react-query';
import{Send,Loader2,MessageSquare,X,Plus}from'lucide-react';
import toast from'react-hot-toast';
import{api}from'../../services/api';
import{useAuthStore}from'../../store/authStore';

const InboxPage:React.FC=()=>{
  const qc=useQueryClient();
  const{user}=useAuthStore();
  const[selected,setSelected]=useState<any>(null);
  const[reply,setReply]=useState('');
  const[newModal,setNewModal]=useState(false);
  const[newSubject,setNewSubject]=useState('');
  const[newBody,setNewBody]=useState('');
  const bottomRef=useRef<HTMLDivElement>(null);

  const{data:threads=[],isLoading}=useQuery({
    queryKey:['inbox-threads'],
    queryFn:()=>api.get('/inbox').then(r=>r.data),
    refetchInterval:15000,
  });

  const{data:thread}=useQuery({
    queryKey:['inbox-thread',selected?.id],
    queryFn:()=>selected?api.get(`/inbox/${selected.id}`).then(r=>r.data):null,
    enabled:!!selected?.id,
    refetchInterval:10000,
  });

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[thread?.messages?.length]);

  const sendMut=useMutation({
    mutationFn:({body,threadId}:any)=>api.post('/inbox',{body,threadId}),
    onSuccess:()=>{qc.invalidateQueries({queryKey:['inbox-threads']});qc.invalidateQueries({queryKey:['inbox-thread',selected?.id]});setReply('');},
    onError:()=>toast.error('Failed to send'),
  });

  const newMut=useMutation({
    mutationFn:()=>api.post('/inbox',{body:newBody,subject:newSubject||'Message to Admin'}),
    onSuccess:(res:any)=>{qc.invalidateQueries({queryKey:['inbox-threads']});setSelected({id:res.data.threadId,subject:newSubject||'Message to Admin'});setNewModal(false);setNewSubject('');setNewBody('');toast.success('Message sent!');},
    onError:()=>toast.error('Failed to send'),
  });

  const inp={width:'100%',padding:'11px 14px',border:'1.5px solid #e2e8f0',borderRadius:12,fontSize:14,outline:'none',fontFamily:'inherit',transition:'border .15s',boxSizing:'border-box' as const};
  const foc=(e:any)=>e.target.style.borderColor='#f97316';
  const blu=(e:any)=>e.target.style.borderColor='#e2e8f0';

  return(
    <div style={{fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em',margin:'0 0 4px'}}>Inbox</h1>
          <p style={{fontSize:13,color:'#94a3b8',margin:0}}>Send messages, notes & queries to admin</p>
        </div>
        <button onClick={()=>setNewModal(true)} style={{display:'flex',alignItems:'center',gap:7,padding:'10px 20px',borderRadius:14,background:'linear-gradient(135deg,#f97316,#ef4444)',color:'#fff',border:'none',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(249,115,22,0.35)'}}>
          <Plus size={15}/> New Message
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16,height:'calc(100vh - 180px)'}}>
        {/* Thread list */}
        <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:18,overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #f8fafc',fontWeight:700,fontSize:13,color:'#0f172a'}}>Conversations ({(threads as any[]).length})</div>
          <div style={{flex:1,overflowY:'auto'}}>
            {isLoading?<div style={{display:'flex',justifyContent:'center',padding:24}}><Loader2 size={20} style={{color:'#e2e8f0',animation:'spin 1s linear infinite'}}/></div>
            :(threads as any[]).length===0?(
              <div style={{textAlign:'center',padding:'28px 16px'}}>
                <div style={{fontSize:28,marginBottom:8}}>📬</div>
                <div style={{fontSize:13,color:'#94a3b8'}}>No messages yet.</div>
                <button onClick={()=>setNewModal(true)} style={{marginTop:10,padding:'8px 16px',borderRadius:10,background:'#f97316',color:'#fff',border:'none',fontSize:12,fontWeight:700,cursor:'pointer'}}>Send first message</button>
              </div>
            ):(threads as any[]).map((t:any)=>(
              <div key={t.id} onClick={()=>setSelected(t)}
                style={{padding:'12px 16px',borderBottom:'1px solid #f8fafc',cursor:'pointer',background:selected?.id===t.id?'#fff7ed':'#fff',borderLeft:`3px solid ${selected?.id===t.id?'#f97316':'transparent'}`,transition:'all .15s'}}
                onMouseEnter={ev=>{if(selected?.id!==t.id)(ev.currentTarget as HTMLElement).style.background='#f8fafc';}}
                onMouseLeave={ev=>{if(selected?.id!==t.id)(ev.currentTarget as HTMLElement).style.background='#fff';}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <div style={{fontWeight:t.unreadCount>0?800:600,fontSize:13,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{t.subject}</div>
                  {t.unreadCount>0&&<div style={{width:18,height:18,borderRadius:'50%',background:'#ef4444',color:'#fff',fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginLeft:6}}>{t.unreadCount}</div>}
                </div>
                <div style={{fontSize:11,color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.lastMessage||'…'}</div>
                <div style={{fontSize:10,color:'#9ca3af',marginTop:3}}>{t.lastMessageAt?new Date(t.lastMessageAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Thread view */}
        <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:18,overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
          {!selected?(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#94a3b8'}}>
              <MessageSquare size={40} style={{marginBottom:12,opacity:.25}}/>
              <div style={{fontSize:14,fontWeight:600,color:'#374151'}}>Select a conversation</div>
              <div style={{fontSize:12,marginTop:4}}>or start a new message to admin</div>
            </div>
          ):(
            <>
              <div style={{padding:'13px 18px',borderBottom:'1px solid #f8fafc',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{fontWeight:800,fontSize:14,color:'#0f172a'}}>{selected.subject}</div>
                <button onClick={()=>setSelected(null)} style={{width:26,height:26,borderRadius:'50%',background:'#f8fafc',border:'1px solid #e2e8f0',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}><X size={12}/></button>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'14px 18px',display:'flex',flexDirection:'column',gap:10}}>
                {thread?.messages?.map((m:any)=>(
                  <div key={m.id} style={{display:'flex',justifyContent:m.isOwnMessage?'flex-end':'flex-start',gap:8}}>
                    {!m.isOwnMessage&&<div style={{width:26,height:26,borderRadius:8,background:'linear-gradient(135deg,#f97316,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#fff',flexShrink:0,marginTop:2}}>{(m.senderName||'A')[0]}</div>}
                    <div style={{maxWidth:'68%'}}>
                      {!m.isOwnMessage&&<div style={{fontSize:10,color:'#94a3b8',marginBottom:3,fontWeight:600}}>{m.senderName||'Admin'}</div>}
                      <div style={{padding:'10px 13px',borderRadius:m.isOwnMessage?'14px 14px 4px 14px':'14px 14px 14px 4px',background:m.isOwnMessage?'linear-gradient(135deg,#f97316,#ef4444)':'#f8fafc',color:m.isOwnMessage?'#fff':'#374151',fontSize:13,lineHeight:1.6}}>
                        {m.body}
                      </div>
                      <div style={{fontSize:10,color:'#9ca3af',marginTop:2,textAlign:m.isOwnMessage?'right':'left'}}>{new Date(m.sentAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef}/>
              </div>
              <div style={{padding:'12px 18px',borderTop:'1px solid #f8fafc',display:'flex',gap:8}}>
                <textarea value={reply} onChange={e=>setReply(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(reply.trim())sendMut.mutate({body:reply,threadId:selected.id});}}}
                  rows={2} placeholder="Type a message… Enter to send"
                  style={{flex:1,padding:'10px 13px',border:'1.5px solid #e2e8f0',borderRadius:12,fontSize:13,outline:'none',resize:'none' as const,fontFamily:'inherit',transition:'border .15s'}}
                  onFocus={foc} onBlur={blu}/>
                <button onClick={()=>{if(reply.trim())sendMut.mutate({body:reply,threadId:selected.id});}}
                  disabled={sendMut.isPending||!reply.trim()}
                  style={{width:42,height:42,borderRadius:12,background:reply.trim()?'linear-gradient(135deg,#f97316,#ef4444)':'#f8fafc',border:'none',cursor:reply.trim()?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',color:reply.trim()?'#fff':'#94a3b8',alignSelf:'flex-end',flexShrink:0,transition:'all .15s'}}>
                  {sendMut.isPending?<Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/>:<Send size={15}/>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New message modal */}
      {newModal&&(
        <div onClick={()=>setNewModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:24}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:22,padding:26,width:'100%',maxWidth:480,boxShadow:'0 20px 60px rgba(0,0,0,0.18)'}}>
            <div style={{fontWeight:900,fontSize:16,color:'#0f172a',marginBottom:3}}>📬 Message to Admin</div>
            <div style={{fontSize:12,color:'#94a3b8',marginBottom:18}}>Admin responds within 4 hours</div>
            <div style={{display:'flex',flexDirection:'column',gap:13}}>
              <div><label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.05em'}}>Subject</label>
                <input value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="e.g. Question about my requirement" style={inp} onFocus={foc} onBlur={blu}/></div>
              <div><label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.05em'}}>Message *</label>
                <textarea value={newBody} onChange={e=>setNewBody(e.target.value)} rows={5} placeholder="Write your message, question, note or requirement details here..."
                  style={{...inp,resize:'none' as const,lineHeight:1.65}} onFocus={foc} onBlur={blu}/></div>
              <div style={{display:'flex',gap:9}}>
                <button onClick={()=>setNewModal(false)} style={{flex:1,padding:'12px',borderRadius:13,border:'1.5px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer'}}>Cancel</button>
                <button onClick={()=>{if(!newBody.trim()){toast.error('Write a message');return;}newMut.mutate();}}
                  disabled={newMut.isPending}
                  style={{flex:2,padding:'12px',borderRadius:13,background:'linear-gradient(135deg,#f97316,#ef4444)',color:'#fff',border:'none',fontSize:13,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,opacity:newMut.isPending?.6:1}}>
                  {newMut.isPending?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<Send size={14}/>}
                  Send to admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxPage;
