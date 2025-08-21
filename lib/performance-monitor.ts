interface PerformanceMetric {
  count: number
  avg: number
  min: number
  max: number
  total: number
}

// 性能监控工具
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static startTimer(label: string): () => number {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(label, duration)
      return duration
    }
  }

  static recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }

    const values = this.metrics.get(label)!
    values.push(value)

    // 保持最近100个记录
    if (values.length > 100) {
      values.shift()
    }
  }

  static getMetrics(): Record<string, PerformanceMetric> {
    const result: Record<string, PerformanceMetric> = {}

    for (const [label, values] of this.metrics.entries()) {
      if (values.length === 0) continue

      const sum = values.reduce((a, b) => a + b, 0)
      const avg = sum / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)

      result[label] = {
        count: values.length,
        avg: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        total: Math.round(sum * 100) / 100,
      }
    }

    return result
  }

  static clearMetrics(): void {
    this.metrics.clear()
  }

  static logSummary(): void {
    const metrics = this.getMetrics()
    console.log('📊 性能监控摘要:')
    for (const [label, stats] of Object.entries(metrics)) {
      console.log(`  ${label}: 平均 ${stats.avg}ms (${stats.min}-${stats.max}ms, ${stats.count}次)`)
    }
  }
}

// 装饰器函数用于自动计时
export function timed(label?: string) {
  return function <T extends (...args: unknown[]) => unknown>(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value
    if (!originalMethod) return descriptor

    const timerLabel = label || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (this: unknown, ...args: Parameters<T>) {
      const stopTimer = PerformanceMonitor.startTimer(timerLabel)
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } finally {
        stopTimer()
      }
    } as T

    return descriptor
  }
}

// 开发环境下定期输出性能报告
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const metrics = PerformanceMonitor.getMetrics()
    if (Object.keys(metrics).length > 0) {
      PerformanceMonitor.logSummary()
    }
  }, 30000) // 30秒
}
