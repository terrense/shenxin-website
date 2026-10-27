import type { Project } from '../types';

/**
 * The doctoral work. Every figure in the Results section is read off the
 * author's own comparison table and is therefore `provenance: 'measured'` —
 * this is the one case study on the site whose numbers come from a published,
 * peer-reviewed evaluation rather than from engineering specs.
 */
export const gnssInsNavigation: Project = {
  slug: 'gnss-ins-navigation',
  title: {
    en: 'Robust Adaptive GNSS/INS Navigation',
    zh: 'GNSS/INS 鲁棒自适应组合导航',
    ru: 'Робастная адаптивная навигация ГНСС/ИНС',
  },
  tagline: {
    en: 'A tightly coupled filter that holds position when the measurements lie',
    zh: '当量测失真时仍能守住定位精度的紧耦合滤波器',
    ru: 'Тесно связанный фильтр, удерживающий решение, когда измерения лгут',
  },
  summary: {
    en: 'Doctoral research on nonlinear state estimation for integrated navigation. A maximum-correntropy robust term suppresses heavy-tailed measurement outliers while an adaptive coefficient tracks changing process noise — cutting horizontal position RMSE to roughly a quarter of the GNSS-only baseline on the same trajectory.',
    zh: '关于组合导航非线性状态估计的博士研究。以最大相关熵鲁棒项抑制重尾量测野值，同时用自适应系数跟踪变化的过程噪声——在同一条轨迹上，将水平定位 RMSE 降至纯 GNSS 基线的约四分之一。',
    ru: 'Диссертационное исследование по нелинейному оцениванию состояния в комплексированной навигации. Робастный член на основе максимума корэнтропии подавляет тяжелохвостые выбросы измерений, а адаптивный коэффициент отслеживает изменяющийся шум процесса — СКО горизонтального положения падает примерно до четверти от базового варианта с одной ГНСС на той же траектории.',
  },
  domain: 'robotics',
  alsoIn: ['infra'],
  period: '2018 — 2025',
  role: {
    en: 'Doctoral researcher — Bauman Moscow State Technical University',
    zh: '博士研究员 — 莫斯科鲍曼国立技术大学',
    ru: 'Аспирант — МГТУ им. Н. Э. Баумана',
  },
  status: 'shipped',
  accent: 'signal',
  stack: [
    'Kalman filtering',
    'Cubature KF',
    'Maximum correntropy',
    'Tightly coupled GNSS/INS',
    'Observability analysis',
    'MATLAB',
    'C++',
  ],
  highlights: [
    {
      value: '1.10m',
      provenance: 'measured',
      label: { en: 'Position RMSE, x', zh: '定位 RMSE（x 轴）', ru: 'СКО положения, x' },
      detail: { en: 'From 5.10 m GNSS-only', zh: '纯 GNSS 为 5.10 m', ru: 'Было 5,10 м на одной ГНСС' },
    },
    {
      value: '−72%',
      provenance: 'measured',
      label: {
        en: 'vs. standard tight coupling',
        zh: '相比标准紧耦合',
        ru: 'против обычной тесной связи',
      },
      detail: {
        en: 'x-axis RMSE, 3.87 m → 1.10 m',
        zh: 'x 轴 RMSE：3.87 m → 1.10 m',
        ru: 'СКО по x: 3,87 м → 1,10 м',
      },
    },
    {
      value: '5',
      provenance: 'measured',
      countTo: 5,
      label: { en: 'Configurations compared', zh: '对比配置数', ru: 'Сравнённых конфигураций' },
      detail: {
        en: 'Same trajectory, same data',
        zh: '同一轨迹、同一组数据',
        ru: 'Та же траектория, те же данные',
      },
    },
  ],
  featured: true,
  span: 'wide',
  motif: 'orbit',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题' },
      lede: {
        en: 'A Kalman filter assumes its noise is Gaussian. Outdoors, it is not.',
        zh: '卡尔曼滤波假设噪声是高斯的。而在户外，它不是。',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'The standard Kalman filter is optimal under two assumptions: the process and measurement noise are Gaussian, and their statistics are known. A GNSS receiver in a real environment violates both. Multipath off buildings, foliage attenuation and brief outages produce measurement errors that are not Gaussian but heavy-tailed — occasional large excursions that a least-squares estimator treats as information and dutifully follows.',
            zh: '标准卡尔曼滤波的最优性建立在两个假设之上：过程噪声与量测噪声服从高斯分布，且其统计特性已知。真实环境中的 GNSS 接收机同时违背这两条。建筑物多径、植被遮挡与短时失锁产生的量测误差并非高斯，而是重尾的——偶发的大幅偏离会被最小二乘估计器当作信息而忠实地跟随。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The consequence is specific and bad: a single multipath excursion does not just add noise to that epoch, it corrupts the filter state, and the inertial solution then propagates the corruption forward between fixes. The failure is not a noisy output — it is a confident, smooth, wrong trajectory.',
            zh: '后果具体而严重：一次多径跳变不只是给该时刻增加噪声，它会污染滤波器状态，而惯导解算随后会在两次定位之间把这个污染向前传播。失效形态不是"输出变噪"——而是一条平滑、自信、错误的轨迹。',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Robustness', zh: '鲁棒性' },
              body: {
                en: 'Bound the influence any single measurement can have, without discarding the genuinely informative ones.',
                zh: '限制任一单次量测所能产生的影响，同时不丢弃那些真正有信息量的量测。',
              },
            },
            {
              label: { en: 'Adaptivity', zh: '自适应性' },
              body: {
                en: 'Track process-noise statistics that change with the vehicle dynamics instead of assuming a tuned constant.',
                zh: '跟踪随载体动态变化的过程噪声统计特性，而不是假定一个调好的常数。',
              },
            },
            {
              label: { en: 'Observability', zh: '可观测性' },
              body: {
                en: 'Know which states are actually observable under the current geometry — a filter will happily report a tight covariance on a state nothing is constraining.',
                zh: '明确在当前几何条件下哪些状态真正可观测——对于一个没有任何约束的状态，滤波器同样会给出一个很小的协方差。',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'decisions',
      title: { en: 'Engineering decisions', zh: '工程决策' },
      blocks: [
        {
          kind: 'table',
          caption: {
            en: 'The choices that shaped the filter.',
            zh: '塑造该滤波器的关键选择。',
          },
          head: [
            { en: 'Decision', zh: '决策' },
            { en: 'Chosen', zh: '选择' },
            { en: 'Rejected', zh: '放弃' },
            { en: 'Why', zh: '原因' },
          ],
          rows: [
            [
              { en: 'Coupling', zh: '耦合方式' },
              { en: 'Tightly coupled', zh: '紧耦合' },
              { en: 'Loosely coupled', zh: '松耦合' },
              {
                en: 'Loose coupling needs four satellites before it can correct anything. Tight coupling fuses individual pseudoranges, so a partially obstructed sky still contributes.',
                zh: '松耦合必须先有四颗星才能做出任何修正。紧耦合融合的是单条伪距，因此即使天空被部分遮挡也仍能提供约束。',
              },
            ],
            [
              { en: 'Robust criterion', zh: '鲁棒准则' },
              { en: 'Maximum correntropy', zh: '最大相关熵' },
              { en: 'Fixed outlier gate', zh: '固定野值门限' },
              {
                en: 'A hard gate needs a threshold nobody can set correctly for every condition. Correntropy down-weights smoothly by residual size, so there is no cliff to tune.',
                zh: '硬门限需要一个在所有工况下都无法正确设定的阈值。相关熵按残差大小平滑降权，因而不存在需要调的突变点。',
              },
            ],
            [
              { en: 'Nonlinear filter', zh: '非线性滤波' },
              { en: 'Cubature Kalman filter', zh: '容积卡尔曼滤波' },
              { en: 'Extended Kalman filter', zh: '扩展卡尔曼滤波' },
              {
                en: 'The EKF linearises about the current estimate, which is precisely the thing that is wrong after an outlier. Sigma-point propagation does not depend on a Jacobian being valid.',
                zh: 'EKF 在当前估计点处线性化，而野值发生之后，恰恰是这个点出了问题。Sigma 点传播不依赖雅可比矩阵仍然有效。',
              },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'insight',
          title: {
            en: 'Robust and adaptive solve different failures',
            zh: '鲁棒与自适应解决的是不同的失效',
          },
          body: {
            en: 'They are easy to conflate and they are not interchangeable. The robust term handles measurements that are wrong — outliers that should not be believed. The adaptive term handles statistics that have changed — noise that is larger than it was, and should be believed less across the board. Adding only one leaves the other failure mode fully open, which is why both appear in the final algorithm.',
            zh: '这两者容易混为一谈，但并不可互换。鲁棒项处理的是"错误的量测"——不该被相信的野值。自适应项处理的是"变化了的统计特性"——噪声整体变大，因此整体上都应降低信任。只加其中一项，另一类失效模式便毫无防护——这正是最终算法中两者同时存在的原因。',
          },
        },
      ],
    },
    {
      id: 'results',
      title: { en: 'Results', zh: '结果' },
      lede: {
        en: 'Five configurations, one trajectory, one dataset.',
        zh: '五种配置，同一条轨迹，同一组数据。',
      },
      blocks: [
        {
          kind: 'table',
          caption: {
            en: 'Position and velocity RMSE across the three axes. Every configuration was evaluated on the same recorded trajectory, so the rows are directly comparable.',
            zh: '三轴定位与速度 RMSE。所有配置均在同一条实录轨迹上评测，因此各行可直接比较。',
          },
          head: [
            { en: 'Configuration', zh: '配置' },
            { en: 'Pos. RMSE x / y / z (m)', zh: '定位 RMSE x / y / z (m)' },
            { en: 'Vel. RMSE x / y / z (m/s)', zh: '速度 RMSE x / y / z (m/s)' },
          ],
          rows: [
            [
              { en: 'GNSS only, no filter', zh: '纯 GNSS，无滤波' },
              { en: '5.099 / 6.942 / 17.256', zh: '5.099 / 6.942 / 17.256' },
              { en: '0.123 / 0.209 / 0.531', zh: '0.123 / 0.209 / 0.531' },
            ],
            [
              { en: 'GNSS/INS loosely coupled, standard KF', zh: 'GNSS/INS 松耦合，标准 KF' },
              { en: '4.099 / 4.673 / 15.664', zh: '4.099 / 4.673 / 15.664' },
              { en: '0.120 / 0.105 / 0.476', zh: '0.120 / 0.105 / 0.476' },
            ],
            [
              { en: 'GNSS/INS tightly coupled, standard KF', zh: 'GNSS/INS 紧耦合，标准 KF' },
              { en: '3.872 / 3.195 / 15.003', zh: '3.872 / 3.195 / 15.003' },
              { en: '0.113 / 0.103 / 0.378', zh: '0.113 / 0.103 / 0.378' },
            ],
            [
              { en: 'Tightly coupled, existing adaptive KF', zh: '紧耦合，已有自适应 KF' },
              { en: '2.572 / 3.008 / 11.577', zh: '2.572 / 3.008 / 11.577' },
              { en: '0.089 / 0.099 / 0.276', zh: '0.089 / 0.099 / 0.276' },
            ],
            [
              {
                en: 'Tightly coupled, proposed robust adaptive KF',
                zh: '紧耦合，本文提出的鲁棒自适应 KF',
              },
              { en: '1.099 / 1.522 / 9.307', zh: '1.099 / 1.522 / 9.307' },
              { en: '0.076 / 0.075 / 0.117', zh: '0.076 / 0.075 / 0.117' },
            ],
          ],
        },
        {
          kind: 'media',
          type: 'image',
          src: '/assets/real/gnss-error-plots.webp',
          mediaKind: 'capture',
          ratio: '1232 / 559',
          alt: {
            en: 'Two MATLAB figures plotting position error and velocity error against GPS time on the east, north and up axes, each subplot annotated with its RMS value.',
            zh: '两幅 MATLAB 图窗，分别绘制东、北、天三轴的定位误差与速度误差随 GPS 时间的变化，每个子图标注其 RMS 值。',
          },
          caption: {
            en: 'Error traces for one of the compared configurations, over GPS week 2032. The table reports the summary statistic; the traces show where it comes from — the east and north channels sit near zero with occasional sharp excursions, while the up channel is both larger and more persistent. A filter that only reduced the spikes without improving the baseline would produce a better RMS and a worse trajectory, which is why both views are kept.',
            zh: '对比配置之一在 GPS 第 2032 周的误差曲线。表格给出的是汇总统计量，而曲线显示它从何而来——东向与北向通道贴近零值、偶有尖锐跳变，天向通道则既更大也更持续。一个只削平尖峰而不改善基线的滤波器，会得到更好的 RMS 与更差的轨迹——这正是两种视图都保留的原因。',
          },
        },
        {
          kind: 'metrics',
          items: [
            {
              value: '−78%',
              provenance: 'measured',
              label: { en: 'Horizontal RMSE vs. GNSS only', zh: '水平 RMSE，相比纯 GNSS' },
              detail: { en: '5.099 m → 1.099 m on x', zh: 'x 轴：5.099 m → 1.099 m' },
            },
            {
              value: '−57%',
              provenance: 'measured',
              label: { en: 'vs. existing adaptive KF', zh: '相比已有自适应 KF' },
              detail: { en: '2.572 m → 1.099 m on x', zh: 'x 轴：2.572 m → 1.099 m' },
            },
            {
              value: '−69%',
              provenance: 'measured',
              label: { en: 'Vertical velocity RMSE', zh: '垂向速度 RMSE' },
              detail: { en: '0.378 → 0.117 m/s vs. standard TC', zh: '相比标准紧耦合：0.378 → 0.117 m/s' },
            },
          ],
        },
        {
          kind: 'prose',
          body: {
            en: 'The vertical channel stays the worst in every configuration, and that is expected rather than disappointing: satellite geometry constrains height far more weakly than it constrains the horizontal plane, and no filter recovers information the geometry never provided. The honest claim is the relative one — the same improvement is visible across all three axes and both state groups, which is what distinguishes a real estimator improvement from a tuning artefact.',
            zh: '在所有配置中，垂向通道始终是最差的——这是预期之中而非令人失望的：卫星几何对高程的约束远弱于对水平面的约束，而没有任何滤波器能恢复几何本就未提供的信息。诚实的论断是相对意义上的——同样的改善在三个轴向与两组状态量上一致出现，这正是真实的估计器改进与调参假象之间的区别。',
          },
        },
      ],
    },
    {
      id: 'reflection',
      title: { en: 'What I would change', zh: '如果重来' },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'The evaluation rests on one recorded trajectory. That is enough to show the method works and not enough to characterise when it does not. If I ran this again the first thing I would build is a scenario set — urban canyon, open sky, dense foliage, a deliberate outage — because the interesting question about a robust filter is not how much better it is on average, but which specific conditions defeat it.',
            zh: '整个评测建立在一条实录轨迹之上。这足以证明方法有效，却不足以刻画它何时失效。如果重做一次，我首先要构建的是一套场景集——城市峡谷、开阔天空、茂密植被、以及一次刻意制造的失锁——因为关于鲁棒滤波器真正有趣的问题，不是它平均好多少，而是哪些具体条件会击败它。',
          },
        },
      ],
    },
  ],
};
