import { NextResponse } from 'next/server'

// 健康检查API - 用于验证动态模式服务状态
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'dynamic',
    version: '1.0.0'
  })
}
