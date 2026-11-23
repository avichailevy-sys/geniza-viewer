// ── Unified catalogue + Linked Open Data export ─────────────────────────────
// Builds one merged ("unified") identification record per fragment from the
// three normalized sources (passim, FGP, NLI/KTIV), keeping every source's
// claim and its provenance, and exports the result as Linked Data
// (JSON-LD and Turtle) and as a flat CSV.
//
// Merge rule, applied separately at each level (corpus / sub-corpus / work):
//   confirmed  – all three sources give the same value
//   supported  – two sources agree, the third is silent
//   single     – only one source gives a value
//   contested  – two or more sources give different values. No unified value
//                is chosen; every candidate is kept with the sources behind it.
// Nothing is resolved silently: a contested level stays contested in the export.
//
// Building records depends on globals defined in index.html: frags, fgpData,
// normalizePassim, normalizeFgp, normalizeKtiv, classifyFragmentStrict,
// nliViewerUrl, nliImgUrl. The serializers (Turtle, JSON-LD, CSV) need only a
// record, so the record pages under id/ use them with precomputed records.

const GN_BASE = 'https://avichailevy-sys.github.io/geniza-viewer/';
const GN_ID   = GN_BASE + 'id/';     // fragment URIs: id/<IE>/<page>
const GN_NS   = GN_BASE + 'ns#';     // project terms
const GN_VERSION = '0.2';

// Corpus labels (same as CORPUS_LABEL in index.html, repeated here so the
// record pages under id/ can use this file without the viewer).
const GN_CORPUS_LABEL = {
  tanakh: 'Tanakh', mishnah: 'Mishnah', talmud_bavli: 'Talmud Bavli',
  talmud_yerushalmi: 'Jerusalem Talmud', talmud: 'Talmud', liturgy: 'Liturgy',
  mishneh: 'Mishneh Torah', zohar: 'Zohar', midrash: 'Rabbinic / Midrash',
};

// Wikidata items for corpus-level values. Work-level values link to Sefaria.
// Liturgy has no single matching Wikidata item, so it is left unlinked.
const GN_WIKIDATA = {
  tanakh: 'Q83367',            // Tanakh
  mishnah: 'Q191825',          // Mishnah
  talmud_bavli: 'Q28836835',   // Babylonian Talmud
  talmud_yerushalmi: 'Q387422',// Jerusalem Talmud
  talmud: 'Q43290',            // Talmud
  mishneh: 'Q201029',          // Mishneh Torah
  zohar: 'Q2888662',           // Zohar
  midrash: 'Q202344',          // midrash
};
function gnWikidataUrl(corpusKey) {
  const q = GN_WIKIDATA[corpusKey];
  return q ? 'http://www.wikidata.org/entity/' + q : null;
}

const LEVELS = [
  { key: 'corpus',    label: 'Corpus',     term: 'CorpusLevel'    },
  { key: 'subcorpus', label: 'Sub-corpus', term: 'SubCorpusLevel' },
  { key: 'tractate',  label: 'Work',       term: 'WorkLevel'      },
];

const SOURCES = {
  passim: { label: 'passim',  desc: 'Computational text-reuse alignment against Sefaria (D. Smith)', url: 'https://github.com/dasmiq/passim' },
  fgp:    { label: 'FGP',     desc: 'Friedberg Geniza Project domain classification',                url: 'https://fjms.genizah.org/' },
  ktiv:   { label: 'NLI/KTIV', desc: 'National Library of Israel catalogue record (KTIV)',          url: 'https://www.nli.org.il/en/discover/manuscripts/hebrew-manuscripts' },
};

const STATUS_LABEL = {
  confirmed: 'Confirmed (3 sources)',
  supported: 'Supported (2 sources)',
  single:    'Single source',
  contested: 'Contested',
};
const STATUS_ICON = { confirmed: '🟢', supported: '🟢', single: '🟡', contested: '🔴' };

function gnFgpEntry(f) {
  return fgpData[f.alma] || fgpData['0' + f.alma] || fgpData[(f.alma || '').replace(/^0+/, '')];
}

