const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');

// A minimal DOM for running all classic game scripts in their production order.
// These checks exercise game state, queueing and controls, not browser layout.
class Node {
  constructor() { this.children = []; this.style = {}; this.dataset = {}; this.hidden = true; this.value = ''; this.classList = { add() {}, remove() {}, contains() { return false; }, toggle() {} }; this.parentNode = this; this.content = { firstChild: this }; this.options = []; }
  appendChild(n) { this.children.push(n); return n; }
  append(...nodes) { this.children.push(...nodes); }
  prepend(...nodes) { this.children.unshift(...nodes); }
  insertBefore(n) { return this.appendChild(n); }
  addEventListener() {}
  removeEventListener() {}
  setAttribute() {}
  querySelector() { return new Node(); }
  querySelectorAll() { return []; }
  closest() { return new Node(); }
  remove() {}
  scrollIntoView() {}
  getBoundingClientRect() { return { width: 390, height: 844 }; }
  set innerHTML(s) { this._html = s; this.children = []; }
  get innerHTML() { return this._html || ''; }
}
function game() {
  const nodes = new Map(), storage = new Map();
  const node = key => { if (!nodes.has(key)) nodes.set(key, new Node()); return nodes.get(key); };
  const context = vm.createContext({
    console, URL, URLSearchParams, Math: Object.create(Math), Date,
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) },
    document: { querySelector: node, getElementById: id => node('#' + id), querySelectorAll: () => [], createElement: () => new Node(), addEventListener() {}, removeEventListener() {}, documentElement: new Node(), body: new Node() },
    navigator: {}, location: { protocol: 'http:', search: '', hash: '', origin: 'http://localhost', pathname: '/', href: 'http://localhost/' },
    matchMedia: () => ({ matches: false }), setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {}, requestAnimationFrame: () => {}, addEventListener() {},
  });
  context.window = context;
  context.confirm = () => true;
  const run = s => vm.runInContext(s, context);
  const scripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g)].map(x => x[1]);
  for (const filename of scripts) vm.runInContext(fs.readFileSync(path.join(root, filename), 'utf8'), context, { filename });
  run(`render = () => {}; scrollLog = () => {}; sfx = () => {}; refreshSheet = () => {}; toast = () => {}; newLife({country:'by', year:2000, first:'Тест'}); Q = []; closeModal();`);
  return { run, nodes, context };
}
function plain(v) { return JSON.parse(JSON.stringify(v)); }

test('all production scripts load; v1 save gets defaults without inventing a move', () => {
  const {run} = game();
  assert.equal(run('S.lifeSystems'), undefined);
  assert.deepEqual(plain(run('lifeSystems().plan')), {work:4, family:2, study:2, rest:2});
  assert.equal(run('lifeSystems().migration'), undefined);
  assert.equal(run('lifeSystems().country'), 'by');
});

test('year report waits for event decisions and counts money exactly once', () => {
  const {run} = game();
  run(`S.age = 30; S.year = 2030; S.money = 1000000; S.stats.health = 100; S.skills = { music:50 }; S.genes = []; S.traits=[]; Math.random = () => 0.5;
    autoReport=true; var moneyBefore = S.money; ageUp();`);
  assert.equal(run('S.age'), 31);
  // Drain all choices through the same handlers used by the production modal.
  for (let i = 0; i < 50 && run('!!S.lifeSystems.pending'); i++) run(`document.querySelector('#modalActions').children.find(b => !b.disabled).onclick()`);
  assert.equal(run('!!S.lifeSystems.report'), true);
  assert.equal(run('S.lifeSystems.pending'), undefined);
  const total = run(`S.lifeSystems.report.steps.reduce((n,s)=>n+(s.changes.money||0),0)`);
  assert.equal(total, run('S.money - moneyBefore'));
  assert.match(run('lifeReportHTML(S.lifeSystems.report)'), /Музыка|Музык/);
  assert.equal(run(`S.lifeSystems.report.steps.filter(s => s.changes['skill:music']).reduce((n,s)=>n+s.changes['skill:music'],0)`), -1);
  run('ageUp()'); assert.equal(run('S.age'), 31, 'open summary blocks another year');
});

test('queued decisions are included before summary and can change countries', () => {
  const {run} = game();
  run(`autoReport=true; var x = lifeSystems(); x.pending={year:2001,age:1,steps:[]};
    Q.push({title:'Test',choices:[{t:'Choose',f:()=>{S.money+=123; S.country='us';}}]}); pump();`);
  assert.equal(run('!!S.lifeSystems.pending'), true);
  run(`document.querySelector('#modalActions').children[0].onclick()`);
  assert.equal(run('S.lifeSystems.report.steps[0].changes.money'), 123);
  assert.equal(run('S.lifeSystems.migration.country'), 'us');
  assert.equal(run('S.lifeSystems.pending'), undefined);
  assert.equal(run(`document.querySelector('#modalTitle').textContent`), 'Итоги 2001 года');
});

test('time allocation changes actual pay, grades, stress and family closeness', () => {
  const {run} = game();
  run(`S.age=30; S.job={id:'dev',lvl:0,bonus:1,perf:50}; S.edu.stage='uni'; S.edu.grade=50; S.stress=20; var p = S.people[0]; p.close=50;
    var normalPay=jobSalary(S.job); lifeSystems().plan={work:6,family:1,study:2,rest:1}; var highPay=jobSalary(S.job); lifePlanYear();`);
  assert.equal(run('highPay'), Math.round(run('normalPay') * 1.2));
  assert.equal(run('S.stress'), 32);
  assert.equal(run('p.close'), 48);
  run('lifeSystems().plan={work:2,family:3,study:3,rest:2}; lifePlanYear();');
  assert.equal(run('S.edu.grade'), 52);
  assert.equal(run('p.close'), 50);
  run('S.prison={years:3}; var previous=S.stress; lifePlanYear();');
  assert.equal(run('S.stress'), run('previous'));
});

