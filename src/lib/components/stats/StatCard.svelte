<script lang="ts">
  let { title, value }: { title: string; value: string } = $props();
</script>

<div>
  <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
  <div class="mt-3 text-3xl font-semibold tabular-nums text-foreground">{value}</div>
</div>
