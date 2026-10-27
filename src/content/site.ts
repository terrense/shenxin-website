import type { Domain, L, Metric } from './types';
import { publications } from './publications';
import { articles } from './writing';

/**
 * Single source of truth for identity, URLs and navigation.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * EDIT THIS FIRST. See CONTENT.md for the checklist.
 *
 * Changing `SITE_URL` means changing it in three places — they are static
 * files the bundler cannot reach into:
 *   1. here,
 *   2. index.html (canonical, og:url, og:image, JSON-LD), and
 *   3. public/robots.txt (the Sitemap line).
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Currently the free Cloudflare Pages subdomain. It is derived from the Pages
 * *project* name, so if the project is created as `shenxin-website` this is
 * correct as-is. A custom domain later is a one-line change here plus the two
 * files above.
 */
export const SITE_URL = 'https://shenxin-website.pages.dev';

export const profile = {
  // Chinese characters taken from the author's own presentation deck. Note
  // that published papers carry "Shen Xin" (and "Шэнь Синь" in Russian
  // venues) — citations must match the record, not this display name.
  // `ru` is the form used on the Russian-language publications.
  name: { en: 'Xin Shen', zh: '沈鑫', ru: 'Шэнь Синь' } satisfies L,
  role: { en: 'AI Systems Engineer', zh: 'AI 系统工程师', ru: 'Инженер ИИ-систем' } satisfies L,
  location: {
    en: 'China · Remote-friendly',
    zh: '中国 · 支持远程',
    ru: 'Китай · готов к удалённой работе',
  } satisfies L,
  email: 'slamshenxin@gmail.com',

  /** The one sentence someone should remember. */
  headline: {
    en: 'I build AI systems that have to survive contact with the physical world.',
    zh: '我构建必须经得起物理世界考验的 AI 系统。',
    ru: 'Я строю ИИ-системы, которым приходится выдерживать столкновение с физическим миром.',
  } satisfies L,

  statement: {
    en: 'A doctorate in integrated navigation from Bauman Moscow State Technical University, then agentic runtimes, RL post-training and field robotics. The through-line is state estimation: whether the system is a Kalman filter fusing pseudoranges or an agent fusing tool output, the hard part is the same — deciding how much to believe a measurement that might be wrong. I work at the seam where a model stops being a benchmark number and starts being a system with latency budgets, failure modes and people depending on it.',
    zh: '在莫斯科鲍曼国立技术大学取得组合导航方向博士学位，此后转向 Agent 运行时、强化学习后训练与田间机器人。贯穿其中的主线是状态估计：无论系统是融合伪距的卡尔曼滤波，还是融合工具输出的 Agent，难点都是同一个——决定一个可能出错的量测应该被相信多少。我的工作发生在那个接缝处——模型不再只是一个榜单分数，而成为一个有延迟预算、有失效模式、有人依赖它的系统。',
    ru: 'Кандидатская степень по комплексированной навигации в МГТУ им. Н. Э. Баумана, затем агентные среды выполнения, пост-обучение с подкреплением и полевая робототехника. Сквозная линия — оценивание состояния: неважно, фильтр Калмана это, объединяющий псевдодальности, или агент, объединяющий выводы инструментов, — трудность одна и та же: решить, насколько можно верить измерению, которое может оказаться ошибочным. Я работаю на том стыке, где модель перестаёт быть числом в бенчмарке и становится системой с бюджетом задержек, режимами отказа и людьми, которые на неё полагаются.',
  } satisfies L,

  /** Hero stat rail. Keep to four; they should be defensible. */
  stats: [
    {
      value: '10',
      provenance: 'measured',
      countTo: 10,
      label: { en: 'Peer-reviewed papers', zh: '同行评审论文', ru: 'Рецензируемых статей' },
      detail: { en: 'IEEE · Scopus · ВАК', zh: 'IEEE · Scopus · ВАК', ru: 'IEEE · Scopus · ВАК' },
    },
    {
      value: '10',
      provenance: 'spec',
      countTo: 10,
      label: { en: 'Systems documented', zh: '系统案例', ru: 'Описанных систем' },
      detail: {
        en: 'Doctoral research to deployed hardware',
        zh: '从博士研究到真机部署',
        ru: 'От диссертации до железа в работе',
      },
    },
    {
      value: '1.10m',
      provenance: 'measured',
      label: {
        en: 'GNSS/INS position RMSE',
        zh: 'GNSS/INS 定位 RMSE',
        ru: 'СКО положения, ГНСС/ИНС',
      },
      detail: {
        en: 'From 5.10 m GNSS-only, same trajectory',
        zh: '同一轨迹，纯 GNSS 为 5.10 m',
        ru: 'Было 5,10 м на одной ГНСС, та же траектория',
      },
    },
    {
      value: '8ms',
      provenance: 'spec',
      label: { en: 'Control loop', zh: '控制周期', ru: 'Цикл управления' },
      detail: {
        en: 'Real-time arm feedback, CR-series',
        zh: 'CR 系列机械臂实时反馈',
        ru: 'Обратная связь манипулятора CR в реальном времени',
      },
    },
  ] satisfies Metric[],

  /** Rotating roles under the hero headline. */
  rotating: [
    { en: 'agentic runtimes', zh: 'Agent 运行时', ru: 'агентными средами выполнения' },
    { en: 'RL post-training', zh: '强化学习后训练', ru: 'пост-обучением с подкреплением' },
    { en: 'robot manipulation', zh: '机器人操作', ru: 'манипуляцией роботов' },
    { en: 'sim-to-real transfer', zh: 'Sim-to-Real 迁移', ru: 'переносом из симуляции в реальность' },
    { en: 'multimodal clinical AI', zh: '医疗多模态 AI', ru: 'мультимодальным ИИ в медицине' },
  ] satisfies L[],
} as const;

