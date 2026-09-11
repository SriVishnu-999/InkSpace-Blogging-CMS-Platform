import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Eye, CheckCircle2, Clock3, MessageSquare, Plus, Edit3, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user }=useAuth(); const [stats,setStats]=useState(null); const [posts,setPosts]=useState([])
  const load=()=>Promise.all([api.get('/users/me/dashboard'),api.get('/posts/mine/all')]).then(([s,p])=>{setStats(s.data);setPosts(p.data)})
  useEffect(()=>{load()},[])
  const remove=async id=>{if(!window.confirm('Delete this story permanently?'))return;await api.delete(`/posts/${id}`);load()}
  const cards=stats?[['Stories',stats.totalPosts,FileText],['Published',stats.published,CheckCircle2],['Drafts',stats.drafts,Clock3],['Total views',stats.totalViews,Eye],['Pending comments',stats.pendingComments,MessageSquare]]:[]
  return <section className="dashboard content-wrap">
    <div className="dashboard-head"><div><span className="eyebrow">Creator studio</span><h1>Welcome, {user.displayName}</h1><p>Manage your stories and conversations from one place.</p></div><Link className="button" to="/write"><Plus size={17}/> New story</Link></div>
    <div className="stat-grid">{cards.map(([label,value,Icon])=><div className="stat-card" key={label}><span><Icon size={20}/></span><strong>{value}</strong><small>{label}</small></div>)}</div>
    <div className="panel-head"><h2>Your stories</h2><Link to="/moderation">Moderate comments →</Link></div>
    <div className="table-card">
      {posts.length===0?<div className="empty compact"><h3>No stories yet</h3><p>Create your first story to get started.</p></div>:
      <div className="story-table">{posts.map(p=><div className="story-row" key={p.id}>
        <div className="story-info">{p.coverImageUrl?<img src={p.coverImageUrl} alt=""/>:<div className="cover-placeholder"/>}<div><strong>{p.title}</strong><span>{p.category.name} · Updated {new Date(p.updatedAt).toLocaleDateString()}</span></div></div>
        <span className={`status-pill ${p.status.toLowerCase()}`}>{p.status}</span><span className="views"><Eye size={15}/>{p.viewCount}</span>
        <div className="row-actions"><Link className="icon-btn" to={`/edit/${p.id}`}><Edit3 size={17}/></Link><button className="icon-btn danger" onClick={()=>remove(p.id)}><Trash2 size={17}/></button></div>
      </div>)}</div>}
    </div>
  </section>
}
