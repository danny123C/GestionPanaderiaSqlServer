import { Router } from "express"; // Importa el Router de Express
import pool from "../database.js"; // Importa el pool de conexiones a la base de datos

const router = Router(); // Crea una nueva instancia de Router

router.get("/listProduccionDiaria", async (req, res) => {
  // Obteniendo los parámetros de paginación de la consulta
  const limit = parseInt(req.query.limit) || 15; // Número de registros por página (predeterminado: 10)
  const offset = parseInt(req.query.offset) || 0; // Registro inicial (predeterminado: 0)

  try {
    // Consulta con paginación
    const result = await pool.request().query(`
      SELECT 
        pd.IdProduccion,
        tp.Nombre AS NombreDelPan,
        pd.Cantidad,
        pd.Fecha,
        pd.PanFaltante,
        pd.PanSobrante,
         pd.Observaciones
      FROM 
        ProduccionDiaria pd
      JOIN 
        TiposDePanes tp 
      ON 
        pd.IdTipoPan = tp.IdTipoPan
      ORDER BY 
        pd.Fecha DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `);

    // Consulta para obtener el total de registros
    const totalResult = await pool.request().query(`
      SELECT COUNT(*) AS Total
      FROM ProduccionDiaria pd
      JOIN TiposDePanes tp ON pd.IdTipoPan = tp.IdTipoPan;
    `);

    // Total de registros
    const total = totalResult.recordset[0].Total;

    // Respuesta con datos y detalles de paginación
    res.json({
      data: result.recordset,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (err) {
    console.error("Error al listar la producción diaria:", err);
    res.status(500).send("Error al listar la producción diaria");
  }
});

router.post("/addProduccionDiaria", async (req, res) => {
  const {
    IdTipoPan,
    Cantidad,
    Fecha,
    PanFaltante,
    PanSobrante,
    Observaciones,
  } = req.body;

  if (!IdTipoPan || !Cantidad || !Fecha) {
    return res.status(400).send("Tipo de Pan, Cantidad y Fecha son necesarios");
  }

  try {
    await pool
      .request()
      .input("IdTipoPan", IdTipoPan)
      .input("Cantidad", Cantidad)
      .input("Fecha", Fecha)
      .input("PanFaltante", PanFaltante)
      .input("PanSobrante", PanSobrante)
      .input("Observaciones", Observaciones)
      .query(
        "INSERT INTO ProduccionDiaria (IdTipoPan, Cantidad,Fecha,PanFaltante, PanSobrante,Observaciones) VALUES (@IdTipoPan, @Cantidad, @Fecha, @PanFaltante, @PanSobrante,@Observaciones)"
      );

    res.status(201).send("ProduccionDiaria añadido con éxito");
  } catch (err) {
    console.error("Error al añadir ProduccionDiaria:", err);
    res.status(500).send("Error al añadir ProduccionDiaria");
  }
});

router.delete("/deleteProduccionDiaria/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool
      .request()
      .input("IdProduccion", id)
      .query("DELETE FROM ProduccionDiaria WHERE IdProduccion = @IdProduccion");

    if (result.rowsAffected[0] > 0) {
      res.status(200).send(`Produccion con el  ${id} eliminado con éxito`);
    } else {
      res.status(404).send(`Produccion con el ${id} no encontrado`);
    }
  } catch (err) {
    console.error("Error al eliminar Produccion:", err);
    res.status(500).send("Error al eliminar Produccion");
  }
});

// Endpoint para editar un tipo de pan por ID
router.put("/editProduccionDiaria/:id", async (req, res) => {
  const { id } = req.params;
  const {
    IdTipoPan,
    Cantidad,
    Fecha,
    PanFaltante,
    PanSobrante,
    Observaciones,
  } = req.body;
  try {
    await pool
      .request()
      .input("IdProduccion", id)

      .input("Cantidad", Cantidad)
      .input("Fecha", Fecha)
      .input("PanFaltante", PanFaltante)
      .input("PanSobrante", PanSobrante)
      .input("Observaciones", Observaciones).query(`
        UPDATE ProduccionDiaria 
        SET  Cantidad = @Cantidad, Fecha = @Fecha, PanFaltante = @PanFaltante, PanSobrante = @PanSobrante, Observaciones = @Observaciones
        WHERE IdProduccion = @IdProduccion 
      `);

    res.status(200).send("Tipo de Pan editado con éxito");
  } catch (err) {
    console.error("Error al editar tipo de pan:", err);
    res.status(500).send("Error al editar tipo de pan");
  }
});
export default router;
