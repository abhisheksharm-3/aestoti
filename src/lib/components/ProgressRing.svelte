<script lang="ts">
  let {
    remainingSeconds,
    totalSeconds,
    size = 200,
    strokeWidth = 8,
    color = 'hsl(var(--primary))',
    trackColor = 'rgba(0,0,0,0.08)'
  }: {
    remainingSeconds: number;
    totalSeconds: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
  } = $props();

  let radius = $derived((size - strokeWidth) / 2);
  let circumference = $derived(2 * Math.PI * radius);
  let progress = $derived(totalSeconds > 0 ? remainingSeconds / totalSeconds : 1);
  let dashoffset = $derived(circumference * (1 - progress));
  let center = $derived(size / 2);
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  style="transform: rotate(-90deg)"
  aria-hidden="true"
>
  <circle
    cx={center}
    cy={center}
    r={radius}
    fill="none"
    stroke={trackColor}
    stroke-width={strokeWidth}
  />
  <circle
    cx={center}
    cy={center}
    r={radius}
    fill="none"
    stroke={color}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-dasharray={circumference}
    stroke-dashoffset={dashoffset}
    style="transition: stroke-dashoffset 1s linear"
  />
</svg>
