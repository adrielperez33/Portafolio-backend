export class Portfolio {
  constructor() {
    this.data = {
      id: "portfolio_main",
      personal: {
        name: "Tu Nombre",
        title: "Desarrollador Full Stack",
        bio: "Apasionado por crear experiencias digitales únicas y disruptivas",
        location: "Tu Ciudad, País",
        email: "tu@email.com",
        phone: "+1234567890",
        website: "https://tu-portafolio.vercel.app",
        avatar: "/images/avatar.jpg",
        resume: "/files/resume.pdf",
      },
      social: {
        github: "https://github.com/tu-usuario",
        linkedin: "https://linkedin.com/in/tu-perfil",
        twitter: "https://twitter.com/tu-usuario",
        instagram: "https://instagram.com/tu-usuario",
        youtube: "https://youtube.com/@tu-canal",
      },
      stats: {
        projectsCompleted: 25,
        yearsExperience: 3,
        technologiesMastered: 15,
        clientsSatisfied: 18,
        coffeeConsumed: "∞",
        linesOfCode: 50000,
      },
      currentStatus: {
        available: true,
        status: "Disponible para proyectos",
        workingOn: "Sistema de gestión empresarial",
        nextGoal: "Dominar Rust y WebAssembly",
        timezone: "GMT-5",
      },
      preferences: {
        workType: ["Remote", "Hybrid"],
        projectTypes: ["Web Apps", "Mobile Apps", "APIs", "E-commerce"],
        industries: ["Tech", "Fintech", "Healthcare", "Education"],
      },
      lastUpdated: new Date().toISOString(),
    }
  }

  get() {
    return this.data
  }

  update(updates) {
    this.data = { ...this.data, ...updates, lastUpdated: new Date().toISOString() }
    return this.data
  }

  getStats() {
    return this.data.stats
  }

  updateStatus(status) {
    this.data.currentStatus = { ...this.data.currentStatus, ...status }
    this.data.lastUpdated = new Date().toISOString()
    return this.data.currentStatus
  }
}
