export class Analytics {
  constructor() {
    this.metrics = {
      visitors: {
        daily: new Map(), // date -> count
        weekly: new Map(),
        monthly: new Map(),
        unique: new Set(), // unique visitor IDs
        returning: new Set(), // returning visitor IDs
      },
      pageViews: {
        total: 0,
        pages: new Map(), // page -> count
        timeSpent: new Map(), // page -> total time
        bounceRate: new Map(), // page -> bounce count
      },
      engagement: {
        totalInteractions: 0,
        interactionTypes: new Map(), // type -> count
        averageSessionDuration: 0,
        topContent: [],
        conversionFunnels: new Map(),
      },
      performance: {
        responseTime: [],
        errorRate: 0,
        uptime: 99.9,
        apiCalls: new Map(), // endpoint -> count
      },
      demographics: {
        countries: new Map(),
        devices: new Map(),
        browsers: new Map(),
        referrers: new Map(),
      },
      trends: {
        growth: {
          visitors: [],
          engagement: [],
          projects: [],
        },
        predictions: {
          nextWeekVisitors: 0,
          trendingProjects: [],
          skillDemand: [],
        },
      },
    }

    this.insights = {
      automated: [],
      recommendations: [],
      alerts: [],
      reports: new Map(), // reportId -> report data
    }

    this.startTime = new Date()
    this.lastAnalysisTime = new Date()
  }

  // Visitor tracking
  trackVisitor(visitorData) {
    const { sessionId, ip, userAgent, country, referrer, isReturning } = visitorData
    const today = new Date().toISOString().split("T")[0]
    const thisWeek = this.getWeekKey(new Date())
    const thisMonth = new Date().toISOString().substring(0, 7)

    // Daily tracking
    const dailyCount = this.metrics.visitors.daily.get(today) || 0
    this.metrics.visitors.daily.set(today, dailyCount + 1)

    // Weekly tracking
    const weeklyCount = this.metrics.visitors.weekly.get(thisWeek) || 0
    this.metrics.visitors.weekly.set(thisWeek, weeklyCount + 1)

    // Monthly tracking
    const monthlyCount = this.metrics.visitors.monthly.get(thisMonth) || 0
    this.metrics.visitors.monthly.set(thisMonth, monthlyCount + 1)

    // Unique vs returning
    if (isReturning) {
      this.metrics.visitors.returning.add(sessionId)
    } else {
      this.metrics.visitors.unique.add(sessionId)
    }

    // Demographics
    if (country) {
      const countryCount = this.metrics.demographics.countries.get(country) || 0
      this.metrics.demographics.countries.set(country, countryCount + 1)
    }

    if (referrer) {
      const referrerCount = this.metrics.demographics.referrers.get(referrer) || 0
      this.metrics.demographics.referrers.set(referrer, referrerCount + 1)
    }

    this.extractDeviceInfo(userAgent)
    this.generateInsights()
  }

  // Page view tracking
  trackPageView(page, sessionId, timeSpent = 0) {
    this.metrics.pageViews.total++

    const pageCount = this.metrics.pageViews.pages.get(page) || 0
    this.metrics.pageViews.pages.set(page, pageCount + 1)

    if (timeSpent > 0) {
      const currentTime = this.metrics.pageViews.timeSpent.get(page) || 0
      this.metrics.pageViews.timeSpent.set(page, currentTime + timeSpent)
    }

    // Track bounce rate (if time spent < 30 seconds)
    if (timeSpent < 30000) {
      const bounceCount = this.metrics.pageViews.bounceRate.get(page) || 0
      this.metrics.pageViews.bounceRate.set(page, bounceCount + 1)
    }
  }

  // Engagement tracking
  trackEngagement(type, data = {}) {
    this.metrics.engagement.totalInteractions++

    const typeCount = this.metrics.engagement.interactionTypes.get(type) || 0
    this.metrics.engagement.interactionTypes.set(type, typeCount + 1)

    // Update conversion funnels
    this.updateConversionFunnel(type, data)
  }

