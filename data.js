'use strict';
/* ===== Данные игры ===== */

const NAMES = {
  ru: {
    m: ['Александр','Михаил','Максим','Артём','Иван','Дмитрий','Никита','Егор','Кирилл','Андрей','Матвей','Тимофей','Роман','Владимир','Сергей','Лев','Марк','Даниил','Фёдор','Глеб','Павел','Степан'],
    f: ['Анна','Мария','София','Алиса','Виктория','Полина','Дарья','Ева','Варвара','Ксения','Екатерина','Елизавета','Вера','Ольга','Анастасия','Милана','Арина','Таисия','Надежда','Василиса'],
    s: ['Иванов','Смирнов','Кузнецов','Попов','Соколов','Лебедев','Козлов','Новиков','Морозов','Петров','Волков','Соловьёв','Васильев','Зайцев','Павлов','Семёнов','Голубев','Виноградов','Богданов','Воробьёв','Орлов','Белов','Комаров','Медведев'],
    slav: true
  },
  ua: {
    m: ['Олександр','Андрій','Тарас','Богдан','Дмитро','Максим','Остап','Назар','Ярослав','Іван','Марко','Данило'],
    f: ['Оксана','Олена','Соломія','Ярина','Марія','Анастасія','Софія','Дарина','Катерина','Христина','Злата'],
    s: ['Шевченко','Коваленко','Бондаренко','Ткаченко','Кравченко','Мельник','Бойко','Олійник','Литвиненко','Савченко','Руденко','Мороз']
  },
  kz: {
    m: ['Нурсултан','Алихан','Ерлан','Арман','Данияр','Айбек','Тимур','Ерасыл','Санжар','Бауыржан'],
    f: ['Айгерим','Аружан','Дана','Мадина','Жанар','Камила','Асель','Алия','Томирис','Сабина'],
    s: ['Ахметов','Сулейменов','Жуматаев','Касымов','Нурланов','Абдрахманов','Искаков','Серикбаев','Омаров','Тулегенов'],
    slav: true
  },
  by: {
    m: ['Алесь','Янка','Микола','Павел','Артём','Владислав','Денис','Кирилл','Илья'],
    f: ['Алеся','Ганна','Янина','Дарья','Вероника','Кристина','Ульяна','Маргарита'],
    s: ['Козловский','Ковалёв','Мицкевич','Новик','Жук','Шевчук','Климович','Макаревич','Левчук','Савицкий'],
    slav: true
  },
  en: {
    m: ['James','Oliver','Liam','Noah','Ethan','Lucas','Henry','Jack','Leo','Owen','Mason','Logan','Ryan','Daniel'],
    f: ['Olivia','Emma','Ava','Sophia','Mia','Amelia','Harper','Ella','Grace','Chloe','Lily','Zoe','Ruby','Hannah'],
    s: ['Smith','Johnson','Brown','Taylor','Miller','Wilson','Davis','Clark','Walker','Hall','Young','King','Wright','Scott','Green','Baker']
  },
  de: {
    m: ['Lukas','Finn','Jonas','Leon','Paul','Felix','Elias','Maximilian','Noah','Moritz','Emil'],
    f: ['Mia','Emma','Hannah','Lea','Lina','Marie','Clara','Lena','Ida','Frieda','Greta'],
    s: ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Koch','Richter','Wolf']
  },
  fr: {
    m: ['Louis','Gabriel','Arthur','Jules','Hugo','Raphaël','Léo','Adam','Nathan','Théo','Victor'],
    f: ['Jade','Louise','Emma','Alice','Chloé','Inès','Léa','Manon','Camille','Juliette','Zoé'],
    s: ['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Laurent','Lefebvre']
  },
  es: {
    m: ['Mateo','Santiago','Diego','Alejandro','Lucas','Hugo','Pablo','Daniel','Javier','Carlos','Miguel'],
    f: ['Lucía','Sofía','Valentina','Martina','Paula','Isabella','Camila','Elena','Carmen','Julia','Daniela'],
    s: ['García','Rodríguez','González','Fernández','López','Martínez','Sánchez','Pérez','Gómez','Díaz','Torres','Ramírez']
  },
  it: {
    m: ['Leonardo','Francesco','Alessandro','Lorenzo','Matteo','Andrea','Gabriele','Riccardo','Tommaso','Marco'],
    f: ['Sofia','Giulia','Aurora','Alice','Ginevra','Emma','Giorgia','Beatrice','Chiara','Martina'],
    s: ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo']
  },
  pt: {
    m: ['Miguel','Arthur','Gael','Heitor','Theo','Davi','Gabriel','Bernardo','Rafael','Pedro','João'],
    f: ['Helena','Alice','Laura','Maria','Valentina','Heloísa','Beatriz','Manuela','Júlia','Ana','Lívia'],
    s: ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro']
  },
  jp: {
    m: ['Haruto','Sota','Yuto','Riku','Ren','Hinata','Kaito','Takumi','Yamato','Daiki'],
    f: ['Yui','Hina','Sakura','Aoi','Mio','Rin','Yuna','Akari','Koharu','Mei'],
    s: ['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato']
  },
  kr: {
    m: ['Min-jun','Seo-jun','Do-yun','Ha-jun','Ji-ho','Joon-woo','Hyun-woo','Ji-hoon'],
    f: ['Seo-yeon','Ji-woo','Ha-eun','Min-seo','Su-ah','Ji-yoo','Chae-won','Yu-na'],
    s: ['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim']
  },
  cn: {
    m: ['Wei','Hao','Jun','Lei','Yang','Ming','Chen','Bo','Tao','Yu'],
    f: ['Li','Mei','Xiu','Ying','Lan','Jing','Hui','Fang','Yan','Na'],
    s: ['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou']
  },
  tr: {
    m: ['Yusuf','Eymen','Ömer','Mustafa','Emir','Kerem','Ali','Burak','Mehmet','Can'],
    f: ['Zeynep','Elif','Defne','Eylül','Azra','Nehir','Ayşe','Ecrin','Meryem','Selin'],
    s: ['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Yıldırım','Öztürk','Aydın','Özdemir']
  },
  ar: {
    m: ['Mohammed','Ahmed','Omar','Youssef','Ali','Khalid','Hassan','Karim','Tariq','Zayed'],
    f: ['Fatima','Mariam','Aisha','Layla','Nour','Salma','Huda','Yasmin','Rania','Lina'],
    s: ['Al-Mansouri','Haddad','Nasser','Khalil','Saleh','Hamdan','Farouk','Rahman','Aziz','Mahmoud']
  },

  pl: { m:['Jakub','Kacper','Szymon','Filip','Mateusz','Michał','Wojciech','Piotr','Tomasz','Bartosz'], f:['Zuzanna','Julia','Maja','Zofia','Hanna','Lena','Alicja','Natalia','Agnieszka','Wiktoria'], s:['Nowak','Kowalski','Wiśniewski','Wójcik','Kamiński','Lewandowski','Zieliński','Szymański','Dąbrowski','Mazur'] },
  cz: { m:['Jakub','Jan','Tomáš','Adam','Matyáš','Vojtěch','Ondřej','Lukáš','Petr'], f:['Eliška','Tereza','Anna','Adéla','Natálie','Karolína','Klára','Lucie'], s:['Novák','Svoboda','Novotný','Dvořák','Černý','Procházka','Kučera','Veselý','Horák'] },
  nl: { m:['Daan','Sem','Lucas','Levi','Finn','Bram','Thijs','Jesse','Ruben'], f:['Emma','Julia','Mila','Tess','Sophie','Zoë','Sara','Anna','Fenna'], s:['de Jong','Jansen','de Vries','van den Berg','Bakker','Visser','Smit','Meijer','de Boer','Mulder'] },
  nord: { m:['Oskar','Lars','Erik','Nils','Mikael','Elias','Axel','Aksel','Emil','Magnus','Jonas'], f:['Ella','Freja','Astrid','Ingrid','Saga','Alma','Linnea','Aino','Sofia','Maja'], s:['Andersson','Johansson','Nielsen','Hansen','Larsen','Virtanen','Korhonen','Lindberg','Eriksson','Berg'] },
  gr: { m:['Georgios','Dimitrios','Konstantinos','Ioannis','Nikolaos','Alexandros','Christos'], f:['Maria','Eleni','Katerina','Sofia','Anastasia','Despina','Ioanna'], s:['Papadopoulos','Pappas','Georgiou','Nikolaidis','Oikonomou','Vlachos','Karagiannis'] },
  he: { m:['Noam','David','Ariel','Yosef','Itai','Eitan','Omer','Lavi'], f:['Tamar','Noa','Maya','Shira','Yael','Avigail','Talia','Lia'], s:['Cohen','Levi','Mizrahi','Peretz','Biton','Friedman','Katz','Azoulay'] },
  af: { m:['Chinedu','Kwame','Tunde','Emeka','Juma','Thabo','Sipho','Kofi','Musa','Baraka'], f:['Amara','Ngozi','Zanele','Achieng','Aisha','Thandiwe','Wanjiru','Chioma','Nia','Imani'], s:['Okafor','Adeyemi','Mensah','Ndlovu','Mwangi','Otieno','Dlamini','Abubakar','Okeke','Nkosi'] },
  th: { m:['Somchai','Anan','Krit','Niran','Pong','Thanawat','Chaiya'], f:['Ploy','Nok','Mali','Kanya','Siriporn','Pim','Dao'], s:['Saetang','Srisuk','Wongsakul','Chaiyaporn','Boonmee','Rattanakul'] },
  vn: { m:['Minh','Huy','Khoa','Nam','Duc','Long','Tuan','Bao'], f:['Linh','Mai','Lan','Huong','Anh','Thao','Ngoc','Trang'], s:['Nguyen','Tran','Le','Pham','Hoang','Phan','Vu','Dang'] },
  id: { m:['Budi','Agus','Rizky','Dimas','Fajar','Andi','Bayu','Putra'], f:['Siti','Dewi','Putri','Ayu','Rina','Nur','Intan','Wulan'], s:['Santoso','Wijaya','Saputra','Hidayat','Kusuma','Pratama','Nugroho','Setiawan'] },
  ph: { m:['Jose','Mark','John Paul','Miguel','Angelo','Paolo','Rafael'], f:['Maria','Angel','Princess','Kristine','Jasmine','Andrea','Bea'], s:['Santos','Reyes','Cruz','Bautista','Garcia','Mendoza','Dela Cruz','Ramos'] },
  ka: { m:['Giorgi','Davit','Luka','Nikoloz','Levan','Irakli','Sandro'], f:['Nino','Mariam','Ana','Tamar','Salome','Elene','Natia'], s:['Beridze','Kapanadze','Gelashvili','Maisuradze','Lomidze','Tsiklauri','Bolkvadze'] },
  hy: { m:['Aram','Davit','Narek','Tigran','Hayk','Armen','Gor','Arman'], f:['Ani','Anahit','Lilit','Mariam','Nare','Gayane','Armine','Sona'], s:['Petrosyan','Harutyunyan','Sargsyan','Hovhannisyan','Grigoryan','Karapetyan','Vardanyan'] },
  az: { m:['Ali','Huseyn','Murad','Tural','Elvin','Rashad','Orkhan','Kamran'], f:['Leyla','Aysel','Nigar','Gunel','Aytan','Sevinj','Narmin','Zahra'], s:['Mammadov','Aliyev','Hasanov','Huseynov','Guliyev','Ismayilov','Rzayev'], slav:true },
  uz: { m:['Timur','Jasur','Sardor','Bekzod','Rustam','Shokhrukh','Aziz','Dilshod'], f:['Malika','Dilnoza','Madina','Nodira','Sevara','Gulnora','Shahnoza'], s:['Karimov','Rakhimov','Yusupov','Tashkentov','Mirzaev','Usmonov','Nazarov'], slav:true },
  mn: { m:['Bat','Temuujin','Ganbold','Bold','Erdene','Munkh'], f:['Saran','Oyun','Altan','Enkhjargal','Tsetseg','Nomin'], s:['Batbayar','Ganbaatar','Dorj','Bold','Erdenebat','Tumur'] },
  sr: { m:['Luka','Nikola','Stefan','Marko','Lazar','Miloš','Aleksa'], f:['Milica','Ana','Jovana','Teodora','Sofija','Marija','Jelena'], s:['Jovanović','Petrović','Nikolić','Marković','Đorđević','Stojanović','Ilić'] },
  in: {
    m: ['Aarav','Vivaan','Aditya','Arjun','Reyansh','Rohan','Ishaan','Kabir','Rahul','Vikram'],
    f: ['Aadhya','Ananya','Diya','Saanvi','Isha','Priya','Kavya','Meera','Riya','Anika'],
    s: ['Sharma','Patel','Singh','Kumar','Gupta','Mehta','Reddy','Iyer','Nair','Das']
  }
};

