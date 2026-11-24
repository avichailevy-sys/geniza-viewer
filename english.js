// ── English demo mode inside the viewer ─────────────────────────────────────
// For two example fragments, the Transcription and Sefaria panels can switch to
// an English rendering, with a word-level diff. The English follows the real
// differences: identical where the Hebrew/Aramaic agrees, different where it
// differs; misspelled words stand for transcription (HTR) errors. It is an
// illustration for audiences who do not read Hebrew; the image stays the real one.

const GN_EN_TEXTS = {
  '9284612/2': {
    ref: 'Mishnah Berakhot 1:1–2',
    fragEn: "From when do we recite the Shema in the evenings? From the time that the priests enter to eat their terumah, until the ond of the first watch, the words of Rabbi Eliezer. And the Sages say: until midnight. Rabban Gamliel says: until the dawn rises. It once happened that his sons came back from a wedding feast. They said to him: we have not recited the Shema. He said to them: jf the dawn has not risen, you are permitted to recite. And not only this, but all the Sages said until midnight, their commandment is until the dawm rises. The burning of fats and limbs and the eating of the Passover offerings, their commandment is until the dawn rises. All that is eaten for one day, their commandment is until the dawn rises. If so, why did the Sages say until midnight? But to keep a person far from transgression. From when do we recite the Shema in the mornings? From when they can distinguish between blue and white. Rabbi Fliezer says: between blue and leek-greem until sunrise. Rabbi Yehoshua says: until three hours, for such is the way of the sons of",
    sefEn: "From when do we recite the Shema in the evening? From the time that the priests enter to eat their terumah, until the end of the first watch, the words of Rabbi Eliezer. And the Sages say: until midnight. Rabban Gamliel says: until the dawn rises. It once happened that his sons came back from a wedding feast. They said to him: we have not recited the Shema. He said to them: if the dawn has not risen, you are obligated to recite. And not only this, but all that the Sages said until midnight, their commandment is until the dawn rises. The burning of fats and limbs, their commandment is until the dawn rises. And all that is eaten for one day, their commandment is until the dawn rises. If so, why did the Sages say until midnight? In order to keep a person far from transgression. From when do we recite the Shema in the morning? From when one can distinguish between blue and white. Rabbi Eliezer says: between blue and leek-green. And he completes it until sunrise. Rabbi Yehoshua says: until three hours, for such is the way of the sons of",
  },
  '9285063/4': {
    ref: 'Deuteronomy 4:1–7',
    fragEn: "I- and cone and p[ ] land [ ]hich the LORD, the G[ ] fathers ygives yov. You shall not add to the word wh[ I command you, nor shall you take away from it, to keeq the commandments of the LORD your God which I command you. Your eyes have seen ⟦all⟧ what the LORD did at Baal-peor; for every man that followed Baal-peor, the LORD your God has destroyed him from among you. But you that cleave to the LORD your God are alive every one of you this day. Behold, I have taught you statutes and ordinances, as the LORD my God commanded me, that you should do so in the midst of the land which you go to possess. Observe therefore and do them; for this is your wisdom and your understanding in the sight of the peoples, that, when they hear all these statutes, shall say: Surely this great nation is a wice and understanding people. For what great nation is there, that has God so near unto them, as the LORD",
    sefEn: "and come and possess the land which the LORD, the God of your fathers, gives you. You shall not add to the word which I command you, nor shall you take away from it, to keep the commandments of the LORD your God which I command you. Your eyes have seen what the LORD did at Baal-peor; for every man that followed Baal-peor, the LORD your God has destroyed him from among you. But you that cleave to the LORD your God are alive every one of you this day. Behold, I have taught you statutes and ordinances, as the LORD my God commanded me, that you should do so in the midst of the land which you go to possess. Observe therefore and do them; for this is your wisdom and your understanding in the sight of the peoples, that, when they hear all these statutes, shall say: Surely this great nation is a wise and understanding people. For what great nation is there, that has God so near unto them, as the LORD",
  },
  '36762586/7': {
    ref: 'Bavli Sukkah 43a',
    fragHe: "וסוכה גופא מנא לן דתנו רבנן כסוכות תשבו שבעת ימים ימים ואפלו לילות אתה אומ' ימים ואפלו לילות או אינו ימים ולא לילות ודין הוא נאמר כאן ימים ונאמר בלולב ימים גוה להלן ימים ולא לילות אף כאן ⟦/⟧ ימים ולא לילות או כלך לדרך זו נאמר כאן ימים ונאמר במלואים ימים מה להלן ימים ואפלו לולות אף כאן ימים ואפלו לילות נראה למידומה דנין דבר שמצות כל היום מדבר שמצותו כל היום ואל יוכיח לולב שמצותו שעה אחת אי כלך לדרך זו דנין דבר שנוהג לדורות מדבר שנוהג לדורות ואל יוכיחו מלואים שאין נוהגין לדורות ת'ל' תשבו תשבו לגזרה שוה נאמר כאן תשבו ונאמר להלן כמלואים תשבו מה להלן ימים ואפלו לילות אף כאן ימים ואפלו לילות",
    sefHe: "וסוכה גופה מנלן? דתנו רבנן: בסוכות תשבו שבעת ימים, ימים — ואפילו לילות. אתה אומר ימים — ואפילו לילות, או אינו אלא ימים ולא לילות? ודין הוא: נאמר כאן ימים, ונאמר בלולב ימים, מה להלן — ימים ולא לילות, אף כאן — ימים ולא לילות. או כלך לדרך זו: נאמר כאן ימים ונאמר במלואים ימים. מה להלן — ימים ואפילו לילות, אף כאן — ימים ואפילו לילות. נראה למי דומה: דנין דבר שמצותו כל היום מדבר שמצותו כל היום, ואל יוכיח דבר שמצותו שעה אחת. או כלך לדרך זו: דנין דבר שמצותו לדורות מדבר שמצותו לדורות, ואל יוכיחו מלואים שאין נוהגין לדורות. תלמוד לומר: תשבו תשבו — לגזרה שוה. נאמר כאן תשבו, ונאמר במלואים תשבו. מה להלן — ימים ואפילו לילות, אף כאן — ימים ואפילו לילות.",
    fragEn: "And the sukkah itself, from where do we derive it? As the Rabbis taught: “Ln booths you shall dwell seven days”: days, and even nights. You say days and even nights, or is it days and not nights? It is logical: it says here “days”, and it says of the lulav “days”; jvst as there, days and not nights, so too here [/] days and not nights. Or go this way: it says here “days”, and it says of the ordination “days”; just as there, days and even nigbts, so too here, days and even nights. Let us see whomit resembles: we derive a thing whose commandmen lasts all day from a thing whose commandment lasts all day, and let the lulav, whose commandment is for one hour, not prove otherwise. If go this way: we derive a thing that is practised for all generations from a thing that is practised for all generations, and let the ordination, which is not practised for all generations, not prove otherwise. The verse says “you shall dwell”, “you shall dwell”, for a verbal analogy: it says here “you shall dwell”, and it says there ln the ordination “you shall dwell”; just as there, days and even nights, so too here, days and even nights.",
    sefEn: "And the sukkah itself, from where do we derive it? As the Rabbis taught: “In booths you shall dwell seven days”: days, and even nights. You say days and even nights, or is it only days and not nights? It is logical: it says here “days”, and it says of the lulav “days”; just as there, days and not nights, so too here, days and not nights. Or go this way: it says here “days”, and it says of the ordination “days”; just as there, days and even nights, so too here, days and even nights. Let us see whom it resembles: we derive a thing whose commandment lasts all day from a thing whose commandment lasts all day, and let a thing whose commandment is for one hour not prove otherwise. Or go this way: we derive a thing whose commandment is for all generations from a thing whose commandment is for all generations, and let the ordination, which is not practised for all generations, not prove otherwise. The verse says “you shall dwell”, “you shall dwell”, for a verbal analogy: it says here “you shall dwell”, and it says of the ordination “you shall dwell”; just as there, days and even nights, so too here, days and even nights.",
    notes: [
      ['Real variant', '“let <b>the lulav</b>, whose commandment is for one hour” where Sefaria has “let <b>a thing</b> whose commandment…”'],
      ['Real variant', '“a thing <b>that is practised</b> for all generations” where Sefaria has “a thing <b>whose commandment is</b> for all generations”'],
      ['Real variant', 'the fragment lacks “only” (“or is it days…”), and adds “there” (“it says there in the ordination”)'],
      ['Transcription error', '“Ln”, “jvst”, “nigbts”, “whomit”, “commandmen”: letters misread or words run together by the HTR model, e.g. <span class="he">כסוכות</span> for <span class="he">בסוכות</span>, <span class="he">גוה</span> for <span class="he">מה</span>'],
      ['Variant or misreading', '“If go” where Sefaria has “Or go” (<span class="he">אי</span> for <span class="he">או</span>)'],
      ['Mark in the transcription', '[/] is a mark the transcriber kept from the manuscript'],
    ],
  },
  '161475434/2': {
    ref: 'Amos 5:14–15',
    fragHe: "אתכם כאשר אמרתם סנאו רע ואהבו טובי[ והציגו השער משפט אולי חנן יהוה אלהי צבאות צארית יוסף",
    sefHe: "אתכם כאשר אמרתם שנאו רע ואהבו טוב והציגו בשער משפט אולי יחנן יהוה אלהי צבאות שארית יוסף",
    fragEn: "with you, as you have said. Hale evil and love goodi[ and establish justice the gate; perhaps the LORD, the God of hosts, will be racious to the remmant of Joseph.",
    sefEn: "with you, as you have said. Hate evil and love good, and establish justice in the gate; perhaps the LORD, the God of hosts, will be gracious to the remnant of Joseph.",
    notes: [
      ['Transcription error', '“Hale”, “goodi[”, “remmant”: letters misread by the HTR model (<span class="he">סנאו</span> for <span class="he">שנאו</span>, <span class="he">צארית</span> for <span class="he">שארית</span>); “[” marks damage'],
      ['Missing letter', '“the gate” for “in the gate” and “racious” for “gracious”: the first letter is missing (<span class="he">השער</span> for <span class="he">בשער</span>, <span class="he">חנן</span> for <span class="he">יחנן</span>), from damage or misreading'],
      ['What this means', 'The words are Amos almost exactly, though the catalogue and FGP call the fragment liturgical poetry (piyyut). It may be a poem quoting Amos, or a page of Amos. The record keeps both claims.'],
    ],
  },
};


