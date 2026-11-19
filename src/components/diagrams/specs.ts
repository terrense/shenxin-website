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
 *
 * Node labels and `sub` strings are tight on space — they sit inside a fixed
 * box. Russian runs long, so the translations here are shorter than a literal
 * rendering would be; where a term is an identifier in the codebase
 * (`T_base_tool`, `vLLM`, `manifest.json`) it stays untranslated in every
 * language, because translating an identifier makes it unsearchable.
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
      label: { en: 'Data curation', zh: '数据治理', ru: 'Подготовка данных' },
      sub: { en: 'manifest + hash', zh: 'manifest + 哈希', ru: 'манифест + хеш' },
      detail: {
        body: {
          en: 'Dedup, decontaminate against the eval sets, and pin a content hash. Nothing enters a training run without a hash, because a dataset that changed quietly is indistinguishable from a model that got worse.',
          zh: '去重、针对评测集做去污染、固定内容哈希。没有哈希的数据不得进入任何训练——因为一个被静默改动过的数据集，和一个变差了的模型，是无法区分的。',
          ru: 'Дедупликация, очистка от пересечений с оценочными наборами и фиксация хеша содержимого. Без хеша ничто не попадает в обучающий запуск: набор данных, который тихо изменился, неотличим от модели, которая стала хуже.',
        },
        takes: {
          en: 'Raw collections, preference logs',
          zh: '原始语料、偏好日志',
          ru: 'Сырые коллекции, логи предпочтений',
        },
        emits: {
          en: 'Sharded JSONL + manifest.json',
          zh: '分片 JSONL + manifest.json',
          ru: 'Шардированный JSONL + manifest.json',
        },
        risk: {
          en: 'Eval leakage; silent dataset drift',
          zh: '评测集泄漏；数据集静默漂移',
          ru: 'Утечка оценочных данных; тихий дрейф набора',
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
      label: { en: 'SFT', zh: '监督微调', ru: 'SFT' },
      sub: { en: 'LoRA r=32', zh: 'LoRA r=32', ru: 'LoRA r=32' },
      detail: {
        body: {
          en: 'Supervised fine-tune with sequence packing into 4096-token bins — about a third fewer steps at identical token throughput. Attention masks are rebuilt per bin; getting that wrong leaks context across samples.',
          zh: '监督微调，并把样本打包进 4096-token 的 bin——在相同 token 吞吐下步数减少约三分之一。注意力掩码按 bin 重建；写错会让上下文在样本间泄漏。',
          ru: 'Супервизируемое дообучение с упаковкой последовательностей в бины по 4096 токенов — примерно на треть меньше шагов при той же пропускной способности по токенам. Маски внимания перестраиваются для каждого бина; ошибка здесь приводит к утечке контекста между примерами.',
        },
        takes: {
          en: 'Curated instruction data',
          zh: '经治理的指令数据',
          ru: 'Отобранные инструктивные данные',
        },
        emits: {
          en: 'Adapter weights + tokenizer',
          zh: 'Adapter 权重 + tokenizer',
          ru: 'Веса адаптера + токенизатор',
        },
        risk: {
          en: 'Cross-sample attention leakage',
          zh: '跨样本注意力泄漏',
          ru: 'Утечка внимания между примерами',
        },
      },
    },
    {
      id: 'rm',
      x: 382,
      y: 50,
      w: 150,
      h: 94,
      accent: 'flux',
      label: { en: 'Reward model', zh: '奖励模型', ru: 'Модель награды' },
      sub: { en: 'Bradley–Terry', zh: 'Bradley–Terry', ru: 'Брэдли — Терри' },
      detail: {
        body: {
          en: 'Initialised from the SFT checkpoint so the tokenizer and embeddings match — a mismatch here needs a remap and costs more than the training. Pairwise loss with a small margin.',
          zh: '从 SFT checkpoint 初始化，使 tokenizer 与嵌入对齐——这里不匹配就需要重映射，代价比训练本身更高。采用带小 margin 的 pairwise 损失。',
          ru: 'Инициализируется из чекпоинта SFT, чтобы совпадали токенизатор и эмбеддинги: несовпадение здесь требует перестроения отображения и стоит дороже самого обучения. Попарная функция потерь с небольшим зазором.',
        },
        takes: { en: 'Pairwise preferences', zh: '成对偏好数据', ru: 'Попарные предпочтения' },
        emits: { en: 'Scalar reward head', zh: '标量奖励头', ru: 'Скалярная голова награды' },
        risk: {
          en: 'Length bias learned as quality',
          zh: '把长度偏好学成了质量偏好',
          ru: 'Длина выучена как признак качества',
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
      label: { en: 'GRPO', zh: 'GRPO', ru: 'GRPO' },
      sub: { en: 'group = 8, KL 0.04', zh: 'group = 8, KL 0.04', ru: 'группа = 8, KL 0,04' },
      detail: {
        body: {
          en: 'Group-relative policy optimisation: no value network to tune or hold in memory, which is what makes single-node training fit. Rollouts come from a separate vLLM worker so the training GPUs never idle on generation.',
          zh: '组相对策略优化：无需调试或驻留价值网络，这正是单节点训练能装下的原因。Rollout 由独立的 vLLM worker 产生，使训练 GPU 不会因生成而空转。',
          ru: 'Групповая относительная оптимизация политики: нет сети ценности, которую надо настраивать и держать в памяти, — именно это позволяет уместить обучение на одном узле. Роллауты приходят от отдельного воркера vLLM, поэтому обучающие GPU не простаивают на генерации.',
        },
        takes: {
          en: 'SFT policy + reward head',
          zh: 'SFT 策略 + 奖励头',
          ru: 'Политика SFT + голова награды',
        },
        emits: { en: 'Optimised policy', zh: '优化后的策略', ru: 'Оптимизированная политика' },
        risk: {
          en: 'Entropy collapse below KL 0.02',
          zh: 'KL 低于 0.02 时熵坍缩',
          ru: 'Схлопывание энтропии при KL ниже 0,02',
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
      label: { en: 'Evaluation', zh: '评测', ru: 'Оценка' },
      sub: { en: 'pinned judge', zh: '固定版评判模型', ru: 'зафиксированный судья' },
      detail: {
        body: {
          en: 'Fixed prompts, fixed seeds, a locally pinned judge model and bootstrap confidence intervals. A judge that silently updates turns every historical number into fiction, which is why this one never moves without a version bump.',
          zh: '固定 prompt、固定种子、本地固定版本的评判模型，以及 bootstrap 置信区间。一个会静默更新的评判模型会把所有历史数字变成虚构——所以这个模型不升版本就绝不改动。',
          ru: 'Фиксированные промпты, фиксированные сиды, локально зафиксированная модель-судья и бутстреп-доверительные интервалы. Судья, который тихо обновляется, превращает все прошлые числа в выдумку, — поэтому этот не меняется без смены версии.',
        },
        takes: { en: 'Any checkpoint', zh: '任意 checkpoint', ru: 'Любой чекпоинт' },
        emits: {
          en: 'Scores + CIs + length stats',
          zh: '分数 + 置信区间 + 长度统计',
          ru: 'Оценки + доверительные интервалы + статистика длин',
        },
        risk: {
          en: 'Judge drift; single-number reporting',
          zh: '评判模型漂移；只报单一数字',
          ru: 'Дрейф судьи; отчёт одним числом',
        },
      },
    },
    {
      id: 'serve',
      x: 940,
      y: 50,
      w: 150,
      h: 94,
      accent: 'signal',
      label: { en: 'Serving', zh: '推理部署', ru: 'Инференс' },
      sub: { en: 'vLLM', zh: 'vLLM', ru: 'vLLM' },
      detail: {
        body: {
          en: 'Merge adapters, quantise if the latency budget needs it, and re-run the eval suite against the served endpoint rather than the checkpoint. Serving-time regressions are real and the checkpoint will not show them.',
          zh: '合并 adapter，若延迟预算需要则量化，然后针对已部署的服务端点（而不是 checkpoint）重跑一遍评测。部署阶段的退化是真实存在的，而 checkpoint 看不出来。',
          ru: 'Слить адаптеры, при необходимости квантовать под бюджет задержек и прогнать набор оценок по развёрнутому эндпоинту, а не по чекпоинту. Регрессии на этапе обслуживания реальны, и чекпоинт их не покажет.',
        },
        takes: { en: 'Final policy', zh: '最终策略', ru: 'Итоговая политика' },
        emits: {
          en: 'OpenAI-compatible endpoint',
          zh: 'OpenAI 兼容端点',
          ru: 'Эндпоинт, совместимый с OpenAI',
        },
        risk: {
          en: 'Quantisation regressions unmeasured',
          zh: '量化引入的退化未被测量',
          ru: 'Регрессии от квантования не измерены',
        },
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
      label: { en: 'failures → new data', zh: '失败样本 → 新数据', ru: 'отказы → новые данные' },
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
      w: 135,
      h: 92,
      accent: 'signal',
      label: { en: 'Turn input', zh: '回合输入', ru: 'Вход хода' },
      sub: { en: 'CLI / dashboard', zh: 'CLI / Dashboard', ru: 'CLI / dashboard' },
      detail: {
        body: {
          en: 'A user message, a slash command that enters the agent loop, or a one-shot --print prompt. The entrypoint consumes events; it does not decide policy. The same loop backs the CLI, the dashboard and the evaluation adapter.',
          zh: '用户消息、进入 Agent 循环的斜杠命令，或一次性的 --print 提示。入口只消费事件，不做策略决定。CLI、Dashboard 和评测 adapter 共用同一个循环。',
          ru: 'Сообщение пользователя, slash-команда, входящая в цикл агента, или one-shot --print. Entrypoint читает события и не решает политику. Один цикл обслуживает CLI, dashboard и evaluation adapter.',
        },
        emits: { en: 'turn_start', zh: 'turn_start', ru: 'turn_start' },
        risk: { en: 'UI deciding policy', zh: 'UI 决定策略', ru: 'UI решает политику' },
      },
    },
    {
      id: 'provider',
      x: 155,
      y: 154,
      w: 135,
      h: 92,
      accent: 'flux',
      label: { en: 'Provider', zh: 'Provider', ru: 'Provider' },
      sub: { en: 'OpenAI-compatible', zh: 'OpenAI 兼容', ru: 'OpenAI-совместимый' },
      detail: {
        body: {
          en: 'Any OpenAI Chat Completions endpoint: DeepSeek, OpenAI, OpenRouter, a local Ollama/vLLM/LM Studio server, or the offline rule provider. Streaming is the default; retries, fallback, overflow and truncation recovery are classified, not generic.',
          zh: '任何 OpenAI Chat Completions 端点：DeepSeek、OpenAI、OpenRouter、本地 Ollama/vLLM/LM Studio，或离线规则 Provider。默认流式；重试、降级、溢出和截断恢复都按类别处理，而不是笼统重试。',
          ru: 'Любой OpenAI Chat Completions endpoint: DeepSeek, OpenAI, OpenRouter, локальный Ollama/vLLM/LM Studio или offline rule provider. По умолчанию streaming; retry, fallback, overflow и truncation recovery классифицируются, а не смешиваются.',
        },
        takes: { en: 'Messages + tool schemas', zh: '消息 + 工具 schema', ru: 'Сообщения + схемы инструментов' },
        emits: { en: 'Text / tool calls', zh: '文本 / 工具调用', ru: 'Текст / вызовы инструментов' },
        risk: { en: 'HTTP 200 with an SSE error', zh: 'HTTP 200 里带 SSE error', ru: 'HTTP 200 с SSE error' },
      },
    },
    {
      id: 'registry',
      x: 300,
      y: 154,
      w: 135,
      h: 92,
      accent: 'flux',
      label: { en: 'Tool registry', zh: '工具 Registry', ru: 'Tool registry' },
      sub: { en: '146 contracts', zh: '146 个契约', ru: '146 контрактов' },
      detail: {
        body: {
          en: 'Every tool declares a JSON Schema, an approval requirement, per-input concurrency safety, a result-size limit and a search hint. Core tools stay loaded; the rest are deferred and discovered through ToolSearch. Subagents, teams and MCP tools register here too.',
          zh: '每个工具声明 JSON Schema、审批要求、逐输入并发安全性、结果大小上限和检索提示。核心工具常驻，其余延迟加载并经 ToolSearch 发现。子代理、团队和 MCP 工具也在这里注册。',
          ru: 'Каждый инструмент объявляет JSON Schema, требование approval, безопасность параллелизма для каждого входа, лимит размера результата и search hint. Основные инструменты загружены, остальные отложены и находятся через ToolSearch. Субагенты, команды и MCP-инструменты регистрируются здесь же.',
        },
        takes: { en: 'Tool calls', zh: '工具调用', ru: 'Вызовы инструментов' },
        emits: { en: 'Validated requests', zh: '已校验请求', ru: 'Проверенные запросы' },
        risk: { en: 'A handler bypassing approval', zh: 'Handler 绕过审批', ru: 'Обработчик обходит approval' },
      },
    },
    {
      id: 'gate',
      x: 445,
      y: 154,
      w: 135,
      h: 92,
      accent: 'ember',
      label: { en: 'Permission gate', zh: '权限门', ru: 'Permission gate' },
      sub: { en: 'fail closed', zh: 'fail closed', ru: 'fail closed' },
      detail: {
        body: {
          en: 'Permission modes, layered policy/project/user rules, a flag- and subcommand-aware read-only allowlist, and a PowerShell token analyzer. Unknown commands ask. Catastrophic commands deny first. Secret-reading commands never auto-allow.',
          zh: '权限模式、policy/project/user 分层规则、flag 与子命令感知的只读白名单，以及 PowerShell 令牌分析。未知命令询问；灾难命令先拒绝；读密钥的命令永不自动放行。',
          ru: 'Режимы permission, слоистые policy/project/user правила, flag- и subcommand-aware read-only allowlist и токенный анализатор PowerShell. Неизвестные команды спрашивают; катастрофические сначала deny; команды чтения секретов никогда не auto-allow.',
        },
        takes: { en: 'Tool + input', zh: '工具 + 入参', ru: 'Инструмент + вход' },
        emits: { en: 'allow / ask / deny', zh: 'allow / ask / deny', ru: 'allow / ask / deny' },
        risk: { en: 'Flag-blind prefix matching', zh: '忽略 flag 的前缀匹配', ru: 'Prefix matching без учёта flags' },
      },
    },
    {
      id: 'sandbox',
      x: 590,
      y: 154,
      w: 135,
      h: 92,
      accent: 'signal',
      label: { en: 'Workspace', zh: '工作区', ru: 'Workspace' },
      sub: { en: 'path boundary', zh: '路径边界', ru: 'Граница путей' },
      detail: {
        body: {
          en: 'Files and shell processes run inside the workspace root; .. escapes are rejected. One pruning walker backs every search. This is a path boundary, not an OS-level container: untrusted code still needs a VM or container around it.',
          zh: '文件和 Shell 进程在工作区根目录内运行，.. 逃逸会被拒绝。所有搜索共用一个剪枝 walker。这是路径边界，不是 OS 级容器：不可信代码仍需外面加 VM 或容器。',
          ru: 'Файлы и shell-процессы работают внутри корня workspace; выходы через .. отклоняются. Все поиски используют один pruning walker. Это граница путей, а не OS-контейнер: недоверенному коду всё ещё нужна VM или контейнер.',
        },
        emits: { en: 'Observations', zh: '观察结果', ru: 'Наблюдения' },
        risk: { en: 'Path escape / host shell', zh: '路径逃逸 / 宿主 Shell', ru: 'Побег из пути / host shell' },
      },
    },
    {
      id: 'context',
      x: 735,
      y: 154,
      w: 135,
      h: 92,
      accent: 'flux',
      label: { en: 'Context', zh: '上下文', ru: 'Контекст' },
      sub: { en: 'budget -> summary', zh: '预算 -> 摘要', ru: 'бюджет -> резюме' },
      detail: {
        body: {
          en: 'L0 replaces oversized old tool results with previews; cache-aware pruning removes stale bodies; a structured summary handles the rest; session memory survives compaction; a bounded recovery chain handles a real overflow. Token counts prefer provider-reported usage.',
          zh: 'L0 把过大的旧工具结果换成预览；缓存感知裁剪清掉陈旧内容；结构化摘要处理剩余部分；会话记忆跨压缩存活；有界恢复链处理真正的溢出。token 计数优先用 Provider 回报的 usage。',
          ru: 'L0 заменяет огромные старые результаты инструментов превью; cache-aware pruning убирает устаревшие тела; структурное резюме обрабатывает остальное; session memory переживает сжатие; ограниченная цепочка восстановления обрабатывает реальный overflow. Счёт токенов предпочитает usage от provider.',
        },
        takes: { en: 'Observations + memory', zh: '观察结果 + 记忆', ru: 'Наблюдения + память' },
        emits: { en: 'Next-turn messages', zh: '下一轮消息', ru: 'Сообщения следующего хода' },
        risk: { en: 'Stale counts / cache busting', zh: '计数陈旧 / 破坏缓存', ru: 'Устаревшие счётчики / сломанный кэш' },
      },
    },
    {
      id: 'session',
      x: 880,
      y: 154,
      w: 135,
      h: 92,
      accent: 'signal',
      label: { en: 'Session', zh: '会话', ru: 'Сессия' },
      sub: { en: 'SQLite + events', zh: 'SQLite + 事件', ru: 'SQLite + события' },
      detail: {
        body: {
          en: 'Every message is committed as it is appended, not only at turn end. The JSONL event log records turns, tool calls, compaction, retry and cache breaks for analysis. Resume and file rewind read from this state; the event log is not the source of truth.',
          zh: '每条消息在追加时即提交，而不是只在回合结束写。JSONL 事件日志记录回合、工具调用、压缩、重试和缓存断裂，用于分析。恢复和文件回滚以会话状态为准；事件日志不是真相源。',
          ru: 'Каждое сообщение коммитится при добавлении, а не только в конце хода. JSONL event log записывает ходы, вызовы инструментов, compaction, retry и cache breaks для анализа. Resume и file rewind читают это состояние; event log не является источником истины.',
        },
        takes: { en: 'Messages + usage', zh: '消息 + usage', ru: 'Сообщения + usage' },
        emits: { en: 'Resume / replay', zh: '恢复 / 回放', ru: 'Resume / replay' },
        risk: { en: 'Turn-end-only persistence', zh: '只在回合末持久化', ru: 'Persistence только в конце хода' },
      },
    },
  ],
  edges: [
    { from: 'turn', to: 'provider' },
    { from: 'provider', to: 'registry', label: { en: 'tool calls', zh: '工具调用', ru: 'вызовы' } },
    { from: 'registry', to: 'gate' },
    { from: 'gate', to: 'sandbox' },
    { from: 'sandbox', to: 'context', label: { en: 'observations', zh: '观察', ru: 'наблюдения' } },
    { from: 'context', to: 'session', label: { en: 'persist', zh: '持久化', ru: 'persist' } },
    {
      from: 'session',
      to: 'provider',
      kind: 'feedback',
      label: { en: 'next turn / resume', zh: '下一轮 / 恢复', ru: 'следующий ход / resume' },
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
      label: { en: 'Robot base', zh: '机器人基座', ru: 'Основание робота' },
      sub: { en: 'world frame', zh: '世界坐标系', ru: 'мировая система координат' },
      detail: {
        body: {
          en: 'The fixed reference everything resolves into. Every transform in the codebase is named T_destination_source, so composition reads left to right and a reversed multiplication is visually obvious at review time.',
          zh: '一切最终归算到的固定参考系。代码库中每个变换都命名为 T_destination_source，于是复合运算从左到右读，乘反了在评审时一眼可见。',
          ru: 'Фиксированная система отсчёта, в которую всё в конечном счёте приводится. Каждое преобразование в коде названо T_destination_source, поэтому композиция читается слева направо, и перевёрнутое умножение видно глазом на ревью.',
        },
        emits: {
          en: 'T_base_tool (from encoders)',
          zh: 'T_base_tool（来自编码器）',
          ru: 'T_base_tool (с энкодеров)',
        },
      },
    },
    {
      id: 'flange',
      x: 280,
      y: 62,
      w: 190,
      h: 92,
      accent: 'signal',
      label: { en: 'Tool flange', zh: '末端法兰', ru: 'Фланец инструмента' },
      sub: { en: '30004 @ 8 ms', zh: '30004 @ 8 ms', ru: '30004 @ 8 мс' },
      detail: {
        body: {
          en: 'Pose read from the controller real-time channel at 8 ms per frame. Capture only happens after the arm has come to a full stop — a pose sampled mid-motion carries a timestamp mismatch that looks exactly like calibration error.',
          zh: '位姿从控制柜实时通道读取，每帧 8 ms。只有在机械臂完全停稳后才采集——运动过程中采样的位姿带有时间戳错配，而它看起来和标定误差一模一样。',
          ru: 'Поза считывается из канала реального времени контроллера, 8 мс на кадр. Съёмка идёт только после полной остановки манипулятора: поза, взятая в движении, несёт расхождение по времени, которое выглядит в точности как ошибка калибровки.',
        },
        takes: { en: 'Joint encoders', zh: '关节编码器', ru: 'Энкодеры суставов' },
        emits: { en: 'T_base_tool', zh: 'T_base_tool', ru: 'T_base_tool' },
        risk: {
          en: 'Sampling before the arm settles',
          zh: '机械臂未停稳就采样',
          ru: 'Съёмка до полной остановки манипулятора',
        },
      },
    },
    {
      id: 'camera',
      x: 550,
      y: 62,
      w: 190,
      h: 92,
      accent: 'flux',
      label: { en: 'Stereo camera', zh: '双目相机', ru: 'Стереокамера' },
      sub: {
        en: 'T_tool_camera — unknown',
        zh: 'T_tool_camera — 待求',
        ru: 'T_tool_camera — неизвестно',
      },
      detail: {
        body: {
          en: 'The quantity being solved for. Two MV-CS060-10UC heads mounted on the flange; the left is the hand-eye primary. Images are de-rotated at the capture boundary (left +90°, right −90°) so nothing downstream carries an orientation special case.',
          zh: '这就是要求解的量。两台 MV-CS060-10UC 安装在法兰上，左相机为手眼主相机。图像在采集边界完成旋转归一（左 +90°、右 −90°），使下游任何环节都不必处理朝向特例。',
          ru: 'Искомая величина. Две головы MV-CS060-10UC закреплены на фланце; левая — основная для hand-eye. Изображения разворачиваются на границе захвата (левое +90°, правое −90°), чтобы дальше по тракту нигде не возникало особого случая по ориентации.',
        },
        emits: {
          en: 'Synchronised stereo pair',
          zh: '同步双目图像对',
          ru: 'Синхронная стереопара',
        },
        risk: {
          en: 'Degenerate pose sets → low residual, wrong transform',
          zh: '退化位姿集 → 低残差、错变换',
          ru: 'Вырожденный набор поз → малая невязка, неверное преобразование',
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
      label: { en: 'Checkerboard', zh: '标定板', ru: 'Калибровочная доска' },
      sub: { en: '11×8, 20 mm', zh: '11×8，20 mm', ru: '11×8, 20 мм' },
      detail: {
        body: {
          en: 'Static in the world, so T_base_board is constant across every capture — which is exactly the constraint that makes the system solvable. Detected as 8×11 after de-rotation. All lengths are millimetres, converted once at the protocol edge.',
          zh: '在世界中静止，因此 T_base_board 在所有采集中保持恒定——正是这个约束让方程可解。旋转归一后按 8×11 检测。所有长度单位为毫米，仅在协议边界换算一次。',
          ru: 'Неподвижна в мире, поэтому T_base_board постоянна для всех съёмок — именно это условие делает систему разрешимой. После разворота детектируется как 8×11. Все длины в миллиметрах, перевод выполняется один раз на границе протокола.',
        },
        emits: {
          en: 'T_camera_board (PnP)',
          zh: 'T_camera_board（PnP）',
          ru: 'T_camera_board (PnP)',
        },
        risk: {
          en: 'Mixed units; partial corner detection',
          zh: '单位混用；角点检测不全',
          ru: 'Смешение единиц; неполная детекция углов',
        },
      },
    },
  ],
  edges: [
    {
      from: 'base',
      to: 'flange',
      label: { en: 'T_base_tool', zh: 'T_base_tool', ru: 'T_base_tool' },
    },
    {
      from: 'flange',
      to: 'camera',
      label: { en: 'T_tool_camera', zh: 'T_tool_camera', ru: 'T_tool_camera' },
    },
    {
      from: 'camera',
      to: 'board',
      label: { en: 'T_camera_board', zh: 'T_camera_board', ru: 'T_camera_board' },
    },
    {
      from: 'board',
      to: 'base',
      kind: 'feedback',
      dashed: true,
      label: {
        en: 'T_base_board — constant, closes the loop',
        zh: 'T_base_board — 恒定，闭合方程',
        ru: 'T_base_board — постоянна, замыкает систему',
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
      label: { en: 'Isaac Lab scene', zh: 'Isaac Lab 场景', ru: 'Сцена в Isaac Lab' },
      sub: { en: 'trellis + canopy', zh: '棚架 + 树冠', ru: 'шпалера + полог' },
      detail: {
        body: {
          en: 'A modelled vineyard row. I was initially sceptical this would transfer, and for policy learning it mostly did not — its real value turned out to be regression testing collision cases that are genuinely unsafe to reproduce on hardware.',
          zh: '建模出的一行葡萄架。我起初怀疑它能否迁移，而对策略学习来说它基本没迁移——它真正的价值在于：为那些在真机上复现确实不安全的碰撞场景做回归测试。',
          ru: 'Смоделированный ряд виноградника. Сначала я сомневался, что это перенесётся, и для обучения политики в основном не перенеслось — реальной ценностью оказалось регрессионное тестирование столкновений, которые по-настоящему небезопасно воспроизводить на железе.',
        },
        emits: {
          en: 'Scenes + ground-truth poses',
          zh: '场景 + 真值位姿',
          ru: 'Сцены + эталонные позы',
        },
      },
    },
    {
      id: 'randomise',
      x: 235,
      y: 50,
      w: 180,
      h: 92,
      accent: 'flux',
      label: { en: 'Randomisation', zh: '域随机化', ru: 'Рандомизация домена' },
      sub: { en: 'light · texture · mass', zh: '光照 · 纹理 · 质量', ru: 'свет · текстура · масса' },
      detail: {
        body: {
          en: 'Vary lighting, textures, friction and link masses. Lighting is the one that actually matters outdoors: the hardest real condition was dappled midday shadow, so that is the condition the randomiser oversamples.',
          zh: '随机化光照、纹理、摩擦与连杆质量。真正在户外起作用的是光照：最难的真实条件是正午斑驳阴影，所以随机化器对这一条件过采样。',
          ru: 'Варьируются освещение, текстуры, трение и массы звеньев. На улице по-настоящему важно именно освещение: самым трудным реальным условием была пятнистая полуденная тень — её рандомизатор и сэмплирует с избытком.',
        },
        takes: { en: 'Base scene', zh: '基础场景', ru: 'Базовая сцена' },
        emits: {
          en: 'Randomised episodes',
          zh: '随机化回合',
          ru: 'Рандомизированные эпизоды',
        },
        risk: {
          en: 'Randomising what does not vary in reality',
          zh: '随机化了现实中不变的量',
          ru: 'Рандомизируется то, что в реальности не меняется',
        },
      },
    },
    {
      id: 'policy',
      x: 460,
      y: 50,
      w: 180,
      h: 92,
      accent: 'signal',
      label: { en: 'Policy / perception', zh: '策略 / 感知', ru: 'Политика / восприятие' },
      sub: {
        en: 'learned perception only',
        zh: '仅学习式感知',
        ru: 'обучается только восприятие',
      },
      detail: {
        body: {
          en: 'Perception is learned; motion is classically planned. Learned perception is verifiable frame by frame. A learned motion policy operating next to a destructive failure mode is not something I could certify to the grower.',
          zh: '感知是学习来的；运动是经典规划的。学习式感知可以逐帧验证。而一个在破坏性失效模式旁边运行的学习式运动策略，是我没法向种植者做出保证的。',
          ru: 'Восприятие обучается; движение планируется классически. Обученное восприятие проверяемо кадр за кадром. А обученную политику движения, работающую рядом с разрушительным режимом отказа, я не смог бы гарантировать виноградарю.',
        },
        takes: {
          en: 'Randomised observations',
          zh: '随机化观测',
          ru: 'Рандомизированные наблюдения',
        },
        emits: {
          en: 'ONNX / TensorRT engine',
          zh: 'ONNX / TensorRT 引擎',
          ru: 'Движок ONNX / TensorRT',
        },
      },
    },
    {
      id: 'hardware',
      x: 685,
      y: 50,
      w: 180,
      h: 92,
      accent: 'ember',
      label: { en: 'Real arm', zh: '真机', ru: 'Реальный манипулятор' },
      sub: { en: 'CR10A · outdoors', zh: 'CR10A · 户外', ru: 'CR10A · в поле' },
      detail: {
        body: {
          en: 'Where the assumptions break. Sunlight, dust, wind moving the canopy between perception and execution, GPS degrading under the trellis. The staleness guard holds a safe pose rather than extrapolating a target into a 120 ms gap.',
          zh: '假设在这里崩塌。阳光、灰尘、在感知与执行之间吹动树冠的风、棚架下劣化的 GPS。过期保护会保持安全位姿，而不是把目标外推进一个 120 ms 的空窗。',
          ru: 'Здесь предположения рушатся. Солнце, пыль, ветер, сдвигающий полог между восприятием и исполнением, ГНСС, деградирующая под шпалерой. Защита от устаревших данных удерживает безопасную позу, вместо того чтобы экстраполировать цель в окно 120 мс.',
        },
        takes: { en: 'Engine + live stereo', zh: '引擎 + 实时双目', ru: 'Движок + живое стерео' },
        emits: {
          en: 'Synchronised run logs',
          zh: '同步运行日志',
          ru: 'Синхронные логи прогона',
        },
        risk: {
          en: 'Acting on a stale world model',
          zh: '基于过期世界模型执行动作',
          ru: 'Действие по устаревшей модели мира',
        },
      },
    },
    {
      id: 'replay',
      x: 910,
      y: 50,
      w: 180,
      h: 92,
      accent: 'signal',
      label: { en: 'Replay harness', zh: '回放框架', ru: 'Стенд воспроизведения' },
      sub: {
        en: 'frames + 125 Hz state',
        zh: '图像 + 125 Hz 状态',
        ru: 'кадры + состояние 125 Гц',
      },
      detail: {
        body: {
          en: "Every run logs stereo frames, arm state at 125 Hz and the decision engine's scored target list. A logged failure is a test case; a remembered failure is an argument. Building this in month four instead of week one was the project's most expensive mistake.",
          zh: '每次运行都记录双目图像、125 Hz 的机械臂状态，以及决策引擎带评分的目标列表。被记录的失效是测试用例；被记住的失效只是争论。把它放到第四个月而不是第一周，是这个项目最昂贵的错误。',
          ru: 'Каждый прогон пишет стереокадры, состояние манипулятора на 125 Гц и список целей с оценками от решающего модуля. Записанный отказ — это тест; запомненный отказ — это спор. Сделать это на четвёртом месяце, а не на первой неделе, было самой дорогой ошибкой проекта.',
        },
        takes: { en: 'Field logs', zh: '田间日志', ru: 'Логи с поля' },
        emits: {
          en: 'Regression fixtures',
          zh: '回归测试 fixture',
          ru: 'Фикстуры для регрессий',
        },
      },
    },
  ],
  edges: [
    { from: 'scene', to: 'randomise' },
    { from: 'randomise', to: 'policy' },
    {
      from: 'policy',
      to: 'hardware',
      label: { en: 'deploy', zh: '部署', ru: 'развёртывание' },
    },
    { from: 'hardware', to: 'replay' },
    {
      from: 'replay',
      to: 'scene',
      kind: 'feedback',
      dashed: true,
      label: {
        en: 'real failures become simulated test cases',
        zh: '真实失效 → 仿真测试用例',
        ru: 'реальные отказы → тесты в симуляции',
      },
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
      label: { en: 'Patient speech', zh: '患者语音', ru: 'Речь пациента' },
      sub: { en: 'domain-tuned ASR', zh: '领域微调 ASR', ru: 'ASR, дообученная на домене' },
      detail: {
        body: {
          en: 'Fine-tuned rather than off-the-shelf, because department names, drug names and body-part terms are where general ASR fails — and they are the tokens the routing decision depends on. Every segment keeps its speaker and millisecond offset.',
          zh: '使用微调模型而非开箱即用，因为科室名、药名与身体部位术语正是通用 ASR 失手之处——而分诊决策恰恰依赖这些 token。每个片段保留其说话人与毫秒级偏移。',
          ru: 'Дообученная, а не готовая из коробки: названия отделений, препаратов и частей тела — именно то, на чём общая ASR ошибается, и именно те токены, от которых зависит маршрутизация. Каждый фрагмент сохраняет говорящего и смещение в миллисекундах.',
        },
        emits: {
          en: 'Transcript spans + offsets',
          zh: '转写片段 + 时间偏移',
          ru: 'Фрагменты расшифровки + смещения',
        },
        risk: {
          en: 'Accents; mid-sentence code-switching',
          zh: '口音；句中语码转换',
          ru: 'Акценты; переключение языка внутри фразы',
        },
      },
    },
    {
      id: 'language',
      x: 10,
      y: 157,
      w: 180,
      h: 86,
      accent: 'flux',
      label: { en: 'Language detection', zh: '语种识别', ru: 'Определение языка' },
      sub: { en: 'answer in kind', zh: '同语种作答', ru: 'ответ на том же языке' },
      detail: {
        body: {
          en: 'The language is detected and the answer is produced in it directly. Pivoting through a third language compounds two error rates on exactly the terms that matter most — department names, drug names, body parts.',
          zh: '识别语种后直接以该语种作答。经由第三语言中转，会在最关键的术语上叠加两道错误率——科室名、药名、身体部位。',
          ru: 'Язык определяется, и ответ сразу формируется на нём. Промежуточный перевод через третий язык складывает две вероятности ошибки именно на самых важных терминах — названиях отделений, препаратов, частей тела.',
        },
        takes: { en: 'Transcript spans', zh: '转写片段', ru: 'Фрагменты расшифровки' },
        emits: {
          en: 'Language-tagged spans',
          zh: '带语种标记的片段',
          ru: 'Фрагменты с меткой языка',
        },
        risk: {
          en: 'Mid-sentence code-switching',
          zh: '句中语码转换',
          ru: 'Переключение языка внутри фразы',
        },
      },
    },
    {
      id: 'records',
      x: 10,
      y: 284,
      w: 180,
      h: 86,
      accent: 'ember',
      label: { en: 'Hospital records', zh: '医院信息库', ru: 'База данных больницы' },
      sub: {
        en: 'table + updated date',
        zh: '来源表 + 更新日期',
        ru: 'таблица-источник + дата',
      },
      detail: {
        body: {
          en: 'Departments, locations, opening hours, registration procedures — each field keeping its source table and last-updated date, so "cardiology is in building 3" always resolves to which record said so and when. A department that moved last month is the most dangerous kind of confident error.',
          zh: '科室、位置、开放时间、挂号流程——每个字段保留来源表与最后更新日期，因此"心内科在 3 号楼"总能追溯到是哪条记录、在何时这样说的。一个上个月刚搬走的科室，是最危险的那种自信错误。',
          ru: 'Отделения, расположение, часы приёма, порядок записи — у каждого поля сохраняется таблица-источник и дата последнего обновления, поэтому «кардиология в корпусе 3» всегда сводится к тому, какая запись это утверждает и когда. Отделение, переехавшее в прошлом месяце, — самый опасный вид уверенной ошибки.',
        },
        emits: {
          en: 'Field spans + provenance',
          zh: '字段片段 + 来源信息',
          ru: 'Поля + происхождение',
        },
        risk: {
          en: 'Confidently stale information',
          zh: '自信地给出过期信息',
          ru: 'Уверенно выданные устаревшие данные',
        },
      },
    },
    {
      id: 'spans',
      x: 250,
      y: 157,
      w: 180,
      h: 86,
      accent: 'signal',
      label: { en: 'Evidence spans', zh: '证据片段', ru: 'Фрагменты-свидетельства' },
      sub: {
        en: 'typed + timestamped',
        zh: '带类型 + 带时间戳',
        ru: 'с типом и отметкой времени',
      },
      detail: {
        body: {
          en: 'The architectural commitment: modalities are normalised into typed, timestamped spans and never fused in embedding space. That costs representational power — a jointly trained encoder would score better — but once a claim is a vector you cannot say which second of audio produced it.',
          zh: '架构上的核心承诺：各模态被归一化为带类型、带时间戳的片段，绝不在嵌入空间融合。这牺牲了表示能力——联合训练的编码器分数会更高——但一旦一条陈述变成向量，你就无法说出它来自音频的第几秒。',
          ru: 'Главное архитектурное обязательство: модальности приводятся к типизированным фрагментам с отметками времени и никогда не сливаются в пространстве эмбеддингов. Это стоит выразительной силы — совместно обученный энкодер набрал бы больше, — но как только утверждение стало вектором, уже не скажешь, из какой секунды звука оно взялось.',
        },
        takes: { en: 'All three modalities', zh: '三路模态', ru: 'Все три модальности' },
        emits: { en: 'Unified span pool', zh: '统一片段池', ru: 'Общий пул фрагментов' },
        risk: {
          en: 'Provenance lost at fusion',
          zh: '融合时丢失来源信息',
          ru: 'Происхождение теряется при слиянии',
        },
      },
    },
    {
      id: 'retrieval',
      x: 470,
      y: 157,
      w: 180,
      h: 86,
      accent: 'flux',
      label: { en: 'Hybrid retrieval', zh: '混合检索', ru: 'Гибридный поиск' },
      sub: { en: 'BM25 + dense', zh: 'BM25 + 稠密', ru: 'BM25 + плотный' },
      detail: {
        body: {
          en: 'Lexical plus dense, because hospital queries hinge on exact identifiers — department names, building numbers, form codes — that embeddings blur and BM25 nails. Dense-only retrieval failed specifically on the queries that mattered most.',
          zh: '词法与稠密并用，因为医院场景的查询依赖精确标识——科室名、楼栋编号、单据代码——嵌入会把它们模糊掉，而 BM25 能精确命中。纯稠密检索恰恰在最重要的那些查询上失效。',
          ru: 'Лексический плюс плотный, потому что больничные запросы держатся на точных идентификаторах — названиях отделений, номерах корпусов, кодах форм, — которые эмбеддинги размывают, а BM25 берёт точно. Только плотный поиск проваливался именно на самых важных запросах.',
        },
        takes: { en: 'Span pool + query', zh: '片段池 + 查询', ru: 'Пул фрагментов + запрос' },
        emits: {
          en: 'Ranked evidence set',
          zh: '排序后的证据集',
          ru: 'Отранжированный набор свидетельств',
        },
      },
    },
    {
      id: 'generator',
      x: 690,
      y: 157,
      w: 180,
      h: 86,
      accent: 'signal',
      label: { en: 'Constrained generator', zh: '受约束生成器', ru: 'Генератор с ограничениями' },
      sub: { en: 'self-hosted', zh: '自建部署', ru: 'на своих серверах' },
      detail: {
        body: {
          en: 'Self-hosted, because intake answers are patient data and cannot leave the deployment boundary — and as a side effect, evaluation has no per-token cost. Output is emitted directly into the answer schema rather than as prose to be parsed afterwards.',
          zh: '自建部署，因为预问诊的回答属于患者数据、不能离开部署边界——副作用是评测没有按 token 的费用。输出直接生成为 answer 模式，而不是先产出散文再解析。',
          ru: 'На своих серверах, потому что ответы предварительного приёма — это данные пациента и они не могут покидать контур развёртывания; побочный эффект — оценка не стоит ничего за токен. Вывод сразу порождается в схеме ответа, а не как проза, которую потом надо разбирать.',
        },
        takes: { en: 'Ranked evidence', zh: '排序后的证据', ru: 'Отранжированные свидетельства' },
        emits: {
          en: 'Answers with span refs',
          zh: '带片段引用的回答',
          ru: 'Ответы со ссылками на фрагменты',
        },
      },
    },
    {
      id: 'validator',
      x: 910,
      y: 157,
      w: 180,
      h: 86,
      accent: 'ember',
      label: { en: 'Schema validator', zh: '模式校验器', ru: 'Валидатор схемы' },
      sub: { en: 'escalation gate', zh: '转人工闸门', ru: 'шлюз передачи человеку' },
      detail: {
        body: {
          en: 'An answer with an empty evidence list is not representable, so "forgot to cite" cannot reach the patient — and the intent enum has no diagnosis member, so a diagnostic answer has nowhere to live. A refusal with no escalation also fails validation: no answer and no hand-off is a patient left standing there.',
          zh: '证据列表为空的回答无法被表示，因此"忘记引用"根本到不了患者面前——而 intent 枚举中没有"诊断"这一项，诊断性回答也就无处容身。没有附带转人工的拒答同样无法通过校验：既不回答也不交接，等于把患者晾在原地。',
          ru: 'Ответ с пустым списком свидетельств невыразим, поэтому «забыл сослаться» просто не доходит до пациента, — а в перечислении интентов нет диагноза, так что диагностическому ответу негде существовать. Отказ без передачи человеку тоже не проходит валидацию: ни ответа, ни передачи — это пациент, оставленный стоять на месте.',
        },
        takes: { en: 'Turn object', zh: '轮次对象', ru: 'Объект хода' },
        emits: {
          en: 'Answer + escalation queue',
          zh: '回答 + 转人工队列',
          ru: 'Ответ + очередь к человеку',
        },
        risk: {
          en: 'Over-refusal: safe and useless',
          zh: '过度拒答：安全但无用',
          ru: 'Чрезмерные отказы: безопасно и бесполезно',
        },
      },
    },
  ],
  edges: [
    { from: 'audio', to: 'spans' },
    { from: 'language', to: 'spans' },
    { from: 'records', to: 'spans' },
    { from: 'spans', to: 'retrieval' },
    { from: 'retrieval', to: 'generator' },
    { from: 'generator', to: 'validator' },
    {
      from: 'validator',
      to: 'spans',
      kind: 'feedback',
      dashed: true,
      label: {
        en: 'gaps re-queried, not guessed',
        zh: '缺口重新检索，而非猜测',
        ru: 'пробелы перезапрашиваются, а не угадываются',
      },
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
      label: { en: 'Stereo capture', zh: '双目采集', ru: 'Стереосъёмка' },
      sub: { en: '~350 MB/s', zh: '约 350 MB/s', ru: '≈350 МБ/с' },
      detail: {
        body: {
          en: 'A 2 MP stereo pair at 30 fps is roughly 350 MB/s. Passive stereo rather than an active IR depth camera: projected-pattern sensors degrade badly in direct sunlight, which is exactly the condition this robot works in.',
          zh: '200 万像素双目、30 fps，约等于 350 MB/s。选被动双目而非主动红外深度相机：结构光类传感器在直射阳光下严重退化，而这正是这台机器人的工作条件。',
          ru: 'Стереопара 2 Мп на 30 к/с — это примерно 350 МБ/с. Пассивное стерео, а не активная ИК-камера глубины: сенсоры с проецируемым узором сильно деградируют под прямым солнцем, а именно в таких условиях этот робот и работает.',
        },
        emits: {
          en: 'Shared-memory frame handle',
          zh: '共享内存帧句柄',
          ru: 'Дескриптор кадра в разделяемой памяти',
        },
        risk: {
          en: 'Exposure clipping in dappled shade',
          zh: '斑驳阴影下曝光截断',
          ru: 'Срез экспозиции в пятнистой тени',
        },
      },
    },
    {
      id: 'perception',
      x: 238,
      y: 50,
      w: 190,
      h: 92,
      accent: 'signal',
      label: { en: 'Perception', zh: '感知', ru: 'Восприятие' },
      sub: { en: 'zero-copy in', zh: '零拷贝输入', ru: 'вход без копирования' },
      detail: {
        body: {
          en: 'Reads the frame in place over iceoryx2 — no memcpy per hop, no allocator pressure. Serialising image-rate traffic through a conventional bus showed up as jitter in a loop that must not jitter.',
          zh: '通过 iceoryx2 就地读取帧——没有每跳的 memcpy，没有分配器压力。把图像速率的数据走常规总线序列化，会在一个不允许抖动的环路里表现为抖动。',
          ru: 'Читает кадр на месте через iceoryx2 — без memcpy на каждом переходе и без давления на аллокатор. Прогон трафика с частотой кадров через обычную шину с сериализацией проявлялся как дрожание в контуре, которому дрожать нельзя.',
        },
        takes: { en: 'Frame handle', zh: '帧句柄', ru: 'Дескриптор кадра' },
        emits: {
          en: 'Cluster + berry detections',
          zh: '果串与果粒检测',
          ru: 'Детекции гроздей и ягод',
        },
        risk: {
          en: 'CUDA fault must not reach control',
          zh: 'CUDA 异常不得传到控制',
          ru: 'Сбой CUDA не должен дойти до управления',
        },
      },
    },
    {
      id: 'decision',
      x: 465,
      y: 50,
      w: 190,
      h: 92,
      accent: 'flux',
      label: { en: 'Decision engine', zh: '决策引擎', ru: 'Решающий модуль' },
      sub: { en: '< 120 ms budget', zh: '< 120 ms 预算', ru: 'бюджет < 120 мс' },
      detail: {
        body: {
          en: 'Scores which berries to remove. Every threshold is tuned around an asymmetry: a missed berry costs nothing, cutting the peduncle destroys the whole cluster. The robot is deliberately and measurably timid.',
          zh: '评分决定摘除哪些果粒。每个阈值都围绕一种不对称来调：漏剪一粒没有代价，剪断果梗毁掉整串。这台机器人是刻意的、可量化的保守。',
          ru: 'Оценивает, какие ягоды удалять. Каждый порог настроен вокруг асимметрии: пропущенная ягода не стоит ничего, перерезанная плодоножка уничтожает всю гроздь. Робот намеренно и измеримо осторожен.',
        },
        takes: {
          en: 'Detections + arm state',
          zh: '检测结果 + 机械臂状态',
          ru: 'Детекции + состояние манипулятора',
        },
        emits: { en: 'Scored target list', zh: '带评分的目标列表', ru: 'Список целей с оценками' },
        risk: {
          en: 'Target older than 120 ms',
          zh: '目标超过 120 ms 未更新',
          ru: 'Цель не обновлялась дольше 120 мс',
        },
      },
    },
    {
      id: 'planner',
      x: 693,
      y: 50,
      w: 190,
      h: 92,
      accent: 'flux',
      label: { en: 'Motion planner', zh: '运动规划', ru: 'Планировщик движения' },
      sub: { en: 'classical, verified', zh: '经典方法，可验证', ru: 'классический, проверяемый' },
      detail: {
        body: {
          en: 'Plans around trellis wire, canes and the peduncle. Validated per-commit against a simulated collision suite, which caught two regressions that would otherwise have been discovered as a bent gripper.',
          zh: '围绕棚架钢丝、枝条与果梗做规划。每次提交都对照仿真碰撞测试集验证，这抓到了两次回归——否则它们会以"夹爪被撞弯"的形式被发现。',
          ru: 'Планирует обход шпалерной проволоки, лоз и плодоножки. Проверяется на каждый коммит против набора смоделированных столкновений — это поймало две регрессии, которые иначе обнаружились бы в виде погнутого захвата.',
        },
        takes: {
          en: 'Target + obstacle set',
          zh: '目标 + 障碍集合',
          ru: 'Цель + набор препятствий',
        },
        emits: { en: 'Joint trajectory', zh: '关节轨迹', ru: 'Траектория в суставах' },
      },
    },
    {
      id: 'control',
      x: 920,
      y: 50,
      w: 190,
      h: 92,
      accent: 'ember',
      label: { en: 'Arm control', zh: '机械臂控制', ru: 'Управление манипулятором' },
      sub: { en: '125 Hz, own loop', zh: '125 Hz，独立环路', ru: '125 Гц, свой контур' },
      detail: {
        body: {
          en: "Runs its own fixed loop against the controller's 8 ms feedback channel and holds a safe pose whenever upstream input goes stale. The staleness check lives here, not in the publisher — a publisher that has crashed cannot tell you it has crashed.",
          zh: '针对控制柜 8 ms 反馈通道跑自己的固定环路，上游输入一旦过期就保持安全位姿。过期判定写在这里而不是发布端——已经崩掉的发布端没法告诉你它崩了。',
          ru: 'Крутит свой фиксированный контур против канала обратной связи контроллера на 8 мс и удерживает безопасную позу, как только вход сверху устаревает. Проверка устаревания живёт здесь, а не у публикующей стороны: упавший публикатор не может сообщить вам, что он упал.',
        },
        takes: { en: 'Trajectory (or nothing)', zh: '轨迹（或没有）', ru: 'Траектория (или ничего)' },
        emits: { en: 'Servo commands', zh: '伺服指令', ru: 'Команды на приводы' },
        risk: {
          en: 'Extrapolating into a perception gap',
          zh: '向感知空窗外推',
          ru: 'Экстраполяция в окно без восприятия',
        },
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
      label: {
        en: 'arm state @ 125 Hz',
        zh: '机械臂状态 @ 125 Hz',
        ru: 'состояние манипулятора @ 125 Гц',
      },
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
