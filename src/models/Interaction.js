export class Interaction {
  constructor() {
    this.interactions = {
      likes: new Map(), // projectId -> Set of sessionIds
      views: new Map(), // projectId -> count
      favorites: new Map(), // sessionId -> Set of projectIds
      comments: [], // Array of comment objects
      ratings: new Map(), // projectId -> Array of ratings
      shares: new Map(), // projectId -> count
      bookmarks: new Map(), // sessionId -> Set of projectIds
    }

    this.sessions = new Map() // sessionId -> session data
    this.engagementMetrics = {
      totalInteractions: 0,
      uniqueVisitors: 0,
      averageTimeOnSite: 0,
      bounceRate: 0,
      mostPopularProjects: [],
      lastUpdated: new Date().toISOString(),
    }
  }

  // Session management
  createSession(sessionData = {}) {
    const sessionId = this.generateSessionId()
    const session = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      userAgent: sessionData.userAgent || "unknown",
      ip: sessionData.ip || "unknown",
      country: sessionData.country || "unknown",
      referrer: sessionData.referrer || "direct",
      interactions: 0,
      timeSpent: 0,
      pagesViewed: [],
    }

    this.sessions.set(sessionId, session)
    this.engagementMetrics.uniqueVisitors++
    return session
  }

  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId)
    if (session) {
      Object.assign(session, updates, { lastActivity: new Date().toISOString() })
      this.sessions.set(sessionId, session)
    }
    return session
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Like system
  toggleLike(projectId, sessionId) {
    if (!this.interactions.likes.has(projectId)) {
      this.interactions.likes.set(projectId, new Set())
    }

    const projectLikes = this.interactions.likes.get(projectId)
    const wasLiked = projectLikes.has(sessionId)

    if (wasLiked) {
      projectLikes.delete(sessionId)
    } else {
      projectLikes.add(sessionId)
    }

    this.trackInteraction(sessionId, "like", projectId)
    this.updateEngagementMetrics()

    return {
      liked: !wasLiked,
      totalLikes: projectLikes.size,
      projectId: Number.parseInt(projectId),
    }
  }

  getLikes(projectId) {
    const likes = this.interactions.likes.get(projectId)
    return likes ? likes.size : 0
  }

  hasLiked(projectId, sessionId) {
    const likes = this.interactions.likes.get(projectId)
    return likes ? likes.has(sessionId) : false
  }

  // View tracking
  trackView(projectId, sessionId, duration = 0) {
    const currentViews = this.interactions.views.get(projectId) || 0
    this.interactions.views.set(projectId, currentViews + 1)

    this.trackInteraction(sessionId, "view", projectId, { duration })
    this.updateEngagementMetrics()

    return {
      projectId: Number.parseInt(projectId),
      totalViews: currentViews + 1,
      duration,
    }
  }

  getViews(projectId) {
    return this.interactions.views.get(projectId) || 0
  }

  // Favorites system
  toggleFavorite(projectId, sessionId) {
    if (!this.interactions.favorites.has(sessionId)) {
      this.interactions.favorites.set(sessionId, new Set())
    }

    const userFavorites = this.interactions.favorites.get(sessionId)
    const wasFavorited = userFavorites.has(projectId)

    if (wasFavorited) {
      userFavorites.delete(projectId)
    } else {
      userFavorites.add(projectId)
    }

    this.trackInteraction(sessionId, "favorite", projectId)

    return {
      favorited: !wasFavorited,
      projectId: Number.parseInt(projectId),
    }
  }

  getFavorites(sessionId) {
    const favorites = this.interactions.favorites.get(sessionId)
    return favorites ? Array.from(favorites).map((id) => Number.parseInt(id)) : []
  }

  isFavorited(projectId, sessionId) {
    const favorites = this.interactions.favorites.get(sessionId)
    return favorites ? favorites.has(projectId) : false
  }

  // Comments system
  addComment(projectId, sessionId, commentData) {
    const comment = {
      id: this.generateCommentId(),
      projectId: Number.parseInt(projectId),
      sessionId,
      author: commentData.author || "Anónimo",
      email: commentData.email || null,
      content: commentData.content,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
      status: "pending", // pending, approved, rejected
      metadata: {
        userAgent: commentData.userAgent,
        ip: commentData.ip,
      },
    }

    this.interactions.comments.push(comment)
    this.trackInteraction(sessionId, "comment", projectId)

    return comment
  }

  getComments(projectId, status = "approved") {
    return this.interactions.comments
      .filter((comment) => comment.projectId === Number.parseInt(projectId) && comment.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  generateCommentId() {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  // Rating system
  addRating(projectId, sessionId, rating, review = null) {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating debe estar entre 1 y 5")
    }

    if (!this.interactions.ratings.has(projectId)) {
      this.interactions.ratings.set(projectId, [])
    }

    const projectRatings = this.interactions.ratings.get(projectId)

    // Remove existing rating from this session
    const existingIndex = projectRatings.findIndex((r) => r.sessionId === sessionId)
    if (existingIndex !== -1) {
      projectRatings.splice(existingIndex, 1)
    }

    const ratingData = {
      sessionId,
      rating,
      review,
      createdAt: new Date().toISOString(),
    }

    projectRatings.push(ratingData)
    this.trackInteraction(sessionId, "rating", projectId, { rating })

    return this.getRatingStats(projectId)
  }

  getRatingStats(projectId) {
    const ratings = this.interactions.ratings.get(projectId) || []

    if (ratings.length === 0) {
      return { average: 0, total: 0, distribution: {} }
    }

    const total = ratings.length
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
    const average = (sum / total).toFixed(1)

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratings.forEach((r) => distribution[r.rating]++)

    return {
      average: Number.parseFloat(average),
      total,
      distribution,
      reviews: ratings.filter((r) => r.review).length,
    }
  }

  // Share tracking
  trackShare(projectId, sessionId, platform = "unknown") {
    const currentShares = this.interactions.shares.get(projectId) || 0
    this.interactions.shares.set(projectId, currentShares + 1)

    this.trackInteraction(sessionId, "share", projectId, { platform })

    return {
      projectId: Number.parseInt(projectId),
      totalShares: currentShares + 1,
      platform,
    }
  }

  getShares(projectId) {
    return this.interactions.shares.get(projectId) || 0
  }

  // General interaction tracking
  trackInteraction(sessionId, type, projectId, metadata = {}) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.interactions++
      session.lastActivity = new Date().toISOString()
      this.sessions.set(sessionId, session)
    }

    this.engagementMetrics.totalInteractions++

    // Log interaction for analytics
    console.log(`[INTERACTION] ${type} on project ${projectId} by session ${sessionId}`, metadata)
  }

  // Analytics and insights
  updateEngagementMetrics() {
    const projects = Array.from(this.interactions.views.keys())

    this.engagementMetrics.mostPopularProjects = projects
      .map((projectId) => ({
        projectId: Number.parseInt(projectId),
        views: this.getViews(projectId),
        likes: this.getLikes(projectId),
        shares: this.getShares(projectId),
        score: this.calculatePopularityScore(projectId),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    this.engagementMetrics.lastUpdated = new Date().toISOString()
  }

  calculatePopularityScore(projectId) {
    const views = this.getViews(projectId)
    const likes = this.getLikes(projectId)
    const shares = this.getShares(projectId)
    const ratings = this.getRatingStats(projectId)

    // Weighted scoring algorithm
    return views * 1 + likes * 3 + shares * 5 + ratings.average * ratings.total * 2
  }

  getProjectEngagement(projectId) {
    return {
      projectId: Number.parseInt(projectId),
      views: this.getViews(projectId),
      likes: this.getLikes(projectId),
      shares: this.getShares(projectId),
      comments: this.getComments(projectId).length,
      ratings: this.getRatingStats(projectId),
      popularityScore: this.calculatePopularityScore(projectId),
    }
  }

  getTopProjects(limit = 10) {
    this.updateEngagementMetrics()
    return this.engagementMetrics.mostPopularProjects.slice(0, limit)
  }

  getEngagementStats() {
    return {
      ...this.engagementMetrics,
      activeSessions: this.sessions.size,
      totalSessions: this.sessions.size,
      interactionTypes: {
        views: Array.from(this.interactions.views.values()).reduce((a, b) => a + b, 0),
        likes: Array.from(this.interactions.likes.values()).reduce((a, b) => a + b.size, 0),
        favorites: Array.from(this.interactions.favorites.values()).reduce((a, b) => a + b.size, 0),
        comments: this.interactions.comments.length,
        shares: Array.from(this.interactions.shares.values()).reduce((a, b) => a + b, 0),
      },
    }
  }

  // Cleanup old sessions (call periodically)
  cleanupOldSessions(maxAge = 24 * 60 * 60 * 1000) {
    // 24 hours
    const now = Date.now()
    const sessionsToDelete = []

    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionAge = now - new Date(session.createdAt).getTime()
      if (sessionAge > maxAge) {
        sessionsToDelete.push(sessionId)
      }
    }

    sessionsToDelete.forEach((sessionId) => {
      this.sessions.delete(sessionId)
    })

    return sessionsToDelete.length
  }
}
