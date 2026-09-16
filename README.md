# Книгообіг

Мобільна книжкова барахолка на **React Native CLI + TypeScript** з React Navigation. Поточний етап — інтерактивна high-fidelity верстка на локальних мок-даних, без бекенду.

## Структура

- `src/screens/` — окремі екрани застосунку;
- `src/navigation/` — типізовані root stack і bottom tabs;
- `src/components/` — спільні UI-компоненти;
- `src/store/` — стан прототипу та дії;
- `src/data.ts` — мок-дані;
- `src/theme.ts` — дизайн-токени.

## Запуск

Потрібні Node.js 22.11+, Xcode/CocoaPods для iOS або Android Studio/JDK для Android.

```bash
npm install
```

Для iOS:

```bash
npm run ios
```

Для Android:

```bash
npm run android
```

Metro окремо, якщо потрібно:

```bash
npm start
```

Pods уже встановлені, а Xcode workspace створений у `ios/Libris.xcworkspace`. Відкривати iOS-проєкт у Xcode потрібно саме через workspace, не через `.xcodeproj`.

Дизайн-специфікація та оригінальний прототип збережені у `docs/design_handoff_knyhoobih/`.

## Supabase

Скопіюйте `.env.example` у `.env` і додайте Project URL та Publishable key:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Supabase client знаходиться у `src/services/supabase/client.ts`. Сесія
користувача зберігається локально через MMKV. Після зміни `.env` потрібно
повністю перезапустити нативну збірку; одного reload у Metro недостатньо.
