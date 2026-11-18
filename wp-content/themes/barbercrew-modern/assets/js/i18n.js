/* The Barber Crew – Sprachumschalter (Deutsch = feste Standardsprache; Wechsel zu Русский / עברית / English).
   - Deutsch steht im HTML und ist immer der Standard; Übersetzungen werden zur Laufzeit eingesetzt.
   - Wahl wird nur lokal im Browser gespeichert (localStorage "bc-lang", rein funktional, keine Cookies, kein Tracking).
   - Hebräisch: dir="rtl". Schriften lokal (Figtree + Noto Sans Cyrillic/Hebrew via unicode-range).
   - Panel-Animation: motion-anything "stagger-list" (vendor/motion-anything/stagger-list.css). */
(function () {
  'use strict';
  var LANGS = ['ru', 'he', 'en'];
  var NAMES = { de: 'Deutsch', ru: 'Русский', he: 'עברית', en: 'English' };
  // [de, en, ru, he]
  var T = [
    ['Zum Inhalt springen', 'Skip to content', 'Перейти к содержанию', 'דילוג לתוכן'],
    ['The Barber Crew – Startseite', 'The Barber Crew – Home', 'The Barber Crew – Главная', 'The Barber Crew – דף הבית'],
    ['Hauptnavigation', 'Main navigation', 'Главное меню', 'ניווט ראשי'],
    ['Über uns', 'About us', 'О нас', 'עלינו'],
    ['Leistungen & Preise', 'Services & prices', 'Услуги и цены', 'שירותים ומחירים'],
    ['Portfolio', 'Portfolio', 'Портфолио', 'גלריה'],
    ['Bewertungen', 'Reviews', 'Отзывы', 'ביקורות'],
    ['Kontakt', 'Contact', 'Контакты', 'צור קשר'],
    ['Telefon', 'Phone', 'Телефон', 'טלפון'],
    ['Telefon: +43 1 955 35 51', 'Phone: +43 1 955 35 51', 'Телефон: +43 1 955 35 51', 'טלפון: +43 1 955 35 51'],
    ['Termin buchen', 'Book now', 'Записаться', 'קביעת תור'],
    ['Menü öffnen', 'Open menu', 'Открыть меню', 'פתיחת תפריט'],
    ['Barbershop · Wien · 2. Bezirk', 'Barbershop · Vienna · 2nd district', 'Барбершоп · Вена · 2-й район', 'מספרה · וינה · רובע 2'],
    ['Traditionelles Handwerk trifft moderne Kreativität – Haarschnitt, Bart und Rasur für Männer aller Altersgruppen.', 'Traditional craft meets modern creativity – haircuts, beards and shaves for men of all ages.', 'Традиционное мастерство встречается с современным творчеством – стрижка, борода и бритьё для мужчин любого возраста.', 'מלאכת יד מסורתית פוגשת יצירתיות מודרנית – תספורת, זקן וגילוח לגברים בכל הגילאים.'],
    ['Preise ansehen', 'See prices', 'Смотреть цены', 'למחירים'],
    ['Mo – Fr: 9:00 – 18:30 Uhr', 'Mon – Fri: 9:00 – 18:30', 'Пн – Пт: 9:00 – 18:30', 'ב׳–ו׳: 9:00 – 18:30'],
    ['positive Bewertungen', 'positive reviews', 'положительных отзывов', 'ביקורות חיוביות'],
    ['Sprachen im Team', 'languages in the team', 'языка в команде', 'שפות בצוות'],
    ['Montag bis Freitag', 'Monday to Friday', 'с понедельника по пятницу', 'שני עד שישי'],
    ['Wien · Taborstraße', 'Vienna · Taborstraße', 'Вена · Таборштрассе', 'וינה · טבורשטראסה'],
    ['Barber mit Scheren und Werkzeug am Gürtel', 'Barber with scissors and tools on his belt', 'Барбер с ножницами и инструментами на поясе', 'ספר עם מספריים וכלים בחגורה'],
    ['Unsere ', 'Our ', 'Наша ', 'המשימה '],
    ['Mission', 'mission', 'миссия', 'שלנו'],
    ['In Wien hat sich “The Barber Crew” als mehr als nur ein herkömmlicher Barbershop etabliert. Wir sind leidenschaftliche Friseure, die in unserer eleganten Stadt führende Haarschnitt-, Styling- und Pflegedienstleistungen für Männer aller Altersgruppen anbieten. Unser Ansatz kombiniert traditionelles Handwerk mit moderner Kreativität, wobei wir hochwertige Produkte und Techniken nutzen, um jeden Besuch individuell zu gestalten. Unser Salon dient als ein Ort des Austauschs und der Entspannung, wo sich jeder Kunde besonders geschätzt fühlt und Teil einer exklusiven Gemeinschaft wird.',
      'In Vienna, “The Barber Crew” has become more than just an ordinary barbershop. We are passionate barbers offering leading haircut, styling and grooming services for men of all ages in our elegant city. Our approach combines traditional craft with modern creativity, using high-quality products and techniques to make every visit personal. Our salon is a place to connect and relax, where every client feels truly valued and becomes part of an exclusive community.',
      'В Вене “The Barber Crew” стал больше, чем просто обычным барбершопом. Мы — увлечённые своим делом мастера, предлагающие в нашем элегантном городе лучшие услуги по стрижке, стайлингу и уходу для мужчин любого возраста. Наш подход сочетает традиционное мастерство с современным творчеством: мы используем качественные продукты и техники, чтобы сделать каждый визит индивидуальным. Наш салон — место общения и отдыха, где каждый клиент чувствует себя особенно ценным и становится частью эксклюзивного сообщества.',
      'בווינה, “The Barber Crew” הפכה ליותר ממספרה רגילה. אנחנו ספרים נלהבים שמציעים בעירנו האלגנטית שירותי תספורת, עיצוב וטיפוח מובילים לגברים בכל הגילאים. הגישה שלנו משלבת מלאכת יד מסורתית עם יצירתיות מודרנית, עם מוצרים וטכניקות איכותיים, כדי שכל ביקור יהיה אישי. המספרה שלנו היא מקום למפגש ולרגיעה, שבו כל לקוח מרגיש מוערך במיוחד והופך לחלק מקהילה ייחודית.'],
    ['Bei uns wird gesprochen:', 'We speak:', 'У нас говорят на:', 'אצלנו מדברים:'],
    ['Scheren und Kämme auf einem Holztisch', 'Scissors and combs on a wooden table', 'Ножницы и расчёски на деревянном столе', 'מספריים ומסרקים על שולחן עץ'],
    ['Ihr Besuch', 'Your visit', 'Ваш визит', 'הביקור שלך'],
    ['Wohlfühl', 'Feel-good ', 'Фактор ', 'תחושת '],
    ['faktor', 'factor', 'комфорта', 'רווחה'],
    ['Bei “The Barber Crew” steht Ihr Wohlbefinden im Mittelpunkt. Wir streben danach, Ihnen nicht nur exzellente Friseurdienste zu bieten, sondern auch ein entspannendes Gesamterlebnis. Sobald Sie unseren Salon betreten, heißen wir Sie herzlich willkommen, laden Sie zum Entspannen ein und servieren Ihnen ein Getränk Ihrer Wahl, ob heißer Kaffee oder ein kühles Erfrischungsgetränk, um Ihnen sofort ein Gefühl von Komfort zu vermitteln.',
      'At “The Barber Crew”, your well-being comes first. We aim to offer you not only excellent barbering but a relaxing experience overall. As soon as you step into our salon we welcome you warmly, invite you to unwind and serve you a drink of your choice – hot coffee or a cool refreshment – so you feel comfortable right away.',
      'В “The Barber Crew” ваше самочувствие — в центре внимания. Мы стремимся предложить вам не только отличные услуги барбера, но и расслабляющий отдых в целом. Как только вы входите в наш салон, мы радушно встречаем вас, предлагаем расслабиться и подаём напиток на ваш выбор — горячий кофе или прохладительный напиток, — чтобы вы сразу почувствовали себя комфортно.',
      'ב-“The Barber Crew” הרווחה שלך במרכז. אנחנו שואפים להעניק לך לא רק שירותי ספרות מצוינים אלא גם חוויה מרגיעה. מהרגע שנכנסת למספרה נקבל אותך בחום, נזמין אותך להירגע ונגיש משקה לבחירתך – קפה חם או משקה קר ומרענן – כדי שתרגיש בנוח מיד.'],
    ['Leistungen', 'Services', 'Услуги', 'שירותים'],
    ['Preise & ', 'Prices & ', 'Цены и ', 'מחירים ו\u2060'],
    ['Services', 'services', 'услуги', 'שירותים'],
    ['Alle Leistungen und Preise direkt aus unserem Online-Buchungssystem. Wählen Sie Ihren Service und buchen Sie den Termin in wenigen Klicks.', 'All services and prices straight from our online booking system. Choose your service and book in a few clicks.', 'Все услуги и цены — прямо из нашей системы онлайн-записи. Выберите услугу и запишитесь в пару кликов.', 'כל השירותים והמחירים ישירות ממערכת ההזמנות המקוונת שלנו. בחרו שירות וקבעו תור בכמה קליקים.'],
    ['Preiskategorien filtern', 'Filter price categories', 'Фильтр категорий цен', 'סינון קטגוריות מחיר'],
    ['Alle', 'All', 'Все', 'הכול'],
    ['Haare', 'Hair', 'Волосы', 'שיער'],
    ['Premium Haarschnitt (Kurz)', 'Premium haircut (short)', 'Премиум-стрижка (короткие)', 'תספורת פרימיום (קצר)'],
    ['Premium Scherenschnitt (Mittel-lang)', 'Premium scissor cut (medium-long)', 'Премиум-стрижка ножницами (средние)', 'תספורת מספריים פרימיום (בינוני-ארוך)'],
    ['Premium Scherenschnitt (Lang)', 'Premium scissor cut (long)', 'Премиум-стрижка ножницами (длинные)', 'תספורת מספריים פרימיום (ארוך)'],
    ['Haarschnitt mit Kopfmassage', 'Haircut with head massage', 'Стрижка с массажем головы', 'תספורת עם עיסוי ראש'],
    ['Maschinenschnitt – eine Länge (Clipper Cut)', 'Clipper cut – one length', 'Стрижка машинкой – одна длина (Clipper Cut)', 'תספורת מכונה – אורך אחד (Clipper Cut)'],
    ['Konturenrasur (Line Cut)', 'Contour shave (line cut)', 'Окантовка (Line Cut)', 'גילוח קווי מתאר (Line Cut)'],
    ['Kopfrasur', 'Head shave', 'Бритьё головы', 'גילוח ראש'],
    ['Haarschnitt (Mittel Lang)', 'Haircut (medium-long)', 'Стрижка (средние)', 'תספורת (בינוני-ארוך)'],
    ['Kombis', 'Combos', 'Комплексы', 'חבילות'],
    ['Haarschnitt & Bart Styling – Kurz (ohne heiße Kompresse)', 'Haircut & beard styling – short (without hot towel)', 'Стрижка и оформление бороды – короткие (без горячего компресса)', 'תספורת ועיצוב זקן – קצר (בלי מגבת חמה)'],
    ['Haarschnitt & Bart Styling – Mittel (ohne heiße Kompresse)', 'Haircut & beard styling – medium (without hot towel)', 'Стрижка и оформление бороды – средние (без горячего компресса)', 'תספורת ועיצוב זקן – בינוני (בלי מגבת חמה)'],
    ['Haarschnitt & Bart Styling – Lang (ohne heiße Kompresse)', 'Haircut & beard styling – long (without hot towel)', 'Стрижка и оформление бороды – длинные (без горячего компресса)', 'תספורת ועיצוב זקן – ארוך (בלי מגבת חמה)'],
    ['Premium Haarschnitt & Bartschnitt mit Hot Towel', 'Premium haircut & beard trim with hot towel', 'Премиум-стрижка и стрижка бороды с горячим полотенцем', 'תספורת פרימיום ותספורת זקן עם מגבת חמה'],
    ['Haarschnitt & Hot Towel + Ohren- & Nasenwaxing', 'Haircut & hot towel + ear & nose waxing', 'Стрижка и горячее полотенце + воск для ушей и носа', 'תספורת ומגבת חמה + שעווה לאוזניים ולאף'],
    ['Dauerwelle', 'Perm', 'Химическая завивка', 'סלסול'],
    ['Dauerwelle – Oberkopf (Kurz-Mittel)', 'Perm – top of head (short-medium)', 'Завивка – верх головы (короткие-средние)', 'סלסול – חלק עליון (קצר-בינוני)'],
    ['Dauerwelle – Ganzer Kopf (Kurz-Mittel)', 'Perm – full head (short-medium)', 'Завивка – вся голова (короткие-средние)', 'סלסול – כל הראש (קצר-בינוני)'],
    ['Dauerwelle – Oberkopf (Mittel-Lang)', 'Perm – top of head (medium-long)', 'Завивка – верх головы (средние-длинные)', 'סלסול – חלק עליון (בינוני-ארוך)'],
    ['Dauerwelle – Ganzer Kopf (Mittel-Lang)', 'Perm – full head (medium-long)', 'Завивка – вся голова (средние-длинные)', 'סלסול – כל הראש (בינוני-ארוך)'],
    ['Bart', 'Beard', 'Борода', 'זקן'],
    ['Bartschnitt mit Hot Towel', 'Beard trim with hot towel', 'Стрижка бороды с горячим полотенцем', 'תספורת זקן עם מגבת חמה'],
    ['Beard Styling', 'Beard styling', 'Оформление бороды', 'עיצוב זקן'],
    ['Bart trimmen (ohne Rasur)', 'Beard trim (no shave)', 'Подравнивание бороды (без бритья)', 'גיזום זקן (בלי גילוח)'],
    ['Young Barber', 'Young Barber', 'Young Barber', 'Young Barber'],
    ['Ermäßigter Kennenlernpreis – Sie werden von unserem Young Barber bedient, der Termin dauert etwas länger.', 'Reduced introductory price – you will be served by our Young Barber; the appointment takes a little longer.', 'Сниженная цена для знакомства – вас обслужит наш Young Barber, визит длится немного дольше.', 'מחיר היכרות מוזל – יטפל בך ה-Young Barber שלנו, והתור אורך קצת יותר.'],
    ['Haarschnitt', 'Haircut', 'Стрижка', 'תספורת'],
    ['Bart trimmen', 'Beard trim', 'Подравнивание бороды', 'גיזום זקן'],
    ['Bartschnitt', 'Beard cut', 'Стрижка бороды', 'תספורת זקן'],
    ['Haarschnitt & Rasur', 'Haircut & shave', 'Стрижка и бритьё', 'תספורת וגילוח'],
    ['Kinder', 'Kids', 'Дети', 'ילדים'],
    ['Haarschnitt (bis 12 Jahre)', 'Haircut (up to 12 years)', 'Стрижка (до 12 лет)', 'תספורת (עד גיל 12)'],
    ['Extras & Waxing', 'Extras & waxing', 'Дополнительно и воск', 'תוספות ושעווה'],
    ['Augenbrauen Styling', 'Eyebrow styling', 'Оформление бровей', 'עיצוב גבות'],
    ['Augenbrauen färben', 'Eyebrow tint', 'Окрашивание бровей', 'צביעת גבות'],
    ['Wimpern färben', 'Eyelash tint', 'Окрашивание ресниц', 'צביעת ריסים'],
    ['Kopfmassage mit Haartonic · 5 Minuten', 'Head massage with hair tonic · 5 minutes', 'Массаж головы с тоником · 5 минут', 'עיסוי ראש עם טוניק לשיער · 5 דקות'],
    ['Kopfmassage mit Haartonic · 10 Minuten', 'Head massage with hair tonic · 10 minutes', 'Массаж головы с тоником · 10 минут', 'עיסוי ראש עם טוניק לשיער · 10 דקות'],
    ['Kopfmassage mit Haartonic · 15 Minuten', 'Head massage with hair tonic · 15 minutes', 'Массаж головы с тоником · 15 минут', 'עיסוי ראש עם טוניק לשיער · 15 דקות'],
    ['Waxing – Nase', 'Waxing – nose', 'Воск – нос', 'שעווה – אף'],
    ['Waxing – Ohren', 'Waxing – ears', 'Воск – уши', 'שעווה – אוזניים'],
    ['Waxing – Nase & Ohren', 'Waxing – nose & ears', 'Воск – нос и уши', 'שעווה – אף ואוזניים'],
    ['Grauhaarkaschierung', 'Grey blending', 'Камуфляж седины', 'הסוואת שיער שיבה'],
    ['Preise in Euro inkl. MwSt., laut Treatwell-Buchungsseite (Stand: 31.10.2026). Verbindlich ist der Preis bei der Buchung.', 'Prices in euros incl. VAT, as listed on the Treatwell booking page (as of 31.10.2026). The price shown at booking applies.', 'Цены в евро с НДС, по данным страницы записи Treatwell (на 31.10.2026). Действует цена при записи.', 'המחירים באירו כולל מע״מ, לפי דף ההזמנות של Treatwell (נכון ל-31.10.2026). המחיר הקובע הוא המחיר בעת ההזמנה.'],
    ['Handwerk, das man ', 'Craft you can ', 'Мастерство, которое ', 'עבודה '],
    ['sieht', 'see', 'видно', 'שרואים'],
    ['Bartrasur mit Rasiermesser', 'Beard shave with a straight razor', 'Бритьё бороды опасной бритвой', 'גילוח זקן בתער'],
    ['Klassischer Barber-Stuhl', 'Classic barber chair', 'Классическое кресло барбера', 'כיסא ספר קלאסי'],
    ['Vintage-Barbierwerkzeug', 'Vintage barber tools', 'Винтажные инструменты барбера', 'כלי ספרות וינטג׳'],
    ['Haarschnitt beim Barber', 'Haircut at the barber', 'Стрижка у барбера', 'תספורת אצל הספר'],
    ['Aufsätze für Haarschneidemaschinen', 'Clipper guards', 'Насадки для машинок', 'מסרקי מכונת תספורת'],
    ['Haarschnitt mit Kamm und Sprühflasche', 'Haircut with comb and spray bottle', 'Стрижка с расчёской и пульверизатором', 'תספורת עם מסרק ומרסס'],
    ['Zufriedene Kunden', 'Happy clients', 'Довольные клиенты', 'לקוחות מרוצים'],
    ['Ein Auszug aus über ', 'A selection from over ', 'Выдержки из более чем ', 'מבחר מתוך '],
    [' positiven Bewertungen', ' positive reviews', ' положительных отзывов', ' ויותר ביקורות חיוביות'],
    ['Super service. Super preise. Nette friseure. Coole musik. Alles hochprofessionell.', 'Great service. Great prices. Friendly barbers. Cool music. Everything highly professional.', 'Отличный сервис. Отличные цены. Приятные мастера. Классная музыка. Всё очень профессионально.', 'שירות מעולה. מחירים מעולים. ספרים נחמדים. מוזיקה מגניבה. הכול מקצועי ביותר.'],
    ['Viele sprachen werden perfekt gesprochen: Deutsch, englisch, russisch und hebräisch', 'Many languages spoken perfectly: German, English, Russian and Hebrew', 'Прекрасно говорят на многих языках: немецком, английском, русском и иврите', 'מדברים מצוין בהרבה שפות: גרמנית, אנגלית, רוסית ועברית'],
    ['Ein sehr toller Service , ein sehr sauberes Barber Shop alles Tip Top.', 'Really great service, a very clean barbershop – everything tip-top.', 'Очень классный сервис, очень чистый барбершоп – всё на высшем уровне.', 'שירות נהדר, מספרה נקייה מאוד – הכול טיפ־טופ.'],
    ['Habe eine neue Friseur gemacht bekommen und mein Bart wurde auch sehr schön geschnitten mit einem wunderschönen Verlauf.', 'I got a new haircut and my beard was trimmed beautifully too, with a gorgeous fade.', 'Мне сделали новую стрижку, и бороду тоже подстригли очень красиво, с прекрасным переходом.', 'קיבלתי תספורת חדשה וגם הזקן נגזם יפה מאוד, עם פייד מושלם.'],
    ['Ich freue mich auf das nächste Mal!', 'Looking forward to next time!', 'Жду следующего раза!', 'מחכה לפעם הבאה!'],
    ['Ich bin überwältigt von den Engagement und Einsatz der Fachkräfte', 'I am overwhelmed by the dedication and commitment of the professionals', 'Я в восторге от увлечённости и отдачи мастеров', 'אני המום מהמסירות וההשקעה של אנשי המקצוע'],
    ['Da merkt man gleich dass man mit einem Profi zu tun hat ich wollte gar nicht raus man wird verwöhnt und als wahren Kunden wahrgenommen top weiter so komme bestimmt wieder solange ich Haare im Kopf hab.', 'You notice right away that you are dealing with a pro. I didn’t want to leave – you get pampered and treated like a real customer. Top, keep it up, I’ll definitely be back as long as I have hair on my head', 'Сразу видно, что имеешь дело с профи. Не хотелось уходить – тебя балуют и относятся как к настоящему клиенту. Супер, так держать, обязательно приду снова, пока у меня есть волосы на голове', 'רואים מיד שמדובר במקצוען. לא רציתי לצאת – מפנקים אותך ומתייחסים אליך כמו ללקוח אמיתי. מעולה, תמשיכו ככה, אחזור בטוח כל עוד יש לי שיער על הראש'],
    ['Bereit für Ihren neuen Look?', 'Ready for your new look?', 'Готовы к новому образу?', 'מוכנים ללוק חדש?'],
        ['Verfügbaren Termin wählen und online buchen – schnell und unkompliziert.', 'Pick an available time and book online – quick and easy.', 'Выберите свободное время и запишитесь онлайн – быстро и просто.', 'בוחרים מועד פנוי וקובעים תור אונליין – מהר ופשוט.'],
    ['Besuchen Sie ', 'Visit ', 'Приходите ', 'בואו '],
    ['uns', 'us', 'к нам', 'אלינו'],
    ['Adresse', 'Address', 'Адрес', 'כתובת'],
    ['1020 Wien', '1020 Vienna', '1020 Вена', '1020 וינה'],
    ['Auf Google Maps öffnen', 'Open in Google Maps', 'Открыть в Google Maps', 'פתיחה ב-Google Maps'],
    ['Auf Apple Maps öffnen', 'Open in Apple Maps', 'Открыть в Apple Maps', 'פתיחה ב-Apple Maps'],
    ['Telefon & E-Mail', 'Phone & email', 'Телефон и e-mail', 'טלפון ודוא״ל'],
    ['Öffnungszeiten', 'Opening hours', 'Часы работы', 'שעות פתיחה'],
    ['Mo – Fr', 'Mon – Fri', 'Пн – Пт', 'ב׳–ו׳'],
    ['9:00 – 18:30 Uhr', '9:00 – 18:30', '9:00 – 18:30', '9:00 – 18:30'],
    ['Rechtliches', 'Legal', 'Правовая информация', 'מידע משפטי'],
    ['Impressum', 'Legal notice', 'Импрессум', 'פרטי העסק'],
    ['Datenschutzerklärung', 'Privacy policy', 'Политика конфиденциальности', 'מדיניות פרטיות'],
    ['Schnellbuchung', 'Quick booking', 'Быстрая запись', 'הזמנה מהירה'],
    // KELDER-Redesign (Nov 2026): neue Kurztexte
    ['Preise nach Kategorie', 'Prices by category', 'Цены по категориям', 'מחירים לפי קטגוריה'],
    ['ab', 'from', 'от', 'החל מ־'],
    ['Dauer', 'Duration', 'Длительность', 'משך'],
    ['Mo', 'Mon', 'Пн', 'ב׳'], ['Di', 'Tue', 'Вт', 'ג׳'], ['Mi', 'Wed', 'Ср', 'ד׳'], ['Do', 'Thu', 'Чт', 'ה׳'], ['Fr', 'Fri', 'Пт', 'ו׳'], ['Sa', 'Sat', 'Сб', 'ש׳'], ['So', 'Sun', 'Вс', 'א׳'],
    ['Online buchen', 'Book online', 'Онлайн-запись', 'קובעים תור אונליין'],
    ['Service wählen und verfügbaren Termin über Treatwell buchen – in wenigen Klicks.', 'Pick a service and book an available time on Treatwell – in a few clicks.', 'Выберите услугу и свободное время на Treatwell – всего за несколько кликов.', 'בוחרים שירות ומועד פנוי ב-Treatwell – בכמה קליקים.'],
    ['Ankommen', 'Arrival', 'Встреча', 'מגיעים'],
    ['Wir heißen Sie herzlich willkommen – mit heißem Kaffee oder einem kühlen Getränk Ihrer Wahl.', 'We welcome you warmly – with a hot coffee or a cool drink of your choice.', 'Мы тепло встречаем вас – горячим кофе или прохладным напитком на ваш выбор.', 'מקבלים אותך בחום – עם קפה חם או משקה קר לבחירתך.'],
    ['Ihr Schnitt', 'Your cut', 'Ваша стрижка', 'התספורת שלך'],
    ['Haarschnitt, Bart und Rasur – traditionelles Handwerk mit hochwertigen Produkten.', 'Haircut, beard and shave – traditional craft with high-quality products.', 'Стрижка, борода и бритьё – традиционное мастерство и качественные продукты.', 'תספורת, זקן וגילוח – מלאכת יד מסורתית עם מוצרים איכותיים.'],
    ['Neuer Look', 'New look', 'Новый образ', 'לוק חדש'],
    ['Entspannt nach Hause – und gern bis zum nächsten Mal.', 'Head home relaxed – see you next time.', 'Домой уже отдохнувшим – до новой встречи.', 'יוצאים רגועים – ונתראה בפעם הבאה.'],
    ['Bis bald', 'See you soon', 'До встречи', 'להתראות'],
    // KELDER-Struktur v4.1 (Nov 2026): ganze Überschriften, Konzept-Hinweis, Footer
    ['Konzept-Redesign von PIXELPOP – keine offizielle Seite von The Barber Crew', 'Concept redesign by PIXELPOP – not the official The Barber Crew website', 'Концепт-редизайн от PIXELPOP – это не официальный сайт The Barber Crew', 'רידיזיין קונספט של PIXELPOP – לא האתר הרשמי של The Barber Crew'],
    ['Konzept-Redesign von PIXELPOP – keine offizielle Seite von The Barber Crew. Preise laut Treatwell (Stand: 31.10.2026).', 'Concept redesign by PIXELPOP – not the official The Barber Crew website. Prices as listed on Treatwell (as of 31.10.2026).', 'Концепт-редизайн от PIXELPOP – это не официальный сайт The Barber Crew. Цены по данным Treatwell (на 31.10.2026).', 'רידיזיין קונספט של PIXELPOP – לא האתר הרשמי של The Barber Crew. המחירים לפי Treatwell (נכון ל-31.10.2026).'],
    ['Unsere Mission', 'Our mission', 'Наша миссия', 'המשימה שלנו'],
    ['Preise & Services', 'Prices & services', 'Цены и услуги', 'מחירים ושירותים'],
    ['Wohlfühlfaktor', 'Feel-good factor', 'Фактор комфорта', 'תחושת רווחה'],
    ['Handwerk, das man sieht', 'Craft you can see', 'Мастерство, которое видно', 'עבודה שרואים'],
    ['Ein Auszug aus über 120 positiven Bewertungen', 'A selection from over 120 positive reviews', 'Выдержки из более чем 120 положительных отзывов', 'מבחר מתוך 120 ויותר ביקורות חיוביות'],
    ['Von – bis je Kategorie, vom günstigsten bis zum teuersten Service.', 'Price range per category, from the lowest to the highest-priced service.', 'Диапазон цен по категориям – от самой доступной до самой дорогой услуги.', 'טווח מחירים לכל קטגוריה, מהשירות הזול ביותר ועד היקר ביותר.'],
    ['Preise in Euro inkl. MwSt.', 'Prices in euros incl. VAT', 'Цены в евро с НДС', 'המחירים באירו כולל מע״מ'],
    ['Haare, Bart, Kombis, Dauerwelle, Young Barber, Kinder, Extras & Waxing', 'Hair, beard, combos, perm, Young Barber, kids, extras & waxing', 'Волосы, борода, комплексы, завивка, Young Barber, дети, дополнительно и воск', 'שיער, זקן, חבילות, סלסול, Young Barber, ילדים, תוספות ושעווה'],
    ['Taborstraße 20/G3, 1020 Wien', 'Taborstraße 20/G3, 1020 Vienna', 'Taborstraße 20/G3, 1020 Вена', 'Taborstraße 20/G3, 1020 וינה'],
    ['© 2026 The Barber Crew · Taborstraße 20/G3, 1020 Wien', '© 2026 The Barber Crew · Taborstraße 20/G3, 1020 Vienna', '© 2026 The Barber Crew · Taborstraße 20/G3, 1020 Вена', '© 2026 The Barber Crew · Taborstraße 20/G3, 1020 וינה'],
    ['Schnitt, Rasur & Kopfmassage', 'Cuts, shaves & head massage', 'Стрижка, бритьё и массаж головы', 'תספורת, גילוח ועיסוי ראש'],
    ['Hot Towel, Styling & Trimmen', 'Hot towel, styling & trims', 'Горячее полотенце, оформление и подравнивание', 'מגבת חמה, עיצוב וגיזום'],
    ['Haarschnitt & Bart in einem Termin', 'Haircut & beard in one appointment', 'Стрижка и борода за один визит', 'תספורת וזקן בתור אחד'],
    ['Galerie ansehen', 'View gallery', 'Смотреть галерею', 'לגלריה'],
    ['Online über Treatwell oder telefonisch.', 'Online via Treatwell or by phone.', 'Онлайн через Treatwell или по телефону.', 'אונליין דרך Treatwell או בטלפון.'],
    ['Navigation', 'Navigation', 'Навигация', 'ניווט'],
    ['Seitennavigation', 'Page navigation', 'Навигация по странице', 'ניווט בעמוד'],
    ['Nach oben', 'Back to top', 'Наверх', 'חזרה למעלה'],
    ['Menü schließen', 'Close menu', 'Закрыть меню', 'סגירת תפריט'],
    ['Taborstraße 20 → 1020 Wien', 'Taborstraße 20 → 1020 Vienna', 'Taborstraße 20 → 1020 Вена', 'Taborstraße 20 → 1020 וינה'],
    ['120+ Bewertungen', '120+ reviews', '120+ отзывов', '120+ ביקורות'],
    ['Mo–Fr,', 'Mon–Fri,', 'Пн–Пт,', 'ב׳–ו׳,'],
    ['Mo–Fr', 'Mon–Fri', 'Пн–Пт', 'ב׳–ו׳'],
    ['9:00–18:30 Uhr', '9:00–18:30', '9:00–18:30', '9:00–18:30'],
    ['9:00–18:30', '9:00–18:30', '9:00–18:30', '9:00–18:30'],
    ['Taborstraße 20', 'Taborstraße 20', 'Taborstraße 20', 'Taborstraße 20'],
    ['ab 15 €', 'from €15', 'от 15 €', 'מ-15 €'],
    ['ab 18 €', 'from €18', 'от 18 €', 'מ-18 €'],
    ['Rasur mit Hot Towel', 'Shave with hot towel', 'Бритьё с горячим полотенцем', 'גילוח עם מגבת חמה'],
    ['in 7 Kategorien: Haare, Bart, Kombis, Dauerwelle, Young Barber, Kinder, Extras & Waxing', 'in 7 categories: Hair, beard, combos, perm, Young Barber, kids, extras & waxing', 'в 7 категориях: волосы, борода, комплексы, завивка, Young Barber, дети, дополнительно и воск', 'ב-7 קטגוריות: שיער, זקן, חבילות, סלסול, Young Barber, ילדים, תוספות ושעווה'],
    ['Google-Bewertung', 'Google review', 'Отзыв Google', 'ביקורת Google'],
    ['5 von 5 Sternen', '5 out of 5 stars', '5 из 5 звёзд', '5 מתוך 5 כוכבים'],
    // Sprachumschalter selbst
    ['Sprache wählen', 'Choose language', 'Выбрать язык', 'בחירת שפה'],
    ['Standardsprache', 'Default', 'По умолчанию', 'ברירת מחדל'],
    ['Zurück zu Deutsch', 'Back to German', 'Вернуться на немецкий', 'חזרה לגרמנית'],
    ['Deutsch – Standardsprache', 'German – default language', 'Немецкий – язык по умолчанию', 'גרמנית – שפת ברירת המחדל']
  ];
  var IDX = { en: 1, ru: 2, he: 3 };
  var norm = function (s) { return s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim(); };
  var MAP = {};
  T.forEach(function (r) { MAP[norm(r[0])] = r; });
  var TITLE = { de: document.title, en: 'The Barber Crew – Barbershop Vienna, Taborstraße 20', ru: 'The Barber Crew – барбершоп в Вене, Taborstraße 20', he: 'The Barber Crew – מספרה בווינה, Taborstraße 20' };
  var DESC = {
    de: document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').getAttribute('content') : '',
    en: 'Concept redesign by PIXELPOP for The Barber Crew – barbershop in Vienna, Taborstraße 20, 1020 Vienna. Haircuts, beards, shaves. Book online.',
    ru: 'Концепт-редизайн от PIXELPOP для The Barber Crew – барбершоп в Вене, Taborstraße 20, 1020 Вена. Стрижка, борода, бритьё. Онлайн-запись.',
    he: 'רידיזיין קונספט של PIXELPOP ל-The Barber Crew – מספרה בווינה, Taborstraße 20, 1020 וינה. תספורת, זקן וגילוח. קביעת תור אונליין.'
  };
  var OGL = { de: 'de_AT', en: 'en_GB', ru: 'ru_RU', he: 'he_IL' };
  var OG_TITLE = {
    de: (document.querySelector('meta[property="og:title"]') || {}).content || document.title,
    en: 'The Barber Crew – Barbershop Vienna, Taborstraße 20 (concept redesign)',
    ru: 'The Barber Crew – барбершоп в Вене, Taborstraße 20 (концепт-редизайн)',
    he: 'The Barber Crew – מספרה בווינה, Taborstraße 20 (רידיזיין קונספט)'
  };
  var OG_DESC = {
    de: (document.querySelector('meta[property="og:description"]') || {}).content || '',
    en: 'Concept redesign by PIXELPOP: barbershop in Vienna, Taborstraße 20, 1020 Vienna. Haircuts, beards, shaves.',
    ru: 'Концепт-редизайн от PIXELPOP: барбершоп в Вене, Taborstraße 20, 1020 Вена. Стрижка, борода, бритьё.',
    he: 'רידיזיין קונספט של PIXELPOP: מספרה בווינה, Taborstraße 20, 1020 וינה. תספורת, זקן וגילוח.'
  };
  var OG_ALT = {
    de: (document.querySelector('meta[property="og:image:alt"]') || {}).content || '',
    en: 'The Barber Crew logo on a dark blue background with a “Book now” button',
    ru: 'Логотип The Barber Crew на тёмно-синем фоне с кнопкой «Записаться»',
    he: 'לוגו The Barber Crew על רקע כחול כהה עם כפתור „קביעת תור“'
  };
  var TW_TITLE = {
    de: (document.querySelector('meta[name="twitter:title"]') || {}).content || document.title,
    en: 'The Barber Crew – Barbershop Vienna (concept redesign)',
    ru: 'The Barber Crew – барбершоп в Вене (концепт-редизайн)',
    he: 'The Barber Crew – מספרה בווינה (רידיזיין קונספט)'
  };
  var TW_DESC = {
    de: (document.querySelector('meta[name="twitter:description"]') || {}).content || '',
    en: 'Concept redesign by PIXELPOP: barbershop in Vienna, Taborstraße 20, 1020 Vienna.',
    ru: 'Концепт-редизайн от PIXELPOP: барбершоп в Вене, Taborstraße 20, 1020 Вена.',
    he: 'רידיזיין קונספט של PIXELPOP: מספרה בווינה, Taborstraße 20, 1020 וינה.'
  };
  var TW_ALT = {
    de: (document.querySelector('meta[name="twitter:image:alt"]') || {}).content || '',
    en: 'The Barber Crew logo on a dark blue background',
    ru: 'Логотип The Barber Crew на тёмно-синем фоне',
    he: 'לוגו The Barber Crew על רקע כחול כהה'
  };
  function setMeta(sel, val) {
    var el = document.querySelector(sel);
    if (el && val) el.setAttribute('content', val);
  }
  function syncUrl(lang) {
    try {
      var u = new URL(location.href);
      if (lang === 'de') u.searchParams.delete('lang');
      else u.searchParams.set('lang', lang);
      var next = u.pathname + u.search + u.hash;
      if (next !== location.pathname + location.search + location.hash) history.replaceState(null, '', next);
    } catch (e) {}
  }
  var DUR = {
    en: [/(\d+) Std\./g, '$1 h', /(\d+) Min\./g, '$1 min'],
    ru: [/(\d+) Std\./g, '$1 ч', /(\d+) Min\./g, '$1 мин'],
    he: [/(\d+) Std\./g, '$1 ש׳', /(\d+) Min\./g, '$1 דק׳']
  };
  function tr(de, lang) {
    if (lang === 'de') return de;
    var r = MAP[norm(de)];
    if (r) return r[IDX[lang]];
    if (/\d+ (Std|Min)\./.test(de)) { var d = DUR[lang]; return de.replace(d[0], d[1]).replace(d[2], d[3]); }
    return null;
  }
  var SKIP = 'script,style,.bc-langs,.bc-lang,.bc-item__price,.bc-stat__num,.bc-tel__num,.k-num,.k-lines';
  var origText = [], origAttr = [];
  function collect() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement; if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = w.nextNode())) {
      if (tr(n.nodeValue, 'en') !== null) origText.push({ n: n, de: n.nodeValue });
    }
    document.querySelectorAll('[alt],[aria-label]').forEach(function (el) {
      if (el.closest('.bc-lang')) return;
      ['alt', 'aria-label'].forEach(function (a) {
        var v = el.getAttribute(a); if (v && tr(v, 'en') !== null) origAttr.push({ el: el, a: a, de: v });
      });
    });
  }
  // Leerraum des Originals behalten; Übersetzung mit eigenem End-Leerzeichen behält es; \u2060 am Ende = direkt anschließen (z. B. hebr. Präfix ו)
  function keepWs(de, t) {
    var lead = de.match(/^\s*/)[0], trail = de.match(/\s*$/)[0];
    t = t.replace(/^\s+/, '');
    if (/\u2060$/.test(t)) return lead + t.slice(0, -1);
    if (/\s$/.test(t)) return lead + t;
    return lead + t + trail;
  }
  var current = 'de';
  function apply(lang) {
    current = lang;
    origText.forEach(function (o) { var t = tr(o.de, lang); o.n.nodeValue = lang === 'de' ? o.de : keepWs(o.de, t); });
    origAttr.forEach(function (o) { o.el.setAttribute(o.a, lang === 'de' ? o.de : tr(o.de, lang)); });
    var html = document.documentElement;
    html.lang = lang === 'de' ? 'de-AT' : lang;
    html.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[lang];
    setMeta('meta[name="description"]', DESC[lang]);
    setMeta('meta[property="og:locale"]', OGL[lang]);
    setMeta('meta[property="og:title"]', OG_TITLE[lang]);
    setMeta('meta[property="og:description"]', OG_DESC[lang]);
    setMeta('meta[property="og:image:alt"]', OG_ALT[lang]);
    setMeta('meta[name="twitter:title"]', TW_TITLE[lang]);
    setMeta('meta[name="twitter:description"]', TW_DESC[lang]);
    setMeta('meta[name="twitter:image:alt"]', TW_ALT[lang]);
    try { if (lang === 'de') localStorage.removeItem('bc-lang'); else localStorage.setItem('bc-lang', lang); } catch (e) {}
    syncUrl(lang);
    switchers.forEach(function (s) { s.update(); });
    try { document.dispatchEvent(new CustomEvent('bc:lang', { detail: lang })); } catch (e) {}
  }
  // German source text of an element (for widgets built after this script ran)
  window.bcDe = function (el) {
    var out = '', hit = false;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var n; while ((n = w.nextNode())) {
      var o = null; for (var i = 0; i < origText.length; i++) if (origText[i].n === n) { o = origText[i]; break; }
      if (o) hit = true;
      out += o ? o.de : n.nodeValue;
    }
    return hit ? out : el.textContent;
  };
  window.bcTr = function (de) { return current === 'de' ? de : (tr(de, current) || de); };
  function ui(key) { return current === 'de' ? key : MAP[norm(key)][IDX[current]]; }

  // ---------- geteilte Flagge Deutschland / Österreich (Diagonale) ----------
  var FLAG_N = 0;
  function flag(code) {
    var id = 'bcflag' + (++FLAG_N), o = '<svg class="bc-flag" width="30" height="20" aria-hidden="true" focusable="false" ';
    if (code === 'ru') return o + 'viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#FFFFFF"/><rect y="6.67" width="30" height="6.67" fill="#0039A6"/><rect y="13.33" width="30" height="6.67" fill="#D52B1E"/></svg>';
    if (code === 'he') return o + 'viewBox="0 0 30 20"><rect width="30" height="20" fill="#FFFFFF"/><rect y="1.9" width="30" height="3.1" fill="#0038B8"/><rect y="15" width="30" height="3.1" fill="#0038B8"/>' +
      '<g fill="none" stroke="#0038B8" stroke-width=".75"><path d="M15 5.9L18.55 12.05H11.45Z"/><path d="M15 14.1L11.45 7.95H18.55Z"/></g></svg>';
    if (code === 'en') return o + 'viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice">' +
      '<defs><clipPath id="' + id + 't"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath></defs>' +
      '<rect width="60" height="30" fill="#012169"/><path d="M0 0L60 30M60 0L0 30" stroke="#FFFFFF" stroke-width="6"/>' +
      '<path d="M0 0L60 30M60 0L0 30" clip-path="url(#' + id + 't)" stroke="#C8102E" stroke-width="4"/>' +
      '<path d="M30 0v30M0 15h60" stroke="#FFFFFF" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg>';
    // Deutsch: geteilte Flagge Deutschland / Österreich (Diagonale)
    return o + 'viewBox="0 0 30 20">' +
      '<defs><clipPath id="' + id + 'a"><path d="M0 0H30L0 20Z"/></clipPath><clipPath id="' + id + 'b"><path d="M30 0V20H0Z"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + 'a)"><rect width="30" height="6.67" fill="#000"/><rect y="6.67" width="30" height="6.67" fill="#DD0000"/><rect y="13.33" width="30" height="6.67" fill="#FFCE00"/></g>' +
      '<g clip-path="url(#' + id + 'b)"><rect width="30" height="20" fill="#C8102E"/><rect y="6.67" width="30" height="6.67" fill="#fff"/></g>' +
      '<path d="M30 0L0 20" stroke="rgba(255,255,255,.55)" stroke-width=".6"/></svg>';
  }

  // ---------- Umschalter ----------
  var switchers = [], uid = 0;
  function Switcher(anchor, where) {
    var self = this, pid = 'bc-lang-panel-' + (++uid);
    var wrap = document.querySelector('[data-lang-mount="' + where + '"]') || document.createElement('div');
    wrap.className = 'bc-lang bc-lang--' + where;
    wrap.removeAttribute('data-lang-mount');
    wrap.innerHTML =
      '<button type="button" class="bc-lang__flag" aria-expanded="false" aria-controls="' + pid + '" aria-haspopup="listbox"><span class="bc-lang__cur"></span><span class="bc-lang__label" aria-hidden="true"></span><span class="bc-lang__chev" aria-hidden="true"></span></button>' +
      '<div class="bc-lang__panel" id="' + pid + '" hidden>' +
        '<ul class="bc-lang__list" data-stagger>' +
          '<li><button type="button" class="bc-lang__opt bc-lang__opt--default" data-lang="de">' + flag('de') + '<span class="bc-lang__name" lang="de">Deutsch</span><span class="bc-lang__tag"></span></button></li>' +
          LANGS.map(function (l) { return '<li><button type="button" class="bc-lang__opt" data-lang="' + l + '">' + flag(l) + '<span class="bc-lang__name" lang="' + l + '" dir="' + (l === 'he' ? 'rtl' : 'ltr') + '">' + NAMES[l] + '</span><span class="bc-lang__check" aria-hidden="true"></span></button></li>'; }).join('') +
        '</ul></div>';
    if (!wrap.parentNode) anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
    var fbtn = wrap.querySelector('.bc-lang__flag'), trig = fbtn, panel = wrap.querySelector('.bc-lang__panel'), list = panel.querySelector('ul');
    var opts = panel.querySelectorAll('.bc-lang__opt');
    // motion-anything stagger-list: Verzögerungen wie im Recipe (Schritt 40ms)
    Array.prototype.forEach.call(list.children, function (c, i) { c.style.setProperty('--st-delay', (i * 40) + 'ms'); });
    function place() {
      var r = trig.getBoundingClientRect(), pw = panel.offsetWidth, ph = panel.offsetHeight, m = 8, vw = document.documentElement.clientWidth, vh = window.innerHeight;
      var top = (r.top - ph - m >= m) ? r.top - ph - m : Math.min(r.bottom + m, vh - ph - m); // bevorzugt nach oben, bleibt im Bild
      var left = document.documentElement.dir === 'rtl' ? r.left : r.right - pw;
      left = Math.max(m, Math.min(left, vw - pw - m));
      panel.style.top = Math.max(m, top) + 'px'; panel.style.left = left + 'px';
      panel.classList.toggle('is-up', r.top - ph - m >= m);
    }
    function open() {
      switchers.forEach(function (s) { if (s !== self) s.close(); });
      panel.hidden = false; place(); trig.setAttribute('aria-expanded', 'true'); fbtn.setAttribute('aria-expanded', 'true'); wrap.classList.add('is-open');
      list.classList.remove('is-in'); void list.offsetWidth;
      requestAnimationFrame(function () { list.classList.add('is-in'); });
      var cur = panel.querySelector('[aria-current="true"]') || opts[0]; cur.focus();
    }
    this.close = function (focusBack) {
      if (panel.hidden) return;
      panel.hidden = true; trig.setAttribute('aria-expanded', 'false'); fbtn.setAttribute('aria-expanded', 'false'); wrap.classList.remove('is-open'); list.classList.remove('is-in');
      if (focusBack) trig.focus();
    };
    trig.addEventListener('click', function () { panel.hidden ? open() : self.close(); });
    fbtn.addEventListener('click', function () { panel.hidden ? open() : self.close(); }); // Anzeige der aktuellen Sprache öffnet ebenfalls das Panel
    opts.forEach(function (o) { o.addEventListener('click', function () { var l = o.getAttribute('data-lang'); self.close(true); if (l !== current) apply(l); }); });
    panel.addEventListener('keydown', function (e) {
      var a = Array.prototype.indexOf.call(opts, document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); self.close(true); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); opts[(a + 1) % opts.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); opts[(a - 1 + opts.length) % opts.length].focus(); }
      else if (e.key === 'Tab' && !e.shiftKey && a === opts.length - 1) { self.close(); }
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) self.close(); });
    window.addEventListener('resize', function () { if (!panel.hidden) place(); });
    window.addEventListener('scroll', function () { if (!panel.hidden) place(); }, { passive: true });
    var shown = null;
    this.update = function () {
      var isDe = current === 'de';
      wrap.classList.toggle('is-de', isDe);
      if (shown !== current) { fbtn.querySelector('.bc-lang__cur').innerHTML = flag(current); shown = current; }
      fbtn.querySelector('.bc-lang__label').textContent = current.toUpperCase();
      fbtn.setAttribute('aria-label', ui('Sprache wählen') + ': ' + NAMES[current]);
      fbtn.setAttribute('data-current', current);
      trig.setAttribute('aria-label', ui('Sprache wählen') + (isDe ? '' : ' (' + NAMES[current] + ')'));
      panel.querySelector('.bc-lang__tag').textContent = ui('Standardsprache');
      opts.forEach(function (o) { var on = o.getAttribute('data-lang') === current; o.setAttribute('aria-current', on ? 'true' : 'false'); });
    };
    this.update();
  }

  /* Measure the curtain before first paint so kelder.js is not the first to set --foot-h. */
  function reserveFooter() {
    var footer = document.getElementById('kontakt') || document.querySelector('.k-footer');
    if (!footer) return;
    var fin = footer.querySelector('.k-footer__in');
    var desk = window.innerWidth >= 961;
    var footH = Math.round(fin ? fin.offsetHeight : footer.offsetHeight);
    var fixedFoot = desk && footH > 0 && footH < window.innerHeight - 40;
    footer.classList.toggle('is-fixed', fixedFoot);
    footer.classList.toggle('is-unfixed', desk && !fixedFoot);
    if (fixedFoot) document.documentElement.style.setProperty('--foot-h', footH + 'px');
    else document.documentElement.style.removeProperty('--foot-h');
  }
  function init() {
    collect();
    var h = document.querySelector('.bc-header__tel'); if (h) switchers.push(new Switcher(h, 'header'));
    var f = document.querySelector('.bc-footer__tel'); if (f) switchers.push(new Switcher(f, 'footer'));
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') switchers.forEach(function (s) { s.close(); }); });
    var want = null;
    try { want = new URLSearchParams(location.search).get('lang') || localStorage.getItem('bc-lang'); } catch (e) {}
    if (want && LANGS.indexOf(want) > -1) apply(want);
    else { document.documentElement.dir = 'ltr'; switchers.forEach(function (s) { s.update(); }); }
    reserveFooter();
  }
  /* Run immediately when this script is at the end of body (blocking, no defer) so
     translations and the language control land before first paint. */
  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
