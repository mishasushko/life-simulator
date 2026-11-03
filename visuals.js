'use strict';
function photoEra(year) { return year < 1940 ? 'paper' : year < 1980 ? 'film' : year < 2005 ? 'instant' : 'digital'; }
function photoPerson(name, look, age, gender, mood) { return { name, look: { ...look }, age, gender, mood }; }
function saveFamilyPhoto(event, person, choice) {
  if (!['attend','organize','remote'].includes(choice)) return;
  const album = S.familyPhotos ||= [];
  if (album.some(photo => photo.id === event.id && photo.generation === S.generation)) return;
  ensureLooks();
  album.push({ id:event.id, generation:S.generation, year:S.year, title:FAMILY_OCCASIONS[event.kind], choice,
    people:[photoPerson(S.first,S.look,S.age,S.gender,S.stats.happy),photoPerson(person.name,person.look,person.age,person.gender,person.close)],
    memory:relationshipState(person).entries.find(e=>e.kind==='family:'+event.id)?.text || '' });
  if (album.length > 80) album.shift();
}
const inheritAlbum = continueAs;
continueAs = function(kid) { const photos = S.familyPhotos || []; inheritAlbum(kid); S.familyPhotos = photos.slice(); save(); };
function photoFrame(photo) {
  const faces = photo.people.map(p => '<figure>'+portraitSVG(p.look,p.age,p.mood,p.gender)+'<figcaption>'+esc(p.name)+'</figcaption></figure>').join('');
  return '<article class="family-photo '+photoEra(photo.year)+'"><small>'+photo.year+' · поколение '+photo.generation+'</small><div class="photo-faces">'+faces+'</div><b>'+esc(photo.title)+'</b><details><summary>История снимка</summary><p>'+esc(photo.memory)+'</p><p>'+({attend:'Вы приехали на праздник.',organize:'Вы помогли организовать праздник.',remote:'Вы поздравили на расстоянии.'}[photo.choice])+'</p></details></article>';
}
EXTRA_TITLES.photoalbum='📸 Семейный фотоальбом';
EXTRA_PANELS.photoalbum=function() {
  const photos=S.familyPhotos || [];
  if (!photos.length) card('<b>Первый снимок впереди</b><p>Примите семейное приглашение или поздравьте близкого на расстоянии. Здесь останутся портреты и история встречи.</p>');
  else for(const photo of photos.slice().reverse()) card(photoFrame(photo));
};
MENU_HOOKS.unshift(list=>item(list,{e:'📸',t:'Семейный фотоальбом',onClick:()=>openPanel('photoalbum')}));
const oldVisualModal=showModal;
showModal=function(m) {
  if(m.coupleScene && partner()) {
    const p=partner(), memory=relationshipState(p).entries.at(-1);
    m={...m,html:'<div class="couple-scene"><div class="photo-faces"><figure>'+playerPortrait()+'<figcaption>'+esc(S.first)+'</figcaption></figure><figure>'+personPortrait(p)+'<figcaption>'+esc(p.name)+'</figcaption></figure></div><p>'+esc(m.text).replace(/\n/g,'<br>')+'</p>'+(memory?'<blockquote>'+esc(memory.text)+'</blockquote>':'')+'</div>'};
  }
  return oldVisualModal(m);
};
const visualReport=lifeReportHTML;
lifeReportHTML=function(r) {
  const items=S.log.find(b=>b.year===r.year)?.items || [];
  const main=items.find(i=>/^(👶|💍|💒|🌠|🛬|📈|🎓)/u.test(i.t)) || items.find(i=>i.c==='good'||i.c==='bad');
  let bars='';
  for(const [key,label] of [['health','Здоровье'],['happy','Счастье'],['stress','Стресс']]) {
    const rows=r.steps.filter(s=>s.changes[key]), delta=rows.reduce((n,s)=>n+s.changes[key],0);
    if(rows.length) bars+='<details class="stat-strip"><summary>'+label+' '+lifeSigned(delta)+'<i style="width:'+Math.min(100,Math.abs(delta)*4)+'%"></i></summary>'+rows.map(s=>'<div>'+esc(s.label)+' '+lifeSigned(s.changes[key])+'</div>').join('')+'</details>';
  }
  return '<div class="year-lead"><small>ГЛАВА '+r.year+'</small><b>'+esc(main?.t || 'Год вашей жизни')+'</b></div>'+bars+visualReport(r);
};
const visualEvent=evHtml;
evHtml=function(i) {
  if(!/^(👶|💍|💒|🌠|🛬|📈|🎓|🪦)/u.test(i.t)) return visualEvent(i);
  return '<div class="life-highlight">'+visualEvent(i)+'</div>';
};
let motionOn=true;
try { motionOn=localStorage.getItem('lifesim_motion')!=='off'; } catch (_) {}
function applyMotion() { document.documentElement.dataset.lifeMotion=motionOn?'on':'off'; }
applyMotion();
MENU_HOOKS.push(list=>item(list,{e:'✨',t:motionOn?'Выключить анимацию':'Включить анимацию',onClick:()=>{motionOn=!motionOn;applyMotion();try{localStorage.setItem('lifesim_motion',motionOn?'on':'off');}catch(_){} openPanel('menu');}}));
const visualAge=ageUp;
ageUp=function(){const year=S?.year;visualAge();if(S && S.year!==year && motionOn && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('#log')?.querySelector('.yr.last')?.animate?.([{opacity:0.4,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:320});};
function yearPhotoCards(year) {
  return (S.familyPhotos || []).filter(p=>p.year===year && p.generation===S.generation).map(photoFrame).join('');
}
