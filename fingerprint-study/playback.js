'use strict';
// The study adds playback controls around the archived HTML, without editing the artifacts.
(() => {
 const cache = new Map(), previews = new WeakMap();
 function playbackBridge(id, token) {
  const $ = name => document.getElementById(name);
  const click = name => $(name).click();
  function pauseInitial() {
   switch (id) {
    case 'light': window.motionDemo.seek(0); break;
    case 'medium': click('clear'); break;
    case 'high': if ($('pause').textContent === 'Pause') click('pause'); break;
    case 'extra-high': if ($('toggle').dataset.playing === 'true') click('toggle'); break;
    case 'max': click('clear'); break;
    case 'ultra': if ($('play').getAttribute('aria-label') === 'Pause animation') click('play'); break;
   }
  }
  function replay() {
   if (id === 'high') {
    click('demo');
    // An explicit Play command also works with the demo's reduced-motion preference.
    if ($('pause').textContent === 'Play') click('pause');
   } else {
    if (id === 'max' && $('replay').getAttribute('aria-pressed') === 'true') click('replay');
    click('replay');
   }
  }
  const notify = state => parent.postMessage({type:'study-playback', token, state}, '*');
  try {
   pauseInitial();
   addEventListener('message', event => {
    if (event.source !== parent || event.data?.type !== 'study-playback' || event.data.token !== token) return;
    if (event.data.command === 'play') {
     try { replay(); notify('started'); } catch { notify('error'); }
    }
   });
   notify('ready');
  } catch { notify('error'); }
 }
 function source(variant) {
  if (!cache.has(variant.demo)) {
   const pending = fetch(variant.demo).then(response => {
    if (!response.ok) throw new Error('Preview could not load');
    return response.text();
   }).catch(error => {cache.delete(variant.demo); throw error;});
   cache.set(variant.demo, pending);
  }
  return cache.get(variant.demo);
 }
 async function mount(frame, variant) {
  previews.get(frame)?.cancel();
  const token = crypto.randomUUID();
  let cancel;
  const pending = new Promise((resolve, reject) => {
   let timer;
   const cleanup = () => {clearTimeout(timer); removeEventListener('message', receive);};
   cancel = () => {cleanup(); reject(new Error('Preview replaced'));};
   const receive = event => {
    if (event.source !== frame.contentWindow || event.data?.type !== 'study-playback' || event.data.token !== token) return;
    if (event.data.state === 'ready') {cleanup(); frame.dataset.playback = 'ready'; resolve();}
    else if (event.data.state === 'error') {cleanup(); reject(new Error('Playback controls could not load'));}
   };
   addEventListener('message', receive);
   timer = setTimeout(() => {cleanup(); reject(new Error('Preview took too long to load'));}, 15000);
  });
  // Attach a handler immediately, including while the HTML fetch is pending.
  pending.catch(() => {});
  const current = {token, cancel};
  previews.set(frame, current);
  frame.dataset.playback = 'loading';
  frame.style.visibility = 'hidden';
  try {
   const html = await source(variant);
   if (previews.get(frame) !== current) return false;
   frame.srcdoc = html + '\n<script>(' + playbackBridge.toString() + ')(' + JSON.stringify(variant.id) + ',' + JSON.stringify(token) + ');<\/script>';
   await pending;
   if (previews.get(frame) !== current) return false;
   frame.style.visibility = '';
   return true;
  } catch {
   cancel();
   if (previews.get(frame) === current) frame.dataset.playback = 'error';
   return false;
  }
 }
 function play(frames) {
  if (frames.some(frame => frame.dataset.playback !== 'ready')) return false;
  // Send only after every selected preview is ready, rather than starting as each loads.
  for (const frame of frames) frame.contentWindow.postMessage({type:'study-playback', token:previews.get(frame).token, command:'play'}, '*');
  return true;
 }
 window.StudyPlayback = {mount, play};
})();
