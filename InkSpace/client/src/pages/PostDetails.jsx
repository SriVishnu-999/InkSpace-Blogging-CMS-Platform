import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock3, Eye, MessageCircle, Send } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function PostDetails() {
  const { slug } = useParams(); const { user } = useAuth()
  const [post,setPost]=useState(null); const [comments,setComments]=useState([])
  const [body,setBody]=useState(''); const [notice,setNotice]=useState(''); const [loading,setLoading]=useState(true)

  const loadComments = id => api.get(`/comments/post/${id}`).then(r=>setComments(r.data))
  useEffect(()=>{setLoading(true);api.get(`/posts/${slug}`).then(r=>{setPost(r.data);loadComments(r.data.id)}).finally(()=>setLoading(false))},[slug])

  const comment=async e=>{e.preventDefault(); if(!body.trim())return; await api.post(`/comments/post/${post.id}`,{body});setBody('');setNotice('Your comment was sent for moderation.')}
  if (loading) return <div className="reader loading-copy">Loading story…</div>
  if (!post) return <div className="empty"><h2>Story not found</h2></div>

  return <article className="reader">
    <header className="article-header">
      <div className="eyebrow">{post.category.name}</div>
      <h1>{post.title}</h1>
      <p className="article-deck">{post.excerpt}</p>
      <div className="article-byline">
        <Link to={`/author/${post.author.username}`}><img className="avatar" src={post.author.avatarUrl} alt=""/><div><strong>{post.author.displayName}</strong><span>@{post.author.username}</span></div></Link>
        <div className="article-stats"><span><Clock3 size={16}/>{post.readingTimeMinutes} min read</span><span><Eye size={16}/>{post.viewCount} views</span></div>
      </div>
      {post.coverImageUrl&&<img className="article-cover" src={post.coverImageUrl} alt=""/>}
    </header>
    <div className="article-layout">
      <div>
        <div className="article-content ql-editor" dangerouslySetInnerHTML={{__html:post.contentHtml}}/>
        <div className="article-tags">{post.tags.map(t=><Link key={t.slug} to={`/?tag=${t.slug}`}>#{t.name}</Link>)}</div>
        <section className="author-box"><img className="avatar lg" src={post.author.avatarUrl} alt=""/><div><span className="eyebrow">Written by</span><h3>{post.author.displayName}</h3><p>{post.author.bio||'Author on InkSpace.'}</p><Link to={`/author/${post.author.username}`}>View profile →</Link></div></section>
        <section className="comments">
          <div className="section-heading"><div><span className="eyebrow">Discussion</span><h2><MessageCircle size={24}/> {comments.length} comments</h2></div></div>
          {user ? <form className="comment-form" onSubmit={comment}><textarea value={body} onChange={e=>setBody(e.target.value)} maxLength="1500" placeholder="Add to the conversation…" required/><button className="button small"><Send size={16}/> Submit</button></form>
            : <div className="notice">Please <Link to="/login">sign in</Link> to comment.</div>}
          {notice&&<div className="alert success">{notice}</div>}
          <div className="comment-list">{comments.map(c=><div className="comment" key={c.id}><img className="avatar xs" src={c.user.avatarUrl} alt=""/><div><strong>{c.user.displayName}</strong><time>{new Date(c.createdAt).toLocaleDateString()}</time><p>{c.body}</p></div></div>)}</div>
        </section>
      </div>
    </div>
  </article>
}
