// Called daily by Vercel Cron (see vercel.json)
const { createClient } = require('@supabase/supabase-js');
const { syncCodeforces } = require('../lib/cf-sync');

module.exports = async (req, res) => {
  if (!process.env.CRON_SECRET) return res.status(500).json({ error: 'CRON_SECRET is not set' });
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
    const results = await syncCodeforces(sb);
    console.log(JSON.stringify(results));
    res.status(200).json({ ok: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};