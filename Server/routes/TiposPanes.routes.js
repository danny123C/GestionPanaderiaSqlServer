import { Router } from "express"; // Importa el Router de Express
import pool from "../database.js"; // Importa el pool de conexiones a la base de datos

const router = Router(); // Crea una nueva instancia de Router

router.get("/listTiposPanes", async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM TiposDePanes");
    res.json(result.recordset); // Envía el resultado al cliente como JSON
  } catch (err) {
    console.error("Error al listar tipos de panes:", err);
    res.status(500).send("Error al listar tipos de panes");
  }
});

router.post("/addTipoPan", async (req, res) => {
  const { Nombre, Descripcion } = req.body;

  if (!Nombre || !Descripcion) {
    return res.status(400).send("Nombre y Descripción son necesarios");
  }

  try {
    await pool
      .request()
      .input("Nombre", Nombre)
      .input("Descripcion", Descripcion)
      .query(
        "INSERT INTO TiposDePanes (Nombre, Descripcion) VALUES (@Nombre, @Descripcion)"
      );

    res.status(201).send("Tipo de Pan añadido con éxito");
  } catch (err) {
    console.error("Error al añadir tipo de pan:", err);
    res.status(500).send("Error al añadir tipo de pan");
  }
});
router.delete("/deleteTipoPan/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool
      .request()
      .input("IdTipoPan", id)
      .query("DELETE FROM TiposDePanes WHERE IdTipoPan = @IdTipoPan");

    if (result.rowsAffected[0] > 0) {
      res.status(200).send(`Tipo de Pan con ID ${id} eliminado con éxito`);
    } else {
      res.status(404).send(`Tipo de Pan con ID ${id} no encontrado`);
    }
  } catch (err) {
    console.error("Error al eliminar tipo de pan:", err);
    res.status(500).send("Error al eliminar tipo de pan");
  }
});

// Endpoint para editar un tipo de pan por ID
router.put("/editTipoPan/:id", async (req, res) => {
  const { id } = req.params;
  const { Nombre, Descripcion } = req.body;

  try {
    await pool
      .request()
      .input("IdTipoPan", id)
      .input("Nombre", Nombre)
      .input("Descripcion", Descripcion).query(`
        UPDATE TiposDePanes 
        SET Nombre = @Nombre, Descripcion = @Descripcion 
        WHERE IdTipoPan = @IdTipoPan
      `);

    res.status(200).send("Tipo de Pan editado con éxito");
  } catch (err) {
    console.error("Error al editar tipo de pan:", err);
    res.status(500).send("Error al editar tipo de pan");
  }
});
export default router;
