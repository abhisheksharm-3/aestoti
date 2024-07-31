<script>

    import "../app.css";
    import { ModeWatcher } from "mode-watcher";
    import { Toaster } from "$lib/components/ui/sonner";
  
  </script>
  
  
    <div class="h-screen lg:px-10">
      <nav class="p-8 flex items-center justify-center">
        <img src="/logo.png" alt="logo" class="w-[60%] lg:w-[15%]" />
      </nav>
      <ModeWatcher />
      <Toaster />
      <slot />
    </div>