// rate: сколько единиц местной валюты в 1 игровой единице (базовая единица = рубль)
const COUNTRIES = [
  { id:'ru', flag:'🇷🇺', name:'Россия', names:'ru', cur:'₽', rate:1, wage:1.0, cities:['Москва','Санкт-Петербург','Казань','Новосибирск','Екатеринбург','Сочи','Краснодар','Владивосток'], rel:['Православие','Атеизм','Ислам'], life:73 },
  { id:'ua', flag:'🇺🇦', name:'Украина', names:'ua', cur:'₴', rate:0.45, wage:0.7, cities:['Киев','Львов','Одесса','Харьков','Днепр'], rel:['Православие','Католицизм','Атеизм'], life:72 },
  { id:'by', flag:'🇧🇾', name:'Беларусь', names:'by', cur:'Br', rate:0.035, wage:0.75, cities:['Минск','Гродно','Брест','Гомель','Витебск'], rel:['Православие','Католицизм','Атеизм'], life:74 },
  { id:'kz', flag:'🇰🇿', name:'Казахстан', names:'kz', cur:'₸', rate:5.3, wage:0.85, cities:['Алматы','Астана','Шымкент','Караганда','Актау'], rel:['Ислам','Православие','Атеизм'], life:72 },
  { id:'us', flag:'🇺🇸', name:'США', names:'en', cur:'$', rate:0.011, wage:2.6, cities:['Нью-Йорк','Лос-Анджелес','Чикаго','Майами','Сан-Франциско','Остин'], rel:['Протестантизм','Католицизм','Атеизм','Иудаизм'], life:78 },
  { id:'gb', flag:'🇬🇧', name:'Великобритания', names:'en', cur:'£', rate:0.0087, wage:2.1, cities:['Лондон','Манчестер','Эдинбург','Ливерпуль','Бристоль'], rel:['Протестантизм','Атеизм','Католицизм','Ислам'], life:81 },
  { id:'ca', flag:'🇨🇦', name:'Канада', names:'en', cur:'C$', rate:0.015, wage:2.2, cities:['Торонто','Ванкувер','Монреаль','Калгари','Оттава'], rel:['Католицизм','Протестантизм','Атеизм'], life:82 },
  { id:'au', flag:'🇦🇺', name:'Австралия', names:'en', cur:'A$', rate:0.017, wage:2.3, cities:['Сидней','Мельбурн','Брисбен','Перт','Аделаида'], rel:['Атеизм','Католицизм','Протестантизм'], life:83 },
  { id:'de', flag:'🇩🇪', name:'Германия', names:'de', cur:'€', rate:0.01, wage:2.2, cities:['Берлин','Мюнхен','Гамбург','Кёльн','Франкфурт'], rel:['Католицизм','Протестантизм','Атеизм'], life:81 },
  { id:'fr', flag:'🇫🇷', name:'Франция', names:'fr', cur:'€', rate:0.01, wage:2.0, cities:['Париж','Лион','Марсель','Ницца','Бордо'], rel:['Католицизм','Атеизм','Ислам'], life:82 },
  { id:'es', flag:'🇪🇸', name:'Испания', names:'es', cur:'€', rate:0.01, wage:1.6, cities:['Мадрид','Барселона','Валенсия','Севилья','Малага'], rel:['Католицизм','Атеизм'], life:83 },
  { id:'it', flag:'🇮🇹', name:'Италия', names:'it', cur:'€', rate:0.01, wage:1.7, cities:['Рим','Милан','Неаполь','Флоренция','Венеция'], rel:['Католицизм','Атеизм'], life:83 },
  { id:'mx', flag:'🇲🇽', name:'Мексика', names:'es', cur:'MX$', rate:0.2, wage:0.8, cities:['Мехико','Гвадалахара','Канкун','Монтеррей'], rel:['Католицизм','Протестантизм'], life:75 },
  { id:'ar', flag:'🇦🇷', name:'Аргентина', names:'es', cur:'AR$', rate:10, wage:0.7, cities:['Буэнос-Айрес','Кордова','Мендоса','Росарио'], rel:['Католицизм','Атеизм'], life:76 },
  { id:'br', flag:'🇧🇷', name:'Бразилия', names:'pt', cur:'R$', rate:0.06, wage:0.75, cities:['Рио-де-Жанейро','Сан-Паулу','Салвадор','Бразилиа'], rel:['Католицизм','Протестантизм'], life:76 },
  { id:'pt', flag:'🇵🇹', name:'Португалия', names:'pt', cur:'€', rate:0.01, wage:1.4, cities:['Лиссабон','Порту','Фару','Коимбра'], rel:['Католицизм','Атеизм'], life:81 },
  { id:'jp', flag:'🇯🇵', name:'Япония', names:'jp', cur:'¥', rate:1.65, wage:1.9, cities:['Токио','Осака','Киото','Саппоро','Иокогама'], rel:['Синтоизм','Буддизм','Атеизм'], life:84 },
  { id:'kr', flag:'🇰🇷', name:'Южная Корея', names:'kr', cur:'₩', rate:15, wage:1.8, cities:['Сеул','Пусан','Инчхон','Тэгу'], rel:['Атеизм','Протестантизм','Буддизм'], life:83 },
  { id:'cn', flag:'🇨🇳', name:'Китай', names:'cn', cur:'¥', rate:0.08, wage:1.1, cities:['Пекин','Шанхай','Шэньчжэнь','Гуанчжоу','Чэнду'], rel:['Атеизм','Буддизм','Даосизм'], life:78 },
  { id:'tr', flag:'🇹🇷', name:'Турция', names:'tr', cur:'₺', rate:0.38, wage:0.8, cities:['Стамбул','Анкара','Измир','Анталья'], rel:['Ислам','Атеизм'], life:77 },
  { id:'ae', flag:'🇦🇪', name:'ОАЭ', names:'ar', cur:'AED', rate:0.04, wage:2.4, cities:['Дубай','Абу-Даби','Шарджа'], rel:['Ислам'], life:79 },
  { id:'in', flag:'🇮🇳', name:'Индия', names:'in', cur:'₹', rate:0.92, wage:0.5, cities:['Мумбаи','Дели','Бангалор','Гоа','Ченнаи'], rel:['Индуизм','Ислам','Сикхизм'], life:70 },

  { id:'pl', flag:'🇵🇱', name:'Польша', names:'pl', cur:'zł', rate:0.044, wage:1.3, cities:['Варшава','Краков','Гданьск','Вроцлав','Познань'], rel:['Католицизм','Атеизм'], life:78 },
  { id:'cz', flag:'🇨🇿', name:'Чехия', names:'cz', cur:'Kč', rate:0.25, wage:1.35, cities:['Прага','Брно','Острава','Карловы Вары'], rel:['Атеизм','Католицизм'], life:79 },
  { id:'nl', flag:'🇳🇱', name:'Нидерланды', names:'nl', cur:'€', rate:0.01, wage:2.3, cities:['Амстердам','Роттердам','Гаага','Утрехт'], rel:['Атеизм','Католицизм','Протестантизм'], life:82 },
  { id:'be', flag:'🇧🇪', name:'Бельгия', names:'fr', cur:'€', rate:0.01, wage:2.1, cities:['Брюссель','Антверпен','Гент','Брюгге'], rel:['Католицизм','Атеизм'], life:82 },
  { id:'at', flag:'🇦🇹', name:'Австрия', names:'de', cur:'€', rate:0.01, wage:2.2, cities:['Вена','Зальцбург','Инсбрук','Грац'], rel:['Католицизм','Атеизм'], life:82 },
  { id:'ie', flag:'🇮🇪', name:'Ирландия', names:'en', cur:'€', rate:0.01, wage:2.4, cities:['Дублин','Корк','Голуэй'], rel:['Католицизм','Атеизм'], life:82 },
  { id:'se', flag:'🇸🇪', name:'Швеция', names:'nord', cur:'kr', rate:0.12, wage:2.4, cities:['Стокгольм','Гётеборг','Мальмё','Уппсала'], rel:['Атеизм','Протестантизм'], life:83 },
  { id:'fi', flag:'🇫🇮', name:'Финляндия', names:'nord', cur:'€', rate:0.01, wage:2.2, cities:['Хельсинки','Тампере','Турку','Рованиеми'], rel:['Протестантизм','Атеизм'], life:82 },
  { id:'dk', flag:'🇩🇰', name:'Дания', names:'nord', cur:'kr', rate:0.075, wage:2.6, cities:['Копенгаген','Орхус','Оденсе'], rel:['Протестантизм','Атеизм'], life:81 },
  { id:'is', flag:'🇮🇸', name:'Исландия', names:'nord', cur:'kr', rate:1.5, wage:2.6, cities:['Рейкьявик','Акюрейри'], rel:['Протестантизм','Атеизм'], life:83 },
  { id:'gr', flag:'🇬🇷', name:'Греция', names:'gr', cur:'€', rate:0.01, wage:1.2, cities:['Афины','Салоники','Ираклион','Родос'], rel:['Православие'], life:81 },
  { id:'rs', flag:'🇷🇸', name:'Сербия', names:'sr', cur:'дин', rate:1.15, wage:0.9, cities:['Белград','Нови-Сад','Ниш'], rel:['Православие','Католицизм'], life:76 },
  { id:'ge', flag:'🇬🇪', name:'Грузия', names:'ka', cur:'₾', rate:0.03, wage:0.7, cities:['Тбилиси','Батуми','Кутаиси'], rel:['Православие','Ислам'], life:74 },
  { id:'am', flag:'🇦🇲', name:'Армения', names:'hy', cur:'֏', rate:4.3, wage:0.7, cities:['Ереван','Гюмри','Ванадзор'], rel:['Православие'], life:75 },
  { id:'az', flag:'🇦🇿', name:'Азербайджан', names:'az', cur:'₼', rate:0.019, wage:0.7, cities:['Баку','Гянджа','Сумгаит'], rel:['Ислам','Атеизм'], life:73 },
  { id:'uz', flag:'🇺🇿', name:'Узбекистан', names:'uz', cur:'сум', rate:140, wage:0.5, cities:['Ташкент','Самарканд','Бухара','Хива'], rel:['Ислам','Атеизм'], life:72 },
  { id:'mn', flag:'🇲🇳', name:'Монголия', names:'mn', cur:'₮', rate:38, wage:0.5, cities:['Улан-Батор','Эрдэнэт','Дархан'], rel:['Буддизм','Атеизм'], life:71 },
  { id:'il', flag:'🇮🇱', name:'Израиль', names:'he', cur:'₪', rate:0.04, wage:2.0, cities:['Тель-Авив','Иерусалим','Хайфа','Эйлат'], rel:['Иудаизм','Ислам','Атеизм'], life:83 },
  { id:'sa', flag:'🇸🇦', name:'Саудовская Аравия', names:'ar', cur:'SAR', rate:0.041, wage:1.8, cities:['Эр-Рияд','Джидда','Мекка','Медина'], rel:['Ислам'], life:77 },
  { id:'eg', flag:'🇪🇬', name:'Египет', names:'ar', cur:'E£', rate:0.53, wage:0.35, cities:['Каир','Александрия','Хургада','Луксор'], rel:['Ислам','Православие'], life:72 },
  { id:'ma', flag:'🇲🇦', name:'Марокко', names:'ar', cur:'DH', rate:0.11, wage:0.45, cities:['Касабланка','Марракеш','Рабат','Фес'], rel:['Ислам'], life:75 },
  { id:'ng', flag:'🇳🇬', name:'Нигерия', names:'af', cur:'₦', rate:17, wage:0.3, cities:['Лагос','Абуджа','Кано','Ибадан'], rel:['Ислам','Протестантизм','Католицизм'], life:55 },
  { id:'ke', flag:'🇰🇪', name:'Кения', names:'af', cur:'KSh', rate:1.43, wage:0.3, cities:['Найроби','Момбаса','Кисуму'], rel:['Протестантизм','Католицизм','Ислам'], life:63 },
  { id:'za', flag:'🇿🇦', name:'ЮАР', names:'af', cur:'R', rate:0.2, wage:0.7, cities:['Кейптаун','Йоханнесбург','Дурбан','Претория'], rel:['Протестантизм','Католицизм','Атеизм'], life:65 },
  { id:'th', flag:'🇹🇭', name:'Таиланд', names:'th', cur:'฿', rate:0.38, wage:0.6, cities:['Бангкок','Пхукет','Чиангмай','Паттайя'], rel:['Буддизм','Ислам'], life:79 },
  { id:'vn', flag:'🇻🇳', name:'Вьетнам', names:'vn', cur:'₫', rate:280, wage:0.45, cities:['Ханой','Хошимин','Дананг','Нячанг'], rel:['Атеизм','Буддизм','Католицизм'], life:75 },
  { id:'idn', flag:'🇮🇩', name:'Индонезия', names:'id', cur:'Rp', rate:180, wage:0.45, cities:['Джакарта','Бали','Сурабая','Бандунг'], rel:['Ислам','Протестантизм','Индуизм'], life:71 },
  { id:'ph', flag:'🇵🇭', name:'Филиппины', names:'ph', cur:'₱', rate:0.63, wage:0.4, cities:['Манила','Себу','Давао','Боракай'], rel:['Католицизм','Ислам'], life:71 },
  { id:'sg', flag:'🇸🇬', name:'Сингапур', names:'cn', cur:'S$', rate:0.015, wage:2.8, cities:['Сингапур'], rel:['Буддизм','Протестантизм','Ислам','Даосизм'], life:84 },
  { id:'nz', flag:'🇳🇿', name:'Новая Зеландия', names:'en', cur:'NZ$', rate:0.019, wage:2.0, cities:['Окленд','Веллингтон','Крайстчерч','Куинстаун'], rel:['Атеизм','Протестантизм','Католицизм'], life:82 },
  { id:'co', flag:'🇨🇴', name:'Колумбия', names:'es', cur:'COL$', rate:45, wage:0.55, cities:['Богота','Медельин','Картахена','Кали'], rel:['Католицизм','Протестантизм'], life:77 },
  { id:'cl', flag:'🇨🇱', name:'Чили', names:'es', cur:'CLP$', rate:10.5, wage:0.9, cities:['Сантьяго','Вальпараисо','Пунта-Аренас'], rel:['Католицизм','Протестантизм','Атеизм'], life:80 },
  { id:'pe', flag:'🇵🇪', name:'Перу', names:'es', cur:'S/', rate:0.042, wage:0.55, cities:['Лима','Куско','Арекипа'], rel:['Католицизм','Протестантизм'], life:77 },
  { id:'cu', flag:'🇨🇺', name:'Куба', names:'es', cur:'CUP', rate:0.27, wage:0.2, cities:['Гавана','Варадеро','Сантьяго-де-Куба'], rel:['Католицизм','Атеизм'], life:78 },
  { id:'ch', flag:'🇨🇭', name:'Швейцария', names:'de', cur:'CHF', rate:0.0097, wage:3.2, cities:['Цюрих','Женева','Берн','Лозанна'], rel:['Католицизм','Протестантизм','Атеизм'], life:84 },
  { id:'no', flag:'🇳🇴', name:'Норвегия', names:'en', cur:'kr', rate:0.12, wage:2.7, cities:['Осло','Берген','Тромсё'], rel:['Протестантизм','Атеизм'], life:83 }
];

