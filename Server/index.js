import express from "express";
import tiposDePanesRoutes from "./routes/TiposPanes.routes.js"; // Ajusta la ruta según tu estructura de carpetas
import produccionDiariaRoutes from "./routes/ProduccionDiaria.routes.js";
import clientesRoutes from "./routes/Clientes.routes.js";
import PedidosRoutes from "./routes/Pedidos.routes.js";
import detallePedido from "./routes/DetallePedidos.routes.js";
import IndexClientes from "./routes/Index.routes.js";
import Cuentas from "./routes/Cuentas.routes.js";
import Login from "./routes/login.routes.js";
import Barchart from "./routes/BarChart.routes.js";

const app = express();
import cors from "cors";

app.use(cors());
// Middleware para el manejo de datos JSON
app.use(express.json());

// Usar el enrutador importado
app.use("/api", tiposDePanesRoutes);
app.use("/api", produccionDiariaRoutes);
app.use("/api", clientesRoutes);
app.use("/api", PedidosRoutes);
app.use("/api", detallePedido);
app.use("/api", IndexClientes);
app.use("/api", Cuentas);
app.use("/api", Login);
app.use("/api", Barchart);
// Configuración del puerto
app.set("port", process.env.PORT || 3000);

// Iniciar el servidor
app.listen(app.get("port"), () => {
  console.log("Server listening on port", app.get("port"));
});
