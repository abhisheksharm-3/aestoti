import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// shadcn-svelte (bits-ui v2) type helpers — required by the registry components.
export type WithoutChild<T> = T extends { child?: unknown } ? Omit<T, 'child'> : T;
export type WithoutChildren<T> = T extends { children?: unknown } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

type FlyAndScaleParamsType = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

export function flyAndScale(
  node: Element,
  params: FlyAndScaleParamsType = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig {
  const style = getComputedStyle(node);
  const transform = style.transform === 'none' ? '' : style.transform;

  function scaleConversion(
    valueA: number,
    scaleA: [number, number],
    scaleB: [number, number]
  ): number {
    const percentage = (valueA - scaleA[0]) / (scaleA[1] - scaleA[0]);
    return percentage * (scaleB[1] - scaleB[0]) + scaleB[0];
  }

  function styleToString(style: Record<string, number | string | undefined>): string {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + `${key}:${style[key]};`;
    }, '');
  }

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);
      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t
      });
    },
    easing: cubicOut
  };
}