// Merge one level. claims = { passim: v|null, fgp: v|null, ktiv: v|null }
function mergeLevel(claims) {
  const groups = {}; // value -> [source keys]
  for (const [src, v] of Object.entries(claims)) {
    if (v === null || v === undefined || v === '') continue;
    (groups[v] = groups[v] || []).push(src);
  }
  const candidates = Object.entries(groups).map(([value, sources]) => ({ value, sources }));
  candidates.sort((a, b) => b.sources.length - a.sources.length);
  if (candidates.length === 0) return { status: null, value: null, candidates };
  if (candidates.length > 1)   return { status: 'contested', value: null, candidates };
  const n = candidates[0].sources.length;
  return { status: n === 3 ? 'confirmed' : n === 2 ? 'supported' : 'single', value: candidates[0].value, candidates };
}

function unifiedRecord(f) {
  const claims = {
    passim: normalizePassim(f),
    fgp:    normalizeFgp(gnFgpEntry(f)),
    ktiv:   normalizeKtiv(f.title),
  };
  const levels = {};
  for (const L of LEVELS) {
    levels[L.key] = mergeLevel({ passim: claims.passim[L.key], fgp: claims.fgp[L.key], ktiv: claims.ktiv[L.key] });
  }
  const pg = parseInt(f.page, 10);
  return {
    uri: GN_ID + f.ie + '/' + pg,
    ie: f.ie, page: pg, alma: f.alma,
    shelfmark: f.shelfmark || '', library: f.library || '', city: f.city || '',
    catalogueTitle: f.title || '',
    passimCoverage: f.coverage, passimCount: f.count,
    classification: (f.src === 'mishneh_torah') ? null : classifyFragmentStrict(f),
    nliUrl: nliViewerUrl({ alma: f.alma }),
    imgUrl: nliImgUrl({ ie: f.ie, page: pg }),
    claims, levels,
  };
}

// Display value in English (corpus keys → labels)
function gnDisplay(levelKey, v) {
  if (v === null || v === undefined) return null;
  return levelKey === 'corpus' ? (GN_CORPUS_LABEL[v] || v) : v;
}

// Sefaria link for a work, where the naming pattern is reliable.
function gnSefariaUrl(rec) {
  const c = rec.levels.corpus.value, w = rec.levels.tractate.value;
  if (!c || !w) return null;
  const slug = s => s.trim().replace(/\s+/g, '_');
  if (c === 'mishnah')           return 'https://www.sefaria.org/Mishnah_' + slug(w);
  if (c === 'talmud_bavli')      return 'https://www.sefaria.org/' + slug(w);
  if (c === 'talmud_yerushalmi') return 'https://www.sefaria.org/Jerusalem_Talmud_' + slug(w);
  if (c === 'tanakh' || c === 'midrash') return 'https://www.sefaria.org/' + slug(w);
  return null;
}

// ── JSON-LD ────────────────────────────────────────────────────────────────
const GN_CONTEXT = {
  '@vocab': GN_NS,
  gn: GN_NS,
  schema: 'https://schema.org/',
  prov: 'http://www.w3.org/ns/prov#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  dcterms: 'http://purl.org/dc/terms/',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  label: 'rdfs:label',
  seeAlso: { '@id': 'rdfs:seeAlso', '@type': '@id' },
  image: { '@id': 'schema:image', '@type': '@id' },
  about: { '@id': 'schema:about', '@type': '@id' },
  shelfmark: 'schema:identifier',
  heldBy: 'schema:holdingArchive',
  attributedTo: { '@id': 'prov:wasAttributedTo', '@type': '@id' },
  level: { '@type': '@vocab' },
  status: { '@type': '@vocab' },
  classification: { '@type': '@vocab' },
  page: { '@type': 'xsd:integer' },
  passimCoverage: { '@type': 'xsd:decimal' },
};

function sourceNode(key) {
  return { '@id': GN_NS + 'source-' + key, '@type': 'prov:Agent', label: SOURCES[key].label, 'rdfs:comment': SOURCES[key].desc, seeAlso: SOURCES[key].url };
}

