import type { Project } from '../types';

export const lilbot: Project = {
  slug: 'lilbot',
  title: {
    en: 'Lilbot — A Small Agent Runtime',
    zh: 'Lilbot — 一个小而完整的 Agent 运行时',
    ru: 'Lilbot — небольшая среда выполнения агента',
  },
  tagline: {
    en: 'Tool-calling, durable memory and replayable traces in a local-first loop',
    zh: '工具调用、持久记忆与可回放轨迹，构成一个本地优先的闭环',
    ru: 'Вызов инструментов, стойкая память и воспроизводимые трассы в локальном цикле',
  },
  summary: {
    en: 'An agent runtime built to be debuggable. Every turn is a durable, replayable trace; memory is explicit files on disk rather than an opaque vector blob; and tools are contracts validated at both ends. Small enough to read in an afternoon, which is the point.',
    zh: '一个为"可调试"而生的 Agent 运行时。每一轮都是可持久化、可回放的轨迹；记忆是磁盘上的显式文件，而不是不透明的向量团；工具是两端都校验的契约。小到可以用一个下午读完——这正是设计目标。',
    ru: 'Среда выполнения агента, построенная ради отлаживаемости. Каждый ход — стойкая воспроизводимая трасса; память это явные файлы на диске, а не непрозрачный ком векторов; инструменты — контракты, проверяемые с обеих сторон. Достаточно маленькая, чтобы прочитать за вечер, и в этом вся суть.',
  },
  domain: 'agentic',
  alsoIn: ['infra'],
  period: '2025 — now',
  role: { en: 'Sole author', zh: '独立开发', ru: 'Единственный автор' },
  status: 'active',
  accent: 'flux',
  stack: ['Python', 'MCP', 'Pydantic', 'SQLite', 'vLLM / Ollama', 'OpenTelemetry', 'pytest'],
  highlights: [
    {
      value: '100%',
      provenance: 'spec',
      label: { en: 'Turns replayable', zh: '可回放轮次', ru: 'Ходов воспроизводимо' },
      detail: {
        en: 'Deterministic from a recorded trace',
        zh: '由记录的轨迹确定性重放',
        ru: 'Детерминированно из записанной трассы',
      },
    },
    {
      value: '0',
      provenance: 'spec',
      label: { en: 'Hidden state', zh: '隐藏状态', ru: 'Скрытого состояния' },
      detail: {
        en: 'Memory is readable files on disk',
        zh: '记忆是磁盘上可读的文件',
        ru: 'Память — читаемые файлы на диске',
      },
    },
    {
      value: '2',
      provenance: 'spec',
      countTo: 2,
      label: {
        en: 'Validation points per tool',
        zh: '每个工具的校验点',
        ru: 'Точек проверки на инструмент',
      },
      detail: { en: 'Schema in, schema out', zh: '入参校验，出参校验', ru: 'Схема на входе и на выходе' },
    },
  ],
  featured: true,
  span: 'wide',
  motif: 'stack',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题', ru: 'Задача' },
      lede: {
        en: 'Agent frameworks are easy to start with and very hard to debug.',
        zh: 'Agent 框架上手容易，调试极难。',
        ru: 'Агентные фреймворки легко начать и очень трудно отлаживать.',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'The demo of an agent framework is twenty lines and it works. The second month is different. An agent did something strange on Tuesday, you have a log that shows the final answer and maybe the tool names, and reproducing the run is impossible because the prompt was assembled from a retrieval call, a memory summary, and a system template that has since been edited.',
            zh: 'Agent 框架的演示只有二十行，而且能跑。第二个月就不一样了。某个 Agent 在周二做了件奇怪的事，你手上的日志显示了最终答案、可能还有工具名，而复现这次运行是不可能的——因为那个 prompt 是由一次检索调用、一份记忆摘要，以及一个此后已被修改的系统模板拼起来的。',
            ru: 'Демо агентного фреймворка — двадцать строк, и оно работает. Второй месяц выглядит иначе. Агент сделал во вторник нечто странное, у вас есть лог с финальным ответом и, может быть, именами инструментов, а воспроизвести запуск невозможно: промпт был собран из вызова поиска, выжимки из памяти и системного шаблона, который с тех пор отредактировали.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'Lilbot is my answer to that, and the design brief was narrow: I should be able to take any turn that has ever run, replay it offline, change one thing, and see what happens. Everything else — abstraction, feature breadth, elegance — is subordinate to that.',
            zh: 'Lilbot 是我对此的回答，设计目标很窄：我应该能拿出历史上任何一次运行过的轮次，离线回放它，改动一处，看会发生什么。其他一切——抽象、功能广度、优雅——都从属于这一点。',
            ru: 'Lilbot — мой ответ на это, и техзадание было узким: я должен уметь взять любой когда-либо выполнявшийся ход, воспроизвести его офлайн, изменить одну вещь и посмотреть, что получится. Всё остальное — абстракции, широта возможностей, изящество — этому подчинено.',
          },
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'System architecture', zh: '系统架构', ru: 'Архитектура системы' },
      lede: {
        en: 'A loop, a trace store, a memory tier and a tool registry. Nothing else.',
        zh: '一个循环、一个轨迹存储、一层记忆、一个工具注册表。仅此而已。',
        ru: 'Цикл, хранилище трасс, слой памяти и реестр инструментов. Больше ничего.',
      },
      blocks: [
        {
          kind: 'diagram',
          id: 'agent-runtime',
          caption: {
            en: 'One turn through the runtime. Select a component to see what it owns.',
            zh: '一轮在运行时中的流动。点击组件查看其职责。',
            ru: 'Один ход через среду выполнения. Выберите компонент, чтобы увидеть его зону ответственности.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The trace store is the architecture. Every turn appends an immutable record containing the fully-resolved prompt — not the template, the actual bytes sent — plus the model identifier and sampling parameters, every tool call with its arguments and raw result, and the memory reads that informed the turn. From that record the turn can be reconstructed exactly, with the model call stubbed out or re-run.',
            zh: '轨迹存储就是整个架构。每一轮都追加一条不可变记录，内含完全解析后的 prompt——不是模板，而是真正发出去的字节——加上模型标识与采样参数、每次工具调用的参数与原始结果，以及支撑这一轮的记忆读取。凭这条记录，这一轮可以被精确重建，模型调用可以被打桩，也可以重跑。',
            ru: 'Хранилище трасс и есть архитектура. Каждый ход добавляет неизменяемую запись с полностью развёрнутым промптом — не шаблоном, а реально отправленными байтами, — плюс идентификатор модели и параметры сэмплирования, каждый вызов инструмента с аргументами и сырым результатом, и те чтения из памяти, на которых ход держался. По этой записи ход восстанавливается точно, с заглушенным или заново выполненным обращением к модели.',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Memory as files', zh: '记忆即文件', ru: 'Память как файлы' },
              body: {
                en: 'Durable memory is a directory of small markdown files with front-matter, indexed by SQLite FTS. Not because vectors are bad, but because when an agent recalls something wrong I want to open the file and read it. Semantic search is layered on top rather than underneath.',
                zh: '持久记忆是一个目录，里面是带 front-matter 的小 markdown 文件，由 SQLite FTS 建索引。不是因为向量不好，而是当 Agent 回忆错了的时候，我想能打开那个文件直接读。语义检索叠加在它之上，而不是垫在它之下。',
                ru: 'Долговременная память — это каталог небольших markdown-файлов с front-matter, проиндексированных через SQLite FTS. Не потому, что векторы плохи, а потому, что когда агент вспомнил что-то неверно, я хочу открыть файл и прочитать его. Семантический поиск положен сверху, а не подложен снизу.',
              },
            },
            {
              label: { en: 'Tools are contracts', zh: '工具即契约', ru: 'Инструменты — это контракты' },
              body: {
                en: 'Each tool declares a Pydantic input and output model. Arguments are validated before the call and results before they re-enter context, so a tool returning malformed data fails at the boundary instead of poisoning the next three turns.',
                zh: '每个工具声明 Pydantic 的入参与出参模型。调用前校验参数，结果重新进入上下文前再校验一次——于是返回畸形数据的工具在边界处就失败，而不是污染接下来三轮。',
                ru: 'Каждый инструмент объявляет модели входа и выхода на Pydantic. Аргументы проверяются до вызова, результаты — до возврата в контекст, поэтому инструмент, вернувший некорректные данные, падает на границе, а не отравляет следующие три хода.',
              },
            },
            {
              label: {
                en: 'Planner / executor split',
                zh: '规划器与执行器分离',
                ru: 'Разделение планировщика и исполнителя',
              },
              body: {
                en: 'Planning and execution are separate calls with separate budgets. A planner that cannot see tool output cannot rationalise a failure into a plausible-sounding success, which is the single most common long-horizon failure I have observed.',
                zh: '规划与执行是两次独立调用，各有独立预算。看不到工具输出的规划器，就无法把一次失败合理化为一个听起来可信的成功——这是我观察到的最常见的长程失效模式。',
                ru: 'Планирование и исполнение — разные вызовы с разными бюджетами. Планировщик, который не видит вывод инструментов, не может рационализировать отказ в правдоподобно звучащий успех, а это самый частый режим отказа на длинном горизонте, который я наблюдал.',
              },
            },
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: {
            en: 'Replay is the primary debugging interface.',
            zh: '回放是首要的调试入口。',
            ru: 'Воспроизведение — основной интерфейс отладки.',
          },
          code: `# Replay any historical turn with one thing changed.
# The trace holds the resolved prompt bytes, so this is deterministic
# apart from the model call itself.
$ lilbot replay 2026-10-18T14:22:07.turn-4 --model qwen3-14b
$ lilbot replay 2026-10-18T14:22:07.turn-4 --stub-tools   # no side effects
$ lilbot diff   2026-10-18T14:22:07.turn-4 --against head

# What this makes possible: a bug report is a trace id. "It did something
# weird" becomes a test case, which is the whole difference between
# debugging an agent and speculating about one.`,
        },
      ],
    },
    {
      id: 'decisions',
      title: { en: 'Engineering decisions', zh: '工程决策', ru: 'Инженерные решения' },
      blocks: [
        {
          kind: 'callout',
          tone: 'insight',
          title: {
            en: 'Store resolved prompts, not templates',
            zh: '存已解析的 prompt，而不是模板',
            ru: 'Хранить развёрнутые промпты, а не шаблоны',
          },
          body: {
            en: 'This is the decision I would carry to any agent system. Logging the template plus variables feels equivalent and is not: the resolution logic itself changes, truncation and ordering are part of the behaviour, and retrieved context is non-deterministic. Storing the exact bytes costs disk, which is cheap, and buys the ability to answer "what did the model actually see?", which is otherwise unanswerable.',
            zh: '这是我会带到任何 Agent 系统里的决策。记录模板加变量看似等价，其实不是：解析逻辑本身会变，截断与排序本身就是行为的一部分，而检索到的上下文是非确定性的。存下确切字节的代价是磁盘空间（很便宜），换来的是回答"模型实际看到了什么？"的能力——否则这个问题根本无法回答。',
            ru: 'Это решение я перенёс бы в любую агентную систему. Записывать шаблон вместе с переменными ощущается равноценным, но таковым не является: сама логика подстановки меняется, усечение и порядок — часть поведения, а найденный контекст недетерминирован. Хранение точных байтов стоит дискового места, которое дёшево, и покупает возможность ответить на вопрос «что модель увидела на самом деле?», который иначе остаётся без ответа.',
          },
        },
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
              { en: 'Memory substrate', zh: '记忆载体', ru: 'Носитель памяти' },
              { en: 'Files + FTS index', zh: '文件 + 全文索引', ru: 'Файлы + полнотекстовый индекс' },
              {
                en: 'Vector DB as source of truth',
                zh: '向量库作为真相源',
                ru: 'Векторная БД как источник истины',
              },
              {
                en: 'Human-inspectable, diffable, and survives any embedding-model change without a re-index migration.',
                zh: '人可检视、可 diff，并且在更换嵌入模型时不需要重建索引迁移。',
                ru: 'Доступно человеку для чтения, поддаётся diff и переживает любую смену модели эмбеддингов без миграции с переиндексацией.',
              },
            ],
            [
              { en: 'Tool protocol', zh: '工具协议', ru: 'Протокол инструментов' },
              { en: 'MCP', zh: 'MCP', ru: 'MCP' },
              { en: 'Bespoke plugin API', zh: '自定义插件 API', ru: 'Собственный plugin API' },
              {
                en: 'Tools written for this runtime work elsewhere. A private plugin format is a tax paid forever for a week of early convenience.',
                zh: '为这个运行时写的工具在别处也能用。私有插件格式是为早期一周的便利而永久缴纳的税。',
                ru: 'Инструменты, написанные для этой среды, работают и в другой. Собственный формат плагинов — налог, который платишь вечно за неделю удобства на старте.',
              },
            ],
            [
              { en: 'Model binding', zh: '模型绑定', ru: 'Привязка к модели' },
              {
                en: 'OpenAI-compatible endpoint',
                zh: 'OpenAI 兼容端点',
                ru: 'Эндпоинт, совместимый с OpenAI',
              },
              { en: 'Direct SDK coupling', zh: '直接耦合某家 SDK', ru: 'Прямая связка с SDK' },
              {
                en: 'The same code runs against vLLM locally and a hosted model, which makes model choice an experiment rather than a migration.',
                zh: '同一份代码既能打本地 vLLM，也能打托管模型——这让模型选择变成一次实验，而不是一次迁移。',
                ru: 'Один и тот же код работает с локальным vLLM и с размещённой моделью, что превращает выбор модели в эксперимент, а не в миграцию.',
              },
            ],
            [
              { en: 'Concurrency', zh: '并发', ru: 'Параллелизм' },
              {
                en: 'Single-threaded turn loop',
                zh: '单线程轮次循环',
                ru: 'Однопоточный цикл хода',
              },
              {
                en: 'Parallel tool fan-out by default',
                zh: '默认并行工具扇出',
                ru: 'Параллельный веер вызовов по умолчанию',
              },
              {
                en: 'Deliberate limitation. Parallel execution makes traces non-linear and replay ambiguous; it is opt-in per tool group, not the default.',
                zh: '刻意的限制。并行执行会让轨迹非线性、回放语义含糊；它按工具组显式开启，而不是默认行为。',
                ru: 'Намеренное ограничение. Параллельное исполнение делает трассы нелинейными, а воспроизведение неоднозначным; оно включается явно для группы инструментов, а не действует по умолчанию.',
              },
            ],
          ],
        },
      ],
    },
    {
      id: 'experiments',
      title: { en: 'Experiments', zh: '实验', ru: 'Эксперименты' },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'Because traces are replayable, the test suite is largely built from real failures. When the agent misbehaves, the trace id becomes a fixture; the fix has to make that exact turn come out right without breaking the other fixtures. Over a few months this accumulated into a regression suite that is far more representative than anything I would have invented.',
            zh: '因为轨迹可回放，测试套件基本是由真实失效构成的。Agent 行为异常时，轨迹 id 就成为一个 fixture；修复必须让那一轮确切地跑对，同时不破坏其他 fixture。几个月下来，这积累成一套回归测试，比我自己能凭空设计的任何测试集都更具代表性。',
            ru: 'Поскольку трассы воспроизводимы, набор тестов в основном вырос из реальных отказов. Когда агент ведёт себя неправильно, идентификатор трассы становится фикстурой; исправление обязано заставить именно этот ход отработать верно, не сломав остальные фикстуры. За несколько месяцев это сложилось в регрессионный набор, куда более представительный, чем всё, что я придумал бы сам.',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: {
                en: 'Context-order sensitivity',
                zh: '上下文顺序敏感性',
                ru: 'Чувствительность к порядку контекста',
              },
              body: {
                en: 'Replaying identical turns with memory items permuted. Results shifted more than expected, which is why memory assembly order is now fixed and recorded rather than whatever the index returned.',
                zh: '在记忆条目被打乱顺序的情况下回放相同轮次。结果变化比预期更大——因此现在记忆的组装顺序是固定且被记录的，而不是索引返回的任意顺序。',
                ru: 'Воспроизведение одинаковых ходов с переставленными элементами памяти. Результаты расходились сильнее, чем ожидалось, — поэтому порядок сборки памяти теперь фиксирован и записывается, а не берётся таким, каким его вернул индекс.',
              },
            },
            {
              label: {
                en: 'Tool-failure recovery',
                zh: '工具失败恢复',
                ru: 'Восстановление после отказа инструмента',
              },
              body: {
                en: 'Injecting timeouts, malformed JSON and empty results at the tool boundary. The planner/executor split and output validation together turned most of these from silent derailment into a clean retry.',
                zh: '在工具边界注入超时、畸形 JSON 与空结果。规划器/执行器分离与出参校验共同作用，把这些情况中的大多数从"静默脱轨"变成了"干净重试"。',
                ru: 'Внедрение тайм-аутов, некорректного JSON и пустых результатов на границе инструментов. Разделение планировщика и исполнителя вместе с проверкой выхода превратило большинство таких случаев из тихого схода с рельсов в аккуратную повторную попытку.',
              },
            },
            {
              label: {
                en: 'Model swap under fixed traces',
                zh: '固定轨迹下的模型替换',
                ru: 'Смена модели при фиксированных трассах',
              },
              body: {
                en: 'Running the same fixture set across several local models. A useful proxy for how much of the behaviour is the runtime versus the model — more of it is the runtime than I assumed.',
                zh: '在多个本地模型上跑同一套 fixture。这是衡量"行为有多少来自运行时、多少来自模型"的有用代理指标——来自运行时的部分比我原本以为的更多。',
                ru: 'Прогон одного и того же набора фикстур на нескольких локальных моделях. Полезный косвенный показатель того, сколько в поведении от среды выполнения, а сколько от модели: от среды оказалось больше, чем я предполагал.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'results',
      title: { en: 'Results', zh: '结果', ru: 'Результаты' },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'The outcome is a change in how debugging feels rather than a benchmark number. "The agent did something weird" used to be the start of a guessing game. Now it is a trace id, a replay, and usually a fifteen-minute fix with a regression test attached. That is the entire value proposition and I would make the same trade — less abstraction, more recorded state — on any agent system I build next.',
            zh: '成果体现在调试的体感变化上，而不是某个基准分数。"Agent 做了件奇怪的事"过去是一场猜谜的开始。现在它是一个轨迹 id、一次回放，通常再加一个十五分钟的修复和一个附带的回归测试。这就是全部的价值主张，而在我接下来构建的任何 Agent 系统上，我都会做同样的取舍——更少抽象，更多被记录的状态。',
            ru: 'Результат — это изменение в том, каково отлаживать, а не число в бенчмарке. «Агент сделал что-то странное» раньше было началом игры в угадайку. Теперь это идентификатор трассы, воспроизведение и обычно пятнадцатиминутное исправление с приложенным регрессионным тестом. В этом всё ценностное предложение, и я пошёл бы на тот же размен — меньше абстракций, больше записанного состояния — в любой следующей агентной системе.',
          },
        },
        {
          kind: 'callout',
          tone: 'note',
          title: {
            en: 'Deliberately not a framework',
            zh: '刻意不做成框架',
            ru: 'Намеренно не фреймворк',
          },
          body: {
            en: 'Lilbot does not aim to compete with the large agent frameworks and would lose if it tried. It exists to be small enough that one person can hold all of it in their head — which is a real engineering property, not a limitation to apologise for.',
            zh: 'Lilbot 不以与大型 Agent 框架竞争为目标，真要比也会输。它存在的意义是小到一个人能把它整个装进脑子里——这是一项真实的工程属性，而不是需要道歉的局限。',
            ru: 'Lilbot не ставит целью конкурировать с большими агентными фреймворками и проиграл бы, если бы попытался. Он существует, чтобы быть достаточно маленьким: один человек держит его целиком в голове — и это настоящее инженерное свойство, а не недостаток, за который нужно извиняться.',
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
            en: 'I would add the trace store before the agent loop, not after. The first six weeks produced behaviour I still cannot explain because those runs were never recorded, and that is simply lost information. The instrumentation is not the boring part you add later; it is the thing that makes the interesting part tractable.',
            zh: '我会在 Agent 循环之前就加上轨迹存储，而不是之后。最初六周产生过一些我至今无法解释的行为，因为那些运行从未被记录——这就是彻底丢失的信息。埋点不是"之后再补的无聊部分"；它正是让有趣部分变得可处理的那个东西。',
            ru: 'Я бы добавил хранилище трасс до цикла агента, а не после. Первые шесть недель дали поведение, которое я до сих пор не могу объяснить, потому что те запуски не записывались, — и это просто потерянная информация. Инструментирование — не скучная часть, которую добавляют потом; это то, что делает интересную часть поддающейся разбору.',
          },
        },
      ],
    },
  ],
};