const RELIGIONS = [
  { id:'Атеизм', e:'⚛️' }, { id:'Агностицизм', e:'❔' }, { id:'Православие', e:'☦️' }, { id:'Католицизм', e:'✝️' },
  { id:'Протестантизм', e:'✝️' }, { id:'Ислам', e:'☪️' }, { id:'Иудаизм', e:'✡️' }, { id:'Буддизм', e:'☸️' },
  { id:'Индуизм', e:'🕉️' }, { id:'Синтоизм', e:'⛩️' }, { id:'Даосизм', e:'☯️' }, { id:'Сикхизм', e:'🪯' }
];
const TEMPLE = { 'Православие':'в храм', 'Католицизм':'в костёл', 'Протестантизм':'в церковь', 'Ислам':'в мечеть', 'Иудаизм':'в синагогу', 'Буддизм':'в буддийский храм', 'Индуизм':'в мандир', 'Синтоизм':'в святилище', 'Даосизм':'в даосский храм', 'Сикхизм':'в гурдвару' };

const GENDERS = [
  { id:'m', name:'Мужской', e:'♂️' },
  { id:'f', name:'Женский', e:'♀️' },
  { id:'nb', name:'Небинарный', e:'⚧️' }
];
const ORIENTATIONS = [
  { id:'hetero', name:'Гетеросексуальная', e:'💑' },
  { id:'homo', name:'Гомосексуальная', e:'🏳️‍🌈' },
  { id:'bi', name:'Бисексуальная', e:'💗' },
  { id:'pan', name:'Пансексуальная', e:'💖' },
  { id:'ace', name:'Асексуальная', e:'🖤' }
];

