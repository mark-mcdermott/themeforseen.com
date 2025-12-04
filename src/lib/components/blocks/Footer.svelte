<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="w-full py-8">
  <div
    class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4"
  >
    <div class="flex gap-6">
      <a
        href="/legal"
        class="text-lg text-muted-foreground hover:text-foreground transition-colors"
      >
        Legal
      </a>
    </div>
    <p class="text-lg text-muted-foreground flex items-center gap-1">
      © {year}. Made with <span class="noto-emoji">♥️</span> by
      <a
        href="https://markmcdermott.io"
        class="group inline-flex items-center transition hover:opacity-75"
      >
        <img
          src="/cartoon-head-with-outline.svg"
          alt="Mark McDermott"
          class="h-7 ml-1 w-auto transition dark:invert"
          title="Mark McDermott"
        />
      </a>
    </p>
  </div>
</footer>

<style>
  .noto-emoji {
    font-family: "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji",
      sans-serif;
  }
</style>
