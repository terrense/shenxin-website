import type { Project } from '../types';

export const visualSlam: Project = {
  slug: 'visual-slam',
  title: {
    en: 'Geometric & Semantic Visual SLAM',
    zh: '几何与语义融合的视觉 SLAM',
    ru: 'Визуальный SLAM: геометрия и семантика',
  },
  tagline: {
    en: 'Points, lines and object landmarks in one indoor map',
    zh: '点、线与物体级语义路标统一到同一张室内地图',
    ru: 'Точки, линии и объектные ориентиры в одной карте помещения',
  },
  summary: {
    en: 'Indoor localisation and mapping that combines point and line geometric features with object-level semantic landmarks, and replaces selected classical sub-modules with lightweight learned components. Doctoral research on the camera side of a camera/GPS/IMU navigation stack.',
    zh: '室内定位与建图：将点、线几何特征与物体级语义路标相结合，并用轻量化学习模块替换部分经典子模块。属于相机/GPS/IMU 导航栈中相机侧的博士研究工作。',
    ru: 'Локализация и картографирование в помещении: точечные и линейные геометрические признаки в сочетании с объектными семантическими ориентирами, а часть классических подмодулей заменена лёгкими обучаемыми компонентами. Диссертационная работа по камерной части навигационного стека камера/GPS/ИНС.',
  },
  domain: 'robotics',
  alsoIn: ['embodied'],
  period: '2022 — 2025',
  role: {
    en: 'Doctoral researcher — Bauman Moscow State Technical University',
    zh: '博士研究员 — 莫斯科鲍曼国立技术大学',
    ru: 'Аспирант — МГТУ им. Н. Э. Баумана',
  },
  status: 'research',
  accent: 'flux',
  stack: [
    'Visual SLAM',
    'Point & line features',
    'Semantic landmarks',
    'Visual-inertial odometry',
    'Camera/IMU calibration',
    'CNN',
    'C++',
    'ROS',
  ],
  highlights: [
    {
      value: '3',
      provenance: 'spec',
      countTo: 3,
      label: { en: 'Landmark types fused', zh: '融合的路标类型', ru: 'Типов ориентиров' },
      detail: {
        en: 'Points · lines · semantic objects',
        zh: '点 · 线 · 语义物体',
        ru: 'Точки · линии · семантические объекты',
      },
    },
    {
      value: 'VI',
      provenance: 'spec',
      label: { en: 'Sensor configuration', zh: '传感器配置', ru: 'Состав датчиков' },
      detail: {
        en: 'Monocular camera + IMU, calibrated',
        zh: '单目相机 + IMU，已标定',
        ru: 'Монокамера + ИНС, откалибровано',
      },
    },
    {
      value: 'indoor',
      provenance: 'spec',
      label: { en: 'Target environment', zh: '目标环境', ru: 'Целевая среда' },
      detail: { en: 'Where GNSS is unavailable', zh: 'GNSS 不可用的场景', ru: 'Там, где ГНСС недоступна' },
    },
  ],
  featured: true,
  span: 'cell',
  motif: 'lattice',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题' },
      lede: {
        en: 'Indoors there is no GNSS, and point features alone are a weak map.',
        zh: '室内没有 GNSS，而仅靠点特征构成的地图很脆弱。',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'The GNSS/INS work stops at the door. Indoors the satellite constraint disappears entirely and the inertial solution drifts without bound, so the camera has to carry localisation on its own. Classical visual SLAM does this with point features — corners tracked between frames — which works until the robot faces the surfaces that indoor environments are actually made of: blank walls, uniform floors, long corridors. Those scenes are rich in structure and poor in corners.',
            zh: 'GNSS/INS 的工作止步于门口。室内卫星约束完全消失，惯导解算会无界漂移，因此定位必须由相机独自承担。经典视觉 SLAM 依靠点特征——在帧间跟踪的角点——这在机器人面对室内环境真正由之构成的表面之前都还奏效：空白墙面、均质地板、长走廊。这些场景结构丰富，但角点匮乏。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'A blank corridor wall has almost no trackable points and several strong lines. A doorway has a semantic identity that persists across viewpoints where its individual corners do not. Using only one of the three representations means discarding information the scene is actively offering.',
            zh: '一面空白的走廊墙壁几乎没有可跟踪的点，却有若干条明显的直线。一个门框具有跨视角持续存在的语义身份，而它的各个角点并不具备这种持续性。只使用三种表示中的一种，等于主动丢弃场景正在提供的信息。',
          },
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'System architecture', zh: '系统架构' },
      blocks: [
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Point and line features', zh: '点与线特征' },
              body: {
                en: 'Lines are tracked alongside points so low-texture structured scenes still constrain the pose. A line is also a stronger constraint per observation — it fixes two rotational degrees of freedom where a point fixes a bearing.',
                zh: '直线与点同时被跟踪，使低纹理的结构化场景仍能约束位姿。就单次观测而言，直线也是更强的约束——它固定两个旋转自由度，而点只固定一个方位。',
              },
            },
            {
              label: { en: 'Object-level semantic landmarks', zh: '物体级语义路标' },
              body: {
                en: 'Recognised objects become map entities with identity, which is what makes loop closure survive a viewpoint change large enough to destroy raw descriptor matching.',
                zh: '被识别的物体成为具有身份的地图实体——正是这一点让回环检测能够在视角变化大到足以摧毁原始描述子匹配时依然成立。',
              },
            },
            {
              label: { en: 'Learned sub-modules', zh: '学习式子模块' },
              body: {
                en: 'Selected classical stages are replaced with lightweight networks rather than the pipeline being rewritten end-to-end. The classical geometry stays, because it is the part that is verifiable.',
                zh: '用轻量化网络替换部分经典阶段，而不是把整条流水线改写成端到端。经典几何部分被保留，因为那是可验证的部分。',
              },
            },
            {
              label: { en: 'Camera/IMU calibration', zh: '相机/IMU 标定' },
              body: {
                en: 'Intrinsic and extrinsic calibration is treated as part of the system, not a prerequisite someone else supplies. A wrong extrinsic is indistinguishable from a bad estimator until you look for it specifically.',
                zh: '内参与外参标定被视为系统的一部分，而不是由他人提供的前置条件。在你专门去查之前，一个错误的外参和一个糟糕的估计器是无法区分的。',
              },
            },
          ],
        },
        {
          kind: 'media',
          type: 'image',
          src: '/assets/real/plvins-rviz.webp',
          mediaKind: 'capture',
          ratio: '2048 / 1152',
          alt: {
            en: 'RViz visualising a point-line visual-inertial SLAM session, with red line landmarks, green point landmarks, the pose-graph trajectory, and two feature-tracker image panes.',
            zh: 'RViz 可视化点线视觉惯性 SLAM 运行过程：红色线路标、绿色点路标、位姿图轨迹，以及两个特征跟踪图像窗格。',
          },
          caption: {
            en: 'A live session. Red segments are line landmarks, green dots are point landmarks, and the black curve is the estimated pose-graph trajectory. The two panes on the left show what each tracker sees — the upper one matching lines across frames, the lower one points. The structure of the scene is carried almost entirely by the red.',
            zh: '一次实时运行。红色线段是线路标，绿色点是点路标，黑色曲线是估计出的位姿图轨迹。左侧两个窗格显示各跟踪器所见——上方跨帧匹配直线，下方匹配点。场景的结构几乎完全由红色部分承载。',
          },
        },
        {
          kind: 'media',
          type: 'image',
          src: '/assets/real/indoor-robot-platform.webp',
          mediaKind: 'capture',
          ratio: '1280 / 1042',
          alt: {
            en: 'A small four-wheeled indoor research robot carrying a spinning LiDAR, a camera, an onboard compute board and a battery on an open laser-cut chassis.',
            zh: '一台小型四轮室内研究机器人：开放式激光切割底盘上搭载旋转激光雷达、相机、板载计算单元与电池。',
          },
          caption: {
            en: 'The platform the work ran on. Deliberately open-frame: every cable is reachable, which matters when the thing you are debugging is an extrinsic calibration and you need to measure where a sensor physically sits.',
            zh: '承载这项工作的平台。刻意采用开放式结构：每根线缆都触手可及——当你要调试的是外参标定、需要实地量一个传感器究竟装在哪里时，这一点很重要。',
          },
        },
        {
          kind: 'callout',
          tone: 'note',
          title: { en: 'Scope', zh: '范围说明' },
          body: {
            en: 'This is doctoral research, evaluated on the indoor mobile-robot platform shown above. It is reported here as an investigation rather than a deployed product, and no benchmark numbers are claimed on this page.',
            zh: '这是在上图所示室内移动机器人平台上评测的博士研究工作。此处以研究探索的形式呈现，而非已部署的产品，本页也不声称任何基准测试数值。',
          },
        },
      ],
    },
    {
      id: 'experiments',
      title: { en: 'Experiments', zh: '实验' },
      lede: {
        en: 'Replacing a classical detector is only worth it if the keypoints are better placed.',
        zh: '替换经典检测器，只有在关键点分布更好时才值得。',
      },
      blocks: [
        {
          kind: 'media',
          type: 'image',
          src: '/assets/real/convpoint-vs-orb.webp',
          mediaKind: 'diagram',
          ratio: '1912 / 1086',
          alt: {
            en: 'A figure showing the ConvPoint encoder–decoder architecture on the left, and on the right the same indoor scene with ORB keypoints above and ConvPoint keypoints below.',
            zh: '左侧为 ConvPoint 编码器-解码器结构图，右侧为同一室内场景下 ORB（上）与 ConvPoint（下）的关键点分布对比。',
          },
          caption: {
            en: 'A shared encoder feeds two decoders — one producing interest points, one producing descriptors — the same role ORB and SURF play classically. The comparison on the right is the actual argument: ORB piles its keypoints onto the few high-contrast clusters in the scene, while ConvPoint spreads them across surfaces that have structure but little texture. Evenly distributed keypoints are what keeps the pose well-conditioned. (Figure labels are in Russian — it is reproduced from the original dissertation material.)',
            zh: '一个共享编码器接出两个解码器——一个输出兴趣点，一个输出描述子——承担 ORB 与 SURF 在经典方法中的角色。右侧的对比才是真正的论据：ORB 把关键点堆积在场景中少数高对比度区域，而 ConvPoint 将其分散到那些有结构但缺乏纹理的表面上。关键点分布均匀，才能让位姿求解保持良态。（图中标注为俄语——该图复现自原始学位论文材料。）',
          },
        },
      ],
    },
    {
      id: 'reflection',
      title: { en: 'What carried forward', zh: '延续下来的东西' },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'Two habits from this work show up in everything later. First, calibrate before you debug — a surprising share of "algorithm problems" are extrinsics. Second, keep the geometry classical and let learning handle perception: the learned part should produce observations you can verify, not decisions you have to trust.',
            zh: '这项工作留下的两个习惯贯穿了之后的一切。第一，先标定再调试——相当比例的"算法问题"其实是外参问题。第二，几何部分保持经典，让学习负责感知：学习出来的应该是你能验证的观测，而不是你只能选择相信的决策。',
          },
        },
      ],
    },
  ],
};
