#!/usr/bin/env node
/* build.js — bundle the app shell + engine + a lesson JSON into ONE standalone .html.
   Usage: node scripts/build.js <lesson.json> [out.html]
   The standalone build runs from file:// and inside webviews (no fetch/CDN needed):
   tokens.css and the branching-dialogue module are inlined; network-only modules
   (morphology fetch, notebook IndexedDB, fsrs, softgate, roleplay, Supabase auth) are
   omitted — the engine guards for their absence and the core lesson + dialogue still play. */
const fs = require('fs');
const path = require('path');

const lessonPath = process.argv[2];
if (!lessonPath) { console.error('Usage: node scripts/build.js <lesson.json> [out.html]'); process.exit(1); }

const ROOT   = path.join(__dirname, '..');
const APP    = path.join(ROOT, 'app');
const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));   // validate it parses
const engine = fs.readFileSync(path.join(APP, 'engine.js'), 'utf8');
const tokens = fs.readFileSync(path.join(ROOT, 'brand', 'tokens.css'), 'utf8');
const dialogue = fs.readFileSync(path.join(APP, 'engine', 'dialogue.js'), 'utf8');
let html = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');

// 1) Inline tokens.css in place of the external <link>.
html = html.replace(/<link rel="stylesheet" href="\.\.\/brand\/tokens\.css">/,
  '<style>\n' + tokens + '\n</style>');
// 2) Drop the manifest link and all external module <script defer> tags + their comments
//    (they 404 on file://; dialogue is re-inlined below, the rest degrade gracefully).
html = html.replace(/<link rel="manifest"[^>]*>\s*/, '');
html = html.replace(/<!--[^>]*-->\s*/g, '');
html = html.replace(/<script defer src="engine\/[^"]+"><\/script>\s*/g, '');

const bodyStart = html.indexOf('<div id="app"></div>');
const head = html.slice(0, bodyStart);

const safeJson = JSON.stringify(lesson).replace(/<\/script>/g, '<\\/script>');

const inlined =
  '<div id="app"></div>\n'
  + '<script>' + dialogue + '</script>\n'
  + '<script id="lesson-data" type="application/json">' + safeJson + '</script>\n'
  + '<script>window.LESSON = JSON.parse(document.getElementById("lesson-data").textContent);</script>\n'
  + '<script>\n' + engine + '\n</script>\n</body>\n</html>\n';

const outPath = process.argv[3] || (lesson.meta.id + '.standalone.html');
fs.writeFileSync(outPath, head + inlined);
console.log('Built standalone:', outPath, '(' + (head + inlined).length + ' bytes)');