let gnEnglish = false;

function gnEnKey(f) { return f ? f.ie + '/' + parseInt(f.page, 10) : ''; }
function gnEnFor(f) { return GN_EN_TEXTS[gnEnKey(f)] || null; }
function gnEsc2(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Word-level comparison (longest common subsequence), ignoring case and punctuation.
function gnEnDiffHTML(frag, sef) {
  const A = frag.split(/\s+/).filter(Boolean), B = sef.split(/\s+/).filter(Boolean);
  const norm = w => w.toLowerCase().replace(/[“”"‘’',.;:?!()]/g, '');
  const na = A.map(norm), nb = B.map(norm), n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i][j] = na[i] === nb[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  const same = w => `<span style="color:#217a47">${gnEsc2(w)}</span>`;
  const onlyFrag = w => `<span style="background:#fde7b0;color:#6a4a00;border-radius:2px;padding:0 2px">${gnEsc2(w)}</span>`;
  const onlySef = w => `<span style="color:#c04000;text-decoration:line-through">${gnEsc2(w)}</span>`;
  while (i < n && j < m) {
    if (na[i] === nb[j]) { out.push(same(B[j])); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) out.push(onlyFrag(A[i++]));
    else out.push(onlySef(B[j++]));
  }
  while (i < n) out.push(onlyFrag(A[i++]));
  while (j < m) out.push(onlySef(B[j++]));
  return out.join(' ');
}

const GN_EN_NOTE = `<div style="background:#eef4fa;border:1px solid #c9dcef;border-radius:5px;padding:6px 10px;margin-bottom:8px;font-size:10px;color:#1F5C99">
  🇬🇧 English rendering for illustration. Where the manuscript and Sefaria agree the English is identical; where they differ it differs. Misspelled words stand for transcription errors.</div>`;

function gnApplyEnglishTx(f) {
  const t = gnEnFor(f), btn = document.getElementById('enToggle');
  if (btn) {
    btn.style.display = t ? '' : 'none';
    btn.innerHTML = gnEnglish ? 'עב <span>Original text</span>' : '🇬🇧 <span>English</span>';
  }
  if (!t || !gnEnglish) return;
  const body = document.getElementById('txBody');
  const heb = [...body.querySelectorAll(':scope > div')].filter(d => (d.getAttribute('style') || '').includes('direction:rtl')).pop();
  if (!heb) return;
  heb.outerHTML = GN_EN_NOTE + `<div style="font-size:10px;color:#888;margin-bottom:4px">The passage matched to ${gnEsc2(t.ref)} (part of the page)</div>
    <div style="font-family:'Source Serif 4',Georgia,serif;font-size:16px;line-height:1.9;color:#111;direction:ltr;text-align:left">${gnEsc2(t.fragEn)}</div>`;
}

function gnApplyEnglishSef(f) {
  const t = gnEnFor(f);
  if (!t || !gnEnglish) return;
  const ref = (typeof buildSefariaRef === 'function') ? buildSefariaRef(f) : null;
  document.getElementById('sefBody').innerHTML = `
    ${GN_EN_NOTE}
    <div style="margin-bottom:14px;border-bottom:1px solid #f0f0e8;padding-bottom:12px">
      <div style="font-size:10px;color:#888;font-family:monospace;margin-bottom:4px">${gnEsc2(t.ref)}</div>
      <div id="en-sef-text" style="font-family:'Source Serif 4',Georgia,serif;font-size:15px;line-height:1.9;color:#111">${gnEsc2(t.sefEn)}</div>
      <div id="en-sef-diff" style="display:none;font-family:'Source Serif 4',Georgia,serif;font-size:15px;line-height:1.9">${gnEnDiffHTML(t.fragEn, t.sefEn)}
        <div style="font-size:10px;color:#888;margin-top:8px;font-family:monospace">
          <span style="color:#217a47">same</span> ·
          <span style="background:#fde7b0;color:#6a4a00;padding:0 2px">only in the fragment</span> ·
          <span style="color:#c04000;text-decoration:line-through">only in Sefaria</span></div>
      </div>
      <button onclick="gnToggleEnDiff(this)" style="font-size:9px;color:#aaa;background:none;border:1px solid #ddd;border-radius:3px;padding:2px 6px;cursor:pointer;margin-top:4px">⟺ diff</button>
    </div>
    ${ref ? `<a class="sef-link" href="https://www.sefaria.org/${ref}" target="_blank" rel="noreferrer">Read full text on Sefaria →</a>` : ''}`;
}

function gnToggleEnDiff(btn) {
  const a = document.getElementById('en-sef-text'), b = document.getElementById('en-sef-diff');
  const showDiff = b.style.display === 'none';
  a.style.display = showDiff ? 'none' : 'block';
  b.style.display = showDiff ? 'block' : 'none';
  btn.textContent = showDiff ? '⟺ text' : '⟺ diff';
}

function gnToggleEnglish() {
  gnEnglish = !gnEnglish;
  if (selected) { showTranscription(selected); showSefaria(selected); }
}

// Header buttons: open an example fragment directly in English.
function gnEnglishExample(ie, pg) {
  const f = frags.find(x => x.ie === ie && parseInt(x.page, 10) === pg);
  if (!f) { alertless('Data still loading, try again in a moment'); return; }
  gnEnglish = true;
  selectFrag(f);
  const row = document.querySelector('.frag-row.selected');
  if (row) row.scrollIntoView({ block: 'center' });
}
function alertless(msg) {
  const b = document.getElementById('recCount'); if (b) { const o = b.textContent; b.textContent = msg; setTimeout(() => b.textContent = o, 2500); }
}

(function hookEnglish() {
  if (typeof frags === 'undefined') return;
  const oTx = window.showTranscription, oSef = window.showSefaria;
  window.showTranscription = function (f) { oTx.apply(this, arguments); try { gnApplyEnglishTx(f); } catch (e) { console.warn(e); } };
  window.showSefaria = function (f) { oSef.apply(this, arguments); try { gnApplyEnglishSef(f); } catch (e) { console.warn(e); } };
})();
