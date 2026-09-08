import { loadState, saveState } from "./db.js";

let S = await loadState();
if (!S || typeof S !== "object") S = {};
S.events = Array.isArray(S.events) ? S.events : [];
S.people = Array.isArray(S.people) ? S.people : [];
S.tours = Array.isArray(S.tours) ? S.tours : [];

if (!S.people.some(p => p.id === "other"))
  S.people.unshift({ id: "other", name: "その他", photo: "" });

async function persist() { await saveState(S); }
function save() { persist(); }

/* タブ切り替え */
document.querySelectorAll(".tab").forEach(t => {
  t.onclick = () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    const v = t.dataset.v;
    if (v === "cal") calendar();
    if (v === "list") list();
    if (v === "people") people();
    if (v === "tours") tours();
  };
});

/* カレンダー */
function calendar() {
  const main = document.getElementById("main");
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);

  let html = `<div class="panel">
    <h2>${y}年 ${m + 1}月</h2>
    <div class="week">
      <div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div>
    </div>
    <div class="cal">`;

  for (let i = 0; i < first.getDay(); i++) html += `<div></div>`;

  for (let d = 1; d <= last.getDate(); d++) {
    const date = `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const evs = S.events.filter(e => e.date === date);
    html += `<div class="day ${d === now.getDate() ? "today" : ""}">
      <div>${d}</div>
      ${evs.map(e => `<span class="ev">${e.title}</span>`).join("")}
    </div>`;
  }

  html += `</div></div>`;
  main.innerHTML = html;
}

/* 予定一覧 */
function list() {
  const main = document.getElementById("main");
  let html = `<div class="panel"><h2>予定一覧</h2>`;
  S.events.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>{
    const p = S.people.find(x=>x.id===e.person)||{name:"不明"};
    html += `<div class="item">
      <img class="thumb" src="${p.photo||'icon-180.png'}">
      <div class="itembody">
        <b>${e.title}</b>
        <div class="muted">${e.date} ・ ${p.name}</div>
        <span class="badge">${e.cat}</span>
        ${e.ticket?`<span class="badge">${e.ticket}</span>`:""}
        ${e.go?`<span class="badge">行く ✓</span>`:""}
        ${e.interest?`<span class="badge">気になる</span>`:""}
        <br>
        <button type="button" class="secondary" data-edit="${e.id}">編集</button>
      </div>
    </div>`;
  });
  html += `</div>`;
  main.innerHTML = html;

  document.querySelectorAll("[data-edit]").forEach(b=>{
    b.onclick = ()=>eventForm(b.dataset.edit);
  });
}

/* 人物 */
function people() {
  const main = document.getElementById("main");
  let html = `<div class="panel"><h2>人物・作品</h2>`;
  S.people.forEach(p=>{
    html += `<div class="item">
      <img class="thumb" src="${p.photo||'icon-180.png'}">
      <div class="itembody"><b>${p.name}</b></div>
    </div>`;
  });
  html += `</div>`;
  main.innerHTML = html;
}

/* ツアー */
function tours() {
  const main = document.getElementById("main");
  let html = `<div class="panel"><h2>ツアー</h2>`;
  S.tours.forEach(t=>{
    html += `<div class="item"><div class="itembody">
      <b>${t.title}</b>
      <div class="muted">${t.start}〜${t.end}</div>
    </div></div>`;
  });
  html += `</div>`;
  main.innerHTML = html;
}

/* 予定フォーム */
function eventForm(id="") {
  const e = id ? S.events.find(x=>x.id===id) : {
    id: crypto.randomUUID(),
    title:"", date:"", person:"other",
    cat:"", ticket:"", place:"", memo:"",
    go:false, interest:false
  };

  let html = `
    <h2>${id?"予定を編集":"予定を追加"}</h2>

    <label>タイトル *</label>
    <input id="et" value="${e.title}">

    <label>日付 *</label>
    <input id="ed" type="date" value="${e.date}">

    <label>人物</label>
    <select id="ep">
      ${S.people.map(p=>`<option value="${p.id}" ${p.id===e.person?"selected":""}>${p.name}</option>`).join("")}
    </select>

    <label>カテゴリ</label>
    <input id="ec" value="${e.cat}">

    <label>チケット情報</label>
    <input id="tk" value="${e.ticket}">

    <label>場所</label>
    <input id="pl" value="${e.place}">

    <label>メモ</label>
    <textarea id="mm">${e.memo}</textarea>

    <label><input type="checkbox" id="go" ${e.go?"checked":""}> 行く</label>
    <label><input type="checkbox" id="in" ${e.interest?"checked":""}> 気になる</label>

    <div class="actions">
      <button type="button" class="secondary" id="cancelM">キャンセル</button>
      <button type="button" class="primary" id="saveE">保存</button>
    </div>
  `;

  modal(html);

  document.getElementById("cancelM").onclick = closeM;

  document.getElementById("saveE").onclick = ()=>{
    e.title = document.getElementById("et").value.trim();
    e.date = document.getElementById("ed").value;
    e.person = document.getElementById("ep").value;
    e.cat = document.getElementById("ec").value;
    e.ticket = document.getElementById("tk").value;
    e.place = document.getElementById("pl").value;
    e.memo = document.getElementById("mm").value;
    e.go = document.getElementById("go").checked;
    e.interest = document.getElementById("in").checked;

    if(!e.title || !e.date) return alert("タイトルと日付は必須です");

    if(!id) S.events.push(e);

    save();
    list();
    closeM();
  };
}

/* モーダル */
function modal(html){
  const mb=document.getElementById("mb");
  const m=document.getElementById("modal");
  m.innerHTML=html;
  mb.classList.add("show");
}
function closeM(){
  document.getElementById("mb").classList.remove("show");
}

/* ＋ボタン */
document.getElementById("fab").onclick = () => eventForm();

/* 初期表示 */
calendar();