test('plan controls preserve the 10-share budget and never create negative shares', () => {
  const {run} = game();
  run('openPanel("lifeplan")');
  // Preset buttons are the second child after the card.
  run(`document.querySelector('#sheetBody').children[1].children[1].onclick()`);
  assert.deepEqual(plain(run('lifeSystems().plan')), {work:6,family:1,study:2,rest:1});
  for (let i=0;i<12;i++) run(`EXTRA_PANELS.lifeplan(); var list=document.querySelector('#sheetBody').children.at(-2); list.children[0].children.at(-1).children[0].onclick();`);
  assert.equal(run('Object.values(lifeSystems().plan).reduce((a,b)=>a+b,0)'), 10);
  assert.equal(run('Math.min(...Object.values(lifeSystems().plan)) >= 0'), true);
});

test('NPC goals persist, progress into careers and respect independent choices', () => {
  const {run} = game();
  run(`S.age=40; S.people=[makePerson('child',{age:20,name:'Аня'})]; var p=S.people[0]; p.lifePath={goal:0,character:'самостоятельный',progress:80,next:S.year,asked:S.year}; Math.random=()=>0.5; lifePeopleYear();`);
  assert.equal(run('p.job'), 'Художник');
  assert.equal(run('p.lifePath.goal'), 0);
  run(`p.lifePath.asked=0; Math.random=()=>0; lifePeopleYear(); var close=p.close; Q.pop().choices[2].f();`);
  assert.equal(run('p.close'), run('close - 20'));
  assert.equal(run('p.lifePath.goal'), 0);
});

test('10-year story has delayed endings affected by trust and the midpoint choice', () => {
  for (const choice of ['together','control','gift']) {
    const {run}=game();
    run(`S.age=30; S.money=1000000; S.people=[makePerson('friend',{name:'Друг',age:30,close:80})]; lifeStartStory(); var a=lifeSystems().stories[0]; S.year=a.start+5; lifeStoryYear();`);
    assert.equal(run('a.done'), false);
    run(`Q.pop().choices[${['together','control','gift'].indexOf(choice)}].f(); lifeSystems().rep.city=70; S.year=a.start+10; var money=S.money; lifeStoryYear();`);
    assert.equal(run('a.done'), true);
    assert.equal(run('a.choice'), choice);
    assert.ok(run('a.ending.length') > 10);
    if(choice==='together') assert.ok(run('S.money > money'));
    const money=run('S.money'); run('lifeStoryYear()'); assert.equal(run('S.money'),money,'ending pays only once');
  }
});

test('migration has bounded progress, diploma checks, spending guards and eventual completion', () => {
  const {run}=game();
  run(`lifeSystems(); S.edu.level='bachelor'; S.country='us'; lifeMove('by'); S.money=1000000; lifeMigrationAction('language'); var money=S.money; lifeMigrationAction('language');`);
  assert.equal(run('S.lifeSystems.migration.language'),25);
  assert.equal(run('S.money'),run('money'));
  run('for(let i=0;i<12;i++){S.year++; lifeMigrationYear();}');
  assert.equal(run('S.lifeSystems.migration.done'),true);
  assert.equal(run('S.lifeSystems.migration.diploma'),true);
  assert.ok(run('S.lifeSystems.migration.language >= 60 && S.lifeSystems.migration.language <= 100')); 
});

test('reputation opens recommendations on a five-year cooldown', () => {
  const {run}=game();
  run(`S.age=30; S.job={perf:80}; lifeSystems().rep.work=80; lifeReputationYear();`);
  assert.equal(run('S.job.perf'),90);
  run('lifeReputationYear()'); assert.equal(run('S.job.perf'),90);
  run('S.year+=5; lifeReputationYear()'); assert.equal(run('S.job.perf'),100);
});

test('legacy carries contacts, tradition and business without creating estate value', () => {
  const {run}=game();
  run(`S.age=60; S.money=2000000; S.genes=[]; S.collect=[]; S.people=[makePerson('child',{age:30,name:'Наследник'}),makePerson('friend',{age:50,close:90})];
    S.biz={name:'Семейное дело',type:'shop',value:1000000,start:500000,staff:2,own:100};
    var estate=netWorth(); var heir=S.people[0]; lifeSystems().legacy.tradition='learning'; continueAs(heir);`);
  assert.equal(run('S.lifeSystems.legacy.tradition'),'learning');
  assert.equal(run('S.lifeSystems.legacy.generations'),2);
  assert.equal(run('S.people.filter(p=>p.role==="friend").length'),1);
  assert.equal(run('S.biz.name'),'Семейное дело');
  assert.equal(run('netWorth()'),run('Math.round(estate*0.87)'));
});

test('existing dynasty business is not charged twice by the new legacy system', () => {
  const {run}=game();
  run(`S.age=60; S.money=2000000; S.genes=[]; S.collect=[]; S.people=[makePerson('child',{age:30})];
    S.biz={name:'Династия',type:'shop',value:1000000,start:500000};
    S.dyn={honor:0,fund:0,heirlooms:[],founded:1950}; var estate=netWorth(); continueAs(S.people[0]);`);
  assert.equal(run('netWorth()'),run('Math.round(estate*0.87)+130000'));
});

