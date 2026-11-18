export const languages = {
  ru: 'Русский',
  en: 'English'
};

export const defaultLang = 'ru';

export const ui = {
  ru: {
    'nav.docs': 'Документация',
    'nav.blog': 'Блог',
    'nav.hub': 'Каталог Lua',
    'nav.github': 'GitHub',
    'hero.badge': 'v1.0 Source-Available / PolyForm Shield',
    'hero.title.1': 'Данные — на вашем сервере.',
    'hero.title.2': 'Логика — под вашим контролем.',
    'hero.title.3': 'Интерфейс — под ваши задачи.',
    'hero.subtitle': 'Быстрый self-hosted биллинг и витрина цифровых продаж: VPN, SaaS, хостинг и ключи. Без комиссий, без сторонних сервисов и без легаси-костылей.',
    'hero.quickstart': 'Быстрый запуск одной командой:',
    'hero.btn.docs': 'Перейти к документации',
    'hero.btn.github': 'GitHub Репозиторий',
    'hero.copied': 'Скопировано в буфер!',
    'features.title': 'Ключевые преимущества',
    'features.subtitle': 'Разработано для разработчиков, инди-хакеров и селлеров цифровых услуг',
    'comparison.title': 'Почему SaviorBill?',
    'comparison.subtitle': 'Сравнение с динозаврами рынка и закрытыми SaaS-платформами',
    'usecases.title': 'Что можно продавать',
    'usecases.subtitle': 'Любые сценарии цифровой коммерции с мгновенной выдачей',
    'footer.rights': 'Все права защищены.',
    'footer.license': 'Лицензия PolyForm Shield 1.0.0 (Source-Available)',
    'blog.readTime': 'мин на чтение',
    'blog.empty': 'Статей на этом языке пока нет.',
    'docs.toc': 'На этой странице',
    'docs.back': 'Назад к документации',
    'hub.title': 'Каталог Lua-скриптов',
    'hub.subtitle': 'Готовые проверенные интеграции и манифесты от автора и сообщества',
    'hub.download': 'Скачать архив (.zip)',
    'hub.viewCode': 'Посмотреть код'
  },
  en: {
    'nav.docs': 'Documentation',
    'nav.blog': 'Blog',
    'nav.hub': 'Lua Hub',
    'nav.github': 'GitHub',
    'hero.badge': 'v1.0 Source-Available / PolyForm Shield',
    'hero.title.1': 'Data — on your server.',
    'hero.title.2': 'Logic — in your control.',
    'hero.title.3': 'Interface — for your tasks.',
    'hero.subtitle': 'High-performance self-hosted billing engine & digital storefront for VPN, SaaS, hosting, and license keys. Zero commissions, no third-party lock-in.',
    'hero.quickstart': 'Deploy with one command:',
    'hero.btn.docs': 'Explore Documentation',
    'hero.btn.github': 'GitHub Repository',
    'hero.copied': 'Copied to clipboard!',
    'features.title': 'Key Features',
    'features.subtitle': 'Built for developers, indie hackers, and digital services sellers',
    'comparison.title': 'Why SaviorBill?',
    'comparison.subtitle': 'Comparison with legacy monoliths and closed SaaS platforms',
    'usecases.title': 'Supported Use Cases',
    'usecases.subtitle': 'Any digital commerce flow with instant automated delivery',
    'footer.rights': 'All rights reserved.',
    'footer.license': 'PolyForm Shield 1.0.0 License (Source-Available)',
    'blog.readTime': 'min read',
    'blog.empty': 'No posts in this language yet.',
    'docs.toc': 'On this page',
    'docs.back': 'Back to docs',
    'hub.title': 'Lua Scripts Hub',
    'hub.subtitle': 'Ready-to-use integrations and UI manifests from author & community',
    'hub.download': 'Download archive (.zip)',
    'hub.viewCode': 'View code'
  }
} as const;

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui['ru']) {
    return ui[lang]?.[key] || ui[defaultLang][key];
  };
}
