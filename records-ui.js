// Shared rendering for the record pages (404.html resolver) and examples.html.
// Needs unified.js loaded first (serializers, labels, link helpers).

const STATUS_TEXT = {
  confirmed: 'Confirmed by all three sources',
  supported: 'Supported by two sources; the third is silent',
  single: 'Given by one source only',
  contested: 'Contested: sources disagree, no value chosen',
};

function gnViewerUrl(rec) {
  return GN_BASE + 'index.html?ie=' + encodeURIComponent(rec.ie) + '&page=' + rec.page;
}

function sourcesTableHTML(rec) {
  const rows = ['passim', 'fgp', 'ktiv'].map(s => {
    const c = rec.claims[s] || {};
    const cells = LEVELS.map(L => c[L.key] ? gnEsc(gnDisplay(L.key, c[L.key])) : '<span class="silent">no data</span>');
    return `<tr><td><b>${SOURCES[s].label}</b><br><span class="silent" style="font-size:12px">${gnEsc(SOURCES[s].desc)}</span></td><td>${cells.join('</td><td>')}</td></tr>`;
  }).join('');
  return `<div class="tbl-wrap"><table><thead><tr><th>Source</th><th>Corpus</th><th>Sub-corpus</th><th>Work</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function unifiedTableHTML(rec) {
  const rows = LEVELS.map(L => {
    const m = rec.levels[L.key];
    if (!m.status) return `<tr><td>${L.label}</td><td class="silent">no source gives a value</td><td></td></tr>`;
    const vals = m.candidates.map(c =>
      `${m.value !== null ? '<b>' : ''}${gnEsc(gnDisplay(L.key, c.value))}${m.value !== null ? '</b>' : ''} <span class="silent">(${c.sources.map(s => SOURCES[s].label).join(' + ')})</span>`
    ).join('<br><i>vs.</i> ');
    return `<tr><td>${L.label}</td><td>${vals}</td><td><span class="st ${m.status}">${STATUS_TEXT[m.status]}</span></td></tr>`;
  }).join('');
  return `<div class="tbl-wrap"><table><thead><tr><th>Level</th><th>Value (and which sources give it)</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function outLinksHTML(rec) {
  const out = [
    `<a href="${rec.nliUrl}" target="_blank" rel="noreferrer">NLI catalogue record</a>`,
    `<a href="${rec.imgUrl}" target="_blank" rel="noreferrer">Image</a>`,
  ];
  rec.levels.corpus.candidates.forEach(c => {
    const wd = gnWikidataUrl(c.value);
    if (wd) out.push(`<a href="${wd.replace('http://www.wikidata.org/entity/', 'https://www.wikidata.org/wiki/')}" target="_blank" rel="noreferrer">Wikidata: ${gnEsc(gnDisplay('corpus', c.value))}</a>`);
  });
  const sef = gnSefariaUrl(rec);
  if (sef) out.push(`<a href="${sef}" target="_blank" rel="noreferrer">Sefaria: ${gnEsc(gnDisplay('tractate', rec.levels.tractate.value))}</a>`);
  out.push(`<a href="${gnViewerUrl(rec)}">Open in GenizaNexus viewer</a>`);
  return `<div class="links">${out.join('')}</div>`;
}

function gnDownloadText(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

const GN_RECS = {};
function recordCardHTML(rec, opts = {}) {
  const key = rec.ie + '-' + rec.page;
  GN_RECS[key] = rec;
  const heading = opts.heading || `${gnEsc(rec.shelfmark || 'Geniza fragment')}, image ${rec.page}`;
  return `
  <div class="card" id="rec-${key}">
    ${opts.tag || ''}<h3>${heading}</h3>
    <div class="sub" style="margin:0">${gnEsc(rec.library || '')}${rec.city ? ', ' + gnEsc(rec.city) : ''} · NLI IE ${rec.ie} · ALMA ${rec.alma}</div>
    <div class="uri">${opts.linkUri === false ? gnEsc(rec.uri) : `<a href="${rec.uri}">${gnEsc(rec.uri)}</a>`}</div>
    ${rec.catalogueTitle ? `<p style="margin:10px 0 0;font-size:14px">Catalogue title: <span class="he">${gnEsc(rec.catalogueTitle)}</span>${opts.titleEn ? ` <span class="silent">(“${gnEsc(opts.titleEn)}”)</span>` : ''}</p>` : ''}
    ${opts.why ? `<p class="why">${opts.why}</p>` : ''}
    <h4 style="margin:16px 0 4px;font-size:14px">1 · What each source says</h4>
    ${sourcesTableHTML(rec)}
    <h4 style="margin:16px 0 4px;font-size:14px">2 · Unified record</h4>
    ${unifiedTableHTML(rec)}
    ${outLinksHTML(rec)}
    <h4 style="margin:16px 0 4px;font-size:14px">3 · As Linked Data</h4>
    <div class="btns">
      <button class="btn" onclick="gnShow('${key}','ttl')">Show Turtle</button>
      <button class="btn" onclick="gnShow('${key}','jsonld')">Show JSON-LD</button>
      <button class="btn" onclick="gnSave('${key}','ttl')">Download .ttl</button>
      <button class="btn" onclick="gnSave('${key}','jsonld')">Download .jsonld</button>
    </div>
    <pre class="code" id="code-${key}" style="display:${opts.openTtl ? 'block' : 'none'}">${opts.openTtl ? gnEsc(TTL_PREFIXES + '\n' + recordToTurtle(rec)) : ''}</pre>
  </div>`;
}

const gnShown = {};
function gnShow(key, fmt) {
  const el = document.getElementById('code-' + key), rec = GN_RECS[key];
  if (gnShown[key] === fmt && el.style.display !== 'none') { el.style.display = 'none'; gnShown[key] = null; return; }
  el.textContent = fmt === 'ttl'
    ? TTL_PREFIXES + '\n' + recordToTurtle(rec)
    : JSON.stringify(recordsToJsonLdDoc([rec])['@graph'].slice(-1)[0], null, 2);
  el.style.display = 'block'; gnShown[key] = fmt;
}
function gnSave(key, fmt) {
  const rec = GN_RECS[key], name = `genizanexus-${rec.ie}-${rec.page}`;
  if (fmt === 'ttl') gnDownloadText(name + '.ttl', ttlHeader() + '\n' + recordToTurtle(rec), 'text/turtle;charset=utf-8');
  else gnDownloadText(name + '.jsonld', JSON.stringify(recordsToJsonLdDoc([rec]), null, 2), 'application/ld+json');
}

function topNavHTML() {
  return `<div class="top"><a class="brand" href="${GN_BASE}">GenizaNexus</a>
    <nav><a href="${GN_BASE}">Viewer</a><a href="${GN_BASE}examples.html">Examples</a><a href="${GN_BASE}id/catalogue">Catalogue</a><a href="${GN_BASE}ns">Vocabulary</a></nav></div>`;
}
