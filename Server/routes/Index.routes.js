import { request, Router } from "express"; // Importa el Router de Express
import pool from "../database.js"; // Importa el pool de conexiones a la base de datos
const router = Router(); // Crea una nueva instancia de Router

//endPoint listaClientes
router.get("/listaClientesVista", async (req, res) => {
  const limit = parseInt(req.query.limit) || 14; // Límite predeterminado
  const offset = parseInt(req.query.offset) || 0; // Desplazamiento predeterminado

  try {
    // Consulta con paginación
    const result = await pool.request().query(`
      SELECT 
        c.Nombre AS NombreCliente,
        pd.IdPedido,
        pd.FechaPedido,
        pd.TotalPedido,
        pd.Abono,
        pd.Observaciones,
        pd.Pagado,
        STRING_AGG(tp.Nombre, ', ') AS NombresPan,  -- Concatena los nombres de pan
        SUM(dp.Cantidad) AS TotalCantidad
      FROM 
        Pedidos pd
      JOIN 
        Clientes c ON pd.IdCliente = c.IdCliente
      LEFT JOIN 
        DetallePedidos dp ON pd.IdPedido = dp.IdPedido
      LEFT JOIN 
        TiposDePanes tp ON dp.IdTipoPan = tp.IdTipoPan
      GROUP BY 
        c.Nombre, pd.IdPedido, pd.FechaPedido, pd.TotalPedido, pd.Abono, pd.Observaciones, pd.Pagado
      ORDER BY 
        pd.FechaPedido ASC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `);

    // Consulta para calcular el total de registros (sin OFFSET ni LIMIT)
    const totalResult = await pool.request().query(`
      SELECT COUNT(*) AS Total
      FROM Pedidos pd
      JOIN Clientes c ON pd.IdCliente = c.IdCliente
      LEFT JOIN DetallePedidos dp ON pd.IdPedido = dp.IdPedido
      LEFT JOIN TiposDePanes tp ON dp.IdTipoPan = tp.IdTipoPan;
    `);

    const total = totalResult.recordset[0].Total;

    // Respuesta con datos y paginación
    res.json({
      data: result.recordset,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (err) {
    console.log("Error al obtener la lista de Clientes", err);
    res.status(500).send("Sin respuesta");
  }
});

router.get("/listaProduccion", async (req, res) => {
  const limit = parseInt(req.query.limit) || 14; // Límite predeterminado
  const offset = parseInt(req.query.offset) || 0; // Desplazamiento predeterminado

  try {
    // Consulta con paginación
    const result = await pool.request().query(`
      SELECT 
        tp.Nombre AS NombrePan, 
        p.Cantidad,
        p.Fecha,
        p.PanFaltante,
        p.PanSobrante,
        p.IdProduccion
      FROM 
        ProduccionDiaria p
      JOIN 
        TiposDePanes tp ON p.IdTipoPan = tp.IdTipoPan
      ORDER BY 
        p.Fecha ASC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `);

    // Consulta para calcular el total de registros (sin OFFSET ni LIMIT)
    const totalResult = await pool.request().query(`
      SELECT COUNT(*) AS Total
      FROM ProduccionDiaria p
      JOIN TiposDePanes tp ON p.IdTipoPan = tp.IdTipoPan;
    `);

    const total = totalResult.recordset[0].Total;

    // Respuesta con datos y paginación
    res.json({
      data: result.recordset,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (err) {
    console.log("Error al obtener la lista de Producción", err);
    res.status(500).send("Sin respuesta");
  }
});

export default router;
