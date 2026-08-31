const Z=["Arcade","Alley 4","Alley 3","Alley 2","Alley 1"];
const catName={eat:"Eat & drink",groceries:"Groceries",shop:"Shop",service:"Services"};
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];

const OVERRIDES={
  "La Gamba Bar":{
    name:"La Gamba Vermuteria",
    hours:"Mon–Sat 11:00–17:00 · Sun closed",
    alcohol:"serve",
    alcoholText:"Serves alcohol — vermouth, spritzes and other aperitivo-style drinks."
  },
  "Firebrick Brewery":{
    hours:"Mon–Sat 09:00–17:00 · Sun closed",
    alcohol:"both",
    alcoholText:"Serves alcohol on site and sells beer, wine and spirits to take home."
  },
  "Acropolis":{
    hours:"Mon–Thu 10:00–17:00 · Fri–Sat 10:00–17:30 · Sun closed",
    alcohol:"serve",
    alcoholText:"Serves alcohol — the Grainger Market menu includes beer and cider."
  },
  "La Casa Delicatessen":{
    hours:"Mon–Fri 10:00–17:00 · Sat 09:00–17:30 · Sun closed",
    alcohol:"retail",
    alcoholText:"Sells alcohol to take home, including Spanish wine."
  }
};

let activeCat="all";
let selectedId=null;

function viewOf(t){
  const o=OVERRIDES[t.n]||{};
  return {...t,n:o.name||t.n,h:o.hours||t.h,alcohol:o.alcohol||"",alcoholText:o.alcoholText||""};
}

function alcoholBadge(t){
  if(t.alcohol==="serve") return '<span class="badge alcohol">🍺 Serves alcohol</span>';
  if(t.alcohol==="both") return '<span class="badge alcohol">🍺 Serves + takeaway</span>';
  if(t.alcohol==="retail") return '<span class="badge alcohol retail">🍷 Sells alcohol</span>';
  return '';
}

qa('.tab').forEach(b=>b.addEventListener('click',()=>{
  qa('.tab').forEach(x=>x.classList.toggle('on',x===b));
  qa('.view').forEach(v=>v.classList.toggle('on',v.id===b.dataset.v));
}));

function render(){
  q('#lanes').innerHTML=Z.map(z=>`<section class="lane"><h3>${z}</h3><div class="stalls" data-z="${z}"></div>${z==='Alley 2'?'<div class="land">WEIGH HOUSE<br>MARKET OFFICE</div>':''}</section>`).join('');

  T.forEach(raw=>{
    const t=viewOf(raw);
    const h=qa('.stalls').find(x=>x.dataset.z===t.z);
    if(!h)return;
    const b=document.createElement('button');
    b.type='button';
    b.className='stall';
    b.dataset.id=t.id;
    b.dataset.c=t.c;
    b.dataset.alcohol=t.alcohol||'';
    b.setAttribute('aria-pressed','false');
    b.innerHTML=`<span class="unit">Unit ${t.u}</span><span class="sn">${t.n}${t.alcohol?'<span class="alc-dot" aria-label="Alcohol available" title="Alcohol available">●</span>':''}</span>`;
    b.addEventListener('click',()=>toggleTrader(t,b));
    h.appendChild(b);
  });

  U.forEach(raw=>{
    const t=viewOf(raw);
    const b=document.createElement('button');
    b.type='button';
    b.dataset.id=t.id;
    b.textContent=t.n+' · '+t.z;
    b.addEventListener('click',()=>toggleTrader(t,null));
    q('#unplaced').appendChild(b);
  });

  filter();
}

function filter(){
  const s=q('#ms').value.trim().toLowerCase();
  qa('.stall').forEach(b=>{
    const raw=T.find(x=>x.id===b.dataset.id);
    const t=viewOf(raw);
    const catOK=activeCat==='all'||(activeCat==='alcohol'?Boolean(t.alcohol):t.c===activeCat);
    const hay=`${t.n} ${t.u} ${t.z} ${t.d} ${t.alcoholText}`.toLowerCase();
    const ok=catOK&&(!s||hay.includes(s));
    b.classList.toggle('hide',!ok);
    if(!ok&&selectedId===t.id) clearSelection();
  });
}

function toggleTrader(t,anchor){
  if(selectedId===t.id){
    clearSelection();
    return;
  }
  selectTrader(t,anchor);
}

function selectTrader(t,anchor){
  selectedId=t.id;
  qa('.stall').forEach(b=>{
    const on=b.dataset.id===t.id;
    b.classList.toggle('sel',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
  qa('#unplaced button').forEach(b=>b.classList.toggle('sel',b.dataset.id===t.id));
  showBubble(t,anchor);
}

function clearSelection(){
  selectedId=null;
  qa('.stall').forEach(b=>{b.classList.remove('sel');b.setAttribute('aria-pressed','false')});
  qa('#unplaced button').forEach(b=>b.classList.remove('sel'));
  const bubble=q('#mapBubble');
  bubble.hidden=true;
  bubble.classList.remove('below','unplaced');
}

function showBubble(t,anchor){
  const bubble=q('#mapBubble');
  const closed=t.s==='closed'?'<span class="badge closed">Closed</span>':'';
  const verify=t.s==='verify'?'<span class="badge verify">Verify location</span>':'';
  bubble.innerHTML=`
    <button class="bubble-close" type="button" aria-label="Close trader details">×</button>
    <h3>${t.n}</h3>
    <div class="note">${t.z} · Unit ${t.u}</div>
    <div class="bubble-badges"><span class="badge">${catName[t.c]||t.c}</span>${alcoholBadge(t)}${closed}${verify}</div>
    <p class="desc">${t.d}</p>
    <div class="hours"><b>Opening times</b><br>${t.h}</div>
    ${t.alcoholText?`<div class="alcohol-info">${t.alcoholText}</div>`:''}
    ${t.x?`<div class="warn">${t.x}</div>`:''}
    <div class="tap-again">Tap the selected stall again to close this bubble.</div>`;
  bubble.querySelector('.bubble-close').addEventListener('click',clearSelection);
  bubble.hidden=false;

  const plan=q('.plan');
  if(!anchor){
    bubble.classList.add('unplaced');
    bubble.classList.remove('below');
    bubble.style.left='50%';
    bubble.style.top='72px';
    return;
  }

  bubble.classList.remove('unplaced');
  const pr=plan.getBoundingClientRect();
  const br=anchor.getBoundingClientRect();
  const x=br.left-pr.left+(br.width/2);
  const y=br.top-pr.top;
  const pad=170;
  const safeX=Math.max(pad,Math.min(plan.clientWidth-pad,x));
  bubble.style.left=safeX+'px';
  bubble.style.top=(y>230?y:y+br.height)+'px';
  bubble.classList.toggle('below',y<=230);
}

q('#ms').addEventListener('input',filter);
qa('.cat-btn').forEach(b=>b.addEventListener('click',()=>{
  activeCat=b.dataset.cat;
  qa('.cat-btn').forEach(x=>x.classList.toggle('on',x===b));
  filter();
}));
q('.plan').addEventListener('click',e=>{
  if(e.target===q('.plan')) clearSelection();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selectedId)clearSelection()});

render();
