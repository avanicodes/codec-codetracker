// Manual run on your laptop:  node sync-codeforces.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { syncCodeforces } = require('./lib/cf-sync');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
syncCodeforces(sb)
  .then((results) => {
    results.forEach((r) => console.log(r.status, '|', r.name, '|', r.solved ?? '', r.rating ?? ''));
    console.log('Done.');
  })
  .catch((e) => { console.error(e); process.exit(1); });
