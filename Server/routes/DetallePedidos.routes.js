import { Router } from "express";
import sql from "mssql";
import pool from "../database.js"; // Asegúrate de que pool esté exportado correctamente

const router = Router();

router.get("/detallePedido/:idPedido", async (req, res) => {
  const { idPedido } = req.params;
  try {
    const poolInstance = await pool; // Obtén la instancia del pool
    const result = await poolInstance
      .request()
      .input("IdPedido", sql.Int, idPedido).query(`
        SELECT 
          dp.IdDetalle,
          tp.Nombre AS NombreTipoPan,
          dp.Cantidad,
          dp.PrecioUnitario,
          dp.Subtotal
        FROM 
          DetallePedidos dp
        JOIN 
          TiposDePanes tp ON dp.IdTipoPan = tp.IdTipoPan
        WHERE 
          dp.IdPedido = @IdPedido
      `);
    res.json(result.recordset);
  } catch (err) {
    console.log("Error al obtener detalles del pedido", err);
    res.status(500).send("Sin respuesta");
  }
});

router.post("/addDetallePedido", async (req, res) => {
  const { IdPedido, IdTipoPan, Cantidad, PrecioUnitario } = req.body;

  // Verificar que los campos requeridos estén presentes
  if (!IdPedido || !IdTipoPan || !Cantidad || !PrecioUnitario) {
    return res.status(400).send("Todos los campos son necesarios");
  }

  try {
    const result = await pool
      .request()
      .input("IdPedido", IdPedido)
      .input("IdTipoPan", IdTipoPan)
      .input("Cantidad", Cantidad)
      .input("PrecioUnitario", PrecioUnitario)
      .query(
        "INSERT INTO DetallePedidos (IdPedido, IdTipoPan, Cantidad, PrecioUnitario) VALUES (@IdPedido, @IdTipoPan, @Cantidad, @PrecioUnitario)"
      );
    res.status(201).send("DetallePedido añadido con éxito");
  } catch (err) {
    console.error("Error al añadir DetallePedido:", err);
    res.status(500).send("Error al añadir DetallePedido");
  }
});
router.delete(`/deleteDetallePedido/:id`, async (req, res) => {
  const { id } = req.params; // Extraer id correctamente
  try {
    const result = await pool
      .request()
      .input("IdDetalle", id)
      .query(`DELETE FROM DetallePedidos WHERE IdDetalle = @IdDetalle`); // Corrección de la consulta

    if (result.rowsAffected[0] > 0) {
      res.status(204).send("DetallePedido eliminado con éxito"); // Respuesta para eliminación exitosa
    } else {
      res.status(404).send("DetallePedido no encontrado"); // Si no se encontró el registro
    }
  } catch (err) {
    console.error("Error al eliminar DetallePedido:", err);
    res.status(500).send("Error al eliminar DetallePedido");
  }
});
///RndPOit Editar
router.put(`/editDetallePedido/:id`, async (req, res) => {
  const { id } = req.params;
  const { IdTipoPan, Cantidad, PrecioUnitario } = req.body;

  // Validación básica de los parámetros
  if (!IdTipoPan || !Cantidad || !PrecioUnitario) {
    return res.status(400).send("Todos los campos son requeridos");
  }

  try {
    const result = await pool
      .request()
      .input("IdDetalle", id)
      .input("IdTipoPan", IdTipoPan)
      .input("Cantidad", Cantidad)
      .input("PrecioUnitario", PrecioUnitario)
      .query(
        `UPDATE DetallePedidos SET IdTipoPan=@IdTipoPan, Cantidad=@Cantidad, PrecioUnitario=@PrecioUnitario WHERE IdDetalle = @IdDetalle`
      );

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "DetallePedido editado con éxito" }); // Enviar JSON de confirmación
    } else {
      res.status(404).json({ message: "DetallePedido no encontrado" }); // Mensaje claro si no se encontró
    }
  } catch (err) {
    console.error("Error al editar DetallePedido:", err);
    res.status(500).json({ message: "Error al editar DetallePedido" }); // Respuesta con JSON en caso de error
  }
});

export default router;
