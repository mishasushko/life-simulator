'use strict';
const kt = (ru,en,uk) => sceneText(ru,en,uk);
function homeHistory() {
  if (!S.homeHistory) {
    S.homeHistory = { places: [], relicPhotos: [], trophies: [], diplomas: [] };
    if (S.birthCountry) S.homeHistory.places.push({ country:S.birthCountry, city:S.age===0?S.city:null, year:S.birthYear, birth:true });
  }
  const h=S.homeHistory, last=h.places.at(-1);
  if (!last || last.country!==S.country || last.city!==S.city) h.places.push({country:S.country,city:S.city,year:S.year});
  return h;
}
const keepsakeNewLife=newLife;
newLife=function(...args){const result=keepsakeNewLife(...args);homeHistory();save();return result;};
const keepsakeMove=lifeMove;
lifeMove=function(from){const result=keepsakeMove(from);homeHistory();return result;};
function recordWall() {
  const h=homeHistory(), medals=S.sport?.gold || 0;
  if(medals>0 && !h.trophies.some(t=>t.count===medals)) h.trophies.push({year:S.year,count:medals});
  for(const id of (S.worldPlay?.credentials || [])) if(MAJORS.some(m=>m.id===id) && !h.diplomas.some(d=>d.id===id)) h.diplomas.push({id,year:S.year});
}
YEAR_HOOKS.push(recordWall);
function showWallPhoto(photo){
  showModal({e:'🖼️',title:photo.title,html:photoFrame(photo).replace('<details class="photo-reverse">','<details open class="photo-reverse">')});
}
function wallItems(list) {
  recordWall();
  const h=homeHistory(),photo=[...(S.familyPhotos||[])].reverse().find(p=>p.kind==='graduation'||p.title===FAMILY_OCCASIONS.graduation);
  if(photo)item(list,{e:'🖼️',t:kt('Фото выпускного','Graduation photograph','Світлина з випускного'),d:photo.year+' · '+photo.people.map(p=>p.name).join(', '),onClick:()=>showWallPhoto(photo)});
  for(const trophy of h.trophies.slice(-1))item(list,{e:'🏆',t:kt('Спортивная полка','Trophy shelf','Полиця нагород'),d:trophy.year+' · 🥇 × '+trophy.count});
  for(const diploma of h.diplomas)item(list,{e:'🎓',t:MAJORS.find(m=>m.id===diploma.id)?.name || diploma.id,d:String(diploma.year)});
  if(!photo&&!h.trophies.length&&!h.diplomas.length)card(kt('Здесь появятся фотографии выпускных, спортивные награды и дипломы.','Graduation photos, medals and diplomas will appear here.','Тут з’являться світлини з випускних, спортивні нагороди й дипломи.'));
}
function openPlace(stop){
  const people=S.people.filter(p=>p.country===stop.country && p.alive);
  const photos=(S.familyPhotos||[]).filter(p=>p.country===stop.country);
  showModal({e:'📍',title:stop.city||cname(COUNTRIES.find(c=>c.id===stop.country)||C()),html:'<p>'+esc(kt('Люди в этой стране','People in this country','Люди в цій країні'))+': '+esc(people.map(p=>p.name).join(', ')||'—')+'</p>'+photos.map(photoFrame).join('')});
}
EXTRA_PANELS.places=function(){
  const stops=homeHistory().places;
  const list=section(kt('Маршрут жизни','Life route','Маршрут життя'));list.className+=' memory-route';
  for(const stop of stops){
    const country=COUNTRIES.find(c=>c.id===stop.country);if(!country)continue;
    item(list,{e:country.flag,t:stop.city||cname(country),d:stop.year+' · '+cname(country)+(stop.birth?' · '+kt('рождение','birth','народження'):''),onClick:()=>openPlace(stop)});
  }
};
const placesMap=panelMap;
panelMap=function(){item(section(kt('Личные места','Personal places','Особисті місця')),{e:'📍',t:EXTRA_TITLES.places,onClick:()=>openPanel('places')});placesMap();};
const firstDayHire=hire;
hire=function(...args){
  const old=S.job,result=firstDayHire(...args);
  if(S.job && S.job!==old){const team=workplaceState();team.firstDay=S.year;queueFirstDay(team);}
  return result;
};
function queueFirstDay(team){
  const mentor=S.people.find(p=>p.id===team.people[1]),peer=S.people.find(p=>p.id===team.people[2]);
  if(!mentor||!peer||team.firstDay!==S.year)return;
  function choose(person,kind){
    if(!workplaceValid(team,person)||team.firstDay!==S.year)return null;
    delete team.firstDay;S.job.perf=clamp(S.job.perf+(kind==='alone'?3:2));
    if(kind!=='alone'){person.close=clamp(person.close+6);relationshipRemember(person,'first-day',kt('В первый рабочий день вы выполнили задание вместе.','You worked together on the first day.','У перший робочий день ви виконали завдання разом.'),4);}
    narrativeNote('career',kt('Первый рабочий день','First day at work','Перший робочий день')+' · '+(kind==='alone'?kt('самостоятельная задача','independent assignment','самостійне завдання'):person.name));return null;
  }
  Q.push({e:'🏢',title:kt('Первый рабочий день','First day at work','Перший робочий день'),html:'<div class="couple-scene"><div class="photo-faces"><figure>'+personPortrait(mentor)+'<figcaption>'+esc(mentor.name)+'</figcaption></figure></div><p>'+kt('Наставник знакомит вас с командой. Как возьмётесь за первую задачу?','Your mentor introduces the team. How will you approach your first assignment?','Наставник знайомить вас із командою. Як візьметеся за перше завдання?')+'</p></div>',choices:[
    {t:kt('Спросить наставника','Ask the mentor','Запитати наставника'),f:()=>choose(mentor,'mentor')},{t:kt('Позвать коллегу','Invite a colleague','Запросити колегу'),f:()=>choose(peer,'peer')},{t:kt('Попробовать самостоятельно','Try it yourself','Спробувати самостійно'),f:()=>choose(mentor,'alone')}]});
}
const firstDayPanel=EXTRA_PANELS.workplace;
EXTRA_PANELS.workplace=function(){firstDayPanel();const w=S.job&&workplaceState();if(w && w.firstDay===S.year)item(section(kt('Знакомство','Introductions','Знайомство')),{e:'🏢',t:kt('Первая задача','First assignment','Перше завдання'),onClick:()=>{queueFirstDay(w);closeSheet();pump();}});};
function guitarMoment(){
  const h=homeHistory(),g=h.guitar;
  if(!S.alive||S.prison||!g||S.age<6||S.used.familyMusic)return null;
  S.used.familyMusic=1;skills().music=clamp(skillOf('music')+3);(S.practiced||={}).music=1;
  ensureLooks();
  const note=kt('Вы сыграли на семейной гитаре.','You played the family guitar.','Ви зіграли на родинній гітарі.');
  narrativeNote('family',note);h.relicPhotos.push({id:'guitar:'+S.generation+':'+S.year,kind:'relic',generation:S.generation,year:S.year,country:S.country,title:kt('Семейная гитара','Family guitar','Родинна гітара'),choice:'music',people:[photoPerson(S.first,S.look,S.age,S.gender,S.stats.happy)],memory:note});h.relicPhotos=h.relicPhotos.slice(-24);return note;
}
function buyGuitar(){
  const h=homeHistory(),fee=price(25000);
  if(S.age<14||S.prison||h.guitar||S.money<fee||!confirmAction('',fee))return null;
  S.money-=fee;h.guitar={year:S.year,owner:S.first};return kt('Вы купили гитару.','You bought a guitar.','Ви купили гітару.');
}
const relicInherit=continueAs;
continueAs=function(k){const h=homeHistory(),g=h.guitar,photos=h.relicPhotos.slice();relicInherit(k);const next=homeHistory();if(g){next.guitar={...g};next.relicPhotos=photos;save();}};
const relicAlbum=EXTRA_PANELS.photoalbum;
EXTRA_PANELS.photoalbum=function(){relicAlbum();for(const photo of homeHistory().relicPhotos.slice().reverse())card(photoFrame(photo));};
EXTRA_PANELS.memoryroom=function(){
  const wall=section(kt('Стена воспоминаний','Memory wall','Стіна спогадів'));wall.className+=' keepsake-wall';wallItems(wall);
  const h=homeHistory(),list=section(kt('Семейная реликвия','Family heirloom','Родинна реліквія'));
  if(h.guitar)item(list,{e:'🎸',t:kt('Сыграть на гитаре','Play the guitar','Зіграти на гітарі'),d:h.guitar.owner+' · '+h.guitar.year,disabled:S.age<6||S.prison||S.used.familyMusic,onClick:act(guitarMoment)});
  else item(list,{e:'🎸',t:kt('Купить гитару','Buy a guitar','Купити гітару'),d:fmt(price(25000)),disabled:S.age<14||S.prison||S.money<price(25000),onClick:act(buyGuitar)});
  item(list,{e:'📍',t:EXTRA_TITLES.places,onClick:()=>openPanel('places')});
};
function roomTitles(){EXTRA_TITLES.memoryroom=kt('🏠 Комната героя','🏠 Your room','🏠 Кімната героя');EXTRA_TITLES.places=kt('📍 Личные места','📍 Personal places','📍 Особисті місця');}
MENU_HOOKS.unshift(list=>{roomTitles();for(const id of ['memoryroom','places'])item(list,{e:'•',t:EXTRA_TITLES[id],onClick:()=>openPanel(id)});});
const roomRender=renderLifeHome;
renderLifeHome=function(){roomRender();roomTitles();const wall=$('#memoryWall');wall.textContent=EXTRA_TITLES.memoryroom;const photo=[...(S.familyPhotos||[])].reverse().find(p=>p.kind==='graduation'||p.title===FAMILY_OCCASIONS.graduation);
  if(photo){wall.textContent='🖼️ '+photo.title+' · '+photo.year;wall.onclick=()=>showWallPhoto(photo);}else wall.onclick=()=>openPanel('memoryroom');};
