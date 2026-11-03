'use strict';
/* ===================== English language (interface translation layer) ===================== */
const LANG_KEY = 'lifesim_lang';
let LANG = 'ru';
try { LANG = localStorage.getItem(LANG_KEY) || 'ru'; } catch (e) {}

const EN = new Map();
const add = (ru, en) => { if (ru && en && !EN.has(ru)) EN.set(ru, en); };
function addLines(txt) { for (const line of txt.split('\n')) { const i = line.indexOf('|'); if (i > 0) add(line.slice(0, i).trim(), line.slice(i + 1).trim()); } }

/* ---------- Интерфейс ---------- */
addLines(`симулятор жизни|life simulator
Проживи|Live
свою жизнь|your life
Новая жизнь|New life
Имя|First name
Фамилия|Last name
Случайное|Random
Случайная|Random
Год рождения|Birth year
Страна|Country
Пол|Gender
Ориентация|Orientation
Религия|Religion
Режим|Mode
Вызов|Challenge
Одна жизнь|Single life
Династия|Dynasty
Без вызова|No challenge
Случайный|Random
Случайная страна|Random country
Случайно|Random
По стране|By country
Родиться →|Be born →
Продолжить сохранённую жизнь|Continue saved life
Ежедневный вызов|Daily challenge
Баланс|Balance
Счастье|Happiness
Здоровье|Health
Ум|Smarts
Внешность|Looks
Учёба и работа|School & work
Имущество|Property
Отношения|Relationships
Занятия|Activities
Работа|Work
Деньги|Money
Люди|People
год|year
Закрыть|Close
Продолжить|Continue
Отмена|Cancel
Передумать|Never mind
Оставить|Keep
Оставить как есть|Keep as is
Уже в этом году|Already this year
Мужской|Male
Женский|Female
Небинарный|Non-binary
Гетеросексуальная|Heterosexual
Гомосексуальная|Homosexual
Бисексуальная|Bisexual
Пансексуальная|Pansexual
Асексуальная|Asexual
Атеизм|Atheism
Агностицизм|Agnosticism
Православие|Orthodox Christianity
Католицизм|Catholicism
Протестантизм|Protestantism
Ислам|Islam
Иудаизм|Judaism
Буддизм|Buddhism
Индуизм|Hinduism
Синтоизм|Shinto
Даосизм|Taoism
Сикхизм|Sikhism
Имущество и финансы|Property & finance
Меню|Menu
Профиль|Profile
Достижения|Achievements
Карта мира|World map
Игра|Game
Страна, вера, ориентация, статистика|Country, faith, orientation, stats
Где вы были и куда можно поехать|Where you've been and where to go
Начать новую жизнь|Start a new life
Текущая будет потеряна|The current one will be lost
Новая жизнь?|New life?
Текущий прогресс будет удалён.|Current progress will be deleted.
Да, начать заново|Yes, start over
О вас|About you
Дата рождения|Date of birth
Мировоззрение|Worldview
Карма|Karma
Подписчики|Followers
Образование|Education
Страны|Countries
Чистый капитал|Net worth
Сейчас|Now
Родина|Homeland
Посещено|Visited
Можно поехать|Can visit
Загружаем карту… 🌍|Loading map… 🌍
Образование|Education
Без образования|No education
Среднее|High school
Колледж|College
Бакалавр|Bachelor
Магистр|Master
Доктор наук|PhD
Бросить учёбу|Drop out
Университет|University
Магистратура|Master's program
Аспирантура|PhD program
Получить аттестат (вечерняя школа)|Get a diploma (night school)
Работать усерднее|Work harder
Попросить прибавку|Ask for a raise
Наладить отношения с коллегами|Bond with coworkers
Уволиться|Quit
Пенсия|Retirement
Выйти на пенсию|Retire
Карьерные пути|Career paths
Вакансии|Job openings
Другие вакансии|Other openings
(подработка)|(part-time)
Сначала окончите школу|Finish school first
Уже откликались в этом году|Already applied this year
Собеседование|Job interview
Уверенно|Confidently
Скромно и честно|Modest and honest
Приукрасить резюме|Embellish your résumé
Инвестиции|Investments
Банковский вклад|Bank deposit
+7% в год, без риска|+7% a year, no risk
Акции|Stocks
В среднем +5%, колебания ±25%|About +5% on average, swings ±25%
Криптовалюта|Cryptocurrency
Может вырасти в разы или обнулиться|Can multiply or go to zero
Моё имущество|My property
Пока ничего нет|Nothing yet
Недвижимость|Real estate
Транспорт|Vehicles
Роскошь|Luxury
доступна ипотека|mortgage available
Покупать имущество можно с 18 лет 🙂|You can buy property from age 18 🙂
Семья|Family
Любовь|Love
Дети|Children
Друзья|Friends
Внуки|Grandchildren
Соперники и соседи|Rivals & neighbors
Бывшие|Exes
Питомцы|Pets
Провести время вместе|Spend time together
Поговорить по душам|Heart-to-heart talk
Попросить денег|Ask for money
Сделать предложение|Propose
Скромная роспись|Small registry wedding
Завести ребёнка|Have a child
Романтическое свидание|Romantic date
Поссориться|Argue
Перестать общаться|Stop talking
Усыновление|Adoption
Усыновить|Adopt
Не сейчас|Not now
Тело и здоровье|Body & health
Разум и дух|Mind & spirit
Развлечения|Entertainment
Любовь и общение|Love & social
Азарт и риск|Gambling & risk
Жизнь|Life
Забота о себе|Self-care
Жизнь за решёткой|Life behind bars
Вы ещё слишком малы. Просто растите! 🍼|You're too little. Just grow! 🍼
Не хватает денег 💸|Not enough money 💸
Что дальше?|What's next?
Поступать в университет|Apply to university
Пойти в колледж (3 года)|Go to college (3 years)
Сразу работать|Start working
Взять год на отдых|Take a gap year
Выбор специальности|Choose a major
Покойтесь с миром|Rest in peace
Продолжить за ребёнка|Continue as your child
Поделиться итогом|Share the result
Наследник|Heir
Возраст|Age
Оценка жизни|Life grade
Капитал|Net worth
Карьера|Career
Стран|Countries
Причина|Cause
Естественные причины|Natural causes
Несчастный случай|Accident
Сердечный приступ|Heart attack
ДТП|Car crash
Мир сегодня|World today
Экономика, войны, пандемии, законы|Economy, wars, pandemics, laws
Войны в мире|Wars in the world
Мир. Нигде не стреляют 🕊️|Peace. No shooting anywhere 🕊️
Законы в вашей стране|Laws in your country
Ваша хроника истории|Your history chronicle
Пока история проходит мимо|History is passing you by so far
Женщины голосуют|Women can vote
Однополые браки|Same-sex marriage
Смертная казнь отменена|Death penalty abolished
Запрет курения в барах|Smoking ban in bars
Сухой закон|Prohibition
Обязательный призыв|Military conscription
Кризис|Crisis
Подъём|Boom
Стабильно|Stable
Своё дело|Own business
Ниши|Niches
Выберите нишу|Choose a niche
Начать своё дело|Start a business
Управление|Management
Сделки|Deals
Нанять сотрудника|Hire an employee
Сократить сотрудника|Lay off an employee
Экономия, но качество страдает|Saves money, hurts quality
Сменить стратегию цен|Change pricing strategy
Дёшево · обычно · премиум|Cheap · normal · premium
Выйти на биржу (IPO)|Go public (IPO)
Продать 30% акций публике|Sell 30% of shares to the public
Закрыть бизнес|Close the business
Распродать остатки|Sell off what's left
Открыть бизнес можно с 18 лет|You can start a business at 18
Слава|Fame
Путь к славе|Path to fame
Для знаменитостей|For celebrities
Пройти кастинг|Go to a casting
Шанс попасть в кино или на ТВ|A shot at film or TV
Выступить на открытом микрофоне|Perform at an open mic
Стендап или песни|Stand-up or songs
Участвовать в реалити-шоу|Join a reality show
Быстрая слава, но риск для репутации|Fast fame, risky for your reputation
Дать интервью|Give an interview
Выпустить мерч|Release merch
Деньги от фанатов|Money from fans
Благотворительный концерт|Charity concert
+карма, +слава|+karma, +fame
Красная дорожка|Red carpet
Нужна внешность|Looks required
Написать автобиографию|Write an autobiography
Один раз в жизни|Once in a lifetime
Уволить пиар-агента|Fire your PR agent
Защищает от скандалов|Protects from scandals
Никто вас не знает|Nobody knows you
Местная знаменитость|Local celebrity
Известная личность|Well-known person
Звезда|Star
Мегазвезда|Megastar
Легенда|Legend
Известность|Fame level
Политика|Politics
Вне политики|Not in politics
Начать|Start
Провести реформу|Pass a reform
Рискованно, но может поднять рейтинг|Risky, but may boost your rating
Выступить перед народом|Address the nation
+рейтинг|+approval
Бороться с коррупцией|Fight corruption
+рейтинг, +карма|+approval, +karma
Брать откаты|Take kickbacks
+деньги, риск тюрьмы|+money, risk of prison
Уйти в отставку|Resign
Муниципальный депутат|City council member
Мэр|Mayor
Губернатор|Governor
Депутат парламента|Member of parliament
Министр|Minister
Президент|President
Премьер-министр|Prime minister
Федеральный канцлер|Federal chancellor
Честная кампания|Honest campaign
Популизм и обещания|Populism and promises
Грязные технологии|Dirty tricks
Победить в дебатах|Win the debates
Армия и разведка|Army & intelligence
Армия|Army
Разведка|Intelligence
Военная история|Military record
Гражданское лицо|Civilian
Срочная служба|Conscript service
В стране действует призыв|The country has conscription
Армия контрактная|Professional army
Пойти служить по контракту|Enlist as a contract soldier
Учения|Drills
+эффективность, +здоровье|+performance, +health
Военная академия|Military academy
Отбор в спецназ|Special forces selection
Здоровье 80+|Health 80+
Миротворческая миссия|Peacekeeping mission
Деньги и риск|Money and risk
Подать заявку в разведку|Apply to the intelligence service
Ум 70+, высшее образование|Smarts 70+, university degree
Стать двойным агентом|Become a double agent
Деньги ×2, риск измены|Money ×2, treason risk
Выйти в отставку|Retire
Завербовать информатора|Recruit an informant
Наружное наблюдение|Surveillance
Добыть секретные документы|Steal secret documents
Кибероперация|Cyber operation
Внедриться под легендой|Go undercover
Эвакуировать агента|Extract an agent
Стажёр|Trainee
Оперативник|Field officer
Агент|Agent
Резидент|Station chief
Начальник отдела|Head of department
Директор разведки|Director of intelligence
Путешествия|Travel
Направления|Destinations
Куда отправимся?|Where are we going?
По родной стране|Around your country
Поезд, палатка и новые города|Trains, tents and new cities
Пляжный отдых|Beach holiday
+много счастья|+lots of happiness
Город мечты|Dream city
Музеи, кафе, архитектура|Museums, cafés, architecture
Горы и треккинг|Mountains & trekking
+здоровье, есть риск|+health, some risk
Морской круиз|Sea cruise
Несколько стран за раз|Several countries at once
Сафари|Safari
Львы, слоны и закаты|Lions, elephants and sunsets
Горнолыжный курорт|Ski resort
Снег и глинтвейн|Snow and mulled wine
Космический туризм|Space tourism
Орбита Земли|Earth orbit
Полка пока пустая|The shelf is empty so far
Выберите страну:|Choose a country:
Курорты, круизы, сафари, горы|Resorts, cruises, safaris, mountains
Графики жизни|Life charts
Счастье, здоровье, деньги по годам|Happiness, health, money by year
Итоговая статистика|Life statistics
Самый счастливый год|Happiest year
Самый тяжёлый год|Hardest year
Пик богатства|Peak wealth
Работ сменили|Jobs held
Стран посетили|Countries visited
Преступлений|Crimes
Достижений за жизнь|Achievements this life
Исторических событий пережито|Historic events lived through
Характеристики|Stats
← Назад к итогам|← Back to summary
Вызовы|Challenges
Цель на эту жизнь|A goal for this life
Текущий вызов|Current challenge
Выберите цель на эту жизнь|Pick a goal for this life
в процессе|in progress
Семейный фонд|Family fund
Герб и традиции|Crest & traditions
Сменить герб|Change crest
Символ рода|Family symbol
Древо рода|Family tree
Реликвии|Heirlooms
Цели династии|Dynasty goals
Основать свой род|Found your house
Основать династию|Found a dynasty
Внести 25% наличных|Deposit 25% of cash
Взять 10%|Withdraw 10%
5 поколений|5 generations
100 лет роду|House is 100 years old
Фонд 1 млрд ₽|Fund of 1B ₽
Семейный бизнес в 3 поколениях|Family business for 3 generations
Найти дальнего родственника|Find a distant relative
Кладбище и рейтинг|Graveyard & ranking
Внешность|Appearance
Тон кожи|Skin tone
Цвет глаз|Eye color
Причёска|Hairstyle
Цвет волос|Hair color
Одежда|Clothes
Очки|Glasses
Борода|Beard
с рождения|from birth
Звук|Sound
Установить как приложение|Install as an app
Играть офлайн с главного экрана|Play offline from your home screen
Поделиться историей|Share your story
Картинка с итогами жизни|An image with your life summary
Таланты и хобби|Talents & hobbies
Навыки, конкурсы, подработка|Skills, contests, side gigs
Здоровье и привычки|Health & habits
Стресс, сон, курение, страховка|Stress, sleep, smoking, insurance
Биржа|Stock exchange
11 компаний, кризисы и бумы эпох|11 companies, booms and busts
Кредиты и рейтинг|Credit & score
Кредитный рейтинг и займы|Credit score and loans
Соцсеть|Social network
Лента друзей, лайки и посты|Friends' feed, likes and posts
Кружки и секции|Clubs & sports
Развить навык и найти друзей|Build a skill and find friends
Учёба за границей|Study abroad
Престижный вуз в другой стране|A prestigious university abroad
Спортзал|Gym
+здоровье, +внешность|+health, +looks
Пробежка в парке|Run in the park
Бесплатно и полезно|Free and healthy
Правильное питание|Healthy eating
+здоровье на год|+health for the year
Врач|Doctor
Лечение болезней|Treat illnesses
Частная клиника|Private clinic
Лучшее лечение|The best treatment
Салон красоты|Beauty salon
+внешность|+looks
Пластическая операция|Plastic surgery
Риск есть всегда|There's always a risk
Учиться усерднее|Study harder
+оценки, +ум|+grades, +smarts
Библиотека|Library
+ум|+smarts
Учить иностранный язык|Learn a language
Шахматный клуб|Chess club
Медитация|Meditation
+счастье|+happiness
Психотерапевт|Therapist
+счастье, лечит депрессию|+happiness, treats depression
Посетить храм|Visit a temple
Вера и покой|Faith and peace
Волонтёрство|Volunteering
+карма|+karma
Пожертвовать 10% капитала|Donate 10% of your wealth
+карма, +счастье|+karma, +happiness
Видеоигры|Video games
Вечеринка|Party
Новые знакомства|Meet new people
Концерт|Concert
Путешествие|Trip
Снять видео для блога|Film a blog video
Подписчики и доход|Followers and income
Знакомства|Dating
Приложение для знакомств|Dating app
Пойти на танцы|Go dancing
Найти пару|Find a partner
Найти друга|Make a friend
Новое знакомство|A new acquaintance
Завести питомца|Get a pet
Пушистый друг|A furry friend
Каминг-аут|Coming out
Рассказать близким|Tell your loved ones
Казино|Casino
Удача любит смелых|Fortune favors the bold
Лотерея|Lottery
Шанс на джекпот|A shot at the jackpot
Мелкая кража|Petty theft
Риск тюрьмы|Risk of prison
Угнать машину|Steal a car
Серьёзный риск|Serious risk
Хакерская атака|Hacking
Нужен ум 75+|Requires smarts 75+
Ограбить банк|Rob a bank
Всё или ничего|All or nothing
Переехать в другую страну|Move to another country
Новая жизнь за границей|A new life abroad
Сменить религию|Change religion
Выбор веры|Choose a faith
Гендерная идентичность|Gender identity
Изменить пол|Change gender
Тренироваться во дворе|Work out in the yard
Тюремная библиотека|Prison library
Примерное поведение|Good behavior
Шанс УДО|Chance of parole
Побег|Escape
Очень рискованно|Very risky
Рулетка|Roulette
Слоты|Slots
Блэкджек|Blackjack
Не верю в сказки|I don't believe in fairy tales
Принять|Accept
Отказаться|Decline
Согласиться|Agree
Отказать|Refuse
Остаться|Stay
Уйти|Leave
Простить|Forgive
Подождать|Wait
Участвовать|Take part
Пойти|Go
Не пойду|I won't go
Нет, спасибо|No, thanks
Обойдусь|I'll pass
Сам справлюсь|I'll manage
Справлюсь сам|I'll manage
Попробовать|Try
Вернуть владельцу|Return it to the owner
Забрать деньги|Keep the money
Одолжить|Lend
Вызвать полицию|Call the police
Скрыться с места|Flee the scene
Назвать код|Tell them the code
Положить трубку|Hang up
Отправиться на фронт|Go to the front
Работать в тылу|Work on the home front
Уклониться|Dodge the draft
Повестка|Draft notice
Дембель|Discharge
Домой!|Home!
Остаться по контракту|Re-enlist
Фронт|Front line
Выборы|Elections
Переизбираться|Run for re-election
Уйти красиво|Step down gracefully
Конверт|The envelope
Взять|Take it
Выгнать|Throw them out
Журналисты|Journalists
Всё отрицать|Deny everything
Признать и извиниться|Admit it and apologize
Папарацци|Paparazzi
Скандал|Scandal
Опровергнуть|Deny it
Ток-шоу|Talk show
Конкурент|Competitor
Снизить цены|Cut prices
Сделать лучше качество|Improve quality
Ничего не делать|Do nothing
Проверка|Inspection
Показать честные книги|Show honest books
Дать взятку|Offer a bribe
Ключевой сотрудник|Key employee
Отпустить|Let them go
Инвестор|Investor
Продать долю|Sell a stake
Стратегия|Strategy
Дёшево|Cheap
Обычно|Normal
Премиум|Premium
Яркий свет|A bright light
Шагнуть в луч|Step into the beam
Бежать!|Run!
Двойник|The double
Запомнить|Remember it
Говорящий кот|The talking cat
Послушаться|Obey
Показалось|Must have imagined it
Красная|Red
Синяя|Blue
Революция|Revolution
Поддержать красных|Support the Reds
Поддержать белых|Support the Whites
Эмигрировать|Emigrate
Блокада|The siege
Чернобыль|Chernobyl
Распад СССР|Collapse of the USSR
Строить новую страну|Build a new country
Уехать за границу|Move abroad
Тосковать по прошлому|Miss the old days
Плыть!|Sail!
Локдаун|Lockdown
Вакцина|Vaccine
Привиться|Get vaccinated
Автоматизация|Automation
Пройти переобучение|Retrain
Колония на Марсе|Mars colony
Подать заявку|Apply
Земля лучше|Earth is better
Мобилизация|Mobilization
Уехать из страны|Leave the country
Начать экзамен|Start the exam
Пропустить экзамены|Skip the exams
Мысль|Thought
Фото|Photo
Мем|Meme
Лента|Feed
Хватит|Enough
Ещё карту|Hit
Удвоить|Double
Ещё раз|Again
Крутить ещё|Spin again
Ещё раздача|Deal again
Отыграться|Win it back`);

