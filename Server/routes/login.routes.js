import { Router } from "express"; // Importa Router
import pool from "../database.js"; // Conexión a la base de datos
import bcrypt from "bcrypt"; // Encriptar contraseñas
import jwt from "jsonwebtoken"; // Importa jsonwebtoken

const router = Router();

const SECRET_KEY = "TuClaveSecretaSuperSegura"; // Asegúrate de definir tu clave secreta

router.post("/login", async (req, res) => {
  const { Usuario, Contraseña } = req.body;

  // Validar entrada
  if (!Usuario || !Contraseña) {
    return res
      .status(400)
      .json({ error: "Usuario y Contraseña son requeridos." });
  }

  try {
    // Buscar al usuario en la base de datos
    const result = await pool
      .request()
      .input("Usuario", Usuario)
      .query("SELECT * FROM Usuarios WHERE Usuario = @Usuario");

    // Si no encuentra al usuario
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const usuario = result.recordset[0];

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(Contraseña, usuario.Contraseña);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    // Generar un token JWT
    const token = jwt.sign(
      {
        id: usuario.Id,
        Usuario: usuario.Usuario,
        EsAdministrador: usuario.EsAdministrador,
      },
      SECRET_KEY,
      { expiresIn: "1h" } // El token expira en 1 hora
    );

    // Responder con el token
    res.json({ message: "Login exitoso.", token });
  } catch (err) {
    console.error("Error al realizar login:", err);
    res.status(500).send("Error al realizar login.");
  }
});

router.post("/crearUsuario", async (req, res) => {
  const { Usuario, Contraseña } = req.body;

  // Validar entrada
  if (!Usuario || !Contraseña) {
    return res
      .status(400)
      .json({ error: "Usuario y Contraseña son requeridos." });
  }

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(Contraseña, 10);

    // Insertar en la base de datos
    const result = await pool
      .request()
      .input("Usuario", Usuario)
      .input("Contraseña", hashedPassword).query(`
        INSERT INTO Usuarios (Usuario, Contraseña, FechaCreacion, EsAdministrador, Aprobado)
        VALUES (@Usuario, @Contraseña, GETDATE(), 0, 1)
      `);

    res.status(201).json({ message: "Usuario creado exitosamente." });
  } catch (err) {
    console.error("Error al crear usuario:", err);
    res.status(500).send("Error al crear el usuario.");
  }
});

export default router;