function drawPlaceRoute(svg,features,path){
  const stops=homeHistory().places.map(stop=>{
    const shape=features.find(f=>Number(f.id)===Number(ISO_NUM[stop.country]));
    return shape?{stop,point:path.centroid(shape)}:null;
  }).filter(v=>v&&v.point.every(Number.isFinite));
  svg.append('polyline').attr('points',stops.map(v=>v.point.join(',')).join(' ')).attr('fill','none').attr('stroke','#b76b37').attr('stroke-width',2).attr('pointer-events','none');
  for(const {stop,point} of stops) svg.append('circle').attr('cx',point[0]).attr('cy',point[1]).attr('r',6).attr('fill','#ffcf83').attr('stroke','#654326').attr('tabindex',0).attr('role','button').attr('aria-label',(stop.city||stop.country)+' '+stop.year).on('click',()=>openPlace(stop)).on('keydown',e=>{if(e.key==='Enter')openPlace(stop);});
}
function playAtReunion(event){
  if(event.kind!=='reunion'||!['organize','attend'].includes(event.status)||!homeHistory().guitar||S.used.familyMusic)return;
  Q.push({e:'🎸',title:kt('Музыка на семейной встрече','Music at the family gathering','Музика на родинній зустрічі'),choices:[{t:kt('Сыграть для семьи','Play for the family','Зіграти для родини'),f:guitarMoment},{t:kt('В другой раз','Another time','Іншим разом'),f:()=>null}]});
}