/* Высшее образование */
const MAJORS = [
  { id:'it', name:'Информатика', e:'💻', minSmarts:60, years:4 },
  { id:'med', name:'Медицина', e:'🩺', minSmarts:72, years:6 },
  { id:'law', name:'Право', e:'⚖️', minSmarts:62, years:4 },
  { id:'econ', name:'Экономика', e:'📊', minSmarts:55, years:4 },
  { id:'eng', name:'Инженерия', e:'⚙️', minSmarts:58, years:4 },
  { id:'art', name:'Искусство и дизайн', e:'🎨', minSmarts:35, years:4 },
  { id:'ped', name:'Педагогика', e:'🍎', minSmarts:40, years:4 },
  { id:'psy', name:'Психология', e:'🧩', minSmarts:50, years:4 },
  { id:'jour', name:'Журналистика', e:'📰', minSmarts:45, years:4 },
  { id:'bio', name:'Биология', e:'🧬', minSmarts:55, years:4 }
];
const EDU_RANK = { none:0, school:1, college:2, bachelor:3, master:4, phd:5 };
const EDU_NAME = { none:'Без образования', school:'Среднее', college:'Колледж', bachelor:'Бакалавр', master:'Магистр', phd:'Доктор наук' };

/* Работа: salary — годовой оклад в базовой валюте на 1-м уровне */
const JOBS = [
  // подработки
  { id:'courier', e:'🛵', name:'Курьер', part:true, minAge:14, salary:180000, titles:['Курьер'] },
  { id:'waiter', e:'🍽️', name:'Официант', part:true, minAge:15, salary:220000, titles:['Официант'] },
  { id:'barista', e:'☕', name:'Бариста', part:true, minAge:16, salary:200000, titles:['Бариста'] },
  { id:'promo', e:'📣', name:'Промоутер', part:true, minAge:14, salary:150000, titles:['Промоутер'] },
  { id:'tutor', e:'📒', name:'Репетитор', part:true, minAge:16, minSmarts:70, salary:260000, titles:['Репетитор'] },
  // полная занятость
  { id:'cashier', e:'🛒', name:'Розничная торговля', salary:360000, titles:['Кассир','Старший кассир','Администратор','Директор магазина','Региональный директор'] },
  { id:'taxi', e:'🚕', name:'Такси', salary:540000, titles:['Водитель такси','Водитель бизнес-класса','Владелец автопарка'] },
  { id:'build', e:'🏗️', name:'Строительство', salary:500000, titles:['Разнорабочий','Каменщик','Бригадир','Прораб','Владелец стройфирмы'] },
  { id:'cook', e:'👨‍🍳', name:'Кулинария', edu:'college', salary:480000, titles:['Помощник повара','Повар','Су-шеф','Шеф-повар','Ресторатор'] },
  { id:'nurse', e:'💉', name:'Сестринское дело', edu:'college', salary:460000, titles:['Медсестра/медбрат','Старшая медсестра','Главная медсестра'] },
  { id:'mech', e:'🔧', name:'Автосервис', edu:'college', salary:520000, titles:['Автомеханик','Мастер','Начальник сервиса','Владелец сервиса'] },
  { id:'police', e:'👮', name:'Полиция', edu:'school', minHealth:50, salary:600000, titles:['Сержант','Лейтенант','Капитан','Майор','Полковник','Генерал'] },
  { id:'army', e:'🎖️', name:'Армия', edu:'school', minHealth:60, salary:620000, titles:['Рядовой','Сержант','Лейтенант','Капитан','Полковник','Генерал'] },
  { id:'fire', e:'🚒', name:'Пожарная служба', edu:'school', minHealth:65, salary:560000, titles:['Пожарный','Старший пожарный','Командир отделения','Начальник части'] },
  { id:'dev', yr:1970, e:'💻', name:'IT', edu:'bachelor', major:'it', salary:1300000, titles:['Джуниор','Мидл','Сеньор','Тимлид','CTO'] },
  { id:'doctor', e:'🩺', name:'Медицина', edu:'bachelor', major:'med', salary:1100000, titles:['Интерн','Врач-терапевт','Хирург','Заведующий отделением','Главврач'] },
  { id:'lawyer', e:'⚖️', name:'Юриспруденция', edu:'bachelor', major:'law', salary:950000, titles:['Помощник юриста','Юрист','Старший юрист','Партнёр','Судья'] },
  { id:'finance', e:'📈', name:'Финансы', edu:'bachelor', major:'econ', salary:1050000, titles:['Аналитик','Старший аналитик','Менеджер','Финансовый директор','Генеральный директор'] },
  { id:'engineer', e:'⚙️', name:'Инженерия', edu:'bachelor', major:'eng', salary:900000, titles:['Инженер','Ведущий инженер','Главный инженер','Технический директор'] },
  { id:'design', e:'🎨', name:'Дизайн', edu:'bachelor', major:'art', salary:720000, titles:['Дизайнер','Старший дизайнер','Арт-директор','Креативный директор'] },
  { id:'teacher', e:'🍎', name:'Образование', edu:'bachelor', salary:500000, titles:['Учитель','Старший учитель','Завуч','Директор школы'] },
  { id:'psych', e:'🧩', name:'Психология', edu:'bachelor', major:'psy', salary:700000, titles:['Психолог','Клинический психолог','Психотерапевт с практикой'] },
  { id:'journalist', e:'📰', name:'Журналистика', edu:'bachelor', major:'jour', salary:600000, titles:['Корреспондент','Журналист','Редактор','Главный редактор'] },
  { id:'scientist', e:'🔬', name:'Наука', edu:'master', salary:850000, titles:['Младший научный сотрудник','Научный сотрудник','Профессор','Академик'] },
  { id:'pilot', yr:1930, e:'✈️', name:'Авиация', edu:'bachelor', major:'eng', minHealth:70, salary:2100000, titles:['Второй пилот','Командир воздушного судна','Шеф-пилот'] },
  { id:'astro', yr:1961, e:'🚀', name:'Космонавтика', edu:'master', minSmarts:85, minHealth:85, salary:2500000, titles:['Кандидат в космонавты','Космонавт','Командир экипажа'] },
  { id:'actor', e:'🎭', name:'Кино', minLooks:65, salary:400000, fame:true, titles:['Массовка','Актёр второго плана','Главная роль','Кинозвезда','Легенда кино'] },
  { id:'model', e:'📸', name:'Мода', minLooks:80, salary:700000, fame:true, titles:['Начинающая модель','Модель','Топ-модель','Супермодель'] },
  { id:'musician', e:'🎸', name:'Музыка', salary:300000, fame:true, titles:['Уличный музыкант','Музыкант','Известный артист','Рок-звезда'] },
  { id:'athlete', e:'⚽', name:'Профспорт', minHealth:80, maxAge:30, salary:1500000, fame:true, titles:['Запасной','Игрок основы','Капитан команды','Легенда спорта'] },
  { id:'politician', e:'🏛️', name:'Политика', edu:'bachelor', minAge:25, salary:1200000, fame:true, titles:['Депутат городской думы','Мэр','Губернатор','Министр','Президент'] }
];