/**
 * External profiles.
 *
 * `href: null` hides the row entirely. Every consumer filters on this, so an
 * unverified profile is simply absent rather than rendered as a link to a
 * site's logged-out home page — which looks like a profile and is not one.
 * Fill in a real URL to make the row appear.
 */
export const socials: Array<{ id: string; label: string; href: string | null }> = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/terrense' },
  // TODO(content): add real profile URLs to surface these.
  { id: 'linkedin', label: 'LinkedIn', href: null },
  { id: 'scholar', label: 'Scholar', href: null },
  { id: 'x', label: 'X', href: null },
];

/**
 * Primary navigation.
 *
 * Sections that can hide themselves when their content array is empty
 * (Research, Writing) declare `requires`. `navSections` is filtered on that,
 * so the nav can never link to a section that did not render — which would
 * scroll the reader to nothing.
 */
const allNavSections: Array<{ id: string; label: L; requires?: 'publications' | 'articles' }> =
  [
    { id: 'work', label: { en: 'Work', zh: '项目', ru: 'Проекты' } },
    { id: 'agentic', label: { en: 'Agentic & RL', zh: 'Agent 与 RL', ru: 'Агенты и RL' } },
    { id: 'robotics', label: { en: 'Robotics', zh: '机器人', ru: 'Робототехника' } },
    { id: 'healthcare', label: { en: 'Healthcare', zh: '医疗 AI', ru: 'Медицина' } },
    {
      id: 'research',
      label: { en: 'Research', zh: '研究', ru: 'Исследования' },
      requires: 'publications',
    },
    {
      id: 'writing',
      label: { en: 'Writing', zh: '写作', ru: 'Заметки' },
      requires: 'articles',
    },
    { id: 'about', label: { en: 'About', zh: '关于', ru: 'Обо мне' } },
  ];

export const navSections = allNavSections.filter((item) => {
  if (item.requires === 'publications') return publications.length > 0;
  if (item.requires === 'articles') return articles.length > 0;
  return true;
});

export const domainLabels: Record<Domain, L> = {
  agentic: { en: 'Agentic AI', zh: 'Agent 系统', ru: 'Агентный ИИ' },
  rl: { en: 'Reinforcement Learning', zh: '强化学习', ru: 'Обучение с подкреплением' },
  robotics: { en: 'Robotics', zh: '机器人', ru: 'Робототехника' },
  embodied: { en: 'Embodied AI', zh: '具身智能', ru: 'Воплощённый ИИ' },
  healthcare: { en: 'Healthcare AI', zh: '医疗 AI', ru: 'ИИ в медицине' },
  infra: { en: 'Systems & Infra', zh: '系统与基础设施', ru: 'Системы и инфраструктура' },
};

/** Grouped capability matrix for the About section. */
export const capabilities: Array<{ group: L; items: string[] }> = [
  {
    group: { en: 'Post-training & RL', zh: '后训练与强化学习', ru: 'Пост-обучение и RL' },
    items: [
      'SFT / LoRA / QLoRA',
      'DPO · GRPO · PPO',
      'Reward modelling',
      'verl · TRL · DeepSpeed',
      'Eval harness design',
      'Preference data pipelines',
    ],
  },
  {
    group: { en: 'Agentic systems', zh: 'Agent 系统', ru: 'Агентные системы' },
    items: [
      'Tool-calling runtimes',
      'MCP servers',
      'Planner / executor split',
      'Long-horizon memory',
      'Trace-based debugging',
      'LLM-as-judge pipelines',
    ],
  },
  {
    group: { en: 'Robotics', zh: '机器人', ru: 'Робототехника' },
    items: [
      'ROS 2 · Rust · C++',
      'Eye-in-hand calibration',
      'Motion planning & avoidance',
      'Isaac Sim / Isaac Lab',
      'Stereo & RGB-D perception',
      'Real-time IPC (iceoryx2)',
    ],
  },
  {
    group: {
      en: 'Navigation & state estimation',
      zh: '导航与状态估计',
      ru: 'Навигация и оценивание состояния',
    },
    items: [
      'Kalman / cubature filtering',
      'Robust & adaptive filters',
      'Tightly coupled GNSS/INS',
      'Visual-inertial SLAM',
      'Point · line · semantic features',
      'Observability analysis',
    ],
  },
  {
    group: { en: 'Serving & infra', zh: '推理与基础设施', ru: 'Инференс и инфраструктура' },
    items: [
      'vLLM · SGLang',
      'Triton kernels',
      'ONNX / TensorRT',
      'CUDA profiling',
      'Docker · CI',
      'Observability',
    ],
  },
];

