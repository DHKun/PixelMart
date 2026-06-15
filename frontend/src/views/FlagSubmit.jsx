import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function FlagSubmit({ user, completedFlags, addFlag }) {
  const [flag, setFlag] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!flag.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const res = await axios.post('/api/verify-flag', { flag: flag.trim() })
      setResult(res.data)
      if (res.data.valid) {
        addFlag(res.data.challenge_id)
      }
    } catch (err) {
      setResult({ valid: false, message: '❌ 验证失败，请重试' })
    }
    setLoading(false)
  }

  const challengeNames = {
    'A01': '越权访问', 'A02': '加密失效', 'A03': 'SQL注入',
    'A04': '不安全设计', 'A05': '安全配置错误', 'A06': '脆弱组件',
    'A07': '认证失效', 'A08': '完整性失效', 'A09': '日志泄露', 'A10': 'SSRF'
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="pixel-border-red p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-pixel text-red-400 mb-4">请先登录</h2>
          <p className="text-sm text-red-500 mb-4">需要登录后才能提交 Flag，每个用户的进度独立保存</p>
          <Link to="/login" className="pixel-btn">去登录</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-pixel text-green-400 mb-2">🏁 Flag 提交中心</h1>
        <p className="text-sm text-green-500">找到 flag 后粘贴到这里验证</p>
      </div>

      {/* Submit Form */}
      <div className="pixel-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-green-400 mb-2">输入 Flag:</label>
            <input
              type="text"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="FloatCTF{...}"
              className="pixel-input font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="pixel-btn w-full"
          >
            {loading ? '验证中...' : '🚀 提交验证'}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 ${result.valid ? 'border-yellow-400' : 'border-red-400'} border`}>
            <p className={`text-sm ${result.valid ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.message}
            </p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="pixel-card">
        <h2 className="text-lg font-pixel text-green-400 mb-4">📊 收集进度</h2>
        <div className="w-full bg-pixel-dark border border-green-700 h-4 mb-4">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(completedFlags.length / 10) * 100}%` }}
          />
        </div>
        <p className="text-sm text-green-500 text-center mb-4">
          已收集 {completedFlags.length} / 10 个 Flag
        </p>

        {/* Flag List */}
        <div className="space-y-2">
          {Object.entries(challengeNames).map(([id, name]) => {
            const done = completedFlags.includes(id)
            return (
              <div
                key={id}
                className={`flex items-center justify-between p-2 border ${
                  done ? 'border-yellow-700 bg-yellow-900/20' : 'border-green-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={done ? 'text-yellow-400' : 'text-green-700'}>
                    {done ? '🏆' : '⬜'}
                  </span>
                  <span className={`text-sm ${done ? 'text-yellow-400' : 'text-green-600'}`}>
                    {id} - {name}
                  </span>
                </div>
                {done && (
                  <span className="text-xs text-yellow-400">✅ 已提交</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      {completedFlags.length > 0 && (
        <div className="pixel-card">
          <h2 className="text-lg font-pixel text-green-400 mb-4">🏅 已获得徽章</h2>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(challengeNames).map(([id, name]) => {
              if (completedFlags.includes(id)) {
                return (
                  <div key={id} className="text-center p-2 border border-yellow-600 bg-yellow-900/20">
                    <div className="text-2xl">🏅</div>
                    <div className="text-xs text-yellow-400 mt-1">{id}</div>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default FlagSubmit
