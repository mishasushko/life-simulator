# Мировая таблица рекордов

Игра отправляет итоги жизней в Supabase напрямую через REST, без SDK и без своего сервера.

1. supabase.com → войти через GitHub → New project (регион любой, например Central EU).
2. SQL Editor → New query → вставить `supabase.sql` → Run.
3. Project Settings → API (или API Keys): скопировать Project URL и anon/publishable key.
4. Вписать их в `online-config.js` и поднять `?v=` у online-config.js в index.html и sw.js.

Ключ anon/publishable публичный: таблица разрешает только чтение и добавление, менять и удалять записи можно только из панели Supabase (Table Editor → lives).
