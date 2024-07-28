<script lang="ts">
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  
    export let title: string;
    export let value: string;
  </script>
  
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>