# Social Media Platform

Полнофункциональная социальная медиа платформа с системой постов, комментариев, лайков, подписок и real-time чатом.

## 🚀 Ключевые возможности

- **Система постов** с медиа-контентом (изображения, видео)
- **Real-time чат** и уведомления через Socket.IO
- **Система подписок** и рекомендаций
- **Модерация контента** с AI интеграцией
- **Мобильное приложение** React Native
- **CDN** для быстрой загрузки медиа через AWS S3
- **Масштабируемая архитектура** с Redis кэшированием

## 📊 Статистика проекта

- **42+** Компонентов
- **20+** Страниц
- **75+** Функций
- **18000+** Строк кода

## 🛠 Технологический стек

### Backend
- **Node.js** + Express.js
- **PostgreSQL** с Prisma ORM
- **Redis** для кэширования
- **Socket.IO** для real-time функций
- **AWS S3** для хранения медиа
- **JWT** аутентификация

### Frontend
- **Next.js 14** + React 18
- **Tailwind CSS** для стилизации
- **Zustand** для управления состоянием
- **Socket.IO Client** для real-time
- **React Hook Form** для форм

### Mobile
- **React Native** 0.72
- **React Navigation** 6
- **React Native Vector Icons**
- **Fast Image** для оптимизации

## 🏗 Структура проекта

```
social-media-platform/
├── backend/                 # Node.js API сервер
│   ├── prisma/             # База данных схема
│   ├── routes/             # API маршруты
│   ├── middleware/         # Middleware функции
│   ├── utils/              # Утилиты (S3, Redis)
│   └── server.js           # Главный сервер файл
├── frontend/               # Next.js веб приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Next.js страницы
│   │   ├── store/          # Zustand stores
│   │   └── utils/          # API клиент
│   └── package.json
└── mobile/                 # React Native приложение
    ├── src/
    │   ├── components/     # RN компоненты
    │   ├── screens/        # Экраны приложения
    │   ├── navigation/     # Навигация
    │   └── services/       # API сервисы
    └── package.json
```

## 🚀 Быстрый старт

### 1. Backend Setup

```bash
cd backend
npm install

# Настройка базы данных
cp .env.example .env
# Отредактируйте .env файл с вашими настройками

# Миграции базы данных
npm run db:migrate
npm run db:generate

# Запуск сервера
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Создайте .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Запуск приложения
npm run dev
```

### 3. Mobile Setup

```bash
cd mobile
npm install

# Для iOS
npx react-native run-ios

# Для Android
npx react-native run-android
```

## 🔧 Конфигурация

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/social_media"
JWT_SECRET="your-super-secret-jwt-key"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="your-s3-bucket-name"
REDIS_URL="redis://localhost:6379"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📱 Основные функции

### Посты и медиа
- Создание постов с текстом и медиа
- Поддержка множественных изображений
- Видео контент
- Оптимизация изображений через Sharp
- CDN доставка через AWS S3

### Социальные функции
- Система лайков и комментариев
- Подписки на пользователей
- Персонализированная лента
- Поиск пользователей
- Профили пользователей

### Real-time чат
- Прямые сообщения
- Групповые чаты
- Статус прочтения сообщений
- Push уведомления
- Онлайн статус

### Безопасность
- JWT аутентификация
- Rate limiting
- Валидация данных с Joi
- Helmet.js для безопасности
- CORS настройки

## 🔄 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/verify` - Проверка токена

### Посты
- `GET /api/posts/feed` - Лента постов
- `POST /api/posts` - Создание поста
- `POST /api/posts/:id/like` - Лайк/дизлайк
- `GET /api/posts/:id/comments` - Комментарии
- `POST /api/posts/:id/comments` - Добавить комментарий

### Пользователи
- `GET /api/users/:username` - Профиль пользователя
- `POST /api/users/:id/follow` - Подписка/отписка
- `GET /api/users/search/:query` - Поиск пользователей
- `PUT /api/users/profile` - Обновление профиля

### Чат
- `GET /api/chat` - Список чатов
- `POST /api/chat/direct` - Создать прямой чат
- `GET /api/chat/:id/messages` - Сообщения чата
- `PUT /api/chat/:id/read` - Отметить как прочитанное

## 🎨 UI/UX Features

- Адаптивный дизайн для всех устройств
- Темная/светлая тема
- Бесконечная прокрутка
- Pull-to-refresh
- Skeleton loading
- Toast уведомления
- Модальные окна
- Drag & drop загрузка файлов

## 📈 Производительность

- Lazy loading компонентов
- Оптимизация изображений
- Redis кэширование
- CDN для статических файлов
- Минификация и сжатие
- Service Workers (PWA готовность)

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
npm test

# Frontend тесты
cd frontend
npm test

# Mobile тесты
cd mobile
npm test
```

## 📦 Деплой

### Backend (Railway/Heroku)
```bash
# Установите переменные окружения
# Запустите миграции
npm run db:migrate

# Деплой
git push heroku main
```

### Frontend (Vercel)
```bash
# Подключите к Vercel
vercel --prod
```

### Mobile (App Store/Google Play)
```bash
# iOS
cd ios && xcodebuild -workspace SocialMediaApp.xcworkspace -scheme SocialMediaApp archive

# Android
cd android && ./gradlew assembleRelease
```

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - смотрите [LICENSE](LICENSE) файл для деталей.

## 👥 Команда

- **Backend Developer** - Node.js, PostgreSQL, Redis
- **Frontend Developer** - React, Next.js, Tailwind
- **Mobile Developer** - React Native
- **DevOps Engineer** - AWS, Docker, CI/CD

## 📞 Поддержка

Если у вас есть вопросы или предложения:

- Создайте Issue в GitHub
- Напишите на email: support@socialmedia.com
- Присоединяйтесь к нашему Discord серверу

---

⭐ Поставьте звезду, если проект был полезен!