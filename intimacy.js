'use strict';
const affectionText = {
  title:['Близость и границы','Intimacy and boundaries','Близькість і межі'],
  setting:['Взрослые истории','Adult stories','Дорослі історії'],
  talk:['Обсудить личные границы','Talk about boundaries','Обговорити особисті межі'],
  hug:['Предложить объятие','Offer a hug','Запропонувати обійми'],
  kiss:['Предложить поцелуй','Ask for a kiss','Запропонувати поцілунок'],
  night:['Предложить провести ночь вместе','Ask to spend the night together','Запропонувати провести ніч разом'],
  own:['Какой уровень близости тебе комфортен сейчас?','What level of intimacy feels comfortable to you now?','Який рівень близькості тобі зараз комфортний?'],
  levels:[['Только разговор','Объятия','Поцелуи','Возможна совместная ночь'],['Conversation only','Hugs','Kisses','Open to spending the night together'],['Тільки розмова','Обійми','Поцілунки','Можлива спільна ніч']],
  yes:['Мне этого тоже хочется.','I’d like that too.','Я теж цього хочу.'],
  no:['Сегодня мне этого не хочется. Давай просто побудем рядом.','I don’t feel like that today. Let’s just spend time together.','Сьогодні мені цього не хочеться. Побудьмо просто поруч.'],
  proceed:['Я тоже хочу','I’d like that too','Я теж хочу'],
  cancel:['Не сейчас','Not now','Не зараз'],
  memory:[['Вы обнялись.','Вы поцеловались.','Вы провели ночь вместе. Утром вы ещё немного поговорили.'],['You shared a hug.','You shared a kiss.','You spent the night together. In the morning you stayed to talk.'],['Ви обійнялися.','Ви поцілувалися.','Ви провели ніч разом. Уранці ви ще трохи поговорили.']],
  next:['Вернуться к теме можно в следующем году.','You can revisit this next year.','До теми можна повернутися наступного року.'],
  intro:['Можно изменить свои границы или отказаться в любой момент.','You can change your boundaries or decline at any time.','Можна змінити свої межі або відмовитися будь-коли.']
};
function affectionLabel(key){return affectionText[key][LANG==='en'?1:LANG==='uk'?2:0];}
function adultStories(){return readLocal('life_adult_stories',false)===true;}
function intimacyAvailable(p){return adultStories() && coupleValid(p) && !S.prison;}
function intimacyState(p){
  const c=coupleState(p);
  return c.intimacy ||= {limit:0, preference:rnd(0,3), asked:{}};
}
function comfortableLevel(p){
  const state=intimacyState(p);
  if(relationshipHurt(p)>=20 || p.close<40)return 0;
  return Math.min(state.preference,p.close>=70 && relationshipTrust(p)>=50?3:p.close>=55?2:1);
}
function askAffection(p,level){
  if(!intimacyAvailable(p))return null;
  const s=intimacyState(p);
  if((p.country && p.country!==S.country) || s.limit<level || s.asked[level]===S.year)return null;
  s.asked[level]=S.year;
  const yes=comfortableLevel(p)>=level;
  if(!yes)for(let step=level;step<=3;step++)s.asked[step]=S.year;
  const year=S.year;
  let completed=false;
  const choices=[];
  if(yes)choices.push({t:affectionLabel('proceed'),f:()=>{
    if(completed || !intimacyAvailable(p) || S.year!==year || (p.country && p.country!==S.country) || s.limit<level || comfortableLevel(p)<level)return null;
    completed=true;const message=affectionLabel('memory')[level-1];
    relationshipRemember(p,'intimacy:'+level,message,2);p.close=clamp(p.close+2);eff({happy:2});return message;
  }});
  choices.push({t:affectionLabel('cancel'),f:()=>null});
  Q.push({e:'💞',title:p.name,text:affectionLabel(yes?'yes':'no'),choices});save();closeSheet();pump();return null;
}
EXTRA_PANELS.intimacy=function(){
  const p=partner();if(!intimacyAvailable(p))return;
  const s=intimacyState(p), levels=affectionLabel('levels');
  card('<b>'+esc(p.name)+'</b><p>'+esc(affectionLabel('intro'))+'</p>');
  const list=section(affectionLabel('title'));
  item(list,{e:'💬',t:affectionLabel('talk'),d:levels[s.limit],onClick:()=>{
    Q.push({e:'💬',title:affectionLabel('talk'),text:affectionLabel('own'),choices:levels.map((t,i)=>({t,f:()=>{
      if(!intimacyAvailable(p))return null;s.limit=i;return p.name+' · '+levels[comfortableLevel(p)];
    }})).concat([{t:affectionLabel('cancel'),f:()=>null}])});closeSheet();pump();
  }});
  ['hug','kiss','night'].forEach((key,i)=>item(list,{e:['🤗','💋','🌙'][i],t:affectionLabel(key),disabled:(p.country && p.country!==S.country) || s.limit<i+1 || s.asked[i+1]===S.year,d:s.asked[i+1]===S.year?affectionLabel('next'):'',onClick:()=>askAffection(p,i+1)}));
};
const affectionOptions=EXTRA_PANELS.options;
EXTRA_PANELS.options=function(){
  affectionOptions();
  item(section(affectionLabel('setting')),{e:'💞',t:affectionLabel('setting'),r:adultStories()?'✓':'○',onClick:()=>{writeLocal('life_adult_stories',!adultStories());openPanel('options');}});
};
const affectionCouple=EXTRA_PANELS.couple;
EXTRA_PANELS.couple=function(){
  affectionCouple();if(!intimacyAvailable(partner()))return;
  EXTRA_TITLES.intimacy=affectionLabel('title');
  item(section(affectionLabel('setting')),{e:'💞',t:affectionLabel('title'),onClick:()=>openPanel('intimacy')});
};