function recordToJsonLd(rec) {
  const node = {
    '@id': rec.uri,
    '@type': ['gn:Fragment', 'schema:ArchiveComponent'],
    label: (rec.shelfmark || 'Geniza fragment') + ', image ' + rec.page,
    nliIE: rec.ie, nliALMA: rec.alma, page: rec.page,
    seeAlso: rec.nliUrl,
    image: rec.imgUrl,
  };
  if (rec.shelfmark) node.shelfmark = rec.shelfmark;
  if (rec.library) node.heldBy = rec.library + (rec.city ? ', ' + rec.city : '');
  if (rec.catalogueTitle) node.catalogueTitle = { '@value': rec.catalogueTitle, '@language': 'he' };
  if (rec.passimCoverage) node.passimCoverage = rec.passimCoverage;
  if (rec.classification) node.classification = rec.classification;

  const ids = [];
  for (const L of LEVELS) {
    const m = rec.levels[L.key];
    if (!m.status) continue;
    if (m.value !== null) node['unified' + L.term.replace('Level', '')] = gnDisplay(L.key, m.value);
    m.candidates.forEach((c, i) => {
      ids.push({
        '@id': rec.uri + '#' + L.key + '-' + (i + 1),
        '@type': 'gn:Identification',
        level: L.term,
        value: gnDisplay(L.key, c.value),
        status: m.status,
        attributedTo: c.sources.map(s => GN_NS + 'source-' + s),
        ...(L.key === 'corpus' && gnWikidataUrl(c.value) ? { about: gnWikidataUrl(c.value) } : {}),
      });
    });
  }
  node.hasIdentification = ids;
  const sef = gnSefariaUrl(rec);
  if (sef) node.about = sef;
  return node;
}

function recordsToJsonLdDoc(recs) {
  return {
    '@context': GN_CONTEXT,
    '@graph': [
      {
        '@id': GN_BASE + 'id/catalogue',
        '@type': ['dcterms:Dataset', 'prov:Entity'],
        label: 'GenizaNexus unified identification catalogue',
        'dcterms:description': 'Merged corpus / sub-corpus / work identifications of Cairo Geniza fragments from passim, FGP and NLI/KTIV, with provenance for every claim. Contested levels are not resolved.',
        'dcterms:hasVersion': GN_VERSION,
        'dcterms:created': { '@value': new Date().toISOString().slice(0, 10), '@type': 'xsd:date' },
        'dcterms:source': 'https://doi.org/10.5281/zenodo.21810900',
        'prov:wasDerivedFrom': Object.keys(SOURCES).map(k => ({ '@id': GN_NS + 'source-' + k })),
      },
      ...Object.keys(SOURCES).map(sourceNode),
      ...recs.map(recordToJsonLd),
    ],
  };
}

// ── Turtle ─────────────────────────────────────────────────────────────────
function ttlStr(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '') + '"';
}
const TTL_PREFIXES =
`@prefix gn: <${GN_NS}> .
@prefix schema: <https://schema.org/> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
`;

function ttlHeader() {
  const src = Object.keys(SOURCES).map(k =>
`gn:source-${k} a prov:Agent ;
  rdfs:label ${ttlStr(SOURCES[k].label)} ;
  rdfs:comment ${ttlStr(SOURCES[k].desc)} ;
  rdfs:seeAlso <${SOURCES[k].url}> .`).join('\n\n');
  return TTL_PREFIXES + `
<${GN_BASE}id/catalogue> a dcterms:Dataset, prov:Entity ;
  rdfs:label "GenizaNexus unified identification catalogue" ;
  dcterms:hasVersion ${ttlStr(GN_VERSION)} ;
  dcterms:created "${new Date().toISOString().slice(0, 10)}"^^xsd:date ;
  dcterms:source <https://doi.org/10.5281/zenodo.21810900> ;
  prov:wasDerivedFrom gn:source-passim, gn:source-fgp, gn:source-ktiv .

${src}
`;
}

