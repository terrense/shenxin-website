import type { DiagramId } from '@/content/types';
import type { DiagramSpec } from './FlowDiagram';

/**
 * Diagram geometry.
 *
 * Coordinates are in each spec's own space (see `DiagramSpec`). Layouts are
 * single-row pipelines wherever the data flow is linear, because a straight
 * line is the clearest thing a diagram can be — the container scrolls
 * horizontally on narrow screens rather than wrapping into an S-shape that
 * nobody can follow.
 */

const postTraining: DiagramSpec = {
  width: 1100,
  height: 224,
  minWidth: 980,
  nodes: [
    {
      id: 'data',
      x: 10,
      y: 50,
      w: 150,
      h: 94,
      accent: 'signal',
      label: { en: 'Data curation', zh: '数据治理' },
      sub: { en: 'manifest + hash', zh: 'manifest + 哈希' },
      detail: {
        body: {
          en: 'Dedup, decontaminate against the eval sets, and pin a content hash. Nothing enters a training run without a hash, because a dataset that changed quietly is indistinguishable from a model that got worse.',
          zh: '去重、针对评测集做去污染、固定内容哈希。没有哈希的数据不得进入任何训练——因为一个被静默改动过的数据集，和一个变差了的模型，是无法区分的。',
        },
        takes: { en: 'Raw collections, preference logs', zh: '原始语料、偏好日志' },
        emits: { en: 'Sharded JSONL + manifest.json', zh: '分片 JSONL + manifest.json' },
        risk: {
          en: 'Eval leakage; silent dataset drift',
          zh: '评测集泄漏；数据集静默漂移',
        },
      },
    },
    {
      id: 'sft',
      x: 196,
      y: 50,
      w: 150,
      h: 94,
      accent: 'signal',
      label: { en: 'SFT', zh: '监督微调' },
      sub: { en: 'LoRA r=32', zh: 'LoRA r=32' },
      detail: {
        body: {
          en: 'Supervised fine-tune with sequence packing into 4096-token bins — about a third fewer steps at identical token throughput. Attention masks are rebuilt per bin; getting that wrong leaks context across samples.',
          zh: '监督微调，并把样本打包进 4096-token 的 bin——在相同 token 吞吐下步数减少约三分之一。注意力掩码按 bin 重建；写错会让上下文在样本间泄漏。',
        },
        takes: { en: 'Curated instruction data', zh: '经治理的指令数据' },
        emits: { en: 'Adapter weights + tokenizer', zh: 'Adapter 权重 + tokenizer' },
        risk: { en: 'Cross-sample attention leakage', zh: '跨样本注意力泄漏' },
      },
    },
    {
      id: 'rm',
      x: 382,
      y: 50,
      w: 150,
      h: 94,
      accent: 'flux',
      label: { en: 'Reward model', zh: '奖励模型' },
      sub: { en: 'Bradley–Terry', zh: 'Bradley–Terry' },
      detail: {
        body: {
          en: 'Initialised from the SFT checkpoint so the tokenizer and embeddings match — a mismatch here needs a remap and costs more than the training. Pairwise loss with a small margin.',
          zh: '从 SFT checkpoint 初始化，使 tokenizer 与嵌入对齐——这里不匹配就需要重映射，代价比训练本身更高。采用带小 margin 的 pairwise 损失。',
        },
        takes: { en: 'Pairwise preferences', zh: '成对偏好数据' },
        emits: { en: 'Scalar reward head', zh: '标量奖励头' },
        risk: {
          en: 'Length bias learned as quality',
          zh: '把长度偏好学成了质量偏好',
        },
      },
    },
    {
      id: 'grpo',
      x: 568,
      y: 50,
      w: 150,
      h: 94,
      accent: 'flux',
      label: { en: 'GRPO', zh: 'GRPO' },
      sub: { en: 'group = 8, KL 0.04', zh: 'group = 8, KL 0.04' },
      detail: {
        body: {
          en: 'Group-relative policy optimisation: no value network to tune or hold in memory, which is what makes single-node training fit. Rollouts come from a separate vLLM worker so the training GPUs never idle on generation.',
          zh: '组相对策略优化：无需调试或驻留价值网络，这正是单节点训练能装下的原因。Rollout 由独立的 vLLM worker 产生，使训练 GPU 不会因生成而空转。',
        },
        takes: { en: 'SFT policy + reward head', zh: 'SFT 策略 + 奖励头' },
        emits: { en: 'Optimised policy', zh: '优化后的策略' },
        risk: {
          en: 'Entropy collapse below KL 0.02',
          zh: 'KL 低于 0.02 时熵坍缩',
        },
      },
    },
    {
      id: 'eval',
      x: 754,
      y: 50,
      w: 150,
      h: 94,
      accent: 'ember',
      label: { en: 'Evaluation', zh: '评测' },
      sub: { en: 'pinned judge', zh: '固定版评判模型' },
      detail: {
        body: {
          en: 'Fixed prompts, fixed seeds, a locally pinned judge model and bootstrap confidence intervals. A judge that silently updates turns every historical number into fiction, which is why this one never moves without a version bump.',
          zh: '固定 prompt、固定种子、本地固定版本的评判模型，以及 bootstrap 置信区间。一个会静默更新的评判模型会把所有历史数字变成虚构——所以这个模型不升版本就绝不改动。',
        },
        takes: { en: 'Any checkpoint', zh: '任意 checkpoint' },
        emits: { en: 'Scores + CIs + length stats', zh: '分数 + 置信区间 + 长度统计' },
        risk: { en: 'Judge drift; single-number reporting', zh: '评判模型漂移；只报单一数字' },
      },
    },
    {
      id: 'serve',
      x: 940,
      y: 50,
      w: 150,
      h: 94,
      accent: 'signal',
      label: { en: 'Serving', zh: '推理部署' },
      sub: { en: 'vLLM', zh: 'vLLM' },
      detail: {
        body: {
          en: 'Merge adapters, quantise if the latency budget needs it, and re-run the eval suite against the served endpoint rather than the checkpoint. Serving-time regressions are real and the checkpoint will not show them.',
          zh: '合并 adapter，若延迟预算需要则量化，然后针对已部署的服务端点（而不是 checkpoint）重跑一遍评测。部署阶段的退化是真实存在的，而 checkpoint 看不出来。',
        },
        takes: { en: 'Final policy', zh: '最终策略' },
        emits: { en: 'OpenAI-compatible endpoint', zh: 'OpenAI 兼容端点' },
        risk: { en: 'Quantisation regressions unmeasured', zh: '量化引入的退化未被测量' },
      },
    },
  ],
  edges: [
    { from: 'data', to: 'sft' },
    { from: 'sft', to: 'rm' },
    { from: 'rm', to: 'grpo' },
    { from: 'grpo', to: 'eval' },
    { from: 'eval', to: 'serve' },
    {
      from: 'eval',
      to: 'data',
      kind: 'feedback',
      dashed: true,
      label: { en: 'failures → new data', zh: '失败样本 → 新数据' },
    },
  ],
};

