"use strict";

const $ = id => document.getElementById(id);
const BASE = "https://raw.githubusercontent.com/Madssb/InteractiveGearProg/main/";
const KEY = "ladlor-iron-edition-v1";
const PREF = "ladlor-iron-options-v1";
const defaults = { retirement: false, levels: false, slayer: false, names: false, theme: "dark" };
const prefs = { ...defaults };
let main = [], retirement = [], meta = {}, done = new Set();
let active = "", last = "", retirementAvailable = true, loaded = false;

try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
  if (Array.isArray(saved)) done = new Set(saved.filter(value => typeof value === "string"));
} catch {}
try {
  const saved = JSON.parse(localStorage.getItem(PREF) || "{}");
  if (saved && typeof saved === "object") {
    for (const key of Object.keys(defaults)) {
      if (key === "theme") {
        if (["dark", "light"].includes(saved[key])) prefs[key] = saved[key];
      } else if (typeof saved[key] === "boolean") prefs[key] = saved[key];
    }
  }
} catch {}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
    localStorage.setItem(PREF, JSON.stringify(prefs));
  } catch {
    $("message").textContent = "Storage unavailable; changes last for this session only.";
  }
}

function applyPreferences() {
  document.body.dataset.theme = prefs.theme;
  $("chart").classList.toggle("names", prefs.names);
  for (const key of Object.keys(defaults)) {
    if (key === "theme") $(key).value = prefs[key];
    else $(key).checked = prefs[key];
  }
}

function eligible(name) {
  return !(prefs.levels && meta[name]?.type === "skill") &&
    !(prefs.slayer && meta[name]?.type === "slayer");
}

function rows() {
  const groups = [...main, ...(prefs.retirement && retirementAvailable ? retirement : [])];
  return groups.map(group => group.filter(eligible)).filter(group => group.length);
}

function findTile(name) {
  return [...document.querySelectorAll(".tile")].find(button => button.dataset.name === name);
}

function imageUrl(path) {
  return new URL(path, "https://ladlorchart.com/").href;
}

function makeTile(name) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tile" + (done.has(name) ? " done" : "");
  button.dataset.name = name;
  button.title = name;
  button.setAttribute("aria-label", name + (done.has(name) ? ", completed" : ", incomplete"));
  if (meta[name]?.imgUrl) {
    const image = document.createElement("img");
    image.src = imageUrl(meta[name].imgUrl);
    image.alt = "";
    image.loading = "lazy";
    image.onerror = () => { image.remove(); button.classList.add("no-image"); };
    button.append(image);
  } else button.classList.add("no-image");
  const label = document.createElement("span");
  label.className = "name";
  label.textContent = name;
  button.append(label);
  if (meta[name]?.type === "skill") {
    const match = name.match(/^\d+/);
    if (match) {
      const level = document.createElement("span");
      level.className = "level";
      level.textContent = match[0];
      button.append(level);
    }
  }
  button.addEventListener("click", () => openItem(name));
  return button;
}

function render() {
  const query = $("search").value.trim().toLowerCase();
  const filter = $("filter").value;
  const groups = rows();
  const fragment = document.createDocumentFragment();
  let visible = 0;
  for (const group of groups) {
    const matches = group.filter(name => name.toLowerCase().includes(query) &&
      (filter === "all" || (filter === "done" ? done.has(name) : !done.has(name))));
    if (!matches.length) continue;
    visible += matches.length;
    const row = document.createElement("div");
    row.className = "row";
    matches.forEach(name => row.append(makeTile(name)));
    fragment.append(row);
  }
  if (!visible) {
    const text = document.createElement("p");
    text.className = "empty";
    text.textContent = "No matching milestones.";
    fragment.append(text);
  }
  $("chart").replaceChildren(fragment);
  const all = [...new Set(groups.flat())];
  const count = all.filter(name => done.has(name)).length;
  $("count").textContent = `${count} / ${all.length} COMPLETE`;
  $("percent").textContent = (all.length ? Math.round(count / all.length * 100) : 0) + "%";
  $("progress").max = all.length || 1;
  $("progress").value = count;
}

