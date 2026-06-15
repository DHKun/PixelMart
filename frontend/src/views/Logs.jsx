import React, { useState } from 'react'
import axios from 'axios'

function Logs() {
  const [logs, setLogs] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/logs')
      setLogs(res.data.logs)
    } catch (err) {
      setLogs('获取日志失败')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-pixel text-green-400">📋 系统日志</h1>

      <button
        onClick={fetchLogs}
        disabled={loading}
        className="pixel-btn"
      >
        {loading ? '加载中...' : '📂 查看日志'}
      </button>

      {logs && (
        <div className="pixel-card">
          <pre className="text-xs text-green-500 whitespace-pre-wrap font-mono leading-relaxed">
            {logs}
          </pre>
        </div>
      )}

      {/* Hidden hint */}
      {/* 💡 提示: 日志里有管理员的 session 信息！ */}
    </div>
  )
}

export default Logs
