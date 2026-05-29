const express = require('express');
const cors = require('cors');
const cassandra = require('cassandra-driver');

const app = express();
app.use(cors());
app.use(express.json());

const client = new cassandra.Client({
  cloud: {
    secureConnectBundle: './secure-connect-tradingpulse-db.zip',
  },
  credentials: {
    username: 'rePZBZyQHkJZIovXJOKjsgmC',
    password: 'hpLk7cfC5ZGIlCxKi,glXTI,5wLL7KvqhCMxaT,oxF.Alo7j_HQwTtwvfa,D4Zf-r3BuRI4,k+,Jm0_ful+PhvOMFcz03vkSd_L9m6PIEqxy5CRKC_y+K3kJzyRKOWl9'
  }
});

const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,10}$/;
  return email && email.length <= 50 && re.test(email);
};

const isSafeText = (text, maxLength = 50) => {
  if (!text) return false;
  const re = /^[^<>\`]+$/;
  return text.length <= maxLength && re.test(text);
};

async function getEmailOwnerId(email) {
  try {
    let result = await client.execute(`SELECT user_id as id FROM tradingpulse_db.usuarios WHERE email = ? ALLOW FILTERING`, [email], { prepare: true });
    if (result.rowLength > 0) return result.first().id.toString();

    result = await client.execute(`SELECT admin_id as id FROM tradingpulse_db.admin_secundarios WHERE email = ? ALLOW FILTERING`, [email], { prepare: true });
    if (result.rowLength > 0) return result.first().id.toString();

    result = await client.execute(`SELECT admin_id as id FROM tradingpulse_db.admin_master WHERE email = ? ALLOW FILTERING`, [email], { prepare: true });
    if (result.rowLength > 0) return result.first().id.toString();

    return null;
  } catch (error) {
    throw error;
  }
}

async function insertAdminLog(username, action, details) {
  try {
    await client.execute(`INSERT INTO tradingpulse_db.admin_logs (partition_key, log_id, admin_username, action, details, created_at) VALUES (1, uuid(), ?, ?, ?, toTimestamp(now()))`, [username || 'Sistema', action, details], { prepare: true });
  } catch (error) {
    console.error(`[Admin Log Error] Fallo al registrar la acción '${action}' del admin '${username}':`, error.message);
  }
}

async function insertUserLog(userId, action, details) {
  try {
    await client.execute(`INSERT INTO tradingpulse_db.user_logs (user_id, log_id, action, details, created_at) VALUES (?, uuid(), ?, ?, toTimestamp(now()))`, [userId, action, details], { prepare: true });
  } catch (error) {
    console.error(`[User Log Error] Fallo al registrar la acción '${action}' para el usuario ${userId}:`, error.message);
  }
}

async function initDB() {
  let connected = false;
  while (!connected) {
    try {
      await client.connect();
      await client.execute(`CREATE TABLE IF NOT EXISTS tradingpulse_db.usuarios (user_id uuid PRIMARY KEY, username text, email text, password text, tier text, balance double, total_deposited double, holdings text, is_active boolean, created_at timestamp)`);
      try { await client.execute(`ALTER TABLE tradingpulse_db.usuarios ADD deleted_at timestamp`); } catch (error) {
        console.warn("[DB Init] Nota: La columna deleted_at ya existe o no se pudo alterar.", error.message);
      }
      await client.execute(`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON tradingpulse_db.usuarios (email)`);
      await client.execute(`CREATE INDEX IF NOT EXISTS idx_usuarios_username ON tradingpulse_db.usuarios (username)`);
      await client.execute(`CREATE TABLE IF NOT EXISTS tradingpulse_db.transacciones_por_usuario (user_id uuid, timestamp bigint, tx_id uuid, type text, symbol text, ticker text, amount double, price double, PRIMARY KEY ((user_id), timestamp)) WITH CLUSTERING ORDER BY (timestamp DESC)`);
      await client.execute(`CREATE TABLE IF NOT EXISTS tradingpulse_db.admin_master (admin_id uuid PRIMARY KEY, username text, password text, email text, created_at timestamp)`);
      await client.execute(`CREATE INDEX IF NOT EXISTS idx_admin_master_username ON tradingpulse_db.admin_master (username)`);
      await client.execute(`CREATE INDEX IF NOT EXISTS idx_admin_master_email ON tradingpulse_db.admin_master (email)`);
      await client.execute(`CREATE TABLE IF NOT EXISTS tradingpulse_db.admin_secundarios (admin_id uuid PRIMARY KEY, username text, password text, email text, created_by text, created_at timestamp)`);
      await client.execute(`CREATE INDEX IF NOT EXISTS idx_admin_secundarios_username ON tradingpulse_db.admin_secundarios (username)`);
      await client.execute(`CREATE INDEX IF NOT EXISTS idx_admin_secundarios_email ON tradingpulse_db.admin_secundarios (email)`);
      await client.execute(`CREATE TABLE IF NOT EXISTS tradingpulse_db.admin_logs (partition_key int, log_id uuid, admin_username text, action text, details text, created_at timestamp, PRIMARY KEY (partition_key, created_at)) WITH CLUSTERING ORDER BY (created_at DESC)`);
      await client.execute(`CREATE TABLE IF NOT EXISTS tradingpulse_db.user_logs (user_id uuid, log_id uuid, action text, details text, created_at timestamp, PRIMARY KEY (user_id, created_at)) WITH CLUSTERING ORDER BY (created_at DESC)`);
      
      const masterCheck = await client.execute('SELECT admin_id FROM tradingpulse_db.admin_master LIMIT 1');
      if (masterCheck.rowLength === 0) {
        const masterId = cassandra.types.Uuid.random();
        await client.execute(`INSERT INTO tradingpulse_db.admin_master (admin_id, username, password, email, created_at) VALUES (?, ?, ?, ?, toTimestamp(now()))`, [masterId, 'Pingu', 'admin1234', 'master@finpulse.com'], { prepare: true });
      }
      connected = true;
    } catch (error) {
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

initDB();

app.get('/health', (req, res) => { res.status(200).json({ status: 'UP' }); });

app.post('/api/users/register', async (req, res) => {
  const { username, email, password, tier } = req.body;
  if (!isSafeText(username)) return res.status(400).json({ error: 'Nombre de usuario inválido o contiene caracteres prohibidos.' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Formato de correo inválido o excede los caracteres permitidos.' });
  if (!isSafeText(password, 100)) return res.status(400).json({ error: 'La contraseña contiene caracteres prohibidos.' });

  try {
    const ownerId = await getEmailOwnerId(email);
    if (ownerId) return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });

    const checkQuery = 'SELECT username FROM tradingpulse_db.usuarios WHERE username = ? ALLOW FILTERING';
    const checkResult = await client.execute(checkQuery, [username]);
    if (checkResult.rowLength > 0) return res.status(400).json({ error: 'El nombre de usuario ya existe.' });
    
    const user_id = cassandra.types.Uuid.random();
    const initialTier = tier || 'Básico';
    await client.execute(`INSERT INTO tradingpulse_db.usuarios (user_id, username, email, password, tier, balance, total_deposited, holdings, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, toTimestamp(now()))`, [user_id, username, email, password, initialTier, 10000.0, 10000.0, '{}', true]);
    await insertUserLog(user_id, 'REGISTRO', `Cuenta creada con el plan ${initialTier}`);
    
    res.status(201).json({ message: 'Usuario registrado', user_id, username, email, tier: initialTier, balance: 10000.0, total_deposited: 10000.0, holdings: {} });
  } catch (error) { res.status(500).json({ error: 'Error interno del servidor al registrar.' }); }
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  if (!isSafeText(username) && !isValidEmail(username)) return res.status(400).json({ error: 'Formato de credenciales inválido.' });

  try {
    const checkAccount = async (table) => {
      let r = await client.execute(`SELECT * FROM ${table} WHERE username = ? ALLOW FILTERING`, [username]);
      if (r.rowLength === 0) r = await client.execute(`SELECT * FROM ${table} WHERE email = ? ALLOW FILTERING`, [username]);
      return r.rowLength > 0 ? r.first() : null;
    };

    const master = await checkAccount('tradingpulse_db.admin_master');
    if (master && master.password === password) return res.status(200).json({ message: 'Login Master', role: 'master', user_id: master.admin_id, username: master.username, email: master.email });

    const admin = await checkAccount('tradingpulse_db.admin_secundarios');
    if (admin && admin.password === password) return res.status(200).json({ message: 'Login Admin', role: 'admin', user_id: admin.admin_id, username: admin.username, email: admin.email });

    const user = await checkAccount('tradingpulse_db.usuarios');
    if (!user || user.password !== password) return res.status(401).json({ error: 'Credenciales incorrectas' });
    if (!user.is_active) return res.status(403).json({ error: 'Cuenta en proceso de borrado' });
    
    let parsedHoldings = {};
    try { if (typeof user.holdings === 'string') parsedHoldings = JSON.parse(user.holdings); else if (user.holdings) parsedHoldings = user.holdings; } catch(error) { parsedHoldings = {}; console.error("Error al leer cartera:", error.message); }

    await insertUserLog(user.user_id, 'LOGIN', 'Inicio de sesión en la plataforma');
    res.status(200).json({ message: 'Login exitoso', role: 'user', user_id: user.user_id, username: user.username, email: user.email, tier: user.tier, balance: user.balance || 0, total_deposited: user.total_deposited || 0, holdings: parsedHoldings });
  } catch (error) { res.status(500).json({ error: 'Fallo BD' }); }
});

app.put('/api/users/:id/update', async (req, res) => {
  const { id } = req.params;
  const { username, email, password, tier } = req.body;
  
  if (username && !isSafeText(username)) return res.status(400).json({ error: 'Nombre de usuario inválido.' });
  if (email && !isValidEmail(email)) return res.status(400).json({ error: 'Correo inválido.' });

  try {
    if (email) {
      const ownerId = await getEmailOwnerId(email);
      if (ownerId && ownerId !== id) return res.status(400).json({ error: 'El correo ya está en uso por otra cuenta.' });
    }

    let updates = []; let params = [];
    if (username) { updates.push('username = ?'); params.push(username); }
    if (email) { updates.push('email = ?'); params.push(email); }
    if (password) { updates.push('password = ?'); params.push(password); }
    if (tier) { updates.push('tier = ?'); params.push(tier); }
    
    if (updates.length > 0) {
      params.push(id); 
      await client.execute(`UPDATE tradingpulse_db.usuarios SET ${updates.join(', ')} WHERE user_id = ?`, params, { prepare: true });
      await insertUserLog(id, 'PERFIL_ACTUALIZADO', 'El usuario actualizó sus datos');
    }
    res.status(200).json({ message: 'Datos actualizados' });
  } catch (error) { res.status(500).json({ error: 'Error actualizando cuenta' }); }
});

app.patch('/api/users/:id/delete', async (req, res) => {
  const { id } = req.params;
  const { admin_username } = req.body; 
  try {
    await client.execute(`UPDATE tradingpulse_db.usuarios SET is_active = false, deleted_at = toTimestamp(now()) WHERE user_id = ?`, [id]);
    if (admin_username) {
      await insertAdminLog(admin_username, 'BORRAR_USUARIO', `Envió a cola de borrado al usuario ID: ${id}`);
      await insertUserLog(id, 'CUENTA_SUSPENDIDA', `Un administrador (${admin_username}) mandó la cuenta a borrar.`);
    } else {
      await insertUserLog(id, 'AUTO_ELIMINACION', 'El usuario solicitó borrar su cuenta.');
    }
    res.status(200).json({ message: 'Cuenta en estado soft-delete' });
  } catch (error) { res.status(500).json({ error: 'Error al desactivar' }); }
});

app.post('/api/trade', async (req, res) => {
  const { user_id, type, symbol, ticker, amount, price, balance, holdings } = req.body;
  try {
    const tx_id = cassandra.types.Uuid.random(); 
    const timestamp = Date.now();
    await client.execute(`INSERT INTO tradingpulse_db.transacciones_por_usuario (user_id, timestamp, tx_id, type, symbol, ticker, amount, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [user_id, timestamp, tx_id, type, symbol, ticker, amount, price]);
    
    if (balance !== undefined && holdings !== undefined) {
      await client.execute(`UPDATE tradingpulse_db.usuarios SET balance = ?, holdings = ? WHERE user_id = ?`, [parseFloat(balance), JSON.stringify(holdings), user_id]);
    }
    const actionName = type === 'DEPOSIT' ? 'DEPÓSITO' : type === 'WITHDRAW' ? 'RETIRO' : 'TRADE_MERCADO';
    await insertUserLog(user_id, actionName, `${type} | ${amount} ${ticker} a ${price}$`);
    res.status(201).json({ message: 'Transacción operada', tx_id: tx_id.toString(), timestamp });
  } catch (error) { res.status(500).json({ error: 'Error transacción' }); }
});