function recordToTurtle(rec) {
  const L1 = [];
  L1.push(`<${rec.uri}> a gn:Fragment, schema:ArchiveComponent`);
  L1.push(`  rdfs:label ${ttlStr((rec.shelfmark || 'Geniza fragment') + ', image ' + rec.page)}`);
  L1.push(`  gn:nliIE ${ttlStr(rec.ie)}`);
  L1.push(`  gn:nliALMA ${ttlStr(rec.alma)}`);
  L1.push(`  gn:page ${rec.page}`);
  if (rec.shelfmark) L1.push(`  schema:identifier ${ttlStr(rec.shelfmark)}`);
  if (rec.library) L1.push(`  schema:holdingArchive ${ttlStr(rec.library + (rec.city ? ', ' + rec.city : ''))}`);
  if (rec.catalogueTitle) L1.push(`  gn:catalogueTitle ${ttlStr(rec.catalogueTitle)}@he`);
  L1.push(`  rdfs:seeAlso <${rec.nliUrl}>`);
  L1.push(`  schema:image <${rec.imgUrl}>`);
  if (rec.passimCoverage) L1.push(`  gn:passimCoverage "${rec.passimCoverage}"^^xsd:decimal`);
  if (rec.classification) L1.push(`  gn:classification gn:${rec.classification}`);
  const sef = gnSefariaUrl(rec);
  if (sef) L1.push(`  schema:about <${sef}>`);
  const idNodes = [];
  for (const L of LEVELS) {
    const m = rec.levels[L.key];
    if (!m.status) continue;
    if (m.value !== null) L1.push(`  gn:unified${L.term.replace('Level', '')} ${ttlStr(gnDisplay(L.key, m.value))}`);
    m.candidates.forEach((c, i) => {
      const id = `<${rec.uri}#${L.key}-${i + 1}>`;
      L1.push(`  gn:hasIdentification ${id}`);
      idNodes.push(`${id} a gn:Identification ;
  gn:level gn:${L.term} ;
  gn:value ${ttlStr(gnDisplay(L.key, c.value))} ;
  gn:status gn:${m.status} ;${L.key === 'corpus' && gnWikidataUrl(c.value) ? `
  schema:about <${gnWikidataUrl(c.value)}> ;` : ''}
  prov:wasAttributedTo ${c.sources.map(s => 'gn:source-' + s).join(', ')} .`);
    });
  }
  return L1.join(' ;\n') + ' .\n' + (idNodes.length ? '\n' + idNodes.join('\n\n') + '\n' : '');
}

// ── CSV (flat unified catalogue) ───────────────────────────────────────────
function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\t]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function candidatesText(levelKey, m) {
  return m.candidates.map(c => gnDisplay(levelKey, c.value) + ' [' + c.sources.map(s => SOURCES[s].label).join('+') + ']').join(' | ');
}
function recordsToCsv(recs) {
  const head = ['uri', 'nli_ie', 'page', 'nli_alma', 'shelfmark', 'library', 'classification'];
  for (const L of LEVELS) head.push(L.key + '_unified', L.key + '_status', L.key + '_claims');
  head.push('sefaria_url');
  const lines = [head.join(',')];
  for (const r of recs) {
    const row = [r.uri, r.ie, r.page, r.alma, r.shelfmark, r.library, r.classification || 'excluded'];
    for (const L of LEVELS) {
      const m = r.levels[L.key];
      row.push(gnDisplay(L.key, m.value), m.status || '', candidatesText(L.key, m));
    }
    row.push(gnSefariaUrl(r) || '');
    lines.push(row.map(csvCell).join(','));
  }
  return lines.join('\n');
}

// ── Whole catalogue ────────────────────────────────────────────────────────
let unifiedCache = null;
function buildUnifiedCatalogue() {
  if (unifiedCache) return unifiedCache;
  const recs = [];
  for (const f of frags) {
    if (f.src === 'mishneh_torah') continue; // excluded, as in the statistics
    recs.push(unifiedRecord(f));
  }
  const stats = { total: recs.length, byLevel: {} };
  for (const L of LEVELS) {
    const s = { confirmed: 0, supported: 0, single: 0, contested: 0, none: 0 };
    for (const r of recs) s[r.levels[L.key].status || 'none']++;
    stats.byLevel[L.key] = s;
  }
  stats.anyUnified = recs.filter(r => LEVELS.some(L => r.levels[L.key].value !== null)).length;
  unifiedCache = { recs, stats };
  return unifiedCache;
}

