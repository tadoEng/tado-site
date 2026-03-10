const LANGUAGE_ALIASES: Record<string, string> = {
  py: "python",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  typescripts: "typescript",
  jsx: "javascript",
  csharp: "c#",
  cs: "c#",
  fsharp: "f#",
  fs: "f#",
  cpp: "c++",
  cxx: "c++",
  rs: "rust",
  rustlang: "rust",
  sh: "bash",
  shell: "bash",
  ps1: "powershell",
  plaintext: "text",
  plain: "text",
};

function normalizeLanguageLabel(input: string): string {
  const raw = input.trim().toLowerCase();
  if (!raw) return "text";
  return (LANGUAGE_ALIASES[raw] ?? raw).replace(/[-_]/g, " ");
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    Object.assign(ta.style, { position: "fixed", left: "-9999px" });
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function initReadingProgress(): void {
  const bar = document.getElementById("reading-progress");
  if (!bar) return;

  const update = () => {
    const el = document.documentElement;
    const total = el.scrollHeight - el.clientHeight;
    bar.style.width = total > 0 ? `${(el.scrollTop / total) * 100}%` : "0%";
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function enhanceCodeBlocks(): void {
  document.querySelectorAll<HTMLElement>("article .article-prose pre").forEach((pre) => {
    if (pre.parentElement?.classList.contains("code-block-wrap")) return;

    const code = pre.querySelector("code");
    const raw = (code?.textContent ?? pre.textContent ?? "").replace(/\n$/, "");
    const langClass = [...(code?.classList ?? pre.classList ?? [])].find((c) =>
      c.startsWith("language-")
    );
    const language = normalizeLanguageLabel(
      pre.dataset.language ?? (langClass ? langClass.replace("language-", "") : "text")
    );
    const lines = (code?.textContent ?? "")
      .split("\n")
      .filter((line, i, arr) => !(i === arr.length - 1 && line === "")).length;

    const wrap = document.createElement("div");
    wrap.className = "code-block-wrap";

    const toolbar = document.createElement("div");
    toolbar.className = "code-block-toolbar";

    const left = document.createElement("div");
    left.className = "code-block-left";

    const lang = document.createElement("span");
    lang.className = "code-block-lang";
    lang.textContent = language;

    const lineCount = document.createElement("span");
    lineCount.className = "code-block-lines";
    lineCount.textContent = `${lines} line${lines !== 1 ? "s" : ""}`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy-btn";
    btn.setAttribute("aria-label", `Copy ${language} code`);

    const copyIcon =
      '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M2.5 9H2a1 1 0 01-1-1V2a1 1 0 011-1h6a1 1 0 011 1v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
    const checkIcon =
      '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 7l3.5 3.5L11 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.innerHTML = `${copyIcon}<span>Copy</span>`;

    btn.addEventListener("click", async () => {
      const ok = await copyText(raw);
      if (ok) {
        btn.innerHTML = `${checkIcon}<span>Copied!</span>`;
        btn.classList.add("copied");
      }
      setTimeout(() => {
        btn.innerHTML = `${copyIcon}<span>Copy</span>`;
        btn.classList.remove("copied");
      }, 1800);
    });

    left.appendChild(lang);
    left.appendChild(lineCount);
    toolbar.appendChild(left);
    toolbar.appendChild(btn);
    pre.parentElement?.insertBefore(wrap, pre);
    wrap.appendChild(toolbar);
    wrap.appendChild(pre);
  });
}

export function initArticleEnhancements(): void {
  const boot = () => {
    initReadingProgress();
    enhanceCodeBlocks();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
    return;
  }

  boot();
}