export const timeline: Array<{ period: string; title: L; body: L }> = [
  {
    period: '2025 — now',
    title: { en: 'Embodied AI & VLA policies', zh: '具身智能与 VLA 策略', ru: 'Воплощённый ИИ и VLA-политики' },
    body: {
      en: 'Benchmarking vision-language-action policies against real hardware limits, and closing the loop between Isaac Lab scenes and a physical arm.',
      zh: '在真实硬件约束下评测视觉-语言-动作策略，并把 Isaac Lab 场景与物理机械臂闭环打通。',
      ru: 'Оценка политик «зрение — язык — действие» в условиях реальных аппаратных ограничений и замыкание контура между сценами Isaac Lab и физическим манипулятором.',
    },
  },
  {
    period: '2024 — 2025',
    title: {
      en: 'LLM post-training, end to end',
      zh: '大模型后训练全链路',
      ru: 'Пост-обучение LLM от начала до конца',
    },
    body: {
      en: 'Built the full chain in-house: data curation, SFT, reward modelling, preference optimisation, evaluation and serving — with reproducibility as a hard requirement.',
      zh: '自建完整链路：数据治理、SFT、奖励建模、偏好优化、评测与推理部署——可复现性是硬性要求。',
      ru: 'Полная цепочка, собранная своими силами: подготовка данных, SFT, модель награды, оптимизация по предпочтениям, оценка и инференс — с воспроизводимостью как жёстким требованием.',
    },
  },
  {
    period: '2023 — 2024',
    title: { en: 'Field robotics', zh: '田间机器人', ru: 'Полевая робототехника' },
    body: {
      en: 'Perception, decision and manipulation for an agricultural robot that had to work in sunlight, dust and wind — not in a lab.',
      zh: '为农业机器人构建感知、决策与操作系统——工作环境是阳光、灰尘与风，而不是实验室。',
      ru: 'Восприятие, принятие решений и манипуляция для сельскохозяйственного робота, которому нужно работать на солнце, в пыли и на ветру, а не в лаборатории.',
    },
  },
  {
    period: '2020 — 2025',
    title: {
      en: 'PhD, Bauman Moscow State Technical University',
      zh: '博士，莫斯科鲍曼国立技术大学',
      ru: 'Аспирантура, МГТУ им. Н. Э. Баумана',
    },
    body: {
      en: 'Chinese government scholarship. Camera/GPS/IMU tightly coupled navigation: robust and adaptive nonlinear filtering, observability analysis, then indoor visual SLAM fusing point, line and semantic landmarks. Nine peer-reviewed papers, and fieldwork during an internship at a Chinese Academy of Sciences institute.',
      zh: '国家公派。相机/GPS/IMU 紧组合导航方向：鲁棒与自适应非线性滤波、可观测性分析，后期转向融合点、线与语义路标的室内视觉 SLAM。发表九篇同行评审论文，并在中科院某研究所实习期间参与实物实验。',
      ru: 'Обучение по государственной стипендии КНР. Тесно связанная навигация камера/GPS/ИНС: робастная и адаптивная нелинейная фильтрация, анализ наблюдаемости, затем визуальный SLAM в помещении с объединением точечных, линейных и семантических ориентиров. Девять рецензируемых публикаций и натурные эксперименты во время стажировки в институте Академии наук КНР.',
    },
  },
  {
    period: '2018 — 2020',
    title: {
      en: 'MSc, Bauman Moscow State Technical University',
      zh: '硕士，莫斯科鲍曼国立技术大学',
      ru: 'Магистратура, МГТУ им. Н. Э. Баумана',
    },
    body: {
      en: 'Intelligent control systems and integrated navigation. Thesis on GPS/IMU integration — the starting point for everything above.',
      zh: '智能控制系统与组合导航方向。硕士课题为 GPS/IMU 组合导航算法——上述一切的起点。',
      ru: 'Интеллектуальные системы управления и комплексированная навигация. Диссертация по интеграции GPS/ИНС — отправная точка для всего, что выше.',
    },
  },
  {
    period: '2014 — 2018',
    title: {
      en: 'BEng, Beijing Institute of Technology',
      zh: '学士，北京理工大学',
      ru: 'Бакалавриат, Пекинский технологический институт',
    },
    body: {
      en: 'Armoured vehicle engineering. Final-year project on fuzzy-logic control of a mobile robot — the first time a controller I wrote had to move something heavy.',
      zh: '装甲车辆工程专业。毕业设计为移动机器人的模糊逻辑控制——那是我写的控制器第一次需要驱动一个沉重的实体。',
      ru: 'Инженерия бронированных машин. Дипломный проект — управление мобильным роботом на нечёткой логике: впервые написанный мной регулятор должен был сдвинуть нечто тяжёлое.',
    },
  },
];
