/* V5 Explorer Scores: confidence-aware scoring UI for food & drink venues. */
(function(){
  const dims=[['quality','Quality'],['value','Value'],['service','Service'],['variety','Variety'],['atmosphere','Atmosphere'],['reliability','Reliability']];
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  function confLabel(c){return c>=.80?'High confidence':c>=.60?'Medium confidence':'Limited evidence';}
  function scoreMarkup(name,compact=false){
    const s=explorerScoreFor(name); if(!s)return '';
    if(!s.publish){
      return `<div class="explorer-score explorer-score--withheld${compact?' compact':''}" title="${esc(s.why)}"><strong>${esc(s.hold||'Not scored yet')}</strong><span>${confLabel(s.confidence)}</span></div>`;
    }
    return `<div class="explorer-score${compact?' compact':''}" aria-label="Explorer Score ${s.score} out of 5"><strong>★ ${s.score.toFixed(1)}</strong><span>Explorer Score · ${confLabel(s.confidence)}</span></div>`;
  }
  function dimensionsMarkup(s){
    return `<div class="score-dimensions">${dims.map(([k,label])=>{
      const v=s.d[k];
      if(v==null)return `<div class="score-dim score-dim-na"><span>${label}</span><b>N/A</b></div>`;
      return `<div class="score-dim"><span>${label}</span><div class="score-meter"><i style="width:${Math.max(0,Math.min(100,v/5*100))}%"></i></div><b>${v.toFixed(1)}</b></div>`;
    }).join('')}</div>`;
  }
  function reviewLinks(s){
    if(!s.reviews?.length)return '';
    return `<div class="score-review-links">${s.reviews.map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)} ↗</a>`).join('')}</div>`;
  }
  function hygieneMarkup(s){
    if(!s.hygiene)return '';
    return `<a class="hygiene-card hygiene-${s.hygiene.level}" href="${esc(s.hygiene.url)}" target="_blank" rel="noopener"><strong>${esc(s.hygiene.label)}</strong><span>${esc(s.hygiene.detail)} · official source ↗</span></a>`;
  }
  function fullScoreCard(name){
    const s=explorerScoreFor(name); if(!s)return '';
    if(!s.publish){
      return `<section class="explorer-scorecard explorer-scorecard--withheld" data-score-name="${esc(name)}"><div class="scorecard-top">${scoreMarkup(name)}<span class="score-checked">Evidence checked ${EXPLORER_SCORE_CHECKED}</span></div><p>${esc(s.why)}</p>${hygieneMarkup(s)}${reviewLinks(s)}<p class="score-method-short">A numeric Explorer Score has been calculated internally for monitoring, but is deliberately not published until the evidence threshold is met or the current data concern is resolved.</p></section>`;
    }
    return `<section class="explorer-scorecard" data-score-name="${esc(name)}"><div class="scorecard-top">${scoreMarkup(name)}<span class="score-checked">Checked ${EXPLORER_SCORE_CHECKED}</span></div><p>${esc(s.why)}</p>${hygieneMarkup(s)}<details class="score-why"><summary>Why this score?</summary>${dimensionsMarkup(s)}<p class="score-method-short">Quality 35% · Value 20% · Service 15% · Variety 10% · Atmosphere 10% · Reliability 10%. Low-volume ratings are statistically adjusted; N/A dimensions are renormalised.</p>${reviewLinks(s)}</details></section>`;
  }
  function methodology(){
    return `<details class="score-methodology"><summary>★ How Explorer Scores work</summary><div><p><b>Explorer Score</b> is a Newcastle Explorer synthesis, not a copied Google rating. It combines independent customer-review evidence with current menu/value evidence and reliability.</p><p><b>Weights:</b> Quality 35% · Value 20% · Service 15% · Variety 10% · Atmosphere 10% · Reliability 10%.</p><p>Low-review ratings are shrunk toward a local prior so six perfect reviews do not automatically outrank hundreds of very strong reviews. Headline scores are normally shown only from <b>0.60 confidence</b> upwards. Food-hygiene ratings remain separate statutory information.</p><span>Scores checked ${EXPLORER_SCORE_CHECKED}</span></div></details>`;
  }
  function nameFromCoffee(card){return card.querySelector('summary strong')?.textContent.trim()||'';}
  function nameFromMarket(card){return card.querySelector('summary strong')?.textContent.trim()||'';}
  function enhanceCoffee(){
    document.querySelectorAll('.coffee-detail-card').forEach(card=>{
      const name=nameFromCoffee(card),s=explorerScoreFor(name); if(!s)return;
      const summary=card.querySelector('summary');
      if(summary&&!summary.querySelector('.explorer-summary-score')) summary.insertAdjacentHTML('beforeend',`<span class="explorer-summary-score">${scoreMarkup(name,true)}</span>`);
      const body=card.querySelector('.coffee-detail-body');
      if(body&&!body.querySelector('.explorer-scorecard')) body.insertAdjacentHTML('afterbegin',fullScoreCard(name));
    });
  }
  function embeddedScoreMarkup(name){
    const s=explorerScoreFor(name); if(!s)return '';
    if(!s.publish)return `<span class="hub-explorer-score hub-explorer-score--withheld"><b>${esc(s.hold||'Not scored yet')}</b><small>${confLabel(s.confidence)}</small></span>`;
    return `<span class="hub-explorer-score" aria-label="Explorer Score ${s.score} out of 5"><b>★ ${s.score.toFixed(1)}</b><small>Explorer Score · ${confLabel(s.confidence)}</small></span>`;
  }
  function decorateEmbeddedCoffee(doc){
    if(!doc)return;
    if(!doc.getElementById('hub-explorer-score-style')){
      const style=doc.createElement('style');
      style.id='hub-explorer-score-style';
      style.textContent=`
        .hub-explorer-score{display:inline-flex;align-items:center;gap:7px;margin:9px 0 0 40px;padding:6px 9px;border:1px solid #d8c8b8;border-radius:999px;background:#f8f1e8;color:#5e402b;max-width:calc(100% - 40px);font-size:11px;line-height:1.2}
        .hub-explorer-score b{font-size:13px;white-space:nowrap}.hub-explorer-score small{font-size:10px;color:#6d6860;font-weight:700}
        .hub-explorer-score--withheld{background:#f4f2ee;color:#5c5750}
        .leaflet-popup-content .hub-explorer-score{margin:5px 0 8px;display:flex;max-width:100%;width:max-content}
        @media(max-width:520px){.hub-explorer-score{margin-left:40px;align-items:flex-start;flex-direction:column;gap:2px;border-radius:10px}.leaflet-popup-content .hub-explorer-score{margin-left:0}}
      `;
      doc.head.appendChild(style);
    }
    doc.querySelectorAll('.card').forEach(card=>{
      if(card.querySelector('.hub-explorer-score'))return;
      const name=card.querySelector('.name')?.textContent.trim()||'';
      const markup=embeddedScoreMarkup(name); if(!markup)return;
      card.querySelector('.topline')?.insertAdjacentHTML('afterend',markup);
    });
    doc.querySelectorAll('.leaflet-popup-content .popup').forEach(popup=>{
      if(popup.querySelector('.hub-explorer-score'))return;
      const name=popup.querySelector('h3')?.textContent.trim()||'';
      const markup=embeddedScoreMarkup(name); if(!markup)return;
      popup.querySelector('h3')?.insertAdjacentHTML('afterend',markup);
    });
  }
  function enhanceEmbeddedCoffee(){
    const frame=document.querySelector('.frame'); if(!frame)return;
    const apply=()=>{
      try{
        const doc=frame.contentDocument; if(!doc||!doc.body)return;
        decorateEmbeddedCoffee(doc);
        if(frame._explorerScoreDoc!==doc){
          frame._explorerScoreObserver?.disconnect();
          frame._explorerScoreDoc=doc;
          frame._explorerScoreObserver=new MutationObserver(()=>decorateEmbeddedCoffee(doc));
          frame._explorerScoreObserver.observe(doc.body,{subtree:true,childList:true});
        }
      }catch(e){ /* Same-origin iframe enhancement is optional; detailed cards still retain scores. */ }
    };
    if(frame.dataset.explorerScoreHook!=='1'){
      frame.dataset.explorerScoreHook='1';
      frame.addEventListener('load',apply);
    }
    apply();
  }
  function enhanceMarket(){
    document.querySelectorAll('.directory-card').forEach(card=>{
      const name=nameFromMarket(card),s=explorerScoreFor(name); if(!s)return;
      const badges=card.querySelector('.summary-badges');
      if(badges&&!badges.querySelector('.explorer-summary-score')) badges.insertAdjacentHTML('afterbegin',`<span class="explorer-summary-score">${scoreMarkup(name,true)}</span>`);
      const body=card.querySelector('.directory-body');
      if(body&&!body.querySelector('.explorer-scorecard')) body.insertAdjacentHTML('afterbegin',fullScoreCard(name));
    });
    const bubble=document.querySelector('#mapBubble');
    if(bubble&&!bubble.hidden&&!bubble.querySelector('.bubble-explorer-score')){
      const name=bubble.querySelector('h3')?.textContent.trim()||'';
      const s=explorerScoreFor(name);
      if(s){
        const target=bubble.querySelector('.bubble-badges')||bubble.querySelector('.note');
        target?.insertAdjacentHTML('afterend',`<div class="bubble-explorer-score">${scoreMarkup(name,true)}${s.hygiene?hygieneMarkup(s):''}</div>`);
      }
    }
  }
  function addMethodology(){
    const coffee=document.querySelector('.coffee-research');
    if(coffee&&!coffee.querySelector('.score-methodology')) coffee.querySelector('.coffee-research-head')?.insertAdjacentHTML('afterend',methodology());
    const market=document.querySelector('.directory-section');
    if(market&&!market.querySelector('.score-methodology')) market.querySelector('.directory-head')?.insertAdjacentHTML('afterend',methodology());
  }
  let pending=false;
  function run(){pending=false;addMethodology();enhanceCoffee();enhanceEmbeddedCoffee();enhanceMarket();}
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(run);}
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  schedule();
})();
