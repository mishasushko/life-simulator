// Scans world*.json dumps for anachronisms and inconsistencies.
const fs = require('fs'); const dir = process.argv[2] || process.cwd();
const files = fs.readdirSync(dir).filter((f) => /^world\d.*\.json$/.test(f));
const ANA = [[/интернет|онлайн|в сети\b/i, 1993], [/смартфон|айфон|iphone/i, 2007], [/компьютер|ПК\b/i, 1978], [/ноутбук/i, 1990], [/мобильн|сотов/i, 1990], [/SMS|эсэмэс|смс/i, 1994], [/мессенджер|WhatsApp|Telegram/i, 2009], [/TikTok|тикток/i, 2016], [/Instagram|инстаграм/i, 2010], [/YouTube|ютуб/i, 2005], [/блог|блогер|подписчик|лайк/i, 2000], [/стрим/i, 2010], [/крипт|биткоин/i, 2010], [/видеоигр|приставк|консол|PlayStation|Xbox/i, 1975], [/телевизор|по телевизору|телешоу|ТВ\b|сериал/i, 1938], [/радио/i, 1922], [/кино\b|фильм/i, 1905], [/самолёт|авиа|аэропорт|перелёт/i, 1920], [/машин[аеуы] (?!времени)|автомобил/i, 1905], [/электромобил|Tesla|тесла/i, 2012], [/DVD|диск[иа]? с/i, 1998], [/кассет/i, 1966], [/mp3|плеер/i, 1979], [/нейросет|ИИ\b|искусственн/i, 2016], [/дрон/i, 2012], [/ковид|коронавирус|локдаун|самоизоляц/i, 2020], [/€|евро\b/i, 1999], [/Wi-?Fi|вайфай/i, 2000], [/электронн(ая|ой) почт|e-?mail|имейл/i, 1993], [/видеозвон|Zoom|Skype/i, 2004], [/ипотек/i, 1930], [/пенси/i, 1910], [/МРТ|УЗИ/i, 1975], [/антибиотик|пенициллин/i, 1942], [/доставк[аеу] еды|курьер/i, 1990], [/космос|космонавт|астронавт/i, 1957], [/фитнес|спортзал|тренажёр/i, 1975], [/маркетплейс|онлайн-магазин|интернет-магазин/i, 1998], [/кредитн(ая|ой) карт/i, 1955], [/банкомат/i, 1970]];
const SOV = ['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az', 'uz', 'kg', 'tj', 'tm', 'lt', 'lv', 'ee', 'md'];
const hits = {}; const add = (k, ex) => { (hits[k] = hits[k] || { n: 0, ex: [] }).n++; if (hits[k].ex.length < 3) hits[k].ex.push(ex); };
for (const f of files) for (const L of JSON.parse(fs.readFileSync(dir + '/' + f))) {
  const ppl = L.rec.find((r) => r[3].startsWith('PEOPLE '));
  if (ppl) { const pr = ppl[3].split(';').filter((x) => /mother|father/.test(x)).map((x) => x.split(':')[1]); if (pr.length === 2 && pr[0] === pr[1]) add(`same-sex parents ${L.c} ${L.y}`, ppl[3].slice(0, 120)); }
  for (const [y, a, c, t] of L.rec) {
    if (t.startsWith('PEOPLE') || t.startsWith('END')) continue;
    const T = t.replace(/\d{4}/g, '');
    for (const [re, from] of ANA) if (y < from && re.test(T)) add(`ANA ${re.source.slice(0, 30)} <${from}`, `${y} ${c} a${a}: ${t.slice(0, 170)}`);
    if (/СССР|советск/i.test(T) && !/бывш|распа|развал|ностальг|в СССР было|после СССР|до распада|при СССР|воспомин/i.test(T) && (y > 1992 || y < 1922) && SOV.includes(c)) add('USSR outside 1922-1991', `${y} ${c}: ${t.slice(0, 160)}`);
    if (/СССР|советск/i.test(T) && !SOV.includes(c) && !/посольств|из СССР|в СССР|с СССР|против СССР|США и СССР|холодн|спутник|Гагарин|Олимп|бойкот|СССР и|и СССР/i.test(T)) add('USSR mention in non-Soviet country', `${y} ${c}: ${t.slice(0, 160)}`);
    if (/₽|рубл/.test(t) && !['ru', 'by'].includes(c) && !(SOV.includes(c) && y < 1993)) add(`rubles in ${c}`, `${y} ${c}: ${t.slice(0, 140)}`);
    if (/гривн|₴/.test(t) && (c !== 'ua' || y < 1996)) add(`hryvnia ${c}`, `${y} ${c}: ${t.slice(0, 140)}`);
    if (a < 14 && /зарплат|на работе|ваш начальник|уволил|повышени[ея] по службе|коллег/i.test(t) && !/родител|мам|пап|отец|мать/i.test(t)) add('child at work', `${y} ${c} a${a}: ${t.slice(0, 140)}`);
    if (a < 16 && /свадьб|вы поженились|муж\b|жена\b|ваш супруг/i.test(t) && !/родител|мам|пап|отец|мать|учител|сосед|брат|сестр|тёт|дяд/i.test(t)) add('child married', `${y} ${c} a${a}: ${t.slice(0, 140)}`);
    if (L.g === 'm' && /вы беременн|вы родили (сына|дочь|ребёнка)|вы родила|роды прошли/i.test(t) && !/партн|жена|супруг|подруг/i.test(t)) add('male player pregnant', `${y} ${c} a${a}: ${t.slice(0, 140)}`);
    if (L.g === 'f' && /Повестка|призыв в армию|вы служите в армии|ушли в армию/i.test(t) && !['il', 'kp', 'er', 'no', 'se'].includes(c)) add('female conscripted', `${y} ${c} a${a}: ${t.slice(0, 140)}`);
    if (/\b(undefined|NaN|null)\b|\[object/.test(t)) add('BROKEN undefined/NaN', `${y} ${c}: ${t.slice(0, 160)}`);
    if (/\(а\)|\(ла\)|\(ась\)|ся\(сь\)|\(ой\)|\(ая\)/.test(t)) add('gender placeholder (а)', `${y} ${c}: ${t.slice(0, 140)}`);
  }
}
const ks = Object.keys(hits).sort((a, b) => hits[b].n - hits[a].n);
for (const k of ks) { console.log(`## ${k} — ${hits[k].n}`); for (const e of hits[k].ex) console.log('   ' + e); }
