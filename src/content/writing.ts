import type { Article } from './types';

/**
 * Technical writing.
 *
 * Every entry below is drafted from real engineering notes but is not yet
 * published anywhere, so each carries `href: null` and renders as an unlinked
 * card with an "unpublished" marker. Set `href` to the live URL and add
 * `external: true` to turn one into a link.
 *
 * The dates are the dates the work happened, not publication dates — update
 * them when you publish if you would rather show the latter.
 *
 * Original TODO: point `href` at your real posts. External links open in a new
 * tab with rel="noopener noreferrer"; internal routes are plain links.
 */
export const articles: Article[] = [
  {
    title: {
      en: 'The error message is lying: three CUDA traps on Blackwell',
      zh: '报错在撒谎：Blackwell 上的三个 CUDA 陷阱',
      ru: 'Сообщение об ошибке врёт: три ловушки CUDA на Blackwell',
    },
    excerpt: {
      en: 'A missing NPP library reported as an FFmpeg failure, a torch wheel with no kernels for your card that still says is_available() is True, and a sitecustomize.py that is silently shadowed by the one Ubuntu ships. The pattern: read the repeated line in the traceback, not the exception on top.',
      zh: '缺失的 NPP 库被报成 FFmpeg 失败；一个不含你显卡内核的 torch wheel 依然声称 is_available() 为 True；还有一个被 Ubuntu 自带同名文件静默遮蔽的 sitecustomize.py。规律是：读 traceback 里重复出现的那一行，而不是最上面的异常。',
      ru: 'Отсутствующая библиотека NPP, о которой сообщают как об ошибке FFmpeg; колесо torch без ядер под вашу карту, которое всё равно отвечает is_available() == True; и sitecustomize.py, который молча перекрыт тем, что поставляет Ubuntu. Закономерность одна: читайте строку, повторяющуюся в трассировке, а не исключение сверху.',
    },
    date: '2026-10-15',
    readingMinutes: 11,
    tags: ['CUDA', 'PyTorch', 'Debugging'],
    // TODO(content): set to the published URL and add external: true.
    href: null,
    featured: true,
  },
  {
    title: {
      en: 'Why I store resolved prompts instead of templates',
      zh: '为什么我存已解析的 prompt，而不是模板',
      ru: 'Почему я храню развёрнутые промпты, а не шаблоны',
    },
    excerpt: {
      en: 'Logging a template plus its variables feels equivalent to logging the prompt. It is not — resolution logic changes, truncation is behaviour, and retrieval is non-deterministic. Disk is cheap; the question "what did the model actually see?" is otherwise unanswerable.',
      zh: '记录模板加变量，感觉上等同于记录 prompt。其实不等同——解析逻辑会变、截断本身就是行为、检索是非确定性的。磁盘很便宜；而"模型实际看到了什么？"这个问题，否则根本无法回答。',
      ru: 'Записать шаблон вместе с переменными ощущается как запись самого промпта. Это не так: логика подстановки меняется, усечение — это поведение, а поиск недетерминирован. Диск дёшев; вопрос «что модель увидела на самом деле?» иначе остаётся без ответа.',
    },
    date: '2026-08-02',
    readingMinutes: 7,
    tags: ['Agents', 'Observability'],
    // TODO(content): set to the published URL and add external: true.
    href: null,
    featured: true,
  },
  {
    title: {
      en: 'Zero-copy IPC for a robot that works outdoors',
      zh: '为户外作业机器人做零拷贝 IPC',
      ru: 'IPC без копирования для робота, работающего в поле',
    },
    excerpt: {
      en: 'A 2 MP stereo pair at 30 fps is ~350 MB/s. Pushing that through a conventional message bus buys you a memcpy per hop and allocator jitter in a loop that cannot jitter. Notes on moving image topics to shared memory while keeping DDS for everything else.',
      zh: '200 万像素双目、30 fps，约等于 350 MB/s。把它推过常规消息总线，换来的是每跳一次 memcpy，以及一个不允许抖动的环路里的分配器抖动。记录把图像话题迁到共享内存、同时保留 DDS 处理其余部分的过程。',
      ru: 'Стереопара 2 Мп на 30 к/с — это около 350 МБ/с. Прогон такого потока через обычную шину сообщений покупает вам memcpy на каждом переходе и дрожание аллокатора в контуре, которому дрожать нельзя. Заметки о переносе топиков с изображениями в разделяемую память с сохранением DDS для всего остального.',
    },
    date: '2026-05-21',
    readingMinutes: 14,
    tags: ['Rust', 'Robotics', 'Systems'],
    // TODO(content): set to the published URL and add external: true.
    href: null,
  },
  {
    title: {
      en: 'Reward hacking shows up in response length first',
      zh: '奖励攻击最先体现在回复长度上',
      ru: 'Взлом функции награды первым делом виден в длине ответа',
    },
    excerpt: {
      en: 'Three times a GRPO run that looked like a win was the policy discovering that the reward model prefers longer answers. The signature is always the same, it is trivial to monitor, and almost nobody charts it by default.',
      zh: '有三次，看起来像胜利的 GRPO 运行，其实是策略发现了"奖励模型偏好更长的回答"。征兆每次都一样，监控起来也很简单，但几乎没人把它作为默认图表。',
      ru: 'Трижды прогон GRPO, который выглядел как победа, оказывался тем, что политика обнаружила: модель награды предпочитает ответы подлиннее. Признак всегда один и тот же, отслеживать его тривиально, и почти никто не строит по нему график по умолчанию.',
    },
    date: '2026-03-09',
    readingMinutes: 6,
    tags: ['RLHF', 'GRPO', 'Evaluation'],
    // TODO(content): set to the published URL and add external: true.
    href: null,
  },
];