test('new systems and last report survive save/load; new lives do not retain them', () => {
  const {run}=game();
  run(`lifeSystems().rep.city=80; lifeSystems().plan.work=5; lifeSystems().plan.rest=1; save(); var reloaded=loadSave(); S=migrate(reloaded);`);
  assert.equal(run('lifeSystems().rep.city'),80);
  assert.equal(run('lifeSystems().plan.work'),5);
  run(`newLife({country:'by',year:2000});`);
  assert.equal(run('S.lifeSystems'),undefined);
});

test('a pending report on death gives way to the death screen', () => {
  const {run}=game();
  run(`lifeSystems().pending={year:2001,age:1,steps:[]}; S.alive=false; Q=[]; closeModal(); pump();`);
  assert.equal(run('S.lifeSystems.pending'),undefined);
  assert.equal(run(`document.querySelector('#modalTitle').textContent`),'Покойтесь с миром');
});

test('cash receipts and payments reconcile to the annual balance, including decisions', () => {
  const {run}=game();
  run(`var x=lifeSystems(); x.pending={year:2001,age:1,steps:[],cash:[]}; var before=S.money; lifeObserveMoney();
    lifeMeasure('Доход и расходы',()=>{S.money+=1000;S.money-=300;});
    Q.push({title:'Choice',choices:[{t:'Pay',f:()=>{S.money-=200;}}]}); pump();
    document.querySelector('#modalActions').children[0].onclick();`);
  assert.equal(run('S.lifeSystems.report.cash.filter(f=>f.delta>0).reduce((n,f)=>n+f.delta,0)'),1000);
  assert.equal(run('S.lifeSystems.report.cash.filter(f=>f.delta<0).reduce((n,f)=>n-f.delta,0)'),500);
  assert.equal(run('S.money-before'),500);
});

test('family and community trust open help and new local contacts', () => {
  const {run}=game();
  run(`S.age=30; S.money=-50000; S.people=[makePerson('mother',{age:50,money:1000000,close:80})]; lifeSystems().rep.family=80; lifeSystems().rep.city=80; lifeReputationYear();`);
  assert.equal(run('S.money'),0);
  assert.equal(run('S.people.filter(p=>p.role==="friend").length'),1);
  run('S.money=-50000; lifeReputationYear()');
  assert.equal(run('S.money'),-50000);
  assert.equal(run('S.people.filter(p=>p.role==="friend").length'),1);
});

test('starting a new life from an event does not treat birth as emigration', () => {
  const {run}=game();
  run(`Q.push({title:'New life',choices:[{t:'Start',f:()=>newLife({country:'us',year:2000})}]}); pump(); document.querySelector('#modalActions').children[0].onclick();`);
  assert.equal(run('S.country'),'us');
  assert.equal(run('S.lifeSystems?.migration'),undefined);
});

test('seeded full-lifespan runs reconcile reports and render all new panels', () => {
  for (const initialSeed of [11,42,2026]) {
    const {run}=game();
    run(`var seed=${initialSeed}; Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};`);
    for(let year=0; year<110 && run('S.alive'); year++) {
      run('closeModal(); Q=[]; var yearMoneyBefore=S.money; ageUp();');
      for(let i=0;i<100 && run('!!S.lifeSystems.pending');i++) {
        run(`var available=document.querySelector('#modalActions').children.find(b=>!b.disabled); if(available) available.onclick(); else pump();`);
      }
      assert.equal(run('S.lifeSystems.pending'),undefined);
      assert.equal(run('S.lifeSystems.report.cash.reduce((n,f)=>n+f.delta,0)'),run('S.money-yearMoneyBefore'));
      run(`closeModal(); for(const panel of ['yearreport','lifeplan','lifepaths','lifestories','adaptation','reputation','legacy','dreams','childhood','workplace','familyevents','biography']) openPanel(panel); closeSheet();`);
    }
  }
});

function coupleGame() {
  const g = game();
  g.run(`S.age=30; S.gender='m'; S.money=1000000; S.people=[];
    var p=makePerson('partner',{name:'Партнёр',gender:'f',age:28,close:80,country:S.country,status:'married',job:'Врач'}); S.people.push(p);
    var c=coupleState(p); c.children='yes'; c.home='adventure'; c.career='balance'; Math.random=()=>0.1;`);
  return g;
}
function clickChoice(run, text) { run(`document.querySelector('#modalActions').children.find(b=>b.textContent.includes(${JSON.stringify(text)})&&!b.disabled).onclick()`); }

test('person dialog records quarrels and exposes memory without parsing action labels', () => {
  const {run}=coupleGame();
  run(`var friend=makePerson('friend',{age:30,close:80}); S.people.push(friend); personModal(friend);`);
  clickChoice(run,'Поссориться');
  assert.equal(run('relationshipHurt(friend)'),10);
  assert.equal(run('relationshipState(friend).entries[0].kind'),'fight');
  run('personModal(friend)'); clickChoice(run,'Воспоминания');
  assert.match(run(`document.querySelector('#modalText').innerHTML`),/тяжёлую ссору/);
});

test('gifts and apologies cannot erase betrayal or immediately restore cooperation', () => {
  const {run}=coupleGame();
  run(`relationshipRemember(p,'betrayal','Предательство',0,30); p.close=50; personModal(p);`);
  clickChoice(run,'Подарок');
  assert.ok(run('p.close <= 53'));
  assert.equal(run('relationshipHurt(p)'),30);
  run('relationshipApologize(p); relationshipApologize(p)');
  assert.equal(run('relationshipHurt(p)'),28);
  assert.equal(run(`coupleOpinion(p,'children').agree`),false);
});

