export async function loadState() {
  const raw = localStorage.getItem("oshi-calendar");
  return raw ? JSON.parse(raw) : {};
}

export async function saveState(state) {
  localStorage.setItem("oshi-calendar", JSON.stringify(state));
}
