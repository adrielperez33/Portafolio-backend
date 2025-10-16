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

// Real-time analytics dashboard
router.get("/live-stats", (req, res) => {
  try {
    console.log("[DEBUG] Iniciando obtención de live-stats...")

    if (!dataManager) {
      throw new Error("DataManager no está inicializado")
    }

    console.log("[DEBUG] Obteniendo métricas...")
    const metrics = dataManager.analytics?.getMetrics()

    if (!metrics) {
      throw new Error("No se pudieron obtener las métricas")
    }

    console.log("[DEBUG] Métricas obtenidas:", {
      pageViews: metrics.pageViews?.total || 0,
      engagement: metrics.engagement?.total || 0,
    })

    console.log("[DEBUG] Obteniendo top projects...")
    const topProjects = dataManager.getTopProjects(1)
    console.log("[DEBUG] Top projects obtenidos:", topProjects?.length || 0)

    console.log("[DEBUG] Obteniendo todos los proyectos...")
    const allProjects = dataManager.getTopProjects(100) // Obtener todos los proyectos (límite alto)

    if (!allProjects || !Array.isArray(allProjects)) {
      throw new Error("No se pudieron obtener los proyectos")
    }

    console.log("[DEBUG] Total proyectos obtenidos:", allProjects.length)

    // Generate live stats data
    const liveStats = {
      totalViews: metrics.pageViews?.total || 0,
      totalLikes: metrics.engagement?.total || 0,
      totalProjects: allProjects.length,
      activeUsers: Math.floor(Math.random() * 10) + 1, // Simulated active users
      topProject:
        topProjects && topProjects.length > 0
          ? {
              title: topProjects[0].title,
              views: topProjects[0].engagement?.views || 0,
            }
          : null,
      recentActivity: [
        {
          type: "view",
          project: "Portfolio Website",
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        },
        {
          type: "like",
          project: "E-commerce App",
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        },
        {
          type: "share",
          project: "Task Manager",
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        },
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    }

    console.log("[DEBUG] Live stats generados exitosamente")
    res.json(liveStats)
  } catch (error) {
    console.error("[ERROR] Error en live-stats:", error)
    console.error("[ERROR] Stack trace:", error instanceof Error ? error.stack : "No stack trace")

    res.status(500).json({
      error: "Error al obtener estadísticas en vivo",
      details: error instanceof Error ? error.message : "Error desconocido",
      success: false,
    })
  }
})

export default router