test('attention over different years heals wounds; fresh hurt blocks instant recovery', () => {
  const {run}=coupleGame();
  run(`relationshipRemember(p,'fight','Ссора',0,12); relationshipAction(p,'time',()=>{p.close+=5;}); S.year++; relationshipYear();`);
  assert.equal(run('relationshipHurt(p)'),12);
  run(`relationshipAction(p,'time',()=>{p.close+=5;}); S.year++; relationshipYear();`);
  assert.equal(run('relationshipHurt(p)'),9);
});

test('memory storage is bounded without discarding unresolved damage', () => {
  const {run}=coupleGame();
  run(`relationshipRemember(p,'betrayal','Давняя обида',0,30); for(let i=0;i<50;i++){S.year++;relationshipRemember(p,'time','Хороший день',2);}`);
  assert.equal(run('relationshipState(p).entries.length'),32);
  assert.equal(run('relationshipHurt(p)'),30);
});

test('memories and partner preferences persist through save/load but do not become an heir\'s personal history', () => {
  const {run}=coupleGame();
  run(`relationshipRemember(p,'betrayal','Личная обида',0,30); save(); S=migrate(loadSave()); p=S.people[0]; c=coupleState(p);`);
  assert.equal(run('relationshipHurt(p)'),30);
  assert.equal(run('c.children'),'yes');
  run(`S.relationshipIdentity='new-generation';`);
  assert.equal(run('relationshipHurt(p)'),0);
  assert.equal(run('relationshipTrust(p)'),50);
});

test('partner can refuse parenthood; agreeing delegates to the existing birth mechanics', () => {
  for(const willing of [false,true]) {
    const {run}=coupleGame();
    run(`c.children=${JSON.stringify(willing?'yes':'no')}; tryBaby(p);`);
    clickChoice(run,'стать родителями сейчас');
    assert.equal(run('S.people.filter(v=>v.role==="child").length'),willing?1:0);
    assert.equal(run('c.pending'),undefined);
  }
});

test('delayed parenthood is a promise to talk, and can still be declined next year', () => {
  const {run}=coupleGame();
  run(`c.children='later'; requestCoupleDecision(p,'children');`);
  clickChoice(run,'Подготовиться');
  assert.equal(run('S.stat.kids'),0);
  run(`S.year++;S.used={};requestCoupleDecision(p,'children');`);
  assert.equal(run(`coupleOpinion(p,'children').agree`),true);
  clickChoice(run,'Оставить всё');
  assert.equal(run('S.stat.kids'),0);
  assert.equal(run('c.preparation'),undefined);
  assert.equal(run(`relationshipState(p).entries.some(e=>e.kind==='promise-kept:children')`),true);
});

test('pending conversations resume after reload and old callbacks cannot act twice', () => {
  const {run}=coupleGame();
  run(`requestCoupleDecision(p,'move','us'); var oldAction=document.querySelector('#modalActions').children[0].onclick; save(); S=migrate(loadSave()); p=S.people[0]; c=coupleState(p); Q=[]; closeModal(); requestCoupleDecision(p,'move','us');`);
  clickChoice(run,'переехать вместе');
  assert.equal(run('S.country'),'us');
  const money=run('S.money'); run('oldAction()'); assert.equal(run('S.money'),money);
});

test('joint move requires consent and funds; solo move keeps partner abroad and records hurt', () => {
  const {run}=coupleGame();
  run(`c.home='roots';var before=S.money;requestHouseholdMove('us');`);
  clickChoice(run,'переехать вместе');
  assert.equal(run('S.country'),'by'); assert.equal(run('S.money'),run('before'));
  run(`S.year++;S.used={};requestHouseholdMove('us');`);
  clickChoice(run,'Переехать отдельно');
  assert.equal(run('S.country'),'us'); assert.equal(run('p.country'),'by');
  assert.equal(run('relationshipHurt(p)'),18);
  run(`S.money=0;var country=S.country;couplePerformMove('fr',null,false);`);
  assert.equal(run('S.country'),run('country'));
});

test('joint move updates family country and integrates with adaptation exactly once', () => {
  const {run}=coupleGame();
  run(`S.people.push(makePerson('child',{age:5,country:S.country}));var before=S.money;var cost=price(300000);requestHouseholdMove('us');`);
  clickChoice(run,'переехать вместе');
  assert.equal(run('S.money'),run('before-cost'));
  assert.equal(run('p.country'),'us');
  assert.equal(run('S.people[1].country'),'us');
  assert.equal(run('lifeSystems().migration.country'),'us');
  assert.equal(run(`S.log.flatMap(b=>b.items).filter(i=>i.t.startsWith('🛬 Новая страна')).length`),1);
});

test('family care affects real pay for two annual transitions and restores the previous plan', () => {
  const {run}=coupleGame();
  run(`S.people.push(makePerson('child',{age:5})); S.job={id:'dev',lvl:0,bonus:1,perf:50}; var salary=jobSalary(S.job); var initial=JSON.stringify(lifeSystems().plan); requestCoupleDecision(p,'care');`);
  clickChoice(run,'Я сокращу');
  assert.equal(run('lifeSystems().plan.work'),2);
  assert.equal(run('jobSalary(S.job)'),Math.round(run('salary')*0.8));
  run('S.year+=2;relationshipYear()');
  assert.equal(run('JSON.stringify(lifeSystems().plan)'),run('initial'));
});

