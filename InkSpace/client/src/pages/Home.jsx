import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Sparkles, TrendingUp } from 'lucide-react'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import Pagination from '../components/Pagination'

export default function Home() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState({ items: [], page: 1, totalPages: 1 })
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(() => params.get('category') || '')
  const [tag, setTag] = useState(() => params.get('tag') || '')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/tags')]).then(([c,t]) => {
      setCategories(c.data); setTags(t.data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    api.get('/posts', { params: { page, pageSize: 9, search, category, tag, sort } })
      .then(r => setData(r.data)).finally(() => setLoading(false))
  }, [page, search, category, tag, sort])

  const submit = (e) => { e.preventDefault(); setPage(1); setSearch(query.trim()) }
  const pickCategory = (slug) => { setCategory(slug); setTag(''); setPage(1); setParams(slug ? { category: slug } : {}) }
  const pickTag = (slug) => { setTag(slug); setCategory(''); setPage(1); setParams(slug ? { tag: slug } : {}) }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="kicker"><Sparkles size={16}/> Ideas worth your attention</div>
          <h1>Read deeply.<br/>Write freely.</h1>
          <p>InkSpace is a calm home for useful ideas, personal perspectives and thoughtful technical writing.</p>
          <form className="hero-search" onSubmit={submit}>
            <Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search stories, topics, ideas…" />
            <button>Search</button>
          </form>
        </div>
        <div className="hero-art">
          <div className="quote-card">
            <span>“</span>
            <p>Words have weight when there is room to think.</p>
            <small>INKSPACE EDITORIAL</small>
          </div>
        </div>
      </section>

      <section className="content-wrap">
        <div className="section-heading">
          <div><span className="eyebrow">Discover</span><h2>Stories for curious minds</h2></div>
          <div className="sort-tabs">
            <button className={sort==='latest'?'active':''} onClick={()=>{setSort('latest');setPage(1)}}>Latest</button>
            <button className={sort==='popular'?'active':''} onClick={()=>{setSort('popular');setPage(1)}}><TrendingUp size={15}/> Popular</button>
          </div>
        </div>
        <div className="chips">
          <button className={!category && !tag ? 'active':''} onClick={()=>{setCategory('');setTag('');setPage(1);setParams({})}}>All</button>
          {categories.map(c => <button className={category===c.slug?'active':''} key={c.id} onClick={()=>pickCategory(c.slug)}>{c.name}</button>)}
        </div>

        {tags.length > 0 && <div className="tag-row">
          <span>Trending:</span>
          {tags.slice(0,8).map(t => <button key={t.id} className={tag===t.slug?'selected':''} onClick={()=>pickTag(t.slug)}>#{t.name}</button>)}
        </div>}

        {loading ? <div className="loading-grid">{[1,2,3,4,5,6].map(x=><div className="skeleton" key={x}/>)}</div> :
          data.items.length ? <div className="posts-grid">{data.items.map(p => <PostCard key={p.id} post={p}/>)}</div> :
          <div className="empty"><h3>No stories found</h3><p>Try a different search or topic.</p></div>}
        <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage}/>
      </section>
    </>
  )
}
