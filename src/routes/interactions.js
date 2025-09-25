import express from "express"
import DataManager from "../data/DataManager.js"

const router = express.Router()
const dataManager = DataManager

// Session management
router.post("/session", (req, res) => {
  try {
    const sessionData = {
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      referrer: req.get("Referrer"),
      ...req.body,
    }

    const session = dataManager.createSession(sessionData)

    res.json({
      session,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al crear sesión",
      success: false,
    })
  }
})

router.put("/session/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params
    const updates = req.body

    const session = dataManager.updateSession(sessionId, updates)

    if (!session) {
      return res.status(404).json({
        error: "Sesión no encontrada",
        success: false,
      })
    }

    res.json({
      session,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar sesión",
      success: false,
    })
  }
})

// Like system
router.post("/projects/:projectId/like", (req, res) => {
  try {
    const { projectId } = req.params
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({
        error: "sessionId es requerido",
        success: false,
      })
    }

    const result = dataManager.toggleProjectLike(projectId, sessionId)

    res.json({
      ...result,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al procesar like",
      success: false,
    })
  }
})

router.get("/projects/:projectId/likes", (req, res) => {
  try {
    const { projectId } = req.params
    const { sessionId } = req.query

    const totalLikes = dataManager.getProjectLikes(projectId)
    const hasLiked = sessionId ? dataManager.hasUserLiked(projectId, sessionId) : false

    res.json({
      projectId: Number.parseInt(projectId),
      totalLikes,
      hasLiked,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener likes",
      success: false,
    })
  }
})

// View tracking
router.post("/projects/:projectId/view", (req, res) => {
  try {
    const { projectId } = req.params
    const { sessionId, duration = 0 } = req.body

    if (!sessionId) {
      return res.status(400).json({
        error: "sessionId es requerido",
        success: false,
      })
    }

    const result = dataManager.trackProjectView(projectId, sessionId, duration)

    res.json({
      ...result,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al registrar vista",
      success: false,
    })
  }
})

// Favorites system
router.post("/projects/:projectId/favorite", (req, res) => {
  try {
    const { projectId } = req.params
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({
        error: "sessionId es requerido",
        success: false,
      })
    }

    const result = dataManager.toggleProjectFavorite(projectId, sessionId)

    res.json({
      ...result,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al procesar favorito",
      success: false,
    })
  }
})

router.get("/favorites/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params
    const favorites = dataManager.getUserFavorites(sessionId)

    res.json({
      sessionId,
      favorites,
      total: favorites.length,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener favoritos",
      success: false,
    })
  }
})

// Comments system
router.post("/projects/:projectId/comments", (req, res) => {
  try {
    const { projectId } = req.params
    const { sessionId, author, email, content } = req.body

    if (!sessionId || !content) {
      return res.status(400).json({
        error: "sessionId y content son requeridos",
        success: false,
      })
    }

    if (content.length < 5 || content.length > 500) {
      return res.status(400).json({
        error: "El comentario debe tener entre 5 y 500 caracteres",
        success: false,
      })
    }

    const commentData = {
      author,
      email,
      content,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    }

    const comment = dataManager.addProjectComment(projectId, sessionId, commentData)

    res.json({
      comment,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al agregar comentario",
      success: false,
    })
  }
})

router.get("/projects/:projectId/comments", (req, res) => {
  try {
    const { projectId } = req.params
    const { status = "approved" } = req.query

    const comments = dataManager.getProjectComments(projectId, status)

    res.json({
      projectId: Number.parseInt(projectId),
      comments,
      total: comments.length,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener comentarios",
      success: false,
    })
  }
})

// Rating system
router.post("/projects/:projectId/rating", (req, res) => {
  try {
    const { projectId } = req.params
    const { sessionId, rating, review } = req.body

    if (!sessionId || !rating) {
      return res.status(400).json({
        error: "sessionId y rating son requeridos",
        success: false,
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating debe estar entre 1 y 5",
        success: false,
      })
    }

    const ratingStats = dataManager.rateProject(projectId, sessionId, rating, review)

    res.json({
      projectId: Number.parseInt(projectId),
      ratingStats,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al agregar rating",
      success: false,
    })
  }
})

router.get("/projects/:projectId/rating", (req, res) => {
  try {
    const { projectId } = req.params
    const ratingStats = dataManager.getProjectRating(projectId)

    res.json({
      projectId: Number.parseInt(projectId),
      ...ratingStats,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener rating",
      success: false,
    })
  }
})

// Share tracking
router.post("/projects/:projectId/share", (req, res) => {
  try {
    const { projectId } = req.params
    const { sessionId, platform = "unknown" } = req.body

    if (!sessionId) {
      return res.status(400).json({
        error: "sessionId es requerido",
        success: false,
      })
    }

    const result = dataManager.trackProjectShare(projectId, sessionId, platform)

    res.json({
      ...result,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al registrar compartir",
      success: false,
    })
  }
})

// Project engagement
router.get("/projects/:projectId/engagement", (req, res) => {
  try {
    const { projectId } = req.params
    const { sessionId } = req.query

    const project = dataManager.getProjectWithEngagement(projectId)

    if (!project) {
      return res.status(404).json({
        error: "Proyecto no encontrado",
        success: false,
      })
    }

    // Add user-specific data if sessionId provided
    if (sessionId) {
      project.userInteractions = {
        hasLiked: dataManager.hasUserLiked(projectId, sessionId),
        isFavorited: dataManager.isProjectFavorited(projectId, sessionId),
      }
    }

    res.json({
      project,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener engagement del proyecto",
      success: false,
    })
  }
})

// Top projects by engagement
router.get("/top-projects", (req, res) => {
  try {
    const { limit = 10 } = req.query
    const topProjects = dataManager.getTopProjects(Number.parseInt(limit))

    res.json({
      projects: topProjects,
      total: topProjects.length,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener top projects",
      success: false,
    })
  }
})

// Engagement analytics
router.get("/analytics/engagement", (req, res) => {
  try {
    const analytics = dataManager.getAnalytics()

    res.json({
      ...analytics,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener analytics de engagement",
      success: false,
    })
  }
})

export default router
