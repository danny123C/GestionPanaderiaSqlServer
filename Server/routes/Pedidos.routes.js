import { request, Router } from "express"; // Importa el Router de Express
import pool from "../database.js"; // Importa el pool de conexiones a la base de datos
const router = Router(); // Crea una nueva instancia de Router
//endPoint listaClientes
router.get("/listPedidos", async (req, res) => {
  // Obteniendo los parámetros de paginación de la consulta
  const limit = parseInt(req.query.limit) || 10; // Número de registros por página (predeterminado: 10)
  const offset = parseInt(req.query.offset) || 0; // Registro inicial (predeterminado: 0)

  try {
    // Consulta para obtener los registros con paginación
    const result = await pool.request().query(`
      SELECT 
        c.Nombre AS NombreCliente, 
        ct.*
      FROM 
        Pedidos ct 
      JOIN 
        Clientes c ON ct.IdCliente = c.IdCliente
      ORDER BY 
        ct.FechaPedido DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `);

    // Consulta para obtener el total de registros sin paginación
    const totalResult = await pool.request().query(`
      SELECT COUNT(*) AS Total
      FROM Pedidos ct
      JOIN Clientes c ON ct.IdCliente = c.IdCliente;
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
    console.error("Error al obtener la lista de PEDIDOS:", err);
    res.status(500).send("Error al obtener la lista de pedidos");
  }
});

//endPoint Agregar PEDIDO
router.post("/addPedido", async (req, res) => {
  const { IdCliente, FechaPedido } = req.body;

  // Verificar que los campos requeridos estén presentes
  if (!IdCliente || !FechaPedido) {
    return res.status(400).send("Todos los campos son necesarios");
  }

  try {
    const result = await pool
      .request()
      .input("IdCliente", IdCliente)
      .input("FechaPedido", FechaPedido)
      .query(
        "INSERT INTO Pedidos (IdCliente, FechaPedido) VALUES (@IdCliente, @FechaPedido)"
      );
    res.status(201).send("Pedido añadido con éxito");
  } catch (err) {
    console.error("Error al añadir pedido:", err);
    res.status(500).send("Error al añadir pedido");
  }
});
///EndPOint Eliminar pediod
router.delete("/deletePedido/:id", async (req, res) => {
  const { id } = req.params;
  console.log("erroro de eliminacion IDDD", id);
  // Validar que el ID es un número
  if (isNaN(id)) {
    return res.status(400).send("El ID proporcionado no es válido");
  }

  try {
    const result = await pool
      .request()
      .input("IdPedido", id)
      .query("DELETE FROM Pedidos WHERE IdPedido = @IdPedido");

    if (result.rowsAffected[0] > 0) {
      res.status(200).send(`El PEDIDO ${id} fue eliminado con éxito`);
    } else {
      res.status(404).send(`PEDIDO con el ID ${id} no encontrado`);
    }
  } catch (err) {
    console.error("Error al eliminar PEDIDO:", err);
    res.status(500).send("Error al eliminar PEDIDO");
  }
});

router.put("/editPedido/:id", async (req, res) => {
  const { id } = req.params;
  const { IdCliente, FechaPedido } = req.body;
  let { fechaPedido } = req.body;

  // Convertir la fecha al formato yyyy-mm-dd si está en mm/dd/yyyy
  if (fechaPedido) {
    const [mes, dia, anio] = fechaPedido.split("/");
    fechaPedido = `${anio}-${mes}-${dia}`;
  }
  // Validación básica de los parámetros
  if (isNaN(Number(id))) {
    return res.status(400).send("El ID proporcionado no es válido");
  }
  if (!IdCliente) {
    console.log(`es el IDCLIENTE: ${IdCliente}`);
    return res.status(400).send("Todos los campos son obligatorios");
  }

  try {
    await pool
      .request()
      .input("IdPedido", Number(id))
      .input("IdCliente", IdCliente)
      .input("FechaPedido", FechaPedido).query(`
        UPDATE Pedidos 
        SET IdCliente = @IdCliente, FechaPedido = @FechaPedido 
        WHERE IdPedido = @IdPedido
      `);

    res.status(200).send("Pedido editado con éxito");
  } catch (err) {
    console.error("Error al editar el pedido:", err);
    res.status(500).send("Error al editar el pedido");
  }
});

export default router;
