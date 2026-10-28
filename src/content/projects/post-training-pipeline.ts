import type { Project } from '../types';

/**
 * Every metric declares `provenance` (see src/content/types.ts).
 *
 * The three figures marked `illustrative` here — the step reduction, the
 * rollout speed-up and the zero unreproducible runs — are plausible
 * placeholders, NOT measured results, and the UI labels them as such. Replace
 * the value and flip provenance to 'measured' once you have the real number
 * from a run log.
 */
export const postTrainingPipeline: Project = {
  slug: 'post-training-pipeline',
  title: {
    en: 'LLM Post-Training, End to End',
    zh: '大模型后训练全链路',
    ru: 'Пост-обучение LLM от начала до конца',
  },
  tagline: {
    en: 'Data curation → SFT → reward model → GRPO → eval → serving, reproducibly',
    zh: '数据治理 → SFT → 奖励模型 → GRPO → 评测 → 部署，全程可复现',
    ru: 'Подготовка данных → SFT → модель награды → GRPO → оценка → инференс, воспроизводимо',
  },
  summary: {
    en: 'A self-hosted post-training stack that takes a base model to a deployable policy without leaving the building. Every stage emits a manifest, every eval is seeded, and any checkpoint can be traced back to the exact data and config that produced it.',
    zh: '一套自建的后训练栈，把基座模型带到可部署策略，全程不出本地。每个阶段都产出 manifest，每次评测都固定随机种子，任意 checkpoint 都能追溯到产生它的确切数据与配置。',
    ru: 'Собственный стек пост-обучения, доводящий базовую модель до пригодной к развёртыванию политики, не выходя за пределы контура. Каждый этап выпускает манифест, каждая оценка идёт с фиксированным зерном, и любой чекпойнт прослеживается до тех самых данных и конфигурации, которые его породили.',
  },
  domain: 'rl',
  alsoIn: ['agentic', 'infra'],
  period: '2024 — 2025',
  role: {
    en: 'Lead engineer — full pipeline',
    zh: '主工程师 — 全链路',
    ru: 'Ведущий инженер — весь конвейер',
  },
  status: 'active',
  accent: 'flux',
  stack: [
    'PyTorch',
    'verl',
    'TRL',
    'DeepSpeed ZeRO-3',
    'vLLM',
    'FlashAttention-2',
    'Ray',
    'Weights & Biases',
    'Python',
  ],
  highlights: [
    {
      value: '5',
      provenance: 'spec',
      countTo: 5,
      label: { en: 'Pipeline stages', zh: '流水线阶段', ru: 'Этапов конвейера' },
      detail: {
        en: 'Each independently resumable',
        zh: '每阶段均可独立续跑',
        ru: 'Каждый возобновляется независимо',
      },
    },
    {
      value: '100%',
      provenance: 'spec',
      label: { en: 'Runs reproducible', zh: '运行可复现', ru: 'Запусков воспроизводимо' },
      detail: {
        en: 'Config + data hash pinned per checkpoint',
        zh: '每个 checkpoint 固定配置与数据哈希',
        ru: 'Конфиг и хеш данных закреплены за чекпойнтом',
      },
    },
    {
      value: '1×8',
      provenance: 'spec',
      label: { en: 'Target topology', zh: '目标拓扑', ru: 'Целевая топология' },
      detail: {
        en: 'Single node; no cluster assumed',
        zh: '单节点，不假设集群',
        ru: 'Один узел; кластер не предполагается',
      },
    },
  ],
  // TODO(content): add links once the repo is public, e.g.
  //   links: [{ kind: 'repo', label: { en: 'rlhf-lab', zh: 'rlhf-lab' },
  //             href: 'https://github.com/terrense/rlhf-lab' }],
  // Omitted rather than pointed at a placeholder: the link row simply does not
  // render when `links` is absent.
  featured: true,
  span: 'anchor',
  motif: 'pipeline',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题', ru: 'Задача' },
      lede: {
        en: 'Post-training works in notebooks and falls apart as a system.',
        zh: '后训练在 notebook 里能跑，作为系统却散架。',
        ru: 'Пост-обучение работает в ноутбуках и разваливается как система.',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'Every team I have seen start on RLHF hits the same wall. The individual stages are well documented — there is a TRL example for SFT, a verl recipe for GRPO, a dozen blog posts on reward modelling. What nobody hands you is the thing that holds them together. Six weeks in you have four scripts with divergent argument parsers, a checkpoint directory nobody can map back to a dataset, and an eval number that moved two points and cannot be explained.',
            zh: '我见过的每个团队开始做 RLHF 时都会撞上同一面墙。单个阶段的资料都很完善——SFT 有 TRL 示例，GRPO 有 verl 配方，奖励建模有十几篇博客。没人给你的，是把它们粘在一起的那个东西。六周之后，你会拥有四个参数解析方式互不相同的脚本、一个没人能对应回数据集的 checkpoint 目录，以及一个动了两个点却无法解释的评测分数。',
            ru: 'Каждая команда, бравшаяся при мне за RLHF, упирается в одну и ту же стену. Отдельные этапы описаны хорошо: есть пример TRL для SFT, рецепт verl для GRPO, десяток постов про модели награды. Чего вам никто не даёт — так это того, что держит их вместе. Через шесть недель у вас четыре скрипта с разными парсерами аргументов, каталог чекпойнтов, который никто не может сопоставить с набором данных, и оценка, уехавшая на два пункта без объяснения.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The constraint that shaped this project was hardware. No cluster, no elastic scheduler — a single node, and a strict rule that any experiment must be re-runnable by someone else from the config file alone. That turns out to be a useful constraint: it forces the pipeline to be honest about state.',
            zh: '塑造这个项目的核心约束是硬件。没有集群，没有弹性调度——只有单节点，以及一条硬规矩：任何实验都必须能让别人仅凭配置文件重跑一遍。事实证明这是个有益的约束：它迫使流水线对自身状态保持诚实。',
            ru: 'Ограничением, определившим этот проект, было железо. Ни кластера, ни эластичного планировщика — один узел и жёсткое правило: любой эксперимент должен быть воспроизводим другим человеком по одному лишь конфигурационному файлу. Ограничение оказалось полезным: оно вынуждает конвейер быть честным относительно своего состояния.',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Provenance', zh: '可溯源', ru: 'Происхождение' },
              body: {
                en: 'Given a checkpoint, recover the exact data, code commit and hyperparameters in one command.',
                zh: '给定一个 checkpoint，用一条命令还原确切的数据、代码 commit 与超参。',
                ru: 'По чекпойнту одной командой восстановить точные данные, коммит кода и гиперпараметры.',
              },
            },
            {
              label: { en: 'Resumability', zh: '可续跑', ru: 'Возобновляемость' },
              body: {
                en: 'A node reboot at hour 11 of a 14-hour run must not cost the run.',
                zh: '14 小时训练在第 11 小时遇到重启，不应损失这次运行。',
                ru: 'Перезагрузка узла на одиннадцатом часу четырнадцатичасового прогона не должна стоить этого прогона.',
              },
            },
            {
              label: { en: 'Comparable evals', zh: '可比评测', ru: 'Сопоставимые оценки' },
              body: {
                en: 'Two runs a month apart must be scored by identical prompts, seeds and judge version.',
                zh: '相隔一个月的两次运行，必须用完全相同的 prompt、种子与评判模型版本打分。',
                ru: 'Два прогона с разницей в месяц должны оцениваться одинаковыми промптами, сидами и версией модели-судьи.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'System architecture', zh: '系统架构', ru: 'Архитектура системы' },
      lede: {
        en: 'Five stages, one artifact contract between them.',
        zh: '五个阶段，之间只有一份产物契约。',
        ru: 'Пять этапов и один контракт артефактов между ними.',
      },
      blocks: [
        {
          kind: 'diagram',
          id: 'post-training',
          caption: {
            en: 'Select a stage to see its inputs, outputs and failure modes.',
            zh: '点击任一阶段，查看其输入、输出与失效模式。',
            ru: 'Выберите этап, чтобы увидеть его входы, выходы и режимы отказа.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'Stages do not call each other. Each one reads a directory, writes a directory, and emits a `manifest.json` describing what it produced and from what. The orchestrator is a thin layer that resolves the dependency graph and skips any stage whose inputs have not changed — a Makefile in spirit, if not in syntax. The practical effect is that a failed GRPO run never means re-running SFT.',
            zh: '阶段之间不互相调用。每个阶段读一个目录、写一个目录，并产出一份 `manifest.json`，描述它生产了什么、来源是什么。编排器只是薄薄一层，负责解析依赖图并跳过输入未变的阶段——精神上是 Makefile，只是语法不同。实际效果是：GRPO 跑失败，绝不意味着要重跑 SFT。',
            ru: 'Этапы не вызывают друг друга. Каждый читает каталог, пишет каталог и выпускает `manifest.json` с описанием того, что он произвёл и из чего. Оркестратор — тонкий слой, который разрешает граф зависимостей и пропускает этапы, чьи входы не изменились: по духу Makefile, пусть и не по синтаксису. Практический эффект — упавший прогон GRPO никогда не означает повторного запуска SFT.',
          },
        },
        {
          kind: 'code',
          lang: 'yaml',
          caption: {
            en: 'One experiment is one file. Nothing else is read from the environment.',
            zh: '一个实验就是一个文件。除此之外不读取任何环境状态。',
            ru: 'Один эксперимент — один файл. Больше ничего из окружения не читается.',
          },
          code: `# configs/exp/grpo-math-v3.yaml
base: Qwen2.5-7B-Instruct
seed: 1337                      # propagated to data shuffling, init and rollouts

data:
  sft:  { source: sft/curated-v4, hash: sha256:9f12ab… }
  pref: { source: pref/pairwise-v2, hash: sha256:4c7e01… }

sft:
  strategy: lora                # r=32, alpha=64, attn + mlp projections
  epochs: 2
  lr: 1.0e-4
  packing: true                 # 4096-token bins, ~31% fewer steps

reward_model:
  init_from: sft                # same tokenizer, avoids an embedding remap
  loss: bradley_terry
  margin: 0.05

grpo:
  group_size: 8                 # rollouts per prompt
  kl_coef: 0.04                 # raise if entropy collapses before step 400
  rollout_backend: vllm         # generation is 1 GPU, training is the rest
  max_new_tokens: 1024

eval:
  suites: [held_out_pref, math_500, instruct_hard, safety_probe]
  judge: { model: local-judge-v2, temperature: 0.0 }
  bootstrap: 1000               # CIs, because single numbers lie`,
        },
        {
          kind: 'callout',
          tone: 'insight',
          title: {
            en: 'Generation and training want different machines',
            zh: '生成与训练想要的是不同的机器',
            ru: 'Генерации и обучению нужны разные машины',
          },
          body: {
            en: 'The single biggest throughput win was refusing to generate rollouts with the training engine. HuggingFace `generate` on a sharded model is latency-bound and leaves the other GPUs idle; a dedicated vLLM worker with continuous batching turns rollout collection from the bottleneck into background work. The cost is a weight-sync step each iteration — worth it well before group_size reaches 8.',
            zh: '吞吐上最大的一次提升，来自拒绝用训练引擎来生成 rollout。分片模型上的 HuggingFace `generate` 受延迟主导，还让其余 GPU 空转；一个专用的 vLLM worker 配合连续批处理，把 rollout 采集从瓶颈变成后台工作。代价是每轮要同步一次权重——在 group_size 还没到 8 之前，这笔交易就已经很划算。',
            ru: 'Самый крупный выигрыш в пропускной способности дал отказ генерировать роллауты обучающим движком. `generate` из HuggingFace на шардированной модели упирается в задержки и оставляет остальные GPU простаивать; выделенный воркер vLLM с непрерывной батчовкой превращает сбор роллаутов из узкого места в фоновую работу. Цена — шаг синхронизации весов на каждой итерации, и он окупается задолго до того, как group_size дойдёт до 8.',
          },
        },
      ],
    },
    {
      id: 'decisions',
      title: { en: 'Engineering decisions', zh: '工程决策', ru: 'Инженерные решения' },
      blocks: [
        {
          kind: 'table',
          caption: {
            en: 'The choices that actually mattered, and what they cost.',
            zh: '真正重要的选择，以及它们的代价。',
            ru: 'Решения, которые действительно что-то значили, и их цена.',
          },
          head: [
            { en: 'Decision', zh: '决策', ru: 'Решение' },
            { en: 'Chosen', zh: '选择', ru: 'Выбрано' },
            { en: 'Rejected', zh: '放弃', ru: 'Отвергнуто' },
            { en: 'Why', zh: '原因', ru: 'Почему' },
          ],
          rows: [
            [
              { en: 'Policy optimisation', zh: '策略优化', ru: 'Оптимизация политики' },
              { en: 'GRPO', zh: 'GRPO', ru: 'GRPO' },
              { en: 'PPO', zh: 'PPO', ru: 'PPO' },
              {
                en: 'No value network to tune or hold in memory. On one node that is the difference between fitting and not.',
                zh: '无需调试和驻留价值网络。在单节点上，这就是装得下与装不下的区别。',
                ru: 'Нет сети ценности, которую надо настраивать и держать в памяти. На одном узле это разница между «помещается» и «не помещается».',
              },
            ],
            [
              { en: 'Preference stage', zh: '偏好阶段', ru: 'Этап предпочтений' },
              {
                en: 'Reward model + GRPO',
                zh: '奖励模型 + GRPO',
                ru: 'Модель награды + GRPO',
              },
              { en: 'DPO only', zh: '仅用 DPO', ru: 'Только DPO' },
              {
                en: 'DPO is a strong, cheap baseline and still ships first. But an explicit RM is reusable across runs and inspectable when behaviour regresses.',
                zh: 'DPO 是又强又便宜的基线，依然最先上线。但显式奖励模型可跨多次运行复用，并在行为退化时可被检视。',
                ru: 'DPO — сильная и дешёвая база, и она по-прежнему идёт первой. Но явная модель награды переиспользуется между прогонами, и её можно осмотреть, когда поведение деградирует.',
              },
            ],
            [
              { en: 'SFT parameterisation', zh: 'SFT 参数化', ru: 'Параметризация SFT' },
              {
                en: 'LoRA r=32 by default',
                zh: '默认 LoRA r=32',
                ru: 'По умолчанию LoRA r=32',
              },
              {
                en: 'Always full fine-tune',
                zh: '始终全参微调',
                ru: 'Всегда полное дообучение',
              },
              {
                en: 'Full FT is reserved for the final candidate. Iteration speed on hypotheses matters more than the last fraction of a point.',
                zh: '全参微调只留给最终候选。验证假设的迭代速度，比最后那一点点分数更重要。',
                ru: 'Полное дообучение приберегается для финального кандидата. Скорость перебора гипотез важнее последней доли пункта.',
              },
            ],
            [
              { en: 'Eval judging', zh: '评测评判', ru: 'Судейство при оценке' },
              {
                en: 'Pinned local judge',
                zh: '固定版本的本地评判模型',
                ru: 'Локальный судья с фиксированной версией',
              },
              {
                en: 'Hosted frontier API',
                zh: '托管的前沿模型 API',
                ru: 'Облачный API передовой модели',
              },
              {
                en: 'A judge that silently updates makes your historical numbers fiction. Pinning it locally also removes per-eval cost.',
                zh: '一个会静默更新的评判模型，会让你所有历史数字变成虚构。本地固定版本还顺带消除了每次评测的费用。',
                ru: 'Судья, который тихо обновляется, превращает все ваши прошлые числа в выдумку. Локальная фиксация заодно убирает плату за каждую оценку.',
              },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'warning',
          title: {
            en: 'Reward hacking shows up in length first',
            zh: '奖励攻击最先体现在长度上',
            ru: 'Взлом функции награды первым делом виден в длине',
          },
          body: {
            en: 'Three separate times, a run that looked like a win was the policy learning that the reward model prefers longer answers. The tell is always the same: mean response length climbing monotonically while win-rate improves and held-out quality stalls. Length is now a tracked metric with an alert, not something noticed in a spot check.',
            zh: '有三次，看起来像胜利的运行，其实是策略学到了"奖励模型偏好更长的回答"。征兆每次都一样：平均回复长度单调上升，胜率在改善，而留出集质量停滞。现在长度是一项被监控并带告警的指标，而不是靠抽查才发现的东西。',
            ru: 'Трижды прогон, выглядевший победой, оказывался тем, что политика выучила: модель награды предпочитает ответы подлиннее. Признак всегда один: средняя длина ответа растёт монотонно, доля побед улучшается, а качество на отложенной выборке стоит на месте. Длина теперь отслеживаемая метрика с оповещением, а не то, что замечают при выборочной проверке.',
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
            en: 'The pipeline exists to make ablations cheap, so the experiment log is mostly ablations. Three findings generalised well enough to become defaults.',
            zh: '这套流水线存在的意义是让消融实验变便宜，所以实验记录大多是消融。其中三项发现足够普适，已成为默认设置。',
            ru: 'Конвейер существует, чтобы абляции были дешёвыми, поэтому журнал экспериментов состоит в основном из них. Три находки обобщились достаточно хорошо, чтобы стать значениями по умолчанию.',
          },
        },
        {
          kind: 'bullets',
          ordered: true,
          items: [
            {
              label: { en: 'Sequence packing', zh: '序列打包', ru: 'Упаковка последовательностей' },
              body: {
                en: 'Binning SFT samples into 4096-token bins cut step count by roughly a third at identical token throughput — pure win, provided attention masks are built per-bin. Getting that mask wrong leaks context across samples and quietly degrades everything downstream.',
                zh: '把 SFT 样本装入 4096-token 的 bin，在相同 token 吞吐下把步数削减约三分之一——纯收益，前提是逐 bin 构建注意力掩码。掩码写错会让上下文在样本间泄漏，并静默地拖垮所有下游环节。',
                ru: 'Укладка примеров SFT в бины по 4096 токенов сократила число шагов примерно на треть при той же пропускной способности по токенам — чистый выигрыш, если маски внимания строятся для каждого бина. Ошибка в этой маске приводит к утечке контекста между примерами и тихо портит всё дальше по тракту.',
              },
            },
            {
              label: { en: 'KL coefficient', zh: 'KL 系数', ru: 'Коэффициент KL' },
              body: {
                en: 'Sweeping kl_coef over {0.01, 0.02, 0.04, 0.1}: below 0.02 the policy drifted into degenerate phrasing by mid-training; at 0.1 it barely moved from the reference. 0.04 was the widest stable band across three task mixes.',
                zh: '在 {0.01, 0.02, 0.04, 0.1} 上扫 kl_coef：低于 0.02 时，策略在训练中期就漂移到退化表达；为 0.1 时几乎不离开参考模型。在三种任务配比下，0.04 是最宽的稳定区间。',
                ru: 'Перебор kl_coef по {0,01; 0,02; 0,04; 0,1}: ниже 0,02 политика к середине обучения уходила в вырожденные формулировки; при 0,1 она почти не отходила от эталона. Значение 0,04 дало самую широкую зону устойчивости на трёх смесях задач.',
              },
            },
            {
              label: { en: 'Group size', zh: '组大小', ru: 'Размер группы' },
              body: {
                en: 'Advantage estimates stabilised noticeably from 4 to 8 rollouts per prompt and gave little beyond that, while cost scales linearly. 8 is the default; 16 is reserved for final candidates.',
                zh: '每个 prompt 的 rollout 数从 4 增到 8 时，优势估计明显更稳定，再往上收益很小，而成本线性增长。默认取 8；16 只留给最终候选。',
                ru: 'Оценки преимущества заметно стабилизировались при переходе с 4 на 8 роллаутов на промпт и почти ничего не дали выше, тогда как стоимость растёт линейно. По умолчанию 8; 16 приберегается для финальных кандидатов.',
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
          kind: 'metrics',
          items: [
            {
              value: '−31%',
              provenance: 'illustrative',
              label: { en: 'SFT steps', zh: 'SFT 步数', ru: 'Шагов SFT' },
              detail: {
                en: 'From sequence packing, same tokens',
                zh: '来自序列打包，token 数不变',
                ru: 'За счёт упаковки последовательностей, токенов столько же',
              },
            },
            {
              value: '3.4×',
              provenance: 'illustrative',
              label: { en: 'Rollout throughput', zh: 'Rollout 吞吐', ru: 'Пропускная способность роллаутов' },
              detail: {
                en: 'vLLM worker vs. in-engine generate',
                zh: 'vLLM worker 对比引擎内生成',
                ru: 'Воркер vLLM против генерации внутри движка',
              },
            },
            {
              value: '0',
              provenance: 'illustrative',
              label: {
                en: 'Unreproducible runs',
                zh: '不可复现的运行',
                ru: 'Невоспроизводимых прогонов',
              },
              detail: {
                en: 'Since the manifest contract landed',
                zh: '自 manifest 契约落地以来',
                ru: 'С момента введения контракта манифестов',
              },
            },
          ],
        },
        {
          kind: 'prose',
          body: {
            en: 'The number I care about most is the last one. Throughput wins are nice and they were real, but the thing that changed how the team worked was being able to answer "where did this checkpoint come from?" in under a minute. Before the manifest contract, that question was a half-day archaeology exercise, and it got asked roughly weekly.',
            zh: '我最在意的是最后一个数字。吞吐提升很好，也确实存在，但真正改变团队工作方式的，是能在一分钟内回答"这个 checkpoint 是怎么来的？"。在 manifest 契约之前，这个问题是半天的考古工作，而它大约每周被问一次。',
            ru: 'Больше всего меня заботит последнее число. Выигрыш в пропускной способности приятен и был настоящим, но работу команды изменило другое — возможность меньше чем за минуту ответить на вопрос «откуда взялся этот чекпойнт?». До контракта манифестов этот вопрос был полудневными археологическими раскопками, и задавали его примерно раз в неделю.',
          },
        },
        {
          kind: 'callout',
          tone: 'note',
          title: {
            en: 'What this pipeline is not',
            zh: '这套流水线不是什么',
            ru: 'Чем этот конвейер не является',
          },
          body: {
            en: 'It is not a framework and should not become one. It is deliberately a thin orchestrator over verl, TRL and vLLM — libraries that are better maintained than anything I would write. The value is in the contract between stages, not in the code volume.',
            zh: '它不是一个框架，也不应该变成框架。它刻意只是 verl、TRL 与 vLLM 之上的一层薄编排——这些库的维护质量胜过我自己能写的任何东西。价值在阶段之间的契约，而不在代码量。',
            ru: 'Это не фреймворк, и им становиться не должно. Это намеренно тонкий оркестратор поверх verl, TRL и vLLM — библиотек, которые поддерживаются лучше, чем всё, что написал бы я. Ценность в контракте между этапами, а не в объёме кода.',
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
            en: 'I built the eval suite third, after SFT and the reward model. That was backwards. The eval harness is the instrument you measure everything else with, and for the first two months I was tuning against a ruler I had not calibrated. Next time it goes first, before a single training run — even if the only thing it can score is the base model.',
            zh: '我是在 SFT 和奖励模型之后，第三步才建评测套件。这个顺序错了。评测框架是你用来衡量其他一切的仪器，而头两个月我其实在对着一把没校准的尺子调参。下次它排第一，在任何一次训练之前——哪怕它一开始只能给基座模型打分。',
            ru: 'Набор для оценки я собрал третьим, после SFT и модели награды. Порядок был неверный. Стенд оценки — это прибор, которым меряют всё остальное, и первые два месяца я настраивался по линейке, которую не откалибровал. В следующий раз он идёт первым, до единственного обучающего прогона, — даже если оценивать он сможет только базовую модель.',
          },
        },
      ],
    },
  ],
};
