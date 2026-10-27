import type { L } from '@/content/types';

/**
 * UI chrome strings only. Everything that is *content* lives in src/content.
 * Keys are flat and namespaced with dots so missing keys are obvious.
 *
 * Russian is complete here on purpose. The interface is what makes a site
 * feel like it speaks your language — a reader forgives untranslated
 * long-form prose far more readily than an English "Back to top" sitting in
 * the middle of a Russian page.
 */
export const ui = {
  'nav.skip': { en: 'Skip to content', zh: '跳到主要内容', ru: 'Перейти к содержанию' },
  'nav.menu': { en: 'Menu', zh: '菜单', ru: 'Меню' },
  'nav.close': { en: 'Close menu', zh: '关闭菜单', ru: 'Закрыть меню' },
  'nav.home': { en: 'Home', zh: '首页', ru: 'Главная' },
  'nav.allWork': { en: 'All work', zh: '全部项目', ru: 'Все проекты' },
  'nav.lang': { en: 'Language', zh: '语言', ru: 'Язык' },
  'nav.langSwitch': { en: 'Change language', zh: '切换语言', ru: 'Сменить язык' },

  'hero.eyebrow': { en: 'Portfolio · AI Systems', zh: '作品集 · AI 系统', ru: 'Портфолио · ИИ-системы' },
  'hero.working': { en: 'Currently working on', zh: '当前专注于', ru: 'Сейчас работаю над' },
  'hero.cta.work': { en: 'See the work', zh: '查看项目', ru: 'Смотреть проекты' },
  'hero.cta.contact': { en: 'Get in touch', zh: '联系我', ru: 'Связаться' },
  'hero.scroll': { en: 'Scroll', zh: '向下滚动', ru: 'Листать' },
  'hero.canvasAlt': {
    en: 'Decorative animated network of nodes and connections.',
    zh: '装饰性的节点与连线动画网络。',
    ru: 'Декоративная анимация сети узлов и связей.',
  },

  'work.eyebrow': { en: '01 — Selected work', zh: '01 — 精选项目', ru: '01 — Избранные проекты' },
  'work.title': { en: 'Systems, not demos', zh: '系统，而非演示', ru: 'Системы, а не демонстрации' },
  'work.lede': {
    en: 'Systems I can defend end to end — what the constraint was, what I chose, what it cost, and what it actually measured.',
    zh: '我能从头到尾讲清楚的系统——约束是什么、我如何选择、代价是什么、实测结果如何。',
    ru: 'Системы, которые я могу объяснить от начала до конца: каким было ограничение, что я выбрал, чего это стоило и что показали измерения.',
  },
  'work.readCase': { en: 'Read case study', zh: '阅读案例', ru: 'Читать разбор' },
  'work.viewAll': { en: 'View all projects', zh: '查看全部项目', ru: 'Все проекты' },
  'work.filter': { en: 'Filter by domain', zh: '按领域筛选', ru: 'Фильтр по направлению' },
  'work.all': { en: 'All', zh: '全部', ru: 'Все' },
  'work.empty': {
    en: 'No projects in this domain yet.',
    zh: '该领域暂无项目。',
    ru: 'В этом направлении проектов пока нет.',
  },
  'work.count': { en: 'projects', zh: '个项目', ru: 'проектов' },

  'agentic.eyebrow': {
    en: '02 — Agentic AI & Reinforcement Learning',
    zh: '02 — Agent 与强化学习',
    ru: '02 — Агентный ИИ и обучение с подкреплением',
  },
  'agentic.title': { en: 'Post-training, end to end', zh: '后训练全链路', ru: 'Пост-обучение от начала до конца' },
  'agentic.lede': {
    en: 'A base model is a starting point. Everything that makes it useful — preference data, reward shaping, policy optimisation, evaluation you can trust — is engineering.',
    zh: '基座模型只是起点。真正让它可用的部分——偏好数据、奖励设计、策略优化、可信评测——都是工程问题。',
    ru: 'Базовая модель — это отправная точка. Всё, что делает её полезной: данные предпочтений, формирование награды, оптимизация политики, оценка, которой можно доверять, — это инженерия.',
  },
  'agentic.diagramHint': {
    en: 'Select a stage to inspect it',
    zh: '点击任一阶段查看详情',
    ru: 'Выберите этап, чтобы посмотреть детали',
  },

  'robotics.eyebrow': {
    en: '03 — Robotics & Embodied AI',
    zh: '03 — 机器人与具身智能',
    ru: '03 — Робототехника и воплощённый ИИ',
  },
  'robotics.title': { en: 'The loop that has to close', zh: '必须闭合的环路', ru: 'Контур, который обязан замкнуться' },
  'robotics.lede': {
    en: 'In simulation, a bad transform is a visual glitch. On hardware it is a collision. Everything below exists because the gap between those two is where robotics actually lives.',
    zh: '在仿真里，一个错误的变换只是视觉问题；在真机上，它就是一次碰撞。下面这些工作之所以存在，正是因为机器人学真正活在这两者之间的落差里。',
    ru: 'В симуляции ошибочное преобразование — это графический сбой. На железе — столкновение. Всё, что ниже, существует потому, что робототехника живёт именно в разрыве между этими двумя случаями.',
  },

  'health.eyebrow': {
    en: '04 — Healthcare Multimodal AI',
    zh: '04 — 医疗多模态 AI',
    ru: '04 — Мультимодальный ИИ в медицине',
  },
  'health.title': {
    en: 'Where being wrong is expensive',
    zh: '犯错代价高昂之处',
    ru: 'Там, где ошибка дорого стоит',
  },
  'health.lede': {
    en: 'Clinical AI is not a harder benchmark — it is a different contract. Abstention, provenance and auditability stop being nice-to-haves and become the feature.',
    zh: '医疗 AI 不是更难的榜单，而是另一种契约。拒答、来源可溯与可审计不再是加分项，而是核心功能。',
    ru: 'Медицинский ИИ — это не более сложный бенчмарк, а другой контракт. Отказ от ответа, прослеживаемость источников и возможность аудита перестают быть приятным дополнением и становятся самой функцией.',
  },

  'research.eyebrow': { en: '05 — Research', zh: '05 — 研究', ru: '05 — Исследования' },
  'research.title': { en: 'Publications & talks', zh: '论文与演讲', ru: 'Публикации и доклады' },
  'research.lede': {
    en: 'Work written up for peer review, plus talks where I had to explain it out loud.',
    zh: '经同行评审的工作，以及需要当面讲清楚的演讲。',
    ru: 'Работы, прошедшие рецензирование, и доклады, где это пришлось объяснять вслух.',
  },
  'research.abstract': { en: 'Abstract', zh: '摘要', ru: 'Аннотация' },
  'research.showAbstract': { en: 'Show abstract', zh: '展开摘要', ru: 'Показать аннотацию' },
  'research.hideAbstract': { en: 'Hide abstract', zh: '收起摘要', ru: 'Скрыть аннотацию' },
  'research.empty': {
    en: 'Publication list is being updated.',
    zh: '论文列表正在更新。',
    ru: 'Список публикаций обновляется.',
  },

  'writing.eyebrow': { en: '06 — Technical writing', zh: '06 — 技术写作', ru: '06 — Технические заметки' },
  'writing.title': { en: 'Notes from the build', zh: '构建笔记', ru: 'Заметки по ходу работы' },
  'writing.lede': {
    en: 'Debugging write-ups and architecture notes. Mostly the things I wish someone had written before I lost a week to them.',
    zh: '调试记录与架构笔记。大多是我希望在浪费掉一周之前就有人写下来的东西。',
    ru: 'Разборы отладки и заметки по архитектуре. В основном то, что я хотел бы прочитать до того, как потерял на этом неделю.',
  },
  'writing.read': { en: 'Read', zh: '阅读', ru: 'Читать' },
  'writing.minutes': { en: 'min read', zh: '分钟阅读', ru: 'мин чтения' },
  'writing.unpublished': { en: 'Unpublished', zh: '未发布', ru: 'Не опубликовано' },

  'footprints.eyebrow': { en: 'Footprints', zh: '足迹', ru: 'География' },
  'footprints.title': { en: 'Where I have been', zh: '我去过的地方', ru: 'Где я побывал' },
  'footprints.lede': {
    en: 'Five countries across two continents — mostly because the work went there, and the work is most of the story.',
    zh: '五个国家，横跨两个大洲——大多是因为工作去的，而工作几乎就是故事的全部。',
    ru: 'Пять стран на двух континентах — в основном потому, что туда вела работа, а работа и есть бо́льшая часть этой истории.',
  },
  'footprints.countries': { en: 'countries', zh: '个国家', ru: 'стран' },
  'footprints.note': {
    en: 'Countries are filled from a list, not inferred from anything. Only places actually visited are marked.',
    zh: '地图上的国家来自一份人工维护的列表，而非任何推断。只标注真正去过的地方。',
    ru: 'Страны отмечаются по списку, который ведётся вручную, а не выводятся автоматически. Отмечены только те места, где я действительно был.',
  },

  'about.eyebrow': { en: '07 — About', zh: '07 — 关于', ru: '07 — Обо мне' },
  'about.title': { en: 'How I work', zh: '我的工作方式', ru: 'Как я работаю' },
  'about.capabilities': { en: 'Capabilities', zh: '技术能力', ru: 'Компетенции' },
  'about.timeline': { en: 'Trajectory', zh: '经历', ru: 'Путь' },

  'contact.eyebrow': { en: '08 — Contact', zh: '08 — 联系', ru: '08 — Контакты' },
  'contact.title': {
    en: "Let's build something that ships",
    zh: '一起做能落地的东西',
    ru: 'Давайте сделаем то, что дойдёт до продакшена',
  },
  'contact.lede': {
    en: 'Open to roles and collaborations in agentic systems, RL post-training and embodied AI. The fastest route is email.',
    zh: '欢迎在 Agent 系统、RL 后训练与具身智能方向的合作与机会。邮件是最快的方式。',
    ru: 'Открыт к работе и сотрудничеству в области агентных систем, пост-обучения с подкреплением и воплощённого ИИ. Быстрее всего — по электронной почте.',
  },
  'contact.email': { en: 'Email me', zh: '发送邮件', ru: 'Написать' },
  'contact.copy': { en: 'Copy address', zh: '复制地址', ru: 'Скопировать адрес' },
  'contact.copied': { en: 'Copied', zh: '已复制', ru: 'Скопировано' },
  'contact.responseTime': {
    en: 'Usually replies within two days',
    zh: '通常两天内回复',
    ru: 'Обычно отвечаю в течение двух дней',
  },

  'case.back': { en: 'All projects', zh: '全部项目', ru: 'Все проекты' },
  'case.overview': { en: 'Overview', zh: '概览', ru: 'Обзор' },
  'case.contents': { en: 'Contents', zh: '目录', ru: 'Содержание' },
  'case.role': { en: 'Role', zh: '角色', ru: 'Роль' },
  'case.period': { en: 'Period', zh: '周期', ru: 'Период' },
  'case.stack': { en: 'Stack', zh: '技术栈', ru: 'Стек' },
  'case.links': { en: 'Links', zh: '链接', ru: 'Ссылки' },
  'case.next': { en: 'Next project', zh: '下一个项目', ru: 'Следующий проект' },
  'case.prev': { en: 'Previous project', zh: '上一个项目', ru: 'Предыдущий проект' },
  'case.section.problem': { en: 'Problem', zh: '问题', ru: 'Задача' },
  'case.section.architecture': { en: 'System architecture', zh: '系统架构', ru: 'Архитектура системы' },
  'case.section.decisions': { en: 'Engineering decisions', zh: '工程决策', ru: 'Инженерные решения' },
  'case.section.experiments': { en: 'Experiments', zh: '实验', ru: 'Эксперименты' },
  'case.section.results': { en: 'Results', zh: '结果', ru: 'Результаты' },
  'case.section.demo': { en: 'Demo', zh: '演示', ru: 'Демонстрация' },
  'case.section.reflection': { en: 'What I would change', zh: '如果重来', ru: 'Что бы я изменил' },

  'status.shipped': { en: 'Shipped', zh: '已交付', ru: 'Внедрено' },
  'status.active': { en: 'Active', zh: '进行中', ru: 'В работе' },
  'status.research': { en: 'Research', zh: '研究中', ru: 'Исследование' },
  'status.archived': { en: 'Archived', zh: '已归档', ru: 'В архиве' },

  'link.repo': { en: 'Repository', zh: '代码仓库', ru: 'Репозиторий' },
  'link.demo': { en: 'Live demo', zh: '在线演示', ru: 'Демо' },
  'link.paper': { en: 'Paper', zh: '论文', ru: 'Статья' },
  'link.video': { en: 'Video', zh: '视频', ru: 'Видео' },
  'link.doc': { en: 'Write-up', zh: '文档', ru: 'Описание' },
  'link.external': { en: 'Open', zh: '打开', ru: 'Открыть' },

  'callout.insight': { en: 'Insight', zh: '洞察', ru: 'Вывод' },
  'callout.warning': { en: 'Trap', zh: '陷阱', ru: 'Ловушка' },
  'callout.note': { en: 'Note', zh: '备注', ru: 'Примечание' },

  'motion.reduced': {
    en: 'Reduced motion is on',
    zh: '已启用减弱动态效果',
    ru: 'Включён режим уменьшенной анимации',
  },

  'provenance.illustrative': { en: 'est.', zh: '估算', ru: 'оцен.' },
  'provenance.illustrativeHelp': {
    en: 'Illustrative figure — a plausible placeholder pending measurement, not an experimental result.',
    zh: '示意性数值——待实测的合理占位，并非实验结果。',
    ru: 'Иллюстративное значение — правдоподобная заглушка до проведения измерений, а не экспериментальный результат.',
  },
  'provenance.note': {
    en: 'Figures marked “est.” are illustrative placeholders pending measurement, not experimental results. Unmarked figures are measured values or hardware specifications.',
    zh: '标注“估算”的数值为待实测的示意性占位，并非实验结果。未标注的数值为实测值或硬件规格。',
    ru: 'Значения с пометкой «оцен.» — иллюстративные заглушки до измерений, а не экспериментальные результаты. Значения без пометки являются измеренными или взяты из спецификаций оборудования.',
  },

  'media.concept': { en: 'Concept visualization', zh: '概念示意图', ru: 'Концептуальная иллюстрация' },
  'media.conceptHelp': {
    en: 'Generated illustration of the system concept — not a screenshot of the running system.',
    zh: '系统概念的生成式示意图——并非实际运行系统的截图。',
    ru: 'Сгенерированная иллюстрация концепции системы — не снимок экрана работающей системы.',
  },

  '404.title': { en: 'Route not found', zh: '页面不存在', ru: 'Страница не найдена' },
  '404.body': {
    en: 'That path does not resolve. The project index is probably what you want.',
    zh: '该路径无法解析。你大概想找的是项目索引页。',
    ru: 'Такого адреса нет. Скорее всего, вам нужен список проектов.',
  },

  'footer.built': {
    en: 'Built with React, TypeScript and Vite. Statically hosted, no tracking.',
    zh: '使用 React、TypeScript 与 Vite 构建。静态托管，无任何追踪。',
    ru: 'Сделано на React, TypeScript и Vite. Статический хостинг, без трекинга.',
  },
  'footer.rights': { en: 'All rights reserved.', zh: '保留所有权利。', ru: 'Все права защищены.' },
  'footer.top': { en: 'Back to top', zh: '返回顶部', ru: 'Наверх' },
} satisfies Record<string, L>;

export type UIKey = keyof typeof ui;
