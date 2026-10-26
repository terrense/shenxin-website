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
  // TODO(content): Chinese name pending confirmation — deliberately left as
  // the Latin form rather than guessing at characters, since a wrong name is
  // worse than an untranslated one.
  name: { en: 'Xin Shen', zh: 'Xin Shen' } satisfies L,
  role: { en: 'AI Systems Engineer', zh: 'AI 系统工程师' } satisfies L,
  location: { en: 'China · Remote-friendly', zh: '中国 · 支持远程' } satisfies L,
  email: 'slamshenxin@gmail.com',

  /** The one sentence someone should remember. */
  headline: {
    en: 'I build AI systems that have to survive contact with the physical world.',
    zh: '我构建必须经得起物理世界考验的 AI 系统。',
  } satisfies L,

  statement: {
    en: 'Four years across agentic runtimes, reinforcement-learning post-training, robot manipulation and multimodal clinical AI. I work at the seam where a model stops being a benchmark number and starts being a system with latency budgets, failure modes and people depending on it.',
    zh: '四年间横跨 Agent 运行时、强化学习后训练、机器人操作与医疗多模态 AI。我的工作发生在那个接缝处——模型不再只是一个榜单分数，而成为一个有延迟预算、有失效模式、有人依赖它的系统。',
  } satisfies L,

  /** Hero stat rail. Keep to four; they should be defensible. */
  stats: [
    {
      value: '6',
      provenance: 'spec',
      countTo: 6,
      label: { en: 'Systems documented', zh: '系统案例' },
      detail: { en: 'Simulation to deployed hardware', zh: '从仿真到真机部署' },
    },
    {
      value: '4',
      provenance: 'spec',
      countTo: 4,
      label: { en: 'Domains', zh: '技术领域' },
      detail: {
        en: 'Agentic · RL · Robotics · Multimodal',
        zh: 'Agent · RL · 机器人 · 多模态',
      },
    },
    {
      value: '8ms',
      provenance: 'spec',
      label: { en: 'Control loop', zh: '控制周期' },
      detail: { en: 'Real-time arm feedback, CR-series', zh: 'CR 系列机械臂实时反馈' },
    },
    {
      value: '450M',
      provenance: 'spec',
      label: { en: 'Smallest useful VLA', zh: '最小可用 VLA' },
      detail: { en: 'SmolVLA, trainable on one consumer GPU', zh: 'SmolVLA，单消费级显卡可训' },
    },
  ] satisfies Metric[],

  /** Rotating roles under the hero headline. */
  rotating: [
    { en: 'agentic runtimes', zh: 'Agent 运行时' },
    { en: 'RL post-training', zh: '强化学习后训练' },
    { en: 'robot manipulation', zh: '机器人操作' },
    { en: 'sim-to-real transfer', zh: 'Sim-to-Real 迁移' },
    { en: 'multimodal clinical AI', zh: '医疗多模态 AI' },
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
    { id: 'work', label: { en: 'Work', zh: '项目' } },
    { id: 'agentic', label: { en: 'Agentic & RL', zh: 'Agent 与 RL' } },
    { id: 'robotics', label: { en: 'Robotics', zh: '机器人' } },
    { id: 'healthcare', label: { en: 'Healthcare', zh: '医疗 AI' } },
    { id: 'research', label: { en: 'Research', zh: '研究' }, requires: 'publications' },
    { id: 'writing', label: { en: 'Writing', zh: '写作' }, requires: 'articles' },
    { id: 'about', label: { en: 'About', zh: '关于' } },
  ];

export const navSections = allNavSections.filter((item) => {
  if (item.requires === 'publications') return publications.length > 0;
  if (item.requires === 'articles') return articles.length > 0;
  return true;
});

export const domainLabels: Record<Domain, L> = {
  agentic: { en: 'Agentic AI', zh: 'Agent 系统' },
  rl: { en: 'Reinforcement Learning', zh: '强化学习' },
  robotics: { en: 'Robotics', zh: '机器人' },
  embodied: { en: 'Embodied AI', zh: '具身智能' },
  healthcare: { en: 'Healthcare AI', zh: '医疗 AI' },
  infra: { en: 'Systems & Infra', zh: '系统与基础设施' },
};

/** Grouped capability matrix for the About section. */
export const capabilities: Array<{ group: L; items: string[] }> = [
  {
    group: { en: 'Post-training & RL', zh: '后训练与强化学习' },
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
    group: { en: 'Agentic systems', zh: 'Agent 系统' },
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
    group: { en: 'Robotics', zh: '机器人' },
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
    group: { en: 'Serving & infra', zh: '推理与基础设施' },
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
    title: { en: 'Embodied AI & VLA policies', zh: '具身智能与 VLA 策略' },
    body: {
      en: 'Benchmarking vision-language-action policies against real hardware limits, and closing the loop between Isaac Lab scenes and a physical arm.',
      zh: '在真实硬件约束下评测视觉-语言-动作策略，并把 Isaac Lab 场景与物理机械臂闭环打通。',
    },
  },
  {
    period: '2024 — 2025',
    title: { en: 'LLM post-training, end to end', zh: '大模型后训练全链路' },
    body: {
      en: 'Built the full chain in-house: data curation, SFT, reward modelling, preference optimisation, evaluation and serving — with reproducibility as a hard requirement.',
      zh: '自建完整链路：数据治理、SFT、奖励建模、偏好优化、评测与推理部署——可复现性是硬性要求。',
    },
  },
  {
    period: '2023 — 2024',
    title: { en: 'Field robotics', zh: '田间机器人' },
    body: {
      en: 'Perception, decision and manipulation for an agricultural robot that had to work in sunlight, dust and wind — not in a lab.',
      zh: '为农业机器人构建感知、决策与操作系统——工作环境是阳光、灰尘与风，而不是实验室。',
    },
  },
];