test('partner can decline a career pause; accepted pauses survive NPC career updates', () => {
  const {run}=coupleGame();
  run(`S.people.push(makePerson('child',{age:5}));c.career='ambition';requestCoupleDecision(p,'care');`);
  clickChoice(run,'партнёру паузу');
  assert.equal(run('p.job'),'Врач'); assert.equal(run('c.care'),undefined);
  run(`S.year++;S.used={};c.career='balance';requestCoupleDecision(p,'care');`);
  clickChoice(run,'партнёру паузу');
  assert.equal(run('p.job'),'Перерыв в карьере');
  run(`lifeNPC(p).progress=100;lifeNPC(p).next=S.year;lifePeopleYear();`);
  assert.equal(run('p.job'),'Перерыв в карьере');
  run('S.year+=2;relationshipYear()'); assert.equal(run('p.job'),'Врач');
});

test('care expiration preserves manual plan edits; invalid partners cannot resolve stale choices', () => {
  const {run}=coupleGame();
  run(`S.people.push(makePerson('child',{age:5}));coupleSetCare(p,'shared');lifeSystems().plan={work:1,family:3,study:3,rest:3};S.year+=2;relationshipYear();`);
  assert.equal(run('lifeSystems().plan.work'),1);
  run(`requestCoupleDecision(p,'children');p.alive=false;`);
  clickChoice(run,'стать родителями сейчас');
  assert.equal(run('S.people.filter(v=>v.role==="child").length'),1);
});

test('forgotten promises become specific memories; partners proactively ask to share childcare', () => {
  const {run}=coupleGame();
  run(`couplePromise(p,'move','us');S.year+=3;relationshipYear();`);
  assert.equal(run('relationshipHurt(p)'),10);
  run(`S.people.push(makePerson('child',{age:5}));lifeSystems().plan={work:6,family:1,study:2,rest:1};relationshipYear();`);
  assert.equal(run('Q.length'),1);
  assert.equal(run('c.pendingRequest'),true);
  assert.equal(run(`document.querySelector('#modalWrap').hidden`),true,'annual hook only queues the request');
});

test('care agreements end after breakup or death without leaving a permanent workload reduction', () => {
  for(const ending of ['breakup','death']) {
    const {run}=coupleGame();
    run(`S.people.push(makePerson('child',{age:5}));var initial=JSON.stringify(lifeSystems().plan);coupleSetCare(p,'player');`);
    if(ending==='breakup') run(`relationshipAction(p,'breakup',()=>{p.role='ex';});`);
    else run(`p.alive=false;relationshipYear();`);
    assert.equal(run('JSON.stringify(lifeSystems().plan)'),run('initial'));
    assert.equal(run('c.care'),undefined);
  }
});

test('adoption still requires a valid partner and sufficient money after consent', () => {
  const {run}=coupleGame();
  run(`S.gender='f';requestCoupleDecision(p,'children');`);
  clickChoice(run,'стать родителями сейчас');
  assert.equal(run(`document.querySelector('#modalTitle').textContent`),'Усыновление');
  run('S.money=0');clickChoice(run,'Усыновить');
  assert.equal(run('S.stat.kids'),0);
});

test('annual reports reconcile money and relationship changes made during joint decisions', () => {
  const {run}=coupleGame();
  run(`var x=lifeSystems();x.pending={year:2001,age:1,steps:[],cash:[]};lifeObserveMoney();var moveCost=price(300000);requestCoupleDecision(p,'move','us');`);
  clickChoice(run,'переехать вместе');
  assert.equal(run('S.lifeSystems.pending'),undefined);
  assert.equal(run('S.lifeSystems.report.cash.reduce((n,f)=>n+f.delta,0)'),run('-moveCost'));
  assert.equal(run(`S.lifeSystems.report.steps.reduce((n,s)=>n+(s.changes['person:'+p.id]||0),0)`),5);
});

test('discovered infidelity in the existing event creates a lasting memory', () => {
  const {run}=coupleGame();
  run(`EVENTS.find(e=>e.run.toString().includes('Искушение')).run();pump();`);
  clickChoice(run,'Поддаться');
  assert.equal(run('relationshipHurt(p)'),30);
  assert.equal(run('p.close'),30);
  assert.equal(run(`relationshipState(p).entries[0].kind`),'betrayal');
});

test('supporting a close person\'s goal in the existing annual event is remembered', () => {
  const {run}=coupleGame();
  run(`lifeNPC(p).asked=0;lifePeopleYear();pump();`);
  clickChoice(run,'Поддержать выбор');
  assert.equal(run(`relationshipState(p).entries.some(e=>e.kind==='goal-support')`),true);
});

test('dream choice records completion once and preserves earlier chapters on revision', () => {
  const {run}=game();
  run(`S.age=18;chooseLifeDream('music');skills().music=80;var happy=S.stats.happy;checkLifeDream(false);var after=S.stats.happy;checkLifeDream(false);`);
  assert.equal(run('narrativeState().dreams[0].done'),run('S.year'));
  assert.equal(run('S.stats.happy'),run('after'));
  run(`chooseLifeDream('world');chooseLifeDream('family');`);
  assert.equal(run('narrativeState().dreams.at(-1).id'),'world');
  run(`S.year+=5;chooseLifeDream('family');`);
  assert.equal(run('narrativeState().dreams.at(-2).abandoned'),run('S.year'));
  assert.equal(run('narrativeState().dreams[0].id'),'music');
});

