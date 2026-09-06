'use strict';
(() => {
 const study=window.STUDY, $=id=>document.getElementById(id);
 if(!study)return;
 const playback=window.StudyPlayback;
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const duration=ms=>{const seconds=Math.round(ms/1000);return `${Math.floor(seconds/60)}m ${String(seconds%60).padStart(2,'0')}s`;};
 const elapsed=s=>{const seconds=Math.round(s);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
 const variants=study.variants, byId=id=>variants.find(v=>v.id===id);
 const tokenNumber=n=>new Intl.NumberFormat('en-US').format(n);
 const tokenCompact=n=>n>=1e6?(n/1e6).toFixed(2)+'M':Math.round(n/1000)+'k';
 const tokenLink=v=>`<a class="token-link" href="#usage-${v.id}" title="${tokenNumber(v.tokenUsage.totals.total_tokens)} total tokens${v.agents?', including both subagents':''}">${tokenCompact(v.tokenUsage.totals.total_tokens)} tokens${v.agents?' *':''}</a>`;

 let referenceFrames=study.frames,referenceIndex=1,viewport='mobile',galleryViewport='mobile',previewView='compact';
 study.sequences.forEach((group,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=group.label;$('reference-group').append(option);});
 function showReference(index){
  referenceIndex=Math.max(0,Math.min(referenceFrames.length-1,Number(index)));
  const frame=referenceFrames[referenceIndex];$('reference-image').src=frame.src;$('reference-image').alt=`Captured reference at ${frame.time.toFixed(3)} seconds: ${frame.label}`;
  $('reference-time').textContent=frame.time.toFixed(3)+'s';$('reference-label').textContent=frame.label;$('reference-open').href=frame.src;
  $('reference-scrub').max=String(referenceFrames.length-1);$('reference-scrub').value=String(referenceIndex);
  $('reference-count').textContent=`${referenceIndex+1} / ${referenceFrames.length}`;
  $('previous-frame').disabled=referenceIndex===0;$('next-frame').disabled=referenceIndex===referenceFrames.length-1;
 }
 $('reference-group').addEventListener('change',e=>{
  const overview=e.target.value==='overview';referenceFrames=overview?study.frames:study.sequences[Number(e.target.value)].frames;
  const group=overview?null:study.sequences[Number(e.target.value)];
  $('crop-note').textContent=overview?'Full captured region, including the original post.':group.bounds&&group.bounds.width<1?'Regional crop from the export. Its framing can differ from the full keyframes.':'Full captured region from a denser detail sequence.';
  showReference(0);
 });
 $('reference-scrub').addEventListener('input',e=>showReference(e.target.value));$('previous-frame').addEventListener('click',()=>showReference(referenceIndex-1));$('next-frame').addEventListener('click',()=>showReference(referenceIndex+1));
 function sizePreviews(){
  document.querySelectorAll('.demo-viewport, .gallery-viewport').forEach(container=>{
   const mode=container.classList.contains('gallery-viewport')?galleryViewport:viewport;
   const [width,height]=mode==='mobile'?[390,844]:[1048,880];
   const frame=container.querySelector('iframe'), available=container.clientWidth;
   // Every variant shares one crop for its viewport. Original layout and relative sizes stay intact.
   const compact=previewView==='compact';
   const [cropX,cropY,cropWidth,cropHeight]=compact?(mode==='mobile'?[0,260,390,260]:[220,260,608,300]):[0,0,width,height];
   const scale=Math.min(1,available/cropWidth);
   frame.style.width=width+'px';frame.style.height=height+'px';frame.style.transform=`scale(${scale})`;
   frame.style.left=((available-cropWidth*scale)/2-cropX*scale)+'px';frame.style.top=(-cropY*scale)+'px';container.style.height=cropHeight*scale+'px';
   // Cropped replays are for observation; full view exposes every original control to pointer and keyboard.
   frame.inert=compact;
   frame.tabIndex=compact?-1:0;
  });
 }
 document.querySelectorAll('[data-preview-view]').forEach(button=>button.addEventListener('click',()=>{
  previewView=button.dataset.previewView;
  $('compare').classList.toggle('is-compact',previewView==='compact');
  document.querySelectorAll('[data-preview-view]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  $('view-note').textContent=previewView==='compact'?'Cropped replays · same window and scale for every reconstruction.':'Complete interfaces · press a button or use its original controls.';
  sizePreviews();
 }));
 const pairFrames=()=>[...document.querySelectorAll('.demo-viewport iframe')];
 function updatePairControls(){
  $('play-pair').disabled=pairFrames().some(frame=>frame.dataset.playback!=='ready');
 }
 async function showVariant(slot,id){
  const v=byId(id),panel=document.querySelector(`[data-slot="${slot}"]`);if(!v)return;
  $(`select-${slot}`).value=id;panel.querySelector('.panel-time').textContent=duration(v.durationMs);
  panel.querySelector('.open-demo').href=v.demo;
  panel.querySelector('.panel-description').innerHTML=`<h3>${safe(v.verdict)}</h3><p>${safe(v.interface)}</p><p class="panel-usage">${tokenLink(v)}${v.agents?' · includes two subagents':''}</p>`;
  const iframe=panel.querySelector('iframe');iframe.title=`${v.label} original reconstruction`;
  $('play-pair').textContent='Play both';
  const loading=playback.mount(iframe,v);
  updatePairControls();sizePreviews();
  const ready=await loading;
  panel.querySelector('.preview-error')?.remove();
  if(!ready && iframe.dataset.playback==='error'){
   const error=document.createElement('p');error.className='preview-error small';error.textContent='Preview could not load. Reset both to retry, or open the original full size.';
   panel.querySelector('.panel-description').append(error);
  }
  updatePairControls();
 }
 for(const slot of ['a','b']){
  $(`select-${slot}`).innerHTML=variants.map(v=>`<option value="${v.id}">${v.label}</option>`).join('');
  $(`select-${slot}`).addEventListener('change',e=>showVariant(slot,e.target.value));
 }
 showVariant('a','high');showVariant('b','ultra');
 new ResizeObserver(sizePreviews).observe($('comparison-grid'));
 document.querySelectorAll('[data-viewport]').forEach(button=>button.addEventListener('click',()=>{
  viewport=button.dataset.viewport;
  document.querySelectorAll('[data-viewport]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  $('viewport-label').textContent=viewport==='desktop'?'Desktop layout · 1048 × 880':'Mobile layout · 390 × 844';sizePreviews();
 }));
 $('reload-pair').addEventListener('click',()=>{for(const slot of ['a','b'])showVariant(slot,$(`select-${slot}`).value);});
 $('play-pair').addEventListener('click',()=>{
  if(playback.play(pairFrames())) $('play-pair').textContent='Replay both';
 });
 // Only the study's embedding adds start/reset controls; the archived demos are unchanged.
 $('live-gallery').innerHTML=variants.map(v=>`<article class="gallery-card" data-gallery-id="${v.id}" aria-labelledby="gallery-title-${v.id}"><header class="gallery-label"><h4 id="gallery-title-${v.id}">${v.label}</h4><span class="mono">${duration(v.durationMs)}</span></header><div class="gallery-viewport"><iframe title="${v.label} interactive gallery demo" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe></div><div class="gallery-footer">${tokenLink(v)}<div class="gallery-links"><a href="${v.demo}" target="_blank" rel="noopener" aria-label="Open ${v.label} demo full size">Open ↗</a><button data-compare="${v.id}" aria-label="Compare ${v.label} in panel B">Compare in B ↗</button></div></div></article>`).join('');
 $('live-gallery').querySelectorAll('[data-compare]').forEach(button=>button.addEventListener('click',()=>{
  showVariant('b',button.dataset.compare);$('select-b').focus({preventScroll:true});$('comparison-grid').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 }));
 document.querySelectorAll('[data-gallery-viewport]').forEach(button=>button.addEventListener('click',()=>{
  galleryViewport=button.dataset.galleryViewport;
  document.querySelectorAll('[data-gallery-viewport]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  $('gallery-viewport-label').textContent=galleryViewport==='desktop'?'Desktop layout · 1048 × 880.':'Mobile layout · 390 × 844.';
  sizePreviews();
 }));
 let galleryLoad=0;
 const galleryFrames=()=>[...$('live-gallery').querySelectorAll('iframe')];
 async function resetGallery(){
  const generation=++galleryLoad;
  $('play-gallery').disabled=true;$('play-gallery').textContent='Play all';
  $('gallery-playback-status').textContent='Preparing all six demos…';
  const results=await Promise.all(variants.map(v=>playback.mount($('live-gallery').querySelector(`[data-gallery-id="${v.id}"] iframe`),v)));
  if(generation!==galleryLoad)return;
  const ready=results.every(Boolean);
  $('play-gallery').disabled=!ready;
  $('gallery-playback-status').textContent=ready?'Ready. Start all six together.':'A preview could not load. Reset all to retry, or use the full-size links.';
 }
 $('play-gallery').addEventListener('click',()=>{
  if(playback.play(galleryFrames())){
   $('play-gallery').textContent='Replay all';
   $('gallery-playback-status').textContent='Started together. Each demo keeps its own timing and controls. Reset all to return to rest.';
  }
 });
 $('reload-gallery').addEventListener('click',resetGallery);
 resetGallery();
 new ResizeObserver(sizePreviews).observe($('live-gallery'));
 sizePreviews();
 const usageCells=u=>['input_tokens','cached_input_tokens','output_tokens','reasoning_output_tokens','total_tokens'].map(k=>`<td class="numeric${k==='total_tokens'?' total-tokens':''}">${tokenNumber(u[k])}</td>`).join('');
 $('token-table-body').innerHTML=variants.map(v=>`<tr id="usage-${v.id}"><th scope="row">${v.label}${v.agents?' *':''}</th>${usageCells(v.tokenUsage.totals)}</tr>`).join('');
 const ultra=byId('ultra');
 $('ultra-token-components').innerHTML=ultra.tokenUsage.components.map(c=>`<tr><th scope="row">${safe(c.label)}</th>${usageCells(c.usage)}</tr>`).join('')+`<tr class="token-sum"><th scope="row">Ultra combined</th>${usageCells(ultra.tokenUsage.totals)}</tr>`;
 const maxDuration=Math.max(...variants.map(v=>v.durationMs));
 $('duration-chart').innerHTML=variants.map(v=>`<div class="duration-row"><span>${v.label}${v.agents?' *':''}</span><div class="duration-track" aria-hidden="true"><div class="duration-bar" style="width:${v.durationMs/maxDuration*100}%"></div></div><span>${duration(v.durationMs)}</span></div>`).join('')+'<p class="small muted">* Ultra used two parallel subagents.</p>';
 $('run-log-list').innerHTML=variants.map((v,i)=>`<details class="run-record" id="run-${v.id}"><summary><span class="run-number">0${i+1}</span><span class="run-name">${v.label}</span><span class="run-verdict">${safe(v.verdict)}</span><span class="run-test-tag">${safe(v.browser)}</span><span class="run-duration">${duration(v.durationMs)}<small>${tokenCompact(v.tokenUsage.totals.total_tokens)} tokens${v.agents?' *':''}</small></span></summary><div class="run-body"><p>${safe(v.summary)} ${safe(v.process)}</p><div class="run-columns"><div><h4>Recorded process · approximate elapsed times</h4><ol class="timeline">${v.timeline.map(e=>`<li><time>${elapsed(e.elapsedSeconds)}</time><div><strong>${safe(e.title)}</strong><p>${safe(e.detail)}</p></div></li>`).join('')}</ol></div><div><h4>Checks in the original run</h4><ul class="run-checks">${v.tests.map(t=>`<li>${safe(t)}</li>`).join('')}</ul><p>${safe(v.limit)}</p><h4 style="margin-top:24px">Interface & visual review</h4><p>${safe(v.look)}</p><p>${safe(v.interface)}</p><h4 style="margin-top:24px">Checked afterward for this study</h4><p>Rendered at 1048 × 880 and 390 × 844, DPR 1. Exercised direct pressing and Space input; captured clean, pressed, two-contact and mobile states. No uncaught JavaScript errors or horizontal overflow were observed. These checks do not certify exact motion fidelity.</p><div class="run-links"><a href="${v.demo}" target="_blank" rel="noopener">Open original demo ↗</a><a href="${v.demo}" download="fingerprint-${v.id}.html">Save HTML ↓</a></div></div></div><details class="public-updates"><summary>Public progress excerpts from the task</summary><p>Verbatim public commentary, with elapsed timestamps. These are the run’s own reports; the verification notes above distinguish completed tests from attempts. Private reasoning is not included.</p>${v.publicUpdates.map(e=>`<blockquote><time>+${elapsed(e.elapsedSeconds)}</time><p>${safe(e.text)}</p></blockquote>`).join('')}<p class="small muted">Recorded task title: ${safe(v.threadTitle)}<br>Model: ${v.model} · recorded effort: ${v.effort}</p></details></div></details>`).join('');
 $('interface-table').innerHTML=variants.map(v=>`<tr><td>${v.label}</td>${v.controls.map(c=>`<td class="${c?'yes':'no'}">${c?'Yes':'—'}</td>`).join('')}<td>${safe(v.fade)}</td></tr>`).join('');
 $('audit-notes').innerHTML=variants.map(v=>`<div class="audit-entry"><strong>${v.label}</strong><div><p>${safe(v.access)}</p><code class="hash">HTML SHA-256: ${v.sha256}</code></div></div>`).join('');
 $('input-hash').textContent=study.input.sha256;
 showReference(1);
})();
