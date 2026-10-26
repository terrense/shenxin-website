import type { Project } from '../types';

export const humanRobotCollaboration: Project = {
  slug: 'human-robot-collaboration',
  title: {
    en: 'Vision-Guided Human–Robot Collaboration',
    zh: '视觉引导的人机协作',
  },
  tagline: {
    en: 'A robot that knows which tool is in your hand before you ask',
    zh: '在你开口之前就知道你手里拿着哪把工具的机器人',
  },
  summary: {
    en: 'Perception for a collaborative cell built around a KUKA LBR iiwa 14 handing medical instruments to an operator: detecting people, recognising and tracking the tool in the operator’s hand under occlusion, and supervising the workspace with RGB-D so the safety logic reasons about one consistent scene.',
    zh: '面向协作单元的感知系统——该单元以 KUKA LBR iiwa 14 向操作者递送医疗器械：检测人员、在遮挡条件下识别并跟踪操作者手中的工具，并以 RGB-D 监督工作空间，使安全逻辑面对的是一个一致的场景。',
  },
  domain: 'robotics',
  alsoIn: ['embodied'],
  period: '2022 — 2024',
  role: {
    en: 'Researcher — perception, with the Bauman collaborative robotics group',
    zh: '研究员 — 感知方向，鲍曼协作机器人课题组',
  },
  status: 'shipped',
  accent: 'ember',
  stack: [
    'KUKA LBR iiwa 14',
    'YOLOv5',
    'Attention mechanisms',
    'RGB-D',
    'Object tracking',
    'PyTorch',
    'OpenCV',
    'ROS',
  ],
  highlights: [
    {
      value: '4',
      provenance: 'measured',
      countTo: 4,
      label: { en: 'Peer-reviewed papers', zh: '同行评审论文' },
      detail: { en: 'ICR 2023 · Stankin · Automation', zh: 'ICR 2023 · 斯坦金学报 · 《自动化》' },
    },
    {
      value: '1',
      provenance: 'spec',
      countTo: 1,
      label: { en: 'Camera supervising the cell', zh: '监督整个单元的相机数' },
      detail: { en: 'Single RGB-D, one coherent scene', zh: '单台 RGB-D，单一一致场景' },
    },
    {
      value: 'in-hand',
      provenance: 'spec',
      label: { en: 'Tool recognition', zh: '工具识别' },
      detail: { en: 'Attention-guided, under occlusion', zh: '注意力引导，适应遮挡' },
    },
  ],
  featured: false,
  span: 'cell',
  motif: 'scan',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题' },
      lede: {
        en: 'Collaboration means the robot has to predict, not just avoid.',
        zh: '协作意味着机器人必须预判，而不只是避让。',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'A caged industrial robot needs one thing from perception: is anyone inside the cage. A collaborative cell shares the workspace, and the bar is much higher — the robot has to know where the operator is, what they are doing, and what they are about to need. A system that only avoids people is safe and useless; it stops constantly and the operator switches it off.',
            zh: '一台被围栏隔开的工业机器人对感知只有一个要求：围栏里有没有人。协作单元共享工作空间，标准要高得多——机器人必须知道操作者在哪里、在做什么、接下来需要什么。一个只会避让的系统是安全而无用的：它会不断停机，然后操作者把它关掉。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The tool in the operator’s hand turns out to be an unusually good predictor of the next task step. It is also one of the hardest things to see: it is small, it is largely occluded by the hand holding it, and the hand is moving. That combination is what the attention-guided recogniser exists to handle.',
            zh: '事实证明，操作者手中的工具是下一步任务的异常有效的预测信号。它同时也是最难看清的目标之一：体积小、大部分被握持它的手遮挡，而手还在运动。注意力引导的识别器正是为应对这一组合而存在。',
          },
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'System architecture', zh: '系统架构' },
      blocks: [
        {
          kind: 'media',
          type: 'image',
          src: '/assets/real/collaborative-cell.webp',
          mediaKind: 'capture',
          ratio: '1513 / 741',
          alt: {
            en: 'Annotated photograph of the collaborative cell: a KUKA LBR iiwa 14 with a wrist-mounted RGB-D camera, a second RGB-D camera observing a tray of medical instruments, an operator wearing a microphone, and the experimenter workstation.',
            zh: '协作单元的标注照片：腕部装有 RGB-D 相机的 KUKA LBR iiwa 14、另一台观测医疗器械托盘的 RGB-D 相机、佩戴麦克风的操作者，以及实验员工作站。',
          },
          caption: {
            en: 'The cell as built. One RGB-D camera on the manipulator wrist, a second observing the instrument tray, the operator working inside the robot’s reach rather than behind a fence. The instruments are surgical — which is why "hand the right tool at the right moment" is the task, and why a confident wrong identification is not a harmless error. The operator’s face is masked in the source material.',
            zh: '实际搭建的工作单元。一台 RGB-D 相机位于机械臂腕部，另一台观测器械托盘，操作者在机器人可达范围之内作业，而非隔着围栏。这些是外科器械——这正是"在正确的时刻递上正确的工具"成为任务目标的原因，也是"自信的错误识别"并非无害失误的原因。原始素材中操作者面部已做遮挡处理。',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Moving-person detection', zh: '运动人员检测' },
              body: {
                en: 'A modified YOLOv5 detects people indoors. In this setting a missed detection is a safety event, not a metric regression — so the operating point is chosen for recall, and the cost of the resulting false positives is a brief slowdown rather than an injury.',
                zh: '改进的 YOLOv5 负责室内人员检测。在这个场景中，一次漏检是安全事件而非指标回退——因此工作点按召回率选取，由此带来的误检代价只是短暂减速，而不是伤害。',
              },
            },
            {
              label: { en: 'Attention-guided tool recognition', zh: '注意力引导的工具识别' },
              body: {
                en: 'An attention mechanism focuses the classifier on the hand-tool region rather than the whole frame, which is what makes recognition survive the occlusion caused by the grip itself.',
                zh: '注意力机制让分类器聚焦于手-工具区域而非整帧画面，正是这一点使识别能够抵抗握持本身造成的遮挡。',
              },
            },
            {
              label: { en: 'Tracking across the sequence', zh: '序列级跟踪' },
              body: {
                en: 'Single-frame classification is extended to tracking through an assembly sequence, so a momentary misread does not become a task-level error.',
                zh: '将单帧分类扩展为贯穿装配序列的跟踪，使一次瞬时误判不至于演变成任务级错误。',
              },
            },
            {
              label: { en: 'Single-camera supervision', zh: '单相机监督' },
              body: {
                en: 'One RGB-D camera observes operator, tools and robot together. Multiple sensors would give better coverage and a worse problem: three views that disagree about where the operator is, and safety logic forced to pick one.',
                zh: '单台 RGB-D 相机同时观测操作者、工具与机器人。多传感器能带来更好的覆盖，却带来更糟的问题：三个视角对操作者位置各执一词，而安全逻辑被迫从中选一。',
              },
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'insight',
          title: {
            en: 'One sensor, one scene',
            zh: '一个传感器，一个场景',
          },
          body: {
            en: 'The instinct in a safety system is to add sensors for redundancy. But redundancy only helps if you have a principled way to resolve disagreement, and at the time a resolution rule is needed — an operator partially occluded, two views in conflict — is exactly when getting it wrong matters most. A single well-placed camera gives one self-consistent scene, and the limits of that scene are known rather than negotiated.',
            zh: '安全系统的本能是增加传感器以获得冗余。但冗余只有在你拥有一套有原则的分歧消解机制时才有帮助——而真正需要这套规则的时刻（操作者被部分遮挡、两个视角相互冲突），恰恰也是判断失误代价最大的时刻。一台位置得当的相机给出的是一个自洽的场景，其边界是已知的，而不是被协商出来的。',
          },
        },
      ],
    },
    {
      id: 'results',
      title: { en: 'Results', zh: '结果' },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'The work produced four peer-reviewed publications across ICR 2023, Vestnik MSTU "Stankin" and Automation: Modern Technologies — covering person detection, attention-guided tool recognition, tracking through an assembly sequence, and the RGB-D supervisory system. Quantitative results live in those papers; they are deliberately not restated here, because a benchmark number copied out of context onto a portfolio page is the easiest kind of claim to get subtly wrong.',
            zh: '这项工作产出了四篇同行评审论文，分别发表于 ICR 2023、《斯坦金莫斯科国立技术大学学报》与《自动化：现代技术》——涵盖人员检测、注意力引导的工具识别、装配序列跟踪，以及 RGB-D 监督系统。定量结果载于论文之中，此处刻意不予复述：把一个基准数字脱离上下文搬到作品集页面上，是最容易在细微处出错的那类论断。',
          },
        },
      ],
    },
  ],
};
