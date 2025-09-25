import express from "express"
import DataManager from "../data/DataManager.js"
import { validateProjectFilters, validateContactData, validateSearchQuery } from "../middleware/validation.js"

const router = express.Router()
const dataManager = DataManager

// Portfolio routes
router.get("/portfolio", (req, res) => {
  try {
    dataManager.trackPageView("portfolio")
    const portfolio = dataManager.getPortfolio()
    res.json({ ...portfolio, success: true })
  } catch (error) {
    res.status(500).json({ error: "Error al obtener portafolio", success: false })
  }
})

// Project routes
router.get("/projects", validateProjectFilters, (req, res) => {
  try {
    dataManager.trackPageView("projects")
    const filters = req.query
    const projects = dataManager.getAllProjects(filters)

    res.json({
      projects,
      total: projects.length,
      filters,
      stats: dataManager.getProjectStats(),
      success: true,
    })
  } catch (error) {
    res.status(500).json({ error: "Error al obtener proyectos", success: false })
  }
})

router.get("/projects/featured", (req, res) => {
  try {
    const featured = dataManager.getFeaturedProjects()
    res.json({ projects: featured, total: featured.length, success: true })
  } catch (error) {
    res.status(500).json({ error: "Error al obtener proyectos destacados", success: false })
  }
})

router.get("/projects/:identifier", (req, res) => {
  try {
    const { identifier } = req.params
    let project

    if (!isNaN(identifier)) {
      project = dataManager.getProjectById(Number.parseInt(identifier))
    } else {
      project = dataManager.getProjectBySlug(identifier)
    }

    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado", success: false })
    }

    dataManager.trackPageView(`project-${project.slug}`)
    res.json({ project, success: true })
  } catch (error) {
    res.status(500).json({ error: "Error al obtener proyecto", success: false })
  }
})

// Skills routes
router.get("/skills", (req, res) => {
  try {
    dataManager.trackPageView("skills")
    const { category, trending, top } = req.query

    if (category) {
      const categorySkills = dataManager.getSkillsByCategory(category)
      return res.json({ category: categorySkills, success: true })
    }

    if (trending === "true") {
      const trendingSkills = dataManager.getTrendingSkills()
      return res.json({ skills: trendingSkills, type: "trending", success: true })
    }

    const allSkills = dataManager.getAllSkills()
    const stats = dataManager.getSkillStats()

    res.json({
      categories: allSkills,
      stats,
      learning: dataManager.skills.getLearningProgress(),
      success: true,
    })
  } catch (error) {
    res.status(500).json({ error: "Error al obtener habilidades", success: false })
  }
})

// Contact routes
router.post("/contact", validateContactData, (req, res) => {
  try {
    const contactMessage = dataManager.addContactMessage(req.body)
    res.json({
      success: true,
      message: "Mensaje enviado correctamente",
      id: contactMessage.id,
      priority: contactMessage.priority,
    })
  } catch (error) {
    res.status(500).json({ error: "Error al enviar mensaje", success: false })
  }
})

router.get("/contact/info", (req, res) => {
  try {
    const contactInfo = dataManager.getContactInfo()
    res.json({ ...contactInfo, success: true })
  } catch (error) {
    res.status(500).json({ error: "Error al obtener info de contacto", success: false })
  }
})

// Utility routes
router.get("/search", validateSearchQuery, (req, res) => {
  try {
    const { q, type, limit = 10 } = req.query
    const query = q.toLowerCase()
    const results = { projects: [], skills: [], total: 0 }

    if (!type || type === "projects") {
      const allProjects = dataManager.getAllProjects()
      results.projects = allProjects
        .filter(
          (project) =>
            project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query) ||
            project.technologies.some((tech) => tech.toLowerCase().includes(query)),
        )
        .slice(0, Number.parseInt(limit))
    }

    if (!type || type === "skills") {
      const allSkills = Object.values(dataManager.getAllSkills()).flatMap((cat) => cat.skills)
      results.skills = allSkills
        .filter((skill) => skill.name.toLowerCase().includes(query))
        .slice(0, Number.parseInt(limit))
    }

    results.total = results.projects.length + results.skills.length
    res.json({ query: q, results, success: true })
  } catch (error) {
    res.status(500).json({ error: "Error en búsqueda", success: false })
  }
})

router.get("/stats", (req, res) => {
  try {
    dataManager.trackVisitor()
    const analytics = dataManager.getAnalytics()
    res.json({ ...analytics, success: true })
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estadísticas", success: false })
  }
})

export default router
