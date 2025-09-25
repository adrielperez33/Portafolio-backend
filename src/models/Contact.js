export class Contact {
  constructor() {
    this.messages = []
    this.contactInfo = {
      email: "tu@email.com",
      phone: "+1234567890",
      location: "Tu Ciudad, País",
      timezone: "GMT-5",
      availability: {
        monday: { start: "09:00", end: "18:00", available: true },
        tuesday: { start: "09:00", end: "18:00", available: true },
        wednesday: { start: "09:00", end: "18:00", available: true },
        thursday: { start: "09:00", end: "18:00", available: true },
        friday: { start: "09:00", end: "18:00", available: true },
        saturday: { start: "10:00", end: "14:00", available: false },
        sunday: { start: "10:00", end: "14:00", available: false },
      },
      preferredContact: ["email", "linkedin"],
      responseTime: "24 horas",
      languages: ["Español", "English"],
    }
  }

  addMessage(messageData) {
    const message = {
      id: Date.now().toString(),
      ...messageData,
      timestamp: new Date().toISOString(),
      status: "new",
      priority: this.calculatePriority(messageData),
      source: "portfolio_contact_form",
    }

    this.messages.unshift(message)
    return message
  }

  calculatePriority(messageData) {
    const { subject = "", message = "", email = "" } = messageData
    let priority = "normal"

    // Palabras clave para alta prioridad
    const highPriorityKeywords = [
      "urgente",
      "urgent",
      "proyecto",
      "project",
      "trabajo",
      "job",
      "oportunidad",
      "opportunity",
    ]
    const lowPriorityKeywords = ["consulta", "question", "duda", "info"]

    const text = `${subject} ${message}`.toLowerCase()

    if (highPriorityKeywords.some((keyword) => text.includes(keyword))) {
      priority = "high"
    } else if (lowPriorityKeywords.some((keyword) => text.includes(keyword))) {
      priority = "low"
    }

    // Dominios empresariales tienen mayor prioridad
    const businessDomains = [".com", ".org", ".net", "empresa", "company"]
    if (businessDomains.some((domain) => email.includes(domain))) {
      priority = priority === "low" ? "normal" : "high"
    }

    return priority
  }

  getMessages(filters = {}) {
    let filtered = [...this.messages]

    if (filters.status) {
      filtered = filtered.filter((m) => m.status === filters.status)
    }
    if (filters.priority) {
      filtered = filtered.filter((m) => m.priority === filters.priority)
    }
    if (filters.limit) {
      filtered = filtered.slice(0, Number.parseInt(filters.limit))
    }

    return filtered
  }

  getContactInfo() {
    return this.contactInfo
  }

  getStats() {
    return {
      totalMessages: this.messages.length,
      newMessages: this.messages.filter((m) => m.status === "new").length,
      highPriority: this.messages.filter((m) => m.priority === "high").length,
      averageResponseTime: "24 horas",
      lastMessage: this.messages[0]?.timestamp || null,
      messagesThisWeek: this.messages.filter((m) => {
        const messageDate = new Date(m.timestamp)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return messageDate > weekAgo
      }).length,
    }
  }

  updateMessageStatus(messageId, status) {
    const message = this.messages.find((m) => m.id === messageId)
    if (message) {
      message.status = status
      message.updatedAt = new Date().toISOString()
      return message
    }
    return null
  }
}
