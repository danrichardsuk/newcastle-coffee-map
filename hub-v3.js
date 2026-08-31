const Z=["Arcade","Alley 4","Alley 3","Alley 2","Alley 1"];
const catName={eat:"Eat & drink",groceries:"Groceries",shop:"Shop",service:"Services"};
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];

MARKET_ADDITIONS.forEach(a=>{if(!T.some(t=>t.n===a.n))T.push(a)});

const OVERRIDES={
  "La Gamba Bar":{name:"La Gamba Vermuteria",hours:"Mon–Sat 11:00–17:00 · Sun closed",alcohol:"serve",alcoholText:"Confirmed: serves vermouth, wine, beer and cocktails on premises."},
  "Firebrick Brewery":{hours:"Mon–Sat 09:00–17:00 · Sun closed",alcohol:"both",alcoholText:"Confirmed: drink in or buy craft beer/lager, wine and spirits to take home."},
  "La Casa Delicatessen":{hours:"Mon–Fri 10:00–17:00 · Sat 09:00–17:30 · Sun closed",alcohol:"retail",alcoholText:"Confirmed retail alcohol: Spanish wines and drinks to take home."},
  "Acropolis":{hours:"Mon–Thu 10:00–17:00 · Fri–Sat 10:00–17:30 · Sun closed",alcohol:"",alcoholText:"Alcohol has been reported elsewhere, but current primary evidence was not strong enough to mark the Grainger stall as confirmed alcohol-serving."}
};

let activeCat="all";
let selectedId=null;

function viewOf(t){
  const o=OVERRIDES[t.n]||{};
  const base={...t,n:o.name||t.n,h:o.hours||t.h,alcohol:o.alcohol!==undefined?o.alcohol:"",alcoholText:o.alcoholText||""};
  const r=MARKET_RESEARCH[base.n]||MARKET_RESEARCH[t.n]||null;
  return {...base,research:r};
}
function allTraders(){return [...T,...U].map(viewOf)}
function alcoholBadge(t){
  if(t.alcohol==="serve")return '<span class="badge alcohol">🍺 Serves alcohol</span>';
  if(t.alcohol==="both")return '<span class="badge alcohol">🍺 Serves + takeaway</span>';
  if(t.alcohol==="retail")return '<span class="badge alcohol retail">🍷 Sells alcohol</span>';
  return '';
}
function statusBadges(t){return (t.s==="closed"?'<span class="badge closed">Closed</span>':'')+(t.s==="verify"?'<span class="badge verify">Verify location</span>':'')}
function confidenceBadge(conf){return conf?`<span class="price-confidence ${conf.toLowerCase()}">${conf}</span>`:''}
function itemRows(items,limit){
  if(!items||!items.length)return '<div class="no-prices">No current public item-level price list was verified.</div>';
  const shown=typeof limit==='number'?items.slice(0,limit):items;
  return `<div class="menu-list">${shown.map(i=>`<div class="menu-row"><div><strong>${i.name}</strong><span>${i.context||''}</span></div><div class="menu-price">${i.price||'Price not verified'}${confidenceBadge(i.confidence)}</div></div>`).join('')}</div>`;
}
function researchText(t){return t.research?.detail||t.d}
function searchableText(t){const itemText=(t.research?.items||[]).map(i=>`${i.name} ${i.price} ${i.context}`).join(' ');return `${t.n} ${t.u} ${t.z} ${t.d} ${t.h} ${t.x||''} ${t.alcoholText||''} ${t.research?.detail||''} ${itemText}`.toLowerCase()}
function matchesFilters(t){const s=q('#ms').value.trim().toLowerCase(),catOK=activeCat==='all'||(activeCat==='alcohol'?Boolean(t.alcohol):t.c===activeCat);return catOK&&(!s||searchableText(t).includes(s))}

qa('.tab').forEach(b=>b.addEventListener('click',()=>{qa('.tab').forEach(x=>x.classList.toggle('on',x===b));qa('.view').forEach(v=>v.classList.toggle('on',v.id===b.dataset.v))}));

