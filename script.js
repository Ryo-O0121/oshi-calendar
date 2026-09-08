/* 
  推しカレンダー script.js
  Version: 0.1
  Date: 2026-09-08
  Note: ＋押下フォームを詳細版に変更
*/

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

/* 予定フォーム（ver0.1 詳細版） */
function eventForm(id="") {
  const e = id ? S.events.find(x=>x.id===id) : {
    id: crypto.randomUUID(),
    title:"", date:"", person:"other",
    cat:"ライブ", time:"", place:"",
    tour:"", open:"", start:"",
    ticket:"未予約", paper:"",
    url:"", xurl:"", igurl:"",
    memo:"", go:false, interest:false
  };

  let html = `
    <h2>${id?"予定を編集":"予定を追加"}</h2>

    <label>タイトル *</label>
    <input id="et" value="${e.title}">

    <label>人物・作品</label>
    <select id="ep">
      ${S.people.map(p=>`<option value="${p.id}" ${p.id===e.person?"selected":""}>${p.name}</option>`).join("")}
    </select>

    <label>カテゴリ</label>
    <select id="ec">
      <option value="ライブ" ${e.cat==="ライブ"?"selected":""}>ライブ</option>
      <option value="イベント" ${e.cat==="イベント"?"selected":""}>イベント</option>
      <option value="その他" ${e.cat==="その他"?"selected":""}>その他</option>
    </select>

    <label>日付 *</label>
    <input id="ed" type="date" value="${e.date}">

    <label>時刻</label>
    <input id="tm" type="time" value="${e.time||""}">

    <h3>ライブ情報</h3>

    <label>会場</label>
    <input id="pl" value="${e.place||""}">

    <label>ツアー</label>
    <select id="tr">
      <option value="">なし</option>
      ${S.tours.map(t=>`<option value="${t.id}" ${t.id===e.tour?"selected":""}>${t.title}</option>`).join("")}
    </select>

    <label>開場時間</label>
    <input id="op" type="time" value="${e.open||""}">

    <label>開演時間</label>
    <input id="st" type="time" value="${e.start||""}">

    <label>チケット状態</label>
    <select id="tk">
      <option value="未予約" ${e.ticket==="未予約"?"selected":""}>チケット未予約・未購入</option>
      <option value="申込中" ${e.ticket==="申込中"?"selected":""}>申込中</option>
      <option value="当選" ${e.ticket==="当選"?"selected":""}>当選</option>
      <option value="落選" ${e.ticket==="落選"?"selected":""}>落選</option>
      <option value="購入済" ${e.ticket==="購入済"?"selected":""}>購入済</option>
    </select>

    <label>紙／電子</label>
    <select id="pt">
      <option value="">未設定</option>
      <option value="紙" ${e.paper==="紙"?"selected":""}>紙</option>
      <option value="電子" ${e.paper==="電子"?"selected":""}>電子</option>
    </select>

    <label>公式URL</label>
    <input id="url" value="${e.url||""}">

    <label>X URL</label>
    <input id="xurl" value="${e.xurl||""}">

    <label>Instagram URL</label>
    <input id="igurl" value="${e.igurl||""}">

    <label><input type="checkbox" id="go" ${e.go?"checked":""}> 行く</label>
    <label><input type="checkbox" id="in" ${e.interest?"checked":""}> 気になる</label>

    <label>メモ</label>
    <textarea id="mm">${e.memo||""}</textarea>

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

    e.time = document.getElementById("tm").value;
    e.place = document.getElementById("pl").value;
    e.tour = document.getElementById("tr").value;
    e.open = document.getElementById("op").value;
    e.start = document.getElementById("st").value;

    e.ticket = document.getElementById("tk").value;
    e.paper = document.getElementById("pt").value;

    e.url = document.getElementById("url").value;
    e.xurl = document.getElementById("xurl").value;
    e.igurl = document.getElementById("igurl").value;

    e.go = document.getElementById("go").checked;
    e.interest = document.getElementById("in").checked;

    e.memo = document.getElementById("mm").value;

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