const agentRuntime: DiagramSpec = {
  width: 1060,
  height: 400,
  minWidth: 900,
  nodes: [
    {
      id: 'turn',
      x: 10,
      y: 154,
      w: 170,
      h: 92,
      accent: 'signal',
      label: { en: 'Turn input', zh: '轮次输入' },
      sub: { en: 'user or schedule', zh: '用户或定时' },
      detail: {
        body: {
          en: 'A turn begins from a user message or a scheduled trigger. Either way it gets an id immediately, because the id is what every later artifact is filed under.',
          zh: '一轮从用户消息或定时触发开始。无论哪种，它都会立即获得一个 id——因为后续所有产物都以这个 id 归档。',
        },
        emits: { en: 'turn_id', zh: 'turn_id' },
      },
    },
    {
      id: 'planner',
      x: 230,
      y: 154,
      w: 170,
      h: 92,
      accent: 'flux',
      label: { en: 'Planner', zh: '规划器' },
      sub: { en: 'no tool output', zh: '看不到工具输出' },
      detail: {
        body: {
          en: 'Decides the next action from the goal and memory — and deliberately cannot see raw tool output. A planner that sees a failed tool result tends to rationalise it into a plausible-sounding success, which is the most common long-horizon failure I have observed.',
          zh: '根据目标与记忆决定下一步动作——并且刻意看不到原始工具输出。能看到失败工具结果的规划器，倾向于把它合理化成一个听起来可信的成功，这是我观察到的最常见的长程失效模式。',
        },
        takes: { en: 'Goal + memory reads', zh: '目标 + 记忆读取' },
        emits: { en: 'Typed action request', zh: '带类型的动作请求' },
        risk: { en: 'Rationalising failures as progress', zh: '把失败合理化为进展' },
      },
    },
    {
      id: 'executor',
      x: 450,
      y: 154,
      w: 170,
      h: 92,
      accent: 'flux',
      label: { en: 'Executor', zh: '执行器' },
      sub: { en: 'schema in / out', zh: '入参 / 出参校验' },
      detail: {
        body: {
          en: 'Validates arguments against the tool schema before the call and the result before it re-enters context. A tool returning malformed data fails at this boundary instead of poisoning the next three turns.',
          zh: '调用前依据工具 schema 校验参数，结果重新进入上下文前再校验一次。返回畸形数据的工具在这个边界失败，而不是污染接下来三轮。',
        },
        takes: { en: 'Action request', zh: '动作请求' },
        emits: { en: 'Validated observation', zh: '已校验的观测' },
        risk: { en: 'Unvalidated output entering context', zh: '未校验的输出进入上下文' },
      },
    },
    {
      id: 'tools',
      x: 670,
      y: 46,
      w: 170,
      h: 92,
      accent: 'signal',
      label: { en: 'Tools (MCP)', zh: '工具（MCP）' },
      sub: { en: 'portable contracts', zh: '可移植契约' },
      detail: {
        body: {
          en: 'Tools speak MCP rather than a bespoke plugin API, so anything written for this runtime works elsewhere. A private plugin format is a tax paid forever for a week of early convenience.',
          zh: '工具使用 MCP 而非自定义插件 API，因此为这个运行时写的东西在别处也能用。私有插件格式是为早期一周的便利而永久缴纳的税。',
        },
        emits: { en: 'Raw tool result', zh: '原始工具结果' },
      },
    },
    {
      id: 'memory',
      x: 670,
      y: 262,
      w: 170,
      h: 92,
      accent: 'ember',
      label: { en: 'Memory', zh: '记忆' },
      sub: { en: 'files + FTS', zh: '文件 + 全文索引' },
      detail: {
        body: {
          en: 'Durable memory is a directory of small markdown files indexed by SQLite FTS — human-readable, diffable, and unaffected by an embedding-model change. Assembly order is fixed and recorded, because replays showed results shift more with ordering than I expected.',
          zh: '持久记忆是一个目录，内含由 SQLite FTS 建索引的小 markdown 文件——人可读、可 diff，且不受更换嵌入模型影响。组装顺序是固定且被记录的，因为回放实验显示结果对顺序的敏感性超出预期。',
        },
        takes: { en: 'Write requests', zh: '写入请求' },
        emits: { en: 'Ordered memory slice', zh: '有序的记忆切片' },
        risk: { en: 'Non-deterministic assembly order', zh: '组装顺序非确定' },
      },
    },
    {
      id: 'trace',
      x: 880,
      y: 154,
      w: 170,
      h: 92,
      accent: 'signal',
      label: { en: 'Trace store', zh: '轨迹存储' },
      sub: { en: 'resolved prompts', zh: '已解析的 prompt' },
      detail: {
        body: {
          en: 'The architecture. Every turn appends an immutable record holding the fully-resolved prompt bytes — not the template — plus model id, sampling params, every tool call and the memory reads that informed it. A bug report becomes a trace id, and a trace id becomes a test case.',
          zh: '这就是整个架构。每一轮追加一条不可变记录，内含完全解析后的 prompt 字节——不是模板——加上模型 id、采样参数、每次工具调用，以及支撑这一轮的记忆读取。于是 bug 报告变成一个轨迹 id，而轨迹 id 变成一个测试用例。',
        },
        takes: { en: 'Everything, append-only', zh: '一切，仅追加' },
        emits: { en: 'Deterministic replay', zh: '确定性回放' },
        risk: { en: 'Logging templates instead of bytes', zh: '记录了模板而不是字节' },
      },
    },
  ],
  edges: [
    { from: 'turn', to: 'planner' },
    { from: 'planner', to: 'executor', label: { en: 'action', zh: '动作' } },
    { from: 'executor', to: 'tools' },
    { from: 'executor', to: 'memory' },
    { from: 'tools', to: 'trace' },
    { from: 'memory', to: 'trace' },
    {
      from: 'trace',
      to: 'planner',
      kind: 'feedback',
      label: { en: 'observation (validated)', zh: '观测（已校验）' },
    },
  ],
};

