import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS solo para tus dominios de Vercel
app.use(cors({
  origin: [
    "https://portafolio-frontend-pearl.vercel.app",
    "https://portafolio-frontend-git-main-adrielperez227-gmailcoms-projects.vercel.app"
  ],
  methods: ["GET", "POST"],
}));

app.use(express.json());

// Ruta raíz (texto plano)
app.get("/", (req, res) => {
  res.send("👋 Hola Mundo desde Render con Express!");
});

// Endpoint para consumir desde React (JSON)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hola desde el backend!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
