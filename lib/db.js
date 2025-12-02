import mysql from "mysql2/promise";

let pool;

function parseDatabaseUrl(url) {
  if (!url) return null;
  
  // Handle mysql:// format (works with both local and Heroku/JawsDB/ClearDB)
  if (url.startsWith('mysql://')) {
    try {
      // Parse the URL properly to handle URL-encoded passwords
      const urlObj = new URL(url);
      return {
        host: urlObj.hostname,
        port: parseInt(urlObj.port) || 3306,
        user: decodeURIComponent(urlObj.username),
        password: decodeURIComponent(urlObj.password),
        database: urlObj.pathname.slice(1) // Remove leading '/'
      };
    } catch (e) {
      // Fallback to regex if URL parsing fails
      const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (match) {
        return {
          host: match[3],
          port: parseInt(match[4]),
          user: decodeURIComponent(match[1]),
          password: decodeURIComponent(match[2]),
          database: match[5]
        };
      }
    }
  }
  
  return null;
}

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Please create .env.local file with your MySQL connection string.\n" +
        "Format: DATABASE_URL=mysql://username:password@host:port/database_name\n" +
        "Local example: DATABASE_URL=mysql://root:password@localhost:3306/happypaws\n" +
        "Heroku: DATABASE_URL is automatically set by Heroku add-on"
      );
    }

    const parsed = parseDatabaseUrl(process.env.DATABASE_URL);
    
    if (parsed) {
      pool = mysql.createPool({
        host: parsed.host,
        port: parsed.port,
        user: parsed.user,
        password: parsed.password,
        database: parsed.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    } else {
      // Fallback: try to use DATABASE_URL as-is (might be JSON or other format)
      throw new Error(
        "Invalid DATABASE_URL format. Use: mysql://username:password@host:port/database_name"
      );
    }
  }
  return pool;
}

export async function query(sql, params = []) {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}