/* ---------- Данные: страны, профессии, достижения ---------- */
const COUNTRY_EN = { ru: 'Russia', ua: 'Ukraine', by: 'Belarus', kz: 'Kazakhstan', us: 'USA', gb: 'United Kingdom', ca: 'Canada', au: 'Australia', de: 'Germany', fr: 'France', es: 'Spain', it: 'Italy', mx: 'Mexico', ar: 'Argentina', br: 'Brazil', pt: 'Portugal', jp: 'Japan', kr: 'South Korea', cn: 'China', tr: 'Turkey', ae: 'UAE', in: 'India', ch: 'Switzerland', no: 'Norway', pl: 'Poland', cz: 'Czechia', nl: 'Netherlands', be: 'Belgium', at: 'Austria', ie: 'Ireland', se: 'Sweden', fi: 'Finland', dk: 'Denmark', is: 'Iceland', gr: 'Greece', rs: 'Serbia', ge: 'Georgia', am: 'Armenia', az: 'Azerbaijan', uz: 'Uzbekistan', mn: 'Mongolia', il: 'Israel', sa: 'Saudi Arabia', eg: 'Egypt', ma: 'Morocco', ng: 'Nigeria', ke: 'Kenya', za: 'South Africa', th: 'Thailand', vn: 'Vietnam', idn: 'Indonesia', ph: 'Philippines', sg: 'Singapore', nz: 'New Zealand', co: 'Colombia', cl: 'Chile', pe: 'Peru', cu: 'Cuba', ro: 'Romania', hu: 'Hungary', bg: 'Bulgaria', sk: 'Slovakia', si: 'Slovenia', hr: 'Croatia', ba: 'Bosnia and Herzegovina', me: 'Montenegro', mk: 'North Macedonia', al: 'Albania', lt: 'Lithuania', lv: 'Latvia', ee: 'Estonia', md: 'Moldova', cy: 'Cyprus', mt: 'Malta', lu: 'Luxembourg', kg: 'Kyrgyzstan', tj: 'Tajikistan', tm: 'Turkmenistan', ir: 'Iran', iq: 'Iraq', jo: 'Jordan', lb: 'Lebanon', sy: 'Syria', qa: 'Qatar', kw: 'Kuwait', om: 'Oman', pk: 'Pakistan', bd: 'Bangladesh', lk: 'Sri Lanka', np: 'Nepal', my: 'Malaysia', kh: 'Cambodia', la: 'Laos', mm: 'Myanmar', kp: 'North Korea', tw: 'Taiwan', ve: 'Venezuela', ec: 'Ecuador', bo: 'Bolivia', uy: 'Uruguay', py: 'Paraguay', cr: 'Costa Rica', pa: 'Panama', do: 'Dominican Republic', gt: 'Guatemala', jm: 'Jamaica', gh: 'Ghana', et: 'Ethiopia', tz: 'Tanzania', ug: 'Uganda', sn: 'Senegal', ci: 'Côte d’Ivoire', cm: 'Cameroon', dz: 'Algeria', tn: 'Tunisia', ao: 'Angola', mz: 'Mozambique', zw: 'Zimbabwe', mg: 'Madagascar', fj: 'Fiji', ad: 'Andorra', li: 'Liechtenstein', sm: 'San Marino', mc: 'Monaco', bh: 'Bahrain', hn: 'Honduras', ni: 'Nicaragua', sv: 'El Salvador', bs: 'Bahamas', tt: 'Trinidad and Tobago', ml: 'Mali', bj: 'Benin' };
const OLDNAME_EN = { 'Российская империя': 'Russian Empire', 'Советская Россия': 'Soviet Russia', 'Австро-Венгрия': 'Austria-Hungary', 'Чехословакия': 'Czechoslovakia', 'Османская империя': 'Ottoman Empire', 'Британская Индия': 'British India', 'Югославия': 'Yugoslavia', 'Германская империя': 'German Empire', 'Веймарская республика': 'Weimar Republic', 'Третий рейх': 'Third Reich', 'Германия (ФРГ и ГДР)': 'Germany (West & East)', 'Цинская империя': 'Qing Empire', 'Персия': 'Persia', 'Цейлон': 'Ceylon', 'Бирма': 'Burma', 'Родезия': 'Rhodesia', 'Золотой Берег': 'Gold Coast', 'Сербия и Черногория': 'Serbia and Montenegro', 'Голландская Ост-Индия': 'Dutch East Indies', 'Французский Индокитай': 'French Indochina', 'Подмандатная Палестина': 'Mandatory Palestine', 'Корея (японская оккупация)': 'Korea (Japanese rule)' };
const JOB_EN = { courier: ['Delivery', 'Courier'], waiter: ['Waiting tables', 'Waiter'], barista: ['Barista', 'Barista'], promo: ['Promoter', 'Promoter'], tutor: ['Tutor', 'Tutor'], cashier: ['Retail', 'Cashier/Senior cashier/Store manager/Store director/Regional director'], taxi: ['Taxi', 'Taxi driver/Business-class driver/Fleet owner'], build: ['Construction', 'Laborer/Bricklayer/Foreman/Site manager/Construction firm owner'], cook: ['Culinary', 'Kitchen assistant/Cook/Sous-chef/Head chef/Restaurateur'], nurse: ['Nursing', 'Nurse/Senior nurse/Head nurse'], mech: ['Car service', 'Mechanic/Master mechanic/Service manager/Garage owner'], police: ['Police', 'Sergeant/Lieutenant/Captain/Major/Colonel/General'], army: ['Army', 'Private/Sergeant/Lieutenant/Captain/Colonel/General'], fire: ['Fire service', 'Firefighter/Senior firefighter/Squad leader/Fire chief'], dev: ['IT', 'Junior/Middle/Senior/Team lead/CTO'], doctor: ['Medicine', 'Intern/General practitioner/Surgeon/Head of department/Chief physician'], lawyer: ['Law', 'Paralegal/Lawyer/Senior lawyer/Partner/Judge'], finance: ['Finance', 'Analyst/Senior analyst/Manager/CFO/CEO'], engineer: ['Engineering', 'Engineer/Lead engineer/Chief engineer/Technical director'], design: ['Design', 'Designer/Senior designer/Art director/Creative director'], teacher: ['Education', 'Teacher/Senior teacher/Vice principal/Principal'], psych: ['Psychology', 'Psychologist/Clinical psychologist/Private psychotherapist'], journalist: ['Journalism', 'Reporter/Journalist/Editor/Editor-in-chief'], scientist: ['Science', 'Junior researcher/Researcher/Professor/Academician'], pilot: ['Aviation', 'First officer/Captain/Chief pilot'], astro: ['Spaceflight', 'Astronaut candidate/Astronaut/Mission commander'], actor: ['Film', 'Extra/Supporting actor/Lead role/Movie star/Film legend'], model: ['Fashion', 'Aspiring model/Model/Top model/Supermodel'], musician: ['Music', 'Street musician/Musician/Famous artist/Rock star'], athlete: ['Pro sports', 'Substitute/Starter/Team captain/Sports legend'], politician: ['Politics', 'City council member/Mayor/Governor/Minister/President'] };
const ACH_EN = { born: ['Welcome', 'Be born'], graduate: ['Graduate', 'Finish university'], phd: ['PhD', 'Defend a dissertation'], firstjob: ['First paycheck', 'Get your first job'], top: ['At the top', 'Reach the top of a profession'], president: ['Head of state', 'Lead your country'], astronaut: ['To the stars', 'Become an astronaut'], firstlove: ['First love', 'Start a relationship'], married: ['Just married!', 'Get married'], parent: ['Parent', 'Have a child'], bigfamily: ['Big family', '4 or more children'], million: ['Millionaire', 'Net worth 1M ₽'], hundredm: ['A hundred million', 'Net worth 100M ₽'], billion: ['Billionaire', 'Net worth 1B ₽'], debt: ['Up to your ears', 'Owe 1M ₽'], homeowner: ['A place of your own', 'Buy a home'], island: ['Robinson', 'Buy a private island'], collector: ['Collector', 'Own 3 cars'], traveler: ['Traveler', 'Visit 10 countries'], emigrant: ['Citizen of the world', 'Move abroad'], famous: ['Celebrity', '1M followers'], jackpot: ['Jackpot', 'Win big'], business: ['Entrepreneur', 'Start a business'], pets: ['Zoo', '3 pets at once'], saint: ['Saint', 'Karma 100'], villain: ['Villain', 'Karma 0'], genius: ['Genius', 'Smarts 100'], beauty: ['Beauty saves the world', 'Looks 100'], athlete: ['Iron health', 'Health 100'], prison: ['Behind bars', 'Go to prison'], escape: ['Escape', 'Break out of prison'], retired: ['Well-earned rest', 'Retire'], old90: ['Sage', 'Live to 90'], old100: ['Centenarian', 'Live to 100'], young: ['Too soon', 'Die before 30'], dynasty: ['Dynasty', 'Continue as your child'], gen5: ['Family tree', 'Reach generation 5'], faith: ['Faith', 'Visit a temple 10 times'], convert: ['A new path', 'Change religion'], comingout: ['Be yourself', 'Come out'] };
const ACT_EN = { gym: ['Gym'], run: ['Run in the park'], diet: ['Healthy eating'], doctor: ['Doctor'], clinic: ['Private clinic'], salon: ['Beauty salon'], surgery: ['Plastic surgery'], study: ['Study harder'], library: ['Library'], lang: ['Learn a language'], chess: ['Chess club'], meditate: ['Meditation'], therapy: ['Therapist'], temple: ['Visit a temple'], volunteer: ['Volunteering'], charity: ['Donate 10% of your wealth'], games: ['Video games'], party: ['Party'], concert: ['Concert'], travel: ['Travel'], blog: ['Film a blog video'], dating: ['Dating'], friend: ['Make a friend'], pet: ['Get a pet'], comingout: ['Coming out'], casino: ['Casino'], lottery: ['Lottery'], theft: ['Petty theft'], carjack: ['Steal a car'], hack: ['Hacking'], heist: ['Rob a bank'], emigrate: ['Move to another country'], religion: ['Change religion'], identity: ['Gender identity'] };
const MAJOR_EN = { it: 'Computer science', med: 'Medicine', law: 'Law', econ: 'Economics', eng: 'Engineering', art: 'Art & design', ped: 'Education', psy: 'Psychology', jour: 'Journalism', bio: 'Biology' };
const SHOP_EN = { room: 'Room in a shared flat', studio: 'Studio apartment', flat2: 'Two-bedroom apartment', penthouse: 'Penthouse', cottage: 'Country house', mansion: 'Mansion', villa: 'Seaside villa', island: 'Private island', old: 'Used hatchback', sedan: 'New sedan', suv: 'Crossover', electro: 'Electric car', sport: 'Sports car', hyper: 'Hypercar', moto: 'Motorcycle', watch: 'Swiss watch', yacht: 'Yacht', jet: 'Private jet', art: 'Famous painting', jewel: 'Diamond necklace' };
const PET_EN = { dog: 'Dog', cat: 'Cat', parrot: 'Parrot', hamster: 'Hamster', fish: 'Fish', rabbit: 'Rabbit', turtle: 'Turtle', horse: 'Horse' };
const DIS_EN = { cold: 'Cold', flu: 'Flu', migraine: 'Migraine', depression: 'Depression', allergy: 'Allergy', fracture: 'Fracture', pneumonia: 'Pneumonia', diabetes: 'Diabetes', hypertension: 'Hypertension', heart: 'Heart disease', cancer: 'Cancer', alzheimer: "Alzheimer's disease" };
function buildDataDict() {
  for (const c of COUNTRIES) if (COUNTRY_EN[c.id]) { add(c.name, COUNTRY_EN[c.id]); add(`${c.name} (СССР)`, `${COUNTRY_EN[c.id]} (USSR)`); }
  for (const k in OLDNAME_EN) add(k, OLDNAME_EN[k]);
  for (const j of JOBS) { const e = JOB_EN[j.id]; if (!e) continue; add(j.name, e[0]); const t = e[1].split('/'); j.titles.forEach((x, i) => add(x, t[i] || t[t.length - 1])); }
  for (const a of ACHIEVEMENTS) { const e = ACH_EN[a.id]; if (e) { add(a.t, e[0]); add(a.d, e[1]); } }
  for (const a of ACTIVITIES) { const e = ACT_EN[a.id]; if (e) add(a.t, e[0]); }
  for (const m of MAJORS) if (MAJOR_EN[m.id]) add(m.name, MAJOR_EN[m.id]);
  for (const x of Object.values(SHOP).flat()) if (SHOP_EN[x.id]) add(x.name, SHOP_EN[x.id]);
  for (const x of PETS) if (PET_EN[x.id]) add(x.name, PET_EN[x.id]);
  for (const x of DISEASES) if (DIS_EN[x.id]) add(x.name, DIS_EN[x.id]);
  for (const w of WARS) add(w.n, w.n.replace('Первая мировая война', 'World War I').replace('Вторая мировая война', 'World War II').replace('Великая Отечественная война', 'Great Patriotic War').replace('Гражданская война', 'Civil war').replace('Война во Вьетнаме', 'Vietnam War').replace('Корейская война', 'Korean War').replace('Афганская война', 'Soviet–Afghan War'));
  for (const c of (typeof CHALLENGES !== 'undefined' ? CHALLENGES : [])) { const e = { mil30: ['Millionaire by 30', 'Net worth 100M ₽ before 30'], live100: ['Centenarian', 'Live to 100'], pres: ['To the top of power', 'Become head of state'], kids5: ['Big family', 'Raise 5 children'], world20: ['Citizen of the world', 'Visit 20 countries'], saint: ['Saint', 'Karma 100 with no crimes'], escape: ['Shawshank', 'Escape from prison'], star: ['Star', 'Fame 80+'], tycoon: ['Tycoon', 'A business worth 1B ₽'], phd30: ['Prodigy', 'Get a PhD before 30'], spy5: ['Spymaster', 'Reach the top of intelligence'], noWork: ['Rentier', '10M ₽ by 40 without ever working'], rags: ['Rags to riches', 'Born before 1930, become a billionaire'], hero: ['War hero', 'Earn 3 combat awards'], genius: ['Genius', 'Smarts 100 and a professor'] }[c.id]; if (e) { add(c.t, e[0]); add(c.d, e[1]); } }
}

