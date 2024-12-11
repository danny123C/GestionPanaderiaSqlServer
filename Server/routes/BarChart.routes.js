import { request, Router } from "express"; // Importa el Router de Express
import pool from "../database.js"; // Importa el pool de conexiones a la base de datos
const router = Router(); // Crea una nueva instancia de Router

router.get("/listaPedidosPorMes", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
          YEAR(FechaPedido) AS Año,
          MONTH(FechaPedido) AS Mes,
          COUNT(IdPedido) AS TotalPedidos,
          SUM(TotalPedido) AS MontoTotal
      FROM 
          Pedidos
      WHERE 
          FechaPedido IS NOT NULL
      GROUP BY 
          YEAR(FechaPedido), MONTH(FechaPedido)
      ORDER BY 
          Año, Mes;
    `);

    res.json(result.recordset);
    console.log("Pedidos por mes:", result.recordset);
  } catch (err) {
    console.error("Error al obtener la lista de pedidos por mes:", err);
    res.status(500).send("Error al obtener los pedidos por mes.");
  }
});

router.get("/listaProduccionPorMes", async (req, res) => {
  try {
    const result = await pool.request().query(`
 SELECT 
                YEAR(p.Fecha) AS Año,
                MONTH(p.Fecha) AS Mes,
                tp.Nombre AS NombrePan,
                SUM(p.Cantidad) AS CantidadPorTipoPan,
                SUM(p.PanFaltante) AS PanFaltante,
                SUM(p.PanSobrante) AS PanSobrante
            FROM 
                ProduccionDiaria p
            JOIN 
                TiposDePanes tp ON p.IdTipoPan = tp.IdTipoPan
            WHERE 
                p.Fecha IS NOT NULL
            GROUP BY 
                YEAR(p.Fecha), MONTH(p.Fecha), tp.Nombre
            ORDER BY 
                Año, Mes;
        `);

    const datosAgrupados = result.recordset.reduce((acc, curr) => {
      const {
        Año,
        Mes,
        NombrePan,
        CantidadPorTipoPan,
        PanFaltante,
        PanSobrante,
      } = curr;
      const key = `${Año}-${Mes}`;

      if (!acc[key]) {
        acc[key] = {
          Año,
          Mes,
          NombrePan: {},
          CantidadTotalMes: 0,
          PanFaltante: 0,
          PanSobrante: 0,
        };
      }

      acc[key].NombrePan[NombrePan] = CantidadPorTipoPan;
      acc[key].CantidadTotalMes += CantidadPorTipoPan;
      acc[key].PanFaltante += PanFaltante;
      acc[key].PanSobrante += PanSobrante;

      return acc;
    }, {});

    res.json(Object.values(datosAgrupados));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
});
export default router;
