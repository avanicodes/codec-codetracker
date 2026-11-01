const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cf(path) {
  const res = await fetch('https://codeforces.com/api/' + path);
  const json = await res.json();
  if (json.status !== 'OK') throw new Error(json.comment || 'Codeforces API error');
  return json.result;
}

// One call for everyone's ratings. A single bad handle breaks the batch, so fall back to one by one.
async function getRatings(handles) {
  const map = new Map();
  try {
    const users = await cf('user.info?handles=' + handles.map(encodeURIComponent).join(';'));
    users.forEach((u) => map.set(u.handle.toLowerCase(), u.rating ?? null));
  } catch (e) {
    for (const h of handles) {
      try {
        const [u] = await cf('user.info?handles=' + encodeURIComponent(h));
        map.set(u.handle.toLowerCase(), u.rating ?? null);
      } catch (_) {}
      await sleep(2100);
    }
  }
  return map;
}

async function syncCodeforces(sb, { budgetMs = 270000 } = {}) {
  const started = Date.now();
  const { data: mentees, error } = await sb
    .from('mentees')
    .select('id, name, cf_handle')
    .not('cf_handle', 'is', null);
  if (error) throw error;
  if (!mentees.length) return [];

  const today = new Date().toISOString().slice(0, 10);
  const ratings = await getRatings(mentees.map((m) => m.cf_handle));
  await sleep(2100);

  const results = [];
  for (const m of mentees) {
    if (Date.now() - started > budgetMs) {
      results.push({ name: m.name, status: 'SKIPPED (out of time)' });
      continue;
    }
    const key = m.cf_handle.toLowerCase();
    if (!ratings.has(key)) {
      results.push({ name: m.name, status: 'FAIL: handle not found' });
      continue;
    }
    try {
      const subs = await cf('user.status?handle=' + encodeURIComponent(m.cf_handle));
      const solved = new Set(
        subs.filter((s) => s.verdict === 'OK').map((s) => s.problem.contestId + '-' + s.problem.index)
      ).size;
      const { error: upErr } = await sb
        .from('daily_stats')
        .upsert(
          { mentee_id: m.id, day: today, cf_solved: solved, cf_rating: ratings.get(key) },
          { onConflict: 'mentee_id,day' }
        );
      if (upErr) throw upErr;
      results.push({ name: m.name, status: 'OK', solved, rating: ratings.get(key) });
    } catch (err) {
      results.push({ name: m.name, status: 'FAIL: ' + err.message });
    }
    await sleep(2100); // Codeforces rate limit
  }
  return results;
}

module.exports = { syncCodeforces };