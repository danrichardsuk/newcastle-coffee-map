/* V4 source actions: turn provenance links into useful, honest user actions. */
(function(){
  function actionMeta(link){
    let u;
    try{ u=new URL(link.href,location.href); }catch(e){ return {label:'Open source',context:'Research source',icon:'↗'}; }
    const host=u.hostname.replace(/^www\./,'').toLowerCase();
    const path=u.pathname.toLowerCase();
    const original=(link.textContent||'').toLowerCase();

    if(host.includes('deliveroo.')) return {label:'Order on Deliveroo',context:'Delivery menu · prices may differ in-store',icon:'🛵'};
    if(host.includes('just-eat.')) return {label:'Order on Just Eat',context:'Delivery menu · prices may differ in-store',icon:'🛵'};
    if(host.includes('ubereats.')) return {label:'Order on Uber Eats',context:'Delivery menu · prices may differ in-store',icon:'🛵'};
    if(path.endsWith('.pdf') && (original.includes('menu')||path.includes('menu'))) return {label:'View official menu',context:'Menu PDF',icon:'📋'};
    if(original.includes('official') && original.includes('menu')) return {label:'View official menu',context:'Official menu / prices',icon:'📋'};
    if(path.includes('/menu')) return {label:'View menu & prices',context:'Online menu',icon:'📋'};
    if(path.includes('/shop')||original.includes('online shop')||original.includes('shop')) return {label:'Shop online',context:'Online shop / current retail range',icon:'🛍️'};
    if(host.includes('ourgraingermarket.co.uk')){
      if(path.includes('/traders/')) return {label:'View official trader page',context:'Grainger Market listing',icon:'🏛️'};
      return {label:'View Grainger Market info',context:'Official market information',icon:'🏛️'};
    }
    if(host.includes('getintonewcastle.co.uk')) return {label:'View venue listing',context:'Newcastle venue information',icon:'📍'};
    if(original.includes('official')) return {label:'Visit official website',context:'Official business source',icon:'🌐'};
    if(original.includes('recent')||original.includes('guide')||original.includes('research')) return {label:'View research source',context:'Supporting source / observed prices',icon:'🔎'};
    return {label:'Visit website',context:'Business / source website',icon:'🌐'};
  }

  function enhanceLink(link){
    if(!link || link.dataset.actionEnhanced==='1') return;
    const meta=actionMeta(link);
    link.dataset.actionEnhanced='1';
    link.classList.add('source-action');
    link.innerHTML=`<span class="source-action-icon" aria-hidden="true">${meta.icon}</span><span class="source-action-copy"><strong>${meta.label}</strong><small>${meta.context}</small></span><span class="source-action-arrow" aria-hidden="true">↗</span>`;
    link.setAttribute('aria-label',`${meta.label} — ${meta.context}`);
  }

  function enhanceAll(){
    document.querySelectorAll('a.source-link').forEach(enhanceLink);
  }

  function addBubbleAction(){
    const bubble=document.querySelector('#mapBubble');
    if(!bubble || bubble.hidden || bubble.querySelector('.bubble-source-action')) return;
    try{
      if(typeof selectedId==='undefined' || !selectedId || typeof allTraders!=='function') return;
      const trader=allTraders().find(t=>t.id===selectedId);
      const r=trader && trader.research;
      if(!r || !r.source) return;
      const a=document.createElement('a');
      a.className='source-link bubble-source-action';
      a.href=r.source;
      a.target='_blank';
      a.rel='noopener';
      a.textContent=`Source: ${r.sourceLabel||'research source'} ↗`;
      const closeHint=bubble.querySelector('.tap-again');
      bubble.insertBefore(a,closeHint||null);
      enhanceLink(a);
    }catch(e){ /* V4 enhancement should never break the core map. */ }
  }

  let scheduled=false;
  function scheduleEnhance(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      enhanceAll();
      addBubbleAction();
    });
  }

  const observer=new MutationObserver(scheduleEnhance);
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  scheduleEnhance();
})();
