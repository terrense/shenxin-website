import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * The hero's particle/network field — the only WebGL on the site.
 *
 * Why 3D is justified here specifically: the effect depends on real
 * perspective. Nodes nearer the camera are larger and brighter, edges fade
 * with depth, and the whole lattice parallaxes against pointer movement. A 2D
 * canvas can fake one of those; faking all three costs more code than a
 * 60-line shader and still looks flat.
 *
 * Everything else that looks technical on this site — the architecture
 * diagrams — is plain SVG, because those carry information and SVG is
 * selectable, zoomable and crawlable.
 *
 * Budget: ~150 nodes, ~420 edges, two draw calls, no post-processing. Node
 * drift is computed identically in both shaders from a shared per-node seed,
 * so edges stay attached to the nodes they connect.
 */

const NODE_COUNT = 150;
const LINK_DISTANCE = 2.7;
const MAX_LINKS = 420;

/** Deterministic PRNG — the layout should be identical on every load. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type FieldData = {
  nodePositions: Float32Array;
  nodeSeeds: Float32Array;
  nodeScales: Float32Array;
  linkPositions: Float32Array;
  linkSeeds: Float32Array;
  linkAlphas: Float32Array;
};

function buildField(): FieldData {
  const rand = mulberry32(20261026);

  const nodePositions = new Float32Array(NODE_COUNT * 3);
  const nodeSeeds = new Float32Array(NODE_COUNT);
  const nodeScales = new Float32Array(NODE_COUNT);

  for (let i = 0; i < NODE_COUNT; i++) {
    // A flattened box: wide and shallow reads as a field rather than a cloud.
    nodePositions[i * 3 + 0] = (rand() - 0.5) * 19;
    nodePositions[i * 3 + 1] = (rand() - 0.5) * 11;
    nodePositions[i * 3 + 2] = (rand() - 0.5) * 7;
    nodeSeeds[i] = rand();
    nodeScales[i] = 0.5 + rand() * rand() * 2.1; // few large, many small
  }

  const links: number[] = [];
  const linkSeedPairs: number[] = [];
  const alphas: number[] = [];

  outer: for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dx = nodePositions[i * 3] - nodePositions[j * 3];
      const dy = nodePositions[i * 3 + 1] - nodePositions[j * 3 + 1];
      const dz = nodePositions[i * 3 + 2] - nodePositions[j * 3 + 2];
      const dist = Math.hypot(dx, dy, dz);
      if (dist > LINK_DISTANCE) continue;

      links.push(
        nodePositions[i * 3],
        nodePositions[i * 3 + 1],
        nodePositions[i * 3 + 2],
        nodePositions[j * 3],
        nodePositions[j * 3 + 1],
        nodePositions[j * 3 + 2],
      );
      linkSeedPairs.push(nodeSeeds[i]!, nodeSeeds[j]!);
      // Short edges are stronger — this is what gives the lattice structure.
      const a = 1 - dist / LINK_DISTANCE;
      alphas.push(a, a);

      if (links.length / 6 >= MAX_LINKS) break outer;
    }
  }

  return {
    nodePositions,
    nodeSeeds,
    nodeScales,
    linkPositions: new Float32Array(links),
    linkSeeds: new Float32Array(linkSeedPairs),
    linkAlphas: new Float32Array(alphas),
  };
}

/** Shared drift. Must stay byte-identical between the two shaders. */
const DRIFT = /* glsl */ `
  vec3 drift(vec3 p, float seed, float time) {
    float phase = seed * 6.2831853;
    p.x += sin(time * 0.21 + phase) * 0.22;
    p.y += cos(time * 0.17 + phase * 1.3) * 0.22;
    p.z += sin(time * 0.13 + phase * 0.7) * 0.18;
    return p;
  }
`;

const nodeVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aScale;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vDepthFade;
  varying float vTint;

  ${DRIFT}

  void main() {
    vec3 p = drift(position, aSeed, uTime);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio * (9.0 / -mv.z);
    vDepthFade = smoothstep(26.0, 6.0, -mv.z);
    vTint = aSeed;
  }
`;

const nodeFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vDepthFade;
  varying float vTint;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    // Squared falloff gives a small bright core with a soft halo.
    float core = smoothstep(0.5, 0.0, d);
    core *= core;
    vec3 tint = mix(uColorA, uColorB, smoothstep(0.35, 0.85, vTint));
    gl_FragColor = vec4(tint, core * vDepthFade * 0.95);
  }
`;

const linkVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aAlpha;
  uniform float uTime;
  varying float vAlpha;

  ${DRIFT}

  void main() {
    vec3 p = drift(position, aSeed, uTime);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = aAlpha * smoothstep(26.0, 6.0, -mv.z);
  }
`;

const linkFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uOpacity);
  }
`;

function Field({ intensity }: { intensity: number }) {
  const group = useRef<THREE.Group>(null);
  const field = useMemo(buildField, []);

  const nodeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 34 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      // Bright values on purpose: this canvas only ever renders inside the
      // hero's `.tone-dark` band, against near-black. The page's light-mode
      // accents (#0071e3 / #5b3fd6) are tuned for contrast on white and read
      // as muddy here.
      uColorA: { value: new THREE.Color('#5ee7ff') },
      uColorB: { value: new THREE.Color('#a78bfa') },
    }),
    [],
  );

  const linkUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#7ea8ff') },
      uOpacity: { value: 0.3 * intensity },
    }),
    [intensity],
  );

  useFrame((state, delta) => {
    // Clamp delta: a backgrounded tab resumes with a huge delta and the whole
    // field would jump a full rotation on return.
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    nodeUniforms.uTime.value = t;
    linkUniforms.uTime.value = t;

    if (!group.current) return;
    group.current.rotation.y += dt * 0.026;

    // Pointer parallax, eased toward the target so the field never snaps.
    // `state.pointer` is already normalised to -1…1 by R3F.
    // Y rotation is left to the constant drift above: adding pointer-driven
    // yaw on top of it makes the lattice appear to stall when the cursor
    // moves against the spin.
    const targetPitch = state.pointer.y * 0.13;
    group.current.rotation.x += (targetPitch - group.current.rotation.x) * 0.035;
    group.current.position.x += (state.pointer.x * 0.5 - group.current.position.x) * 0.03;
    group.current.position.y += (-state.pointer.y * 0.3 - group.current.position.y) * 0.03;
  });

  return (
    <group ref={group}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[field.linkPositions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[field.linkSeeds, 1]} />
          <bufferAttribute attach="attributes-aAlpha" args={[field.linkAlphas, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={linkVertex}
          fragmentShader={linkFragment}
          uniforms={linkUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[field.nodePositions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[field.nodeSeeds, 1]} />
          <bufferAttribute attach="attributes-aScale" args={[field.nodeScales, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={nodeVertex}
          fragmentShader={nodeFragment}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function NeuralField({ intensity = 1 }: { intensity?: number }) {
  // A backgrounded tab should cost nothing. R3F does not pause on its own.
  const [running, setRunning] = useState(() => document.visibilityState === 'visible');

  useEffect(() => {
    const onVisibility = () => setRunning(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <Canvas
      // Decorative: the hero text carries all the meaning.
      aria-hidden
      role="presentation"
      frameloop={running ? 'always' : 'never'}
      // Capping DPR at 1.6 is the single biggest win on high-density displays;
      // additive points do not benefit visibly beyond it.
      dpr={[1, 1.6]}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true,
      }}
      camera={{ position: [0, 0, 15], fov: 52, near: 0.1, far: 60 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Field intensity={intensity} />
    </Canvas>
  );
}
