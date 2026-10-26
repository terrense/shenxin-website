import type { SectionTone } from '@/components/primitives/Section';
import type { DiagramId, L } from './types';

/**
 * The three domain deep-dive sections on the home page.
 *
 * Each one pairs an interactive diagram with three claims I can defend, and
 * links to the case studies that back them up. Keep the claims specific — a
 * generic "experienced with RL" line is worth less than no line at all.
 */
export type DomainSection = {
  id: 'agentic' | 'robotics' | 'healthcare';
  /** Dictionary key prefix for eyebrow/title/lede. */
  copyKey: 'agentic' | 'robotics' | 'health';
  /**
   * One or more diagrams. A single entry renders without tabs; two or more
   * render a tab strip using each entry's `label`.
   */
  diagrams: Array<{ id: DiagramId; label: L; caption: L }>;
  points: Array<{ label: L; body: L }>;
  /** Case studies to surface at the bottom of the section. */
  projectSlugs: string[];
  /** Surface for this band. Alternate so adjacent sections never match. */
  tone: SectionTone;
};

export const domainSections: DomainSection[] = [
  {
    id: 'agentic',
    copyKey: 'agentic',
    diagrams: [
      {
        id: 'post-training',
        label: { en: 'Post-training chain', zh: '后训练链路' },
        caption: {
          en: 'Stages communicate only through an artifact manifest, so a failed GRPO run never means re-running SFT.',
          zh: '阶段之间只通过产物 manifest 通信，因此 GRPO 跑失败绝不意味着要重跑 SFT。',
        },
      },
      {
        id: 'agent-runtime',
        label: { en: 'Agent runtime', zh: 'Agent 运行时' },
        caption: {
          en: 'One turn through a runtime built around a replayable trace store.',
          zh: '一轮在以可回放轨迹存储为核心的运行时中的流动。',
        },
      },
    ],
    points: [
      {
        label: { en: 'Reproducibility is a hard requirement', zh: '可复现性是硬性要求' },
        body: {
          en: 'Every checkpoint resolves back to a data hash, a config file and a code commit in one command. Before that contract existed, "where did this checkpoint come from?" was a half-day archaeology exercise, asked roughly weekly.',
          zh: '每个 checkpoint 都能用一条命令追溯到数据哈希、配置文件与代码 commit。在这个契约存在之前，"这个 checkpoint 是怎么来的？"是半天的考古工作，而它大约每周被问一次。',
        },
      },
      {
        label: {
          en: 'Generation and training want different machines',
          zh: '生成与训练需要不同的机器',
        },
        body: {
          en: 'Rollout collection on the training engine is latency-bound and leaves GPUs idle. Moving it to a dedicated vLLM worker with continuous batching turned the bottleneck into background work, at the cost of a per-iteration weight sync.',
          zh: '在训练引擎上采集 rollout 受延迟主导，还让 GPU 空转。把它迁到带连续批处理的专用 vLLM worker，把瓶颈变成了后台工作，代价是每轮一次权重同步。',
        },
      },
      {
        label: { en: 'Build the eval harness first', zh: '先建评测框架' },
        body: {
          en: 'I built it third, after SFT and the reward model, and spent two months tuning against a ruler I had not calibrated. The eval suite is the instrument; it goes before any training run, even if all it can score is the base model.',
          zh: '我把它排在第三位——在 SFT 与奖励模型之后——于是花了两个月对着一把没校准的尺子调参。评测套件是仪器；它应排在任何训练之前，哪怕一开始只能给基座模型打分。',
        },
      },
    ],
    projectSlugs: ['post-training-pipeline', 'lilbot'],
    tone: 'plain',
  },
  {
    id: 'robotics',
    copyKey: 'robotics',
    diagrams: [
      {
        id: 'field-pipeline',
        label: { en: 'Field data path', zh: '田间数据通路' },
        caption: {
          en: "The field robot's data path. Four OS processes over a zero-copy shared-memory bus; control holds a safe pose the moment perception goes stale.",
          zh: '田间机器人的数据通路。四个操作系统进程跑在零拷贝共享内存总线上；感知一过期，控制立刻保持安全位姿。',
        },
      },
      {
        id: 'sim2real',
        label: { en: 'Sim-to-real loop', zh: 'Sim-to-Real 环路' },
        caption: {
          en: 'Simulation earned its place not for policy learning but for regression-testing collisions that are unsafe to reproduce on hardware.',
          zh: '仿真真正的价值不在策略学习，而在于为那些在真机上复现不安全的碰撞场景做回归测试。',
        },
      },
      {
        id: 'eye-in-hand',
        label: { en: 'Hand-eye chain', zh: '手眼变换链' },
        caption: {
          en: 'T_tool_camera is the unknown. A static board makes T_base_board constant, which is the constraint that closes the system.',
          zh: 'T_tool_camera 是未知量。静止的标定板使 T_base_board 恒定，而这正是闭合方程的约束。',
        },
      },
    ],
    points: [
      {
        label: {
          en: 'Failure cost is asymmetric — design for it',
          zh: '失效代价不对称——按它来设计',
        },
        body: {
          en: 'A missed berry costs nothing; cutting the peduncle destroys the cluster. Every threshold in the system is tuned around that, which makes the robot deliberately and measurably timid.',
          zh: '漏剪一粒果没有代价；剪断果梗毁掉整串。系统里每个阈值都是围绕这一点来调的，这让机器人成为刻意的、可量化的保守。',
        },
      },
      {
        label: { en: 'Staleness checks belong downstream', zh: '过期判定属于下游' },
        body: {
          en: 'Control validates the age of its inputs and holds position past 120 ms, rather than trusting the publisher to report health. A process that has crashed cannot tell you it has crashed.',
          zh: '控制进程自己校验输入的时效、超过 120 ms 就保持位姿，而不是指望发布端报告健康状态。已经崩掉的进程没法告诉你它崩了。',
        },
      },
      {
        label: { en: 'A logged failure is a test case', zh: '被记录的失效才是测试用例' },
        body: {
          en: 'Synchronised frames, 125 Hz arm state and scored target lists on every run. Before the replay harness existed, every field failure was a story told from memory — which is an argument, not a test.',
          zh: '每次运行都记录同步图像、125 Hz 机械臂状态与带评分的目标列表。在回放框架存在之前，每次田间失效都只是凭记忆讲述的故事——那是争论，不是测试。',
        },
      },
    ],
    projectSlugs: ['grape-thinning-robot', 'vla-lab', 'eye-in-hand-calibration'],
    tone: 'band',
  },
  {
    id: 'healthcare',
    copyKey: 'health',
    diagrams: [
      {
        id: 'clinical-fusion',
        label: { en: 'Evidence pipeline', zh: '证据流水线' },
        caption: {
          en: 'Modalities become typed, timestamped evidence spans before generation — so any sentence resolves to the second of audio or the record field that produced it.',
          zh: '各模态在生成前先成为带类型、带时间戳的证据片段——于是任何一句话都能追溯到产生它的那一秒音频或那个病历字段。',
        },
      },
    ],
    points: [
      {
        label: { en: 'Make the failure unrepresentable', zh: '让失效无法被表示' },
        body: {
          en: 'A claim with an empty evidence list cannot be serialised, so "forgot to cite" never reaches a clinician. That moves a whole failure class from "detect and alert" to "impossible" — the only move that scales in a safety-relevant pipeline.',
          zh: '证据列表为空的陈述无法被序列化，因此"忘记引用"永远到不了医生面前。这把一整类失效从"检测并告警"搬到了"不可能发生"——在安全相关的流水线里，这是唯一可扩展的做法。',
        },
      },
      {
        label: {
          en: 'Abstention needs a UI, not an error path',
          zh: '拒答需要界面，而不是错误分支',
        },
        body: {
          en: 'Returning nothing for an uncertain field tested worse than a wrong answer: a blank field is indistinguishable from one nobody looked at. Abstentions are now a visible worklist — "I could not establish X, here is what I searched."',
          zh: '对不确定的字段返回空值，测试效果比给出错误答案更差：空字段和没人看过的字段无法区分。现在拒答是一份可见的待办清单——"我无法确认 X，以下是我检索过的内容。"',
        },
      },
      {
        label: { en: 'Provenance beats representational power', zh: '来源可溯胜过表示能力' },
        body: {
          en: 'A jointly trained multimodal encoder would almost certainly score better. But once a claim is a vector you cannot say which modality produced it — and the requirement here is not "be accurate", it is "be answerable".',
          zh: '联合训练的多模态编码器几乎肯定分数更高。但一旦一条陈述变成向量，你就无法说出它来自哪个模态——而这里的要求不是"准确"，而是"可被问责"。',
        },
      },
    ],
    projectSlugs: ['clinical-multimodal-agent'],
    tone: 'plain',
  },
];
