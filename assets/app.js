async function loadProfile() {
  const res = await fetch("./data/profile.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load profile.json");
  return await res.json();
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return node;
}

function mountList(ul, items) {
  ul.innerHTML = "";
  for (const t of items) ul.appendChild(el("li", {}, [t]));
}

function mountMeta(metaEl, meta) {
  metaEl.innerHTML = "";
  for (const m of meta) {
    metaEl.appendChild(
      el("div", { class: "pill" }, [
        el("strong", {}, [m.label]),
        el("span", {}, [m.value])
      ])
    );
  }
}

function mountLinks(ctaEl, links) {
  ctaEl.innerHTML = "";
  for (const l of links) {
    if (l.type === "print") {
      const a = el("a", { class: `btn ${l.primary ? "primary" : ""}`, href: "#" }, [l.text]);
      a.addEventListener("click", (e) => { e.preventDefault(); window.print(); });
      ctaEl.appendChild(a);
      continue;
    }
    ctaEl.appendChild(
      el("a", {
        class: `btn ${l.primary ? "primary" : ""}`,
        href: l.href || "#",
        target: "_blank",
        rel: "noreferrer"
      }, [l.text])
    );
  }
}

function mountSeaService(tbody, rows) {
  tbody.innerHTML = "";
  for (const r of rows) {
    const ul = el("ul", { style: "margin:0; padding-left:18px;" }, r.bullets.map(b => el("li", {}, [b])));
    tbody.appendChild(
      el("tr", {}, [
        el("td", {}, [r.period]),
        el("td", {}, [
          el("div", {}, [el("strong", {}, [r.vessel])]),
          el("div", { class: "sub" }, [r.vesselSub || ""])
        ]),
        el("td", {}, [r.rank]),
        el("td", {}, [ul])
      ])
    );
  }
}

function mountProjects(root, projects) {
  root.innerHTML = "";
  for (const p of projects) {
    const top = el("div", { class: "top" }, [
      el("div", {}, [
        el("div", { class: "name" }, [p.name]),
        el("div", { class: "sub" }, [p.sub || ""])
      ]),
      el("div", { class: "when" }, [p.year || ""])
    ]);

    const ul = el("ul", {}, (p.bullets || []).map(b => el("li", {}, [b])));
    const item = el("div", { class: "item" }, [top, ul]);

    if (p.href) {
      item.appendChild(
        el("div", { class: "hint" }, [
          (p.linkText || "Link") + ": ",
          el("a", { href: p.href, target: "_blank", rel: "noreferrer" }, [p.hrefText || p.href])
        ])
      );
    }
    root.appendChild(item);
  }
}

function mountChips(root, items) {
  root.innerHTML = "";
  for (const s of items) root.appendChild(el("span", { class: "chip" }, [s]));
}

function mountKVs(root, rows) {
  root.innerHTML = "";
  for (const r of rows) {
    root.appendChild(
      el("div", { class: "kv" }, [
        el("div", { class: "k" }, [r.k]),
        el("div", { class: "v" }, [r.v])
      ])
    );
  }
}

function mountEducation(root, rows) {
  root.innerHTML = "";
  for (const e of rows) {
    const top = el("div", { class: "top" }, [
      el("div", {}, [
        el("div", { class: "name" }, [e.name]),
        el("div", { class: "sub" }, [e.sub || ""])
      ]),
      el("div", { class: "when" }, [e.year || ""])
    ]);
    const ul = el("ul", {}, (e.bullets || []).map(b => el("li", {}, [b])));
    root.appendChild(el("div", { class: "item" }, [top, ul]));
  }
}

(async function main() {
  try {
    const p = await loadProfile();

    document.getElementById("page-title").textContent = p.pageTitle || "Resume";
    document.title = p.pageTitle || "Resume";

    document.getElementById("name").textContent = p.name || "";
    document.getElementById("role").textContent = p.role || "";

    mountMeta(document.getElementById("meta"), p.meta || []);
    mountLinks(document.getElementById("cta"), p.links || []);

    document.getElementById("summary-hint").textContent = p.summaryHint || "";
    document.getElementById("summary-title").textContent = p.summaryTitle || "Summary";
    mountList(document.getElementById("summary"), p.summary || []);

    document.getElementById("sea-hint").textContent = p.seaHint || "";
    mountSeaService(document.getElementById("sea-service"), p.seaService || []);

    document.getElementById("proj-hint").textContent = p.projectHint || "";
    mountProjects(document.getElementById("projects"), p.projects || []);

    mountChips(document.getElementById("skills"), p.skills || []);
    mountKVs(document.getElementById("certs"), p.certificates || []);
    mountEducation(document.getElementById("education"), p.education || []);

    document.getElementById("hl-hint").textContent = p.highlightsHint || "";
    mountList(document.getElementById("highlights"), p.highlights || []);

    document.getElementById("pdf-hint").textContent = p.pdfHint || "";
    document.getElementById("pdf-link").setAttribute("href", p.pdfHref || "./resume.pdf");

    document.getElementById("y").textContent = new Date().getFullYear();
    document.getElementById("footer-name").textContent = p.footerName || (p.name || "");

  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<div style="padding:24px; font-family: system-ui; color:#111; background:#fff">
      <h1>Failed to load profile</h1>
      <p>Check <code>data/profile.json</code> and run via a local server (not file://).</p>
      <pre>${String(err)}</pre>
    </div>`;
  }
})();