/* Имущество (цены в базовой валюте) */
const SHOP = {
  house: [
    { id:'room', e:'🛏️', name:'Комната в коммуналке', price:1800000 },
    { id:'studio', e:'🏢', name:'Студия', price:4500000 },
    { id:'flat2', e:'🏬', name:'Двухкомнатная квартира', price:9000000 },
    { id:'penthouse', e:'🌆', name:'Пентхаус', price:45000000 },
    { id:'cottage', e:'🏡', name:'Загородный дом', price:16000000 },
    { id:'mansion', e:'🏰', name:'Особняк', price:90000000 },
    { id:'villa', e:'🏝️', name:'Вилла у моря', price:180000000 },
    { id:'island', e:'🗺️', name:'Частный остров', price:900000000 }
  ],
  car: [
    { id:'old', e:'🚗', name:'Подержанный хэтчбек', price:350000 },
    { id:'sedan', e:'🚙', name:'Новый седан', price:2200000 },
    { id:'suv', e:'🛻', name:'Кроссовер', price:4200000 },
    { id:'electro', yr:2010, e:'🔋', name:'Электрокар', price:6000000 },
    { id:'sport', e:'🏎️', name:'Спорткар', price:16000000 },
    { id:'hyper', yr:1995, e:'🚀', name:'Гиперкар', price:85000000 },
    { id:'moto', e:'🏍️', name:'Мотоцикл', price:900000 }
  ],
  luxury: [
    { id:'watch', e:'⌚', name:'Швейцарские часы', price:1200000 },
    { id:'yacht', e:'🛥️', name:'Яхта', price:120000000 },
    { id:'jet', yr:1960, e:'🛩️', name:'Частный самолёт', price:450000000 },
    { id:'art', e:'🖼️', name:'Картина известного художника', price:25000000 },
    { id:'jewel', e:'💎', name:'Бриллиантовое колье', price:8000000 }
  ]
};

