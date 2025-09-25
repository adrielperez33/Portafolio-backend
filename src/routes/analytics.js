import express from "express"
import DataManager from "../data/DataManager.js"

const router = express.Router()
const dataManager = DataManager

// Get comprehensive analytics
router.get("/", (req, res) => {
  try {
    const analytics = dataManager.analytics.getMetrics()
    const insights = dataManager.analytics.getInsights()

    res.json({
      analytics,
      insights,
      success: true,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener analytics",
      success: false,
    })
  }
})

// Get specific metrics
router.get("/metrics/:type", (req, res) => {
  try {
    const { type } = req.params
    const metrics = dataManager.analytics.getMetrics()

    if (!metrics[type]) {
      return res.status(404).json({
        error: "Tipo de métrica no encontrado",
        success: false,
      })
    }

    res.json({
      type,
      data: metrics[type],
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener métricas",
      success: false,
    })
  }
})

// Get insights
router.get("/insights", (req, res) => {
  try {
    const insights = dataManager.analytics.getInsights()

    res.json({
      ...insights,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener insights",
      success: false,
    })
  }
})

// Generate report
router.post("/reports", (req, res) => {
  try {
    const { type = "weekly" } = req.body

    if (!["daily", "weekly", "monthly", "performance"].includes(type)) {
      return res.status(400).json({
        error: "Tipo de reporte inválido. Usar: daily, weekly, monthly, performance",
        success: false,
      })
    }

    const report = dataManager.analytics.generateReport(type)

    res.json({
      report,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al generar reporte",
      success: false,
    })
  }
})

// Get reports
router.get("/reports", (req, res) => {
  try {
    const { type, limit = 10 } = req.query
    let reports = dataManager.analytics.getReports(type)

    // Sort by generation date (newest first)
    reports = reports.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)).slice(0, Number.parseInt(limit))

    res.json({
      reports,
      total: reports.length,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reportes",
      success: false,
    })
  }
})

// Get specific report
router.get("/reports/:reportId", (req, res) => {
  try {
    const { reportId } = req.params
    const reports = dataManager.analytics.getReports()
    const report = reports.find((r) => r.id === reportId)

    if (!report) {
      return res.status(404).json({
        error: "Reporte no encontrado",
        success: false,
      })
    }

    res.json({
      report,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reporte",
      success: false,
    })
  }
})

// Real-time analytics dashboard
router.get("/dashboard", (req, res) => {
  try {
    const metrics = dataManager.analytics.getMetrics()
    const insights = dataManager.analytics.getInsights()
    const topProjects = dataManager.getTopProjects(5)

    // Generate quick stats
    const quickStats = {
      totalVisitors: metrics.visitors.total,
      todayVisitors: metrics.visitors.daily[new Date().toISOString().split("T")[0]] || 0,
      engagementRate: metrics.engagement.rate,
      avgResponseTime: metrics.performance.avgResponseTime,
      topPage: Object.entries(metrics.pageViews.pages).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A",
    }

    // Recent activity (last 24 hours simulation)
    const recentActivity = [
      { type: "visitor", message: "Nuevo visitante desde España", time: "hace 5 min" },
      { type: "engagement", message: "Proyecto 'E-commerce' recibió un like", time: "hace 12 min" },
      { type: "contact", message: "Nuevo mensaje de contacto", time: "hace 1 hora" },
      { type: "view", message: "Página de skills visualizada", time: "hace 2 horas" },
    ]

    res.json({
      quickStats,
      metrics,
      insights,
      topProjects,
      recentActivity,
      alerts: insights.alerts.filter((alert) => alert.severity === "critical"),
      success: true,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener dashboard de analytics",
      success: false,
    })
  }
})

// Track custom event
router.post("/track", (req, res) => {
  try {
    const { event, data, sessionId } = req.body

    if (!event || !sessionId) {
      return res.status(400).json({
        error: "event y sessionId son requeridos",
        success: false,
      })
    }

    // Track the custom event
    dataManager.analytics.trackEngagement(event, { ...data, sessionId })

    res.json({
      message: "Evento registrado correctamente",
      event,
      timestamp: new Date().toISOString(),
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al registrar evento",
      success: false,
    })
  }
})

// Performance monitoring
router.get("/performance", (req, res) => {
  try {
    const performanceReport = dataManager.analytics.generateReport("performance")

    res.json({
      ...performanceReport.data,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener métricas de performance",
      success: false,
    })
  }
})

// Export analytics data
router.get("/export", (req, res) => {
  try {
    const { format = "json", type = "all" } = req.query

    let data = {}

    switch (type) {
      case "metrics":
        data = dataManager.analytics.getMetrics()
        break
      case "insights":
        data = dataManager.analytics.getInsights()
        break
      case "reports":
        data = { reports: dataManager.analytics.getReports() }
        break
      default:
        data = {
          metrics: dataManager.analytics.getMetrics(),
          insights: dataManager.analytics.getInsights(),
          reports: dataManager.analytics.getReports(),
        }
    }

    if (format === "csv") {
      // Simple CSV export for metrics
      const csv = convertToCSV(data)
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="analytics_${type}_${Date.now()}.csv"`)
      return res.send(csv)
    }

    res.setHeader("Content-Type", "application/json")
    res.setHeader("Content-Disposition", `attachment; filename="analytics_${type}_${Date.now()}.json"`)
    res.json({
      exportedAt: new Date().toISOString(),
      type,
      data,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al exportar datos",
      success: false,
    })
  }
})

// Helper function for CSV conversion
function convertToCSV(data) {
  // Simple CSV conversion - would need more sophisticated implementation
  const headers = Object.keys(data)
  const rows = [headers.join(",")]

  // This is a simplified version - real implementation would handle nested objects
  if (data.metrics && data.metrics.visitors) {
    rows.push(`visitors,${data.metrics.visitors.total}`)
    rows.push(`pageViews,${data.metrics.pageViews.total}`)
    rows.push(`engagement,${data.metrics.engagement.total}`)
  }

  return rows.join("\n")
}

export default router
