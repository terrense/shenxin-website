import type { Project } from '../types';

export const clinicalMultimodalAgent: Project = {
  slug: 'clinical-multimodal-agent',
  title: { en: 'Clinical Multimodal Agent', zh: '医疗多模态 Agent' },
  tagline: {
    en: 'Speech, imaging and records into one assistant that knows when to stop',
    zh: '语音、影像与病历合一的助手——并且知道何时该停下',
  },
  summary: {
    en: 'A retrieval-grounded clinical assistant that takes dictated speech, imaging findings and structured records, and produces a draft with every claim traced to a source. The engineering centre of gravity is not accuracy — it is abstention, provenance and making the audit trail a first-class output.',
    zh: '一个以检索为依据的临床助手：接收口述语音、影像所见与结构化病历，产出每一条陈述都可溯源的草稿。工程重心不在准确率——而在拒答、来源可溯，以及把审计轨迹作为一等输出。',
  },
  domain: 'healthcare',
  alsoIn: ['agentic', 'infra'],
  period: '2024 — 2025',
  role: { en: 'Engineering lead — pipeline & safety layer', zh: '工程负责人 — 流水线与安全层' },
  status: 'research',
  accent: 'ember',
  stack: [
    'Qwen-Audio (fine-tuned)',
    'Whisper',
    'Vision encoder',
    'Hybrid BM25 + dense retrieval',
    'vLLM',
    'Pydantic',
    'Python',
  ],
  highlights: [
    {
      value: '100%',
      provenance: 'spec',
      label: { en: 'Claims with citations', zh: '带引用的陈述' },
      detail: {
        en: 'Uncited sentences are blocked, not flagged',
        zh: '无引用的句子直接拦截，而非仅标记',
      },
    },
    {
      value: '3',
      provenance: 'spec',
      countTo: 3,
      label: { en: 'Modalities fused', zh: '融合模态' },
      detail: { en: 'Audio · imaging · structured records', zh: '语音 · 影像 · 结构化病历' },
    },
    {
      value: 'local',
      provenance: 'spec',
      label: { en: 'Inference boundary', zh: '推理边界' },
      detail: { en: 'No PHI leaves the deployment', zh: '患者数据不离开部署环境' },
    },
  ],
  featured: true,
  span: 'cell',
  motif: 'scan',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题' },
      lede: {
        en: 'In clinical work, a confident wrong answer is worse than no answer.',
        zh: '在临床场景里，一个自信的错误答案比没有答案更糟。',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'Clinicians spend a large fraction of their day on documentation: reconciling what was said in the room with what is in the record and what the imaging showed. It is a genuinely multimodal synthesis task and an obvious fit for a language model — right up until you consider what happens when it is wrong.',
            zh: '临床医生每天有很大一部分时间花在文书工作上：把诊室里说过的话、病历里记录的内容、以及影像所见相互对齐。这是一项真正的多模态综合任务，看起来天然适合语言模型——直到你开始考虑它出错时会发生什么。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'A general assistant that hallucinates a plausible detail produces a mildly annoying result. A clinical assistant that hallucinates a plausible detail produces a document that enters a patient record and is read later as fact by someone who was not in the room. That changes what the system has to be: not a model with a safety filter bolted on, but a pipeline whose output format makes unsupported claims structurally impossible to emit.',
            zh: '一个通用助手编造出一个看似合理的细节，结果只是轻微恼人。一个临床助手编造出一个看似合理的细节，产出的文档会进入患者病历，日后被一个不在诊室的人当作事实读取。这改变了系统必须是什么：不是一个外挂安全过滤器的模型，而是一条输出格式本身就让"无依据陈述"在结构上无法产出的流水线。',
          },
        },
        {
          kind: 'callout',
          tone: 'note',
          title: { en: 'Status and scope', zh: '状态与范围' },
          body: {
            en: 'This is a research system evaluated on de-identified and synthetic data. It drafts for clinician review and makes no diagnostic claim. Nothing here is deployed in patient care, and the design assumes a human signs every output.',
            zh: '这是一个在去标识化与合成数据上评测的研究系统。它为医生审阅生成草稿，不做任何诊断性断言。本项目没有任何部分用于真实诊疗，且设计前提是每份输出都由人类签署。',
          },
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'System architecture', zh: '系统架构' },
      lede: {
        en: 'Three encoders into a shared evidence pool, then a constrained generator.',
        zh: '三个编码器汇入共享证据池，再接一个受约束的生成器。',
      },
      blocks: [
        {
          kind: 'diagram',
          id: 'clinical-fusion',
          caption: {
            en: 'Modalities are normalised into evidence spans before generation. Select a stage for its contract.',
            zh: '各模态在生成之前被归一化为证据片段。点击任一阶段查看其契约。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The architectural commitment is that modalities are not fused in embedding space. Each input is converted into typed, timestamped **evidence spans** carrying their own provenance — a transcript segment with speaker and offset, an imaging finding with study ID and series, a record field with its source table and date. Fusion happens over that structured pool, not over raw tensors.',
            zh: '架构上的核心承诺是：模态不在嵌入空间里融合。每个输入都被转换为带类型、带时间戳的**证据片段**，各自携带来源信息——转写片段带说话人与时间偏移，影像所见带检查号与序列，病历字段带来源表与日期。融合发生在这个结构化池之上，而不是在原始张量之上。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'This costs representational power. A jointly trained multimodal encoder would almost certainly score better on a synthesis benchmark. But embedding-space fusion destroys exactly the information the use case requires: once a claim is a vector, you cannot say which modality contributed it or which second of audio it came from. The requirement here is not "be accurate", it is "be answerable" — and the two have different architectures.',
            zh: '这牺牲了表示能力。一个联合训练的多模态编码器几乎肯定能在综合类基准上拿到更好的分数。但嵌入空间融合恰恰摧毁了这个场景所需的信息：一旦一条陈述变成了向量，你就无法说出它来自哪个模态、来自音频的第几秒。这里的要求不是"准确"，而是"可被问责"——而这两者对应不同的架构。',
          },
        },
        {
          kind: 'code',
          lang: 'python',
          caption: {
            en: 'The output schema. A sentence without span IDs cannot be constructed.',
            zh: '输出模式。缺少片段 ID 的句子根本无法被构造出来。',
          },
          code: `class Claim(BaseModel):
    text: str
    # Not Optional. A claim with no supporting evidence is not representable,
    # so "forgot to cite" cannot happen downstream of validation.
    evidence: Annotated[list[SpanRef], Field(min_length=1)]
    confidence: Literal["supported", "partial", "insufficient"]

class Draft(BaseModel):
    claims: list[Claim]
    # Surfaced to the clinician as an explicit worklist, never hidden.
    abstentions: list[Abstention]

    @model_validator(mode="after")
    def partial_claims_must_abstain(self) -> "Draft":
        """A 'partial' claim without a matching abstention is a silent gap —
        the exact failure we are trying to make impossible."""
        flagged = {c.text for c in self.claims if c.confidence != "supported"}
        covered = {a.claim_text for a in self.abstentions}
        if missing := flagged - covered:
            raise ValueError(f"unexplained low-confidence claims: {missing}")
        return self`,
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
              { en: 'Fusion level', zh: '融合层级' },
              { en: 'Evidence spans', zh: '证据片段' },
              { en: 'Joint embedding', zh: '联合嵌入' },
              {
                en: 'Provenance survives. A clinician can click any sentence and hear the three seconds of audio it came from.',
                zh: '来源信息得以保留。医生可以点击任一句话，听到它所对应的那三秒音频。',
              },
            ],
            [
              { en: 'ASR', zh: '语音识别' },
              { en: 'Domain fine-tuned', zh: '领域微调' },
              { en: 'General ASR as-is', zh: '直接用通用 ASR' },
              {
                en: 'Drug names and dosages are where general ASR fails, and they are the highest-stakes tokens in the transcript.',
                zh: '药名与剂量正是通用 ASR 失手的地方，而它们是整段转写里风险最高的 token。',
              },
            ],
            [
              { en: 'Retrieval', zh: '检索' },
              { en: 'Hybrid BM25 + dense', zh: 'BM25 + 稠密混合' },
              { en: 'Dense only', zh: '仅稠密检索' },
              {
                en: 'Clinical queries hinge on exact identifiers — codes, drug names, measurements — which lexical search handles and embeddings blur.',
                zh: '临床查询依赖精确标识——编码、药名、测量值——这些由词法检索处理得当，而嵌入会把它们模糊掉。',
              },
            ],
            [
              { en: 'Inference location', zh: '推理位置' },
              { en: 'Self-hosted', zh: '自建部署' },
              { en: 'Hosted API', zh: '托管 API' },
              {
                en: 'Patient data cannot leave the deployment boundary. This also removes per-token cost from the evaluation loop.',
                zh: '患者数据不能离开部署边界。这同时也把按 token 计费从评测循环里移除了。',
              },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'insight',
          title: {
            en: 'Abstention is a feature with a UI, not an error path',
            zh: '拒答是一个带界面的功能，而不是错误分支',
          },
          body: {
            en: 'The first version treated "insufficient evidence" as a failure and returned nothing for that field. Clinicians found that worse than a wrong answer, because a blank field is indistinguishable from a field nobody looked at. Abstentions are now a visible worklist: "I could not establish X, here is what I searched." Same underlying behaviour, completely different usefulness.',
            zh: '第一个版本把"证据不足"当作失败，对该字段不返回任何内容。医生认为这比错误答案更糟，因为一个空字段和一个没人看过的字段无法区分。现在拒答是一份可见的待办清单："我无法确认 X，以下是我检索过的内容。"底层行为相同，可用性完全不同。',
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
            en: 'Standard generation metrics are close to useless here, because a fluent unsupported sentence scores well on all of them. The evaluation is built around attribution instead.',
            zh: '标准生成指标在这里几乎无用，因为一句流畅但无依据的话在所有这些指标上都得分很高。因此评测围绕归因构建。',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Attribution precision', zh: '归因精确率' },
              body: {
                en: 'For each generated claim, does the cited span actually entail it? Scored by a pinned judge model against human-labelled seeds, reported with bootstrap confidence intervals.',
                zh: '对每条生成的陈述，被引用的片段是否真的支撑它？由固定版本的评判模型对照人工标注种子集打分，并报告 bootstrap 置信区间。',
              },
            },
            {
              label: { en: 'Abstention calibration', zh: '拒答校准' },
              body: {
                en: 'Planted-gap tests: remove a specific fact from the evidence pool and check whether the system abstains on exactly that claim. Over-abstention is measured as explicitly as under-abstention — a system that abstains on everything is safe and worthless.',
                zh: '植入缺口测试：从证据池中移除某个特定事实，检查系统是否正好对该条陈述拒答。过度拒答与拒答不足被同等明确地度量——一个什么都拒答的系统是安全的，也是无用的。',
              },
            },
            {
              label: { en: 'Modality ablation', zh: '模态消融' },
              body: {
                en: 'Drop each input stream in turn to find which claims genuinely require which modality. This caught a case where imaging findings were being restated from the record and the imaging encoder was contributing nothing.',
                zh: '依次移除每一路输入，找出哪些陈述真正需要哪个模态。这抓到了一个情况：影像所见其实是从病历里复述的，而影像编码器什么也没贡献。',
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
            en: 'The structural result is the one I would defend: with the schema above, an uncited claim is not a bug class that needs monitoring — it cannot be serialised. That moves a whole category of failure from "detect and alert" to "impossible", which is the only move that scales in a safety-relevant pipeline.',
            zh: '我愿意为之辩护的是结构性结论：有了上面那个模式，无引用陈述不再是一类需要监控的 bug——它根本无法被序列化。这把一整类失效从"检测并告警"搬到了"不可能发生"，而在安全相关的流水线里，这是唯一可扩展的做法。',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The honest caveat is that attribution precision is bounded by the judge, and abstention calibration on synthetic gaps is easier than on real ambiguity. Both are measured, both are reported with intervals, and neither is a number I would put on a slide without the method next to it.',
            zh: '需要诚实说明的是：归因精确率的上限受评判模型限制，而在合成缺口上的拒答校准，比在真实的模糊性上更容易。两者都被度量、都带区间报告，而且都不是我愿意在没有方法说明的情况下放上幻灯片的数字。',
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
            en: 'I would put a clinician in the loop in week one instead of month three. The abstention redesign — the single most important change in the project — came from a ten-minute conversation that could have happened at any point, and would have reshaped the output schema before I had built two versions of it.',
            zh: '我会在第一周就把临床医生拉进来，而不是第三个月。拒答机制的重新设计——整个项目里最重要的一次改动——来自一次十分钟的对话，而这次对话本可以在任何时间发生，并且会在我做出两个版本之前就重塑输出模式。',
          },
        },
      ],
    },
  ],
};