  // Performance tracking
  trackPerformance(endpoint, responseTime, success = true) {
    this.metrics.performance.responseTime.push({
      endpoint,
      time: responseTime,
      timestamp: new Date().toISOString(),
    })

    // Keep only last 1000 entries
    if (this.metrics.performance.responseTime.length > 1000) {
      this.metrics.performance.responseTime.shift()
    }

    const apiCount = this.metrics.performance.apiCalls.get(endpoint) || 0
    this.metrics.performance.apiCalls.set(endpoint, apiCount + 1)

    if (!success) {
      this.metrics.performance.errorRate++
    }
  }

  // Insights generation
  generateInsights() {
    const now = new Date()

    // Only generate insights every hour
    if (now - this.lastAnalysisTime < 3600000) return

    this.insights.automated = []
    this.insights.recommendations = []

    // Traffic insights
    this.analyzeTrafficTrends()

    // Engagement insights
    this.analyzeEngagementPatterns()

    // Performance insights
    this.analyzePerformanceMetrics()

    // Content insights
    this.analyzeContentPerformance()

    // Predictive insights
    this.generatePredictions()

    this.lastAnalysisTime = now
  }

  analyzeTrafficTrends() {
    const last7Days = this.getLast7DaysData()
    const growth = this.calculateGrowthRate(last7Days)

    if (growth > 20) {
      this.insights.automated.push({
        type: "traffic_surge",
        title: "Pico de tráfico detectado",
        description: `El tráfico ha aumentado un ${growth.toFixed(1)}% en los últimos 7 días`,
        impact: "high",
        timestamp: new Date().toISOString(),
      })
    } else if (growth < -10) {
      this.insights.automated.push({
        type: "traffic_decline",
        title: "Disminución de tráfico",
        description: `El tráfico ha disminuido un ${Math.abs(growth).toFixed(1)}% en los últimos 7 días`,
        impact: "medium",
        timestamp: new Date().toISOString(),
      })

      this.insights.recommendations.push({
        type: "content_strategy",
        title: "Mejorar estrategia de contenido",
        description: "Considera crear nuevo contenido o promocionar proyectos existentes",
        priority: "high",
      })
    }
  }

  analyzeEngagementPatterns() {
    const engagementRate = this.calculateEngagementRate()

    if (engagementRate > 0.15) {
      this.insights.automated.push({
        type: "high_engagement",
        title: "Excelente engagement",
        description: `Tasa de engagement del ${(engagementRate * 100).toFixed(1)}%`,
        impact: "positive",
        timestamp: new Date().toISOString(),
      })
    } else if (engagementRate < 0.05) {
      this.insights.recommendations.push({
        type: "improve_engagement",
        title: "Mejorar engagement",
        description: "Añadir más elementos interactivos o mejorar el contenido existente",
        priority: "medium",
      })
    }

    // Analyze interaction types
    const topInteraction = this.getTopInteractionType()
    if (topInteraction) {
      this.insights.automated.push({
        type: "popular_interaction",
        title: `${topInteraction.type} es la interacción más popular`,
        description: `${topInteraction.count} interacciones registradas`,
        impact: "info",
        timestamp: new Date().toISOString(),
      })
    }
  }

  analyzePerformanceMetrics() {
    const avgResponseTime = this.getAverageResponseTime()

    if (avgResponseTime > 1000) {
      this.insights.alerts.push({
        type: "performance_warning",
        title: "Tiempo de respuesta elevado",
        description: `Tiempo promedio: ${avgResponseTime}ms`,
        severity: "warning",
        timestamp: new Date().toISOString(),
      })

      this.insights.recommendations.push({
        type: "optimize_performance",
        title: "Optimizar rendimiento",
        description: "Considerar implementar caching o optimizar consultas",
        priority: "high",
      })
    }

    const errorRate = this.calculateErrorRate()
    if (errorRate > 0.05) {
      this.insights.alerts.push({
        type: "error_rate_high",
        title: "Tasa de errores elevada",
        description: `${(errorRate * 100).toFixed(2)}% de errores`,
        severity: "critical",
        timestamp: new Date().toISOString(),
      })
    }
  }