function updateItemState() {
  $("state").textContent = done.has(active) ? "Completed" : "Not yet completed";
  $("toggle").textContent = done.has(active) ? "Mark incomplete" : "✓ Mark complete";
}

function openItem(name) {
  active = last = name;
  $("title").textContent = name;
  $("art").replaceChildren();
  if (meta[name]?.imgUrl) {
    const image = document.createElement("img");
    image.src = imageUrl(meta[name].imgUrl);
    image.alt = name;
    image.onerror = () => { image.remove(); $("art").textContent = name; };
    $("art").append(image);
  } else $("art").textContent = name;
  let url = "https://oldschool.runescape.wiki/?search=" + encodeURIComponent(name);
  try {
    const candidate = new URL(meta[name]?.wikiUrl);
    if (candidate.protocol === "https:") url = candidate.href;
  } catch {}
  $("wiki").href = url;
  updateItemState();
  $("detail").showModal();
}

for (const key of Object.keys(defaults)) {
  $(key).addEventListener("change", () => {
    prefs[key] = key === "theme" ? $(key).value : $(key).checked;
    applyPreferences();
    save();
    if (loaded) render();
  });
}
$("search").addEventListener("input", () => { if (loaded) render(); });
$("filter").addEventListener("change", () => { if (loaded) render(); });
$("toggle").addEventListener("click", () => {
  if (!active) return;
  done.has(active) ? done.delete(active) : done.add(active);
  save();
  render();
  updateItemState();
});
$("reset").addEventListener("click", () => {
  if (confirm("Reset all completion progress, including hidden items?")) {
    done.clear();
    save();
    if (loaded) render();
  }
});
$("next").addEventListener("click", () => {
  if (!loaded) return;
  const name = rows().flat().find(name => !done.has(name));
  if (!name) { $("message").textContent = "All currently enabled milestones are complete."; return; }
  $("search").value = "";
  $("filter").value = "all";
  render();
  const button = findTile(name);
  button.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  button.focus({ preventScroll: true });
});

const settings = document.querySelector("details.settings");
const settingsButton = settings.querySelector("summary");
settingsButton.setAttribute("aria-expanded", "false");
settings.addEventListener("toggle", () => settingsButton.setAttribute("aria-expanded", String(settings.open)));
document.addEventListener("click", event => {
  if (settings.open && !settings.contains(event.target)) settings.open = false;
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && settings.open) {
    settings.open = false;
    settingsButton.focus();
  }
});

const dialog = $("detail");
let startedOutside = false;
function outside(event) {
  const bounds = dialog.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom;
}
dialog.addEventListener("pointerdown", event => {
  startedOutside = event.target === dialog && outside(event);
});
dialog.addEventListener("pointercancel", () => { startedOutside = false; });
dialog.addEventListener("click", event => {
  if (dialog.open && startedOutside && event.target === dialog && outside(event)) dialog.close();
  startedOutside = false;
});
dialog.addEventListener("close", () => {
  startedOutside = false;
  (findTile(last) || settingsButton).focus({ preventScroll: true });
});

async function get(path) {
  const response = await fetch(BASE + path);
  if (!response.ok) throw new Error("Request failed: " + path);
  return response.json();
}
function validSequence(value) {
  return Array.isArray(value) && value.every(group => Array.isArray(group) && group.every(name => typeof name === "string"));
}
async function load() {
  try {
    const [sequence, metadata, extra] = await Promise.all([
      get("data/logic/milestone-sequence-main.json"),
      get("data/generated/milestone-metadata.json"),
      get("data/logic/milestone-sequence-retirement.json").catch(() => null)
    ]);
    if (!validSequence(sequence) || !metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error("Unexpected chart data");
    }
    main = sequence;
    meta = metadata;
    if (validSequence(extra)) retirement = extra;
    else {
      retirementAvailable = false;
      $("retirement").disabled = true;
      $("retirement").title = "Retirement data unavailable; reload to retry.";
    }
    loaded = true;
    $("message").textContent = retirementAvailable ? "" : "Retirement data could not load. The main chart remains available.";
    render();
  } catch (error) {
    $("message").textContent = "Unable to load chart. Internet access required; refresh to retry. " + error.message;
  }
}
applyPreferences();
load();
