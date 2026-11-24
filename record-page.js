// Renders one fragment's record page from window.GN_REC.
// Used by the static pages at id/<IE>/<page>/index.html, which carry their record inline.
(function () {
  const rec = window.GN_REC, app = document.getElementById('app');
  if (!rec || !app) return;
  const ttlUrl = '../' + rec.page + '.ttl';
  // Old-style links (?format=ttl) go to the Turtle file.
  const fmt = new URLSearchParams(location.search).get('format');
  if (fmt === 'ttl' || fmt === 'turtle') { location.replace(ttlUrl); return; }
  if (fmt === 'jsonld') {
    document.body.innerHTML = '<pre style="margin:0;padding:16px;white-space:pre-wrap;font:12px/1.5 JetBrains Mono,monospace"></pre>';
    document.body.firstChild.textContent = JSON.stringify(recordsToJsonLdDoc([rec]), null, 2);
    return;
  }
  app.innerHTML = topNavHTML() + `
    <h1>${gnEsc(rec.shelfmark || 'Geniza fragment')}, image ${rec.page}</h1>
    <p class="sub">Unified identification record. Every value is kept with the sources that give it; where the sources disagree, no value is chosen.</p>
    ${recordCardHTML(rec, { heading: 'Record', linkUri: false })}
    <p class="sub">The same record as data: <a href="${ttlUrl}">Turtle file</a> · <a href="?format=jsonld">JSON-LD</a></p>`;
})();
