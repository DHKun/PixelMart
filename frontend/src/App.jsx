import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import Home from './views/Home'
import Shop from './views/Shop'
import FlagSubmit from './views/FlagSubmit'
import Challenges from './views/Challenges'
import Login from './views/Login'
import Admin from './views/Admin'
import Profile from './views/Profile'
import Feedback from './views/Feedback'
import Logs from './views/Logs'
import Cart from './views/Cart'

axios.defaults.withCredentials = true

function App() {
  const [user, setUser] = useState(null)
  const [completedFlags, setCompletedFlags] = useState([])
  const [cartItems, setCartItems] = useState([])
  const location = useLocation()

  useEffect(() => {
    checkLogin()
  }, [])

  const checkLogin = async () => {
    try {
      const res = await axios.get('/api/me')
      setUser(res.data)
    } catch {
      setUser(null)
    }
  }

  // Load progress when user changes (login/logout)
  useEffect(() => {
    const key = user ? `pixelmart_flags_${user.username}` : 'pixelmart_flags'
    const saved = localStorage.getItem(key)
    if (saved) setCompletedFlags(JSON.parse(saved))
    else setCompletedFlags([])
  }, [user])

  const addFlag = (challengeId) => {
    const updated = [...new Set([...completedFlags, challengeId])]
    setCompletedFlags(updated)
    const key = user ? `pixelmart_flags_${user.username}` : 'pixelmart_flags'
    localStorage.setItem(key, JSON.stringify(updated))
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-pixel-dark scanlines">
      {/* Navigation */}
      <nav className="border-b-2 border-green-500 bg-pixel-darker">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl animate-glow">🕹️</span>
              <span className="text-xl font-pixel text-green-400 animate-glow">PixelMart</span>
            </Link>
            <div className="flex items-center space-x-1">
              <NavLink to="/" active={isActive('/')}>首页</NavLink>
              <NavLink to="/shop" active={isActive('/shop')}>商城</NavLink>
              <NavLink to="/challenges" active={isActive('/challenges')}>挑战</NavLink>
              <NavLink to="/flag-submit" active={isActive('/flag-submit')}>
                🏁 提交
                {completedFlags.length > 0 && (
                  <span className="ml-1 bg-green-500 text-black text-xs px-1.5 py-0.5 rounded-full">
                    {completedFlags.length}
                  </span>
                )}
              </NavLink>
              {user ? (
                <div className="flex items-center space-x-2 ml-2">
                  <Link to="/profile" className="text-sm text-green-400 hover:text-green-300 border border-green-500 px-3 py-1">
                    {user.username}
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 border border-red-500 px-3 py-1">
                    退出
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm text-green-400 hover:text-green-300 border border-green-500 px-3 py-1 ml-2">
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/shop" element={<Shop user={user} cartItems={cartItems} setCartItems={setCartItems} />} />
          <Route path="/challenges" element={<Challenges completedFlags={completedFlags} />} />
          <Route path="/flag-submit" element={<FlagSubmit user={user} completedFlags={completedFlags} addFlag={addFlag} />} />
          <Route path="/login" element={<Login onLogin={checkLogin} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/profile" element={<Profile user={user} onUpdate={checkLogin} />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/cart" element={<Cart user={user} onUpdate={checkLogin} cartItems={cartItems} setCartItems={setCartItems} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-green-500 bg-pixel-darker py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-green-600">
            PixelMart v1.0 | OWASP Top 10 2021 安全测试靶场 | 仅供学习使用
          </p>
          <p className="text-xs text-green-700 mt-1">
            💡 提示: 每个功能点都可能存在漏洞，查看页面源码和控制台可能发现线索
          </p>
        </div>
      </footer>
    </div>
  )

  async function handleLogout() {
    await axios.post('/api/logout')
    setUser(null)
    window.location.href = '/'
  }
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm transition-all duration-200 ${
        active
          ? 'text-green-300 bg-green-900 border-b-2 border-green-400'
          : 'text-green-600 hover:text-green-400 hover:bg-green-900/50'
      }`}
    >
      {children}
    </Link>
  )
}

export default App
