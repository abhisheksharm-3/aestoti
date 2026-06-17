<script lang="ts">
  let {
    remainingSeconds,
    totalSeconds,
    size = 240,
    strokeWidth = 6,
    color = 'hsl(var(--primary))',
    trackColor = 'hsl(var(--muted))',
    bezelColor = 'hsl(var(--border))'
  }: {
    remainingSeconds: number;
    totalSeconds: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    bezelColor?: string;
  } = $props();

  let center = $derived(size / 2);
  let bezelRadius = $derived((size - 4) / 2);
  let radius = $derived((size - strokeWidth) / 2 - 12);
  let circumference = $derived(2 * Math.PI * radius);
  let progress = $derived(totalSeconds > 0 ? remainingSeconds / totalSeconds : 1);
  let dashoffset = $derived(circumference * (1 - progress));
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  style="transform: rotate(-90deg)"
  aria-hidden="true"
>
  <!-- chronograph tick bezel -->
  <circle
    cx={center}
    cy={center}
    r={bezelRadius}
    fill="none"
    stroke={bezelColor}
    stroke-width="2"
    stroke-dasharray="1.2 7.5"
    stroke-linecap="round"
  />
  <!-- track -->
  <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} stroke-width={strokeWidth} />
  <!-- draining progress -->
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
