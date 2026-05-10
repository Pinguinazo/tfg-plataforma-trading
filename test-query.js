const cassandra = require('cassandra-driver');

const authProvider = new cassandra.auth.PlainTextAuthProvider('cassandra', 'cassandra');
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  authProvider: authProvider,
  queryOptions: { prepare: true }
});

async function run() {
  try {
    const query = 'SELECT user_id, username, password, tier, balance, total_deposited, holdings, is_active FROM trading_tfg.usuarios WHERE username = ?';
    const result = await client.execute(query, ['testuser123']);
    console.log("Success:", result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    await client.shutdown();
  }
}

run();
