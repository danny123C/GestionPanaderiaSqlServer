import { request, Router } from "express"; // Importa el Router de Express
import pool from "../database.js"; // Importa el pool de conexiones a la base de datos
const router = Router(); // Crea una nueva instancia de Router
router.get("/listCuentas", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Límite predeterminado
  const offset = parseInt(req.query.offset) || 0; // Desplazamiento predeterminado

  try {
    // Consulta con paginación
    const result = await pool.request().query(`
      SELECT 
        c.Nombre AS NombreCliente, c.IdCliente AS IdCliente,
        p.Abono, p.Observaciones, p.Pagado,
        p.TotalPedido, p.FechaPedido, p.IdPedido
      FROM 
        Pedidos p
      JOIN 
        Clientes c ON p.IdCliente = c.IdCliente
      ORDER BY 
        p.FechaPedido ASC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `);

    // Consulta para calcular el total de registros
    const totalResult = await pool.request().query(`
      SELECT COUNT(*) AS Total
      FROM Pedidos p
      JOIN Clientes c ON p.IdCliente = c.IdCliente;
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
    console.error("Error al obtener la lista de Clientes", err);
    res.status(500).send("Error al procesar la solicitud");
  }
});

// Endpoint para actualizar Abono, Observaciones y Pagado en un pedido específico
router.put("/actualizarCuenta/:idPedido", async (req, res) => {
  const { idPedido } = req.params; // ID del pedido a actualizar
  const { Abono, Observaciones, Pagado } = req.body; // Valores a actualizar

  try {
    // Verifica si el pedido existe
    const checkPedido = await pool.request().query(`
      SELECT IdPedido FROM Pedidos WHERE IdPedido = ${idPedido}
    `);

    if (checkPedido.recordset.length === 0) {
      return res.status(404).send("Pedido no encontrado");
    }

    // Realiza la actualización en la base de datos
    await pool
      .request()
      .input("Abono", Abono)
      .input("Observaciones", Observaciones)
      .input("Pagado", Pagado).query(`
        UPDATE Pedidos
        SET Abono = @Abono, Observaciones = @Observaciones, Pagado = @Pagado
        WHERE IdPedido = ${idPedido}
      `);

    res.status(200).send("Cuenta actualizada exitosamente");
  } catch (err) {
    console.error("Error al actualizar la cuenta:", err);
    res.status(500).send("Error al procesar la solicitud");
  }
});
export default router;