const eyeInHand: DiagramSpec = {
  width: 1020,
  height: 260,
  minWidth: 900,
  nodes: [
    {
      id: 'base',
      x: 10,
      y: 62,
      w: 190,
      h: 92,
      accent: 'signal',
      label: { en: 'Robot base', zh: '机器人基座' },
      sub: { en: 'world frame', zh: '世界坐标系' },
      detail: {
        body: {
          en: 'The fixed reference everything resolves into. Every transform in the codebase is named T_destination_source, so composition reads left to right and a reversed multiplication is visually obvious at review time.',
          zh: '一切最终归算到的固定参考系。代码库中每个变换都命名为 T_destination_source，于是复合运算从左到右读，乘反了在评审时一眼可见。',
        },
        emits: { en: 'T_base_tool (from encoders)', zh: 'T_base_tool（来自编码器）' },
      },
    },
    {
      id: 'flange',
      x: 280,
      y: 62,
      w: 190,
      h: 92,
      accent: 'signal',
      label: { en: 'Tool flange', zh: '末端法兰' },
      sub: { en: '30004 @ 8 ms', zh: '30004 @ 8 ms' },
      detail: {
        body: {
          en: 'Pose read from the controller real-time channel at 8 ms per frame. Capture only happens after the arm has come to a full stop — a pose sampled mid-motion carries a timestamp mismatch that looks exactly like calibration error.',
          zh: '位姿从控制柜实时通道读取，每帧 8 ms。只有在机械臂完全停稳后才采集——运动过程中采样的位姿带有时间戳错配，而它看起来和标定误差一模一样。',
        },
        takes: { en: 'Joint encoders', zh: '关节编码器' },
        emits: { en: 'T_base_tool', zh: 'T_base_tool' },
        risk: { en: 'Sampling before the arm settles', zh: '机械臂未停稳就采样' },
      },
    },
    {
      id: 'camera',
      x: 550,
      y: 62,
      w: 190,
      h: 92,
      accent: 'flux',
      label: { en: 'Stereo camera', zh: '双目相机' },
      sub: { en: 'T_tool_camera — unknown', zh: 'T_tool_camera — 待求' },
      detail: {
        body: {
          en: 'The quantity being solved for. Two MV-CS060-10UC heads mounted on the flange; the left is the hand-eye primary. Images are de-rotated at the capture boundary (left +90°, right −90°) so nothing downstream carries an orientation special case.',
          zh: '这就是要求解的量。两台 MV-CS060-10UC 安装在法兰上，左相机为手眼主相机。图像在采集边界完成旋转归一（左 +90°、右 −90°），使下游任何环节都不必处理朝向特例。',
        },
        emits: { en: 'Synchronised stereo pair', zh: '同步双目图像对' },
        risk: {
          en: 'Degenerate pose sets → low residual, wrong transform',
          zh: '退化位姿集 → 低残差、错变换',
        },
      },
    },
    {
      id: 'board',
      x: 820,
      y: 62,
      w: 190,
      h: 92,
      accent: 'ember',
      label: { en: 'Checkerboard', zh: '标定板' },
      sub: { en: '11×8, 20 mm', zh: '11×8，20 mm' },
      detail: {
        body: {
          en: 'Static in the world, so T_base_board is constant across every capture — which is exactly the constraint that makes the system solvable. Detected as 8×11 after de-rotation. All lengths are millimetres, converted once at the protocol edge.',
          zh: '在世界中静止，因此 T_base_board 在所有采集中保持恒定——正是这个约束让方程可解。旋转归一后按 8×11 检测。所有长度单位为毫米，仅在协议边界换算一次。',
        },
        emits: { en: 'T_camera_board (PnP)', zh: 'T_camera_board（PnP）' },
        risk: { en: 'Mixed units; partial corner detection', zh: '单位混用；角点检测不全' },
      },
    },
  ],
  edges: [
    { from: 'base', to: 'flange', label: { en: 'T_base_tool', zh: 'T_base_tool' } },
    { from: 'flange', to: 'camera', label: { en: 'T_tool_camera', zh: 'T_tool_camera' } },
    { from: 'camera', to: 'board', label: { en: 'T_camera_board', zh: 'T_camera_board' } },
    {
      from: 'board',
      to: 'base',
      kind: 'feedback',
      dashed: true,
      label: {
        en: 'T_base_board — constant, closes the loop',
        zh: 'T_base_board — 恒定，闭合方程',
      },
    },
  ],
};

