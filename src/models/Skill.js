export class Skill {
  constructor() {
    this.skillCategories = {
      frontend: {
        name: "Frontend Development",
        icon: "🎨",
        description: "Creación de interfaces de usuario modernas y responsivas",
        skills: [
          {
            name: "React",
            level: 90,
            experience: "2 años",
            projects: 8,
            certification: "React Developer Certification",
            lastUsed: "2024-03-15",
            trending: true,
            subSkills: ["Hooks", "Context API", "Redux", "Next.js"],
            learningPath: ["Básico", "Intermedio", "Avanzado", "Expert"],
            currentLevel: "Avanzado",
          },
          {
            name: "Vue.js",
            level: 85,
            experience: "1.5 años",
            projects: 5,
            certification: null,
            lastUsed: "2024-03-10",
            trending: true,
            subSkills: ["Composition API", "Vuex", "Nuxt.js"],
            learningPath: ["Básico", "Intermedio", "Avanzado"],
            currentLevel: "Avanzado",
          },
          {
            name: "TypeScript",
            level: 80,
            experience: "1 año",
            projects: 6,
            certification: null,
            lastUsed: "2024-03-20",
            trending: true,
            subSkills: ["Types", "Interfaces", "Generics", "Decorators"],
            learningPath: ["Básico", "Intermedio", "Avanzado"],
            currentLevel: "Intermedio",
          },
          {
            name: "Tailwind CSS",
            level: 95,
            experience: "2 años",
            projects: 12,
            certification: null,
            lastUsed: "2024-03-22",
            trending: true,
            subSkills: ["Responsive Design", "Custom Components", "Animations"],
            learningPath: ["Básico", "Intermedio", "Avanzado", "Expert"],
            currentLevel: "Expert",
          },
        ],
      },
      backend: {
        name: "Backend Development",
        icon: "⚙️",
        description: "Desarrollo de APIs robustas y arquitecturas escalables",
        skills: [
          {
            name: "Node.js",
            level: 88,
            experience: "2 años",
            projects: 10,
            certification: "Node.js Application Developer",
            lastUsed: "2024-03-22",
            trending: true,
            subSkills: ["Express", "Fastify", "Microservices", "Performance"],
            learningPath: ["Básico", "Intermedio", "Avanzado", "Expert"],
            currentLevel: "Avanzado",
          },
          {
            name: "Python",
            level: 75,
            experience: "1 año",
            projects: 4,
            certification: null,
            lastUsed: "2024-02-28",
            trending: true,
            subSkills: ["Django", "FastAPI", "Data Science", "ML"],
            learningPath: ["Básico", "Intermedio", "Avanzado"],
            currentLevel: "Intermedio",
          },
          {
            name: "MongoDB",
            level: 75,
            experience: "1 año",
            projects: 6,
            certification: null,
            lastUsed: "2024-03-18",
            trending: false,
            subSkills: ["Aggregation", "Indexing", "Replication"],
            learningPath: ["Básico", "Intermedio", "Avanzado"],
            currentLevel: "Intermedio",
          },
          {
            name: "PostgreSQL",
            level: 70,
            experience: "8 meses",
            projects: 3,
            certification: null,
            lastUsed: "2024-03-15",
            trending: true,
            subSkills: ["Complex Queries", "Performance Tuning", "Migrations"],
            learningPath: ["Básico", "Intermedio", "Avanzado"],
            currentLevel: "Intermedio",
          },
        ],
      },
      tools: {
        name: "Herramientas & DevOps",
        icon: "🛠️",
        description: "Herramientas de desarrollo y operaciones para flujos eficientes",
        skills: [
          {
            name: "Git",
            level: 90,
            experience: "3 años",
            projects: 25,
            certification: null,
            lastUsed: "2024-03-22",
            trending: false,
            subSkills: ["Branching", "Merging", "Rebasing", "Workflows"],
            learningPath: ["Básico", "Intermedio", "Avanzado", "Expert"],
            currentLevel: "Avanzado",
          },
          {
            name: "Docker",
            level: 65,
            experience: "6 meses",
            projects: 4,
            certification: null,
            lastUsed: "2024-03-10",
            trending: true,
            subSkills: ["Containers", "Compose", "Networking"],
            learningPath: ["Básico", "Intermedio", "Avanzado"],
            currentLevel: "Básico",
          },
          {
            name: "AWS",
            level: 60,
            experience: "4 meses",
            projects: 2,
            certification: "AWS Cloud Practitioner",
            lastUsed: "2024-02-20",
            trending: true,
            subSkills: ["EC2", "S3", "Lambda", "RDS"],
            learningPath: ["Básico", "Intermedio", "Avanzado"],
            currentLevel: "Básico",
          },
          {
            name: "Vercel",
            level: 95,
            experience: "2 años",
            projects: 15,
            certification: null,
            lastUsed: "2024-03-22",
            trending: true,
            subSkills: ["Deployment", "Serverless", "Edge Functions"],
            learningPath: ["Básico", "Intermedio", "Avanzado", "Expert"],
            currentLevel: "Expert",
          },
        ],
      },
      emerging: {
        name: "Tecnologías Emergentes",
        icon: "🚀",
        description: "Explorando el futuro del desarrollo de software",
        skills: [
          {
            name: "Rust",
            level: 25,
            experience: "2 meses",
            projects: 1,
            certification: null,
            lastUsed: "2024-03-20",
            trending: true,
            subSkills: ["Memory Safety", "Performance", "WebAssembly"],
            learningPath: ["Básico", "Intermedio", "Avanzado"],
            currentLevel: "Básico",
          },
          {
            name: "WebAssembly",
            level: 30,
            experience: "1 mes",
            projects: 1,
            certification: null,
            lastUsed: "2024-03-15",
            trending: true,
            subSkills: ["Performance", "Cross-platform", "Integration"],
            learningPath: ["Básico", "Intermedio", "Avanzado"],
            currentLevel: "Básico",
          },
        ],
      },
    }
  }

  getAll() {
    return this.skillCategories
  }

  getByCategory(category) {
    return this.skillCategories[category] || null
  }

  getSkillByName(skillName) {
    for (const category of Object.values(this.skillCategories)) {
      const skill = category.skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase())
      if (skill) return skill
    }
    return null
  }

  getTrendingSkills() {
    const allSkills = Object.values(this.skillCategories).flatMap((cat) => cat.skills.filter((skill) => skill.trending))
    return allSkills.sort((a, b) => b.level - a.level)
  }

  getTopSkills(limit = 10) {
    const allSkills = Object.values(this.skillCategories).flatMap((cat) => cat.skills)
    return allSkills.sort((a, b) => b.level - a.level).slice(0, limit)
  }

  getLearningProgress() {
    const learning = [
      { name: "Next.js 14", progress: 60, category: "Frontend", estimatedCompletion: "2024-04-15" },
      { name: "Rust", progress: 25, category: "Emerging", estimatedCompletion: "2024-06-01" },
      { name: "GraphQL", progress: 40, category: "Backend", estimatedCompletion: "2024-05-01" },
      { name: "Kubernetes", progress: 15, category: "DevOps", estimatedCompletion: "2024-07-01" },
    ]
    return learning
  }

  getStats() {
    const allSkills = Object.values(this.skillCategories).flatMap((cat) => cat.skills)
    const totalProjects = allSkills.reduce((sum, skill) => sum + skill.projects, 0)
    const averageLevel = allSkills.reduce((sum, skill) => sum + skill.level, 0) / allSkills.length

    return {
      totalSkills: allSkills.length,
      categories: Object.keys(this.skillCategories).length,
      averageLevel: Math.round(averageLevel),
      totalProjects,
      certifications: allSkills.filter((skill) => skill.certification).length,
      trendingSkills: allSkills.filter((skill) => skill.trending).length,
      expertLevel: allSkills.filter((skill) => skill.level >= 90).length,
      learning: this.getLearningProgress().length,
    }
  }
}
