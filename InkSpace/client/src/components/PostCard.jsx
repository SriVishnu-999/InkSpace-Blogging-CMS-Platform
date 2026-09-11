import { Link } from 'react-router-dom'
import { Clock3, Eye } from 'lucide-react'

export default function PostCard({ post, large = false }) {
  return (
    <article className={`post-card ${large ? 'large' : ''}`}>
      {post.coverImageUrl && <Link to={`/post/${post.slug}`} className="cover-wrap"><img className="cover" src={post.coverImageUrl} alt="" /></Link>}
      <div className="post-card-body">
        <div className="eyebrow">{post.category?.name}</div>
        <Link to={`/post/${post.slug}`} className="post-title">{post.title}</Link>
        <p className="post-excerpt">{post.excerpt}</p>
        <div className="post-meta">
          {post.author && <Link to={`/author/${post.author.username}`} className="author-chip">
            <img className="avatar xs" src={post.author.avatarUrl} alt="" />
            <span>{post.author.displayName}</span>
          </Link>}
          <span><Clock3 size={14}/> {post.readingTimeMinutes} min</span>
          <span><Eye size={14}/> {post.viewCount}</span>
        </div>
      </div>
    </article>
  )
}
