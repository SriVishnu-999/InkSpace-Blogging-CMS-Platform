import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, MessageSquare } from 'lucide-react'
import { api } from '../lib/api'

export default function Moderation() {
  const [items,setItems]=useState([])
  const load=()=>api.get('/comments/pending').then(r=>setItems(r.data))
  useEffect(()=>{load()},[])
  const moderate=async(id,status)=>{await api.patch(`/comments/${id}/moderate`,{status});load()}
  return <section className="content-wrap moderation-page">
    <div className="dashboard-head"><div><span className="eyebrow">Community</span><h1>Comment moderation</h1><p>Keep discussions useful and respectful.</p></div><Link className="text-link" to="/dashboard">← Back to dashboard</Link></div>
    {items.length===0?<div className="empty panel"><MessageSquare size={32}/><h3>You're all caught up</h3><p>No comments are waiting for review.</p></div>:
    <div className="moderation-list">{items.map(c=><article className="moderation-card" key={c.id}><div className="comment-user"><img className="avatar" src={c.user.avatarUrl} alt=""/><div><strong>{c.user.displayName}</strong><span>on <Link to={`/post/${c.post.slug}`}>{c.post.title}</Link></span></div></div><p>{c.body}</p><div className="moderation-actions"><button className="button approve" onClick={()=>moderate(c.id,'Approved')}><Check size={16}/> Approve</button><button className="button ghost danger-text" onClick={()=>moderate(c.id,'Rejected')}><X size={16}/> Reject</button></div></article>)}</div>}
  </section>
}
