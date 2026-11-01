// Fetches Codeforces stats for every mentee with a cf_handle and saves today's snapshot.
// Run locally with:  node sync-codeforces.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cf(path) {
  const res = await fetch('https://codeforces.com/api/' + path);
  const json = await res.json();
  if (json.status !== 'OK') throw new Error(json.comment || 'Codeforces API error');
  return json.result;
}

(async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
    process.exit(1);
  }

  const { data: mentees, error } = await sb
    .from('mentees')
    .select('id, name, cf_handle')
    .not('cf_handle', 'is', null);
  if (error) throw error;

  const today = new Date().toISOString().slice(0, 10);

  for (const m of mentees) {
    try {
      const handle = encodeURIComponent(m.cf_handle);
      const [user] = await cf('user.info?handles=' + handle);
      await sleep(2100); // stay within Codeforces rate limit
      const subs = await cf('user.status?handle=' + handle);
      await sleep(2100);

      // distinct problems with an accepted verdict
      const solved = new Set(
        subs.filter((s) => s.verdict === 'OK').map((s) => s.problem.contestId + '-' + s.problem.index)
      ).size;

      const { error: upErr } = await sb
        .from('daily_stats')
        .upsert(
          { mentee_id: m.id, day: today, cf_solved: solved, cf_rating: user.rating ?? null },
          { onConflict: 'mentee_id,day' }
        );
      if (upErr) throw upErr;

      console.log('OK  ', m.name, '| solved:', solved, '| rating:', user.rating ?? 'unrated');
    } catch (err) {
      console.log('FAIL', m.name, '-', err.message);
    }
  }
  console.log('Done.');
})();