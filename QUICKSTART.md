# Quick Start Guide

## Установка и запуск

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Приложение откроется автоматически на `http://localhost:3000`

## Подключение к Backend API

По умолчанию фронтенд подключается к `http://localhost:8000`.

Если ваш API работает на другом адресе, создайте файл `.env`:

```bash
VITE_API_BASE=http://your-api-url.com
```

## Что было создано

✅ **React + Vite** - современный стек для разработки
✅ **Mortgage Calculator** - полный калькулятор ипотеки с графиками
✅ **TVM Calculators** - Future Value, Present Value, Annuity Payment
✅ **Интерактивные графики** - Pie charts и Line charts с Recharts
✅ **Красивый UI** - дизайн в стиле mortgagecalculator.org
✅ **Responsive дизайн** - работает на всех устройствах

## Структура проекта

```
src/
├── components/
│   ├── Header.jsx              # Шапка сайта
│   ├── Navigation.jsx               # Навигация между калькуляторами
│   ├── MortgageCalculator.jsx      # Калькулятор ипотеки
│   ├── TVMCalculator.jsx          # TVM калькуляторы
│   ├── PaymentBreakdownChart.jsx  # График разбивки платежей
│   └── AmortizationChart.jsx      # График амортизации
├── services/
│   └── api.js                    # API сервис для работы с backend
├── App.jsx                       # Главный компонент
└── main.jsx                    # Точка входа
```

## Особенности

### Mortgage Calculator
- Расчет ежемесячного платежа
- Учет налогов, страховки, PMI, HOA
- График разбивки платежей (pie chart)
- График амортизации (line chart)
- Расчет экономии при дополнительных платежах
- Детальный график погашения кредита

### TVM Calculators
- **Future Value** - расчет сложных процентов
- **Present Value** - текущая стоимость будущей суммы
- **Annuity Payment** - платеж по аннуитету

## Следующие шаги

1. Убедитесь, что backend API запущен на `http://localhost:8000`
2. Запустите `npm run dev`
3. Откройте браузер и наслаждайтесь! 🎉
