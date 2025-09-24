import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS (primero ponelo abierto para probar)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {
  res.send("👋 Hola Mundo desde Render con Express!");
});

// Endpoint para el frontend
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hola desde el backend!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