  analyzeContentPerformance() {
    const topPages = this.getTopPages(5)
    const underperformingPages = this.getUnderperformingPages()

    if (topPages.length > 0) {
      this.insights.automated.push({
        type: "top_content",
        title: "Contenido más popular",
        description: `${topPages[0].page} lidera con ${topPages[0].views} vistas`,
        impact: "positive",
        timestamp: new Date().toISOString(),
        data: topPages,
      })
    }

    if (underperformingPages.length > 0) {
      this.insights.recommendations.push({
        type: "improve_content",
        title: "Mejorar contenido con bajo rendimiento",
        description: `${underperformingPages.length} páginas necesitan atención`,
        priority: "medium",
        data: underperformingPages,
      })
    }
  }

  generatePredictions() {
    // Simple linear regression for visitor prediction
    const last30Days = this.getLast30DaysData()
    const predictedVisitors = this.predictNextWeekVisitors(last30Days)

    this.metrics.trends.predictions.nextWeekVisitors = predictedVisitors

    // Trending projects prediction
    const trendingProjects = this.predictTrendingProjects()
    this.metrics.trends.predictions.trendingProjects = trendingProjects
  }

  // Utility methods
  getWeekKey(date) {
    const year = date.getFullYear()
    const week = this.getWeekNumber(date)
    return `${year}-W${week}`
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  }

