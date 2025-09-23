import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para que tu front pueda conectarse
app.use(cors());
app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {
  res.send("👋 Hola Mundo desde Render con Express!");
});

// Nuevo endpoint para tu front
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hola desde el backend!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
