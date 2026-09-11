import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import { Login, Register } from './pages/AuthPages'
import PostDetails from './pages/PostDetails'
import Editor from './pages/Editor'
import Dashboard from './pages/Dashboard'
import Moderation from './pages/Moderation'
import AuthorProfile from './pages/AuthorProfile'
import NotFound from './pages/NotFound'

const protect = (node) => <ProtectedRoute>{node}</ProtectedRoute>

const router = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      { path:'/', element:<Home/> },
      { path:'/login', element:<Login/> },
      { path:'/register', element:<Register/> },
      { path:'/post/:slug', element:<PostDetails/> },
      { path:'/author/:username', element:<AuthorProfile/> },
      { path:'/write', element:protect(<Editor/>) },
      { path:'/edit/:id', element:protect(<Editor/>) },
      { path:'/dashboard', element:protect(<Dashboard/>) },
      { path:'/moderation', element:protect(<Moderation/>) },
      { path:'*', element:<NotFound/> }
    ]
  }
])

export default function App(){return <RouterProvider router={router}/>}
