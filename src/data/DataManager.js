import { Portfolio } from "../models/Portfolio.js"
import { Project } from "../models/Project.js"
import { Skill } from "../models/Skill.js"
import { Contact } from "../models/Contact.js"
import { Interaction } from "../models/Interaction.js"
import { Analytics } from "../models/Analytics.js"

class DataManager {
  constructor() {
    if (DataManager.instance) {
      return DataManager.instance
    }

    this.portfolio = new Portfolio()
    this.projects = new Project()
    this.skills = new Skill()
    this.contacts = new Contact()
    this.interactions = new Interaction()
    this.analytics = new Analytics()

    // Estadísticas globales
    this.globalAnalytics = {
      visitors: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        total: 0,
      },
      pageViews: {},
      popularProjects: [],
      lastUpdated: new Date().toISOString(),
    }

    DataManager.instance = this
  }

  // Portfolio methods
  getPortfolio() {
    return this.portfolio.get()
  }

  updatePortfolio(updates) {
    return this.portfolio.update(updates)
  }

  // Project methods
  getAllProjects(filters) {
    return this.projects.getAll(filters)
  }

  getProjectById(id) {
    return this.projects.getById(id)
  }

  getProjectBySlug(slug) {
    return this.projects.getBySlug(slug)
  }

  getFeaturedProjects() {
    return this.projects.getFeatured()
  }

  getProjectStats() {
    return this.projects.getStats()
  }

  // Skill methods
  getAllSkills() {
    return this.skills.getAll()
  }

  getSkillsByCategory(category) {
    return this.skills.getByCategory(category)
  }

  getTrendingSkills() {
    return this.skills.getTrendingSkills()
  }

  getSkillStats() {
    return this.skills.getStats()
  }

  // Contact methods
  addContactMessage(messageData) {
    return this.contacts.addMessage(messageData)
  }

  getContactMessages(filters) {
    return this.contacts.getMessages(filters)
  }

  getContactInfo() {
    return this.contacts.getContactInfo()
  }

  getContactStats() {
    return this.contacts.getStats()
  }

  // Analytics methods
  trackVisitor() {
    this.globalAnalytics.visitors.today++
    this.globalAnalytics.visitors.thisWeek++
    this.globalAnalytics.visitors.thisMonth++
    this.globalAnalytics.visitors.total++
    this.globalAnalytics.lastUpdated = new Date().toISOString()

    // Track in advanced analytics
    this.analytics.trackVisitor({
      sessionId: `visitor_${Date.now()}`,
      timestamp: new Date().toISOString(),
    })
  }

  trackPageView(page) {
    this.globalAnalytics.pageViews[page] = (this.globalAnalytics.pageViews[page] || 0) + 1

    // Track in advanced analytics
    this.analytics.trackPageView(page, `session_${Date.now()}`)
  }

  getAnalytics() {
    const baseAnalytics = {
      visitors: this.globalAnalytics.visitors,
      pageViews: this.globalAnalytics.pageViews,
      projects: this.getProjectStats(),
      skills: this.getSkillStats(),
      contacts: this.getContactStats(),
      lastUpdated: this.globalAnalytics.lastUpdated,
    }

    const engagementStats = this.interactions.getEngagementStats()
    const advancedAnalytics = this.analytics.getMetrics()
    const insights = this.analytics.getInsights()

    return {
      ...baseAnalytics,
      engagement: engagementStats,
      topProjects: this.getTopProjects(5),
      advanced: advancedAnalytics,
      insights: insights,
    }
  }

  // Interaction methods
  // Session management
  createSession(sessionData) {
    return this.interactions.createSession(sessionData)
  }

  updateSession(sessionId, updates) {
    return this.interactions.updateSession(sessionId, updates)
  }

  // Like system
  toggleProjectLike(projectId, sessionId) {
    return this.interactions.toggleLike(projectId, sessionId)
  }

  getProjectLikes(projectId) {
    return this.interactions.getLikes(projectId)
  }

  hasUserLiked(projectId, sessionId) {
    return this.interactions.hasLiked(projectId, sessionId)
  }

  // View tracking
  trackProjectView(projectId, sessionId, duration) {
    return this.interactions.trackView(projectId, sessionId, duration)
  }

  getProjectViews(projectId) {
    return this.interactions.getViews(projectId)
  }

  // Favorites
  toggleProjectFavorite(projectId, sessionId) {
    return this.interactions.toggleFavorite(projectId, sessionId)
  }

  getUserFavorites(sessionId) {
    return this.interactions.getFavorites(sessionId)
  }

  isProjectFavorited(projectId, sessionId) {
    return this.interactions.isFavorited(projectId, sessionId)
  }

  // Comments
  addProjectComment(projectId, sessionId, commentData) {
    return this.interactions.addComment(projectId, sessionId, commentData)
  }

  getProjectComments(projectId, status) {
    return this.interactions.getComments(projectId, status)
  }

  // Ratings
  rateProject(projectId, sessionId, rating, review) {
    return this.interactions.addRating(projectId, sessionId, rating, review)
  }

  getProjectRating(projectId) {
    return this.interactions.getRatingStats(projectId)
  }

  // Shares
  trackProjectShare(projectId, sessionId, platform) {
    return this.interactions.trackShare(projectId, sessionId, platform)
  }

  getProjectShares(projectId) {
    return this.interactions.getShares(projectId)
  }

  // Enhanced project data with interactions
  getProjectWithEngagement(projectId) {
    const project = this.getProjectById(projectId)
    if (!project) return null

    const engagement = this.interactions.getProjectEngagement(projectId)
    return {
      ...project,
      engagement,
    }
  }

  getAllProjectsWithEngagement(filters = {}) {
    const projects = this.getAllProjects(filters)
    return projects.map((project) => ({
      ...project,
      engagement: this.interactions.getProjectEngagement(project.id),
    }))
  }

  // Top projects by engagement
  getTopProjects(limit = 10) {
    return this.interactions.getTopProjects(limit)
  }

  // Enhanced dashboard with interactions
  getDashboard() {
    return {
      portfolio: this.getPortfolio(),
      featuredProjects: this.getFeaturedProjects().map((project) => ({
        ...project,
        engagement: this.interactions.getProjectEngagement(project.id),
      })),
      topProjects: this.getTopProjects(3),
      trendingSkills: this.getTrendingSkills(),
      recentMessages: this.getContactMessages({ limit: 5 }),
      analytics: this.getAnalytics(),
      engagement: this.interactions.getEngagementStats(),
    }
  }

  // Cleanup method
  cleanupOldData() {
    const cleanedSessions = this.interactions.cleanupOldSessions()
    console.log(`Cleaned up ${cleanedSessions} old sessions`)
    return { cleanedSessions }
  }
}

// Exportar instancia singleton
export { DataManager }
export default new DataManager()
