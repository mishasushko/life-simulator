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
    var moneyBefore = S.money; ageUp();`);
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
  run(`var x = lifeSystems(); x.pending={year:2001,age:1,steps:[]};
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
      run(`closeModal(); for(const panel of ['yearreport','lifeplan','lifepaths','lifestories','adaptation','reputation','legacy']) openPanel(panel); closeSheet();`);
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
