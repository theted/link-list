import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Deep water: abyss and trench keep it dark, link blue sunk to cobalt glows
// through, and a cold cyan runs in the currents
const PALETTE = [
  "#010312", // abyss
  "#040c3c", // midnight
  "#0d1f86", // cobalt
  "#031c4a", // ocean
  "#01020b", // trench
  "#020822", // deep
  "#053f5e", // lagoon
];
// The pool of light that follows the pointer
const POINTER = "#1630a0";

// Blending in OKLab keeps every in-between colour as deep and saturated as
// its ends, where sRGB blends go grey in the middle
const toOklab = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColors[7];
uniform vec3 uGlow;

vec3 oklabToLinear(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 linearToSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float tw = t * 0.7;

  // Fold space so the colour fields bend like slow currents
  vec2 w = p;
  w += 0.32 * vec2(
    sin(w.y * 1.8 + tw * 0.11 + sin(w.x * 1.2 - tw * 0.07)),
    cos(w.x * 1.5 - tw * 0.09 + cos(w.y * 1.3 + tw * 0.05))
  );
  w += 0.14 * vec2(sin(w.y * 3.4 - tw * 0.13), cos(w.x * 2.9 + tw * 0.12));
  w += 0.05 * vec2(sin(w.y * 6.3 + tw * 0.17), cos(w.x * 5.7 - tw * 0.15));

  // Each colour sits at a point drifting on its own slow loop
  vec2 pts[7];
  pts[0] = vec2(aspect * (0.12 + 0.10 * sin(t * 0.050)), 0.18 + 0.12 * cos(t * 0.070));
  pts[1] = vec2(aspect * (0.38 + 0.16 * cos(t * 0.040)), 0.78 + 0.10 * sin(t * 0.060));
  pts[2] = vec2(aspect * (0.80 + 0.12 * sin(t * 0.060 + 1.0)), 0.62 + 0.20 * cos(t * 0.045));
  pts[3] = vec2(aspect * (0.62 + 0.18 * cos(t * 0.035 + 2.0)), 0.12 + 0.12 * sin(t * 0.055));
  pts[4] = vec2(aspect * (0.05 + 0.10 * cos(t * 0.045 + 0.5)), 0.95 + 0.08 * sin(t * 0.050));
  pts[5] = vec2(aspect * (1.02 + 0.06 * sin(t * 0.040)), 0.05 + 0.10 * cos(t * 0.065));
  pts[6] = vec2(aspect * (0.50 + 0.30 * sin(t * 0.030 + 4.0)), 0.45 + 0.25 * cos(t * 0.040 + 1.0));

  vec3 lab = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 7; i++) {
    vec2 d = w - pts[i];
    float weight = 1.0 / pow(dot(d, d) + 0.015, 1.7);
    lab += uColors[i] * weight;
    total += weight;
  }

  // The pointer stirs in a pool of brighter blue
  vec2 dp = p - vec2(uPointer.x * aspect, uPointer.y);
  float pw = 0.3 / pow(dot(dp, dp) + 0.03, 1.7);
  lab += uGlow * pw;
  total += pw;
  lab /= total;

  vec3 col = oklabToLinear(lab);

  // Above the mesh, a tide of blue haze sweeps the other way, slower still
  vec2 q = p * 0.8;
  q += 0.4 * vec2(sin(q.y * 1.3 - t * 0.04), cos(q.x * 1.1 + t * 0.03));
  float tide = pow(0.5 + 0.5 * sin(q.x * 1.6 + q.y * 0.9 + t * 0.05), 5.0);
  col += vec3(0.010, 0.120, 0.520) * tide * 0.14;

  // And light from the surface comes down in shafts that sway and fade
  vec2 r = p - vec2(aspect * (0.42 + 0.06 * sin(t * 0.021)), 1.6);
  float a = atan(r.x, -r.y);
  float shafts =
    0.55 * pow(0.5 + 0.5 * sin(a * 17.0 + t * 0.07 + sin(t * 0.05) * 1.5), 3.0) +
    0.25 * pow(0.5 + 0.5 * sin(a * 27.0 - t * 0.05 + 1.3), 4.0) +
    0.4 * pow(0.5 + 0.5 * sin(a * 9.0 + t * 0.03 + 2.1), 2.0);
  shafts *= smoothstep(0.75, 0.0, abs(a)) * pow(smoothstep(0.0, 1.0, uv.y), 2.6);
  col += vec3(0.090, 0.420, 1.000) * shafts * 0.06;

  // Sink the corners further into the deep
  vec2 v = (uv - 0.5) * vec2(aspect * 0.7, 1.0);
  col *= mix(0.3, 1.0, smoothstep(1.05, 0.2, length(v)));

  gl_FragColor = vec4(linearToSrgb(col), 1.0);
}
`;

// Smooth gradients survive being drawn small and stretched, which keeps the
// shader cheap at any screen size
const SCALE = 0.35;

const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

// A slowly moving mesh gradient behind the splash, drawn with WebGL. A static
// CSS version of the same colours shows first, and stays when WebGL can't run.
export const DeepMesh = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    const gl = el?.getContext("webgl", { antialias: false, alpha: false, depth: false });
    if (!el || !gl) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One triangle that covers the screen
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uRes = uniform("uRes");
    const uTime = uniform("uTime");
    const uPointer = uniform("uPointer");
    gl.uniform3fv(uniform("uColors"), PALETTE.flatMap(toOklab));
    gl.uniform3fv(uniform("uGlow"), toOklab(POINTER));

    const resize = () => {
      el.width = Math.max(1, Math.round(el.clientWidth * SCALE));
      el.height = Math.max(1, Math.round(el.clientHeight * SCALE));
      gl.viewport(0, 0, el.width, el.height);
      gl.uniform2f(uRes, el.width, el.height);
    };
    resize();

    // The pool of light rests off to the right until the pointer moves
    const target = { x: 0.78, y: 0.4 };
    const pointer = { ...target };
    const onPointer = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    };

    // Start partway in, so the first frame isn't the loops' tidy origin
    const start = performance.now() - 40_000;
    let last = performance.now();
    let frame = 0;

    const draw = (now: number) => {
      // Lag behind the pointer, like light through water
      const ease = 1 - Math.exp(-(now - last) / 900);
      last = now;
      pointer.x += (target.x - pointer.x) * ease;
      pointer.y += (target.y - pointer.y) * ease;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(performance.now());
    });
    observer.observe(el);

    if (reduceMotion) {
      draw(performance.now());
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      frame = requestAnimationFrame(loop);
    }
    setDrawn(true);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      gl.deleteProgram(program);
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden className="deep-mesh fixed inset-0 -z-10">
      <canvas
        ref={canvas}
        className={cn(
          "size-full transition-opacity duration-1000",
          drawn ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="grain absolute inset-0" />
    </div>
  );
};