app.get('/api/users/:id/transactions', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM tradingpulse_db.transacciones_por_usuario WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100', [req.params.id], { prepare: true });
    const transaccionesArregladas = result.rows.map(row => ({
      ...row,
      tx_id: row.tx_id ? row.tx_id.toString() : null, 
      timestamp: row.timestamp ? row.timestamp.toString() : null
    }));
    res.status(200).json(transaccionesArregladas);
  } catch (error) { res.status(500).json({ error: 'Error historial' }); }
});

app.post('/api/users/sync', async (req, res) => {
  const { user_id, balance, total_deposited, holdings } = req.body;
  try {
    await client.execute(`UPDATE tradingpulse_db.usuarios SET balance = ?, total_deposited = ?, holdings = ? WHERE user_id = ?`, [parseFloat(balance), parseFloat(total_deposited), JSON.stringify(holdings), user_id]);
    res.status(200).json({ message: 'Sincronizados' });
  } catch (error) { res.status(500).json({ error: 'Error sincro' }); }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const usersCountResult = await client.execute('SELECT count(*) FROM tradingpulse_db.usuarios WHERE is_active = true ALLOW FILTERING');
    const tiersResult = await client.execute('SELECT tier FROM tradingpulse_db.usuarios WHERE is_active = true ALLOW FILTERING');
    let proCount = 0; let eliteCount = 0; let basicoCount = 0; 
    tiersResult.rows.forEach(row => { if (row.tier === 'Pro') proCount++; else if (row.tier === 'Élite') eliteCount++; else if (row.tier === 'Básico') basicoCount++; });
    const pendingDeletionsResult = await client.execute('SELECT user_id, email, tier, created_at FROM tradingpulse_db.usuarios WHERE is_active = false ALLOW FILTERING');
    const mrr = (proCount * 15) + (eliteCount * 49);
    res.status(200).json({ activeUsers: Number(usersCountResult.first().get('count')), mrr, arr: mrr * 12, proCount, eliteCount, basicoCount, pendingDeletions: pendingDeletionsResult.rows.length, softDeleteList: pendingDeletionsResult.rows });
  } catch (error) { res.status(500).json({ error: 'Error DB' }); }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await client.execute('SELECT user_id, username, email, tier, is_active FROM tradingpulse_db.usuarios');
    res.status(200).json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Error DB' }); }
});

