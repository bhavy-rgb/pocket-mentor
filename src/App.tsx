import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Protected from './components/Protected'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Feed from './pages/Feed'
import PostDetail from './pages/PostDetail'
import People from './pages/People'
import Messages from './pages/Messages'
import Requests from './pages/Requests'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { Privacy, Terms } from './pages/Legal'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/terms', element: <Terms /> },
  { path: '/privacy', element: <Privacy /> },
  {
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      { path: '/feed', element: <Feed /> },
      { path: '/post/:id', element: <PostDetail /> },
      { path: '/people', element: <People /> },
      { path: '/messages', element: <Messages /> },
      { path: '/messages/:id', element: <Messages /> },
      { path: '/requests', element: <Requests /> },
      { path: '/profile/:id', element: <Profile /> },
      { path: '/home', element: <Navigate to="/feed" replace /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])
