import { Link } from 'react-router-dom'
export default function NotFound(){return <div className="empty not-found"><span>404</span><h1>That page drifted away.</h1><p>The story or page you are looking for does not exist.</p><Link className="button" to="/">Explore InkSpace</Link></div>}
