import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Feather, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function AuthShell({ title, subtitle, children, bottom }) {
  return <section className="auth-page"><div className="auth-card">
    <div className="auth-logo"><span className="brand-mark"><Feather size={19}/></span></div>
    <h1>{title}</h1><p>{subtitle}</p>{children}<div className="auth-bottom">{bottom}</div>
  </div></section>
}

export function Login() {
  const { login } = useAuth(); const navigate = useNavigate()
  const [form,setForm]=useState({email:'',password:''}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
  const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{await login(form.email,form.password);navigate('/dashboard')}catch(err){setError(err.response?.data?.message||'Could not sign in.')}finally{setBusy(false)}}
  return <AuthShell title="Welcome back" subtitle="Sign in to continue writing and reading." bottom={<>New to InkSpace? <Link to="/register">Create an account</Link></>}>
    <form className="stack-form" onSubmit={submit}>
      {error&&<div className="alert error">{error}</div>}
      <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      <button className="button" disabled={busy}>{busy?'Signing in…':<>Sign in <ArrowRight size={17}/></>}</button>
      <div className="demo-credentials"><strong>Demo author</strong><span>alex@inkspace.local / Author@123</span><strong>Admin</strong><span>admin@inkspace.local / Admin@123</span></div>
    </form>
  </AuthShell>
}

export function Register() {
  const { register } = useAuth(); const navigate = useNavigate()
  const [form,setForm]=useState({displayName:'',username:'',email:'',password:''}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
  const change=e=>setForm({...form,[e.target.name]:e.target.value})
  const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{await register(form);navigate('/dashboard')}catch(err){setError(err.response?.data?.message||'Could not create account.')}finally{setBusy(false)}}
  return <AuthShell title="Create your space" subtitle="Publish ideas, join discussions and build your author profile." bottom={<>Already have an account? <Link to="/login">Sign in</Link></>}>
    <form className="stack-form" onSubmit={submit}>
      {error&&<div className="alert error">{error}</div>}
      <label>Display name<input name="displayName" required maxLength="60" value={form.displayName} onChange={change}/></label>
      <label>Username<input name="username" required minLength="3" maxLength="30" value={form.username} onChange={change}/></label>
      <label>Email<input name="email" type="email" required value={form.email} onChange={change}/></label>
      <label>Password<input name="password" type="password" required minLength="6" value={form.password} onChange={change}/></label>
      <button className="button" disabled={busy}>{busy?'Creating…':<>Create account <ArrowRight size={17}/></>}</button>
    </form>
  </AuthShell>
}
