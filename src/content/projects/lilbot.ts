import type { Project } from '../types';

export const lilbot: Project = {
  slug: 'lilbot',
  title: {
    en: 'LilBot — A Local-First Coding Agent',
    zh: 'LilBot — 本地优先的 Coding Agent',
    ru: 'LilBot — локальный coding agent',
  },
  tagline: {
    en: 'A coding agent you can read, run, and audit',
    zh: '一个读得完、跑得起来、审得清楚的 Coding Agent',
    ru: 'Coding agent, который можно прочитать, запустить и проверить',
  },
  summary: {
    en: 'LilBot is a terminal coding-agent runtime built around the parts that usually get skipped: tool contracts, a centralized permission gate, layered context recovery, crash-safe sessions, and an offline provider that makes the whole loop testable without an API key. The core is about 20k lines of Python.',
    zh: 'LilBot 是一个终端里的 Coding Agent 运行时，重点放在通常被跳过的部分：工具契约、集中权限门、分层上下文恢复、崩溃安全的会话，以及让整个循环无需 API Key 就能测试的离线 Provider。核心约 2 万行 Python。',
    ru: 'LilBot — среда выполнения coding agent в терминале, построенная вокруг того, что обычно пропускают: контракты инструментов, централизованный permission gate, многослойное восстановление контекста, устойчивые к падению сессии и offline provider, который позволяет тестировать весь цикл без API-ключа. Ядро — около 20 тыс. строк Python.',
  },
  domain: 'agentic',
  alsoIn: ['infra'],
  period: '2026 — now',
  role: {
    en: 'Creator and maintainer',
    zh: '作者与维护者',
    ru: 'Автор и мейнтейнер',
  },
  status: 'active',
  accent: 'flux',
  stack: ['Python', 'OpenAI-compatible', 'httpx', 'prompt_toolkit', 'Rich', 'SQLite', 'MCP', 'pytest'],
  highlights: [
    {
      value: '146',
      provenance: 'measured',
      countTo: 146,
      label: { en: 'Built-in tools', zh: '内置工具', ru: 'Встроенных инструментов' },
      detail: {
        en: 'File, shell, git, LSP, web, memory, subagents, teams, MCP',
        zh: '文件、Shell、git、LSP、web、记忆、子代理、团队、MCP',
        ru: 'Файлы, shell, git, LSP, web, память, субагенты, команды, MCP',
      },
    },
    {
      value: '757',
      provenance: 'measured',
      countTo: 757,
      label: { en: 'Tests passing', zh: '通过的测试', ru: 'Проходящих тестов' },
      detail: {
        en: '7 skipped; CI matrix on Python 3.10–3.13, Windows and Linux',
        zh: '7 个跳过；CI 覆盖 Python 3.10–3.13、Windows 与 Linux',
        ru: '7 пропущено; CI на Python 3.10–3.13, Windows и Linux',
      },
    },
    {
      value: '8.4 ms',
      provenance: 'measured',
      label: { en: '10 HTTP requests', zh: '10 次 HTTP 请求', ru: '10 HTTP-запросов' },
      detail: {
        en: 'One keep-alive connection, down from 7,825 ms / 10 connections',
        zh: '一条 keep-alive 连接，此前为 7,825 ms / 10 条连接',
        ru: 'Одно keep-alive соединение вместо 7 825 мс / 10 соединений',
      },
    },
  ],
  links: [
    {
      kind: 'repo',
      label: { en: 'GitHub repository', zh: 'GitHub 仓库', ru: 'Репозиторий GitHub' },
      href: 'https://github.com/terrense/LilBot-agent',
    },
    {
      kind: 'doc',
      label: { en: 'Architecture docs', zh: '架构文档', ru: 'Документация архитектуры' },
      href: 'https://github.com/terrense/LilBot-agent/tree/main/docs',
    },
  ],
  featured: true,
  span: 'wide',
  motif: 'pipeline',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题', ru: 'Задача' },
      lede: {
        en: 'Coding agents demo well and fail badly.',
        zh: 'Coding Agent 演示起来很好，失败起来很糟。',
        ru: 'Coding agents хорошо выглядят в демо и плохо падают в работе.',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'The first twenty lines of an agent work. The second month is where the interesting failures live: a tool returns malformed JSON, the context crosses the model window halfway through a long turn, a subagent is still running when the process dies, or the model asks a shell to delete something it should not touch. Most agent demos do not have an answer for any of these.',
            zh: '一个 Agent 的前二十行总能跑。第二个月才会遇到真正有意思的失败：工具返回畸形 JSON、长回合中途上下文越过模型窗口、进程被杀时子代理还在运行、或者模型让 Shell 删除它不该碰的东西。大多数 Agent 演示对这些问题没有答案。',
            ru: 'Первые двадцать строк агента работают. Настоящие интересные отказы начинаются на второй месяц: инструмент вернул некорректный JSON, контекст пересёк окно модели посреди длинного хода, процесс умер, пока субагент ещё работал, или модель попросила shell удалить то, чего трогать нельзя. У большинства демо агентов на это нет ответа.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'LilBot’s brief was narrower than “build a general agent framework”: make the failure paths explicit, keep the runtime small enough that one person can audit it, and make the whole loop testable without a cloud key. Everything else — tool count, UI polish, delegation — is subordinate to that.',
            zh: 'LilBot 的目标不是“做一个通用 Agent 框架”，而是：把失败路径写清楚，让运行时小到一个人能审计，并让整个循环不依赖云端 Key 也能测试。工具数量、界面华丽程度、委派能力，都从属于这三件事。',
            ru: 'Задача LilBot была уже, чем «сделать универсальный agent framework»: явно описать пути отказа, оставить рантайм достаточно малым для аудита одним человеком и сделать весь цикл тестируемым без облачного ключа. Всё остальное — число инструментов, полировка UI, делегирование — подчинено этому.',
          },
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'Architecture', zh: '架构', ru: 'Архитектура' },
      lede: {
        en: 'One turn: build, stream, execute, observe, compact, persist.',
        zh: '一轮：组装、流式、执行、观察、压缩、持久化。',
        ru: 'Один ход: собрать, стримить, выполнить, наблюдать, сжать, сохранить.',
      },
      blocks: [
        {
          kind: 'diagram',
          id: 'agent-runtime',
          caption: {
            en: 'The real turn path. Select a node to see what it owns and what can go wrong there.',
            zh: '真实的回合路径。点击节点查看它负责什么、可能在哪里出错。',
            ru: 'Реальный путь хода. Выберите узел, чтобы увидеть его ответственность и точки отказа.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The loop is deliberately boring. It builds provider messages from a stable prefix plus current state, streams one model turn, partitions tool calls into concurrency-safe batches, sends every call through one permission gate, feeds observations back, and compacts only when the token budget says so. The entrypoint, the dashboard, and the evaluation adapter all consume the same event stream.',
            zh: '主循环故意做得很无聊：用稳定前缀加当前状态拼出 Provider 消息，流式读取一个模型回合，把工具调用按并发安全性分批，让每个调用经过同一个权限门，把观察结果回灌，只在 token 预算要求时压缩。CLI、Dashboard 和评测 adapter 消费同一套事件流。',
            ru: 'Цикл намеренно скучный: собрать сообщения из стабильного префикса и текущего состояния, стримить один ход модели, разбить вызовы инструментов на безопасные для параллелизма пачки, пропустить каждый вызов через один permission gate, вернуть наблюдения и сжимать контекст только по бюджету токенов. CLI, dashboard и evaluation adapter читают один и тот же поток событий.',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Event-driven loop', zh: '事件驱动主循环', ru: 'Цикл на событиях' },
              body: {
                en: 'Agent.run_turn() yields text, tool and turn events. The UI never decides policy; it renders. A new entrypoint can reuse the same loop without copying the ReAct logic.',
                zh: 'Agent.run_turn() 产出文本、工具和回合事件。UI 不做策略决定，只负责渲染。新增入口可以复用同一个循环，不需要复制 ReAct 逻辑。',
                ru: 'Agent.run_turn() выдаёт события текста, инструментов и хода. UI не принимает политику, а только рендерит. Новый entrypoint переиспользует цикл без копирования ReAct.',
              },
            },
            {
              label: { en: 'Tools are contracts', zh: '工具即契约', ru: 'Инструменты — контракты' },
              body: {
                en: 'A ToolDef declares a JSON Schema, an approval requirement, per-input concurrency safety, a result-size limit and an optional context modifier. The registry enforces approval; a tool handler cannot silently skip the gate.',
                zh: 'ToolDef 声明 JSON Schema、审批要求、逐输入并发安全性、结果大小上限和可选的上下文修改器。registry 统一执行审批；工具 handler 不能悄悄绕过权限门。',
                ru: 'ToolDef объявляет JSON Schema, требование approval, безопасность параллелизма для каждого входа, лимит размера результата и опциональный модификатор контекста. Registry применяет approval; обработчик не может тихо обойти gate.',
              },
            },
            {
              label: { en: 'Context is a ladder', zh: '上下文是分级阶梯', ru: 'Контекст — лестница' },
              body: {
                en: 'L0 replaces oversized tool results with previews; prune removes stale bodies; a structured summary handles the rest; session memory survives compaction; a bounded recovery chain handles real overflow. Token counts prefer provider-reported usage over character estimates.',
                zh: 'L0 把过大的工具结果换成预览；裁剪清掉陈旧内容；结构化摘要处理剩余部分；会话记忆跨压缩存活；有界恢复链处理真正的溢出。token 计数优先用 Provider 回报的真实 usage，字符估算只做兜底。',
                ru: 'L0 заменяет огромные результаты инструментов превью; prune убирает устаревшие тела; структурное резюме обрабатывает остальное; session memory переживает сжатие; ограниченная цепочка восстановления обрабатывает реальный overflow. Счёт токенов предпочитает usage от provider, а не оценку по символам.',
              },
            },
            {
              label: { en: 'Sessions are append-only', zh: '会话只追加', ru: 'Сессии только дописываются' },
              body: {
                en: 'Every message is committed to SQLite as it is appended, not only at the end of a turn. A killed process loses the in-flight model call, not the last hour of tool results. The event log is for analysis, not the source of truth.',
                zh: '每条消息在追加时就写入 SQLite，而不是只在回合结束时写。进程被杀只会丢失正在进行的模型调用，不会丢掉上一小时的。事件日志用于分析，不是权威状态源。',
                ru: 'Каждое сообщение фиксируется в SQLite при добавлении, а не только в конце хода. Убитый процесс теряет текущий вызов модели, а не последний час работы. Журнал событий нужен для анализа, а не как источник истины.',
              },
            },
          ],
        },
        {
          kind: 'code',
          lang: 'text',
          caption: {
            en: 'Real commands from the demo workspace; the permission gate is the same path a cloud model uses.',
            zh: '演示工作区里的真实命令；云端模型走的是同一个权限门。',
            ru: 'Реальные команды из демо-workspace; облачная модель проходит через тот же permission gate.',
          },
          code: `$ python -m lilbot --provider mock
> ! python -m pytest -q
  Permission gate: allow once / always allow / deny once / always deny
  ok 1 passed in 0.04s
completed 1 steps

# The offline provider drives the same loop, gate and tool executor.
# A cloud endpoint only changes the model decisions.`,
        },
      ],
    },
    {
      id: 'decisions',
      title: { en: 'Decisions', zh: '工程决策', ru: 'Решения' },
      blocks: [
        {
          kind: 'table',
          head: [
            { en: 'Decision', zh: '决策', ru: 'Решение' },
            { en: 'Chosen', zh: '选择', ru: 'Выбрано' },
            { en: 'Rejected', zh: '放弃', ru: 'Отвергнуто' },
            { en: 'Why', zh: '原因', ru: 'Почему' },
          ],
          rows: [
            [
              { en: 'Model access', zh: '模型接入', ru: 'Доступ к модели' },
              { en: 'OpenAI-compatible protocol', zh: 'OpenAI 兼容协议', ru: 'OpenAI-совместимый протокол' },
              { en: 'Direct SDK coupling', zh: '直接耦合某家 SDK', ru: 'Прямая привязка к SDK' },
              {
                en: 'The same loop runs against a cloud model, a local Ollama server, or the offline provider. Model choice becomes an experiment, not a migration.',
                zh: '同一个循环可以跑云端模型、本地 Ollama，或离线 Provider。模型选择变成一次实验，而不是一次迁移。',
                ru: 'Один цикл работает с облачной моделью, локальным Ollama или offline provider. Выбор модели становится экспериментом, а не миграцией.',
              },
            ],
            [
              { en: 'Memory substrate', zh: '记忆载体', ru: 'Носитель памяти' },
              { en: 'Readable files on disk', zh: '磁盘上的可读文件', ru: 'Читаемые файлы на диске' },
              { en: 'Opaque vector store as truth', zh: '不透明向量库作为真相源', ru: 'Непрозрачное vector store как истина' },
              {
                en: 'When the agent recalls the wrong thing, I want to open the file and read it. Recall is an LLM side query over explicit memory files, not a hidden embedding index.',
                zh: '当 Agent 回忆错的时候，我想能打开文件直接读。召回是对显式记忆文件的 LLM 侧查询，不是隐藏的向量索引。',
                ru: 'Когда агент вспоминает не то, я хочу открыть файл и прочитать. Recall — это side query LLM по явным файлам памяти, а не скрытый embedding-индекс.',
              },
            ],
            [
              { en: 'Approval', zh: '审批', ru: 'Approval' },
              { en: 'Central registry gate', zh: '集中式 registry 权限门', ru: 'Центральный gate в registry' },
              { en: 'Per-tool checks', zh: '每个工具自己检查', ru: 'Проверки в каждом инструменте' },
              {
                en: 'A new tool cannot silently skip approval. Layered rules (policy / project / user) and a flag-aware shell allowlist keep the decision in one place.',
                zh: '新工具无法悄悄绕过审批。分层规则（policy / project / user）和 flag 感知的 Shell 白名单把决策收在一个地方。',
                ru: 'Новый инструмент не может тихо обойти approval. Слоистые правила и flag-aware shell allowlist держат решение в одном месте.',
              },
            ],
            [
              { en: 'Session writes', zh: '会话写入', ru: 'Запись сессии' },
              { en: 'Append per message to SQLite', zh: '每条消息追加到 SQLite', ru: 'Дописывать каждое сообщение в SQLite' },
              { en: 'One JSON at turn end', zh: '回合结束写一个 JSON', ru: 'Один JSON в конце хода' },
              {
                en: 'Crash recovery is not a feature you add later. Committing on append means the transcript, usage counters and tool evidence survive a kill.',
                zh: '崩溃恢复不是“以后再补”的功能。追加即提交意味着 transcript、usage 计数和工具证据都能在进程被杀后存活。',
                ru: 'Crash recovery — не функция «на потом». Коммит при добавлении сохраняет transcript, счётчики usage и证据 инструментов после kill.',
              },
            ],
            [
              { en: 'Testing', zh: '测试', ru: 'Тестирование' },
              { en: 'Offline provider + real traces', zh: '离线 Provider + 真实 trace', ru: 'Offline provider + реальные трассы' },
              { en: 'Only live-model tests', zh: '只测真实模型', ru: 'Только тесты с живой моделью' },
              {
                en: 'The runtime loop, tool executor and permission gate are deterministic without a network. Live evaluation is separate, published with its failures.',
                zh: '运行时循环、工具执行器和权限门在无网络时是确定性的。真实模型评测单独进行，并连同失败一起公开。',
                ru: 'Цикл, исполнитель инструментов и permission gate детерминированы без сети. Live-оценка отдельная и публикуется вместе с отказами.',
              },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'insight',
          title: {
            en: 'The unglamorous parts are the product',
            zh: '不体面的部分才是产品',
            ru: 'Неприглядные части — и есть продукт',
          },
          body: {
            en: 'A tool-calling demo is cheap. The value is in what happens when the tool lies, the context overflows, the subagent outlives its parent, or the shell command is a cleverly disguised delete. Those paths are why LilBot has an explicit transition log, a bounded recovery chain, and a permission gate that fails closed.',
            zh: '工具调用演示很便宜。价值在于工具说谎、上下文溢出、子代理活得比父进程久、或者 Shell 命令伪装成删除的时候会发生什么。这些路径正是 LilBot 要有显式 transition 日志、有界恢复链和 fail-closed 权限门的原因。',
            ru: 'Демо с вызовом инструментов дешёво. Ценность в том, что происходит, когда инструмент врёт, контекст переполняется, субагент переживает родителя или shell-команда оказывается замаскированным удалением. Поэтому у LilBot есть явный transition log, ограниченная цепочка восстановления и fail-closed permission gate.',
          },
        },
      ],
    },
    {
      id: 'experiments',
      title: { en: 'Evidence', zh: '证据', ru: 'Доказательства' },
      lede: {
        en: 'A published baseline with failures, not a leaderboard number.',
        zh: '一个连同失败一起公开的基线，而不是排行榜数字。',
        ru: 'Опубликованный baseline с отказами, а не число из лидерборда.',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'The included live suite has 24 trials across reading, searching, editing, recovery, guardrails, permissions, memory and context. The 2026-11-04 run used MiniMax-M3. Sixteen passed, eight failed; every failed trial is published with its JSONL trace and a candidate root cause. The point is regression measurement, not a claim of frontier parity.',
            zh: '内置 live suite 有 24 个 trial，覆盖读取、搜索、编辑、恢复、护栏、权限、记忆和上下文。2026-11-04 那一轮使用 MiniMax-M3：16 个通过，8 个失败；每个失败 trial 都连同 JSONL trace 和候选根因一起公开。目的是衡量回归，不是宣称达到前沿水平。',
            ru: 'Встроенный live suite содержит 24 trial: чтение, поиск, редактирование, восстановление, guardrails, permissions, память и контекст. Прогон 2026-11-04 использовал MiniMax-M3: 16 прошли, 8 упали; каждый провал опубликован с JSONL trace и вероятной причиной. Цель — измерять регрессии, а не заявлять о паритете с frontier.',
          },
        },
        {
          kind: 'metrics',
          items: [
            {
              value: '24',
              provenance: 'measured',
              countTo: 24,
              label: { en: 'Live trials', zh: 'Live trials', ru: 'Live trial' },
              detail: { en: 'One run, 2026-11-04', zh: '单轮运行，2026-11-04', ru: 'Один прогон, 2026-11-04' },
            },
            {
              value: '66.7%',
              provenance: 'measured',
              label: { en: 'Success', zh: '成功率', ru: 'Успех' },
              detail: { en: '16 passed / 8 failed', zh: '16 通过 / 8 失败', ru: '16 прошли / 8 упали' },
            },
            {
              value: '9.71 s',
              provenance: 'measured',
              label: { en: 'Median latency', zh: '中位延迟', ru: 'Медианная задержка' },
              detail: { en: 'P95 21.94 s', zh: 'P95 21.94 s', ru: 'P95 21,94 с' },
            },
            {
              value: '15.2%',
              provenance: 'measured',
              label: { en: 'Tool failure rate', zh: '工具失败率', ru: 'Доля отказов инструментов' },
              detail: { en: '15 / 99 completed tool results', zh: '15 / 99 个完成的工具结果', ru: '15 / 99 завершённых результатов' },
            },
          ],
        },
        {
          kind: 'table',
          caption: {
            en: 'Failure categories from the published baseline.',
            zh: '公开基线里的失败分类。',
            ru: 'Категории отказов из опубликованного baseline.',
          },
          head: [
            { en: 'Category', zh: '分类', ru: 'Категория' },
            { en: 'Count', zh: '数量', ru: 'Количество' },
            { en: 'Observed signal', zh: '观察到的信号', ru: 'Наблюдаемый сигнал' },
          ],
          rows: [
            [
              { en: 'Model', zh: '模型', ru: 'Модель' },
              { en: '4', zh: '4', ru: '4' },
              {
                en: 'Exploration consumed the step budget before a write',
                zh: '探索耗尽步数预算，尚未执行写入',
                ru: 'Исследование съело бюджет шагов до записи',
              },
            ],
            [
              { en: 'Permission', zh: '权限', ru: 'Permission' },
              { en: '3', zh: '3', ru: '3' },
              {
                en: 'A path policy rejected a valid-looking tool attempt',
                zh: '路径策略拒绝了看似合法的工具尝试',
                ru: 'Политика путей отклонила выглядящую легальной попытку',
              },
            ],
            [
              { en: 'Tool', zh: '工具', ru: 'Инструмент' },
              { en: '1', zh: '1', ru: '1' },
              {
                en: 'A search returned an error code while the task still answered from files',
                zh: '一次搜索返回错误码，任务最终仍从文件里得到答案',
                ru: 'Поиск вернул код ошибки, но задача была решена по файлам',
              },
            ],
          ],
        },
        {
          kind: 'prose',
          body: {
            en: 'The runtime micro-benchmarks are separate from model quality. Reusing one keep-alive HTTP client took ten provider-style requests from 7,825 ms and ten TCP connections to 8.4 ms and one connection. A no-match repo grep runs in 51.4 ms; a Python glob in 7.8 ms; a session append commits in 0.071 ms.',
            zh: '运行时微基准与模型质量是两件事。复用一条 keep-alive HTTP 客户端，把 10 次 Provider 风格请求从 7,825 ms / 10 条 TCP 连接降到 8.4 ms / 1 条连接。全仓库无命中 grep 51.4 ms；Python glob 7.8 ms；会话追加提交 0.071 ms。',
            ru: 'Микробенчмарки рантайма отделены от качества модели. Один keep-alive HTTP-клиент сократил десять запросов с 7 825 мс и десяти TCP-соединений до 8,4 мс и одного соединения. grep без совпадений — 51,4 мс; glob Python — 7,8 мс; append сессии — 0,071 мс.',
          },
        },
      ],
    },
    {
      id: 'results',
      title: { en: 'What shipped', zh: '交付了什么', ru: 'Что сделано' },
      blocks: [
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Runtime', zh: '运行时', ru: 'Рантайм' },
              body: {
                en: 'A 20k-line Python package with an event-driven loop, 146 tools, layered context management, file memory, 11 subagent roles, in-process teams, hooks, MCP client/server, plan mode, worktrees and a full-screen terminal dashboard.',
                zh: '约 2 万行 Python：事件驱动主循环、146 个工具、分层上下文管理、文件记忆、11 个子代理角色、进程内团队、hooks、MCP 客户端/服务端、计划模式、worktree 和全屏终端 Dashboard。',
                ru: 'Пакет Python на ~20k строк: цикл на событиях, 146 инструментов, слоистый контекст, файловая память, 11 ролей субагентов, команды в процессе, hooks, MCP client/server, plan mode, worktrees и полноэкранный терминальный dashboard.',
              },
            },
            {
              label: { en: 'Safety', zh: '安全', ru: 'Безопасность' },
              body: {
                en: 'Permission modes, layered Tool(pattern) rules, a flag- and subcommand-aware shell allowlist, PowerShell token analysis, secret scrubbing for child processes and tool output, and a fail-closed registry gate.',
                zh: '权限模式、分层 Tool(pattern) 规则、flag 与子命令感知的 Shell 白名单、PowerShell 令牌分析、子进程与工具输出的密钥脱敏，以及 fail-closed registry 权限门。',
                ru: 'Режимы permission, слоистые Tool(pattern), flag- и subcommand-aware shell allowlist, токенный анализ PowerShell, очистка секретов для дочерних процессов и вывода инструментов, fail-closed gate в registry.',
              },
            },
            {
              label: { en: 'Verification', zh: '验证', ru: 'Проверка' },
              body: {
                en: '757 passing tests, an isolated mock/live evaluation harness with JSONL traces, a published baseline with failures, runtime micro-benchmarks, and a CI matrix across Python 3.10–3.13 on Windows and Linux.',
                zh: '656 个通过测试、隔离的 mock/live 评测工具与 JSONL trace、连同失败一起公开的基线、运行时微基准，以及覆盖 Python 3.10–3.13、Windows 与 Linux 的 CI 矩阵。',
                ru: '656 проходящих тестов, изолированный mock/live evaluation harness с JSONL трассами, опубликованный baseline с отказами, микробенчмарки и CI-матрица Python 3.10–3.13 на Windows и Linux.',
              },
            },
            {
              label: { en: 'Packaging', zh: '打包', ru: 'Упаковка' },
              body: {
                en: 'A PEP 621-valid wheel that ships all 28 bundled skills, an MIT license, bilingual README, issue/PR templates, security policy and a release-grade repository layout.',
                zh: 'PEP 621 合法的 wheel，包含全部 28 个内置 skill；MIT 许可证、双语 README、issue/PR 模板、安全策略和发布级仓库结构。',
                ru: 'PEP 621-валидный wheel со всеми 28 bundled skills, MIT-лицензия, двуязычный README, шаблоны issue/PR, security policy и структура репозитория release-уровня.',
              },
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'warning',
          title: {
            en: 'What is not done yet',
            zh: '还没做到的部分',
            ru: 'Что ещё не сделано',
          },
          body: {
            en: 'The streaming tool executor is not implemented; tools start after the model turn finishes. Workspace trust is not enforced yet: a cloned .lilbot config could load hooks or MCP servers without consent. Cost is not shown in USD. The live baseline is 66.7%, not frontier parity. These are the next milestones, in that order.',
            zh: '流式工具执行器还没做：工具要等模型回合结束才启动。工作区信任还没强制：克隆仓库里的 .lilbot 配置可能在没有确认的情况下加载 hooks 或 MCP server。成本还没有美元展示。live 基线是 66.7%，不是前沿水平。这些就是接下来的里程碑，按这个顺序。',
            ru: 'Streaming tool executor ещё не реализован: инструменты стартуют после хода модели. Workspace trust пока не enforced: клонированный .lilbot config может загрузить hooks или MCP server без согласия. Стоимость не показывается в USD. Live baseline — 66,7%, не паритет с frontier. Это следующие milestones в указанном порядке.',
          },
        },
      ],
    },
    {
      id: 'demo',
      title: { en: 'Demo', zh: '演示', ru: 'Демо' },
      blocks: [
        {
          kind: 'media',
          src: '/assets/real/lilbot-dashboard.webp',
          type: 'image',
          mediaKind: 'capture',
          ratio: '1746 / 1136',
          alt: {
            en: 'LilBot full-screen dashboard with the agent panel, 146-tool inventory, work panel, trace and composer.',
            zh: 'LilBot 全屏 Dashboard：Agent 面板、146 个工具清单、Work 面板、Trace 与 Composer。',
            ru: 'Полноэкранный dashboard LilBot: панель агента, инвентарь 146 инструментов, Work, Trace и composer.',
          },
          caption: {
            en: 'Real capture of the offline provider at startup. The top bar shows model, provider, context usage and permission mode.',
            zh: '离线 Provider 启动时的真实截图。顶栏显示模型、Provider、上下文用量和权限模式。',
            ru: 'Реальный снимок offline provider при запуске. Верхняя панель показывает модель, provider, использование контекста и режим permission.',
          },
        },
        {
          kind: 'media',
          src: '/assets/real/lilbot-coding-session.webp',
          type: 'image',
          mediaKind: 'capture',
          ratio: '1746 / 1136',
          alt: {
            en: 'A real LilBot tool run: exec_shell runs pytest, the permission gate is approved, and the result lands in the trace.',
            zh: '一次真实的 LilBot 工具执行：exec_shell 运行 pytest，权限门被批准，结果进入 Trace。',
            ru: 'Реальный запуск инструмента LilBot: exec_shell запускает pytest, permission gate одобрен, результат попадает в Trace.',
          },
          caption: {
            en: 'Same loop, gate and executor as a cloud model. Only the model decisions are deterministic here.',
            zh: '与云端模型相同的循环、权限门和执行器。这里只有模型决策是确定性的。',
            ru: 'Тот же цикл, gate и executor, что и у облачной модели. Детерминированы только решения модели.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The dashboard is not a mock: it is a real terminal capture. The offline provider exists so the runtime can be demonstrated and tested without a key; a cloud endpoint changes the decisions, not the execution path.',
            zh: 'Dashboard 不是 mock：它是一张真实的终端截图。离线 Provider 的存在是为了在没有 Key 的情况下演示和测试运行时；云端端点改变的是模型决策，不是执行路径。',
            ru: 'Dashboard — не mock: это реальный снимок терминала. Offline provider существует, чтобы демонстрировать и тестировать рантайм без ключа; облачный endpoint меняет решения модели, а не путь исполнения.',
          },
        },
      ],
    },
    {
      id: 'reflection',
      title: { en: 'What I would change', zh: '如果重来', ru: 'Что бы я изменил' },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'I would build the evaluation harness before the tool count. The first version added capabilities faster than it added evidence, and the 66.7% baseline shows exactly where that shows up: exploration burns the step budget, path policy rejects valid attempts, and the model sometimes explains a failure instead of fixing it. The next milestone is not more tools; it is a lower-variance loop with a harder suite and a published failure taxonomy.',
            zh: '我会先做评测工具，再堆工具数量。第一版增加能力的速度快于增加证据的速度，66.7% 的基线正好暴露了这一点：探索烧掉步数预算、路径策略拒绝合法尝试、模型有时解释失败而不是修复失败。下一个里程碑不是更多工具，而是一个方差更低、测试集更难、失败分类公开的循环。',
            ru: 'Я бы построил evaluation harness раньше, чем наращивал число инструментов. Первая версия добавляла возможности быстрее, чем доказательства, и baseline 66,7% показывает, где это проявляется: исследование съедает бюджет шагов, политика путей отклоняет валидные попытки, а модель иногда объясняет отказ вместо исправления. Следующий milestone — не больше инструментов, а цикл с меньшей дисперсией, более сложный suite и опубликованная таксономия отказов.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The other change is workspace trust. A coding agent opens a repository it did not write; loading that repository’s hooks, MCP servers or project agents without consent is a supply-chain hole. It is the next security milestone, before any new capability.',
            zh: '另一个改动是工作区信任。Coding Agent 打开的是它没写过的仓库；未经确认就加载仓库里的 hooks、MCP server 或项目级 agent，是一条供应链漏洞。这是下一个安全里程碑，排在所有新能力之前。',
            ru: 'Второе изменение — workspace trust. Coding agent открывает репозиторий, который писал не он; загружать его hooks, MCP servers или project agents без согласия — дыра в supply chain. Это следующий security milestone, раньше любых новых возможностей.',
          },
        },
      ],
    },
  ],
};