function renderMarket(){
  q('#lanes').innerHTML=Z.map(z=>`<section class="lane"><h3>${z}</h3><div class="stalls" data-z="${z}"></div>${z==='Alley 2'?'<div class="land">WEIGH HOUSE<br>MARKET OFFICE</div>':''}</section>`).join('');q('#unplaced').innerHTML='';
  T.forEach(raw=>{const t=viewOf(raw),h=qa('.stalls').find(x=>x.dataset.z===t.z);if(!h)return;const b=document.createElement('button');b.type='button';b.className='stall';b.dataset.id=t.id;b.dataset.c=t.c;b.dataset.alcohol=t.alcohol||'';b.setAttribute('aria-pressed','false');b.innerHTML=`<span class="unit">Unit ${t.u}</span><span class="sn">${t.n}${t.alcohol?'<span class="alc-dot" aria-label="Alcohol information available" title="Alcohol information available">●</span>':''}</span>`;b.addEventListener('click',()=>toggleTrader(t,b));h.appendChild(b)});
  U.forEach(raw=>{const t=viewOf(raw),b=document.createElement('button');b.type='button';b.dataset.id=t.id;b.textContent=t.n+' · '+t.z;b.addEventListener('click',()=>toggleTrader(t,null));q('#unplaced').appendChild(b)});
  filterMarket();
}
function filterMarket(){
  qa('.stall').forEach(b=>{const raw=T.find(x=>x.id===b.dataset.id),t=viewOf(raw),ok=matchesFilters(t);b.classList.toggle('hide',!ok);if(!ok&&selectedId===t.id)clearSelection()});
  qa('#unplaced button').forEach(b=>{const raw=U.find(x=>x.id===b.dataset.id);if(!raw)return;const t=viewOf(raw),ok=matchesFilters(t);b.classList.toggle('hide',!ok);if(!ok&&selectedId===t.id)clearSelection()});
  renderDirectory();
}
function toggleTrader(t,anchor){selectedId===t.id?clearSelection():selectTrader(t,anchor)}
function selectTrader(t,anchor){selectedId=t.id;qa('.stall').forEach(b=>{const on=b.dataset.id===t.id;b.classList.toggle('sel',on);b.setAttribute('aria-pressed',on?'true':'false')});qa('#unplaced button').forEach(b=>b.classList.toggle('sel',b.dataset.id===t.id));renderDirectory();showBubble(t,anchor)}
function clearSelection(){selectedId=null;qa('.stall').forEach(b=>{b.classList.remove('sel');b.setAttribute('aria-pressed','false')});qa('#unplaced button').forEach(b=>b.classList.remove('sel'));const bubble=q('#mapBubble');bubble.hidden=true;bubble.classList.remove('below','unplaced');renderDirectory()}
function centreAnchor(anchor){if(!anchor)return;const wrap=q('.wrap'),plan=q('.plan'),pr=plan.getBoundingClientRect(),br=anchor.getBoundingClientRect(),centre=(br.left-pr.left)+(br.width/2),target=Math.max(0,Math.min(wrap.scrollWidth-wrap.clientWidth,centre-(wrap.clientWidth/2)));wrap.scrollTo({left:target,behavior:'smooth'})}
function showBubble(t,anchor){
  const r=t.research,bubble=q('#mapBubble');bubble.innerHTML=`<button class="bubble-close" type="button" aria-label="Close trader details">×</button><h3>${t.n}</h3><div class="note">${t.z} · Unit ${t.u}</div><div class="bubble-badges"><span class="badge">${catName[t.c]||t.c}</span>${alcoholBadge(t)}${statusBadges(t)}</div><p class="desc">${researchText(t)}</p><div class="hours"><b>Opening times</b><br>${t.h}</div>${r?`<div class="bubble-menu"><b>Menu / price highlights</b>${itemRows(r.items,3)}${r.items?.length>3?'<span class="more-below">More in the detailed section below ↓</span>':''}</div>`:''}${t.alcoholText?`<div class="alcohol-info">${t.alcoholText}</div>`:''}${t.x?`<div class="warn">${t.x}</div>`:''}<div class="tap-again">Tap the selected stall again to close this bubble.</div>`;bubble.querySelector('.bubble-close').addEventListener('click',clearSelection);bubble.hidden=false;
  const plan=q('.plan');if(!anchor){bubble.classList.add('unplaced');bubble.classList.remove('below');bubble.style.left='50%';bubble.style.top='72px';return}bubble.classList.remove('unplaced');const pr=plan.getBoundingClientRect(),br=anchor.getBoundingClientRect(),x=br.left-pr.left+(br.width/2),y=br.top-pr.top,pad=165,safeX=Math.max(pad,Math.min(plan.clientWidth-pad,x));bubble.style.left=safeX+'px';bubble.style.top=(y>260?y:y+br.height)+'px';bubble.classList.toggle('below',y<=260);centreAnchor(anchor)
}
function directoryCard(t){
  const r=t.research;return `<details class="directory-card${selectedId===t.id?' selected':''}" data-id="${t.id}" ${selectedId===t.id?'open':''}><summary><div><span class="directory-zone">${t.z} · Unit ${t.u}</span><strong>${t.n}</strong></div><div class="summary-badges"><span class="badge">${catName[t.c]||t.c}</span>${alcoholBadge(t)}${statusBadges(t)}</div></summary><div class="directory-body"><p>${researchText(t)}</p><div class="directory-hours"><b>Opening times</b><span>${t.h}</span></div>${r?`<div class="research-block"><div class="research-title"><b>Items & prices</b><span>Verified ${r.verified||RESEARCH_VERIFIED_DATE}</span></div>${itemRows(r.items)}<a class="source-link" href="${r.source}" target="_blank" rel="noopener">Source: ${r.sourceLabel||'research source'} ↗</a></div>`:`<div class="research-block"><div class="research-title"><b>Items & prices</b></div><div class="no-prices">Detailed product information is shown above; no reliable current public item-level price list was found during this research pass.</div></div>`}${r?.alcoholNote?`<div class="caution-info">${r.alcoholNote}</div>`:''}${t.alcoholText?`<div class="directory-extra alcohol-info">${t.alcoholText}</div>`:''}${t.x?`<div class="directory-extra warn">${t.x}</div>`:''}<button type="button" class="locate-btn" data-locate="${t.id}">${selectedId===t.id?'Deselect trader':'Show on indoor map'}</button></div></details>`
}
function renderDirectory(){
  const all=allTraders(),visible=selectedId?all.filter(t=>t.id===selectedId):all.filter(matchesFilters);q('#directoryCount').textContent=selectedId?'1 selected trader':`${visible.length} trader${visible.length===1?'':'s'} shown`;q('#traderDirectory').innerHTML=visible.length?visible.map(directoryCard).join(''):'<div class="directory-empty">No traders match the current filters.</div>';qa('.locate-btn').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const t=all.find(x=>x.id===btn.dataset.locate);if(!t)return;const anchor=q(`.stall[data-id="${t.id}"]`);toggleTrader(t,anchor);if(anchor&&selectedId===t.id)setTimeout(()=>anchor.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}),80)}))
}
function coffeeCard(c){return `<details class="coffee-detail-card"><summary><div><span class="coffee-rank">#${c.rank}</span><strong>${c.name}</strong><span>${c.area}</span></div><span class="detail-chevron">Details</span></summary><div class="coffee-detail-body"><p>${c.summary}</p><div class="directory-hours"><b>Opening times</b><span>${c.hours}</span></div><div class="research-block"><div class="research-title"><b>Menu / price highlights</b><span>Verified ${RESEARCH_VERIFIED_DATE}</span></div>${itemRows(c.items)}<a class="source-link" href="${c.source}" target="_blank" rel="noopener">Source: ${c.sourceLabel} ↗</a></div></div></details>`}
function renderCoffeeDirectory(){q('#coffeeDirectory').innerHTML=COFFEE_DETAILS.map(coffeeCard).join('');q('#coffeeResearchCount').textContent=`${COFFEE_DETAILS.length} cafés · researched ${RESEARCH_VERIFIED_DATE}`}

q('#ms').addEventListener('input',filterMarket);qa('.cat-btn').forEach(b=>b.addEventListener('click',()=>{activeCat=b.dataset.cat;qa('.cat-btn').forEach(x=>x.classList.toggle('on',x===b));filterMarket()}));q('.plan').addEventListener('click',e=>{if(e.target===q('.plan'))clearSelection()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selectedId)clearSelection()});
renderMarket();renderCoffeeDirectory();