const sim2real: DiagramSpec = {
  width: 1100,
  height: 236,
  minWidth: 960,
  nodes: [
    {
      id: 'scene',
      x: 10,
      y: 50,
      w: 180,
      h: 92,
      accent: 'flux',
      label: { en: 'Isaac Lab scene', zh: 'Isaac Lab 场景' },
      sub: { en: 'trellis + canopy', zh: '棚架 + 树冠' },
      detail: {
        body: {
          en: 'A modelled vineyard row. I was initially sceptical this would transfer, and for policy learning it mostly did not — its real value turned out to be regression testing collision cases that are genuinely unsafe to reproduce on hardware.',
          zh: '建模出的一行葡萄架。我起初怀疑它能否迁移，而对策略学习来说它基本没迁移——它真正的价值在于：为那些在真机上复现确实不安全的碰撞场景做回归测试。',
        },
        emits: { en: 'Scenes + ground-truth poses', zh: '场景 + 真值位姿' },
      },
    },
    {
      id: 'randomise',
      x: 235,
      y: 50,
      w: 180,
      h: 92,
      accent: 'flux',
      label: { en: 'Randomisation', zh: '域随机化' },
      sub: { en: 'light · texture · mass', zh: '光照 · 纹理 · 质量' },
      detail: {
        body: {
          en: 'Vary lighting, textures, friction and link masses. Lighting is the one that actually matters outdoors: the hardest real condition was dappled midday shadow, so that is the condition the randomiser oversamples.',
          zh: '随机化光照、纹理、摩擦与连杆质量。真正在户外起作用的是光照：最难的真实条件是正午斑驳阴影，所以随机化器对这一条件过采样。',
        },
        takes: { en: 'Base scene', zh: '基础场景' },
        emits: { en: 'Randomised episodes', zh: '随机化回合' },
        risk: { en: 'Randomising what does not vary in reality', zh: '随机化了现实中不变的量' },
      },
    },
    {
      id: 'policy',
      x: 460,
      y: 50,
      w: 180,
      h: 92,
      accent: 'signal',
      label: { en: 'Policy / perception', zh: '策略 / 感知' },
      sub: { en: 'learned perception only', zh: '仅学习式感知' },
      detail: {
        body: {
          en: 'Perception is learned; motion is classically planned. Learned perception is verifiable frame by frame. A learned motion policy operating next to a destructive failure mode is not something I could certify to the grower.',
          zh: '感知是学习来的；运动是经典规划的。学习式感知可以逐帧验证。而一个在破坏性失效模式旁边运行的学习式运动策略，是我没法向种植者做出保证的。',
        },
        takes: { en: 'Randomised observations', zh: '随机化观测' },
        emits: { en: 'ONNX / TensorRT engine', zh: 'ONNX / TensorRT 引擎' },
      },
    },
    {
      id: 'hardware',
      x: 685,
      y: 50,
      w: 180,
      h: 92,
      accent: 'ember',
      label: { en: 'Real arm', zh: '真机' },
      sub: { en: 'CR10A · outdoors', zh: 'CR10A · 户外' },
      detail: {
        body: {
          en: 'Where the assumptions break. Sunlight, dust, wind moving the canopy between perception and execution, GPS degrading under the trellis. The staleness guard holds a safe pose rather than extrapolating a target into a 120 ms gap.',
          zh: '假设在这里崩塌。阳光、灰尘、在感知与执行之间吹动树冠的风、棚架下劣化的 GPS。过期保护会保持安全位姿，而不是把目标外推进一个 120 ms 的空窗。',
        },
        takes: { en: 'Engine + live stereo', zh: '引擎 + 实时双目' },
        emits: { en: 'Synchronised run logs', zh: '同步运行日志' },
        risk: { en: 'Acting on a stale world model', zh: '基于过期世界模型执行动作' },
      },
    },
    {
      id: 'replay',
      x: 910,
      y: 50,
      w: 180,
      h: 92,
      accent: 'signal',
      label: { en: 'Replay harness', zh: '回放框架' },
      sub: { en: 'frames + 125 Hz state', zh: '图像 + 125 Hz 状态' },
      detail: {
        body: {
          en: "Every run logs stereo frames, arm state at 125 Hz and the decision engine's scored target list. A logged failure is a test case; a remembered failure is an argument. Building this in month four instead of week one was the project's most expensive mistake.",
          zh: '每次运行都记录双目图像、125 Hz 的机械臂状态，以及决策引擎带评分的目标列表。被记录的失效是测试用例；被记住的失效只是争论。把它放到第四个月而不是第一周，是这个项目最昂贵的错误。',
        },
        takes: { en: 'Field logs', zh: '田间日志' },
        emits: { en: 'Regression fixtures', zh: '回归测试 fixture' },
      },
    },
  ],
  edges: [
    { from: 'scene', to: 'randomise' },
    { from: 'randomise', to: 'policy' },
    { from: 'policy', to: 'hardware', label: { en: 'deploy', zh: '部署' } },
    { from: 'hardware', to: 'replay' },
    {
      from: 'replay',
      to: 'scene',
      kind: 'feedback',
      dashed: true,
      label: { en: 'real failures become simulated test cases', zh: '真实失效 → 仿真测试用例' },
    },
  ],
};

