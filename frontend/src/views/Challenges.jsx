import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Challenges({ completedFlags }) {
  const [challenges, setChallenges] = useState([])
  const [revealedHints, setRevealedHints] = useState({})

  useEffect(() => {
    axios.get('/api/challenges').then(res => {
      setChallenges(res.data.challenges)
    })
  }, [])

  const getChallengeIcon = (id) => {
    const icons = {
      'A01': '🚪', 'A02': '🔐', 'A03': '💉', 'A04': '🏗️',
      'A05': '⚙️', 'A06': '🧩', 'A07': '🔑', 'A08': '📝',
      'A09': '📋', 'A10': '🌐'
    }
    return icons[id] || '❓'
  }

  const getDifficulty = (id) => {
    const difficulties = {
      'A01': '⭐', 'A02': '⭐', 'A03': '⭐⭐', 'A04': '⭐⭐',
      'A05': '⭐⭐', 'A06': '⭐⭐⭐', 'A07': '⭐', 'A08': '⭐⭐⭐',
      'A09': '⭐⭐', 'A10': '⭐⭐⭐'
    }
    return difficulties[id] || '⭐⭐'
  }

  const getHint = (id) => {
    const hints = {
      'A01': '检查请求头，试试 X-Forwarded-Role',
      'A02': '你的 token 看起来像 Base64 编码',
      'A03': '试试 UNION SELECT 读取 this_is_flag 表',
      'A04': '结算时价格是你说了算吗？试试负数',
      'A05': '看看 /robots.txt 有什么惊喜',
      'A06': '查看页面用了什么版本的 jQuery？',
      'A07': '试试用 flagadmin 登录，密码很简单',
      'A08': '修改密码的接口是 GET 请求哦',
      'A09': '试试访问 /logs 或 /api/logs',
      'A10': '图片预览功能能访问任意 URL'
    }
    return hints[id] || ''
  }

  const handleHintClick = (id) => {
    if (revealedHints[id]) return // already revealed

    const confirmed = window.confirm('💡 确定要查看提示吗？\n\n提示会降低挑战难度，建议先自己尝试！')
    if (confirmed) {
      setRevealedHints(prev => ({ ...prev, [id]: true }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-pixel text-green-400">🏁 挑战列表</h1>
        <div className="text-sm text-green-500">
          进度: {completedFlags.length}/10
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-pixel-darker border border-green-700 h-6">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${(completedFlags.length / 10) * 100}%` }}
        />
      </div>

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map(challenge => {
          const isCompleted = completedFlags.includes(challenge.id)
          const isRevealed = revealedHints[challenge.id]
          return (
            <div
              key={challenge.id}
              className={`pixel-card transition-all duration-300 ${
                isCompleted ? 'border-yellow-400 opacity-80' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getChallengeIcon(challenge.id)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-green-400">
                      {challenge.id} - {challenge.name}
                    </h3>
                    <p className="text-sm text-green-500 mt-1">{challenge.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 text-xs">{getDifficulty(challenge.id)}</div>
                  {isCompleted && (
                    <div className="text-yellow-400 text-sm mt-1">✅ 已完成</div>
                  )}
                </div>
              </div>

              {/* Blurred Hint - click to reveal */}
              <div
                onClick={() => handleHintClick(challenge.id)}
                className={`mt-3 p-2 border cursor-pointer transition-all duration-300 select-none ${
                  isRevealed
                    ? 'border-green-600 bg-pixel-dark'
                    : 'border-green-800 bg-pixel-dark/50 hover:border-green-600'
                }`}
              >
                {isRevealed ? (
                  <p className="text-xs text-green-400">
                    💡 提示: {getHint(challenge.id)}
                  </p>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-700">💡 提示</span>
                    <span className="text-xs text-green-800 blur-sm select-none">
                      {getHint(challenge.id)}
                    </span>
                    <span className="text-xs text-green-700 ml-auto">点击查看</span>
                  </div>
                )}
              </div>

              {/* Flag for completed */}
              {isCompleted && (
                <div className="mt-2 text-xs text-yellow-400 animate-pulse">
                  🏆 已获得 Flag！
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Challenges
