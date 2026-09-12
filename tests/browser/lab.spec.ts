import { expect, test } from "@playwright/test";

test("record local loading and frame-cadence observations", async ({ page }, info) => {
  await page.addInitScript(() => {
    const readings = { lcpMs: 0, cls: 0 };
    Object.defineProperty(window, "portfolioLab", { value: readings });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) readings.lcpMs = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) readings.cls += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/");
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
  const result = await page.evaluate(async () => {
    const samples: number[] = [];
    await new Promise<void>((resolve) => {
      const tick = (time: number) => {
        samples.push(time);
        if (samples.length < 90) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    const gl = document.querySelector("canvas")?.getContext("webgl2");
    const debug = gl?.getExtension("WEBGL_debug_renderer_info");
    const readings = (window as Window & { portfolioLab?: { lcpMs: number; cls: number } })
      .portfolioLab;
    return {
      ...readings,
      rafCadenceFps: (1000 * (samples.length - 1)) / (samples[samples.length - 1] - samples[0]),
      renderer: debug ? gl?.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "unavailable",
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      limitations:
        "Local unthrottled lab. RAF cadence is not measured GPU throughput. Emulation is not physical mobile hardware. No field INP or visitor data.",
    };
  });
  await info.attach("lab-observations", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  console.log(`${info.project.name} lab: ${JSON.stringify(result)}`);
});
