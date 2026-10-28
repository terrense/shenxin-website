import type { Project } from '../types';

export const clinicalMultimodalAgent: Project = {
  slug: 'clinical-multimodal-agent',
  title: {
    en: 'Multilingual Hospital Assistance Agent',
    zh: '多语种医院导诊助手',
    ru: 'Многоязычный агент-навигатор по больнице',
  },
  tagline: {
    en: 'Speech, retrieval, and a hard rule against diagnosing',
    zh: '语音、检索，以及一条绝不诊断的硬规则',
    ru: 'Речь, поиск и жёсткий запрет на постановку диагноза',
  },
  summary: {
    en: 'A multilingual medical-assistance agent for hospital front-of-house: speech recognition tuned for medical vocabulary, retrieval-augmented answers grounded in the hospital’s own information, and safety-aware dialogue for guidance, pre-consultation intake and general enquiries. The engineering centre of gravity is not accuracy — it is knowing reliably when to stop and route to a human.',
    zh: '面向医院前端场景的多语种医疗辅助 Agent：针对医学词汇优化的语音识别、以医院自有信息为依据的检索增强回答，以及用于导诊、预问诊与常规咨询的安全导向对话。工程重心不在准确率——而在可靠地知道何时该停下并转交人工。',
    ru: 'Многоязычный медицинский агент для зоны регистратуры: распознавание речи, настроенное на медицинскую лексику, ответы с опорой на поиск по собственным данным больницы и диалог с учётом безопасности для навигации, предварительного опроса и общих справок. Центр тяжести этой работы не в точности, а в умении надёжно понять, когда нужно остановиться и передать человеку.',
  },
  domain: 'healthcare',
  alsoIn: ['agentic', 'infra'],
  period: '2024 — 2025',
  role: {
    en: 'Engineering lead — speech, retrieval & safety layer',
    zh: '工程负责人 — 语音、检索与安全层',
    ru: 'Руководитель разработки — речь, поиск и слой безопасности',
  },
  status: 'research',
  accent: 'ember',
  stack: [
    'Qwen-Audio (fine-tuned)',
    'Whisper',
    'Hybrid BM25 + dense retrieval',
    'Multilingual NLU',
    'vLLM',
    'Pydantic',
    'Python',
  ],
  highlights: [
    {
      value: '100%',
      provenance: 'spec',
      label: { en: 'Claims with citations', zh: '带引用的陈述', ru: 'Утверждений со ссылкой' },
      detail: {
        en: 'Uncited sentences are blocked, not flagged',
        zh: '无引用的句子直接拦截，而非仅标记',
        ru: 'Фраза без ссылки блокируется, а не помечается',
      },
    },
    {
      value: '0',
      provenance: 'spec',
      label: { en: 'Diagnoses offered', zh: '给出的诊断数', ru: 'Поставленных диагнозов' },
      detail: {
        en: 'Structurally impossible, not discouraged',
        zh: '结构上不可能，而非仅被劝阻',
        ru: 'Невозможно структурно, а не просто не рекомендуется',
      },
    },
    {
      value: 'local',
      provenance: 'spec',
      label: { en: 'Inference boundary', zh: '推理边界', ru: 'Контур инференса' },
      detail: {
        en: 'No PHI leaves the deployment',
        zh: '患者数据不离开部署环境',
        ru: 'Данные пациентов не покидают контур',
      },
    },
  ],
  featured: true,
  span: 'cell',
  motif: 'scan',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题', ru: 'Задача' },
      lede: {
        en: 'The front desk of a hospital is a queue of people who do not know where to go.',
        zh: '医院的导医台前，是一队不知道该去哪里的人。',
        ru: 'Стойка справки в больнице — это очередь из людей, которые не знают, куда им идти.',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'A large hospital runs dozens of departments across several buildings. A patient arriving with a symptom and no medical training has to translate that symptom into a department, find the building, understand the registration process — and do all of it while unwell. Most of the queue at an information desk is this, repeated, and a meaningful fraction of it is not in the local language.',
            zh: '一家大型医院有分布在数栋楼里的几十个科室。一位带着症状、没有医学背景的患者，必须把症状翻译成科室、找到楼栋、搞懂挂号流程——而且要在身体不适的状态下完成这一切。导医台前排的队，大多就是这件事的反复上演，其中相当一部分还不使用本地语言。',
            ru: 'В крупной больнице десятки отделений, разбросанных по нескольким корпусам. Пациент, пришедший с симптомом и без медицинского образования, должен перевести этот симптом в название отделения, найти корпус, разобраться в порядке записи — и проделать всё это, будучи нездоровым. Бо́льшая часть очереди у справочной — это оно, повторённое много раз, и заметная её доля говорит не на местном языке.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'This looks like an easy win for a language model, and the easy version is dangerous. "Which department should I see for chest pain?" is a routing question with a safe answer. It is also one word away from "what is causing my chest pain?", which is a diagnosis — and an agent that answers the first fluently will answer the second fluently too, unless something stops it. The system has to be built so that stopping is structural rather than a matter of prompt discipline.',
            zh: '这看起来是语言模型的一道送分题，而送分版本恰恰危险。"胸痛应该挂哪个科？"是一个有安全答案的分诊问题。它与"我的胸痛是什么引起的？"只差一个词，而后者属于诊断——一个能流畅回答前者的 Agent，若无机制拦阻，同样会流畅地回答后者。系统必须这样构建：让"停下"成为结构性的，而不是靠 prompt 自律。',
            ru: 'Это выглядит лёгкой победой для языковой модели, и именно лёгкий вариант опасен. «В какое отделение идти с болью в груди?» — вопрос маршрутизации с безопасным ответом. И от него одно слово до «что вызывает боль в груди?», а это уже диагноз: агент, свободно отвечающий на первое, так же свободно ответит и на второе, если его ничто не остановит. Систему нужно построить так, чтобы остановка была структурной, а не вопросом дисциплины в промпте.',
          },
        },
        {
          kind: 'callout',
          tone: 'note',
          title: { en: 'Status and scope', zh: '状态与范围', ru: 'Статус и границы' },
          body: {
            en: 'A research system evaluated on de-identified and synthetic data. It performs guidance, intake and information lookup for human review. It does not diagnose, does not triage acuity, and nothing here is deployed in patient care.',
            zh: '一个在去标识化与合成数据上评测的研究系统。它承担导诊、信息采集与信息查询，供人工复核。它不做诊断，不做急重症分级，本项目也没有任何部分用于真实诊疗。',
            ru: 'Исследовательская система, проверенная на обезличенных и синтетических данных. Она выполняет навигацию, предварительный сбор сведений и поиск информации — для последующей проверки человеком. Она не ставит диагнозов, не сортирует по тяжести состояния, и ничто из этого не внедрено в оказание медицинской помощи.',
          },
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'System architecture', zh: '系统架构', ru: 'Архитектура системы' },
      lede: {
        en: 'Speech in, typed evidence spans, then a generator that cannot invent.',
        zh: '语音进入，转为带类型的证据片段，再交给一个无法编造的生成器。',
        ru: 'На входе речь, затем типизированные фрагменты-свидетельства и генератор, который не может выдумывать.',
      },
      blocks: [
        {
          kind: 'diagram',
          id: 'clinical-fusion',
          caption: {
            en: 'Inputs are normalised into evidence spans before generation. Select a stage for its contract.',
            zh: '各路输入在生成之前被归一化为证据片段。点击任一阶段查看其契约。',
            ru: 'Входные данные приводятся к фрагментам-свидетельствам до генерации. Выберите этап, чтобы увидеть его контракт.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The architectural commitment is that inputs are not fused in embedding space. Each becomes a typed, timestamped **evidence span** carrying its own provenance — a transcript segment with speaker and millisecond offset, a hospital information record with its source table and last-updated date. Generation happens over that structured pool, never over raw audio embeddings.',
            zh: '架构上的核心承诺是：各路输入不在嵌入空间里融合。每一路都被转换为带类型、带时间戳的**证据片段**，各自携带来源信息——转写片段带说话人与毫秒偏移，医院信息记录带来源表与最后更新日期。生成发生在这个结构化池之上，而绝不在原始音频嵌入之上。',
            ru: 'Архитектурное обязательство состоит в том, что входы не сливаются в пространстве эмбеддингов. Каждый становится типизированным **фрагментом-свидетельством** с отметкой времени и собственным происхождением: сегмент расшифровки с говорящим и смещением в миллисекундах, запись из справочной системы больницы с таблицей-источником и датой последнего обновления. Генерация идёт поверх этого структурированного пула и никогда — поверх сырых аудиоэмбеддингов.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'This costs representational power, and the trade is deliberate. Once an answer is a vector you cannot say which record produced it or when that record was last correct — and "the cardiology department moved last month" is exactly the kind of staleness that makes a confident answer harmful. The requirement here is not "be accurate", it is "be answerable".',
            zh: '这牺牲了表示能力，而这个取舍是刻意的。一旦答案变成向量，你就无法说出它来自哪条记录、那条记录最后一次正确是在什么时候——而"心内科上个月搬走了"正是那种会让自信回答变得有害的过期性。这里的要求不是"准确"，而是"可被问责"。',
            ru: 'Это стоит выразительной силы, и размен сделан намеренно. Как только ответ стал вектором, уже не скажешь, какая запись его породила и когда эта запись была верной в последний раз, — а «кардиология переехала в прошлом месяце» и есть ровно тот вид устаревания, который делает уверенный ответ вредным. Требование здесь не «будь точным», а «будь объяснимым».',
          },
        },
        {
          kind: 'code',
          lang: 'python',
          caption: {
            en: 'The output schema. An uncited answer cannot be constructed, and a diagnosis has nowhere to live.',
            zh: '输出模式。无引用的回答无法被构造，而诊断性结论无处容身。',
            ru: 'Схема вывода. Ответ без ссылок невозможно построить, а диагнозу негде существовать.',
          },
          code: `class Answer(BaseModel):
    text: str
    # Not Optional. An answer with no supporting record is not representable,
    # so "forgot to cite" cannot happen downstream of validation.
    evidence: Annotated[list[SpanRef], Field(min_length=1)]

    # The enum has no 'diagnosis' member. That is the whole safety argument:
    # refusing is not a behaviour the model is asked to learn, it is the only
    # path the type system leaves open.
    intent: Literal["wayfinding", "department_routing", "process", "intake"]

class Turn(BaseModel):
    answer: Answer | None
    # Surfaced to staff as an explicit queue, never silently dropped.
    escalations: list[Escalation]

    @model_validator(mode="after")
    def no_silent_dead_ends(self) -> "Turn":
        """No answer and no escalation is a patient left standing there.
        That is the failure this system exists to prevent."""
        if self.answer is None and not self.escalations:
            raise ValueError("refused without routing the patient anywhere")
        return self`,
        },
      ],
    },
    {
      id: 'decisions',
      title: { en: 'Engineering decisions', zh: '工程决策', ru: 'Инженерные решения' },
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
              { en: 'Fusion level', zh: '融合层级', ru: 'Уровень слияния' },
              { en: 'Evidence spans', zh: '证据片段', ru: 'Фрагменты-свидетельства' },
              { en: 'Joint embedding', zh: '联合嵌入', ru: 'Совместный эмбеддинг' },
              {
                en: 'Provenance survives. Staff can click any answer and see which record it came from and when that record was last updated.',
                zh: '来源信息得以保留。工作人员可以点击任一回答，看到它来自哪条记录、该记录最后一次更新是什么时候。',
                ru: 'Происхождение сохраняется. Сотрудник может щёлкнуть по любому ответу и увидеть, из какой записи он взят и когда эта запись обновлялась в последний раз.',
              },
            ],
            [
              { en: 'Speech recognition', zh: '语音识别', ru: 'Распознавание речи' },
              { en: 'Domain fine-tuned', zh: '领域微调', ru: 'Дообучено на домене' },
              { en: 'General ASR as-is', zh: '直接用通用 ASR', ru: 'Общая ASR как есть' },
              {
                en: 'Department names, drug names and body-part terms are where general ASR fails, and they are the tokens the routing decision depends on.',
                zh: '科室名、药名与身体部位术语正是通用 ASR 失手之处，而分诊决策恰恰依赖这些 token。',
                ru: 'Названия отделений, препаратов и частей тела — именно то, на чём общая ASR ошибается, и именно те токены, от которых зависит маршрутизация.',
              },
            ],
            [
              { en: 'Multilingual handling', zh: '多语种处理', ru: 'Работа с языками' },
              {
                en: 'Detect, then answer in kind',
                zh: '先识别语种，再同语种作答',
                ru: 'Определить язык и отвечать на нём',
              },
              {
                en: 'Translate through a pivot language',
                zh: '经中枢语言翻译',
                ru: 'Перевод через язык-посредник',
              },
              {
                en: 'Pivoting through a third language compounds two error rates on exactly the medical terms that matter most.',
                zh: '经由第三语言中转，会在最关键的医学术语上叠加两道错误率。',
                ru: 'Переход через третий язык складывает две вероятности ошибки ровно на тех медицинских терминах, которые важнее всего.',
              },
            ],
            [
              { en: 'Retrieval', zh: '检索', ru: 'Поиск' },
              { en: 'Hybrid BM25 + dense', zh: 'BM25 + 稠密混合', ru: 'Гибрид BM25 + плотный' },
              { en: 'Dense only', zh: '仅稠密检索', ru: 'Только плотный' },
              {
                en: 'Hospital queries hinge on exact identifiers — department names, building numbers, form codes — which lexical search nails and embeddings blur.',
                zh: '医院场景的查询依赖精确标识——科室名、楼栋编号、单据代码——这些由词法检索精确命中，而嵌入会把它们模糊掉。',
                ru: 'Больничные запросы держатся на точных идентификаторах — названиях отделений, номерах корпусов, кодах бланков, — которые лексический поиск берёт точно, а эмбеддинги размывают.',
              },
            ],
            [
              { en: 'Inference location', zh: '推理位置', ru: 'Где выполняется инференс' },
              { en: 'Self-hosted', zh: '自建部署', ru: 'На своих серверах' },
              { en: 'Hosted API', zh: '托管 API', ru: 'Облачный API' },
              {
                en: 'Intake answers are patient data and cannot leave the deployment boundary. It also removes per-token cost from the evaluation loop.',
                zh: '预问诊的回答属于患者数据，不能离开部署边界。这同时也把按 token 计费从评测循环里移除了。',
                ru: 'Ответы предварительного приёма — данные пациента и не могут покидать контур развёртывания. Заодно это убирает плату за токены из цикла оценки.',
              },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'insight',
          title: {
            en: 'Escalation is a feature with a UI, not an error path',
            zh: '转人工是一个带界面的功能，而不是错误分支',
            ru: 'Передача человеку — это функция с интерфейсом, а не ветка ошибки',
          },
          body: {
            en: 'The first version treated "I cannot answer this" as a dead end and simply apologised. Patients found that worse than a wrong answer, because an apology with no next step leaves them exactly where they started — still in the queue, now also annoyed. Escalation is now a visible hand-off: "I cannot answer that, here is the desk that can, and here is what I have already recorded for you." Same underlying refusal, completely different usefulness.',
            zh: '第一个版本把"我无法回答"当作终点，只是道歉了事。患者认为这比错误答案更糟，因为一句没有下一步的道歉让他们停在原地——仍在排队，而且更烦躁了。现在转人工是一次可见的交接："这个问题我无法回答，能回答的是这个窗口，以及我已经为你记录好的内容。"底层的拒答相同，可用性完全不同。',
            ru: 'В первой версии «я не могу на это ответить» было тупиком, и система просто извинялась. Пациенты считали это хуже неверного ответа: извинение без следующего шага оставляет их ровно там, где они были, — всё ещё в очереди и вдобавок раздражёнными. Теперь передача человеку — это видимая эстафета: «на это я ответить не могу, вот стойка, где могут, и вот что я уже записал за вас». Отказ тот же самый, полезность совершенно другая.',
          },
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
            en: 'Standard generation metrics are close to useless here, because a fluent, confident, unsupported answer scores well on all of them. The evaluation is built around attribution and refusal instead.',
            zh: '标准生成指标在这里几乎无用，因为一个流畅、自信、无依据的回答在所有这些指标上都得分很高。因此评测围绕归因与拒答来构建。',
            ru: 'Стандартные метрики генерации здесь почти бесполезны: гладкий, уверенный и ничем не подкреплённый ответ получает по ним высокие оценки. Поэтому оценка построена вокруг атрибуции и отказа.',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: {
                en: 'Attribution precision',
                zh: '归因精确率',
                ru: 'Точность атрибуции',
              },
              body: {
                en: 'For each answer, does the cited record actually support it? Scored by a pinned judge model against human-labelled seeds, reported with bootstrap confidence intervals.',
                zh: '对每条回答，被引用的记录是否真的支撑它？由固定版本的评判模型对照人工标注种子集打分，并报告 bootstrap 置信区间。',
                ru: 'Для каждого ответа: действительно ли процитированная запись его подтверждает? Оценивается зафиксированной моделью-судьёй по размеченным человеком эталонам, с бутстреп-доверительными интервалами.',
              },
            },
            {
              label: {
                en: 'Diagnostic-bait probes',
                zh: '诱导诊断探测',
                ru: 'Провокации на диагноз',
              },
              body: {
                en: 'A suite phrased to invite a diagnosis — "is this serious?", "do I have X?", symptoms described in escalating detail. The target is refusal plus a useful hand-off, every time, in every supported language.',
                zh: '一组刻意诱导诊断的问题——"严重吗？""我是不是得了 X？"，以及逐步详述的症状描述。目标是每一次、在每种支持的语言下，都给出拒答并伴随一次有用的交接。',
                ru: 'Набор формулировок, подталкивающих к диагнозу: «это серьёзно?», «у меня X?», симптомы, описываемые со всё большей детализацией. Цель — отказ плюс полезная передача человеку, каждый раз и на каждом поддерживаемом языке.',
              },
            },
            {
              label: {
                en: 'Staleness injection',
                zh: '过期信息注入',
                ru: 'Подброс устаревших данных',
              },
              body: {
                en: 'Deliberately age a record — a department that has moved — and check the system surfaces the last-updated date rather than asserting the old location. Confidently stale is the failure mode most likely to survive testing.',
                zh: '刻意把某条记录置为过期——比如一个已搬迁的科室——检查系统是否会暴露最后更新日期，而不是断言旧位置。"自信地过期"是最可能逃过测试的失效模式。',
                ru: 'Намеренно «состарить» запись — отделение, которое переехало, — и проверить, что система показывает дату последнего обновления, а не утверждает старое расположение. Уверенно устаревший ответ — тот режим отказа, который вероятнее всего переживёт тестирование.',
              },
            },
            {
              label: {
                en: 'Accent and code-switching',
                zh: '口音与语码转换',
                ru: 'Акценты и переключение языка',
              },
              body: {
                en: 'Transcription quality across accents, and mid-sentence language switching — normal in real speech, absent from most benchmarks.',
                zh: '跨口音的转写质量，以及句中语码转换——这在真实对话中很常见，却在大多数基准里缺席。',
                ru: 'Качество расшифровки на разных акцентах и смена языка внутри фразы — обычное дело в живой речи и отсутствующее в большинстве бенчмарков.',
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
            en: 'The structural result is the one I would defend: with the schema above, an uncited answer is not a bug class that needs monitoring — it cannot be serialised, and a diagnostic answer has no representable intent to live in. That moves two whole categories of failure from "detect and alert" to "impossible", which is the only move that scales in a safety-relevant system.',
            zh: '我愿意为之辩护的是结构性结论：有了上面那个模式，无引用的回答不再是一类需要监控的 bug——它根本无法被序列化；而诊断性回答也没有任何可表示的 intent 可供容身。这把两整类失效从"检测并告警"搬到了"不可能发生"，而在安全相关的系统里，这是唯一可扩展的做法。',
            ru: 'Структурный результат — тот, который я готов защищать: с приведённой выше схемой ответ без ссылок не является классом ошибок, требующим мониторинга, — он просто не сериализуется, а диагностическому ответу негде существовать, потому что для него нет представимого намерения. Это переводит две целые категории отказов из «обнаруживать и оповещать» в «невозможно», а в системе, связанной с безопасностью, только такой переход и масштабируется.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The honest caveat is that attribution precision is bounded by the judge, and refusal measured against probes I wrote myself is easier than refusal against a patient who is frightened and insistent. Both are measured, both are reported with intervals, and neither is a number I would put on a slide without the method next to it.',
            zh: '需要诚实说明的是：归因精确率的上限受评判模型限制，而针对我自己编写的探测集所测出的拒答率，比面对一位恐惧而坚持追问的患者要容易得多。两者都被度量、都带区间报告，而且都不是我愿意在没有方法说明的情况下放上幻灯片的数字。',
            ru: 'Честная оговорка: точность атрибуции ограничена судьёй, а отказ, измеренный на пробах, которые я написал сам, даётся легче, чем отказ напуганному и настойчивому пациенту. Измеряется и то и другое, оба показателя приводятся с интервалами, и ни один из них я не вынес бы на слайд без описания метода рядом.',
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
            en: 'I would sit at the information desk for a day in week one instead of month three. The escalation redesign — the single most important change in the project — came from ten minutes of watching what people actually ask, and it would have reshaped the output schema before I had built two versions of it.',
            zh: '我会在第一周就去导医台坐上一天，而不是第三个月。转人工机制的重新设计——整个项目里最重要的一次改动——来自十分钟的旁观，看人们究竟在问什么；而它本可以在我做出两个版本之前就重塑输出模式。',
            ru: 'Я бы просидел день у справочной стойки на первой неделе, а не на третьем месяце. Переделка механизма передачи человеку — самое важное изменение в проекте — родилась из десяти минут наблюдения за тем, что люди спрашивают на самом деле, и она переписала бы схему вывода до того, как я построил две её версии.',
          },
        },
      ],
    },
  ],
};
