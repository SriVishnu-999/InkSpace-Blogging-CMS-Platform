import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookOpen, Eye } from 'lucide-react'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'

export default function AuthorProfile() {
  const { username }=useParams(); const [profile,setProfile]=useState(null)
  useEffect(()=>{api.get(`/users/${username}`).then(r=>setProfile(r.data))},[username])
  if(!profile)return <div className="content-wrap loading-copy">Loading profile…</div>
  return <section className="content-wrap profile-page">
    <div className="profile-hero"><img className="avatar xl" src={profile.avatarUrl} alt=""/><div><span className="eyebrow">Author</span><h1>{profile.displayName}</h1><div className="handle">@{profile.username}</div><p>{profile.bio||'Writing on InkSpace.'}</p><div className="profile-stats"><span><BookOpen size={17}/><strong>{profile.stats.posts}</strong> stories</span><span><Eye size={17}/><strong>{profile.stats.views}</strong> views</span></div></div></div>
    <div className="section-heading"><div><span className="eyebrow">Published</span><h2>Latest stories</h2></div></div>
    <div className="posts-grid">{profile.posts.map(p=><PostCard key={p.id} post={{...p,author:{username:profile.username,displayName:profile.displayName,avatarUrl:profile.avatarUrl}}}/>)}</div>
  </section>
}
