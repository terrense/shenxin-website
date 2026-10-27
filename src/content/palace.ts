import type { L } from './types';

/**
 * «Чертог навигатора» — the Navigator's Hall.
 *
 * A small explorable room standing in for a career: you walk a figure around
 * a palace floor and each object opens a piece of the story. The reference
 * (peteroravec.com) uses Phaser and isometric pixel art; this uses SVG and
 * a grid, because a megabyte of game engine to render one static room would
 * cost more than the whole rest of the site.
 *
 * The layout is a colonnaded hall rather than a maze of rooms. A maze makes
 * the player hunt for doorways; a hall with pillars reads as a palace,
 * keeps every object reachable, and never traps anyone in a corridor.
 */

/** Tile glyphs. One character per cell, so the map stays readable in source. */
export const TILE = {
  WALL: '#',
  FLOOR: '.',
  /** Decorative inlay — walkable, drawn differently. */
  RUG: '=',
  /** Pillar: blocks movement, and is what makes the room feel built. */
  PILLAR: 'O',
  /** Where the player starts. Walkable. */
  START: 'S',
} as const;

/**
 * 26 x 16. Objects are not in the map — they are placed by coordinate in
 * `exhibits` below, so moving one never means re-counting characters.
 */
export const PALACE_MAP = [
  '##########################',
  '#........................#',
  '#..O..................O..#',
  '#........................#',
  '#....==..==..==..==..=...#',
  '#....==..==..==..==..=...#',
  '#........................#',
  '#..O.........S........O..#',
  '#........................#',
  '#....==..==..==..==..=...#',
  '#....==..==..==..==..=...#',
  '#........................#',
  '#..O..................O..#',
  '#........................#',
  '#........................#',
  '##########################',
];

export type Exhibit = {
  id: string;
  /** Grid position. Must be a floor tile; the object itself blocks movement. */
  x: number;
  y: number;
  /** Which glyph to draw. */
  kind:
    | 'astrolabe'
    | 'tank'
    | 'blackboard'
    | 'antenna'
    | 'pointcloud'
    | 'vine'
    | 'arm'
    | 'terminal'
    | 'caduceus'
    | 'window';
  title: L;
  body: L;
  /** Optional route to the matching case study. */
  href?: string;
};

