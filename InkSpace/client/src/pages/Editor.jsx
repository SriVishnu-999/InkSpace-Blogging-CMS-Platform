import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Send } from 'lucide-react'
import { api } from '../lib/api'
import QuillEditor from '../components/QuillEditor'

export default function Editor() {
  const { id } = useParams(); const navigate=useNavigate()
  const [categories,setCategories]=useState([]); const [busy,setBusy]=useState(false); const [error,setError]=useState('')
  const [form,setForm]=useState({title:'',excerpt:'',contentHtml:'',coverImageUrl:'',categoryId:'',tags:'',status:'Draft'})
  useEffect(()=>{api.get('/categories').then(r=>setCategories(r.data)); if(id)api.get(`/posts/mine/${id}`).then(r=>setForm({title:r.data.title,excerpt:r.data.excerpt||'',contentHtml:r.data.contentHtml,coverImageUrl:r.data.coverImageUrl||'',categoryId:r.data.categoryId,tags:r.data.tags.join(', '),status:r.data.status}))},[id])
  const save=async status=>{setBusy(true);setError('');try{const payload={...form,categoryId:Number(form.categoryId),tags:form.tags.split(',').map(x=>x.trim()).filter(Boolean),status}; if(id)await api.put(`/posts/${id}`,payload);else await api.post('/posts',payload);navigate('/dashboard')}catch(e){setError(e.response?.data?.message||'Please check all required fields.')}finally{setBusy(false)}}
  return <section className="editor-page">
    <div className="editor-top"><button className="text-button" onClick={()=>navigate('/dashboard')}><ArrowLeft size={17}/> Dashboard</button><div className="editor-actions"><button className="button ghost" disabled={busy} onClick={()=>save('Draft')}><Save size={16}/> Save draft</button><button className="button" disabled={busy} onClick={()=>save('Published')}><Send size={16}/> Publish</button></div></div>
    {error&&<div className="alert error">{error}</div>}
    <div className="editor-grid">
      <div className="editor-main">
        <input className="title-input" placeholder="Story title" maxLength="180" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <textarea className="excerpt-input" placeholder="Short description (optional — generated automatically if blank)" maxLength="260" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})}/>
        <QuillEditor value={form.contentHtml} onChange={contentHtml=>setForm(f=>({...f,contentHtml}))}/>
      </div>
      <aside className="publish-panel">
        <h3>Story settings</h3>
        <label>Category<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}><option value="">Choose category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Tags<input placeholder="react, web, career" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}/><small>Separate up to 8 tags with commas.</small></label>
        <label>Cover image URL<input placeholder="https://…" value={form.coverImageUrl} onChange={e=>setForm({...form,coverImageUrl:e.target.value})}/></label>
        {form.coverImageUrl&&<img className="cover-preview" src={form.coverImageUrl} alt="Preview"/>}
        <div className={`status-pill ${form.status.toLowerCase()}`}>{form.status}</div>
      </aside>
    </div>
  </section>
}
