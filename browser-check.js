const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 900 } });

  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console.error: " + m.text());
  });

  await page.goto("file://" + path.resolve(__dirname, "index.html"));

  // Empty state
  console.log("empty state visible:", await page.locator("#empty-state").isVisible());
  console.log("empty state text:", (await page.locator("#empty-state").textContent()).trim());
  console.log("counter:", await page.locator("#counter").textContent());
  await page.screenshot({ path: "screenshot-empty.png" });

  // Add todos
  for (const t of ["Buy milk", "Walk the dog", "Write the report"]) {
    await page.fill("#todo-input", t);
    await page.click(".todo-form button");
  }
  console.log("\nitems after adding:", await page.locator(".todo-item").count());
  console.log("counter:", await page.locator("#counter").textContent());
  await page.screenshot({ path: "screenshot-list.png" });

  // Complete the middle one
  await page.locator(".todo-item").nth(1).locator(".todo-checkbox").click();
  console.log("\ncounter after completing one:", await page.locator("#counter").textContent());

  // Filters
  await page.click('.filter[data-filter="active"]');
  console.log("active filter count:", await page.locator(".todo-item").count());
  await page.screenshot({ path: "screenshot-active.png" });

  await page.click('.filter[data-filter="completed"]');
  console.log("completed filter count:", await page.locator(".todo-item").count());
  await page.screenshot({ path: "screenshot-completed.png" });

  await page.click('.filter[data-filter="all"]');
  console.log("all filter count:", await page.locator(".todo-item").count());

  // Reload -> persistence
  await page.reload();
  console.log("\nitems after reload:", await page.locator(".todo-item").count());
  console.log("counter after reload:", await page.locator("#counter").textContent());
  console.log(
    "completed state preserved:",
    await page.locator(".todo-item").nth(1).evaluate((el) => el.classList.contains("completed"))
  );

  // Delete one
  await page.locator(".todo-item").nth(2).hover();
  await page.locator(".todo-item").nth(2).locator(".delete-btn").click();
  console.log("\nitems after delete:", await page.locator(".todo-item").count());
  await page.screenshot({ path: "screenshot-final.png" });

  // Dark mode
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "screenshot-dark.png" });
  console.log("\ndark mode screenshot captured");

  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 780 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "screenshot-mobile.png" });
  console.log("mobile screenshot captured");

  console.log("\nJS errors:", errors.length === 0 ? "none" : errors);
  await browser.close();
})();
