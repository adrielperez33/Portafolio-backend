export class Project {
  constructor() {
    this.projects = [
      {
        id: 1,
        title: "E-commerce Revolucionario",
        slug: "ecommerce-revolucionario",
        description: "Plataforma de comercio electrónico con IA integrada para recomendaciones personalizadas",
        longDescription:
          "Una plataforma completa que utiliza machine learning para ofrecer experiencias de compra personalizadas, con análisis predictivo de comportamiento del usuario y optimización automática de conversiones.",
        category: "E-commerce",
        type: "Web Application",
        technologies: ["React", "Node.js", "MongoDB", "TensorFlow", "Stripe", "AWS"],
        status: "completed",
        featured: true,
        priority: 1,
        github: "https://github.com/tu-usuario/proyecto1",
        demo: "https://proyecto1.vercel.app",
        images: ["/images/project1/hero.jpg", "/images/project1/dashboard.jpg", "/images/project1/mobile.jpg"],
        video: "/videos/project1-demo.mp4",
        createdAt: "2024-01-15",
        completedAt: "2024-03-20",
        duration: "2 meses",
        teamSize: 3,
        role: "Full Stack Developer & Team Lead",
        challenges: [
          "Integración de IA para recomendaciones",
          "Optimización de performance con grandes datasets",
          "Implementación de pagos seguros",
        ],
        solutions: [
          "Algoritmo de collaborative filtering personalizado",
          "Implementación de lazy loading y caching inteligente",
          "Integración con Stripe y validaciones multi-capa",
        ],
        metrics: {
          users: 1500,
          performance: 98,
          satisfaction: 4.8,
          conversionRate: 12.5,
          loadTime: "1.2s",
          uptime: 99.9,
        },
        features: [
          "Recomendaciones con IA",
          "Carrito inteligente",
          "Pagos seguros",
          "Panel de administración",
          "Analytics en tiempo real",
          "Notificaciones push",
        ],
        tags: ["React", "AI", "E-commerce", "Full Stack", "Featured"],
      },
      {
        id: 2,
        title: "Dashboard Analytics Pro",
        slug: "dashboard-analytics-pro",
        description: "Panel de control con visualizaciones en tiempo real y predicciones avanzadas",
        longDescription:
          "Sistema completo de analytics con capacidades de visualización avanzada, procesamiento de big data en tiempo real y modelos predictivos para business intelligence.",
        category: "Analytics",
        type: "Web Application",
        technologies: ["Vue.js", "Express", "PostgreSQL", "D3.js", "Redis", "Docker"],
        status: "in-progress",
        featured: true,
        priority: 2,
        github: "https://github.com/tu-usuario/proyecto2",
        demo: null,
        images: ["/images/project2/dashboard.jpg", "/images/project2/charts.jpg"],
        video: null,
        createdAt: "2024-02-20",
        completedAt: null,
        duration: "En desarrollo",
        teamSize: 2,
        role: "Frontend Lead & Data Visualization Specialist",
        challenges: [
          "Renderizado eficiente de grandes datasets",
          "Sincronización en tiempo real",
          "UX intuitiva para datos complejos",
        ],
        solutions: [
          "Virtualización de componentes para performance",
          "WebSockets con Redis para real-time updates",
          "Diseño progresivo de información",
        ],
        metrics: {
          dataPoints: 50000,
          responseTime: "< 200ms",
          accuracy: 99.2,
          chartsRendered: 25,
          concurrentUsers: 100,
          dataProcessed: "1TB+",
        },
        features: [
          "Visualizaciones interactivas",
          "Filtros dinámicos",
          "Exportación de reportes",
          "Alertas automáticas",
          "Predicciones ML",
          "Multi-tenant",
        ],
        tags: ["Vue.js", "Analytics", "Real-time", "Big Data", "Featured"],
      },
      {
        id: 3,
        title: "API Gateway Microservicios",
        slug: "api-gateway-microservicios",
        description: "Gateway escalable para arquitectura de microservicios con autenticación avanzada",
        longDescription:
          "Solución completa de API Gateway con balanceeo de carga, rate limiting inteligente, autenticación JWT, logging distribuido y monitoreo de salud de servicios.",
        category: "Backend",
        type: "API/Microservices",
        technologies: ["Node.js", "Express", "JWT", "Redis", "Nginx", "Kubernetes"],
        status: "completed",
        featured: false,
        priority: 3,
        github: "https://github.com/tu-usuario/proyecto3",
        demo: "https://api-gateway-demo.herokuapp.com",
        images: ["/images/project3/architecture.jpg"],
        video: null,
        createdAt: "2023-11-10",
        completedAt: "2024-01-05",
        duration: "2 meses",
        teamSize: 1,
        role: "Backend Architect",
        challenges: ["Escalabilidad horizontal", "Latencia mínima", "Seguridad multi-capa"],
        solutions: [
          "Implementación de circuit breakers",
          "Caching distribuido con Redis",
          "Autenticación JWT con refresh tokens",
        ],
        metrics: {
          requestsPerSecond: 10000,
          latency: "15ms",
          uptime: 99.95,
          servicesManaged: 12,
          securityScore: 95,
          errorRate: 0.01,
        },
        features: [
          "Load balancing",
          "Rate limiting",
          "JWT Authentication",
          "Request logging",
          "Health monitoring",
          "Auto-scaling",
        ],
        tags: ["Node.js", "Microservices", "API", "Backend", "Security"],
      },
    ]
  }

  getAll(filters = {}) {
    let filtered = [...this.projects]

    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status)
    }
    if (filters.featured === "true") {
      filtered = filtered.filter((p) => p.featured)
    }
    if (filters.category) {
      filtered = filtered.filter((p) => p.category.toLowerCase() === filters.category.toLowerCase())
    }
    if (filters.tech) {
      filtered = filtered.filter((p) =>
        p.technologies.some((t) => t.toLowerCase().includes(filters.tech.toLowerCase())),
      )
    }
    if (filters.tag) {
      filtered = filtered.filter((p) => p.tags.some((t) => t.toLowerCase().includes(filters.tag.toLowerCase())))
    }

    // Ordenar por prioridad y fecha
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return filtered
  }

  getById(id) {
    return this.projects.find((p) => p.id === Number.parseInt(id))
  }

  getBySlug(slug) {
    return this.projects.find((p) => p.slug === slug)
  }

  getFeatured() {
    return this.projects.filter((p) => p.featured).sort((a, b) => a.priority - b.priority)
  }

  getCategories() {
    const categories = [...new Set(this.projects.map((p) => p.category))]
    return categories.map((cat) => ({
      name: cat,
      count: this.projects.filter((p) => p.category === cat).length,
    }))
  }

  getTechnologies() {
    const allTechs = this.projects.flatMap((p) => p.technologies)
    const techCount = {}
    allTechs.forEach((tech) => {
      techCount[tech] = (techCount[tech] || 0) + 1
    })

    return Object.entries(techCount)
      .map(([tech, count]) => ({ name: tech, count }))
      .sort((a, b) => b.count - a.count)
  }

  getStats() {
    return {
      total: this.projects.length,
      completed: this.projects.filter((p) => p.status === "completed").length,
      inProgress: this.projects.filter((p) => p.status === "in-progress").length,
      featured: this.projects.filter((p) => p.featured).length,
      categories: this.getCategories().length,
      technologies: this.getTechnologies().length,
      totalUsers: this.projects.reduce((sum, p) => sum + (p.metrics.users || 0), 0),
      averageRating: (
        this.projects.reduce((sum, p) => sum + (p.metrics.satisfaction || 0), 0) / this.projects.length
      ).toFixed(1),
    }
  }
}
