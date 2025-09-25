export const validateProjectFilters = (req, res, next) => {
  const { status, category, tech, limit } = req.query

  if (status && !["completed", "in-progress", "planned"].includes(status)) {
    return res.status(400).json({
      error: "Status debe ser: completed, in-progress, o planned",
      success: false,
    })
  }

  if (limit && (isNaN(limit) || Number.parseInt(limit) < 1 || Number.parseInt(limit) > 100)) {
    return res.status(400).json({
      error: "Limit debe ser un número entre 1 y 100",
      success: false,
    })
  }

  next()
}

export const validateContactData = (req, res, next) => {
  const { name, email, message } = req.body
  const errors = []

  if (!name || name.trim().length < 2) {
    errors.push("Nombre debe tener al menos 2 caracteres")
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email inválido")
  }

  if (!message || message.trim().length < 10) {
    errors.push("Mensaje debe tener al menos 10 caracteres")
  }

  if (message && message.length > 1000) {
    errors.push("Mensaje no puede exceder 1000 caracteres")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: errors,
      success: false,
    })
  }

  next()
}

export const validateSearchQuery = (req, res, next) => {
  const { q, type, limit } = req.query

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      error: "Query debe tener al menos 2 caracteres",
      success: false,
    })
  }

  if (type && !["projects", "skills"].includes(type)) {
    return res.status(400).json({
      error: "Type debe ser: projects o skills",
      success: false,
    })
  }

  if (limit && (isNaN(limit) || Number.parseInt(limit) < 1 || Number.parseInt(limit) > 50)) {
    return res.status(400).json({
      error: "Limit debe ser un número entre 1 y 50",
      success: false,
    })
  }

  next()
}