const clinicalFusion: DiagramSpec = {
  width: 1110,
  height: 400,
  minWidth: 960,
  nodes: [
    {
      id: 'audio',
      x: 10,
      y: 30,
      w: 180,
      h: 86,
      accent: 'signal',
      label: { en: 'Dictated speech', zh: '口述语音' },
      sub: { en: 'domain-tuned ASR', zh: '领域微调 ASR' },
      detail: {
        body: {
          en: 'Fine-tuned rather than off-the-shelf, because drug names and dosages are where general ASR fails — and they are the highest-stakes tokens in the transcript. Every segment keeps its speaker and millisecond offset.',
          zh: '使用微调模型而非开箱即用，因为药名与剂量正是通用 ASR 失手之处——而它们是整段转写里风险最高的 token。每个片段保留其说话人与毫秒级偏移。',
        },
        emits: { en: 'Transcript spans + offsets', zh: '转写片段 + 时间偏移' },
        risk: { en: 'Dosage and drug-name substitution', zh: '剂量与药名被替换' },
      },
    },
    {
      id: 'imaging',
      x: 10,
      y: 157,
      w: 180,
      h: 86,
      accent: 'flux',
      label: { en: 'Imaging findings', zh: '影像所见' },
      sub: { en: 'study + series id', zh: '检查号 + 序列号' },
      detail: {
        body: {
          en: 'Findings carry their study and series identifiers. A modality ablation caught a case where "imaging findings" were actually being restated from the record and the imaging encoder was contributing nothing at all.',
          zh: '所见必须携带其检查号与序列号。一次模态消融抓到了这样的情况："影像所见"其实是从病历里复述的，而影像编码器根本没有贡献任何信息。',
        },
        emits: { en: 'Finding spans + study refs', zh: '所见片段 + 检查引用' },
      },
    },
    {
      id: 'records',
      x: 10,
      y: 284,
      w: 180,
      h: 86,
      accent: 'ember',
      label: { en: 'Structured records', zh: '结构化病历' },
      sub: { en: 'table + date', zh: '来源表 + 日期' },
      detail: {
        body: {
          en: 'Each field keeps its source table and date, so "the patient is on X" can always be resolved to which record said so and when. Stale medication lists are a common and dangerous source of confident error.',
          zh: '每个字段保留来源表与日期，因此"患者正在使用 X"总能追溯到是哪条记录、在何时这样说的。过期的用药列表是一种常见且危险的自信错误来源。',
        },
        emits: { en: 'Field spans + provenance', zh: '字段片段 + 来源信息' },
      },
    },
    {
      id: 'spans',
      x: 250,
      y: 157,
      w: 180,
      h: 86,
      accent: 'signal',
      label: { en: 'Evidence spans', zh: '证据片段' },
      sub: { en: 'typed + timestamped', zh: '带类型 + 带时间戳' },
      detail: {
        body: {
          en: 'The architectural commitment: modalities are normalised into typed, timestamped spans and never fused in embedding space. That costs representational power — a jointly trained encoder would score better — but once a claim is a vector you cannot say which second of audio produced it.',
          zh: '架构上的核心承诺：各模态被归一化为带类型、带时间戳的片段，绝不在嵌入空间融合。这牺牲了表示能力——联合训练的编码器分数会更高——但一旦一条陈述变成向量，你就无法说出它来自音频的第几秒。',
        },
        takes: { en: 'All three modalities', zh: '三路模态' },
        emits: { en: 'Unified span pool', zh: '统一片段池' },
        risk: { en: 'Provenance lost at fusion', zh: '融合时丢失来源信息' },
      },
    },
    {
      id: 'retrieval',
      x: 470,
      y: 157,
      w: 180,
      h: 86,
      accent: 'flux',
      label: { en: 'Hybrid retrieval', zh: '混合检索' },
      sub: { en: 'BM25 + dense', zh: 'BM25 + 稠密' },
      detail: {
        body: {
          en: 'Lexical plus dense, because clinical queries hinge on exact identifiers — codes, drug names, measurements — that embeddings blur and BM25 nails. Dense-only retrieval failed specifically on the queries that mattered most.',
          zh: '词法与稠密并用，因为临床查询依赖精确标识——编码、药名、测量值——嵌入会把它们模糊掉，而 BM25 能精确命中。纯稠密检索恰恰在最重要的那些查询上失效。',
        },
        takes: { en: 'Span pool + query', zh: '片段池 + 查询' },
        emits: { en: 'Ranked evidence set', zh: '排序后的证据集' },
      },
    },
    {
      id: 'generator',
      x: 690,
      y: 157,
      w: 180,
      h: 86,
      accent: 'signal',
      label: { en: 'Constrained generator', zh: '受约束生成器' },
      sub: { en: 'self-hosted', zh: '自建部署' },
      detail: {
        body: {
          en: 'Self-hosted, because patient data cannot leave the deployment boundary — and as a side effect, evaluation has no per-token cost. Output is emitted directly into the claim schema rather than as prose to be parsed afterwards.',
          zh: '自建部署，因为患者数据不能离开部署边界——副作用是评测没有按 token 的费用。输出直接生成为 claim 模式，而不是先产出散文再解析。',
        },
        takes: { en: 'Ranked evidence', zh: '排序后的证据' },
        emits: { en: 'Claims with span refs', zh: '带片段引用的陈述' },
      },
    },
    {
      id: 'validator',
      x: 910,
      y: 157,
      w: 180,
      h: 86,
      accent: 'ember',
      label: { en: 'Schema validator', zh: '模式校验器' },
      sub: { en: 'abstention gate', zh: '拒答闸门' },
      detail: {
        body: {
          en: 'A claim with an empty evidence list is not representable, so "forgot to cite" cannot reach the clinician. Low-confidence claims must have a matching abstention or validation fails — turning a whole failure class from "detect and alert" into "impossible".',
          zh: '证据列表为空的陈述无法被表示，因此"忘记引用"根本到不了医生面前。低置信度陈述必须有对应的拒答记录，否则校验失败——这把一整类失效从"检测并告警"变成了"不可能发生"。',
        },
        takes: { en: 'Draft object', zh: '草稿对象' },
        emits: { en: 'Draft + abstention worklist', zh: '草稿 + 拒答待办清单' },
        risk: { en: 'Over-abstention: safe and useless', zh: '过度拒答：安全但无用' },
      },
    },
  ],
  edges: [
    { from: 'audio', to: 'spans' },
    { from: 'imaging', to: 'spans' },
    { from: 'records', to: 'spans' },
    { from: 'spans', to: 'retrieval' },
    { from: 'retrieval', to: 'generator' },
    { from: 'generator', to: 'validator' },
    {
      from: 'validator',
      to: 'spans',
      kind: 'feedback',
      dashed: true,
      label: { en: 'gaps re-queried, not guessed', zh: '缺口重新检索，而非猜测' },
    },
  ],
};

