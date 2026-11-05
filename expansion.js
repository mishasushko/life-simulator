'use strict';
let currentExpansionEvent=null;
const updateVersion='28';
function readLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function writeLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
const uxPrefs=Object.assign({font:100,volume:100,compact:false,toasts:true,favorites:[]},readLocal('life_interface',{}));
function applyInterface(){document.documentElement.style['--ui-scale']=uxPrefs.font/100;document.documentElement.style.setProperty?.('--ui-scale',uxPrefs.font/100);document.documentElement.dataset.compact=uxPrefs.compact?'yes':'no';writeLocal('life_interface',uxPrefs);}
applyInterface();
const normalToast=toast;
toast=function(message){if(uxPrefs.toasts)normalToast(message);};
document.addEventListener('keydown',event=>{
  if(!S || event.repeat || event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(event.target?.tagName))return;
  if(event.key==='/' && $('#modalWrap').hidden && S.alive){
    event.preventDefault();openPanel('menu');$('#sheetBody').querySelector('input[type=search]')?.focus();return;
  }
  if(!$('#modalWrap').hidden){
    if(/^[1-4]$/.test(event.key)){const b=$('#modalActions').children[Number(event.key)-1];if(b&&!b.disabled){event.preventDefault();b.click();}}
    if(event.key==='Escape'){
      const buttons=[...$('#modalActions').children];
      const back=buttons.find(b=>b.dataset.dismiss==='yes');
      if(back&&!back.disabled){event.preventDefault();back.click();}
      else if(S.alive && currentExpansionEvent){Q.unshift(currentExpansionEvent);closeModal();toast('Выбор отложен. Нажмите +1, чтобы продолжить событие.');}
    }
  }
});
function confirmAction(text,cost=0){return !text && !(cost>Math.max(0,S.money)/2) || window.confirm(text || 'Потратить '+fmt(cost)+'? Это больше половины доступных денег.');}
let rewindPoint=null;
const rememberAge=ageUp;
ageUp=function(){
  if(!S?.alive || !$('#modalWrap').hidden)return;
  if(Q.length){pump();return;}
  const before=!S.iron?JSON.stringify(S):null, year=S.year, slot=curSlot;
  rememberAge();
  if(S?.year===year+1)rewindPoint={before,year:S.year,life:S,slot};
};
function rewindLife(){
  const r=rewindPoint;if(!r?.before||S.iron||r.life!==S||r.slot!==curSlot||r.year!==S.year)return 'Нет доступного снимка этой жизни.';
  S=migrate(JSON.parse(r.before));rewindPoint=null;Q=[];closeModal();closeSheet();save();render();scrollLog();return null;
}
ageMany=function(n){for(let i=0;i<n && S?.alive && !Q.length && $('#modalWrap').hidden;i++){const year=S.year,ill=S.diseases.length,married=partner()?.status;ageUp();if(S.year===year||S.diseases.length!==ill||partner()?.status!==married||S.log.at(-1)?.items.some(e=>/^(💐|💒|🤒|🪦)/u.test(e.t)))break;}};
const badgeState=()=>S.alertTabs ||= {};
function flagTab(panel){badgeState()[panel]=true;refreshBadges();}
function refreshBadges(){for(const b of document.querySelectorAll('[data-panel]'))b.dataset.unread=S?.alertTabs?.[b.dataset.panel]?'yes':'no';}
const openExpansionPanel=openPanel;
let panelTrail = [];
let goingBack = false;
openPanel = function(name) {
  const previous = currentPanel;
  const body = $('#sheetBody');
  if (!goingBack && previous && previous !== name && !$('#sheetWrap').hidden) {
    panelTrail.push({name:previous,scroll:body.scrollTop});
    if (panelTrail.length > 12) panelTrail.shift();
  }
  if (S?.alertTabs) delete S.alertTabs[name];
  refreshBadges();
  const result = openExpansionPanel(name);
  if (panelTrail.length) {
    const back = document.createElement('button');
    back.className = 'btn ghost';back.textContent = '← Назад';
    body.prepend(back);
    back.onclick = () => {
      const target = panelTrail.pop();
      goingBack = true;
      try { openPanel(target.name); body.scrollTop = target.scroll; }
      finally { goingBack = false; }
    };
  }
  return result;
};
function controlField(label,type,value,onchange){
  const box=document.createElement('label');box.className='ux-control';box.textContent=label+' ';
  const input=document.createElement('input');input.type=type;input.value=value;input.oninput=()=>onchange(input.value);box.appendChild(input);$('#sheetBody').appendChild(box);return input;
}
function searchMatches(query, text) {
  const normalize = value => String(value).toLocaleLowerCase('ru').replace(/ё/g,'е').trim();
  const haystack = normalize(text);
  return normalize(query).split(/\s+/).every(word => haystack.includes(word));
}
let menuQuery = '';
const menuWithoutSearch = panelMenu;
panelMenu = function () {
  menuWithoutSearch();
  const body = $('#sheetBody');
  const rows = [...body.querySelectorAll('button.item')];
  const favoriteList = section('Избранное');
  const favoriteHeading = favoriteList.previousElementSibling;
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Найти раздел по названию или описанию';
  search.setAttribute('aria-label','Поиск по меню');
  search.value = menuQuery;
  const empty = document.createElement('p');
  empty.textContent = 'Подходящих разделов нет. Попробуйте другое слово.';
  body.prepend(empty);
  body.prepend(favoriteList);
  if (favoriteHeading) body.prepend(favoriteHeading);
  body.prepend(search);
  for (const row of rows) {
    const name = row.querySelector('.t')?.textContent;
    if (!name) continue;
    const pinned = uxPrefs.favorites.includes(name);
    if (pinned) item(favoriteList,{e:row.querySelector('.ico')?.textContent||'★',t:name,disabled:row.disabled,onClick:()=>row.click()});
    const star = document.createElement('button');
    star.textContent = pinned ? '★' : '☆';
    star.setAttribute('aria-label','Избранное: '+name);
    star.setAttribute('aria-pressed',String(pinned));
    const wrap = document.createElement('div');
    wrap.className = 'menu-entry';
    row.parentNode.insertBefore(wrap,row);
    wrap.append(row,star);
    star.onclick = () => {
      uxPrefs.favorites = pinned ? uxPrefs.favorites.filter(n=>n!==name) : [...uxPrefs.favorites,name];
      applyInterface();openPanel('menu');
    };
  }
  function filterMenu() {
    menuQuery = search.value;
    let count = 0;
    for (const row of rows) {
      const match = searchMatches(menuQuery,row.textContent);
      row.parentNode.hidden = !match;
      if (match) count++;
    }
    empty.hidden = count !== 0;
    favoriteList.hidden = !!menuQuery.trim() || !favoriteList.children.length;
    if (favoriteHeading) favoriteHeading.hidden = favoriteList.hidden;
    for (const title of body.querySelectorAll('.section-title')) {
      if (title === favoriteHeading) continue;
      const sectionList = title.nextElementSibling;
      if (sectionList?.querySelector('.menu-entry')) title.hidden = !sectionList.querySelector('.menu-entry:not([hidden])');
    }
  }
  search.oninput = filterMenu;
  filterMenu();
};
const closeSearchSheet = closeSheet;
closeSheet = function () { menuQuery = ''; panelTrail = []; closeSearchSheet(); };
Object.assign(EXTRA_TITLES,{options:'⚙ Настройки',journal:'📜 Поиск по журналу',worldplay:'🌍 Мир и возможности',release:'✨ Что нового'});
EXTRA_PANELS.options=()=>{
  card('Клавиша / открывает поиск. Клавиши 1–4 выбирают вариант события. Esc закрывает окно с кнопкой отмены. Пробел проживает год.');
  const f=controlField('Размер текста','range',uxPrefs.font,v=>{uxPrefs.font=Number(v);applyInterface();});f.min=85;f.max=135;f.value=uxPrefs.font;
  const v=controlField('Громкость эффектов','range',uxPrefs.volume,x=>{uxPrefs.volume=Number(x);applyInterface();});v.min=0;v.max=100;
  const list=section('Отображение');
  for(const [key,label] of [['compact','Компактный режим'],['toasts','Уведомления']])item(list,{e:'⚙',t:label,r:uxPrefs[key]?'Вкл.':'Выкл.',onClick:()=>{uxPrefs[key]=!uxPrefs[key];applyInterface();openPanel('options');}});
  item(list,{e:'↶',t:'Отмотать последний переход года',d:'До следующего перехода или перезагрузки',disabled:S.iron||!rewindPoint?.before||rewindPoint.life!==S,onClick:()=>{if(window.confirm('Вернуться к состоянию перед последним +1 год?'))rewindLife();}});
};
EXTRA_PANELS.journal=()=>{
  const input=controlField('События','search','',()=>draw()),select=document.createElement('select');
  for(const [v,t] of [['all','Все'],['good','Хорошие'],['bad','Плохие'],['money','Деньги']]){const opt=document.createElement('option');opt.value=v;opt.textContent=t;select.appendChild(opt);}
  $('#sheetBody').appendChild(select);const list=section('Результаты');select.onchange=draw;
  function draw(){list.innerHTML='';for(const year of [...S.log].reverse())for(const e of year.items){
    if(!searchMatches(input.value,year.year+' '+e.t+' '+(LANG==='ru'?'':trFull(e.t)||'')))continue;
    if(select.value==='money'?!/доход|денег|расход|ипотек|зарплат|плат[её]ж|налог|💸|💰|🧾/i.test(e.t):select.value!=='all'&&e.c!==select.value)continue;
    item(list,{e:'·',t:e.t,d:String(year.year)});
  }if(!list.children.length)list.textContent='Нет событий по этому запросу.';}draw();
};
const releaseText='Quality of Life: возврат к предыдущему разделу с сохранением прокрутки, поиск по нескольким словам и году, клавиша / для поиска и безопасное откладывание событий по Esc.';
EXTRA_PANELS.release=()=>card(releaseText);
const releaseShowGame=showGame;
showGame=function(){releaseShowGame();if(readLocal('life_release','')!==updateVersion){writeLocal('life_release',updateVersion);Q.push({e:'✨',title:'Что нового',text:releaseText});pump();}};
MENU_HOOKS.unshift(list=>{for(const id of ['options','journal','worldplay','release'])item(list,{e:'•',t:EXTRA_TITLES[id],onClick:()=>openPanel(id)});});
const continents={
  'Европа':'ru ua by gb de fr es it pt pl cz nl be at ie se fi dk is gr rs ch no ro hu bg sk si hr ba me mk al lt lv ee md cy mt lu ad li sm mc',
  'Азия':'kz jp kr cn tr ae in ge am az uz mn il sa th vn idn ph sg kg tj tm ir iq jo lb sy qa kw om pk bd lk np my kh la mm kp tw bh',
  'Африка':'eg ma ng ke za gh et tz ug sn ci cm dz tn ao mz zw mg ml bj',
  'Северная Америка':'us ca mx cu cr pa do gt jm hn ni sv bs tt',
  'Южная Америка':'ar br co cl pe ve ec bo uy py','Океания':'au nz fj'
};
const technologies=[
  [1920,'Радиовещание','radio','journalist'],[1980,'Персональные компьютеры','computer','dev'],[2010,'Электромобили','electric','engineer'],[2023,'Генеративный ИИ','ai','dev']
];
JOBS.push({id:'eco',e:'🌱',name:'Экология',yr:1970,edu:'bachelor',major:'bio',salary:850000,titles:['Полевой эколог','Эколог','Руководитель природоохранного проекта']});
for (const [year,name,key,field] of technologies) JOBS.push({
  id:'era_'+key,yr:year,e:'🔧',name,edu:'bachelor',major:field==='journalist'?'jour':field==='engineer'?'eng':'it',salary:900000,
  titles:['Специалист · '+name,'Ведущий специалист · '+name,'Руководитель отдела · '+name]
});
function worldState(){return S.worldPlay ||= {mutators:[],harvest:100,food:1,credentials:[],years:{},season:0,rank:0,monuments:[]};}
function mortgageRate(){return (S.credit??650)>=750?.045:(S.credit??650)>=650?.07:.105;}
function worldClimate(){
  const w=worldState(),risks=disTypes(S.country).filter(t=>['heat','drought','flood'].includes(t));
  w.weather=w.mutators.includes('winter')?'blizzard':risks.length&&chance(.23)?pick(risks):'normal';
  w.harvest=w.weather==='normal'?rnd(94,112):rnd(62,86);
  w.food=(2-w.harvest/100)*(w.mutators.includes('economy')?1.25:1);
  if(w.weather!=='normal')log('🌦️ '+DIS[w.weather].n+'. Урожай '+w.harvest+'%, продукты дороже.', 'info');
}
const worldYearMoney=yearMoney;
yearMoney=function(){lifeMeasure('Климат и продовольствие',worldClimate);return worldYearMoney();};
const eraSalary=jobSalary;
jobSalary=function(job){if(!job)return eraSalary(job);const tech=technologies.filter(([year,,,id])=>S.year>=year && id===job.id);return Math.round(eraSalary(job)*(1+tech.length*.05));};
function enrollAdult(id){
  const w=worldState(),degree=MAJORS.find(m=>m.id===id),fee=price(degree?120000:35000);
  if((id==='retrain'&&S.age<40)||S.age<18||S.prison||w.course||S.money<fee||S.edu.stage)return 'Сейчас поступление недоступно.';
  if(degree && (EDU_RANK[S.edu.level]<EDU_RANK.bachelor || S.edu.majors.includes(id)))return 'Нужен первый диплом и новая специальность.';
  S.money-=fee;w.course={id,years:degree?3:1};w.deductible=(w.deductible||0)+fee;return 'Вы записались на вечернюю программу.';
}
function worldYear(){
  const w=worldState();w.years[S.country]=(w.years[S.country]||0)+1;
  for(const [year,name] of technologies)if(year===S.year)log('💡 Распространяется новая технология: '+name+'.','info');
  if(S.job?.id==='dev' && S.year>=2023 && skillOf('code')<30 && chance(.12)){S.job.perf=clamp(S.job.perf-4);log('💻 Из-за новых требований к автоматизации потребовалось переобучение.','info');}
  if(w.mutators.includes('pandemic')&&chance(.18)&&!S.diseases.some(d=>d.id==='flu')){S.diseases.push({id:'flu',since:S.age});log('🤒 Волна инфекции затронула вашу семью.','bad');}
  if(w.course && !S.prison && --w.course.years<=0){
    const id=w.course.id,degree=MAJORS.find(m=>m.id===id);
    if(degree && !S.edu.majors.includes(id))S.edu.majors.push(id);
    else if(!degree){skills().code=clamp(skillOf('code')+18);if(S.age>=40 && id==='retrain'&&!S.edu.majors.includes('it') && EDU_RANK[S.edu.level]>=EDU_RANK.bachelor)S.edu.majors.push('it');}
    w.credentials.push(id);delete w.course;log('🎓 Вечерняя программа завершена.','good');
  }
  if(w.art && !S.prison){w.season++;const form=clamp(skillOf('art')+Math.min(15,S.age/3)-Math.max(0,S.age-65)/3-(w.injury?20:0));w.rank=clamp(Math.round(w.rank*.7+form*.3));if(w.injury)w.injury--;if(w.season%3===0)log('🎨 Выставочный сезон: рейтинг '+w.rank+'/100.','info');}
  if(w.deductible && S.job && !S.prison){const refund=Math.min(Math.round(w.deductible*.13),Math.round(jobSalary(S.job)*taxRate()));S.money+=refund;w.deductible=0;log('🧾 Вычет за образование: '+fmt(refund)+'.','info');}
  if(w.lastLevel!=null && S.job && S.job.lvl>w.lastLevel)flagTab('job');w.lastLevel=S.job?.lvl;
  if(S.narrative?.family.events.some(e=>e.status==='pending'&&e.year===S.year))flagTab('people');
  if(S.age===18||S.age===40)flagTab('activities');
}
YEAR_HOOKS.push(()=>lifeMeasure('Мир, технологии и обучение',worldYear));
function artTraining(){
  const w=worldState();if(S.prison||S.age<6||w.injury||S.used.artSeason)return null;
  S.used.artSeason=1;w.art=true;if(chance(.06)){w.injury=1;eff({health:-2});return 'Перегрузка кисти. Нужен сезон отдыха.';}
  skills().art=clamp(skillOf('art')+4);(S.practiced||={}).art=1;return 'Вы подготовили новую работу к выставке.';
}
function collectWorld(kind,country){
  const collection=readLocal('life_world_collection',{lives:[],leaders:[]});
  if(!collection[kind].includes(country)){collection[kind].push(country);writeLocal('life_world_collection',collection);}
}
const eraUnlock=unlock;
unlock=function(id){if(id==='president')collectWorld('leaders',S.country);return eraUnlock(id);};
DEATH_HOOKS.push(()=>{
  const w=worldState(),home=Object.keys(w.years).sort((a,b)=>w.years[b]-w.years[a])[0]||S.country;
  collectWorld('lives',home);
  const honor=S.pol?.lvl>=3?'Улица':w.rank>=65?'Музей':S.karma>=80 && S.age>=50?'Памятник':null;
  if(honor){const monument=honor+' в честь '+S.first+' · '+S.city;w.monuments.push(monument);log('🏛️ '+monument,'good');}
  const scores=readLocal('life_world_scores',[]);scores.push({name:S.first,year:S.year,mods:[...w.mutators],score:Math.round(lifeScore()*(1+w.mutators.length*.15))});writeLocal('life_world_scores',scores.sort((a,b)=>b.score-a.score).slice(0,10));
});
const eraHeir=continueAs;
continueAs=function(k){const honors=[...worldState().monuments];eraHeir(k);worldState().monuments=honors.slice(-12);if(honors.length){const ancestor=narrativeState().ancestors.at(-1);if(ancestor)ancestor.summary+=' '+honors.at(-1)+'.';narrativeNote('legacy','Память семьи: '+honors.slice(-3).join(', '));save();}};
EXTRA_PANELS.worldplay=()=>{
  const w=worldState();
  card('<b>Урожай '+w.harvest+'%</b><div>Индекс цен на еду '+Math.round(w.food*100)+'%. Доступные технологии: '+technologies.filter(t=>S.year>=t[0]).map(t=>t[1]).join(', ')+'</div>');
  const list=section('Обучение и карьера');
  for(const [id,label] of [['evening','Вечерние курсы программирования'],['retrain','Переобучение после 40'],...MAJORS.map(m=>[m.id,'Второе высшее · '+m.name])]){
    const degree=MAJORS.some(m=>m.id===id),fee=price(degree?120000:35000);
    item(list,{e:'🎓',t:label,d:'−'+fmt(fee)+' · '+(degree?'3 года':'1 год'),disabled:S.age<(id==='retrain'?40:18)||!!w.course||S.prison||!!S.edu.stage||S.money<fee||(degree&&(EDU_RANK[S.edu.level]<EDU_RANK.bachelor||S.edu.majors.includes(id))),onClick:act(()=>confirmAction('',fee)?enrollAdult(id):null)});
  }
  if(w.course)card('Осталось лет обучения: '+w.course.years);
  item(list,{e:'🎨',t:'Подготовиться к выставочному сезону',d:'Навык +4, возможна травма · рейтинг '+w.rank,disabled:S.age<6||S.prison||!!w.injury||!!S.used.artSeason,onClick:act(artTraining)});
  item(list,{e:'🏅',t:'Спортивная карьера',d:'Тренировки, травмы и соревнования',onClick:()=>openPanel('sport')});
  const mods=section('Мутаторы · выбираются при рождении');
  for(const [id,label] of [['economy','Жёсткая экономика'],['winter','Вечная зима'],['pandemic','Век пандемий']])item(mods,{e:'🎲',t:label,r:w.mutators.includes(id)?'Вкл.':'Выкл.',disabled:S.age!==0,onClick:act(()=>{if(S.age===0)w.mutators=w.mutators.includes(id)?w.mutators.filter(m=>m!==id):[...w.mutators,id];})});
  const c=readLocal('life_world_collection',{lives:[],leaders:[]}),regions=Object.entries(continents).filter(([,ids])=>c.lives.some(id=>ids.split(' ').includes(id)));
  card('<b>Коллекции стран</b><div>Завершённые жизни по континентам: '+regions.length+'/6. Президентство: '+c.leaders.length+'/3 страны.</div><small>'+esc(regions.map(([name])=>name).join(', '))+'</small>');
  if(w.monuments.length)card(w.monuments.map(esc).join('<br>'));
  const scores=readLocal('life_world_scores',[]);if(scores.length)card('<b>Рейтинг прохождений</b>'+scores.map(s=>'<div>'+esc(s.name)+' · '+s.score+' · '+esc(s.mods.join(', '))+'</div>').join(''));
};
