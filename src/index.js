import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import compression from "compression"
import dataManager from "./data/DataManager.js"
import interactionsRouter from "./routes/interactions.js"
import analyticsRouter from "./routes/analytics.js"

const app = express()
const PORT = process.env.PORT || 3000

// const dataManager = new DataManager()

app.use(
  helmet({
    contentSecurityPolicy: false, // Para desarrollo
  }),
)

app.use(compression())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: { error: "Demasiadas solicitudes, intenta más tarde" },
})
app.use(limiter)

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://tu-dominio.vercel.app"] // Cambia por tu dominio de Vercel
        : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`)
  next()
})

app.get("/api/portfolio", (req, res) => {
  try {
    // Track page view
    dataManager.trackPageView("portfolio")

    const portfolio = dataManager.getPortfolio()
    res.json({
      ...portfolio,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener información del portafolio",
      success: false,
    })
  }
})

app.get("/api/projects", (req, res) => {
  try {
    dataManager.trackPageView("projects")

    const { status, featured, category, tech, tag, limit } = req.query
    const filters = { status, featured, category, tech, tag }

    let projects = dataManager.getAllProjects(filters)

    if (limit) {
      projects = projects.slice(0, Number.parseInt(limit))
    }

    res.json({
      projects,
      total: projects.length,
      filters: filters,
      categories: dataManager.projects.getCategories(),
      technologies: dataManager.projects.getTechnologies(),
      stats: dataManager.getProjectStats(),
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener proyectos",
      success: false,
    })
  }
})

app.get("/api/projects/:identifier", (req, res) => {
  try {
    const { identifier } = req.params
    let project

    // Try to find by ID first, then by slug
    if (!isNaN(identifier)) {
      project = dataManager.getProjectById(Number.parseInt(identifier))
    } else {
      project = dataManager.getProjectBySlug(identifier)
    }

    if (!project) {
      return res.status(404).json({
        error: "Proyecto no encontrado",
        success: false,
      })
    }

    dataManager.trackPageView(`project-${project.slug}`)

    res.json({
      project,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener el proyecto",
      success: false,
    })
  }
})

app.get("/api/projects/featured", (req, res) => {
  try {
    const featuredProjects = dataManager.getFeaturedProjects()

    res.json({
      projects: featuredProjects,
      total: featuredProjects.length,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener proyectos destacados",
      success: false,
    })
  }
})

app.get("/api/skills", (req, res) => {
  try {
    dataManager.trackPageView("skills")

    const { category, trending, top } = req.query

    if (category) {
      const categorySkills = dataManager.getSkillsByCategory(category)
      if (!categorySkills) {
        return res.status(404).json({
          error: "Categoría no encontrada",
          success: false,
        })
      }
      return res.json({
        category: categorySkills,
        success: true,
      })
    }

    if (trending === "true") {
      const trendingSkills = dataManager.getTrendingSkills()
      return res.json({
        skills: trendingSkills,
        total: trendingSkills.length,
        type: "trending",
        success: true,
      })
    }

    if (top) {
      const topSkills = dataManager.skills.getTopSkills(Number.parseInt(top))
      return res.json({
        skills: topSkills,
        total: topSkills.length,
        type: "top",
        success: true,
      })
    }

    const allSkills = dataManager.getAllSkills()
    const stats = dataManager.getSkillStats()
    const learning = dataManager.skills.getLearningProgress()

    res.json({
      categories: allSkills,
      stats,
      learning,
      trending: dataManager.getTrendingSkills(),
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener habilidades",
      success: false,
    })
  }
})

app.get("/api/skills/learning", (req, res) => {
  try {
    const learning = dataManager.skills.getLearningProgress()

    res.json({
      learning,
      total: learning.length,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener progreso de aprendizaje",
      success: false,
    })
  }
})

app.post("/api/contact", (req, res) => {
  try {
    const { name, email, subject, message, company, phone } = req.body

    // Enhanced validation
    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Campos requeridos: name, email, message",
        success: false,
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Email inválido",
        success: false,
      })
    }

    if (message.length < 10) {
      return res.status(400).json({
        error: "El mensaje debe tener al menos 10 caracteres",
        success: false,
      })
    }

    // Store message using DataManager
    const contactMessage = dataManager.addContactMessage({
      name,
      email,
      subject: subject || "Consulta desde portafolio",
      message,
      company,
      phone,
    })

    res.json({
      success: true,
      message: "Mensaje enviado correctamente",
      id: contactMessage.id,
      priority: contactMessage.priority,
      estimatedResponse: "24 horas",
      timestamp: contactMessage.timestamp,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al enviar el mensaje",
      success: false,
    })
  }
})

app.get("/api/contact/info", (req, res) => {
  try {
    const contactInfo = dataManager.getContactInfo()

    res.json({
      ...contactInfo,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener información de contacto",
      success: false,
    })
  }
})

app.get("/api/stats", (req, res) => {
  try {
    dataManager.trackVisitor()
    const analytics = dataManager.getAnalytics()

    res.json({
      ...analytics,
      success: true,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener estadísticas",
      success: false,
    })
  }
})

app.get("/api/dashboard", (req, res) => {
  try {
    const dashboard = dataManager.getDashboard()

    res.json({
      ...dashboard,
      success: true,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener dashboard",
      success: false,
    })
  }
})

app.get("/api/search", (req, res) => {
  try {
    const { q, type, limit = 10 } = req.query

    if (!q || q.length < 2) {
      return res.status(400).json({
        error: "Query debe tener al menos 2 caracteres",
        success: false,
      })
    }

    const query = q.toLowerCase()
    const results = {
      projects: [],
      skills: [],
      total: 0,
    }

    // Search in projects
    if (!type || type === "projects") {
      const allProjects = dataManager.getAllProjects()
      results.projects = allProjects
        .filter(
          (project) =>
            project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query) ||
            project.technologies.some((tech) => tech.toLowerCase().includes(query)) ||
            project.tags.some((tag) => tag.toLowerCase().includes(query)),
        )
        .slice(0, Number.parseInt(limit))
    }

    // Search in skills
    if (!type || type === "skills") {
      const allSkills = Object.values(dataManager.getAllSkills()).flatMap((category) => category.skills)

      results.skills = allSkills
        .filter(
          (skill) =>
            skill.name.toLowerCase().includes(query) ||
            skill.subSkills?.some((sub) => sub.toLowerCase().includes(query)),
        )
        .slice(0, Number.parseInt(limit))
    }

    results.total = results.projects.length + results.skills.length

    res.json({
      query: q,
      results,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error en la búsqueda",
      success: false,
    })
  }
})

app.get("/api/categories", (req, res) => {
  try {
    const projectCategories = dataManager.projects.getCategories()
    const skillCategories = Object.keys(dataManager.getAllSkills()).map((key) => ({
      name: dataManager.getAllSkills()[key].name,
      key,
      icon: dataManager.getAllSkills()[key].icon,
    }))

    res.json({
      projects: projectCategories,
      skills: skillCategories,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener categorías",
      success: false,
    })
  }
})

app.get("/api/technologies", (req, res) => {
  try {
    const technologies = dataManager.projects.getTechnologies()

    res.json({
      technologies,
      total: technologies.length,
      mostUsed: technologies[0]?.name || null,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener tecnologías",
      success: false,
    })
  }
})

app.use("/api/interactions", interactionsRouter)
app.use("/api/analytics", analyticsRouter)

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Portfolio API v3.0 - Complete Analytics & Insights System",
    status: "active",
    timestamp: new Date().toISOString(),
    endpoints: {
      core: {
        health: "GET /api/health",
        portfolio: "GET /api/portfolio",
        dashboard: "GET /api/dashboard",
        stats: "GET /api/stats",
      },
      projects: {
        all: "GET /api/projects",
        byId: "GET /api/projects/:id",
        bySlug: "GET /api/projects/:slug",
        featured: "GET /api/projects/featured",
        withEngagement: "GET /api/interactions/projects/:id/engagement",
      },
      skills: {
        all: "GET /api/skills",
        byCategory: "GET /api/skills?category=:category",
        trending: "GET /api/skills?trending=true",
        top: "GET /api/skills?top=:number",
        learning: "GET /api/skills/learning",
      },
      contact: {
        send: "POST /api/contact",
        info: "GET /api/contact/info",
      },
      interactions: {
        session: "POST /api/interactions/session",
        like: "POST /api/interactions/projects/:id/like",
        view: "POST /api/interactions/projects/:id/view",
        favorite: "POST /api/interactions/projects/:id/favorite",
        comment: "POST /api/interactions/projects/:id/comments",
        rating: "POST /api/interactions/projects/:id/rating",
        share: "POST /api/interactions/projects/:id/share",
        topProjects: "GET /api/interactions/top-projects",
        analytics: "GET /api/interactions/analytics/engagement",
      },
      analytics: {
        overview: "GET /api/analytics",
        metrics: "GET /api/analytics/metrics/:type",
        insights: "GET /api/analytics/insights",
        dashboard: "GET /api/analytics/dashboard",
        reports: "GET /api/analytics/reports",
        generateReport: "POST /api/analytics/reports",
        performance: "GET /api/analytics/performance",
        export: "GET /api/analytics/export",
        track: "POST /api/analytics/track",
      },
      utility: {
        search: "GET /api/search?q=:query",
        categories: "GET /api/categories",
        technologies: "GET /api/technologies",
      },
    },
    features: [
      "Dynamic content filtering",
      "Real-time analytics",
      "Advanced search",
      "Contact management",
      "Skills tracking",
      "Project metrics",
      "Interactive features (likes, favorites, comments)",
      "User engagement tracking",
      "Rating system",
      "Social sharing",
      "Automated insights generation",
      "Performance monitoring",
      "Predictive analytics",
      "Custom reporting",
      "Data export capabilities",
    ],
    version: "3.0.0",
    author: "Tu Nombre",
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Algo salió mal!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint no encontrado",
    path: req.originalUrl,
    availableEndpoints: [
      "/",
      "/api/health",
      "/api/portfolio",
      "/api/projects",
      "/api/skills",
      "/api/contact",
      "/api/stats",
      "/api/dashboard",
      "/api/search",
      "/api/categories",
      "/api/technologies",
      "/api/interactions",
      "/api/analytics",
    ],
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Portfolio API corriendo en puerto ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🎯 Endpoints disponibles: http://localhost:${PORT}/`)
})