const fieldPipeline: DiagramSpec = {
  width: 1120,
  height: 236,
  minWidth: 980,
  nodes: [
    {
      id: 'capture',
      x: 10,
      y: 50,
      w: 190,
      h: 92,
      accent: 'signal',
      label: { en: 'Stereo capture', zh: '双目采集' },
      sub: { en: '~350 MB/s', zh: '约 350 MB/s' },
      detail: {
        body: {
          en: 'A 2 MP stereo pair at 30 fps is roughly 350 MB/s. Passive stereo rather than an active IR depth camera: projected-pattern sensors degrade badly in direct sunlight, which is exactly the condition this robot works in.',
          zh: '200 万像素双目、30 fps，约等于 350 MB/s。选被动双目而非主动红外深度相机：结构光类传感器在直射阳光下严重退化，而这正是这台机器人的工作条件。',
        },
        emits: { en: 'Shared-memory frame handle', zh: '共享内存帧句柄' },
        risk: { en: 'Exposure clipping in dappled shade', zh: '斑驳阴影下曝光截断' },
      },
    },
    {
      id: 'perception',
      x: 238,
      y: 50,
      w: 190,
      h: 92,
      accent: 'signal',
      label: { en: 'Perception', zh: '感知' },
      sub: { en: 'zero-copy in', zh: '零拷贝输入' },
      detail: {
        body: {
          en: 'Reads the frame in place over iceoryx2 — no memcpy per hop, no allocator pressure. Serialising image-rate traffic through a conventional bus showed up as jitter in a loop that must not jitter.',
          zh: '通过 iceoryx2 就地读取帧——没有每跳的 memcpy，没有分配器压力。把图像速率的数据走常规总线序列化，会在一个不允许抖动的环路里表现为抖动。',
        },
        takes: { en: 'Frame handle', zh: '帧句柄' },
        emits: { en: 'Cluster + berry detections', zh: '果串与果粒检测' },
        risk: { en: 'CUDA fault must not reach control', zh: 'CUDA 异常不得传到控制' },
      },
    },
    {
      id: 'decision',
      x: 465,
      y: 50,
      w: 190,
      h: 92,
      accent: 'flux',
      label: { en: 'Decision engine', zh: '决策引擎' },
      sub: { en: '< 120 ms budget', zh: '< 120 ms 预算' },
      detail: {
        body: {
          en: 'Scores which berries to remove. Every threshold is tuned around an asymmetry: a missed berry costs nothing, cutting the peduncle destroys the whole cluster. The robot is deliberately and measurably timid.',
          zh: '评分决定摘除哪些果粒。每个阈值都围绕一种不对称来调：漏剪一粒没有代价，剪断果梗毁掉整串。这台机器人是刻意的、可量化的保守。',
        },
        takes: { en: 'Detections + arm state', zh: '检测结果 + 机械臂状态' },
        emits: { en: 'Scored target list', zh: '带评分的目标列表' },
        risk: { en: 'Target older than 120 ms', zh: '目标超过 120 ms 未更新' },
      },
    },
    {
      id: 'planner',
      x: 693,
      y: 50,
      w: 190,
      h: 92,
      accent: 'flux',
      label: { en: 'Motion planner', zh: '运动规划' },
      sub: { en: 'classical, verified', zh: '经典方法，可验证' },
      detail: {
        body: {
          en: 'Plans around trellis wire, canes and the peduncle. Validated per-commit against a simulated collision suite, which caught two regressions that would otherwise have been discovered as a bent gripper.',
          zh: '围绕棚架钢丝、枝条与果梗做规划。每次提交都对照仿真碰撞测试集验证，这抓到了两次回归——否则它们会以"夹爪被撞弯"的形式被发现。',
        },
        takes: { en: 'Target + obstacle set', zh: '目标 + 障碍集合' },
        emits: { en: 'Joint trajectory', zh: '关节轨迹' },
      },
    },
    {
      id: 'control',
      x: 920,
      y: 50,
      w: 190,
      h: 92,
      accent: 'ember',
      label: { en: 'Arm control', zh: '机械臂控制' },
      sub: { en: '125 Hz, own loop', zh: '125 Hz，独立环路' },
      detail: {
        body: {
          en: "Runs its own fixed loop against the controller's 8 ms feedback channel and holds a safe pose whenever upstream input goes stale. The staleness check lives here, not in the publisher — a publisher that has crashed cannot tell you it has crashed.",
          zh: '针对控制柜 8 ms 反馈通道跑自己的固定环路，上游输入一旦过期就保持安全位姿。过期判定写在这里而不是发布端——已经崩掉的发布端没法告诉你它崩了。',
        },
        takes: { en: 'Trajectory (or nothing)', zh: '轨迹（或没有）' },
        emits: { en: 'Servo commands', zh: '伺服指令' },
        risk: { en: 'Extrapolating into a perception gap', zh: '向感知空窗外推' },
      },
    },
  ],
  edges: [
    { from: 'capture', to: 'perception' },
    { from: 'perception', to: 'decision' },
    { from: 'decision', to: 'planner' },
    { from: 'planner', to: 'control' },
    {
      from: 'control',
      to: 'perception',
      kind: 'feedback',
      label: { en: 'arm state @ 125 Hz', zh: '机械臂状态 @ 125 Hz' },
    },
  ],
};

export const diagramSpecs: Record<DiagramId, DiagramSpec> = {
  'post-training': postTraining,
  'agent-runtime': agentRuntime,
  'eye-in-hand': eyeInHand,
  sim2real,
  'clinical-fusion': clinicalFusion,
  'field-pipeline': fieldPipeline,
};
