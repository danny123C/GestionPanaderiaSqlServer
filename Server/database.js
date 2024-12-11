import sql from "mssql";

const config = {
  user: "sa", // Reemplaza con tu usuario de SQL Server
  password: "123456789", // Reemplaza con tu contraseña
  server: "localhost", // Dirección del servidor (o IP)
  database: "PanaderiaDB", // Nombre de tu base de datos
  port: 1433, // Puerto por defecto de SQL Server
  options: {
    encrypt: true, // Si necesitas encriptación
    trustServerCertificate: true, // Permitir certificados auto-firmados
    enableArithAbort: true,
  },
  pool: {
    max: 10, // Máximo número de conexiones en el pool
    min: 0, // Mínimo número de conexiones en el pool
    idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar una conexión
  },
};

// Crear un pool de conexiones
const pool = new sql.ConnectionPool(config);

// Conectar el pool y manejar la conexión
pool
  .connect()
  .then(() => {
    console.log("Conectado a SQL Server con éxito.");
  })
  .catch((err) => {
    console.error("Error al conectar a SQL Server:", err);
  });

// Exportar el pool para su uso en otras partes de la aplicación
export default pool;
