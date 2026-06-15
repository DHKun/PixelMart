import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function Cart({ user, onUpdate, cartItems, setCartItems }) {
  const productImages = {
    1: '/images/sword.svg', 2: '/images/potion.svg', 3: '/images/map.svg',
    4: '/images/skull.svg', 5: '/images/shield.svg', 6: '/images/mystery.svg', 7: '/images/flag.svg',
  }
  const [result, setResult] = useState(null)

  const updatePrice = (index, newPrice) => {
    const updated = [...cartItems]
    updated[index] = { ...updated[index], price: parseInt(newPrice) || 0 }
    setCartItems(updated)
  }

  const removeItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  const handleCheckout = async () => {
    if (!user) {
      setResult({ error: '请先登录后再结算' })
      return
    }
    setResult(null)
    try {
      const res = await axios.post('/api/checkout', { items: cartItems })
      setResult(res.data)
      onUpdate()
    } catch (err) {
      setResult({ error: err.response?.data?.error || '结算失败' })
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-pixel text-green-400">🛍️ 购物车</h1>
        <Link to="/shop" className="pixel-btn text-sm">← 继续购物</Link>
      </div>

      {user ? (
        <div className="pixel-card">
          <p className="text-sm text-green-500">
            👤 当前用户: {user.username} | 💰 余额: {user.balance}
          </p>
        </div>
      ) : (
        <div className="pixel-border-red p-4">
          <p className="text-sm text-red-400">
            ⚠️ 请先 <Link to="/login" className="text-red-300 underline">登录</Link> 后再使用购物车
          </p>
        </div>
      )}

      {/* Cart Items */}
      <div className="pixel-card">
        <h2 className="text-lg font-pixel text-green-400 mb-4">购物车商品</h2>

        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-green-600">购物车是空的</p>
            <Link to="/shop" className="text-sm text-green-400 hover:text-green-300 mt-2 inline-block">
              去商城逛逛 →
            </Link>
          </div>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border-b border-green-800 last:border-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-400 text-sm"
                >
                  ✕
                </button>
                <img
                  src={productImages[item.id] || '/images/mystery.svg'}
                  alt={item.name}
                  className="w-8 h-8"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div>
                  <p className="text-green-400">{item.name}</p>
                  <p className="text-xs text-green-600">数量: {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-500">价格:</span>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updatePrice(index, e.target.value)}
                  className="pixel-input w-24 text-right text-sm"
                />
              </div>
            </div>
          ))
        )}

        {cartItems.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-green-700">
            <span className="text-lg text-yellow-400 font-pixel">合计: 💰 {total}</span>
          </div>
        )}
      </div>

      {/* Checkout */}
      <button
        onClick={handleCheckout}
        className="pixel-btn w-full"
      >
        💳 结算
      </button>

      {/* Result */}
      {result && (
        <div className={`pixel-card ${result.flag ? 'border-yellow-400' : ''}`}>
          {result.error ? (
            <p className="text-red-400">❌ {result.error}</p>
          ) : (
            <>
              <p className="text-green-400">{result.message}</p>
              <p className="text-sm text-green-500 mt-2">新余额: 💰 {result.new_balance}</p>
              {result.flag && (
                <div className="mt-4 p-4 border border-yellow-500 bg-yellow-900/20">
                  <p className="text-yellow-400 font-bold">🚩 Flag: {result.flag}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}


    </div>
  )
}

export default Cart
