import type { ProjectCover } from './types';

/**
 * ===========================================================================
 * VISUAL ASSET MAP
 * ===========================================================================
 *
 * The single place that connects image files in `public/assets/` to projects.
 * Nothing else in the codebase references a cover path.
 *
 * Source: "AI / Robotics Portfolio Website — Concept Asset Pack v1"
 * (generated 2026-10-26). Seven AI-generated conceptual illustrations, none of
 * which are screenshots, photographs, or evidence of anything.
 *
 * ---------------------------------------------------------------------------
 * EVERY IMAGE HERE IS `mediaKind: 'concept'`
 * ---------------------------------------------------------------------------
 *
 * They all render a visible "Concept visualization" badge. That is not
 * optional and must not be removed — an unlabelled illustration on an
 * engineering case study is read as a screenshot of the real system.
 *
 * Several also carry a `note`, because the badge alone is not enough when the
 * artwork actively contradicts the text beside it. See each entry.
 *
 * ---------------------------------------------------------------------------
 * DELIBERATELY NOT USED: `about-engineer-concept.webp`
 * ---------------------------------------------------------------------------
 *
 * The pack includes an AI-generated portrait. It is not a likeness of anyone
 * real, and a portrait on an "About" page is read as a photograph of the
 * author no matter what badge sits on it — the badge says "illustration", the
 * context says "this is me". There is no honest way to use it here, so it is
 * not wired up and there is no `avatar` field in the design. Add a real photo
 * or none.
 *
 * ---------------------------------------------------------------------------
 * REPLACING THESE WITH REAL MEDIA
 * ---------------------------------------------------------------------------
 *
 * In priority order, per the pack's own guidance:
 *   1. Real Dobot CR10A field footage / hand-eye calibration screenshots,
 *      with IPs, serials and any confidential data removed.
 *   2. Real Isaac Lab renders.
 *   3. Real dashboards, or synthetic re-creations with clearly labelled
 *      example data.
 *
 * When you swap one in: point `src`/`thumb` at the new file, change
 * `mediaKind` to `'capture'`, and delete the `note`. Check your employer's
 * confidentiality and disclosure rules first.
 */
export const projectCovers: Record<string, ProjectCover> = {
  // Real capture, not concept art — a render from this project's own
  // simulated vineyard. The pack's AI "vineyard field robot" illustration was
  // dropped in favour of it: that image depicted harvesting with a generic
  // collaborative arm, which contradicts a thinning project running a Dobot
  // CR10A. A genuine screenshot of your own scene beats polished art that
  // argues with the text beside it.
  'grape-thinning-robot': {
    src: '/assets/real/sim-grape-cluster.webp',
    thumb: '/assets/real/thumbnails/sim-grape-cluster.webp',
    mediaKind: 'capture',
    alt: {
      en: 'Simulated vineyard scene showing a grape cluster hanging beneath a trellis canopy.',
      zh: '仿真葡萄园场景：棚架树冠下悬垂的一串葡萄。',
    },
  },

  'vla-lab': {
    src: '/assets/isaac-lab-vineyard-concept.webp',
    thumb: '/assets/thumbnails/isaac-lab-vineyard-concept.webp',
    mediaKind: 'concept',
    alt: {
      en: 'Illustration of a robotics simulation environment showing a manipulator in a vineyard scene.',
      zh: '机器人仿真环境示意图，画面为葡萄园场景中的机械臂。',
    },
    note: {
      en: 'Conceptual illustration in the style of a simulation platform — not a screenshot of Isaac Lab, and not this project’s scene.',
      zh: '仿真平台风格的概念示意图——并非 Isaac Lab 截图，也不是本项目的实际场景。',
    },
  },

  'post-training-pipeline': {
    src: '/assets/sim2real-dashboard-concept.webp',
    thumb: '/assets/thumbnails/sim2real-dashboard-concept.webp',
    mediaKind: 'concept',
    alt: {
      en: 'Illustration of a model-training dashboard with loss curves and evaluation panels.',
      zh: '模型训练仪表盘示意图，包含损失曲线与评测面板。',
    },
    note: {
      en: 'Conceptual dashboard. Every curve, score and counter shown is invented artwork, not a run from this pipeline.',
      zh: '概念仪表盘。画面中的所有曲线、分数与计数均为虚构，并非本流水线的实际运行结果。',
    },
  },

  'eye-in-hand-calibration': {
    src: '/assets/hand-eye-calibration-ui-concept.webp',
    thumb: '/assets/thumbnails/hand-eye-calibration-ui-concept.webp',
    mediaKind: 'concept',
    alt: {
      en: 'Illustration of a hand-eye calibration interface with a camera view, a 3D robot view and a results panel.',
      zh: '手眼标定界面示意图，包含相机视图、三维机器人视图与结果面板。',
    },
    // The artwork reads "Chessboard (8x6), 25.0 mm" and shows invented
    // transforms and device IPs. The case study states 11x8 at 20 mm. Without
    // this note a careful reader finds the contradiction unaided.
    note: {
      en: 'Conceptual interface, not the real Qt tool. The board size, transforms, error figures and device addresses shown are invented and differ from this project’s actual 11×8 / 20 mm setup.',
      zh: '概念界面，并非真实的 Qt 工具。画面中的标定板规格、变换矩阵、误差数值与设备地址均为虚构，与本项目实际的 11×8 / 20 mm 配置不一致。',
    },
  },

  'clinical-multimodal-agent': {
    src: '/assets/healthcare-agent-ui-concept.webp',
    thumb: '/assets/thumbnails/healthcare-agent-ui-concept.webp',
    mediaKind: 'concept',
    alt: {
      en: 'Illustration of a clinical assistant interface showing a draft note alongside source references.',
      zh: '临床助手界面示意图，左侧为草稿记录，右侧为来源引用。',
    },
    note: {
      en: 'Fictional interface. Not a real hospital product, and no patient data of any kind is depicted.',
      zh: '虚构界面。并非任何医院的真实产品，画面中也不含任何患者数据。',
    },
  },

  lilbot: {
    src: '/assets/lilbot-agent-dashboard-concept.webp',
    thumb: '/assets/thumbnails/lilbot-agent-dashboard-concept.webp',
    mediaKind: 'concept',
    alt: {
      en: 'Illustration of an agent runtime console showing an execution graph, tool calls and live logs.',
      zh: 'Agent 运行时控制台示意图，包含执行图、工具调用与实时日志。',
    },
    note: {
      en: 'Conceptual console. The task, success rate and counters shown are illustrative artwork, not real runtime state.',
      zh: '概念控制台。画面中的任务、成功率与各项计数均为示意，并非真实运行状态。',
    },
  },
};

export function coverFor(slug: string): ProjectCover | undefined {
  return projectCovers[slug];
}

/** Every asset path referenced here, for the build-time existence check. */
export function referencedAssetPaths(): string[] {
  return Object.values(projectCovers).flatMap((cover) =>
    [cover.src, cover.thumb].filter((p): p is string => Boolean(p)),
  );
}