test('peace dream requires five distinct consecutive adult years', () => {
  const {run}=game();
  run(`S.age=20;chooseLifeDream('peace');S.stats.happy=80;S.stats.health=80;S.stress=20;checkLifeDream(true);checkLifeDream(true);`);
  assert.equal(run('narrativeDreamProgress("peace").value'),1);
  run(`S.year++;S.stress=80;checkLifeDream(true);`);
  assert.equal(run('narrativeDreamProgress("peace").value'),0);
  run(`S.stress=20;for(let i=0;i<5;i++){S.year++;checkLifeDream(true);}`);
  assert.equal(run('!!narrativeState().dreams[0].done'),true);
});

test('adult legacy saves do not invent childhood or apply retroactive upbringing', () => {
  const {run}=game();
  run(`delete S.narrative;S.age=40;var stats=JSON.stringify(S.stats);narrativeState();narrativeChildhoodYear();`);
  assert.equal(run('narrativeState().origin.known'),false);
  assert.equal(run('JSON.stringify(S.stats)'),run('stats'));
  assert.match(run('narrativeBiographyHTML(narrativeBiographyData())'),/Сведений о прошлом детстве/);
});

test('childhood affects each future year once, and free clubs remain available without parental money', () => {
  const {run}=game();
  run(`S.age=8;var o=narrativeState().origin;o.style='strict';o.area='quiet';o.interest='music';skills().music=0;S.edu.grade=50;S.stats.happy=60;S.people.forEach(p=>p.money=0);narrativeChildhoodYear();narrativeChildhoodYear();`);
  assert.equal(run('S.edu.grade'),52);
  assert.equal(run('S.stats.happy'),59);
  run('childhoodLesson(true)'); assert.equal(run('S.used.childhoodLesson'),undefined);
  run('childhoodLesson(false)'); assert.equal(run('skillOf("music")'),3);
  run('childhoodLesson(false)'); assert.equal(run('skillOf("music")'),3);
});

function workGame() {
  const g=game();
  g.run(`S.age=30;S.money=1000000;S.job={id:'dev',lvl:0,perf:80,years:3,lvlYears:3,bonus:1};
    var randomSeed=19;Math.random=()=>{randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296;};
    var w=workplaceState();var colleague=S.people.find(p=>p.id===w.people[2]);`);
  return g;
}

test('workplaces have stable people; a new employment keeps former contacts but rejects old projects', () => {
  const {run}=workGame();
  run('var ids=JSON.stringify(w.people);workplaceState();');
  assert.equal(run('JSON.stringify(w.people)'),run('ids'));
  run(`S.job={id:'dev',lvl:0,perf:50,years:0,lvlYears:0,bonus:1};S.stat.jobs++;workplaceState();var perf=S.job.perf;workplaceProject(w,colleague,'credit');`);
  assert.equal(run('S.job.perf'),run('perf'));
  assert.equal(run('narrativeState().formerWorkplaces.length'),1);
  assert.equal(run('new Set(narrativeState().workplace.people).size'),4);
});

test('helping or taking credit changes actual colleague memories and performance', () => {
  for(const choice of ['help','credit']) {
    const {run}=workGame();
    run(`workplaceProject(w,colleague,${JSON.stringify(choice)});var perf=S.job.perf;workplaceProject(w,colleague,'help');`);
    assert.equal(run('S.job.perf'),run('perf'));
    assert.equal(run('relationshipHurt(colleague)'),choice==='credit'?20:0);
    assert.equal(run('relationshipState(colleague).entries[0].kind'),choice==='credit'?'stolen-credit':'work-help');
  }
});

test('mentor and boss affect work; promotion can be accepted or passed to a colleague', () => {
  for(const choice of ['accept','recommend']) {
    const {run}=workGame();
    run(`S.people.find(p=>p.id===w.people[0]).close=80;S.people.find(p=>p.id===w.people[1]).close=80;var before=S.job.perf;narrativeWorkYear();`);
    assert.equal(run('S.job.perf'),run('before+4'));
    run(`workplacePromotion(w,colleague,${JSON.stringify(choice)});`);
    assert.equal(run('S.job.lvl'),choice==='accept'?1:0);
  }
});

test('family invitations reflect recorded milestones and are deduplicated', () => {
  const {run}=game();
  run(`S.age=50;S.people=[makePerson('child',{age:18,name:'Ребёнок'})];var child=S.people[0];narrativeFamilyYear();`);
  assert.equal(run('narrativeState().family.events.length'),0);
  run(`child.schoolGraduatedYear=S.year;narrativeFamilyYear();narrativeFamilyYear();`);
  assert.equal(run('narrativeState().family.events.length'),1);
  run(`child.age=25;child.familyMarriedYear=S.year;narrativeFamilyYear();`);
  assert.equal(run('narrativeState().family.events.filter(e=>e.kind==="wedding").length'),1);
});

test('family attendance checks funds, records a memory, and cannot spend twice', () => {
  const {run}=coupleGame();
  run(`var event=addFamilyOccasion(p,'anniversary');S.money=0;resolveFamilyOccasion(event,'organize');`);
  assert.equal(run('event.status'),'pending');
  run(`S.money=100000;var money=S.money;var fee=price(80000);resolveFamilyOccasion(event,'organize');resolveFamilyOccasion(event,'organize');`);
  assert.equal(run('S.money'),run('money-fee'));
  assert.equal(run('event.status'),'organize');
  assert.equal(run(`relationshipState(p).entries.some(e=>e.kind==='family:'+event.id)`),true);
});

