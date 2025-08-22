// 简单的新闻订阅 API 替代
import { NextRequest, NextResponse } from 'next/server'

import siteMetadata from '@/data/siteMetadata.cjs'

// 配置静态导出
export const dynamic = 'force-static'

async function handler(request: NextRequest) {
  // 在静态模式下返回不可用信息
  if (siteMetadata.staticMode) {
    return NextResponse.json(
      {
        error: '订阅功能在静态模式下不可用',
        message: '请通过邮箱 ygqygq2@qq.com 联系我们',
      },
      { status: 501 },
    )
  }

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
    } catch (_error) {
      return NextResponse.json({ error: '订阅失败' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: '方法不允许' }, { status: 405 })
}

export { handler as GET, handler as POST }
