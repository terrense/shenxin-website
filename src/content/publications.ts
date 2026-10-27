import type { L, Publication } from './types';

/**
 * Peer-reviewed publications.
 *
 * Transcribed from the author's own presentation deck.
 *
 * ---------------------------------------------------------------------------
 * TITLES ARE NEVER TRANSLATED
 * ---------------------------------------------------------------------------
 * A paper's title is an identifier, not prose. Translating it produces a
 * string that matches no database, no DOI and no reference list — a reader
 * who copies it finds nothing. So every title renders in the language it was
 * published in, whichever interface language is selected: English for the
 * IEEE and Scopus papers, Russian for the four ВАК articles.
 *
 * `asPublished()` makes that explicit at each call site rather than leaving
 * three identical strings looking like an oversight.
 *
 * Author strings follow the same rule. The papers carry "Shen Xin" and
 * "Шэнь Синь" while the site's display name is "Xin Shen"; a citation has to
 * match the record, not the website.
 *
 * Venues and abstracts *are* translated — those are description, not
 * identity, and a reader genuinely benefits from them in their own language.
 *
 * ВАК is the Russian Higher Attestation Commission list, the recognised
 * core-journal index; the venue field spells that out for readers outside
 * Russia.
 *
 * TODO(content): add DOIs and publisher URLs where available. Only one DOI
 * was present in the source, so the rest ship without a link rather than
 * with a guessed one.
 */

/** A string that is identical in every interface language, by design. */
const asPublished = (title: string): L => ({ en: title, zh: title, ru: title });

