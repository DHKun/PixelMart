import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Admin({ user }) {
  const [adminData, setAdminData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchAdmin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('/api/admin')
      setAdminData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || '访问被拒绝')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-pixel text-green-400">🔒 管理面板</h1>

      <div className="pixel-border-red p-4">
        <p className="text-sm text-red-400">
          ⚠️ 此页面仅限管理员访问
        </p>
      </div>

      <button
        onClick={fetchAdmin}
        disabled={loading}
        className="pixel-btn"
      >
        {loading ? '验证中...' : '🔓 访问管理面板'}
      </button>

      {error && (
        <div className="p-4 border border-red-500 bg-red-900/20">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {adminData && (
        <div className="pixel-card">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-xl text-green-400 font-pixel mb-4">{adminData.message}</h2>

          {adminData.flag && (
            <div className="p-4 border border-yellow-500 bg-yellow-900/20 mb-4">
              <p className="text-yellow-400 font-bold">🚩 Flag: {adminData.flag}</p>
            </div>
          )}

          <div className="space-y-2 text-sm text-green-500">
            <p>📊 用户总数: {adminData.users_count}</p>
            <p>🔐 认证方式: {adminData.authenticated ? 'Token 认证' : '请求头/Cookie 越权'}</p>
          </div>
        </div>
      )}

      {/* Hidden hint */}
      {/* 💡 提示: 试试添加 X-Forwarded-Role: admin 请求头 */}
      {/* 或者把 Cookie 里的 role 改成 admin */}
    </div>
  )
}

export default Admin
