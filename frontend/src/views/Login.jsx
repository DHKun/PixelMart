import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (isRegister) {
        await axios.post('/api/register', { username, password })
        setSuccess('注册成功！请登录')
        setIsRegister(false)
      } else {
        await axios.post('/api/login', { username, password })
        onLogin()
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.error || '操作失败')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="pixel-card">
        <h1 className="text-2xl font-pixel text-green-400 text-center mb-6">
          {isRegister ? '📝 注册' : '🔑 登录'}
        </h1>

        {error && (
          <div className="mb-4 p-3 border border-red-500 bg-red-900/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 border border-green-500 bg-green-900/20">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-green-400 mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pixel-input"
              placeholder="输入用户名"
            />
          </div>
          <div>
            <label className="block text-sm text-green-400 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pixel-input"
              placeholder="输入密码"
            />
          </div>
          <button type="submit" className="pixel-btn w-full">
            {isRegister ? '📝 注册' : '🔑 登录'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess('') }}
            className="text-sm text-green-600 hover:text-green-400"
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      </div>

    </div>
  )
}

export default Login