app.get('/api/admin/nodes', async (req, res) => {
  res.status(200).json([
    { name: 'Nodo Semilla (Seed)', status: 'active', ip: '172.18.0.2', role: 'Comprueba estado y enruta.' },
    { name: 'Nodo Auth (Usuarios)', status: 'active', ip: '172.18.0.3', role: 'validación de credenciales.' },
    { name: 'Nodo Trading (Ledger)', status: 'active', ip: '172.18.0.4', role: 'Registra el histórico de compras.' },
    { name: 'Nodo Analítica (Stats)', status: 'active', ip: '172.18.0.5', role: 'Procesa métricas.' },
    { name: 'Nodo Backup (Fallback)', status: 'inactive', ip: '172.18.0.6', role: 'Nodo de respaldo.' },
  ]);
});

app.patch('/api/admin/users/:id/recover', async (req, res) => {
  try {
    await client.execute(`UPDATE tradingpulse_db.usuarios SET is_active = true, deleted_at = null WHERE user_id = ?`, [req.params.id]);
    res.status(200).json({ message: 'Usuario recuperado' });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.put('/api/admin/users/:id/update', async (req, res) => {
  const { username, email, tier, password, admin_username } = req.body;
  if (username && !isSafeText(username)) return res.status(400).json({ error: 'Nombre de usuario inválido.' });
  if (email && !isValidEmail(email)) return res.status(400).json({ error: 'Correo inválido.' });

  try {
    if (email) {
      const ownerId = await getEmailOwnerId(email);
      if (ownerId && ownerId !== req.params.id) return res.status(400).json({ error: 'El correo ya está en uso por otra cuenta.' });
    }

    let updates = []; let params = [];
    if (username) { updates.push('username = ?'); params.push(username); }
    if (email) { updates.push('email = ?'); params.push(email); }
    if (tier) { updates.push('tier = ?'); params.push(tier); }
    if (password && password.trim() !== '') { updates.push('password = ?'); params.push(password); }
    
    if (updates.length > 0) {
      params.push(req.params.id);
      await client.execute(`UPDATE tradingpulse_db.usuarios SET ${updates.join(', ')} WHERE user_id = ?`, params, { prepare: true });
      if (admin_username) {
        await insertAdminLog(admin_username, 'MODIFICAR_USUARIO', `Editó usuario ID: ${req.params.id}`);
        await insertUserLog(req.params.id, 'PERFIL_ACTUALIZADO', `El administrador (${admin_username}) actualizó tus datos.`);
      }
    }
    res.status(200).json({ message: 'Usuario modificado correctamente' });
  } catch (error) { res.status(500).json({ error: 'Error al actualizar' }); }
});

app.get('/api/admin/users/:id/logs', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM tradingpulse_db.user_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.params.id], { prepare: true });
    res.status(200).json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/admin/managers', async (req, res) => {
  try {
    const result = await client.execute('SELECT admin_id, username, email, created_by, created_at FROM tradingpulse_db.admin_secundarios');
    res.status(200).json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/admin/managers', async (req, res) => {
  const { username, password, email } = req.body;
  if (!isSafeText(username)) return res.status(400).json({ error: 'Nombre de usuario inválido.' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Correo inválido.' });

  try {
    const ownerId = await getEmailOwnerId(email);
    if (ownerId) return res.status(400).json({ error: 'Este correo electrónico ya está en uso.' });

    const id = cassandra.types.Uuid.random();
    await client.execute(`INSERT INTO tradingpulse_db.admin_secundarios (admin_id, username, password, email, created_by, created_at) VALUES (?, ?, ?, ?, 'Master', toTimestamp(now()))`, [id, username, password, email], { prepare: true });
    await insertAdminLog('Master', 'CREAR_ADMIN', `Creó al admin secundario: ${username}`);
    res.status(201).json({ message: 'Administrador creado' });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.put('/api/admin/managers/:id', async (req, res) => {
  const { username, password, email } = req.body;
  if (username && !isSafeText(username)) return res.status(400).json({ error: 'Nombre de usuario inválido.' });
  if (email && !isValidEmail(email)) return res.status(400).json({ error: 'Correo inválido.' });

  try {
    if (email) {
      const ownerId = await getEmailOwnerId(email);
      if (ownerId && ownerId !== req.params.id) return res.status(400).json({ error: 'El correo ya está en uso por otra cuenta.' });
    }

    let updates = []; let params = [];
    if (username) { updates.push('username = ?'); params.push(username); }
    if (password) { updates.push('password = ?'); params.push(password); }
    if (email) { updates.push('email = ?'); params.push(email); }
    
    if (updates.length > 0) {
      params.push(req.params.id);
      await client.execute(`UPDATE tradingpulse_db.admin_secundarios SET ${updates.join(', ')} WHERE admin_id = ?`, params, { prepare: true });
      await insertAdminLog('Master', 'EDITAR_ADMIN', `Editó datos del admin ID: ${req.params.id}`);
    }
    res.status(200).json({ message: 'Administrador actualizado' });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.put('/api/admin/master/:id', async (req, res) => {
  const { username, password, email } = req.body;
  if (username && !isSafeText(username)) return res.status(400).json({ error: 'Nombre de usuario inválido.' });
  if (email && !isValidEmail(email)) return res.status(400).json({ error: 'Correo inválido.' });

  try {
    if (email) {
      const ownerId = await getEmailOwnerId(email);
      if (ownerId && ownerId !== req.params.id) return res.status(400).json({ error: 'El correo ya está en uso por otra cuenta.' });
    }

    let updates = []; let params = [];
    if (username) { updates.push('username = ?'); params.push(username); }
    if (password) { updates.push('password = ?'); params.push(password); }
    if (email) { updates.push('email = ?'); params.push(email); }
    
    if (updates.length > 0) {
      params.push(req.params.id);
      await client.execute(`UPDATE tradingpulse_db.admin_master SET ${updates.join(', ')} WHERE admin_id = ?`, params, { prepare: true });
      await insertAdminLog(username || 'Master', 'PERFIL_ACTUALIZADO', 'El Master actualizó sus datos de acceso.');
    }
    res.status(200).json({ message: 'Datos del Master actualizados' });
  } catch (error) { res.status(500).json({ error: 'Error actualizando Master' }); }
});

app.delete('/api/admin/managers/:id', async (req, res) => {
  try {
    await client.execute('DELETE FROM tradingpulse_db.admin_secundarios WHERE admin_id = ?', [req.params.id], { prepare: true });
    await insertAdminLog('Master', 'REVOCAR_ADMIN', `Eliminó al admin ID: ${req.params.id}`);
    res.status(200).json({ message: 'Administrador revocado' });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/admin/logs', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM tradingpulse_db.admin_logs WHERE partition_key = 1 ORDER BY created_at DESC LIMIT 100');
    res.status(200).json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

setInterval(async () => {
  try {
    const result = await client.execute('SELECT user_id, deleted_at FROM tradingpulse_db.usuarios WHERE is_active = false ALLOW FILTERING');
    const NOW = Date.now();
    const TRES_MESES_MS = 90 * 24 * 60 * 60 * 1000;
    for (const row of result.rows) {
      if (row.deleted_at && (NOW - row.deleted_at.getTime() > TRES_MESES_MS)) {
        await client.execute('DELETE FROM tradingpulse_db.usuarios WHERE user_id = ?', [row.user_id]);
      }
    }
  } catch (error) {
    console.error("[Cron Job Error] Fallo durante la limpieza automática de usuarios eliminados:", error.message);
  }
}, 24 * 60 * 60 * 1000);

const PORT = 3002;
const server = app.listen(PORT, () => { console.log(`🚀 Servidor Backend corriendo en el puerto ${PORT}`); });

async function shutdown() {
  server.close(async () => {
    try { await client.shutdown(); process.exit(0); } catch (err) { process.exit(1); }
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);