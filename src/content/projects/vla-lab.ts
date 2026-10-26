import type { Project } from '../types';

export const vlaLab: Project = {
  slug: 'vla-lab',
  title: {
    en: 'VLA Lab — Policies Against Real Limits',
    zh: 'VLA Lab — 真实硬件约束下的策略评测',
  },
  tagline: {
    en: 'What vision-language-action models actually fit on one consumer GPU',
    zh: '在一张消费级显卡上，视觉-语言-动作模型到底装得下什么',
  },
  summary: {
    en: 'A measured study of which VLA policies are trainable and servable on a single consumer GPU, and why the published VRAM tables are the wrong constraint. Includes a latency benchmark, an action-chunking ablation, and a documented trail of three environment traps that each cost a day.',
    zh: '一项实测研究：哪些 VLA 策略能在单张消费级显卡上训练与部署，以及为什么公开的显存需求表并不是真正的约束。包含延迟基准、动作分块消融，以及三个各耗掉一天的环境陷阱的完整记录。',
  },
  domain: 'embodied',
  alsoIn: ['robotics', 'infra'],
  period: '2025 — now',
  role: { en: 'Solo — research engineering', zh: '独立完成 — 研究工程' },
  status: 'active',
  accent: 'signal',
  stack: [
    'PyTorch 2.10 + cu128',
    'LeRobot',
    'SmolVLA',
    'π₀ / π₀-FAST',
    'LIBERO',
    'ACT',
    'Diffusion Policy',
    'CUDA',
  ],
  highlights: [
    {
      value: '450M',
      provenance: 'spec',
      label: { en: 'Largest trainable VLA', zh: '可训练的最大 VLA' },
      detail: { en: 'SmolVLA — ~2 GB host peak', zh: 'SmolVLA — 宿主内存峰值约 2 GB' },
    },
    {
      value: '14.4GB',
      provenance: 'measured',
      label: { en: 'π₀ host-RAM peak', zh: 'π₀ 宿主内存峰值' },
      detail: { en: 'The real ceiling, not VRAM', zh: '真正的天花板，不是显存' },
    },
    {
      value: '5',
      provenance: 'spec',
      countTo: 5,
      label: { en: 'Kernel paths verified', zh: '已验证内核路径' },
      detail: { en: 'Each exercised for real on sm_120', zh: '每条在 sm_120 上都真实跑过一次' },
    },
  ],
  // TODO(content): add a repo or write-up link when one is public.
  featured: true,
  span: 'wide',
  motif: 'waveform',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题' },
      lede: {
        en: 'The published requirement tables measure the wrong resource.',
        zh: '公开的资源需求表，量的是错的那个资源。',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'If you want to get hands-on with vision-language-action models without a datacentre, the first question is what actually runs. The official guidance for the π₀ family quotes VRAM: above 8 GB for inference, above 22.5 GB for LoRA fine-tuning, above 70 GB for full fine-tuning. Useful numbers — and on this machine, not the binding ones.',
            zh: '如果你想在没有数据中心的条件下动手做视觉-语言-动作模型，第一个问题是：到底什么能跑起来。π₀ 系列的官方说明给的是显存：推理 >8 GB，LoRA 微调 >22.5 GB，全量微调 >70 GB。这些数字有用——但在这台机器上，它们不是真正的约束。',
          },
        },
        {
          kind: 'table',
          caption: {
            en: 'Measured on this machine. RTX 5070 (11.9 GiB, Blackwell sm_120), i7-12700KF, 20 GB allocated to WSL2.',
            zh: '本机实测。RTX 5070（11.9 GiB，Blackwell sm_120）、i7-12700KF，WSL2 分配 20 GB 内存。',
          },
          head: [
            { en: 'Model', zh: '模型' },
            { en: 'Params', zh: '参数量' },
            { en: 'Host RAM peak', zh: '宿主内存峰值' },
            { en: 'Verdict', zh: '结论' },
          ],
          rows: [
            [
              { en: 'π₀ / π₀.₅ / π₀-FAST', zh: 'π₀ / π₀.₅ / π₀-FAST' },
              { en: '~3.3 B', zh: '约 3.3 B' },
              { en: '14.4 GB', zh: '14.4 GB' },
              { en: 'OOM-killed under a 20 GB quota', zh: '20 GB 配额下被 OOM 杀掉' },
            ],
            [
              { en: 'SmolVLA', zh: 'SmolVLA' },
              { en: '450 M', zh: '450 M' },
              { en: '~2 GB', zh: '约 2 GB' },
              { en: 'Inference and fine-tuning both viable', zh: '推理与微调均可行' },
            ],
            [
              { en: 'ACT / Diffusion Policy', zh: 'ACT / Diffusion Policy' },
              { en: 'Small', zh: '小' },
              { en: 'Low', zh: '低' },
              { en: 'Comfortable', zh: '余量充足' },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'insight',
          title: {
            en: 'The bottleneck was host RAM, not VRAM',
            zh: '瓶颈是宿主内存，不是显存',
          },
          body: {
            en: 'π₀ never got far enough to stress the GPU. Checkpoint loading and weight conversion peak at 14.4 GB of host memory, and with 20 GB allocated to WSL2 — shared with a browser and a chat client that routinely hold 15 GB — the process is killed before the first kernel launches. The lesson generalises: on a workstation, read the host-memory profile of model loading before you read the VRAM table.',
            zh: 'π₀ 根本没走到给 GPU 施压的那一步。加载 checkpoint 与权重转换的宿主内存峰值是 14.4 GB，而 WSL2 只有 20 GB——还要和经常占用 15 GB 的浏览器与聊天软件共享——于是进程在第一个 kernel 启动之前就被杀掉了。这条教训是普适的：在工作站上，先看模型加载的宿主内存曲线，再看显存需求表。',
          },
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'System architecture', zh: '系统架构' },
      lede: {
        en: 'A verification harness, then a benchmark, then the policies.',
        zh: '先是验证框架，然后是基准测试，最后才是策略本身。',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'Before any policy work, the environment needs to be provably correct, because on a brand-new GPU architecture the failure modes lie to you. The harness is three pieces: a GPU verifier that launches a real kernel on every path I depend on, a latency bench that measures per-step inference under realistic batch shapes, and an evaluation runner against LIBERO task suites with logs written per-configuration so results are comparable weeks later.',
            zh: '在做任何策略工作之前，环境必须可证明正确，因为在一个全新 GPU 架构上，失效模式会对你撒谎。框架分三部分：一个 GPU 验证器，在我依赖的每条路径上都真实启动一次 kernel；一个延迟基准，在现实的 batch 形状下测量单步推理；以及一个针对 LIBERO 任务集的评测执行器，按配置分别写日志，使几周后的结果仍然可比。',
          },
        },
        {
          kind: 'code',
          lang: 'python',
          caption: {
            en: 'verify_gpu.py — the synchronize() calls are the whole point.',
            zh: 'verify_gpu.py —— synchronize() 的调用正是关键所在。',
          },
          code: `# torch.cuda.is_available() returns True on sm_120 even when the wheel
# has no sm_120 kernels. The failure only surfaces at launch:
#   RuntimeError: no kernel image is available for execution on the device
#
# So: exercise every path for real, and synchronize after each one.
# Without the sync, the error arrives after the check has already passed.
CHECKS = [
    ("fp32 matmul",      lambda: torch.randn(2048, 2048, device=d) @ torch.randn(2048, 2048, device=d)),
    ("bf16 tensorcore",  lambda: (a.bfloat16() @ b.bfloat16())),
    ("cudnn conv2d",     lambda: F.conv2d(x, w, padding=1)),
    ("sdpa attention",   lambda: F.scaled_dot_product_attention(q, k, v)),
    ("backward pass",    lambda: loss.backward()),
]

for name, fn in CHECKS:
    fn()
    torch.cuda.synchronize()   # <-- forces the launch to complete, or raise
    print(f"  ok  {name}")`,
        },
        {
          kind: 'prose',
          body: {
            en: 'The evaluation side is deliberately boring: one log file per configuration, named for the configuration, containing the full config dump at the top. `eval_bf16.log`, `eval_chunk50.log`, `eval_smolvla.log`. It is not elegant, but it means an ablation I ran three weeks ago is still readable and still comparable, which is more than most of my more elegant logging has managed.',
            zh: '评测侧刻意做得很"无聊"：每个配置一个日志文件，以配置命名，文件开头是完整的配置转储。`eval_bf16.log`、`eval_chunk50.log`、`eval_smolvla.log`。它不优雅，但这意味着三周前跑的消融实验今天仍然可读、仍然可比——这一点是我那些更"优雅"的日志方案大多没做到的。',
          },
        },
      ],
    },
    {
      id: 'decisions',
      title: { en: 'Engineering decisions', zh: '工程决策' },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'Three environment traps shaped how I now set up any new accelerator. Each one presented as something other than what it was, which is why they are worth writing down.',
            zh: '三个环境陷阱重塑了我现在配置任何新加速器的方式。每一个都伪装成了别的样子，这正是它们值得被写下来的原因。',
          },
        },
        {
          kind: 'bullets',
          ordered: true,
          items: [
            {
              label: { en: 'Blackwell sm_120 needs cu128', zh: 'Blackwell sm_120 需要 cu128' },
              body: {
                en: 'Only torch ≥ 2.7 ships precompiled sm_120 kernels; torch 2.10.0+cu128 works here. Installing LeRobot silently downgrades torch, so `--torch-backend=cu128` is mandatory — otherwise you land on a build with no kernels for your card and `is_available()` still says True.',
                zh: '只有 torch ≥ 2.7 才带 sm_120 预编译内核；本机可用的是 torch 2.10.0+cu128。安装 LeRobot 会静默降级 torch，因此 `--torch-backend=cu128` 是必须的——否则你会落到一个不含你显卡内核的构建上，而 `is_available()` 依然返回 True。',
              },
            },
            {
              label: {
                en: 'The FFmpeg error was not about FFmpeg',
                zh: 'FFmpeg 报错与 FFmpeg 无关',
              },
              body: {
                en: '`torchcodec` reported "FFmpeg is not properly installed". The full traceback showed all five core variants failing on the same line: `libnppicc.so.12: cannot open shared object file`. The real cause is a missing NVIDIA NPP colour-conversion library, which torch does not pull because torch does not use it. The system FFmpeg 4.4 was fine all along.',
                zh: '`torchcodec` 报的是 "FFmpeg is not properly installed"。但完整 traceback 显示五个 core 变体全栽在同一行：`libnppicc.so.12: cannot open shared object file`。真因是缺少 NVIDIA NPP 色彩转换库，而 torch 自己不用它，所以也不会拉它。系统自带的 FFmpeg 4.4 从头到尾都没问题。',
              },
            },
            {
              label: {
                en: 'sitecustomize.py is silently shadowed',
                zh: 'sitecustomize.py 会被静默遮蔽',
              },
              body: {
                en: 'Pip-installed NVIDIA libraries live in site-packages, which is not on the dynamic linker path. The obvious fix — preloading them from `sitecustomize.py` — does nothing on Ubuntu, because `/usr/lib/python3.10/sitecustomize.py` already exists and the stdlib directory precedes site-packages on `sys.path`. No error, no warning; your file is simply never imported.',
                zh: 'pip 安装的 NVIDIA 库位于 site-packages，而它不在动态链接器搜索路径上。看起来最自然的修法——用 `sitecustomize.py` 预加载——在 Ubuntu 上完全无效，因为 `/usr/lib/python3.10/sitecustomize.py` 已经存在，而标准库目录在 `sys.path` 上排在 site-packages 之前。没有报错，没有警告；你的文件只是从未被导入。',
              },
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'warning',
          title: {
            en: 'Error messages from the bottom of the stack are usually wrong',
            zh: '来自栈底的错误信息通常是错的',
          },
          body: {
            en: 'All three traps shared a shape: the surfaced message named the wrong subsystem. The habit that actually resolves them is to stop reading the exception type and read the full traceback for the repeated line — the one that appears in every failed variant. That line is the truth; the message on top is a guess made by whichever layer caught it last.',
            zh: '这三个陷阱共享同一种形态：抛到表面的信息指向了错的子系统。真正能解决问题的习惯，是不要盯着异常类型，而去读完整 traceback 里那条重复出现的行——在每个失败变体中都出现的那一行。那一行是真相；最上面的信息只是最后捕获它的那一层所做的猜测。',
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
            en: 'With the environment trustworthy, the questions worth asking are about the inference/accuracy trade space, because that is what decides whether a policy can close a real control loop.',
            zh: '环境可信之后，真正值得问的问题是推理与精度之间的权衡空间——因为正是它决定了一个策略能否闭合真实的控制环路。',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Precision', zh: '数值精度' },
              body: {
                en: 'bf16 against fp32 on SmolVLA. bf16 is the obvious default on Blackwell, but it needed confirming that tensor-core paths were actually being taken rather than silently falling back.',
                zh: '在 SmolVLA 上对比 bf16 与 fp32。在 Blackwell 上 bf16 是显然的默认选择，但需要确认 tensor-core 路径真的被走到了，而不是静默回退。',
              },
            },
            {
              label: { en: 'Action chunking', zh: '动作分块' },
              body: {
                en: 'Chunk length is the central latency knob: predicting 50 actions per forward pass amortises inference across 50 control steps. The trade is staleness — a long chunk commits to a plan made from an older observation.',
                zh: '分块长度是延迟的核心旋钮：一次前向预测 50 个动作，把推理开销摊到 50 个控制步上。代价是陈旧性——长分块意味着承诺执行一个基于更旧观测做出的计划。',
              },
            },
            {
              label: { en: 'Per-step latency', zh: '单步延迟' },
              body: {
                en: '`bench_latency.py` measures the distribution, not the mean. For a control loop the p99 is what sets your budget; an average that fits tells you nothing about the step that does not.',
                zh: '`bench_latency.py` 测的是分布，而不是均值。对控制环路来说，p99 才决定你的预算；一个"均值达标"完全不能说明那些不达标的步会发生什么。',
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
          kind: 'prose',
          body: {
            en: 'The practical conclusion is a sizing rule I now apply before touching any new policy: on a single consumer GPU with a constrained host, the 400M-class VLAs are a genuine working platform and the 3B-class ones are not — and the reason is the loader, not the model. That is an unglamorous result, but it saved weeks that would otherwise have gone into fighting a model that was never going to fit.',
            zh: '实用的结论是一条我现在在接触任何新策略之前都会套用的选型规则：在宿主内存受限的单张消费级显卡上，400M 量级的 VLA 是一个真正可用的平台，而 3B 量级的不是——原因在加载器，不在模型本身。这是个不光鲜的结论，但它省下了几周时间，否则这些时间会花在和一个注定装不下的模型搏斗上。',
          },
        },
        {
          kind: 'callout',
          tone: 'note',
          title: { en: 'Scope', zh: '范围说明' },
          body: {
            en: 'This is explicitly a feasibility and infrastructure study on one machine, not a claim about VLA capability. The hardware numbers above are measured; the policy-performance comparisons are ongoing and I would rather publish them late than publish them wrong.',
            zh: '这明确是一项在单台机器上的可行性与基础设施研究，不是关于 VLA 能力的论断。上面的硬件数字是实测的；策略性能对比仍在进行中，我宁愿晚一点发布，也不愿发布错的。',
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
            en: 'I would profile host memory during checkpoint loading on day one. I spent two days assuming a VRAM problem and reading VRAM tables, when a single `/usr/bin/time -v` on the load step would have shown me a 14.4 GB resident peak and ended the question immediately.',
            zh: '我会在第一天就对 checkpoint 加载过程做宿主内存剖析。我花了两天假设这是显存问题、反复查显存需求表，而其实只要在加载步骤上跑一次 `/usr/bin/time -v`，就会看到 14.4 GB 的常驻峰值，问题当场就结束了。',
          },
        },
      ],
    },
  ],
};
