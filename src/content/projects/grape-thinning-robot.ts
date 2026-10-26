import type { Project } from '../types';

export const grapeThinningRobot: Project = {
  slug: 'grape-thinning-robot',
  title: { en: 'Vineyard Thinning Robot', zh: '葡萄疏果机器人' },
  tagline: {
    en: 'Rust perception–decision–manipulation stack on a 6-DoF arm, in the field',
    zh: '基于 Rust 的感知-决策-操作栈，六轴机械臂，田间作业',
  },
  summary: {
    en: 'An agricultural robot that finds grape clusters, decides which berries to remove, and executes the cut with a 6-DoF arm — outdoors, in changing light, with no second chance at a cut. Built in Rust around a zero-copy IPC bus so perception, planning and control stay decoupled but hard real-time.',
    zh: '一台农业机器人：找到葡萄串、决定摘除哪些果粒、用六轴机械臂执行剪切——在户外、在变化的光照下，而且剪错没有第二次机会。用 Rust 围绕零拷贝 IPC 总线构建，使感知、规划与控制保持解耦的同时满足硬实时。',
  },
  domain: 'robotics',
  alsoIn: ['embodied', 'infra'],
  period: '2023 — 2025',
  role: { en: 'Systems architect & perception lead', zh: '系统架构与感知负责人' },
  status: 'shipped',
  accent: 'signal',
  stack: [
    'Rust',
    'iceoryx2',
    'ROS 2',
    'OpenCV',
    'DOBOT CR10A',
    'NVIDIA Isaac Lab',
    'ONNX Runtime',
    'TensorRT',
    'Jetson Orin',
  ],
  highlights: [
    {
      value: '8ms',
      provenance: 'spec',
      label: { en: 'Control feedback', zh: '控制反馈周期' },
      detail: { en: 'Real-time arm state, 125 Hz', zh: '机械臂实时状态，125 Hz' },
    },
    {
      value: '4',
      provenance: 'spec',
      countTo: 4,
      label: { en: 'Decoupled processes', zh: '解耦进程' },
      detail: {
        en: 'Perception · decision · navigation · control',
        zh: '感知 · 决策 · 导航 · 控制',
      },
    },
    {
      value: '0-copy',
      provenance: 'spec',
      label: { en: 'Inter-process frames', zh: '进程间图像传输' },
      detail: { en: 'Shared-memory image transport', zh: '共享内存图像通道' },
    },
  ],
  // TODO(content): add a repo or write-up link when one is public.
  featured: true,
  span: 'tall',
  motif: 'orbit',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题' },
      lede: {
        en: 'Thinning is a judgement task performed at speed, by hand, under a deadline.',
        zh: '疏果是一项需要快速判断、手工完成、且有时间窗压力的工作。',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'Table grapes need thinning: a cluster that sets too many berries produces small, crowded fruit that splits and rots. A skilled worker looks at a cluster, decides which berries to remove, and snips — a few seconds per cluster, thousands of clusters, inside a window of about two weeks. Labour for that window is increasingly hard to find.',
            zh: '鲜食葡萄需要疏果：一串坐果过多，会长出小而拥挤的果粒，容易裂果腐烂。熟练工人看一眼果串，判断该摘除哪些果粒，然后一剪——每串几秒，成千上万串，全部要压在大约两周的窗口期内完成。而这段窗口期的劳动力越来越难找。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The engineering problem is not the classifier. It is that every assumption a lab robot relies on is false in a vineyard. Lighting changes by the minute and goes from flat overcast to hard dappled shadow. Leaves move in wind, so the scene is non-static between perception and execution. The target is deformable, partially occluded by its own geometry, and close to structures you must not cut — trellis wire, canes, the stem holding the cluster up.',
            zh: '工程难点不在分类器，而在于：实验室机器人依赖的每一条假设，在葡萄园里都不成立。光照以分钟为单位变化，从阴天的平光到硬斑驳阴影。叶片随风移动，所以从感知到执行之间场景并非静态。目标本身可变形、被自身几何部分遮挡，并且紧邻绝不能剪断的结构——棚架钢丝、枝条、以及托着整串的果梗。',
          },
        },
        {
          kind: 'callout',
          tone: 'warning',
          title: { en: 'Asymmetric failure cost', zh: '失效代价不对称' },
          body: {
            en: 'A missed berry costs nothing — the next pass gets it. Cutting the peduncle destroys the entire cluster. Every threshold in the system is tuned around that asymmetry, which means the robot is deliberately, measurably timid.',
            zh: '漏剪一粒果没有代价——下一轮会补上。剪断果梗则毁掉整串。系统里每一个阈值都是围绕这种不对称来调的，这意味着这台机器人是刻意的、可量化的保守。',
          },
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'System architecture', zh: '系统架构' },
      lede: {
        en: 'Four processes, one shared-memory bus, no process able to stall another.',
        zh: '四个进程，一条共享内存总线，任何进程都无法拖垮另一个。',
      },
      blocks: [
        {
          kind: 'diagram',
          id: 'field-pipeline',
          caption: {
            en: 'Data path from stereo capture to gripper actuation. Hover a node for its budget.',
            zh: '从双目采集到夹爪执行的数据通路。悬停节点查看其时间预算。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The system is four independent OS processes — perception, decision engine, navigation, control — communicating over `iceoryx2`, a zero-copy shared-memory bus. That choice is the architectural core, so it is worth being precise about why. A 2-megapixel stereo pair at 30 fps is roughly 350 MB/s. Serialising that through a conventional message bus means a memcpy per hop and allocator pressure that shows up as jitter in a loop that must not jitter. With shared memory, perception writes the frame once and the consumers read the same pages.',
            zh: '系统由四个独立操作系统进程组成——感知、决策引擎、导航、控制——通过 `iceoryx2`（零拷贝共享内存总线）通信。这个选择是架构核心，所以值得说清理由。200 万像素双目、30 fps，大约是 350 MB/s。把它通过常规消息总线序列化，意味着每一跳一次 memcpy，以及分配器压力——这些会在一个不允许抖动的环路里表现为抖动。换成共享内存后，感知只写一次帧，消费者读的是同一批页面。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'Process isolation matters just as much. A perception crash — a bad CUDA state, a camera dropping off the bus — must not take the arm with it. Control runs its own loop against the arm controller and holds a safe pose when its upstream input goes stale. The staleness check is in the control process, not the publisher, because a publisher that has crashed cannot tell you it has crashed.',
            zh: '进程隔离同样重要。感知崩溃——CUDA 状态异常、相机掉线——绝不能把机械臂一起带走。控制进程针对控制柜跑自己的环路，当上游输入过期时保持安全位姿。过期判定写在控制进程里，而不是发布端，因为已经崩掉的发布端没法告诉你它崩了。',
          },
        },
        {
          kind: 'code',
          lang: 'rust',
          caption: {
            en: 'The staleness guard. Every consumer of a perception topic has one.',
            zh: '过期保护。每个感知话题的消费者都有一个。',
          },
          code: `/// Control runs at a fixed 125 Hz against the arm controller's 8 ms
/// feedback channel. Perception is best-effort and *allowed* to be late;
/// what is not allowed is acting on a stale world model.
const PERCEPTION_MAX_AGE: Duration = Duration::from_millis(120);

match targets.take_latest() {
    Some(sample) if sample.age() <= PERCEPTION_MAX_AGE => {
        self.track(sample.payload())
    }
    // Late or absent: hold, do not extrapolate. Extrapolating a berry
    // position into a 120 ms gap is how you cut a trellis wire.
    _ => {
        self.metrics.perception_stale.inc();
        self.hold_safe_pose()
    }
}`,
        },
      ],
    },
    {
      id: 'decisions',
      title: { en: 'Engineering decisions', zh: '工程决策' },
      blocks: [
        {
          kind: 'table',
          head: [
            { en: 'Decision', zh: '决策' },
            { en: 'Chosen', zh: '选择' },
            { en: 'Rejected', zh: '放弃' },
            { en: 'Why', zh: '原因' },
          ],
          rows: [
            [
              { en: 'Implementation language', zh: '实现语言' },
              { en: 'Rust for the control path', zh: '控制路径用 Rust' },
              { en: 'C++ throughout', zh: '全链路 C++' },
              {
                en: 'No GC pause, and the borrow checker eliminates the use-after-free class that is genuinely dangerous when the consequence is a moving arm.',
                zh: '没有 GC 停顿，而借用检查器消除了 use-after-free 这一类问题——当后果是一条正在运动的机械臂时，这类问题是真正危险的。',
              },
            ],
            [
              { en: 'IPC transport', zh: 'IPC 传输' },
              { en: 'iceoryx2 shared memory', zh: 'iceoryx2 共享内存' },
              { en: 'ROS 2 DDS for image topics', zh: '图像话题走 ROS 2 DDS' },
              {
                en: 'DDS stays for configuration and low-rate telemetry. Image-rate traffic through it added copies and tail latency we could not budget for.',
                zh: 'DDS 保留用于配置与低频遥测。但图像速率的数据走 DDS 带来了额外拷贝与长尾延迟，这是预算里装不下的。',
              },
            ],
            [
              { en: 'Depth source', zh: '深度来源' },
              { en: 'Stereo pair', zh: '双目相机' },
              { en: 'Active IR depth camera', zh: '主动红外深度相机' },
              {
                en: 'Projected-pattern sensors degrade badly in direct sunlight — exactly the condition this robot works in. Passive stereo on textured fruit held up.',
                zh: '结构光/主动红外在直射阳光下严重退化——而这正是这台机器人的工作条件。被动双目在有纹理的果实上表现稳定。',
              },
            ],
            [
              { en: 'Policy', zh: '策略' },
              { en: 'Classical planning + learned perception', zh: '经典规划 + 学习式感知' },
              { en: 'End-to-end learned policy', zh: '端到端学习策略' },
              {
                en: 'Learned perception is verifiable per-frame. A learned motion policy near a destructive failure mode is not something I could certify to the grower.',
                zh: '学习式感知可以逐帧验证。而紧邻一个破坏性失效模式的学习式运动策略，是我没法向种植者做出保证的。',
              },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'insight',
          title: { en: 'Simulation earned its keep late', zh: '仿真的价值来得很晚' },
          body: {
            en: 'I was initially sceptical of building a vineyard scene in Isaac Lab — it felt like modelling effort that would not transfer. It paid off not for policy learning but for obstacle-avoidance regression testing: the trellis-collision cases that are genuinely unsafe to reproduce on hardware became a suite we could run on every commit.',
            zh: '我起初对在 Isaac Lab 里搭葡萄园场景持怀疑态度——感觉是无法迁移的建模工作。它最终的回报不在策略学习，而在避障回归测试：那些在真机上复现确实不安全的棚架碰撞场景，变成了一套可以每次提交都跑的测试集。',
          },
        },
      ],
    },
    {
      id: 'experiments',
      title: { en: 'Experiments', zh: '实验' },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: "Field testing is expensive and seasonal, so the experiment design was built around getting the most from each session. Every run logged synchronised stereo frames, arm state at 125 Hz, and the decision engine's full target list with scores — so a failure seen once in the field could be replayed offline indefinitely.",
            zh: '田间测试昂贵且受季节限制，所以实验设计的目标是把每次出工的信息量榨到最大。每次运行都记录同步双目帧、125 Hz 的机械臂状态，以及决策引擎带评分的完整目标列表——这样田间只出现过一次的失效，也能在离线环境里无限次回放。',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Illumination sweep', zh: '光照扫描' },
              body: {
                en: 'The same twenty clusters captured at 07:00, 11:00, 14:00 and 18:00. Dappled midday shadow was by far the hardest condition, and drove a move to exposure bracketing on the perception camera.',
                zh: '同样二十串果实，在 07:00、11:00、14:00 与 18:00 各采集一次。正午斑驳阴影是最难的一档，这直接促使感知相机改用曝光包围。',
              },
            },
            {
              label: { en: 'Latency injection', zh: '延迟注入' },
              body: {
                en: 'Artificially delaying the perception topic in 20 ms steps to find where tracking breaks. The 120 ms staleness threshold comes from this, not from a guess.',
                zh: '以 20 ms 为步长人为延迟感知话题，找出跟踪失效的位置。120 ms 的过期阈值来自这个实验，而不是猜测。',
              },
            },
            {
              label: { en: 'Collision regression', zh: '碰撞回归' },
              body: {
                en: 'A simulated suite of trellis and cane geometries, run per-commit. Caught two planner regressions that would otherwise have been found by a bent gripper.',
                zh: '一套仿真的棚架与枝条几何测试集，每次提交都跑。抓到两次规划器回归——否则它们会以"夹爪被撞弯"的形式被发现。',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'results',
      title: { en: 'Results', zh: '结果' },
      blocks: [
        {
          kind: 'metrics',
          items: [
            {
              value: '<120ms',
              provenance: 'spec',
              label: { en: 'Perception-to-decision', zh: '感知到决策' },
              detail: { en: 'Enforced, not aspirational', zh: '强制约束，而非目标值' },
            },
            {
              value: '125Hz',
              provenance: 'spec',
              label: { en: 'Control loop', zh: '控制环频率' },
              detail: { en: 'Independent of perception health', zh: '不依赖感知是否健康' },
            },
            {
              value: '0',
              provenance: 'illustrative',
              label: { en: 'Peduncle cuts in trials', zh: '试验中剪断果梗次数' },
              detail: { en: 'The failure mode that mattered', zh: '真正要紧的那种失效' },
            },
          ],
        },
        {
          kind: 'prose',
          body: {
            en: 'The robot is slower than a skilled worker and will be for some time. That was never the near-term bar — the bar was operating unattended for a full row without a destructive mistake, and recovering gracefully from the ordinary chaos of an outdoor environment: a camera dropping out, a gust moving the canopy mid-approach, GPS degrading under the trellis.',
            zh: '这台机器人比熟练工人慢，而且短期内还会慢。但速度从来不是近期的衡量标准——标准是：在无人看管的情况下完整走完一行而不发生破坏性失误，并能从户外环境的日常混乱中优雅恢复：相机掉线、接近过程中一阵风吹动了树冠、棚架下 GPS 精度劣化。',
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
            en: 'I would build the replay harness in week one. We had it by month four, and the gap between those two dates is where most of the wasted time lives — every field failure before the harness existed was a story someone told from memory. A logged failure is a test case; a remembered failure is an argument.',
            zh: '我会在第一周就把回放框架搭好。我们是到第四个月才有的，而大部分被浪费的时间就躺在这两个日期之间——在框架存在之前，每一次田间失效都只是某人凭记忆讲述的故事。被记录下来的失效是一个测试用例；被记住的失效只是一场争论。',
          },
        },
      ],
    },
  ],
};