test('pending invitations survive reload; dead people and stale callbacks cannot impose costs', () => {
  const {run}=coupleGame();
  run(`var event=addFamilyOccasion(p,'jubilee');save();S=migrate(loadSave());p=S.people[0];var restored=narrativeState().family.events[0];var money=S.money;resolveFamilyOccasion(event,'organize');`);
  assert.equal(run('S.money'),run('money'));
  run(`p.alive=false;resolveFamilyOccasion(restored,'organize');`);
  assert.equal(run('restored.status'),'cancelled');
  assert.equal(run('S.money'),run('money'));
});

test('missed family invitations leave one lasting memory, with a free remote alternative', () => {
  const {run}=coupleGame();
  run(`var event=addFamilyOccasion(p,'jubilee');S.year++;narrativeFamilyYear();var hurt=relationshipHurt(p);narrativeFamilyYear();`);
  assert.equal(run('event.status'),'missed');
  assert.equal(run('relationshipHurt(p)'),run('hurt'));
  run(`var other=addFamilyOccasion(p,'reunion');S.money=0;resolveFamilyOccasion(other,'remote');`);
  assert.equal(run('other.status'),'remote'); assert.equal(run('S.money'),0);
});

test('biography uses recorded facts, escapes names and is available from the death screen', () => {
  const {run}=coupleGame();
  run(`S.first='<script>alert(1)</script>';narrativeNote('family','Реальная семейная встреча');S.age=70;die('Естественные причины');Q=[];closeModal();showDeath();`);
  clickChoice(run,'Прочитать биографию');
  assert.equal(run(`document.querySelector('#modalTitle').textContent`),'Биография');
  assert.match(run(`document.querySelector('#modalText').innerHTML`),/Реальная семейная встреча/);
  assert.equal(run(`document.querySelector('#modalText').innerHTML.includes('<script>')`),false);
  assert.equal(run('narrativeState().finalBiography.age'),70);
});

test('succession carries a bounded family chronicle without inheriting personal dreams', () => {
  const {run}=coupleGame();
  run(`chooseLifeDream('world');narrativeNote('work','Семейный проект');var kid=makePerson('child',{age:25,name:'Наследник'});S.people.push(kid);continueAs(kid);`);
  assert.equal(run('narrativeState().ancestors.length'),1);
  assert.equal(run('narrativeState().dreams.length'),0);
  assert.match(run('narrativeState().ancestors[0].summary'),/Семейный проект/);
});

test('workplace project resumes after reload and old callback cannot change the restored game', () => {
  const {run}=workGame();
  run(`S.year=w.since+3;narrativeWorkYear();var stale=w;var oldColleague=colleague;save();S=migrate(loadSave());Q=[];closeModal();w=workplaceState();var perf=S.job.perf;workplaceProject(stale,oldColleague,'credit');openWorkplaceEvent(w);pump();`);
  assert.equal(run('S.job.perf'),run('perf'));
  clickChoice(run,'Помочь коллеге');
  assert.equal(run('S.job.perf'),run('Math.min(100,perf+3)'));
  assert.equal(run('w.pending'),undefined);
});

test('family photos keep the original faces and pass to the next generation', () => {
  const {run}=coupleGame();
  run("var child=makePerson('child',{name:'Анна',age:18});S.people.push(child);var invitation=addFamilyOccasion(child,'graduation');resolveFamilyOccasion(invitation,'remote');");
  assert.equal(run('S.familyPhotos.length'),1);
  run('child.age++;save();S=migrate(loadSave());child=S.people.find(p=>p.role==="child");continueAs(child)');
  assert.equal(run('S.familyPhotos[0].people[1].age'),18);
  assert.match(run('photoFrame(S.familyPhotos[0])'),/Выпускной/);
});

test('new destinations support birth, names, map IDs and migration', () => {
  const {run}=game();
  for(const id of ['ad','li','sm','mc','bh','hn','ni','sv','bs','tt','ml','bj']){
    run(`newLife({country:'${id}',year:2000});`);
    assert.equal(run('S.country'),id);
    assert.ok(run('C().cities.includes(S.city) && !!S.first && !!S.surname && !!ISO_NUM[S.country]'));
    run(`S.age=30; S.money=1000000; couplePerformMove('by',null,false)`);
    assert.equal(run('S.country'),'by');
  }
  assert.equal(run('COUNTRIES.length'),132);
});

test('annual summaries are silent by default and the menu switch persists', () => {
  const {run}=game();
  run('lifeSystems().pending={year:2001,age:1,steps:[],cash:[]};pump()');
  assert.equal(run("document.querySelector('#modalWrap').hidden"),true);
  assert.equal(run('lifeSystems().report.year'),2001);
  run('toggleAutoReport()');
  assert.equal(run('localStorage.getItem(REPORT_PREF)'),'on');
  run('toggleAutoReport()');
  assert.equal(run('localStorage.getItem(REPORT_PREF)'),'off');
});

test('home screen renders age chapters and finalized annual changes without a popup', () => {
  const {run}=game();
  run("S.log=[{age:8,year:2008,items:[]},{age:14,year:2014,items:[]}];S.age=14;S.year=2014;S.chapterOpen={'Детство':false};renderLifeHome()");
  assert.match(run('chapterTimeline()'),/Юность/);
  run("lifeSystems().pending={year:2014,age:14,cash:[],steps:[{label:'Учёба',changes:{stress:4}}]};pump()");
  assert.match(run("document.querySelector('#statChanges').innerHTML"),/Учёба/);
});

