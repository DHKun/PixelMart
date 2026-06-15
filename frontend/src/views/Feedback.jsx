import React, { useState } from 'react'
import axios from 'axios'

function Feedback() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setResult('')
    try {
      const res = await axios.post('/api/feedback', { message })
      setResult(`✅ ${res.data.message}`)
    } catch (err) {
      setResult(`❌ ${err.response?.data?.error || '提交失败'}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-pixel text-green-400">📧 联系我们</h1>

      <div className="pixel-card">
        <p className="text-sm text-green-500 mb-4">
          有任何问题或建议？请填写下方表单，管理员会尽快查看。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-green-400 mb-2">留言内容</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pixel-input h-32 resize-none"
              placeholder="请输入您的反馈..."
            />
          </div>
          <button type="submit" className="pixel-btn w-full">
            📨 提交反馈
          </button>
        </form>

        {result && (
          <div className="mt-4 p-3 border border-green-700">
            <p className="text-sm text-green-400">{result}</p>
          </div>
        )}
      </div>

      {/* A06: jQuery version info */}
      <div className="pixel-card">
        <h2 className="text-lg font-pixel text-green-400 mb-4">📦 系统信息</h2>
        <div className="text-sm text-green-600 space-y-1">
          <p>PixelMart v1.0</p>
          <p>前端框架: React 18</p>
          <p id="jquery-version">jQuery 版本: 1.8.3</p>
        </div>
      </div>

      {/* Hidden hint */}
      {/* 💡 提示: 查看页面源码，看看用了什么版本的 jQuery */}
      {/* 试试在留言框输入 <script>alert(document.cookie)</script> */}
    </div>
  )
}

export default Feedback