export const exhibits: Exhibit[] = [
  {
    id: 'astrolabe',
    x: 13,
    y: 4,
    kind: 'astrolabe',
    title: {
      en: 'The Astrolabe',
      zh: '星盘',
      ru: 'Астролябия',
    },
    body: {
      en: 'Every instrument in this hall answers one question: where am I, and how much should I trust the answer? Walk with the arrow keys or WASD. Press E next to anything that glows.',
      zh: '这座厅里的每一件仪器都在回答同一个问题：我在哪里，以及这个答案该被信任多少？用方向键或 WASD 走动，靠近发光的物件按 E。',
      ru: 'Каждый прибор в этом зале отвечает на один вопрос: где я и насколько можно верить этому ответу? Идите стрелками или WASD. Рядом со светящимся предметом нажмите E.',
    },
  },
  {
    id: 'tank',
    x: 4,
    y: 2,
    kind: 'tank',
    title: {
      en: 'A Heavy Thing That Moved',
      zh: '一个被驱动的沉重实体',
      ru: 'Тяжёлая вещь, которая поехала',
    },
    body: {
      en: 'Beijing Institute of Technology, 2014–2018. Armoured vehicle engineering, and a final-year project on fuzzy-logic control of a mobile robot. It was the first time a controller I wrote had to move something with mass — where being approximately right is not the same as being right.',
      zh: '北京理工大学，2014–2018。装甲车辆工程，毕业设计是移动机器人的模糊逻辑控制。那是我写的控制器第一次需要驱动一个有质量的实体——在那里，「大致正确」和「正确」不是一回事。',
      ru: 'Пекинский технологический институт, 2014–2018. Инженерия бронированных машин и дипломный проект по управлению мобильным роботом на нечёткой логике. Тогда впервые написанный мной регулятор должен был сдвинуть нечто, обладающее массой, — а там «примерно верно» и «верно» это не одно и то же.',
    },
  },
  {
    id: 'blackboard',
    x: 21,
    y: 2,
    kind: 'blackboard',
    title: {
      en: 'The Blackboard',
      zh: '黑板',
      ru: 'Доска',
    },
    body: {
      en: 'Moscow, Bauman, 2018–2025. The Kalman filter is optimal under two assumptions: Gaussian noise, known statistics. A GNSS receiver outdoors violates both. Seven years went into what to do about that — a robust term for measurements that lie, an adaptive one for noise that changes.',
      zh: '莫斯科，鲍曼，2018–2025。卡尔曼滤波的最优性建立在两个假设上：高斯噪声、已知统计特性。户外的 GNSS 接收机把这两条都违背了。七年时间花在如何应对——用鲁棒项处理会撒谎的量测，用自适应项处理会变化的噪声。',
      ru: 'Москва, Бауманка, 2018–2025. Фильтр Калмана оптимален при двух допущениях: гауссов шум и известная статистика. ГНСС-приёмник под открытым небом нарушает оба. Семь лет ушло на то, что с этим делать: робастный член — против измерений, которые лгут, адаптивный — против шума, который меняется.',
    },
    href: '/projects/gnss-ins-navigation',
  },
  {
    id: 'antenna',
    x: 21,
    y: 7,
    kind: 'antenna',
    title: {
      en: 'The Antenna',
      zh: '天线',
      ru: 'Антенна',
    },
    body: {
      en: 'Five configurations, one trajectory, one dataset. Horizontal RMSE fell from 5.10 m on GNSS alone to 1.10 m. The vertical channel stayed worst in every run — satellite geometry constrains height weakly, and no filter recovers information the geometry never provided.',
      zh: '五种配置，同一条轨迹，同一组数据。水平 RMSE 从纯 GNSS 的 5.10 m 降到 1.10 m。垂向通道在每次运行里都是最差的——卫星几何对高程的约束很弱，而没有滤波器能恢复几何本就未提供的信息。',
      ru: 'Пять конфигураций, одна траектория, один набор данных. СКО в плане упало с 5,10 м на одной ГНСС до 1,10 м. Вертикальный канал во всех прогонах оставался худшим: геометрия созвездия слабо ограничивает высоту, а восстановить информацию, которой она не дала, не может ни один фильтр.',
    },
    href: '/projects/gnss-ins-navigation',
  },
  {
    id: 'pointcloud',
    x: 4,
    y: 7,
    kind: 'pointcloud',
    title: {
      en: 'The Cloud of Points',
      zh: '点云',
      ru: 'Облако точек',
    },
    body: {
      en: 'Indoors the satellites disappear. A blank corridor wall has almost no trackable corners and several strong lines, and a doorway has an identity that survives a viewpoint change its corners do not. Points, lines and objects in one map — because using only one of the three throws away what the room is offering.',
      zh: '在室内，卫星消失了。一面空白的走廊墙壁几乎没有可跟踪的角点，却有几条明显的直线；一个门框具有跨视角存续的身份，而它的角点没有。点、线、物体统一到同一张地图——只用其中一种，等于丢掉房间正在提供的信息。',
      ru: 'В помещении спутники исчезают. У глухой стены коридора почти нет отслеживаемых углов и есть несколько чётких линий, а у дверного проёма есть идентичность, которая переживает смену ракурса, чего не скажешь о его углах. Точки, линии и объекты в одной карте — потому что использовать лишь одно из трёх значит выбрасывать то, что комната сама предлагает.',
    },
    href: '/projects/visual-slam',
  },
  {
    id: 'vine',
    x: 4,
    y: 12,
    kind: 'vine',
    title: {
      en: 'The Vine',
      zh: '葡萄架',
      ru: 'Виноградная лоза',
    },
    body: {
      en: 'A missed berry costs nothing — the next pass gets it. Cutting the peduncle destroys the whole cluster. Every threshold in that robot is tuned around the asymmetry, which makes it deliberately, measurably timid. Outdoors, in sunlight and wind, with no second chance at a cut.',
      zh: '漏剪一粒果没有代价——下一轮会补上。剪断果梗则毁掉整串。那台机器人里每个阈值都围绕这种不对称来调，使它成为刻意的、可量化的保守。户外作业，阳光与风里，剪错没有第二次机会。',
      ru: 'Пропущенная ягода не стоит ничего — её возьмут на следующем проходе. Перерезанная плодоножка губит всю гроздь. Каждый порог в том роботе настроен вокруг этой асимметрии, отчего он намеренно и измеримо осторожен. Под открытым небом, на солнце и ветру, без права на вторую попытку.',
    },
    href: '/projects/grape-thinning-robot',
  },
  {
    id: 'arm',
    x: 21,
    y: 12,
    kind: 'arm',
    title: {
      en: 'The Arm',
      zh: '机械臂',
      ru: 'Манипулятор',
    },
    body: {
      en: 'Hand-eye calibration produces one transform, and everything the robot does with vision depends on it. The hard part is not the solver — OpenCV has those. It is that nothing tells an operator which captured poses are degenerate, and a degenerate set produces a confident, wrong answer.',
      zh: '手眼标定产出一个变换，而机器人所有基于视觉的动作都依赖它。难点不在求解器——OpenCV 有现成的。难点是：没有任何环节会告诉操作者哪些采集到的位姿是退化的，而一组退化位姿会给出一个自信且错误的答案。',
      ru: 'Калибровка «рука — глаз» даёт одно преобразование, и от него зависит всё, что робот делает по зрению. Сложность не в решателе — они есть в OpenCV. Сложность в том, что оператору никто не говорит, какие из снятых поз вырождены, а вырожденный набор выдаёт уверенный и неверный ответ.',
    },
    href: '/projects/eye-in-hand-calibration',
  },
  {
    id: 'terminal',
    x: 13,
    y: 10,
    kind: 'terminal',
    title: {
      en: 'The Terminal',
      zh: '终端',
      ru: 'Терминал',
    },
    body: {
      en: 'A base model is a starting point. Data curation, SFT, reward modelling, GRPO, evaluation, serving — every stage emitting a manifest, so that "where did this checkpoint come from?" takes a command rather than half a day. I built the eval harness third. That was backwards: it is the instrument you measure everything else with.',
      zh: '基座模型只是起点。数据治理、SFT、奖励建模、GRPO、评测、部署——每个阶段都产出 manifest，于是「这个 checkpoint 是怎么来的？」只需一条命令，而不是半天。我把评测框架排在第三位做，这个顺序错了：它是你用来衡量其他一切的仪器。',
      ru: 'Базовая модель — это отправная точка. Подготовка данных, SFT, модель награды, GRPO, оценка, инференс — каждый этап выпускает манифест, поэтому вопрос «откуда взялся этот чекпойнт?» решается командой, а не половиной дня. Стенд для оценки я сделал третьим. Порядок был неверный: это прибор, которым меряют всё остальное.',
    },
    href: '/projects/post-training-pipeline',
  },
  {
    id: 'caduceus',
    x: 8,
    y: 10,
    kind: 'caduceus',
    title: {
      en: 'The Waiting Room',
      zh: '候诊厅',
      ru: 'Зал ожидания',
    },
    body: {
      en: '"Which department should I see for chest pain?" is a routing question with a safe answer. It is one word away from "what is causing my chest pain?", which is a diagnosis. An agent fluent at the first is fluent at the second unless something stops it — so the intent type has no diagnosis member, and refusing is the only path the schema leaves open.',
      zh: '「胸痛该挂哪个科？」是一个有安全答案的分诊问题。它与「我的胸痛是什么引起的？」只差一个词，而后者是诊断。能流畅回答前者的 Agent 也会流畅回答后者，除非有机制拦住它——所以 intent 类型里没有「诊断」这一项，拒答是模式留下的唯一出路。',
      ru: '«В какое отделение идти с болью в груди?» — вопрос маршрутизации с безопасным ответом. От него одно слово до «что вызывает боль в груди?», а это уже диагноз. Агент, свободно отвечающий на первое, так же свободно ответит и на второе, если его не остановить, — поэтому в типе намерения нет значения «диагноз», и отказ остаётся единственным путём, который оставляет схема.',
    },
    href: '/projects/clinical-multimodal-agent',
  },
  {
    id: 'window',
    x: 18,
    y: 10,
    kind: 'window',
    title: {
      en: 'The Window',
      zh: '窗',
      ru: 'Окно',
    },
    body: {
      en: 'Five countries, two continents. Mostly because the work went there — and the work is most of the story.',
      zh: '五个国家，两个大洲。大多是因为工作去的——而工作几乎就是故事的全部。',
      ru: 'Пять стран, два континента. В основном потому, что туда вела работа, — а работа и есть бо́льшая часть этой истории.',
    },
    href: '/footprints',
  },
];