const PETS = [
  { id:'dog', e:'🐶', name:'Собака', life:13 }, { id:'cat', e:'🐱', name:'Кошка', life:15 },
  { id:'parrot', e:'🦜', name:'Попугай', life:25 }, { id:'hamster', e:'🐹', name:'Хомяк', life:3 },
  { id:'fish', e:'🐠', name:'Рыбка', life:5 }, { id:'rabbit', e:'🐰', name:'Кролик', life:9 },
  { id:'turtle', e:'🐢', name:'Черепаха', life:60 }, { id:'horse', e:'🐴', name:'Лошадь', life:28 }
];
const PET_NAMES = ['Бублик','Луна','Рыжик','Маркиз','Соня','Тайсон','Пончик','Звёздочка','Граф','Кексик','Шарик','Ириска','Буся','Чарли','Мася','Ветер'];

const DISEASES = [
  { id:'cold', name:'Простуда', dmg:2, cure:0.95, heal:0.8 },
  { id:'flu', name:'Грипп', dmg:5, cure:0.9, heal:0.5 },
  { id:'migraine', name:'Мигрень', dmg:3, cure:0.6, heal:0.15, happy:-4 },
  { id:'depression', name:'Депрессия', dmg:3, cure:0.55, heal:0.1, happy:-12 },
  { id:'allergy', name:'Аллергия', dmg:1, cure:0.5, heal:0.05 },
  { id:'fracture', name:'Перелом', dmg:6, cure:0.95, heal:0.6 },
  { id:'pneumonia', name:'Пневмония', dmg:14, cure:0.8, heal:0.15 },
  { id:'diabetes', name:'Диабет', dmg:4, cure:0.15, heal:0, minAge:20 },
  { id:'hypertension', name:'Гипертония', dmg:4, cure:0.4, heal:0, minAge:35 },
  { id:'heart', name:'Болезнь сердца', dmg:10, cure:0.45, heal:0, minAge:45 },
  { id:'cancer', name:'Онкология', dmg:18, cure:0.4, heal:0.02, minAge:30 },
  { id:'alzheimer', name:'Болезнь Альцгеймера', dmg:8, cure:0.05, heal:0, minAge:65, smarts:-8 }
];

