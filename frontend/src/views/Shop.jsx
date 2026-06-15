import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function Shop({ user, cartItems, setCartItems }) {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewResult, setPreviewResult] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async (searchTerm = '') => {
    setLoading(true)
    try {
      const url = searchTerm ? `/api/products?search=${encodeURIComponent(searchTerm)}` : '/api/products'
      const res = await axios.get(url)
      setProducts(res.data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts(search)
  }

  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const addToCart = (product) => {
    if (!user) {
      showToast('请先登录后再加入购物车', 'error')
      return
    }
    const existing = cartItems.find(item => item.id === product.id)
    if (existing) {
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
      showToast(`${product.name} 数量 +1`)
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }])
      showToast(`${product.name} 已加入购物车`)
    }
  }

  const productImages = {
    1: '/images/sword.svg',
    2: '/images/potion.svg',
    3: '/images/map.svg',
    4: '/images/skull.svg',
    5: '/images/shield.svg',
    6: '/images/mystery.svg',
    7: '/images/flag.svg',
  }

  // A10: SSRF - Image preview function
  const handlePreviewImage = async () => {
    if (!previewUrl.trim()) return
    setPreviewLoading(true)
    setPreviewResult(null)
    try {
      // Try as text first (for JSON/internal endpoints)
      const textRes = await axios.post('/api/fetch-image', { url: previewUrl }, {
        responseType: 'text',
        timeout: 5000
      })
      const contentType = textRes.headers['content-type'] || ''
      if (contentType.includes('image')) {
        // It's an image - get as blob
        const blobRes = await axios.post('/api/fetch-image', { url: previewUrl }, {
          responseType: 'blob',
          timeout: 5000
        })
        const url = URL.createObjectURL(blobRes.data)
        setPreviewResult({ type: 'image', url })
      } else {
        // It's text - display directly
        setPreviewResult({ type: 'text', text: textRes.data })
      }
    } catch (err) {
      const text = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.error || '获取失败（可能是协议不支持或地址不可达）'
      setPreviewResult({ type: 'error', text })
    }
    setPreviewLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-pixel text-green-400">🛒 像素商城</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="pixel-btn text-xs"
          >
            🖼️ 图片预览
          </button>
          <Link to="/cart" className="pixel-btn text-sm">
            🛍️ 购物车 ({cartItems.length})
          </Link>
        </div>
      </div>

      {/* A10: SSRF - Image Preview Panel */}
      {showPreview && (
        <div className="pixel-border-blue p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-pixel text-blue-400">🖼️ 图片预览</h2>
            <button onClick={() => setShowPreview(false)} className="text-red-400 text-sm">✕ 关闭</button>
          </div>
          <p className="text-xs text-blue-600 mb-3">
            输入图片 URL 预览商品图片（支持外链）
          </p>
          <div className="flex space-x-2">
            <input
              type="text"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="输入图片 URL..."
              className="pixel-input flex-1 text-sm"
            />
            <button onClick={handlePreviewImage} disabled={previewLoading} className="pixel-btn text-xs">
              {previewLoading ? '加载中...' : '预览'}
            </button>
          </div>
          {previewResult && (
            <div className="mt-3 p-3 border border-blue-800 bg-pixel-dark">
              {previewResult.type === 'image' ? (
                <img src={previewResult.url} alt="preview" className="max-h-64 mx-auto" />
              ) : previewResult.type === 'text' ? (
                <pre className="text-xs text-blue-300 whitespace-pre-wrap break-all">{previewResult.text}</pre>
              ) : (
                <p className="text-xs text-red-400">❌ {previewResult.text}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 border text-sm transition-all duration-300 ${
          toast.type === 'error'
            ? 'border-red-500 bg-red-900/80 text-red-300'
            : 'border-green-500 bg-green-900/80 text-green-300'
        }`}>
          {toast.type === 'error' ? '❌ ' : '✅ '}{toast.message}
        </div>
      )}

      {/* Search - A03: SQL Injection vulnerable */}
      <form onSubmit={handleSearch} className="flex space-x-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索商品..."
          className="pixel-input flex-1"
        />
        <button type="submit" className="pixel-btn">
          🔍 搜索
        </button>
      </form>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-green-500 animate-pulse">加载中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="pixel-card">
              <div className="mb-3 bg-pixel-dark p-2 flex items-center justify-center h-32">
                <img
                  src={productImages[product.id] || '/images/mystery.svg'}
                  alt={product.name}
                  className="h-24 w-24 object-contain pixel-art"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <h3 className="text-lg font-bold text-green-400 mb-2">
                {product.name}
                {product.is_hidden && <span className="text-xs text-red-400 ml-2">[隐藏]</span>}
              </h3>
              <p className="text-sm text-green-500 mb-3">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl text-yellow-400 font-pixel">💰 {product.price}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="pixel-btn text-xs"
                >
                  加入购物车
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!search && (
        <div className="text-center text-xs text-green-800 mt-4">
          {/* 提示: 每个功能点都可能存在安全漏洞，保持好奇心 */}
        </div>
      )}
    </div>
  )
}

export default Shop
