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
          en: 'Speech and hospital records become typed, timestamped evidence spans before generation — so any answer resolves to the second of audio or the record field that produced it.',
          zh: '语音与医院信息在生成前先成为带类型、带时间戳的证据片段——于是任何一条回答都能追溯到产生它的那一秒音频或那个信息字段。',
        },
      },
    ],
    points: [
      {
        label: { en: 'Make the failure unrepresentable', zh: '让失效无法被表示' },
        body: {
          en: 'An answer with an empty evidence list cannot be serialised, and the intent enum has no diagnosis member — so a diagnostic answer has nowhere to live. That moves two failure classes from "detect and alert" to "impossible", the only move that scales in a safety-relevant system.',
          zh: '证据列表为空的回答无法被序列化，而 intent 枚举中没有"诊断"这一项——诊断性回答因此无处容身。这把两类失效从"检测并告警"搬到了"不可能发生"，在安全相关的系统里，这是唯一可扩展的做法。',
        },
      },
      {
        label: {
          en: 'Escalation needs a UI, not an error path',
          zh: '转人工需要界面，而不是错误分支',
        },
        body: {
          en: 'Apologising and stopping tested worse than a wrong answer: it leaves the patient exactly where they started, still in the queue. Escalation is now a visible hand-off — "I cannot answer that, here is the desk that can, and here is what I already recorded."',
          zh: '道歉然后停下，测试效果比给出错误答案更差：患者还停在原地，仍在排队。现在转人工是一次可见的交接——"这个问题我无法回答，能回答的是这个窗口，以及我已经为你记录好的内容。"',
        },
      },
      {
        label: { en: 'Provenance beats representational power', zh: '来源可溯胜过表示能力' },
        body: {
          en: 'A jointly trained encoder would almost certainly score better. But once an answer is a vector you cannot say which record produced it or when that record was last correct — and a department that moved last month is exactly the staleness that makes a confident answer harmful.',
          zh: '联合训练的编码器几乎肯定分数更高。但一旦回答变成向量，你就无法说出它来自哪条记录、那条记录最后一次正确是在何时——而一个上个月刚搬走的科室，正是那种会让自信回答变得有害的过期性。',
        },
      },
    ],
    projectSlugs: ['clinical-multimodal-agent'],
    tone: 'plain',
  },
];