const ACHIEVEMENTS = [
  { id:'born', e:'🍼', t:'Добро пожаловать', d:'Начать первую жизнь' },
  { id:'graduate', e:'🎓', t:'Выпускник', d:'Получить диплом вуза' },
  { id:'phd', e:'🧪', t:'Доктор наук', d:'Защитить докторскую' },
  { id:'firstjob', e:'💼', t:'Первая зарплата', d:'Устроиться на работу' },
  { id:'top', e:'👑', t:'На вершине', d:'Достичь высшей должности в профессии' },
  { id:'president', e:'🏛️', t:'Глава государства', d:'Стать президентом' },
  { id:'astronaut', e:'🚀', t:'К звёздам', d:'Стать космонавтом' },
  { id:'firstlove', e:'💘', t:'Первая любовь', d:'Начать отношения' },
  { id:'married', e:'💍', t:'Горько!', d:'Вступить в брак' },
  { id:'parent', e:'👶', t:'Родитель', d:'Завести ребёнка' },
  { id:'bigfamily', e:'👨‍👩‍👧‍👦', t:'Большая семья', d:'Вырастить 4+ детей' },
  { id:'million', e:'💵', t:'Миллионер', d:'Скопить 1 млн ₽' },
  { id:'hundredm', e:'💰', t:'Сто миллионов', d:'Скопить 100 млн ₽' },
  { id:'billion', e:'🏦', t:'Миллиардер', d:'Капитал 1 млрд ₽' },
  { id:'debt', e:'📉', t:'По уши в долгах', d:'Уйти в минус на 1 млн ₽' },
  { id:'homeowner', e:'🏠', t:'Свой угол', d:'Купить жильё' },
  { id:'island', e:'🏝️', t:'Робинзон', d:'Купить частный остров' },
  { id:'collector', e:'🚘', t:'Коллекционер', d:'Владеть 3+ машинами' },
  { id:'traveler', e:'🧳', t:'Путешественник', d:'Посетить 10 стран' },
  { id:'emigrant', e:'🛫', t:'Гражданин мира', d:'Переехать в другую страну' },
  { id:'famous', e:'🌟', t:'Знаменитость', d:'1 000 000 подписчиков' },
  { id:'jackpot', e:'🎰', t:'Джекпот', d:'Выиграть лотерею' },
  { id:'business', e:'🏭', t:'Предприниматель', d:'Открыть бизнес' },
  { id:'pets', e:'🐾', t:'Зоопарк', d:'Завести 3+ питомцев' },
  { id:'saint', e:'😇', t:'Святой', d:'Карма 100' },
  { id:'villain', e:'😈', t:'Злодей', d:'Карма 0' },
  { id:'genius', e:'🧠', t:'Гений', d:'Ум 100' },
  { id:'beauty', e:'💅', t:'Красота спасёт мир', d:'Внешность 100' },
  { id:'athlete', e:'🏅', t:'Железное здоровье', d:'Здоровье 100' },
  { id:'prison', e:'⛓️', t:'За решёткой', d:'Попасть в тюрьму' },
  { id:'escape', e:'🏃', t:'Побег', d:'Сбежать из тюрьмы' },
  { id:'retired', e:'🌅', t:'Заслуженный отдых', d:'Выйти на пенсию' },
  { id:'old90', e:'🎂', t:'Мудрец', d:'Дожить до 90' },
  { id:'old100', e:'💯', t:'Долгожитель', d:'Дожить до 100' },
  { id:'young', e:'🥀', t:'Слишком рано', d:'Умереть до 30' },
  { id:'dynasty', e:'🧬', t:'Династия', d:'Продолжить игру за своего ребёнка' },
  { id:'gen5', e:'🌳', t:'Древо рода', d:'Дойти до 5-го поколения' },
  { id:'faith', e:'🙏', t:'Вера', d:'Посетить храм 10 раз' },
  { id:'convert', e:'🔄', t:'Новый путь', d:'Сменить религию' },
  { id:'comingout', e:'🏳️‍🌈', t:'Быть собой', d:'Совершить каминг-аут' }
];
