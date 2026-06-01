# Todo API


```
NODE_ENV=development
PORT=3000

DB_URL=postgres://todo:todo@localhost:5433/todo

JWT_SECRET=dev-super-secret-change-in-production
JWT_EXPIRES_IN=1d
```

## Запуск

```bash
docker compose up --build
```

## Тесты

```bash
npm test
```

## Swagger

Документация по адресу `http://localhost:3000/docs`

## Формат ответов

Успех:

```json
{ "success": true, "data": { }, "path": "/tasks", "timestamp": "..." }
```

Ошибка:

```json
{ "success": false, "statusCode": 404, "error": "Not Found", "message": "task_not_found", "timestamp": "...", "path": "/tasks/..." }
```

## Rate limiting

- Глобальный лимит: 100 запросов в минуту
- Логин и регистрация: 5 запросов в минуту

При превышении  `429`.

## Примеры curl

Регистрация:

```bash
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'
```

Логин (возвращает accessToken внутри `data`):

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'
```

Чтобы сразу сохранить токен в переменную окружения шелла:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}' | jq -r '.data.accessToken')
```

Текущий пользователь по токену:

```bash
curl http://localhost:3000/auth/me -H "Authorization: Bearer $TOKEN"
```

Создать задачу (status необязателен, по умолчанию todo, допустимые значения: todo, in_progress, done):

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Buy milk","description":"2 liters","status":"todo"}'
```

Список своих активных задач с пагинацией и фильтром по статусу:

```bash
curl "http://localhost:3000/tasks?page=1&limit=20&status=todo" \
  -H "Authorization: Bearer $TOKEN"
```

Получить одну задачу:

```bash
curl http://localhost:3000/tasks/<TASK_ID> -H "Authorization: Bearer $TOKEN"
```

Обновить задачу (например сменить статус, после смены статуса владелец получает WebSocket событие):

```bash
curl -X PATCH http://localhost:3000/tasks/<TASK_ID> \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"done"}'
```

Архивировать задачу (мягкое удаление, хранится 7 дней, потом чистится по cron):

```bash
curl -X DELETE http://localhost:3000/tasks/<TASK_ID> -H "Authorization: Bearer $TOKEN"
```

Список архивных задач:

```bash
curl http://localhost:3000/tasks/archived -H "Authorization: Bearer $TOKEN"
```

## WebSocket

При смене статуса задачи владелец получает событие в реальном времени. Транспорт только websocket (HTTP long-polling выключен), сервер слушает на том же порту, что и REST.

Подключение через socket.io клиент:

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  auth: { token: '<JWT>' },
});

socket.on('task.status', (payload) => {
  console.log(payload);
});
```

Токен можно передать либо в `auth.token`, либо в заголовке `Authorization: Bearer <JWT>`. Подключение без валидного токена сервер сразу разрывает.

Событие `task.status` приходит только владельцу задачи и содержит:

```json
{ "id": "...", "status": "done", "updatedAt": "..." }
```
