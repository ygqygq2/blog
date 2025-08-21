// 简单的新闻订阅 API 替代
import { NextRequest, NextResponse } from 'next/server'

import siteMetadata from '@/data/siteMetadata.cjs'

async function handler(request: NextRequest) {
  if (request.method === 'POST') {
    try {
      const { email } = await request.json()

      if (!email) {
        return NextResponse.json({ error: '邮箱地址必填' }, { status: 400 })
      }

      // 这里可以添加具体的订阅逻辑
      // 例如：添加到数据库，发送到邮件服务提供商等

      console.log('新订阅者:', email)

      return NextResponse.json({
        message: '订阅成功！',
        email: email,
      })
    } catch (error) {
      return NextResponse.json({ error: '订阅失败' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: '方法不允许' }, { status: 405 })
}

export { handler as GET, handler as POST }