/* ---------- Правила для динамических строк ---------- */
const yrsEn = (n) => `${n} ${+n === 1 ? 'year' : 'years'}`;
const RULES = [
  [/^(\d+) (?:год|года|лет)$/, (m, n) => yrsEn(n)],
  [/^С (\d+) (?:год|года|лет)$/, (m, n) => `From age ${n}`],
  [/^До (\d+) (?:год|года|лет)$/, (m, n) => `Up to age ${n}`],
  [/^в (\d+) (?:год|года|лет)$/, (m, n) => `at ${n}`],
  [/^(.+) в год$/, (m, a) => `${a} a year`],
  [/^Профессия появится в (\d+) году$/, (m, y) => `This job appears in ${y}`],
  [/^Нужно: (.+)$/, (m, a) => `Requires: ${tr(a.charAt(0).toUpperCase() + a.slice(1))}`],
  [/^Нужен диплом: (.+)$/, (m, a) => `Requires a degree: ${tr(a)}`],
  [/^Нужен ум (\d+)\+$/, (m, a) => `Requires smarts ${a}+`],
  [/^Нужно здоровье (\d+)\+$/, (m, a) => `Requires health ${a}+`],
  [/^Нужна внешность (\d+)\+$/, (m, a) => `Requires looks ${a}+`],
  [/^Купить за (.+)$/, (m, a) => `Buy for ${a}`],
  [/^Продать за (.+)$/, (m, a) => `Sell for ${a}`],
  [/^Вложить (.+)$/, (m, a) => `Invest ${a}`],
  [/^Вывести всё \((.+)\)$/, (m, a) => `Withdraw all (${a})`],
  [/^Ипотека: взнос (.+)$/, (m, a) => `Mortgage: ${a} down payment`],
  [/^Цена: (.+)\.$/, (m, a) => `Price: ${a}.`],
  [/^Стоимость: (.+)$/, (m, a) => `Value: ${a}`],
  [/^куплено за (.+)$/, (m, a) => `bought for ${a}`],
  [/^Вложения: (.+)$/, (m, a) => `Investment: ${a}`],
  [/^Зарплата: (.+)$/, (m, a) => `Salary: ${a}`],
  [/^Эффективность: (\d+)%$/, (m, a) => `Performance: ${a}%`],
  [/^Успеваемость: (\d+)%$/, (m, a) => `Grades: ${a}%`],
  [/^осталось (.+)$/, (m, a) => `${tr(a)} left`],
  [/^(\d+) класс$/, (m, a) => `Grade ${a}`],
  [/^Школа$/, () => 'School'],
  [/^Школьник$/, () => 'Schoolchild'],
  [/^Студент вуза$/, () => 'University student'],
  [/^Студент колледжа$/, () => 'College student'],
  [/^Пенсионер$/, () => 'Retiree'],
  [/^Ребёнок$/, () => 'Child'],
  [/^Без работы$/, () => 'Unemployed'],
  [/^В тюрьме$/, () => 'In prison'],
  [/^ещё (.+)$/, (m, a) => `${tr(a)} left`],
  [/^Мама$/, () => 'Mom'], [/^Папа$/, () => 'Dad'], [/^Брат$/, () => 'Brother'], [/^Сестра$/, () => 'Sister'], [/^Сын$/, () => 'Son'], [/^Дочь$/, () => 'Daughter'],
  [/^Друг$/, () => 'Friend'], [/^Подруга$/, () => 'Friend'], [/^Муж$/, () => 'Husband'], [/^Жена$/, () => 'Wife'], [/^Парень$/, () => 'Boyfriend'], [/^Девушка$/, () => 'Girlfriend'],
  [/^Жених$/, () => 'Fiancé'], [/^Невеста$/, () => 'Fiancée'], [/^Внук$/, () => 'Grandson'], [/^Внучка$/, () => 'Granddaughter'], [/^Бывший$/, () => 'Ex'], [/^Бывшая$/, () => 'Ex'],
  [/^Сосед$/, () => 'Neighbor'], [/^Соседка$/, () => 'Neighbor'], [/^Соперник$/, () => 'Rival'], [/^Соперница$/, () => 'Rival'], [/^Покойный партнёр$/, () => 'Late partner'],
  [/^скончал(?:ся|ась|ся\(ась\))$/, () => 'passed away'],
  [/^Открыто (\d+) из (\d+)$/, (m, a, b) => `Unlocked ${a} of ${b}`],
  [/^(\d+) из (\d+)$/, (m, a, b) => `${a} of ${b}`],
  [/^Посещено стран: (\d+) из (\d+)$/, (m, a, b) => `Countries visited: ${a} of ${b}`],
  [/^Посещено стран: (\d+)$/, (m, a) => `Countries visited: ${a}`],
  [/^Продолжительность жизни (\d+)$/, (m, a) => `Life expectancy ${a}`],
  [/^доходы ×(.+)$/, (m, a) => `income ×${a}`],
  [/^Вы здесь$/, () => 'You are here'],
  [/^Город: (.+)$/, (m, a) => `City: ${a}`],
  [/^валюта (.+)$/, (m, a) => `currency ${a}`],
  [/^(\d{4}) год$/, (m, a) => `Year ${a}`],
  [/^сейчас (\d{4})$/, (m, a) => `now ${a}`],
  [/^Поколение (\d+)$/, (m, a) => `Generation ${a}`],
  [/^Инфляция: (.+)%$/, (m, a) => `Inflation: ${a}%`],
  [/^Безработица: (\d+)%$/, (m, a) => `Unemployment: ${a}%`],
  [/^Пенсионный возраст: (.+)$/, (m, a) => `Retirement age: ${a}`],
  [/^Пандемия: (.+)$/, (m, a) => `Pandemic: ${a}`],
  [/^Страна воюет: (.+)$/, (m, a) => `At war: ${tr(a)}`],
  [/^вам было (.+)$/, (m, a) => `you were ${tr(a)}`],
  [/^Слава: (\d+)\/100$/, (m, a) => `Fame: ${a}/100`],
  [/^подписчики: (.+)$/, (m, a) => `followers: ${a}`],
  [/^рейтинг (\d+)%$/, (m, a) => `approval ${a}%`],
  [/^Баллотироваться: (.+)$/, (m, a) => `Run for: ${tr(a)}`],
  [/^Поступить: (.+)$/, (m, a) => `Join as: ${tr(a)}`],
  [/^Добиваться поста: (.+)$/, (m, a) => `Seek the post: ${tr(a)}`],
  [/^Выборы: (.+)$/, (m, a) => `Election: ${tr(a)}`],
  [/^Оценка: (.+)$/, (m, a) => `Valuation: ${a}`],
  [/^Филиалы: (\d+)$/, (m, a) => `Branches: ${a}`],
  [/^сотрудники: (\d+)$/, (m, a) => `staff: ${a}`],
  [/^Качество (\d+)%$/, (m, a) => `Quality ${a}%`],
  [/^Репутация (\d+)%$/, (m, a) => `Reputation ${a}%`],
  [/^Нанять пиар-агента \((.+)\)$/, (m, a) => `Hire a PR agent (${a})`],
  [/^Улучшить качество \((.+)\)$/, (m, a) => `Improve quality (${a})`],
  [/^Рекламная кампания \((.+)\)$/, (m, a) => `Ad campaign (${a})`],
  [/^Открыть филиал \((.+)\)$/, (m, a) => `Open a branch (${a})`],
  [/^Продать бизнес \((.+)\)$/, (m, a) => `Sell the business (${a})`],
  [/^Сейчас филиалов: (\d+)$/, (m, a) => `Branches now: ${a}`],
  [/^Открыть бизнес: 16 ниш$/, () => 'Start a business: 16 niches'],
  [/^маржа (\d+)%$/, (m, a) => `margin ${a}%`],
  [/^риск (высокий|средний|низкий)$/, (m, a) => `risk ${{ высокий: 'high', средний: 'medium', низкий: 'low' }[a]}`],
  [/^Риск провала прикрытия (\d+)%$/, (m, a) => `Cover-blow risk ${a}%`],
  [/^Прикрытие (\d+)%$/, (m, a) => `Cover ${a}%`],
  [/^Операций: (\d+)$/, (m, a) => `Operations: ${a}`],
  [/^В фонде: (.+)$/, (m, a) => `In the fund: ${a}`],
  [/^Дом (.+)$/, (m, a) => `House of ${a}`],
  [/^Поездок в этом году: (\d+)$/, (m, a) => `Trips left this year: ${a}`],
  [/^Сувениры$/, () => 'Souvenirs'],
  [/^новая!$/, () => 'new!'],
  [/^Все вызовы$/, () => 'All challenges'],
  [/^выполнено (\d+) из (\d+)$/, (m, a, b) => `${a} of ${b} completed`],
  [/^Достижение: (.+)$/, (m, a) => `Achievement: ${trFull(a) ?? tr(a) ?? a}`],
  [/^Расходы на жизнь: (.+?)\.$/, (m, a) => `Living costs: ${a.replace('(с арендой)', '(with rent)').replace('пособие', 'benefits')}.`],
  [/^Вы родились (\d+) года в городе (.+), (.+)\.$/, (m, y, c, k) => `You were born in ${y} in ${c}, ${tr(k.replace(/^\S+\s/, ''))}.`],
  [/^Ваши родители: (.+)\.$/, (m, a) => `Your parents: ${a.replace(/ и /g, ' and ')}.`],
  [/^Вы пошли в детский сад\.$/, () => 'You started kindergarten.'],
  [/^Вы пошли в первый класс!$/, () => 'You started first grade!'],
  [/^Вы сделали первые шаги!$/, () => 'You took your first steps!'],
  [/^Ваше первое слово: «(.+)»\.$/, (m, a) => `Your first word: "${a}".`],
  [/^Проценты по долгу: (.+)\.$/, (m, a) => `Interest on debt: ${a}.`],
  [/^Акции: (.+)\.$/, (m, a) => `Stocks: ${a}.`],
  [/^Крипта: (.+)\.$/, (m, a) => `Crypto: ${a}.`],
  [/^Вы в тюрьме\. Осталось: (.+)\.$/, (m, a) => `You're in prison. Time left: ${tr(a)}.`],
  [/^Вы умерли в возрасте (.+)\. Причина: (.+)\.$/, (m, a, b) => `You died at the age of ${tr(a)}. Cause: ${tr(b)}.`],
  [/^Повышение! Теперь вы — (.+)\.$/, (m, a) => `Promotion! You are now ${tr(a)}.`],
  [/^Вам поставили диагноз: (.+)\.$/, (m, a) => `You were diagnosed with: ${tr(a)}.`],
  [/^Доход от блога: (.+)\.$/, (m, a) => `Blog income: ${a}.`],
  [/^Плата за обучение: (.+)\.$/, (m, a) => `Tuition: ${a}.`],
  [/^Платёж по ипотеке: (.+)\. Осталось: (.+)\.$/, (m, a, b) => `Mortgage payment: ${a}. Remaining: ${b}.`],
  [/^Вы вышли на государственную пенсию: (.+) в год\.$/, (m, a) => `You retired on a state pension: ${a} a year.`],
  [/^Вас взяли! Вы теперь (.+) \((.+) в год\)\.$/, (m, a, b) => `You're hired! You're now a ${tr(a)} (${b} a year).`],
  [/^Вам отказали в должности «(.+)»\.$/, (m, a) => `You were turned down for "${tr(a)}".`],
  [/^Кредитный рейтинг$/, () => 'Credit score'],
  [/^Возраст: (\d+)\+(.*)$/, (m, a, b) => `Age ${a}+${b.replace(' · нужен аттестат', ' · diploma required')}`],
  [/^(\d+) поколени[еяй]+$/, (m, a) => `${a} generations`],
  [/^от (\d+)$/, (m, a) => `from ${a}`],
  [/^Куда будете поступать\? Проходной балл зависит от вашего ума\.$/, () => 'Where will you apply? The passing score depends on your smarts.']
];
function tr(s) {
  if (!s) return s;
  if (EN.has(s)) return EN.get(s);
  if (EN_T.length) { const t = trTpl(s); if (t != null) return t; }
  for (const [re, f] of RULES) { const m = s.match(re); if (m) return f(...m); }
  return null;
}

