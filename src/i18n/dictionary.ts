import type { L } from '@/content/types';

/**
 * UI chrome strings only. Everything that is *content* lives in src/content.
 * Keys are flat and namespaced with dots so missing keys are obvious.
 */
export const ui = {
  'nav.skip': { en: 'Skip to content', zh: '跳到主要内容' },
  'nav.menu': { en: 'Menu', zh: '菜单' },
  'nav.close': { en: 'Close menu', zh: '关闭菜单' },
  'nav.home': { en: 'Home', zh: '首页' },
  'nav.allWork': { en: 'All work', zh: '全部项目' },
  'nav.lang': { en: 'Language', zh: '语言' },
  'nav.langSwitch': { en: 'Switch to Chinese', zh: 'Switch to English' },

  'hero.eyebrow': { en: 'Portfolio · AI Systems', zh: '作品集 · AI 系统' },
  'hero.working': { en: 'Currently working on', zh: '当前专注于' },
  'hero.cta.work': { en: 'See the work', zh: '查看项目' },
  'hero.cta.contact': { en: 'Get in touch', zh: '联系我' },
  'hero.scroll': { en: 'Scroll', zh: '向下滚动' },
  'hero.canvasAlt': {
    en: 'Decorative animated network of nodes and connections.',
    zh: '装饰性的节点与连线动画网络。',
  },

  'work.eyebrow': { en: '01 — Selected work', zh: '01 — 精选项目' },
  'work.title': { en: 'Systems, not demos', zh: '系统，而非演示' },
  'work.lede': {
    en: 'Six systems I can defend end to end — what the constraint was, what I chose, what it cost, and what it actually measured.',
    zh: '六个我能从头到尾讲清楚的系统——约束是什么、我如何选择、代价是什么、实测结果如何。',
  },
  'work.readCase': { en: 'Read case study', zh: '阅读案例' },
  'work.viewAll': { en: 'View all projects', zh: '查看全部项目' },
  'work.filter': { en: 'Filter by domain', zh: '按领域筛选' },
  'work.all': { en: 'All', zh: '全部' },
  'work.empty': { en: 'No projects in this domain yet.', zh: '该领域暂无项目。' },
  'work.count': { en: 'projects', zh: '个项目' },

  'agentic.eyebrow': {
    en: '02 — Agentic AI & Reinforcement Learning',
    zh: '02 — Agent 与强化学习',
  },
  'agentic.title': { en: 'Post-training, end to end', zh: '后训练全链路' },
  'agentic.lede': {
    en: 'A base model is a starting point. Everything that makes it useful — preference data, reward shaping, policy optimisation, evaluation you can trust — is engineering.',
    zh: '基座模型只是起点。真正让它可用的部分——偏好数据、奖励设计、策略优化、可信评测——都是工程问题。',
  },
  'agentic.diagramHint': {
    en: 'Select a stage to inspect it',
    zh: '点击任一阶段查看详情',
  },

  'robotics.eyebrow': { en: '03 — Robotics & Embodied AI', zh: '03 — 机器人与具身智能' },
  'robotics.title': { en: 'The loop that has to close', zh: '必须闭合的环路' },
  'robotics.lede': {
    en: 'In simulation, a bad transform is a visual glitch. On hardware it is a collision. Everything below exists because the gap between those two is where robotics actually lives.',
    zh: '在仿真里，一个错误的变换只是视觉问题；在真机上，它就是一次碰撞。下面这些工作之所以存在，正是因为机器人学真正活在这两者之间的落差里。',
  },

  'health.eyebrow': { en: '04 — Healthcare Multimodal AI', zh: '04 — 医疗多模态 AI' },
  'health.title': { en: 'Where being wrong is expensive', zh: '犯错代价高昂之处' },
  'health.lede': {
    en: 'Clinical AI is not a harder benchmark — it is a different contract. Abstention, provenance and auditability stop being nice-to-haves and become the feature.',
    zh: '医疗 AI 不是更难的榜单，而是另一种契约。拒答、来源可溯与可审计不再是加分项，而是核心功能。',
  },

  'research.eyebrow': { en: '05 — Research', zh: '05 — 研究' },
  'research.title': { en: 'Publications & talks', zh: '论文与演讲' },
  'research.lede': {
    en: 'Work written up for peer review, plus talks where I had to explain it out loud.',
    zh: '经同行评审的工作，以及需要当面讲清楚的演讲。',
  },
  'research.abstract': { en: 'Abstract', zh: '摘要' },
  'research.showAbstract': { en: 'Show abstract', zh: '展开摘要' },
  'research.hideAbstract': { en: 'Hide abstract', zh: '收起摘要' },
  'research.empty': {
    en: 'Publication list is being updated.',
    zh: '论文列表正在更新。',
  },

  'writing.eyebrow': { en: '06 — Technical writing', zh: '06 — 技术写作' },
  'writing.title': { en: 'Notes from the build', zh: '构建笔记' },
  'writing.lede': {
    en: 'Debugging write-ups and architecture notes. Mostly the things I wish someone had written before I lost a week to them.',
    zh: '调试记录与架构笔记。大多是我希望在浪费掉一周之前就有人写下来的东西。',
  },
  'writing.read': { en: 'Read', zh: '阅读' },
  'writing.minutes': { en: 'min read', zh: '分钟阅读' },
  'writing.unpublished': { en: 'Unpublished', zh: '未发布' },

  'about.eyebrow': { en: '07 — About', zh: '07 — 关于' },
  'about.title': { en: 'How I work', zh: '我的工作方式' },
  'about.capabilities': { en: 'Capabilities', zh: '技术能力' },
  'about.timeline': { en: 'Trajectory', zh: '经历' },

  'contact.eyebrow': { en: '08 — Contact', zh: '08 — 联系' },
  'contact.title': { en: "Let's build something that ships", zh: '一起做能落地的东西' },
  'contact.lede': {
    en: 'Open to roles and collaborations in agentic systems, RL post-training and embodied AI. The fastest route is email.',
    zh: '欢迎在 Agent 系统、RL 后训练与具身智能方向的合作与机会。邮件是最快的方式。',
  },
  'contact.email': { en: 'Email me', zh: '发送邮件' },
  'contact.copy': { en: 'Copy address', zh: '复制地址' },
  'contact.copied': { en: 'Copied', zh: '已复制' },
  'contact.responseTime': { en: 'Usually replies within two days', zh: '通常两天内回复' },

  'case.back': { en: 'All projects', zh: '全部项目' },
  'case.overview': { en: 'Overview', zh: '概览' },
  'case.contents': { en: 'Contents', zh: '目录' },
  'case.role': { en: 'Role', zh: '角色' },
  'case.period': { en: 'Period', zh: '周期' },
  'case.stack': { en: 'Stack', zh: '技术栈' },
  'case.links': { en: 'Links', zh: '链接' },
  'case.next': { en: 'Next project', zh: '下一个项目' },
  'case.prev': { en: 'Previous project', zh: '上一个项目' },
  'case.section.problem': { en: 'Problem', zh: '问题' },
  'case.section.architecture': { en: 'System architecture', zh: '系统架构' },
  'case.section.decisions': { en: 'Engineering decisions', zh: '工程决策' },
  'case.section.experiments': { en: 'Experiments', zh: '实验' },
  'case.section.results': { en: 'Results', zh: '结果' },
  'case.section.demo': { en: 'Demo', zh: '演示' },
  'case.section.reflection': { en: 'What I would change', zh: '如果重来' },

  'status.shipped': { en: 'Shipped', zh: '已交付' },
  'status.active': { en: 'Active', zh: '进行中' },
  'status.research': { en: 'Research', zh: '研究中' },
  'status.archived': { en: 'Archived', zh: '已归档' },

  'link.repo': { en: 'Repository', zh: '代码仓库' },
  'link.demo': { en: 'Live demo', zh: '在线演示' },
  'link.paper': { en: 'Paper', zh: '论文' },
  'link.video': { en: 'Video', zh: '视频' },
  'link.doc': { en: 'Write-up', zh: '文档' },
  'link.external': { en: 'Open', zh: '打开' },

  'callout.insight': { en: 'Insight', zh: '洞察' },
  'callout.warning': { en: 'Trap', zh: '陷阱' },
  'callout.note': { en: 'Note', zh: '备注' },

  'motion.reduced': { en: 'Reduced motion is on', zh: '已启用减弱动态效果' },

  'provenance.illustrative': { en: 'est.', zh: '估算' },
  'provenance.illustrativeHelp': {
    en: 'Illustrative figure — a plausible placeholder pending measurement, not an experimental result.',
    zh: '示意性数值——待实测的合理占位，并非实验结果。',
  },
  'provenance.note': {
    en: 'Figures marked “est.” are illustrative placeholders pending measurement, not experimental results. Unmarked figures are measured values or hardware specifications.',
    zh: '标注“估算”的数值为待实测的示意性占位，并非实验结果。未标注的数值为实测值或硬件规格。',
  },

  'media.concept': { en: 'Concept visualization', zh: '概念示意图' },
  'media.conceptHelp': {
    en: 'Generated illustration of the system concept — not a screenshot of the running system.',
    zh: '系统概念的生成式示意图——并非实际运行系统的截图。',
  },

  '404.title': { en: 'Route not found', zh: '页面不存在' },
  '404.body': {
    en: 'That path does not resolve. The project index is probably what you want.',
    zh: '该路径无法解析。你大概想找的是项目索引页。',
  },

  'footer.built': {
    en: 'Built with React, TypeScript and Vite. Statically hosted, no tracking.',
    zh: '使用 React、TypeScript 与 Vite 构建。静态托管，无任何追踪。',
  },
  'footer.rights': { en: 'All rights reserved.', zh: '保留所有权利。' },
  'footer.top': { en: 'Back to top', zh: '返回顶部' },
} satisfies Record<string, L>;

export type UIKey = keyof typeof ui;
