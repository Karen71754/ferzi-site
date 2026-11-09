(() => {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Cinematic archive access sequence
  if (!reduced && !sessionStorage.getItem('ferziArchiveEntered')) {
    const gate = document.createElement('div');
    gate.className = 'archive-opening';
    gate.innerHTML = '<div class="archive-opening-inner"><div class="archive-opening-mark">♛</div><div class="archive-opening-title">ДОСТУП К АРХИВУ</div><div class="archive-opening-line"></div><div class="archive-opening-caption">ПРОВЕРКА ДОПУСКА · ФЕРЗИ / СУДНЫЙ ДЕНЬ</div></div>';
    document.body.appendChild(gate);
    window.setTimeout(() => { gate.classList.add('is-gone'); sessionStorage.setItem('ferziArchiveEntered','1'); window.setTimeout(()=>gate.remove(),750); }, 1750);
  }
  // Red archive seal on dossier portrait
  const portrait = document.querySelector('.portrait-wrap');
  if (portrait) {
    const stamp = document.createElement('div');
    stamp.className = 'archive-stamp';
    stamp.innerHTML = '<span>ПРОВЕРЕНО<br>АРХИВ ФЕРЗЕЙ<br>♛</span>';
    portrait.appendChild(stamp);
  }
  // Subtle cursor light for desktop
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches && !reduced) {
    const aura = document.createElement('div'); aura.className = 'cursor-aura'; document.body.appendChild(aura);
    document.addEventListener('pointermove', e => { aura.style.left=e.clientX+'px'; aura.style.top=e.clientY+'px'; document.body.classList.add('cursor-active'); }, {passive:true});
    document.addEventListener('pointerleave',()=>document.body.classList.remove('cursor-active'));
  }
  // Original synthesized ambient drone; starts only after explicit user action.
  const button = document.createElement('button');
  button.className='sound-toggle'; button.type='button'; button.setAttribute('aria-pressed','false');
  button.innerHTML='<span class="sound-led"></span><span class="sound-label">ЗВУК: ВЫКЛ</span>';
  document.body.appendChild(button);
  let audio=null, nodes=[];
  function startAudio(){
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx) return false;
    if(!audio) {
      audio=new Ctx();
      const master=audio.createGain(); master.gain.value=.0001; master.connect(audio.destination);
      const filter=audio.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=420; filter.connect(master);
      [55,82.41,110].forEach((freq,i)=>{
        const osc=audio.createOscillator(), gain=audio.createGain();
        osc.type=i===1?'triangle':'sine'; osc.frequency.value=freq; gain.gain.value=[.24,.10,.045][i];
        osc.connect(gain); gain.connect(filter); osc.start(); nodes.push(osc,gain);
      });
      const lfo=audio.createOscillator(), lfoGain=audio.createGain(); lfo.frequency.value=.08; lfoGain.gain.value=45; lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start(); nodes.push(lfo,lfoGain,filter,master);
      audio.master=master;
    }
    audio.resume(); audio.master.gain.cancelScheduledValues(audio.currentTime); audio.master.gain.setTargetAtTime(.16,audio.currentTime,.8);
    return true;
  }
  function stopAudio(){if(audio){audio.master.gain.cancelScheduledValues(audio.currentTime);audio.master.gain.setTargetAtTime(.0001,audio.currentTime,.35);}}
  button.addEventListener('click',()=>{
    const on=button.getAttribute('aria-pressed')!=='true';
    if(on && !startAudio()){button.querySelector('.sound-label').textContent='ЗВУК НЕДОСТУПЕН';return;}
    if(!on) stopAudio();
    button.setAttribute('aria-pressed',String(on));
    button.querySelector('.sound-label').textContent=on?'ЗВУК: ВКЛ':'ЗВУК: ВЫКЛ';
  });
})();