/* ---------- Полный словарь (en-data.js): шаблоны, транслитерация ---------- */
let EN_T = [], trDepth = 0;
const CYR_RE = /[А-Яа-яЁёІіЇїЄєҐґЎўӘәҒғҚқҢңӨөҰұҮүҺһ]/;
let RU_ONLY = null;
const RU_MARK = /[ЫыЭэЪъЁё]/;
function ruLeft(x) {
  if (!x || !CYR_RE.test(x)) return false;
  if (RU_MARK.test(x)) return true;
  if (!RU_ONLY) return true;
  for (const w of x.toLowerCase().split(/[^а-яёіїєґ'’-]+/)) if (w && RU_ONLY.has(w)) return true;
  return false;
}
const UNTR = (x) => (LANG === 'uk' ? ruLeft(x) : CYR_RE.test(x));
const TL = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', і: 'i', ї: 'yi', є: 'ye', ґ: 'g', ў: 'w', ә: 'a', ғ: 'gh', қ: 'q', ң: 'ng', ө: 'o', ұ: 'u', ү: 'u', һ: 'h' };
function translit(s) {
  return s.replace(/(^|[^А-Яа-яЁё])Е/g, '$1Ye').replace(/(^|[^А-Яа-яЁё])е/g, '$1ye').replace(/[ьъ]е/g, 'ye').replace(/ий\b/g, 'iy').replace(/Дж/g, 'J').replace(/дж/g, 'j')
    .replace(/[\u0400-\u04FF]/g, (ch) => { const l = ch.toLowerCase(), t = TL[l]; if (t == null) return ch; return ch === l ? t : t.charAt(0).toUpperCase() + t.slice(1); });
}
const NAME_RE = /^[А-ЯЁІЇЄҐ][А-Яа-яЁёІіЇїЄєҐґЎўӘәҒғҚқҢңӨөҰұҮүҺһ'’-]*(?: [А-ЯЁІЇЄҐ][А-Яа-яЁёІіЇїЄєҐґЎўӘәҒғҚқҢңӨөҰұҮүҺһ'’-]*){0,3}$/;
function loadEnData() {
  if (typeof EN_DATA === 'undefined' || EN_T.length) return;
  for (const [r, e] of EN_DATA.c) add(r, e);
  for (const [r, e] of EN_DATA.s) if (!EN.has(r) || CYR_RE.test(EN.get(r))) EN.set(r, e);
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  EN_T = EN_DATA.t.map(([parts, ph, en]) => ({ lead: parts[0] === '' && parts.length > 1 && parts[1].startsWith(' '), weak: (parts.join('').match(/[А-Яа-яЁё]/g) || []).length < 9, re: new RegExp('^' + parts.map((p, i) => (i ? (/[а-яё]$/.test(parts[i - 1]) && !en.includes('{' + ph[i - 1] + '}') ? '([а-яё()]{0,3})' : '([\\s\\S]*?)') : '') + esc(p)).join('') + '$'), anchor: parts.reduce((a, b) => (b.length > a.length ? b : a), ''), ph, en }));
}
function loadUkData() {
  if (typeof UK_DATA === 'undefined' || EN_T.length) return;
  EN.clear();
  for (const [r, u] of UK_DATA.c) EN.set(r, u);
  for (const [r, u] of UK_DATA.s) EN.set(r, u);
  RULES.length = 0; if (typeof UK_RULES !== 'undefined') RULES.push(...UK_RULES);
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  EN_T = UK_DATA.t.map(([parts, ph, en]) => ({ lead: parts[0] === '' && parts.length > 1 && parts[1].startsWith(' '), weak: (parts.join('').match(/[А-Яа-яЁё]/g) || []).length < 9, re: new RegExp('^' + parts.map((p, i) => (i ? (/[а-яё]$/.test(parts[i - 1]) && !en.includes('{' + ph[i - 1] + '}') ? '([а-яё()]{0,3})' : '([\\s\\S]*?)') : '') + esc(p)).join('') + '$'), anchor: parts.reduce((a, b) => (b.length > a.length ? b : a), ''), ph, en }));
  const words = (x) => x.toLowerCase().split(/[^а-яёіїєґ'’-]+/).filter((w) => w.length > 1);
  const ru = new Set(), uk = new Set();
  for (const [r, u] of UK_DATA.s) { for (const w of words(r)) ru.add(w); for (const w of words(u)) uk.add(w); }
  for (const [parts, , u] of UK_DATA.t) { for (const w of words(parts.join(' '))) ru.add(w); for (const w of words(u)) uk.add(w); }
  for (const [r, u] of UK_DATA.c) { for (const w of words(r)) ru.add(w); for (const w of words(u)) uk.add(w); }
  for (const w of uk) ru.delete(w);
  RU_ONLY = ru;
}
function capTr(x) {
  if (!x || !CYR_RE.test(x) || trDepth > 4) return x;
  trDepth++; try {
    let t = trFull(x); if (t != null) return t;
    const up = x.charAt(0).toUpperCase() + x.slice(1);
    if (up !== x && (t = tr(up)) != null) return /^.\p{Ll}/u.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
    return x;
  } finally { trDepth--; }
}
function trTpl(s, alt) {
  let first = null;
  for (const t of EN_T) {
    if (alt && !t.lead) continue;
    if (t.anchor && !s.includes(t.anchor)) continue;
    const m = s.match(t.re); if (!m) continue;
    if (t.weak && m.slice(1).some((c) => UNTR(c) && !/^[а-яё()]{1,3}$/.test(c) && capTr(c) === c)) continue;
    const caps = {}; t.ph.forEach((n, i) => { caps[n] = m[i + 1]; });
    let r = t.en.replace(/\{(\d+)\}/g, (_, n) => capTr(caps[n] == null ? '' : caps[n]));
    if (alt) r = r.trim();
    if (!UNTR(r)) return r;
    if (first == null) first = r;
  }
  if (!alt && !s.startsWith(' ')) { const r2 = trTpl(' ' + s, true); if (r2 != null && (first == null || !UNTR(r2))) return r2; }
  return first;
}
const EMO_LEAD = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:[️‍⃣]|\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier})*\s*)/u;
const TR_CACHE = new Map();
function trFull(raw) {
  if (TR_CACHE.has(raw)) return TR_CACHE.get(raw);
  const r = trFull0(raw);
  if (TR_CACHE.size > 30000) TR_CACHE.clear();
  TR_CACHE.set(raw, r); return r;
}
const CUR_EN = { сум: 'UZS', сом: 'KGS', лв: 'BGN', ден: 'MKD', дин: 'RSD', смн: 'TJS', риал: 'rial' };
const fixMoney = (x) => LANG === 'uk' ? x.replace(/(\d) тыс\./g, '$1 тис.') : x.replace(/(\d) млрд/g, '$1B').replace(/(\d) млн/g, '$1M').replace(/(\d) тыс\./g, '$1K').replace(/(\d[MBK]?) (сум|сом|лв|ден|дин|смн|риал)(?![а-яё])/g, (m, a, c) => `${a} ${CUR_EN[c]}`);
const EMO_TAIL = /(\s*(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:[️‍⃣]|\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier})*)$/u;
let NAME_SET = null;
function isName(s) {
  if (!NAME_SET) {
    NAME_SET = new Set();
    try { for (const k in NAMES) for (const f of ['m', 'f', 's']) for (const n of NAMES[k][f] || []) NAME_SET.add(n); } catch (e) {}
    try { for (const n of PET_NAMES) NAME_SET.add(n); } catch (e) {}
    try { for (const b in CITY_NAMES) { NAME_SET.add(b); for (const [, n] of CITY_NAMES[b]) NAME_SET.add(n); } } catch (e) {}
  }
  const w = s.split(' ');
  if (NAME_SET.has(w[0])) return true;
  if (w.length > 1) return false;
  const base = s.replace(/(ова|ева|ёва|ина|ая|а)$/, (m) => ({ ова: 'ов', ева: 'ев', ёва: 'ёв', ина: 'ин', ая: 'ий', а: '' }[m]));
  return NAME_SET.has(base) || /(ов|ев|ин|ко|ук|юк|ич|ский|цкий|ова|ева|ина|ская|цкая|швили|дзе|ян|ли|ұлы|ов|енко)$/.test(s);
}
function trFull0(raw) {
  const lead = raw.match(/^(?:\s|·\s|,\s)*/)[0], tail = raw.match(/\s*$/)[0];
  let s = raw.slice(lead.length).trim(); if (!s || !CYR_RE.test(s)) return null;
  const em = s.match(EMO_LEAD); let pre = em ? em[1] : ''; if (em) s = s.slice(pre.length);
  if (LANG === 'uk' && !ruLeft(s) && !EN.has(s) && !/^[А-ЯЁ]{3,}(?![А-ЯЁІЇЄҐа-яёіїєґ])/.test(s)) return null;
  let post = '';
  const fm = fixMoney(s); if (fm !== s && !UNTR(fm)) return lead + pre + fm + tail;
  let out = tr(s);
  if (pre && EN_T.length && (out == null || UNTR(out))) { const o2 = trTpl(pre + s); if (o2 != null && (out == null || !UNTR(o2))) { out = o2; pre = ''; } }
  const et = s.match(EMO_TAIL); if (out == null && et && et[1].length < s.length) { post = et[1]; s = s.slice(0, -post.length); out = tr(s); }
  if (out == null && pre && EN_T.length) { out = trTpl(pre + s); if (out != null) pre = ''; }
  let partial = null; if (out != null && UNTR(out) && EN_T.length) { partial = out; out = null; }
  if (out == null && s.includes(' · ')) { const parts = s.split(' · '); const t = parts.map((p) => (EN_T.length ? capTr(p) : tr(p) ?? p)); if (t.some((x, i) => x !== parts[i])) out = t.join(' · '); }
  if (out == null && /^(.+) \((.+)\)$/.test(s)) { const [, a, b] = s.match(/^(.+) \((.+)\)$/); const ta = tr(a); if (ta) out = `${ta} (${tr(b) ?? b})`; else if (EN_T.length) { const x = `${capTr(a)} (${capTr(b)})`; if (x !== s) out = x; } }
  if (out == null && EN_T.length && trDepth < 4) {
    for (const sep of [': ', '; ', ', ', ' и ', ' — ']) {
      const i = s.indexOf(sep); if (i < 1) continue;
      const parts = sep === ': ' ? [s.slice(0, i), s.slice(i + 2)] : s.split(sep);
      const t = parts.map((p) => capTr(p)); if (t.some((x) => UNTR(x))) continue;
      out = t.join(sep === ' и ' ? (LANG === 'uk' ? ' і ' : ' and ') : sep); break;
    }
  }
  if (out == null && EN_T.length && trDepth < 4) {
    const parts = s.split(/(?<=[.!?…])\s+(?=\S)/);
    if (parts.length > 1) { trDepth++; try { const t = parts.map((p) => { const x = trFull(p); return x != null ? x : p; }); if (t.some((x, i) => x !== parts[i])) out = t.join(' '); } finally { trDepth--; } }
  }
  if (out == null && EN_T.length && trDepth < 5) {
    trDepth++;
    try {
      let m;
      if (/[.!]$/.test(s) && s.length > 2) { const x = trFull(s.slice(0, -1)); if (x != null) out = x + s.slice(-1); }
      if (out == null && (m = s.match(/^«(.+)»$/))) { const x = capTr(m[1]); if (x !== m[1]) out = `"${x}"`; }
      if (out == null && (m = s.match(/^(.+?)(:|:? [−+-]?\d[\d\s,.]*(?: ?(?:млн|млрд|тыс\.))?(?: ?[^\sА-Яа-яЁёІіЇїЄє]+)?)$/))) { const x = trFull(m[1]); if (x != null && !UNTR(x)) out = x + fixMoney(m[2]); }
      if (out == null && (m = s.match(/^([−+-]?\d[\d\s,.]*(?:млн|млрд)?) (\D.*)$/))) { const x = capTr(m[2]); if (!UNTR(x)) out = fixMoney(m[1]) + ' ' + x; }
      if (out == null && s.length < 48 && /^[^\s]+( [^\s]+){1,4}$/.test(s)) {
        const w = s.split(' ');
        for (let i = 1; i < w.length && out == null; i++) {
          const a = capTr(w.slice(0, i).join(' ')), c = capTr(w.slice(i).join(' '));
          if (!UNTR(a) && !UNTR(c)) out = a + ' ' + (/^[A-ZА-Я]/.test(s) && !c.includes(' ') ? c.charAt(0).toUpperCase() + c.slice(1) : c);
        }
      }
    } finally { trDepth--; }
  }
  if (out == null && LANG === 'en' && EN_T.length && s.length < 48 && NAME_RE.test(s) && isName(s)) out = translit(s);
  if (out == null) out = partial;
  if (out == null) return null;
  out = fixMoney(out);
  return lead + pre + out + post + tail;
}
function trNode(n) {
  const v = n.nodeValue; const t = trFull(v); if (t != null && t !== v) n.nodeValue = t;
}
function trTree(root) {
  if (root.nodeType === 3) return trNode(root);
  if (root.nodeType !== 1) return;
  const w = (root.ownerDocument || document).createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) trNode(n);
  for (const elx of [root, ...root.querySelectorAll('[placeholder],[aria-label],[title]')]) for (const a of ['placeholder', 'aria-label', 'title']) { const v = elx.getAttribute && elx.getAttribute(a); if (v) { const t = trFull(v); if (t) elx.setAttribute(a, t); } }
}
function startEnglish() {
  if (LANG === 'uk') loadUkData(); else { buildDataDict(); loadEnData(); }
  for (const fn of ['confirm', 'prompt', 'alert']) { const o = window[fn]; window[fn] = function (m, ...r) { return o.call(window, typeof m === 'string' ? (trFull(m) || m) : m, ...r); }; }
  document.documentElement.lang = LANG;
  document.title = LANG === 'uk' ? 'Життя — симулятор' : 'Life — simulator';
  const p = document.querySelector('.hero p'); if (p) p.textContent = LANG === 'uk' ? `Від першого кроку до останнього подиху. ${COUNTRIES.length} країн, півтора століття історії і тисячі виборів, кожен з яких важливий.` : `From your first step to your last breath. ${COUNTRIES.length} countries, a century and a half of history and thousands of choices that all matter.`;
  trTree(document.body);
  new MutationObserver((ms) => { for (const m of ms) { if (m.type === 'characterData') trNode(m.target); else m.addedNodes.forEach(trTree); } }).observe(document.body, { childList: true, subtree: true, characterData: true });
  const _toast = toast; toast = (t) => {
    if (typeof t === 'string' && t.endsWith('…') && S && S.log && S.log.length) {
      const head = t.slice(0, -1); const its = S.log[S.log.length - 1].items;
      for (let i = its.length - 1; i >= Math.max(0, its.length - 6); i--) if (typeof its[i].t === 'string' && its[i].t.startsWith(head)) { const f = trFull(its[i].t) || its[i].t; return _toast(f.length > 90 ? f.slice(0, 88) + '…' : f); }
    }
    _toast(trFull(t) || t);
  };
}