export const publications: Publication[] = [
  {
    title: asPublished(
      'Application of Adaptively Maximum Correntropy Based Robust Kalman Filter in Integrated Navigation System',
    ),
    venue: {
      en: 'RusAutoCon 2024 · IEEE',
      zh: 'RusAutoCon 2024 · IEEE',
      ru: 'RusAutoCon 2024 · IEEE',
    },
    year: 2024,
    authors: 'Shen Xin, Lukyanov V. V., Neusypin K. A.',
    kind: 'paper',
    abstract: {
      en: 'A robust adaptive Kalman filter for tightly coupled GNSS/INS integration, using a maximum-correntropy criterion to suppress the effect of heavy-tailed measurement noise and an adaptive coefficient to track changing process statistics. Evaluated against loosely coupled, tightly coupled and existing adaptive baselines on the same trajectory.',
      zh: '面向紧耦合 GNSS/INS 组合导航的鲁棒自适应卡尔曼滤波：以最大相关熵准则抑制重尾量测噪声的影响，并通过自适应系数跟踪变化的过程统计特性。在同一轨迹上与松耦合、紧耦合及已有自适应方法进行对比评估。',
      ru: 'Робастный адаптивный фильтр Калмана для тесно связанной схемы ГНСС/ИНС: критерий максимума корэнтропии подавляет влияние тяжелохвостого шума измерений, адаптивный коэффициент отслеживает изменение статистик процесса. Сравнение со слабо связанной и тесно связанной схемами, а также с существующим адаптивным фильтром на одной траектории.',
    },
  },
  {
    title: asPublished(
      'An Improved Light-weight Network for Real-Time Detection of Potential Risks for Autonomous Vehicles',
    ),
    venue: {
      en: 'RusAutoCon 2024 · IEEE',
      zh: 'RusAutoCon 2024 · IEEE',
      ru: 'RusAutoCon 2024 · IEEE',
    },
    year: 2024,
    authors: 'Shen Xin, Lukyanov V. V., Neusypin K. A.',
    kind: 'paper',
    abstract: {
      en: 'A lightweight detection network targeting the latency budget of an onboard autonomous-driving perception stack, where a model that is accurate but late is of no use to the controller consuming it.',
      zh: '一个面向车载自动驾驶感知栈延迟预算的轻量化检测网络——对于下游控制器而言，一个准确但迟到的模型没有价值。',
      ru: 'Лёгкая сеть обнаружения, рассчитанная на бюджет задержки бортового стека восприятия автономного транспорта: модель, которая точна, но опоздала, бесполезна для потребляющего её регулятора.',
    },
  },
  {
    title: asPublished(
      'Nonlinear Filtering Methods for the State Estimation of Dynamic Systems and Applications in Navigation',
    ),
    venue: {
      en: 'AIP Conference Proceedings, Vol. 2549(1), p. 15001 · Scopus',
      zh: 'AIP Conference Proceedings, 第 2549(1) 卷, 第 15001 页 · Scopus',
      ru: 'AIP Conference Proceedings, т. 2549(1), с. 15001 · Scopus',
    },
    year: 2023,
    authors: 'Shen Xin, Vadim Lukyanov',
    kind: 'paper',
    abstract: {
      en: 'A comparative treatment of nonlinear filters for dynamic state estimation — where the linearisation assumptions behind the extended Kalman filter break down, and what cubature and related sigma-point methods buy in a navigation context.',
      zh: '对动态状态估计中非线性滤波方法的比较研究：扩展卡尔曼滤波背后的线性化假设在何处失效，以及容积卡尔曼等 sigma 点方法在导航场景中带来的收益。',
      ru: 'Сравнительный разбор нелинейных фильтров для оценивания состояния: где перестают работать допущения о линеаризации, лежащие в основе расширенного фильтра Калмана, и что дают кубатурный и родственные сигма-точечные методы в навигационной задаче.',
    },
  },
  {
    title: asPublished('Moving Person Detection Based on Modified YOLOv5'),
    venue: {
      en: '8th Int. Conf. on Interactive Collaborative Robotics (ICR 2023), Baku · Scopus',
      zh: '第八届交互式协作机器人国际会议 (ICR 2023)，巴库 · Scopus',
      ru: '8-я Междунар. конф. по интерактивной коллаборативной робототехнике (ICR 2023), Баку · Scopus',
    },
    year: 2023,
    authors: 'Shen Xin, Wu Guo, Vadim Lukyanov',
    kind: 'paper',
    abstract: {
      en: 'Detection of moving people indoors for a collaborative robotic cell, where a missed detection is a safety event rather than a metric regression.',
      zh: '面向协作机器人工作单元的室内运动人员检测——在该场景中，一次漏检是安全事件，而不只是指标回退。',
      ru: 'Обнаружение движущихся людей в помещении для коллаборативной робототехнической ячейки, где пропуск — это происшествие по безопасности, а не просадка метрики.',
    },
  },
  {
    title: asPublished(
      'Attention Guided In-hand Mechanical Tools Recognition in Human-Robot Collaborative Process',
    ),
    venue: {
      en: '8th Int. Conf. on Interactive Collaborative Robotics (ICR 2023), Baku · Scopus',
      zh: '第八届交互式协作机器人国际会议 (ICR 2023)，巴库 · Scopus',
      ru: '8-я Междунар. конф. по интерактивной коллаборативной робототехнике (ICR 2023), Баку · Scopus',
    },
    year: 2023,
    authors: 'Wu Guo, Shen Xin, Vladimir Serebrenny',
    kind: 'paper',
    abstract: {
      en: 'Recognising which tool a human operator is holding, so a collaborating robot can anticipate the task step rather than react to it. An attention mechanism focuses the classifier on the hand-tool region under heavy occlusion.',
      zh: '识别操作者手中握持的工具，使协作机器人能够预判任务步骤而非被动响应。注意力机制在严重遮挡条件下将分类器聚焦于手-工具区域。',
      ru: 'Распознавание того, какой инструмент держит оператор, чтобы робот мог предвосхищать шаг задачи, а не реагировать на него. Механизм внимания фокусирует классификатор на области «рука — инструмент» при сильных перекрытиях.',
    },
  },
  {
    title: asPublished(
      'Методы нелинейной фильтрации для оценки состояния динамических систем и применения в навигации',
    ),
    venue: {
      en: 'Instruments and Systems: Monitoring, Control and Diagnostics, No. 3, pp. 49–57 · ВАК (Russian HAC core list), tier 1',
      zh: '《仪器与系统：监测、控制与诊断》2024 年第 3 期, 第 49–57 页 · ВАК（俄罗斯最高学位评定委员会核心期刊目录）一区',
      ru: 'Приборы и системы. Управление, контроль, диагностика, № 3, с. 49–57 · ВАК, К1',
    },
    year: 2024,
    authors: 'Шэнь Синь, Лукьянов В. В.',
    kind: 'paper',
    abstract: {
      en: 'Journal-length treatment of the nonlinear filtering work, published in Russian.',
      zh: '上述非线性滤波工作的期刊长文版本，以俄语发表。',
      ru: 'Журнальная версия работы по нелинейной фильтрации.',
    },
  },
  {
    title: asPublished(
      'Применение модифицированной нейронной сети YOLOv5 для распознавания движущихся людей в помещении',
    ),
    venue: {
      en: 'Automation: Modern Technologies · ВАК (Russian HAC core list), tier 2',
      zh: '《自动化：现代技术》· ВАК（俄罗斯最高学位评定委员会核心期刊目录）二区',
      ru: 'Автоматизация. Современные технологии · ВАК, К2',
    },
    year: 2024,
    authors: 'Шэнь Синь, Лукьянов В. В.',
    kind: 'paper',
    abstract: {
      en: 'Journal-length treatment of the indoor person-detection work, published in Russian.',
      zh: '上述室内人员检测工作的期刊长文版本，以俄语发表。',
      ru: 'Журнальная версия работы по обнаружению людей в помещении.',
    },
  },
  {
    title: asPublished(
      'Распознавание и отслеживание механических инструментов в коллаборативной робототехнической ячейке с применением механизма внимания',
    ),
    venue: {
      en: 'Vestnik MSTU "Stankin", No. 4(67), pp. 8–18 · ВАК',
      zh: '《斯坦金莫斯科国立技术大学学报》2023 年第 4(67) 期, 第 8–18 页 · ВАК',
      ru: 'Вестник МГТУ «Станкин», № 4(67), с. 8–18 · ВАК',
    },
    year: 2023,
    authors: 'У Го, Серебренный В. В., Шереужев М. А., Шэнь С., Чжан С.',
    kind: 'paper',
    abstract: {
      en: 'Extends the tool-recognition work from single-frame classification to tracking across a collaborative assembly sequence.',
      zh: '将工具识别工作从单帧分类扩展到协作装配序列中的持续跟踪。',
      ru: 'Развитие работы по распознаванию инструментов: от покадровой классификации к сопровождению на протяжении коллаборативной сборочной последовательности.',
    },
    links: [
      {
        kind: 'paper',
        label: { en: 'DOI', zh: 'DOI', ru: 'DOI' },
        href: 'https://doi.org/10.47617/2072-3172_2023_4_8',
      },
    ],
  },
  {
    title: asPublished(
      'Супервизорная система для коллаборативной робототехнической ячейки на основе RGBD-камеры',
    ),
    venue: {
      en: 'Automation: Modern Technologies · ВАК (Russian HAC core list), tier 2',
      zh: '《自动化：现代技术》· ВАК（俄罗斯最高学位评定委员会核心期刊目录）二区',
      ru: 'Автоматизация. Современные технологии · ВАК, К2',
    },
    year: 2023,
    authors: 'У Го, Серебренный В. В., Шереужев М. А., Шэнь С.',
    kind: 'paper',
    abstract: {
      en: 'A single RGB-D camera supervising a collaborative cell: tracking the operator, the tools and the robot in one frame so the safety logic reasons about one consistent scene rather than three disagreeing sensors.',
      zh: '以单台 RGB-D 相机监督协作单元：在同一帧中跟踪操作者、工具与机器人，使安全逻辑面对的是一个一致的场景，而不是三个彼此不一致的传感器。',
      ru: 'Одна RGB-D камера, наблюдающая за коллаборативной ячейкой: оператор, инструменты и робот отслеживаются в одном кадре, чтобы логика безопасности опиралась на одну непротиворечивую сцену, а не на три расходящихся датчика.',
    },
  },
];