  getLast7DaysData() {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      const count = this.metrics.visitors.daily.get(dateKey) || 0
      data.push({ date: dateKey, count })
    }
    return data
  }

  getLast30DaysData() {
    const data = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      const count = this.metrics.visitors.daily.get(dateKey) || 0
      data.push({ date: dateKey, count })
    }
    return data
  }

  calculateGrowthRate(data) {
    if (data.length < 2) return 0

    const firstHalf = data.slice(0, Math.floor(data.length / 2))
    const secondHalf = data.slice(Math.floor(data.length / 2))

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.count, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.count, 0) / secondHalf.length

    return firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100
  }

  calculateEngagementRate() {
    const totalVisitors = this.metrics.visitors.unique.size + this.metrics.visitors.returning.size
    return totalVisitors === 0 ? 0 : this.metrics.engagement.totalInteractions / totalVisitors
  }

  getTopInteractionType() {
    let maxCount = 0
    let topType = null

    for (const [type, count] of this.metrics.engagement.interactionTypes.entries()) {
      if (count > maxCount) {
        maxCount = count
        topType = type
      }
    }

    return topType ? { type: topType, count: maxCount } : null
  }

  getAverageResponseTime() {
    if (this.metrics.performance.responseTime.length === 0) return 0

    const total = this.metrics.performance.responseTime.reduce((sum, entry) => sum + entry.time, 0)
    return total / this.metrics.performance.responseTime.length
  }

  calculateErrorRate() {
    const totalRequests = Array.from(this.metrics.performance.apiCalls.values()).reduce((sum, count) => sum + count, 0)
    return totalRequests === 0 ? 0 : this.metrics.performance.errorRate / totalRequests
  }

  getTopPages(limit = 10) {
    return Array.from(this.metrics.pageViews.pages.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  }

  getUnderperformingPages() {
    const avgViews = this.metrics.pageViews.total / this.metrics.pageViews.pages.size
    return Array.from(this.metrics.pageViews.pages.entries())
      .filter(([page, views]) => views < avgViews * 0.3)
      .map(([page, views]) => ({ page, views }))
  }

  predictNextWeekVisitors(data) {
    if (data.length < 7) return 0

    // Simple moving average prediction
    const recent = data.slice(-7)
    const avg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length
    return Math.round(avg * 7) // Weekly prediction
  }

  predictTrendingProjects() {
    // This would integrate with project engagement data
    return []
  }

  extractDeviceInfo(userAgent) {
    if (!userAgent) return

    // Simple device detection
    let device = "desktop"
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      device = "mobile"
    } else if (/Tablet|iPad/.test(userAgent)) {
      device = "tablet"
    }

    const deviceCount = this.metrics.demographics.devices.get(device) || 0
    this.metrics.demographics.devices.set(device, deviceCount + 1)

    // Simple browser detection
    let browser = "unknown"
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"

    const browserCount = this.metrics.demographics.browsers.get(browser) || 0
    this.metrics.demographics.browsers.set(browser, browserCount + 1)
  }

  updateConversionFunnel(type, data) {
    // Track conversion funnels (view -> like -> favorite -> contact)
    const funnelSteps = ["view", "like", "favorite", "contact"]
    const stepIndex = funnelSteps.indexOf(type)

    if (stepIndex !== -1) {
      const funnelData = this.metrics.engagement.conversionFunnels.get("main") || {
        view: 0,
        like: 0,
        favorite: 0,
        contact: 0,
      }

      funnelData[type]++
      this.metrics.engagement.conversionFunnels.set("main", funnelData)
    }
  }

  // Report generation
  generateReport(type = "weekly") {
    const reportId = `${type}_${Date.now()}`
    const report = {
      id: reportId,
      type,
      generatedAt: new Date().toISOString(),
      period: this.getReportPeriod(type),
      data: {},
    }

    switch (type) {
      case "daily":
        report.data = this.generateDailyReport()
        break
      case "weekly":
        report.data = this.generateWeeklyReport()
        break
      case "monthly":
        report.data = this.generateMonthlyReport()
        break
      case "performance":
        report.data = this.generatePerformanceReport()
        break
    }

    this.insights.reports.set(reportId, report)
    return report
  }

  generateDailyReport() {
    const today = new Date().toISOString().split("T")[0]
    return {
      visitors: this.metrics.visitors.daily.get(today) || 0,
      pageViews: this.getTodayPageViews(),
      topPages: this.getTopPages(5),
      engagement: this.getTodayEngagement(),
      insights: this.insights.automated.slice(-5),
    }
  }

  generateWeeklyReport() {
    const last7Days = this.getLast7DaysData()
    const totalVisitors = last7Days.reduce((sum, d) => sum + d.count, 0)

    return {
      visitors: {
        total: totalVisitors,
        daily: last7Days,
        growth: this.calculateGrowthRate(last7Days),
      },
      engagement: {
        total: this.metrics.engagement.totalInteractions,
        rate: this.calculateEngagementRate(),
        topInteractions: this.getTopInteractionTypes(5),
      },
      content: {
        topPages: this.getTopPages(10),
        avgTimeSpent: this.getAverageTimeSpent(),
      },
      demographics: this.getDemographicsSnapshot(),
      insights: this.insights.automated,
      recommendations: this.insights.recommendations,
    }
  }

  generateMonthlyReport() {
    const last30Days = this.getLast30DaysData()
    const totalVisitors = last30Days.reduce((sum, d) => sum + d.count, 0)

    return {
      visitors: {
        total: totalVisitors,
        unique: this.metrics.visitors.unique.size,
        returning: this.metrics.visitors.returning.size,
        growth: this.calculateGrowthRate(last30Days),
      },
      engagement: {
        total: this.metrics.engagement.totalInteractions,
        conversionFunnels: Object.fromEntries(this.metrics.engagement.conversionFunnels),
      },
      performance: {
        avgResponseTime: this.getAverageResponseTime(),
        errorRate: this.calculateErrorRate(),
        uptime: this.metrics.performance.uptime,
      },
      predictions: this.metrics.trends.predictions,
      insights: this.insights.automated,
      recommendations: this.insights.recommendations,
    }
  }

  generatePerformanceReport() {
    return {
      responseTime: {
        average: this.getAverageResponseTime(),
        p95: this.getPercentile(95),
        slowestEndpoints: this.getSlowestEndpoints(5),
      },
      errors: {
        rate: this.calculateErrorRate(),
        total: this.metrics.performance.errorRate,
      },
      apiUsage: Object.fromEntries(this.metrics.performance.apiCalls),
      uptime: this.metrics.performance.uptime,
      recommendations: this.getPerformanceRecommendations(),
    }
  }

  // Helper methods for reports
  getTodayPageViews() {
    // Implementation would filter today's page views
    return Math.floor(this.metrics.pageViews.total * 0.1) // Simplified
  }

  getTodayEngagement() {
    // Implementation would filter today's engagement
    return Math.floor(this.metrics.engagement.totalInteractions * 0.1) // Simplified
  }

  getTopInteractionTypes(limit) {
    return Array.from(this.metrics.engagement.interactionTypes.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  getAverageTimeSpent() {
    const totalTime = Array.from(this.metrics.pageViews.timeSpent.values()).reduce((sum, time) => sum + time, 0)
    const totalViews = this.metrics.pageViews.total
    return totalViews === 0 ? 0 : totalTime / totalViews
  }

  getDemographicsSnapshot() {
    return {
      countries: Object.fromEntries(this.metrics.demographics.countries),
      devices: Object.fromEntries(this.metrics.demographics.devices),
      browsers: Object.fromEntries(this.metrics.demographics.browsers),
      referrers: Object.fromEntries(this.metrics.demographics.referrers),
    }
  }

  getPercentile(percentile) {
    const times = this.metrics.performance.responseTime.map((entry) => entry.time).sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * times.length) - 1
    return times[index] || 0
  }

  getSlowestEndpoints(limit) {
    const endpointTimes = new Map()

    this.metrics.performance.responseTime.forEach((entry) => {
      const current = endpointTimes.get(entry.endpoint) || []
      current.push(entry.time)
      endpointTimes.set(entry.endpoint, current)
    })

    return Array.from(endpointTimes.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit)
  }

  getPerformanceRecommendations() {
    const recommendations = []
    const avgTime = this.getAverageResponseTime()

    if (avgTime > 500) {
      recommendations.push({
        type: "response_time",
        message: "Considerar implementar caching para mejorar tiempos de respuesta",
        priority: "high",
      })
    }

    const errorRate = this.calculateErrorRate()
    if (errorRate > 0.01) {
      recommendations.push({
        type: "error_handling",
        message: "Mejorar manejo de errores y validación de datos",
        priority: "medium",
      })
    }

    return recommendations
  }

  getReportPeriod(type) {
    const now = new Date()
    switch (type) {
      case "daily":
        return {
          start: now.toISOString().split("T")[0],
          end: now.toISOString().split("T")[0],
        }
      case "weekly":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - 6)
        return {
          start: weekStart.toISOString().split("T")[0],
          end: now.toISOString().split("T")[0],
        }
      case "monthly":
        const monthStart = new Date(now)
        monthStart.setDate(now.getDate() - 29)
        return {
          start: monthStart.toISOString().split("T")[0],
          end: now.toISOString().split("T")[0],
        }
      default:
        return { start: null, end: null }
    }
  }

  // Public API methods
  getMetrics() {
    return {
      visitors: {
        total: this.metrics.visitors.unique.size + this.metrics.visitors.returning.size,
        unique: this.metrics.visitors.unique.size,
        returning: this.metrics.visitors.returning.size,
        daily: Object.fromEntries(this.metrics.visitors.daily),
      },
      pageViews: {
        total: this.metrics.pageViews.total,
        pages: Object.fromEntries(this.metrics.pageViews.pages),
      },
      engagement: {
        total: this.metrics.engagement.totalInteractions,
        rate: this.calculateEngagementRate(),
        types: Object.fromEntries(this.metrics.engagement.interactionTypes),
      },
      performance: {
        avgResponseTime: this.getAverageResponseTime(),
        errorRate: this.calculateErrorRate(),
        uptime: this.metrics.performance.uptime,
      },
      demographics: this.getDemographicsSnapshot(),
    }
  }

  getInsights() {
    this.generateInsights() // Ensure insights are up to date
    return {
      automated: this.insights.automated,
      recommendations: this.insights.recommendations,
      alerts: this.insights.alerts,
      lastUpdated: this.lastAnalysisTime.toISOString(),
    }
  }

  getReports(type = null) {
    if (type) {
      return Array.from(this.insights.reports.values()).filter((report) => report.type === type)
    }
    return Array.from(this.insights.reports.values())
  }
}
