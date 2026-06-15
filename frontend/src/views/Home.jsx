import React from 'react'
import { Link } from 'react-router-dom'

function Home({ user }) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="pixel-card text-center py-12">
        <div className="text-6xl mb-4">🕹️</div>
        <h1 className="text-3xl font-pixel text-green-400 animate-glow mb-4">
          PixelMart
        </h1>
        <p className="text-lg text-green-500 mb-2">
          OWASP Top 10 2021 安全测试靶场
        </p>
        <p className="text-sm text-green-600 mb-8">
          在复古像素商城中探索十大安全漏洞
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/shop" className="pixel-btn">
            🛒 进入商城
          </Link>
          <Link to="/challenges" className="pixel-btn">
            🏁 挑战列表
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon="🔍"
          title="10 大漏洞"
          desc="覆盖 OWASP Top 10 2021 全部类别，每个漏洞对应一个商城功能点"
        />
        <FeatureCard
          icon="🎮"
          title="趣味探索"
          desc="复古像素风界面，在游戏化的体验中学习网络安全知识"
        />
        <FeatureCard
          icon="🏆"
          title="Flag 收集"
          desc="找到所有 flag 并提交，收集你的安全研究员徽章"
        />
      </div>

      {/* Challenge Preview */}
      <div className="pixel-card">
        <h2 className="text-xl font-pixel text-green-400 mb-4">🎯 挑战预览</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {challenges.map(c => (
            <div key={c.id} className="border border-green-700 p-3 text-center hover:border-green-400 transition-colors">
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="text-xs text-green-500">{c.id}</div>
              <div className="text-xs text-green-400 mt-1">{c.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="pixel-border-yellow p-4">
        <p className="text-sm text-yellow-400">
          ⚡ 提示: 每个功能点都可能存在安全漏洞。检查页面源码、控制台输出、网络请求，
          保持好奇心，你就能找到所有 flag！
        </p>
      </div>
    </div>
  )
}

const challenges = [
  { id: 'A01', name: '越权访问', icon: '🚪' },
  { id: 'A02', name: '加密失效', icon: '🔐' },
  { id: 'A03', name: 'SQL注入', icon: '💉' },
  { id: 'A04', name: '不安全设计', icon: '🏗️' },
  { id: 'A05', name: '配置错误', icon: '⚙️' },
  { id: 'A06', name: '脆弱组件', icon: '🧩' },
  { id: 'A07', name: '认证失效', icon: '🔑' },
  { id: 'A08', name: '完整性失效', icon: '📝' },
  { id: 'A09', name: '日志泄露', icon: '📋' },
  { id: 'A10', name: 'SSRF', icon: '🌐' },
]

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="pixel-card text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-pixel text-green-400 mb-2">{title}</h3>
      <p className="text-sm text-green-500">{desc}</p>
    </div>
  )
}

export default Home