function gnDownload(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function downloadCatalogue(fmt) {
  const { recs } = buildUnifiedCatalogue();
  const stamp = new Date().toISOString().slice(0, 10);
  if (fmt === 'csv') return gnDownload(`genizanexus-unified-${stamp}.csv`, '﻿' + recordsToCsv(recs), 'text/csv;charset=utf-8');
  if (fmt === 'ttl') {
    const parts = [ttlHeader()];
    for (const r of recs) parts.push(recordToTurtle(r));
    return gnDownload(`genizanexus-unified-${stamp}.ttl`, parts.join('\n'), 'text/turtle;charset=utf-8');
  }
  if (fmt === 'jsonld') return gnDownload(`genizanexus-unified-${stamp}.jsonld`, JSON.stringify(recordsToJsonLdDoc(recs)), 'application/ld+json');
}

function downloadOne(fmt) {
  if (!selected) return;
  const r = unifiedRecord(selected);
  const name = `genizanexus-${r.ie}-${r.page}`;
  if (fmt === 'ttl') return gnDownload(name + '.ttl', ttlHeader() + '\n' + recordToTurtle(r), 'text/turtle;charset=utf-8');
  return gnDownload(name + '.jsonld', JSON.stringify(recordsToJsonLdDoc([r]), null, 2), 'application/ld+json');
}

// ── UI: unified record block (inside the comparison modal) ────────────────
function gnEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function unifiedBlockHTML(rec, withActions = true) {
  const rows = LEVELS.map(L => {
    const m = rec.levels[L.key];
    if (!m.status) return `<tr><td class="field-name">${L.label}</td><td colspan="2"><span class="silent">— no source speaks —</span></td></tr>`;
    const val = m.value !== null
      ? `<b>${gnEsc(gnDisplay(L.key, m.value))}</b>`
      : m.candidates.map(c => `${gnEsc(gnDisplay(L.key, c.value))} <span class="gn-src">(${c.sources.map(s => SOURCES[s].label).join(' + ')})</span>`).join('<br><i>vs.</i> ');
    const src = m.value !== null ? `<span class="gn-src">from ${m.candidates[0].sources.map(s => SOURCES[s].label).join(' + ')}</span>` : '';
    return `<tr><td class="field-name">${L.label}</td><td>${val} ${src}</td><td class="gn-status gn-${m.status}">${STATUS_ICON[m.status]} ${STATUS_LABEL[m.status]}</td></tr>`;
  }).join('');
  const sef = gnSefariaUrl(rec);
  return `
    <div class="gn-unified">
      <div class="gn-unified-title">🔗 Unified record <a class="gn-uri" href="${rec.uri}" target="_blank" rel="noreferrer">${gnEsc(rec.uri)}</a></div>
      <table class="compare-table gn-table"><tbody>${rows}</tbody></table>
      ${gnLinksHTML(rec)}
      ${withActions ? `<div class="gn-actions">
        <button class="compare-example-btn" onclick="toggleLodPreview('ttl')">Show as Turtle</button>
        <button class="compare-example-btn" onclick="toggleLodPreview('jsonld')">Show as JSON-LD</button>
        <button class="compare-example-btn" onclick="downloadOne('ttl')">⬇ .ttl</button>
        <button class="compare-example-btn" onclick="downloadOne('jsonld')">⬇ .jsonld</button>
      </div>
      <pre id="gn-preview" class="gn-preview" style="display:none"></pre>` : ''}
    </div>`;
}

// Outgoing links: Wikidata (corpus level) and Sefaria (work level).
function gnLinksHTML(rec) {
  const out = [];
  rec.levels.corpus.candidates.forEach(c => {
    const wd = gnWikidataUrl(c.value);
    if (wd) out.push(`Corpus “${gnEsc(gnDisplay('corpus', c.value))}” on Wikidata: <a href="${wd.replace('http://www.wikidata.org/entity/', 'https://www.wikidata.org/wiki/')}" target="_blank" rel="noreferrer">${wd.split('/').pop()}</a>`);
  });
  const sef = gnSefariaUrl(rec);
  if (sef) out.push(`Work on Sefaria: <a href="${sef}" target="_blank" rel="noreferrer">${gnEsc(sef.replace('https://www.sefaria.org/', ''))}</a>`);
  return out.length ? `<div class="gn-link">${out.join(' · ')}</div>` : '';
}

let gnPreviewFmt = null;
function toggleLodPreview(fmt) {
  const el = document.getElementById('gn-preview');
  if (!el || !selected) return;
  if (gnPreviewFmt === fmt && el.style.display !== 'none') { el.style.display = 'none'; gnPreviewFmt = null; return; }
  const r = unifiedRecord(selected);
  el.textContent = fmt === 'ttl'
    ? TTL_PREFIXES + '\n' + recordToTurtle(r)
    : JSON.stringify(recordsToJsonLdDoc([r])['@graph'].slice(-1)[0], null, 2);
  el.style.display = 'block';
  gnPreviewFmt = fmt;
}

// Append the unified block to the existing comparison modal.
(function hookCompareModal() {
  if (typeof frags === 'undefined') return;
  const orig = window.openCompareModal;
  if (typeof orig !== 'function') return;
  window.openCompareModal = function () {
    orig.apply(this, arguments);
    if (!selected) return;
    const box = document.getElementById('compare-modal-content');
    if (box) box.insertAdjacentHTML('beforeend', unifiedBlockHTML(unifiedRecord(selected)));
    gnPreviewFmt = null;
  };
})();

// ── UI: catalogue & export modal ───────────────────────────────────────────
function pct(n, d) { return d ? (100 * n / d).toFixed(1) + '%' : '—'; }

function openUnifiedModal() {
  document.getElementById('unified-modal-overlay').classList.add('open');
  const box = document.getElementById('unified-modal-content');
  box.innerHTML = '<div style="padding:30px;text-align:center;color:#888;font-style:italic">Building unified catalogue…</div>';
  setTimeout(() => {
    const { recs, stats } = buildUnifiedCatalogue();
    const rows = LEVELS.map(L => {
      const s = stats.byLevel[L.key];
      return `<tr><td>${L.label}</td>
        <td class="num">${s.confirmed.toLocaleString()}</td>
        <td class="num">${s.supported.toLocaleString()}</td>
        <td class="num">${s.single.toLocaleString()}</td>
        <td class="num">${s.contested.toLocaleString()}</td>
        <td class="num">${s.none.toLocaleString()}</td></tr>`;
    }).join('');
    box.innerHTML = `
      <p class="gn-p">The unified catalogue merges the three identifications of each fragment into one record.
      At each level (corpus, sub-corpus, work) the record keeps the value, how many sources stand behind it, and which ones.
      Where sources disagree, no value is chosen: all claims are kept and the level is marked <b>contested</b>.
      Each fragment gets a stable address built on its NLI IE number and image number, for example
      <span class="gn-uri">${GN_ID}9346905/2</span>.</p>
      <table class="stats-table">
        <thead><tr><th>Level</th><th>🟢 Confirmed (3)</th><th>🟢 Supported (2)</th><th>🟡 Single source</th><th>🔴 Contested</th><th>No data</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="stats-note">${stats.total.toLocaleString()} fragments (Mishneh Torah fragments excluded, as in the analysis).
      ${stats.anyUnified.toLocaleString()} have a unified value at one level or more.</div>
      <div class="gn-export">
        <div class="compare-examples-label">Download the whole catalogue</div>
        <button class="compare-example-btn" onclick="downloadCatalogue('ttl')">⬇ Linked Data · Turtle (.ttl)</button>
        <button class="compare-example-btn" onclick="downloadCatalogue('jsonld')">⬇ Linked Data · JSON-LD</button>
        <button class="compare-example-btn" onclick="downloadCatalogue('csv')">⬇ Table · CSV</button>
      </div>
      <div class="gn-export">
        <div class="compare-examples-label">Addresses and links</div>
        <a class="compare-example-btn" href="examples.html" target="_blank">📘 Worked examples (English)</a>
        <a class="compare-example-btn" href="${GN_ID}catalogue" target="_blank">Catalogue page</a>
        <a class="compare-example-btn" href="${GN_BASE}ns" target="_blank">Vocabulary</a>
      </div>
      <div class="gn-export">
        <div class="compare-examples-label">Walk through a random example</div>
        <button class="compare-example-btn" onclick="showDemoExample('enrich')">🟡 Sources complete each other</button>
        <button class="compare-example-btn" onclick="showDemoExample('contest')">🔴 Sources disagree</button>
        <button class="compare-example-btn" onclick="showDemoExample('confirm')">🟢 Sources agree</button>
      </div>
      <div id="gn-demo"></div>`;
  }, 30);
}

function closeUnifiedModal(e) {
  if (e === true || (e && e.target === document.getElementById('unified-modal-overlay')))
    document.getElementById('unified-modal-overlay').classList.remove('open');
}

// Example pools for the walkthrough. Prefer fragments with a known shelfmark
// and an image, and with values at the work level, so the example is readable.
let demoPools = null;
function buildDemoPools() {
  const { recs } = buildUnifiedCatalogue();
  const pools = { enrich: [], contest: [], confirm: [] };
  for (const r of recs) {
    if (!r.shelfmark) continue;
    const lv = r.levels;
    const nSources = ['passim', 'fgp', 'ktiv'].filter(s => r.claims[s].corpus).length;
    if (nSources < 2) continue;
    if (lv.corpus.status === 'contested') pools.contest.push(r);
    else if (lv.corpus.status === 'confirmed' && lv.tractate.value && lv.tractate.status !== 'contested') pools.confirm.push(r);
    else if (r.classification === 'enrichment' && lv.tractate.value && lv.corpus.value) pools.enrich.push(r);
  }
  demoPools = pools;
}

function showDemoExample(kind) {
  if (!demoPools) buildDemoPools();
  const pool = demoPools[kind];
  const out = document.getElementById('gn-demo');
  if (!pool || !pool.length) { out.innerHTML = '<div class="stats-note">No example of this kind in the data.</div>'; return; }
  const r = pool[Math.floor(Math.random() * pool.length)];
  const f = frags.find(x => x.ie === r.ie && parseInt(x.page, 10) === r.page);
  if (f) selected = f;
  const srcRows = ['passim', 'fgp', 'ktiv'].map(s => {
    const c = r.claims[s];
    const vals = LEVELS.map(L => c[L.key] ? gnEsc(gnDisplay(L.key, c[L.key])) : '<span class="silent">—</span>');
    return `<tr><td class="field-name">${SOURCES[s].label}</td><td>${vals[0]}</td><td>${vals[1]}</td><td>${vals[2]}</td></tr>`;
  }).join('');
  out.innerHTML = `
    <div class="gn-step"><b>1 · The fragment.</b> ${gnEsc(r.shelfmark)}${r.library ? ', ' + gnEsc(r.library) : ''} · NLI IE ${r.ie}, image ${r.page}
      · <a href="${r.nliUrl}" target="_blank" rel="noreferrer">NLI record</a>
      · <a href="${r.uri}" target="_blank" rel="noreferrer">record page</a>
      · <a href="#" onclick="closeUnifiedModal(true); jumpToExample('${r.ie}', ${r.page}); return false;">open in viewer</a></div>
    <div class="gn-step"><b>2 · What each source says</b> (normalized to English)</div>
    <table class="compare-table gn-table"><thead><tr><th class="field-col">Source</th><th>Corpus</th><th>Sub-corpus</th><th>Work</th></tr></thead><tbody>${srcRows}</tbody></table>
    <div class="gn-step"><b>3 · The unified record</b></div>
    ${unifiedBlockHTML(r, false)}
    <div class="gn-step"><b>4 · As Linked Data</b> (Turtle)</div>
    <pre class="gn-preview">${gnEsc(TTL_PREFIXES + '\n' + recordToTurtle(r))}</pre>`;
}

// Enable the button only once all three sources are loaded, so the
// catalogue is never built from partial data.
(function enableWhenReady() {
  if (typeof frags === 'undefined') return; // record pages under id/ have no viewer
  const t = setInterval(() => {
    const ready = frags.length > 0 && vdLoaded && Object.keys(fgpData).length > 0;
    const b = document.getElementById('unifiedBtn');
    if (ready && b) { b.disabled = false; clearInterval(t); }
  }, 1000);
})();

// Open a fragment from the address bar: index.html?ie=<IE>&page=<page>
// (used by the "open in viewer" links on the record pages).
(function deepLink() {
  if (typeof frags === 'undefined') return;
  const q = new URLSearchParams(location.search);
  const ie = q.get('ie'), pg = parseInt(q.get('page'), 10);
  if (!ie || !pg) return;
  const t = setInterval(() => {
    if (frags.length > 0 && vdLoaded && Object.keys(fgpData).length > 0) {
      clearInterval(t);
      jumpToExample(ie, pg);
    }
  }, 500);
})();
