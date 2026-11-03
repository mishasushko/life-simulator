'use strict';
function photoEra(year) { return year < 1940 ? 'paper' : year < 1980 ? 'film' : year < 2005 ? 'instant' : 'digital'; }
function photoPerson(name, look, age, gender, mood) { return { name, look: { ...look }, age, gender, mood }; }
function saveFamilyPhoto(event, person, choice) {
  if (!['attend','organize','remote'].includes(choice)) return;
  const album = S.familyPhotos ||= [];
  if (album.some(photo => photo.id === event.id && photo.generation === S.generation)) return;
  ensureLooks();
  album.push({ id:event.id, generation:S.generation, year:S.year, title:FAMILY_OCCASIONS[event.kind], choice, kind:event.kind, country:person.country || null,
    people:[photoPerson(S.first,S.look,S.age,S.gender,S.stats.happy),photoPerson(person.name,person.look,person.age,person.gender,person.close)],
    memory:relationshipState(person).entries.find(e=>e.kind==='family:'+event.id)?.text || '' });
  if (album.length > 80) album.shift();
}
const inheritAlbum = continueAs;
continueAs = function(kid) { const photos = S.familyPhotos || []; inheritAlbum(kid); S.familyPhotos = photos.slice(); save(); };
function sceneText(ru,en,uk) { return LANG === 'en' ? en : LANG === 'uk' ? uk : ru; }
function graduationScene(event, person) {
  const invitation = sceneText('Приглашение на выпускной','Graduation invitation','Запрошення на випускний');
  const message = sceneText('Приходи на вручение диплома! Если не получится, я буду радоваться и весточке издалека.', 'Come to my graduation! If you can’t make it, I’d love to hear from you.', 'Приходь на вручення диплома! Якщо не зможеш, можна просто надіслати кілька теплих слів.');
  return '<section class="grad-invite"><div class="grad-stage"><svg viewBox="0 0 360 150" preserveAspectRatio="none" aria-hidden="true"><rect width="360" height="150" fill="#263c46"/><path d="M104 0h130l38 121H66z" fill="#e6bf80" opacity=".26"/><path d="M0 0h76q-8 46-42 68l8 58H0zm360 0h-76q8 46 42 68l-8 58h42z" fill="#9a4955"/><path d="M9 0q17 51 24 65m318-65q-17 51-24 65" fill="none" stroke="#c76e72" stroke-width="5"/><path d="M0 115h360v35H0z" fill="#947450"/><path d="M0 127h360m-360 12h360" stroke="#67533f"/><path d="M50 12q130 38 260 0" fill="none" stroke="#e6cb92"/><g fill="#f8dc9b"><circle cx="90" cy="21" r="3"/><circle cx="145" cy="29" r="3"/><circle cx="213" cy="29" r="3"/><circle cx="268" cy="21" r="3"/></g></svg><div class="grad-portrait">'+personPortrait(person)+'</div></div><div class="grad-note"><small>'+esc(invitation)+' · '+event.year+'</small><strong>'+esc(person.name)+'</strong><p>'+esc(message)+'</p></div></section>';
}
function photoFrame(photo) {
  const faces = photo.people.map(p => '<figure>'+portraitSVG(p.look,p.age,p.mood,p.gender)+'<figcaption>'+esc(p.name)+'</figcaption></figure>').join('');
  const captions={
    attend:sceneText('Вы были рядом в этот день.','You were there that day.','Ви були поруч цього дня.'),
    organize:sceneText('Вы помогли устроить праздник.','You helped organize the celebration.','Ви допомогли влаштувати свято.'),
    remote:sceneText('Вы поздравили на расстоянии.','You sent your congratulations from afar.','Ви привітали на відстані.')
  };
  const place=COUNTRIES.find(c=>c.id===photo.country);
  const title=photo.kind==='graduation'?sceneText('Выпускной','Graduation','Випускний'):photo.title;
  return '<article class="family-photo '+photoEra(photo.year)+'"><small>'+photo.year+' · '+sceneText('поколение','generation','покоління')+' '+photo.generation+'</small><div class="photo-faces">'+faces+'</div><b>'+esc(title)+'</b><details class="photo-reverse"><summary>'+sceneText('Перевернуть снимок','Turn photo over','Перевернути світлину')+'</summary><div><small>'+photo.year+(place?' · '+esc(place.flag)+' '+esc(place.name):'')+'</small><p>'+esc(captions[photo.choice] || '')+'</p><p>'+esc(photo.memory || '')+'</p></div></details></article>';
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

function lifeChapter(age) {
  if (age < 13) return 'Детство';
  if (age < 18) return 'Юность';
  if (age < 40) return 'Взросление';
  if (age < 65) return 'Зрелость';
  return 'Поздние годы';
}
function chapterTimeline() {
  const chapters = new Map();
  for (const b of S.log) {
    const name = lifeChapter(b.age);
    if (!chapters.has(name)) chapters.set(name, []);
    chapters.get(name).push(b);
  }
  return [...chapters].map(([name, blocks]) => {
    const current = name === lifeChapter(S.age);
    const open = S.chapterOpen?.[name] ?? current;
    const years = blocks.map(b => '<div class="yr'+(b.year===S.year?' last':'')+'"><div class="yr-age"><b>'+b.age+'</b><small>'+b.year+'</small></div><div class="yr-body">'+b.items.map(evHtml).join('')+yearPhotoCards(b.year)+'</div></div>').join('');
    return '<details class="life-chapter" data-chapter="'+name+'" '+(open?'open':'')+'><summary>'+name+' <small>'+blocks[0].year+' — '+blocks.at(-1).year+'</small></summary>'+years+'</details>';
  }).join('');
}
document.addEventListener('toggle', e => {
  if (S && e.target.dataset?.chapter && e.target.isConnected) (S.chapterOpen ||= {})[e.target.dataset.chapter]=e.target.open;
}, true);
function renderLifeHome() {
  const scene=S.prison?'prison':S.retired?'home':S.job?'office':S.edu.stage?'school':'home';
  const header=$('.profile');
  header.dataset.scene=scene;
  const dream=S.narrative?.dreams.find(d=>!d.done&&!d.abandoned);
  const title=LIFE_DREAMS.find(d=>d.id===dream?.id)?.name;
  $('#sceneCaption').textContent=({home:'🏠 Дома',school:'📚 На учёбе',office:'💼 На работе',prison:'🔒 В заключении'})[scene]+' · '+S.city+(title?' · 🌠 '+title:'');
  renderStatChanges();
  const bar=$('#quickBar'); bar.innerHTML='';
  for (const pin of S.quickPins || []) {
    const b=document.createElement('button');
    b.textContent=pinTitle(pin); b.onclick=()=>runQuickPin(pin); bar.appendChild(b);
  }
  const setup=document.createElement('button'); setup.textContent='⚙ Быстрые действия'; setup.onclick=()=>openPanel('quickpins'); bar.appendChild(setup);
}
function renderStatChanges() {
  const node=$('#statChanges'), report=S.lifeSystems?.report;
  if (!report || report.year!==S.year) { node.innerHTML=''; return; }
  node.innerHTML=Object.entries({health:'Здоровье',happy:'Счастье',stress:'Стресс'}).map(([key,label])=>{
    const rows=report.steps.filter(step=>step.changes[key]);
    if (!rows.length) return '';
    return '<details><summary>'+label+' '+lifeSigned(rows.reduce((n,row)=>n+row.changes[key],0))+'</summary>'+rows.map(row=>'<small>'+esc(row.label)+' '+lifeSigned(row.changes[key])+'</small>').join('')+'</details>';
  }).join('');
}
function pinTitle(pin) {
  if(pin.kind==='person') return '💬 '+(S.people.find(p=>p.id===pin.id)?.name || 'Знакомый');
  return '🎯 '+(SKILLS.find(s=>s.id===pin.id)?.name || 'Увлечение');
}
function runQuickPin(pin) {
  if (!S.alive) return;
  if(pin.kind==='person') {
    const p=S.people.find(p=>p.id===pin.id && p.alive);
    if(p) personModal(p); else toast('Этот человек больше недоступен.');
    return;
  }
  const skill=SKILLS.find(s=>s.id===pin.id);
  if(!skill || S.prison || S.age<skill.min || (skill.yr && S.year<skill.yr) || S.practiced?.[pin.id]) { toast('Сейчас занятие недоступно.'); return; }
  act(()=>practice(skill))();
}
EXTRA_TITLES.quickpins='⚡ Быстрые действия';
EXTRA_PANELS.quickpins=function() {
  const pins=S.quickPins ||= [];
  const list=section('Выберите до двух действий');
  const options=[...pins,...S.people.filter(p=>p.alive).map(p=>({kind:'person',id:p.id})),...SKILLS.filter(s=>S.age>=s.min && (!s.yr||s.yr<=S.year)).map(s=>({kind:'skill',id:s.id}))];
  const seen=new Set();
  for(const option of options) {
    const key=option.kind+':'+option.id;if(seen.has(key)) continue;seen.add(key);
    const index=pins.findIndex(p=>p.kind===option.kind && p.id===option.id);
    item(list,{e:index>=0?'✓':'＋',t:pinTitle(option),disabled:index<0 && pins.length>=2,onClick:act(()=>{if(index>=0)pins.splice(index,1);else if(pins.length<2)pins.push(option);})});
  }
};