/* ---------- Переключатель языка ---------- */
const LANGS = [['ru', 'RU', 'Русский'], ['en', 'EN', 'English'], ['uk', 'UA', 'Українська']];
function setLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} location.reload(); }
(function () {
  const b = document.createElement('select');
  b.className = 'icon-btn lang-btn floating'; b.id = 'langBtn';
  b.setAttribute('aria-label', 'Language');
  for (const [id, code, name] of LANGS) { const o = document.createElement('option'); o.value = id; o.textContent = code; o.title = name; if (id === LANG) o.selected = true; b.appendChild(o); }
  b.onchange = () => setLang(b.value);
  document.getElementById('start').appendChild(b);
})();
MENU_HOOKS.push((l) => item(l, { e: '🌐', t: 'Язык · Language · Мова', d: (LANGS.find((x) => x[0] === LANG) || LANGS[0])[2], onClick: () => { closeSheet(); Q.push({ e: '🌐', title: 'Язык · Language · Мова', text: '', choices: LANGS.filter((x) => x[0] !== LANG).map(([id, , name]) => ({ t: name, f: () => { setLang(id); } })) }); pump(); } }));
if (LANG === 'en' || LANG === 'uk') {
  const sc = document.createElement('script'); sc.src = (LANG === 'uk' ? 'uk-data.js' : 'en-data.js') + '?v=24';
  sc.onload = sc.onerror = () => startEnglish();
  document.head.appendChild(sc);
}

