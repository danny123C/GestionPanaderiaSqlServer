import { request, Router } from "express"; // Importa el Router de Express
import pool from "../database.js"; // Importa el pool de conexiones a la base de datos
const router = Router(); // Crea una nueva instancia de Router

//endPoint listaClientes
router.get("/listClientes", async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM  Clientes");
    res.json(result.recordset);
    console.log(result);
  } catch (err) {
    console.log("error al obtener la lista de Clientes", err);
    console.status(500).send("sin respuesta");
  }
});

router.post("/addClientes", async (req, res) => {
  const { Nombre, Telefono, Email } = req.body;
  if (!Nombre) {
    return res.status(400).send("Nombre es nesesario");
  }

  try {
    const result = await pool
      .request()
      .input("Nombre", Nombre)
      .input("Telefono", Telefono)
      .input("Email", Email)
      .query(
        "INSERT INTO Clientes (Nombre, Telefono, Email) VALUES (@Nombre, @Telefono, @Email)"
      );
    res.status(201).send("Tipo de Pan añadido con éxito");
  } catch (err) {
    console.error("Error al añadir tipo de pan:", err);
    res.status(500).send("Error al añadir tipo de pan");
  }
});

router.delete("/deleteCliente/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool
      .request()
      .input("IdCliente", id)
      .query("DELETE FROM Clientes WHERE IdCliente = @IdCliente");
    if (result.rowsAffected[0] > 0) {
      res.status(2000).send(`El CLiente ${id} fue eliminado con exito`);
    } else {
      res.status(404).send(`Cliente con el ${id} no encontrado`);
    }
  } catch (err) {
    console.error("Error al eliminar CLIENTE:", err);
    res.status(500).send("Error al eliminar CLIENTE");
  }
});
router.put("/editCliente/:id", async (req, res) => {
  const { id } = req.params;
  const { Nombre, Telefono, Email } = req.body;

  try {
    const result = await pool
      .request()
      .input("IdCliente", id) // Se añade el parámetro 'IdCliente'
      .input("Nombre", Nombre)
      .input("Telefono", Telefono)
      .input("Email", Email)
      .query(
        "UPDATE Clientes SET Nombre = @Nombre, Telefono = @Telefono, Email = @Email WHERE IdCliente = @IdCliente"
      );

    if (result.rowsAffected[0] === 0) {
      res.status(400).send("Error al editar: No se encontró el cliente");
    } else {
      res.status(200).send("Cliente editado con éxito");
    }
  } catch (err) {
    console.error("Error al editar CLIENTE:", err);
    res.status(500).send("Error al editar CLIENTE");
  }
});

export default router;
