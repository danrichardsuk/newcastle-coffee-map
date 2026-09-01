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
    const intro=s.publish?`<div class="scorecard-top">${scoreMarkup(name)}<span class="score-checked">Checked ${EXPLORER_SCORE_CHECKED}</span></div>`:`<div class="scorecard-top">${scoreMarkup(name)}<span class="score-checked">Internal research score ${s.score.toFixed(1)} · not published</span></div>`;
    return `<section class="explorer-scorecard" data-score-name="${esc(name)}">${intro}<p>${esc(s.why)}</p>${hygieneMarkup(s)}<details class="score-why"><summary>Why this score?</summary>${dimensionsMarkup(s)}<p class="score-method-short">Quality 35% · Value 20% · Service 15% · Variety 10% · Atmosphere 10% · Reliability 10%. Low-volume ratings are statistically adjusted; N/A dimensions are renormalised.</p>${reviewLinks(s)}</details></section>`;
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
  function run(){pending=false;addMethodology();enhanceCoffee();enhanceMarket();}
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(run);}
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  schedule();
})();
