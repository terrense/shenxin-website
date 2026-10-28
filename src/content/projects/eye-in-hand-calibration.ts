import type { Project } from '../types';

export const eyeInHandCalibration: Project = {
  slug: 'eye-in-hand-calibration',
  title: {
    en: 'Stereo Eye-in-Hand Calibration Suite',
    zh: '双目 Eye-in-Hand 标定套件',
    ru: 'Стереокалибровка «глаз в руке»',
  },
  tagline: {
    en: 'A C++/Qt tool that makes hand-eye calibration repeatable by a non-expert',
    zh: '一个让非专家也能稳定复现手眼标定的 C++/Qt 工具',
    ru: 'Инструмент на C++/Qt, позволяющий повторить калибровку без специалиста',
  },
  summary: {
    en: 'Hand-eye calibration is the step that silently determines whether every downstream motion is correct. This suite turns it from a notebook ritual into an auditable tool: automated pose capture driven by the arm controller, residuals surfaced per pose, and a protocol simulator so the whole flow can be tested without a robot.',
    zh: '手眼标定是那个默默决定下游所有运动是否正确的环节。这套工具把它从"notebook 仪式"变成一个可审计的工具：由控制柜驱动的自动采点、逐位姿暴露的残差，以及一个协议模拟器——让整条流程在没有真机时也能测试。',
    ru: 'Калибровка «рука — глаз» — тот самый шаг, который незаметно решает, верны ли все последующие движения. Этот пакет превращает её из ритуала в ноутбуке в проверяемый инструмент: автоматический сбор поз под управлением контроллера манипулятора, невязки по каждой позе и симулятор протокола, позволяющий прогнать весь процесс без робота.',
  },
  domain: 'robotics',
  alsoIn: ['infra'],
  period: '2024 — 2025',
  role: {
    en: 'Sole author — SDK, GUI and protocol layer',
    zh: '独立开发 — SDK、界面与协议层',
    ru: 'Единственный автор — SDK, интерфейс и протокольный слой',
  },
  status: 'shipped',
  accent: 'flux',
  stack: [
    'C++17',
    'Qt 6',
    'OpenCV 4',
    'Hikvision MVS SDK',
    'CMake',
    'DOBOT CR V4 TCP',
    'Levenberg–Marquardt',
  ],
  highlights: [
    {
      value: '8ms',
      provenance: 'spec',
      label: {
        en: 'Controller state rate',
        zh: '控制柜状态周期',
        ru: 'Период состояния контроллера',
      },
      detail: {
        en: 'Port 30004 real-time feedback',
        zh: '30004 端口实时反馈',
        ru: 'Обратная связь в реальном времени, порт 30004',
      },
    },
    {
      value: '20mm',
      provenance: 'spec',
      label: { en: 'Checkerboard pitch', zh: '棋盘格边长', ru: 'Шаг шахматной доски' },
      detail: { en: '11×8 inner corners', zh: '11×8 内角点', ru: '11×8 внутренних углов' },
    },
    {
      value: '5',
      provenance: 'spec',
      countTo: 5,
      label: { en: 'Guided stages', zh: '引导式阶段', ru: 'Шагов с подсказками' },
      detail: {
        en: 'Capture → stereo → auto-pose → hand-eye → audit',
        zh: '采集 → 双目 → 自动采点 → 手眼 → 审计',
        ru: 'Съёмка → стерео → автопозы → рука-глаз → аудит',
      },
    },
  ],
  // TODO(content): add a repo link when calib_demo is public.
  featured: true,
  span: 'cell',
  motif: 'lattice',
  sections: [
    {
      id: 'problem',
      title: { en: 'Problem', zh: '问题', ru: 'Задача' },
      lede: {
        en: 'Everyone can do hand-eye calibration once. Doing it the same way twice is the hard part.',
        zh: '每个人都能做一次手眼标定。难的是第二次还做得一样。',
        ru: 'Откалибровать «рука — глаз» один раз может каждый. Сложность в том, чтобы повторить это так же.',
      },
      blocks: [
        {
          kind: 'prose',
          body: {
            en: 'Hand-eye calibration produces one transform — the pose of the camera relative to the tool flange. Everything the robot does with vision depends on it. And in practice it is usually produced by a script someone wrote once, run on a laptop, with the quality of the result assessed by whether the arm looked roughly right afterwards.',
            zh: '手眼标定产出的是一个变换——相机相对于末端法兰的位姿。机器人所有基于视觉的动作都依赖它。而实践中，它通常是由某人写过一次的脚本、在某台笔记本上跑出来的，结果质量的评判方式是"之后机械臂看起来大致没错"。',
            ru: 'Калибровка «рука — глаз» даёт одно преобразование — положение камеры относительно фланца инструмента. От него зависит всё, что робот делает по зрению. А на практике его обычно получают скриптом, который кто-то написал однажды, запускают на ноутбуке, и качество результата оценивают по тому, выглядел ли манипулятор после этого примерно правильно.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'That is fine until the camera is bumped, the gripper is replaced, or a second unit is built. Then you need someone who is not you to redo it, get a comparable result, and know whether it is good. The gap this tool fills is not algorithmic — OpenCV already has the solvers. It is that nothing in the standard workflow tells an operator which captured poses are degenerate, and a degenerate pose set produces a confident, wrong answer.',
            zh: '在相机被碰到、夹爪被更换、或者要装第二台之前，这都没问题。之后你就需要一个不是你的人重做一遍、得到可比的结果、并且知道结果好不好。这个工具填补的空白不是算法上的——OpenCV 已经有求解器了。空白在于：标准流程里没有任何环节会告诉操作者哪些采集到的位姿是退化的，而一组退化位姿会产出一个自信且错误的答案。',
            ru: 'И это работает ровно до того, как камеру заденут, сменят захват или соберут второй экземпляр. Тогда нужно, чтобы кто-то, кроме вас, повторил процедуру, получил сопоставимый результат и понял, хорош ли он. Пробел, который закрывает этот инструмент, не алгоритмический — решатели в OpenCV уже есть. Пробел в том, что в стандартном процессе ничто не сообщает оператору, какие из снятых поз вырождены, а вырожденный набор поз выдаёт уверенный и неверный ответ.',
          },
        },
      ],
    },
    {
      id: 'architecture',
      title: { en: 'System architecture', zh: '系统架构', ru: 'Архитектура системы' },
      lede: {
        en: 'A linkable SDK, a CLI, and a GUI over the same core.',
        zh: '一个可链接的 SDK、一个 CLI、一个 GUI，共用同一内核。',
        ru: 'Подключаемый SDK, CLI и графический интерфейс поверх одного ядра.',
      },
      blocks: [
        {
          kind: 'diagram',
          id: 'eye-in-hand',
          caption: {
            en: 'The transform chain. Every matrix uses T_destination_source notation; every length is in millimetres.',
            zh: '变换链。所有矩阵使用 T_destination_source 记法；所有长度单位为毫米。',
            ru: 'Цепочка преобразований. Все матрицы в нотации T_destination_source, все длины в миллиметрах.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'Device communication, synchronised capture, stereo calibration and hand-eye solving are separated into `calibration_sdk`, a library with no Qt dependency. Qt sits on top for the operator interface, and `calib_tool` exposes the same core on the command line for scripted recalibration. The split exists because the GUI is the part most likely to be rewritten, and the solver is the part that must never silently change.',
            zh: '设备通信、同步采集、双目标定与手眼求解被拆进 `calibration_sdk`——一个不依赖 Qt 的库。Qt 在其上提供操作者界面，`calib_tool` 把同一内核暴露到命令行，用于脚本化重标定。这样拆分的原因是：GUI 是最可能被重写的部分，而求解器是绝对不能静默改变的部分。',
            ru: 'Связь с устройствами, синхронная съёмка, калибровка стереопары и решение задачи «рука — глаз» вынесены в `calibration_sdk` — библиотеку без зависимости от Qt. Qt лежит сверху и даёт интерфейс оператора, а `calib_tool` открывает то же ядро в командной строке для скриптовой перекалибровки. Разделение существует потому, что GUI — это часть, которую вероятнее всего перепишут, а решатель — часть, которая не должна меняться незаметно никогда.',
          },
        },
        {
          kind: 'bullets',
          items: [
            {
              label: { en: 'Notation discipline', zh: '记法纪律', ru: 'Дисциплина обозначений' },
              body: {
                en: 'Every transform in the codebase is named `T_destination_source`, so composition reads left to right and a reversed multiplication becomes visually obvious at review time. This single convention has caught more bugs than any test I wrote.',
                zh: '代码库中每个变换都命名为 `T_destination_source`，这样复合运算从左到右读，乘反了在评审时一眼可见。仅这一条约定抓到的 bug，比我写的任何测试都多。',
                ru: 'Каждое преобразование в коде названо `T_destination_source`, поэтому композиция читается слева направо, а перевёрнутое умножение видно глазом на ревью. Одно это соглашение поймало больше ошибок, чем любой написанный мной тест.',
              },
            },
            {
              label: { en: 'Units at the boundary', zh: '边界处统一单位', ru: 'Единицы на границе' },
              body: {
                en: 'Millimetres everywhere internally. Conversion happens exactly once, at the protocol edge. Mixed units in a transform chain produce an error that looks like a calibration problem and is not.',
                zh: '内部一律毫米。换算只在协议边界发生一次。变换链里混用单位会产生一个"看起来像标定问题"的误差，而它其实不是。',
                ru: 'Внутри везде миллиметры. Перевод происходит ровно один раз, на границе протокола. Смешение единиц в цепочке преобразований даёт ошибку, которая выглядит как проблема калибровки и ею не является.',
              },
            },
            {
              label: { en: 'Rotation at capture', zh: '采集时旋转', ru: 'Разворот при съёмке' },
              body: {
                en: 'The cameras are mounted rotated: the left image is turned 90° clockwise before the algorithm sees it, the right 90° counter-clockwise, and the 11×8 board is therefore detected as 8×11. Normalising at the capture boundary keeps every stage downstream free of orientation special-cases.',
                zh: '相机是旋转安装的：左图在进入算法前顺时针旋转 90°，右图逆时针旋转 90°，因此 11×8 的棋盘按 8×11 检测。在采集边界完成归一化，使下游每个阶段都不必处理朝向特例。',
                ru: 'Камеры стоят повёрнутыми: левое изображение разворачивается на 90° по часовой стрелке до того, как его увидит алгоритм, правое — на 90° против, и доска 11×8 поэтому детектируется как 8×11. Нормализация на границе захвата избавляет каждый последующий этап от особых случаев по ориентации.',
              },
            },
          ],
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
            en: 'Single-group confirmation, not continuous capture',
            zh: '单组确认，而非连续采集',
            ru: 'Подтверждение по одному набору, а не непрерывная съёмка',
          },
          body: {
            en: 'The intuitive design is to stream frames while the arm moves and collect hundreds of samples. That is actively harmful: hundreds of near-identical consecutive frames look like a rich dataset to the solver while carrying almost no rotational diversity, which is exactly what hand-eye calibration needs. The tool instead requires the arm to move to a new pose, come to a stop, and then the operator confirms one synchronised capture. Fewer, better-conditioned samples.',
            zh: '直觉上的设计是在机械臂运动时连续采帧、收集几百个样本。这其实有害：几百个几乎相同的连续帧，在求解器看来像是一个丰富的数据集，实际却几乎不含旋转多样性——而旋转多样性恰恰是手眼标定最需要的。本工具的做法相反：要求机械臂移动到新位姿、完全停稳，然后由操作者确认采集一个同步组。样本更少，但条件数更好。',
            ru: 'Интуитивное решение — лить кадры, пока манипулятор движется, и набрать сотни образцов. Это прямо вредно: сотни почти одинаковых последовательных кадров выглядят для решателя богатым набором данных, неся при этом почти нулевое разнообразие по вращению — а именно оно и нужно калибровке «рука — глаз». Вместо этого инструмент требует, чтобы манипулятор перешёл в новую позу, полностью остановился, и только тогда оператор подтверждает один синхронный снимок. Меньше образцов, но лучше обусловленных.',
          },
        },
        {
          kind: 'prose',
          body: {
            en: 'The second decision was to build a controller simulator. `fake_dobot` speaks the real CR V4 protocol — including the 30004 real-time state channel at 8 ms per frame — so the capture planner, the kinematic pre-check and the safety monitor can all be exercised in CI with no robot powered on. Before it existed, every protocol change needed lab time; after it, protocol bugs were caught on a laptop.',
            zh: '第二个决策是做一个控制柜模拟器。`fake_dobot` 说的是真实的 CR V4 协议——包括 30004 实时状态通道、每帧 8 ms——因此采点规划、运动学预检与安全监控都能在 CI 里跑，不需要给任何机器人通电。在它存在之前，每次协议改动都要占用实验室时间；在它之后，协议 bug 在笔记本上就能抓到。',
            ru: 'Второе решение — написать симулятор контроллера. `fake_dobot` говорит на настоящем протоколе CR V4, включая канал состояния реального времени 30004 с кадром каждые 8 мс, поэтому планировщик съёмки, кинематическую предпроверку и монитор безопасности можно прогонять в CI, не подавая питание ни на одного робота. Пока его не было, каждое изменение протокола требовало времени в лаборатории; после — ошибки протокола ловились на ноутбуке.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Decision', zh: '决策', ru: 'Решение' },
            { en: 'Chosen', zh: '选择', ru: 'Выбрано' },
            { en: 'Why', zh: '原因', ru: 'Почему' },
          ],
          rows: [
            [
              { en: 'Solver selection', zh: '求解器选择', ru: 'Выбор решателя' },
              { en: 'Auto + LM refinement', zh: 'Auto + LM 优化', ru: 'Авто + доводка ЛМ' },
              {
                en: 'Run the closed-form methods, pick by residual, then refine non-linearly. No single analytic method wins across pose sets.',
                zh: '跑完各闭式方法，按残差择优，再做非线性优化。没有任何单一解析方法能在所有位姿集上取胜。',
                ru: 'Прогнать методы в замкнутой форме, выбрать по невязке, затем уточнить нелинейно. Ни один аналитический метод не выигрывает на всех наборах поз.',
              },
            ],
            [
              { en: 'Quality reporting', zh: '质量报告', ru: 'Отчёт о качестве' },
              {
                en: 'Per-pose residual + reprojection error',
                zh: '逐位姿残差 + 重投影误差',
                ru: 'Невязка по каждой позе + ошибка репроекции',
              },
              {
                en: 'A single RMS hides the one bad pose dragging the fit. Per-pose numbers let an operator delete it and re-solve.',
                zh: '单一 RMS 会掩盖那个拖垮拟合的坏位姿。逐位姿数字让操作者能删掉它并重新求解。',
                ru: 'Одно значение СКО прячет ту единственную плохую позу, которая тянет подгонку. Числа по каждой позе позволяют оператору удалить её и пересчитать.',
              },
            ],
            [
              { en: 'Dependency strategy', zh: '依赖策略', ru: 'Стратегия зависимостей' },
              {
                en: 'Vendored runtime, portable build',
                zh: '运行库随包分发，可移植构建',
                ru: 'Среда исполнения в поставке, переносимая сборка',
              },
              {
                en: "Qt, OpenCV and the MVS runtime are deployed next to the binary. A calibration tool that only runs on the author's machine is not a tool.",
                zh: 'Qt、OpenCV 与 MVS 运行库与可执行文件一同部署。一个只能在作者机器上跑的标定工具，不算工具。',
                ru: 'Qt, OpenCV и среда MVS разворачиваются рядом с исполняемым файлом. Инструмент калибровки, который запускается только на машине автора, — не инструмент.',
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
            en: 'Validation used three layers, because the only way to trust a calibration tool is to know its answer when you already know the answer.',
            zh: '验证分三层，因为信任一个标定工具的唯一办法，是在你已经知道答案的情况下看它给出什么答案。',
            ru: 'Проверка шла в три слоя, потому что единственный способ доверять инструменту калибровки — посмотреть, что он отвечает там, где ответ вам уже известен.',
          },
        },
        {
          kind: 'bullets',
          ordered: true,
          items: [
            {
              label: { en: 'Synthetic ground truth', zh: '合成真值', ru: 'Синтетический эталон' },
              body: {
                en: 'Generate pose sets from a known T_tool_camera, add calibrated noise, and assert the solver recovers it within tolerance. This is the only test that can distinguish a wrong solver from a hard dataset.',
                zh: '从一个已知的 T_tool_camera 生成位姿集，加入标定过的噪声，断言求解器能在容差内还原它。这是唯一能区分"求解器错了"与"数据集难"的测试。',
                ru: 'Сгенерировать наборы поз из известного T_tool_camera, добавить откалиброванный шум и проверить, что решатель восстанавливает его в пределах допуска. Это единственный тест, способный отличить неверный решатель от трудного набора данных.',
              },
            },
            {
              label: { en: 'Degeneracy probes', zh: '退化探测', ru: 'Пробы на вырождение' },
              body: {
                en: 'Deliberately construct bad pose sets — coplanar, pure-translation, insufficient rotation spread — and confirm the tool reports low confidence rather than a plausible number.',
                zh: '刻意构造坏位姿集——共面、纯平移、旋转张角不足——确认工具报告低置信度，而不是给出一个看起来合理的数字。',
                ru: 'Намеренно построить плохие наборы поз — компланарные, с чистым переносом, с недостаточным разбросом по вращению — и убедиться, что инструмент сообщает о низкой достоверности, а не выдаёт правдоподобное число.',
              },
            },
            {
              label: {
                en: 'Hardware round-trip',
                zh: '真机往返验证',
                ru: 'Проверка на железе',
              },
              body: {
                en: 'With the solved transform, command the arm to touch a known point from several approach directions. Consistent contact across approaches is the end-to-end signal; a single successful approach proves nothing.',
                zh: '用求得的变换，命令机械臂从多个接近方向触碰一个已知点。跨方向的一致接触才是端到端信号；单一方向成功什么都不能证明。',
                ru: 'С найденным преобразованием приказать манипулятору коснуться известной точки с нескольких направлений подхода. Сигнал сквозной проверки — согласованный контакт по всем подходам; один удачный подход не доказывает ничего.',
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
            en: 'The outcome I was aiming for was organisational rather than numerical: calibration stopped being a task that required me. An operator follows five tabs, the tool refuses to accept a degenerate pose set, and the output directory contains the transform alongside the residuals that justify it. Recalibration after a gripper change went from a half-day with an expert to about twenty minutes without one.',
            zh: '我追求的结果是组织性的，而不是数值性的：标定不再是一件必须由我来做的事。操作者按五个页签走一遍，工具会拒绝接受退化的位姿集，输出目录里除变换本身还包含支撑它的残差数据。更换夹爪后的重标定，从"专家在场的半天"变成"无需专家的二十分钟左右"。',
            ru: 'Результат, к которому я шёл, был организационным, а не числовым: калибровка перестала быть задачей, требующей меня. Оператор проходит пять вкладок, инструмент отказывается принимать вырожденный набор поз, а в выходном каталоге лежит преобразование вместе с невязками, которые его обосновывают. Перекалибровка после смены захвата превратилась из полудня со специалистом примерно в двадцать минут без него.',
          },
        },
        {
          kind: 'metrics',
          items: [
            {
              value: '~20min',
              provenance: 'illustrative',
              label: { en: 'Recalibration time', zh: '重标定耗时', ru: 'Время перекалибровки' },
              detail: {
                en: 'By a non-specialist operator',
                zh: '由非专业操作者完成',
                ru: 'Оператором без специальной подготовки',
              },
            },
            {
              value: '3',
              provenance: 'spec',
              countTo: 3,
              label: { en: 'Validation layers', zh: '验证层级', ru: 'Слоёв проверки' },
              detail: {
                en: 'Synthetic · degeneracy · hardware',
                zh: '合成 · 退化 · 真机',
                ru: 'Синтетика · вырождение · железо',
              },
            },
            {
              value: 'CI',
              provenance: 'spec',
              label: { en: 'Protocol coverage', zh: '协议覆盖', ru: 'Покрытие протокола' },
              detail: {
                en: 'Via fake_dobot, no robot needed',
                zh: '通过 fake_dobot，无需真机',
                ru: 'Через fake_dobot, робот не нужен',
              },
            },
          ],
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
            en: 'The pose planner should have scored candidate poses for rotational diversity from the start, rather than planning a geometric sweep and reporting conditioning afterwards. Measuring the problem is good; preventing it is better, and the information needed to prevent it was available before the arm moved.',
            zh: '采点规划器从一开始就应该按旋转多样性对候选位姿打分，而不是先规划一个几何扫描、事后再报告条件数。度量问题是好的；预防问题更好——而预防所需的信息，在机械臂动之前就已经具备了。',
            ru: 'Планировщик поз должен был с самого начала оценивать кандидатов по разнообразию вращения, а не планировать геометрический обход и сообщать об обусловленности задним числом. Измерять проблему хорошо; предотвращать её лучше — а информация, нужная для предотвращения, была доступна ещё до того, как манипулятор начал двигаться.',
          },
        },
      ],
    },
  ],
};
