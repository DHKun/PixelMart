import React, { useState } from 'react'
import axios from 'axios'

function Profile({ user, onUpdate }) {
  const [targetUser, setTargetUser] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [result, setResult] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setResult('')
    try {
      // A08: Using GET request to change password (CSRF vulnerability)
      const res = await axios.get('/api/profile/change-password', {
        params: {
          username: targetUser,
          new_password: newPassword
        }
      })
      setResult(`✅ ${res.data.message}`)
      onUpdate()
    } catch (err) {
      setResult(`❌ ${err.response?.data?.error || '修改失败'}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-pixel text-green-400">👤 个人中心</h1>

      {user && (
        <div className="pixel-card">
          <div className="text-4xl mb-4">🧑‍💻</div>
          <h2 className="text-xl text-green-400 mb-4">{user.username}</h2>
          <div className="space-y-2 text-sm text-green-500">
            <p>🆔 ID: {user.id}</p>
            <p>🎭 角色: {user.role}</p>
            <p>💰 余额: {user.balance}</p>
          </div>
        </div>
      )}

      {/* A08: CSRF vulnerable password change */}
      <div className="pixel-card">
        <h2 className="text-lg font-pixel text-green-400 mb-4">🔑 修改密码</h2>
        <div className="p-3 border border-red-700 bg-red-900/20 mb-4">
          <p className="text-xs text-red-400">
            ⚠️ 注意: 此接口使用 GET 请求修改密码，存在安全风险
          </p>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-green-400 mb-2">目标用户名</label>
            <input
              type="text"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              className="pixel-input"
              placeholder="输入要修改密码的用户名"
            />
          </div>
          <div>
            <label className="block text-sm text-green-400 mb-2">新密码</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pixel-input"
              placeholder="输入新密码"
            />
          </div>
          <button type="submit" className="pixel-btn w-full">
            🔄 修改密码 (GET)
          </button>
        </form>
        {result && (
          <div className="mt-4 p-3 border border-green-700">
            <p className="text-sm text-green-400">{result}</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Profile