test('a simulated year can be undone once, but iron mode never creates a rewind point',()=>{
  const {run}=game();run('var original=S.year;ageUp();rewindLife()');assert.equal(run('S.year'),run('original'));
  run('S.iron=true;ageUp();rewindLife()');assert.equal(run('S.year'),run('original+1'));
});
test('mortgage pricing follows credit and adult degree adds a second major',()=>{
  const {run}=game();run("S.age=45;S.edu.level='bachelor';S.edu.majors=['art'];S.money=1e6;S.credit=800;var rate=mortgageRate();S.credit=600;");
  assert.ok(run('rate<mortgageRate()'));run("enrollAdult('eng');for(let i=0;i<3;i++){S.year++;worldYear();}");
  assert.equal(run("S.edu.majors.includes('eng')"),true);
});
test('world collections deduplicate offices and every playable country belongs to one continent',()=>{
  const {run}=game();run("collectWorld('leaders','by');collectWorld('leaders','by')");
  assert.equal(run("readLocal('life_world_collection',{}).leaders.length"),1);
  assert.equal(run("COUNTRIES.every(c=>Object.values(continents).filter(ids=>ids.split(' ').includes(c.id)).length===1)"),true);
});

test('rejecting divorce does not change the partner or record a breakup',()=>{
  const {run,context}=coupleGame();context.confirm=()=>false;
  run('personModal(p)');clickChoice(run,'Развестись');assert.equal(run('p.role'),'partner');
  assert.equal(run("relationshipState(p).entries.some(e=>e.kind==='breakup')"),false);
});

test('menu and journal search match multiple words, years and е/ё',()=>{
  const {run}=game();
  assert.equal(run("searchMatches('2025 учеба','Учёба и работа · 2025')"),true);
  assert.equal(run("searchMatches('2024 учеба','Учёба и работа · 2025')"),false);
});

test('QoL labels, accessibility text and release notes resolve in English and Ukrainian',()=>{
  const {run}=game();
  for(const [lang,back,key] of [['en','← Back','Key 3'],['uk','← Назад','Клавіша 3']]){
    run(`LANG='${lang}';TR_CACHE.clear()`);
    assert.equal(run("trFull('← Назад')"),back);
    assert.equal(run("trFull('Клавиша 3')"),key);
    assert.ok(run('trFull(releaseText)!==releaseText && !!trFull(releaseText)'));
    assert.ok(run("!!trFull('Избранное: Поиск по меню')"));
  }
});

test('graduation invitation localizes the scene and preserves all four choices',()=>{
  const {run}=coupleGame();
  run("var kid=makePerson('child',{name:'<Анна>',age:18});S.people.push(kid);var invite=addFamilyOccasion(kid,'graduation');");
  for(const [language,label] of [['ru','Приглашение на выпускной'],['en','Graduation invitation'],['uk','Запрошення на випускний']]){
    run(`LANG='${language}';Q=[];openFamilyOccasion(invite)`);
    assert.ok(run('Q[0].html').includes(label));
    assert.ok(run('Q[0].html').includes('&lt;Анна&gt;'));
    assert.equal(run('Q[0].choices.length'),4);
  }
});

test('family guitar preserves its first owner and dated pictures through succession',()=>{
 const {run}=coupleGame();run("S.money=1e6;buyGuitar();guitarMoment();var owner=S.first;var kid=makePerson('child',{age:21});S.people.push(kid);continueAs(kid);guitarMoment()");
 assert.equal(run('homeHistory().guitar.owner'),run('owner'));
 assert.equal(run('homeHistory().relicPhotos.length'),2);
});

test('intimate choices require adults, opt-in and agreement from both partners',()=>{
 const {run}=coupleGame();
 assert.equal(run('intimacyAvailable(p)'),false);
 run("writeLocal('life_adult_stories',true);p.age=17");assert.equal(run('intimacyAvailable(p)'),false);
 run("p.age=28;var i=intimacyState(p);i.limit=3;i.preference=0;var before=p.close;askAffection(p,3)");
 assert.equal(run("document.querySelector('#modalActions').children.length"),1);
 clickChoice(run,'Не сейчас');assert.equal(run('p.close'),run('before'));
 run('S.year++;i.preference=3;askAffection(p,3)');clickChoice(run,'Я тоже хочу');
 assert.equal(run('p.close'),run('before+2'));
 run('askAffection(p,3)');assert.equal(run("document.querySelector('#modalWrap').hidden"),true);
});

test('trust reaches 100, and prepared partners can retry after an unsuccessful year',()=>{
  const {run}=coupleGame();
  run("for(let i=0;i<10;i++)relationshipRemember(p,'good'+i,'Поддержка',5);");
  assert.equal(run('relationshipTrust(p)'),100);
  run("c.children='later';couplePromise(p,'children');S.year++;S.used={};Math.random=()=>0.9;requestCoupleDecision(p,'children')");
  clickChoice(run,'стать родителями сейчас');assert.equal(run('S.stat.kids'),0);
  run("S.year++;S.used={};Math.random=()=>0.1;requestCoupleDecision(p,'children')");
  clickChoice(run,'стать родителями сейчас');assert.equal(run('S.stat.kids'),1);
});

test('era salary wrapper tolerates no job, and new jobs have English names', () => {
  const {run} = game();
  assert.equal(run('jobSalary(null)'), 0);
  const src = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
  for (const id of ['eco', 'era_radio', 'era_computer', 'era_electric', 'era_ai']) assert.match(src, new RegExp(`\\b${id}: \\['`), id);
  assert.match(src, /window\.confirm = function/);
});
