/* データ構造 */
const S = {
  events: [],
  people: [
    { id: "other", name: "その他" }
  ],
  tours: []
};

/* 読み込み */
function load(){
  const d = localStorage.getItem("oshi-calendar");
  if (!d) return;
  try {
    const j = JSON.parse(d);
    if (j.events) S.events = j.events;
    if (j.people) S.people = j.people;
    if (j.tours) S.tours = j.tours;
  } catch(e){
    console.error(e);
  }
}

load();

/* 保存 */
function save(){
  localStorage.setItem("oshi-calendar", JSON.stringify(S));
}

/* モーダル */
function modal(html){
  const mb = document.getElementById("mb");
  const m = document.getElementById("modal");
  m.innerHTML = html;
  mb.classList.add("show");
}

function closeM(){
  document.getElementById("mb").classList.remove("show");
}

/* イベントフォーム */
function eventForm(id){
  let e;
  if (id){
    e = S.events.find(x => x.id === id);
    if (!e) return;
  } else {
    e = {
      id: crypto.randomUUID(),
      title: "",
      person: "other",
      cat: "",
      date: "",
      time: "",
      place: "",
      tour: "",
      open_time: "",
      start_time: "",
      apply: ["", "", ""],
      ticket_status: "",
      ticket_type: "",
      images: ["", "", ""],
      url_official: "",
      url_x: "",
      url_insta: "",
      favorite: false,
      go: false,
      interest: false,
      memo: ""
    };
  }

  const peopleOptions = S.people
    .map(x => `<option value="${x.id}" ${x.id===e.person?"selected":""}>${x.name}</option>`)
    .join("");

  const applyInputs = (e.apply || ["","",""])
    .map((v,i)=>`<input type="text" class="apply" value="${v}" placeholder="申込${i+1}">`)
    .join("");

  const imgInputs = (e.images || ["","",""])
    .map((v,i)=>`<input type="text" class="img" value="${v}" placeholder="画像URL${i+1}">`)
    .join("");

  const html = `
    <div class="mf">
      <div class="mh">
        <input id="et" type="text" placeholder="タイトル" value="${e.title}">
      </div>
      <div class="mbb">
        <label>人物・作品</label>
        <select id="ep">${peopleOptions}</select>
      </div>
      <div class="mbb">
        <label>カテゴリ</label>
        <input id="ec" type="text" value="${e.cat}">
      </div>
      <div class="mbb">
        <label>日付</label>
        <input id="ed" type="date" value="${e.date}">
      </div>
      <div class="mbb">
        <label>時間</label>
        <input id="tm" type="time" value="${e.time}">
      </div>

      <div class="mbg">
        <div class="mbt">ライブ情報</div>
        <div class="mbb">
          <label>会場</label>
          <input id="pl" type="text" value="${e.place}">
        </div>
        <div class="mbb">
          <label>ツアー</label>
          <input id="tour" type="text" value="${e.tour}">
        </div>
        <div class="mbb">
          <label>開場</label>
          <input id="open_time" type="time" value="${e.open_time}">
        </div>
        <div class="mbb">
          <label>開演</label>
          <input id="start_time" type="time" value="${e.start_time}">
        </div>
        <div class="mbb">
          <label>申込</label>
          <div class="apply-wrap">
            ${applyInputs}
          </div>
        </div>
        <div class="mbb">
          <label>チケット状況</label>
          <input id="ticket_status" type="text" value="${e.ticket_status}">
        </div>
        <div class="mbb">
          <label>チケット種別</label>
          <input id="ticket_type" type="text" value="${e.ticket_type}">
        </div>
      </div>

      <div class="mbg">
        <div class="mbt">画像</div>
        <div class="mbb">
          <label>画像URL</label>
          <div class="img-wrap">
            ${imgInputs}
          </div>
        </div>
      </div>

      <div class="mbg">
        <div class="mbt">リンク</div>
        <div class="mbb">
          <label>公式サイト</label>
          <input id="url_official" type="text" value="${e.url_official}">
        </div>
        <div class="mbb">
          <label>X</label>
          <input id="url_x" type="text" value="${e.url_x}">
        </div>
        <div class="mbb">
          <label>Instagram</label>
          <input id="url_insta" type="text" value="${e.url_insta}">
        </div>
      </div>

      <div class="mbg">
        <div class="mbt">フラグ</div>
        <div class="mbb">
          <label><input id="fav" type="checkbox" ${e.favorite?"checked":""}> 推し</label>
        </div>
        <div class="mbb">
          <label><input id="go" type="checkbox" ${e.go?"checked":""}> 行く</label>
        </div>
        <div class="mbb">
          <label><input id="in" type="checkbox" ${e.interest?"checked":""}> 気になる</label>
        </div>
      </div>

      <div class="mbg">
        <div class="mbt">メモ</div>
        <div class="mbb">
          <textarea id="mm">${e.memo || ""}</textarea>
        </div>
      </div>

      <div class="mf-btns">
        <button id="cancelM">キャンセル</button>
        <button id="saveE">保存</button>
      </div>
    </div>
  `;

  modal(html);

  /* ボタン処理 */
  document.getElementById("cancelM").onclick = closeM;

  document.getElementById("saveE").onclick = () => {

    /* 基本情報 */
    e.title = document.getElementById("et").value.trim();
    e.person = document.getElementById("ep").value;
    e.cat = document.getElementById("ec").value;
    e.date = document.getElementById("ed").value;
    e.time = document.getElementById("tm").value;

    /* ライブ情報 */
    e.place = document.getElementById("pl").value;
    e.tour = document.getElementById("tour").value;
    e.open_time = document.getElementById("open_time").value;
    e.start_time = document.getElementById("start_time").value;

    const applyInputs = document.querySelectorAll(".apply");
    e.apply = Array.from(applyInputs).map(x => x.value);

    e.ticket_status = document.getElementById("ticket_status").value;
    e.ticket_type = document.getElementById("ticket_type").value;

    const imgInputs = document.querySelectorAll(".img");
    e.images = Array.from(imgInputs).map(x => x.value);

    e.url_official = document.getElementById("url_official").value;
    e.url_x = document.getElementById("url_x").value;
    e.url_insta = document.getElementById("url_insta").value;

    /* その他 */
    e.favorite = document.getElementById("fav").checked;
    e.go = document.getElementById("go").checked;
    e.interest = document.getElementById("in").checked;
    e.memo = document.getElementById("mm").value;

    if (!e.title || !e.date) {
      alert("タイトルと日付は必須です");
      return;
    }

    if (!id){
      S.events.push(e);
    }

    save();
    list();
    calendar();
    closeM();
  };
}

/* ＋ボタン */
document.getElementById("fab").onclick = () => eventForm();

/* カレンダー表示 */
function calendar(){
  const c = document.getElementById("calendar");
  c.innerHTML = "";

  S.events
    .sort((a,b)=>a.date.localeCompare(b.date))
    .forEach(e => {
      const div = document.createElement("div");
      div.className = "ce";

      div.innerHTML = `
        <div class="cd">${e.date}</div>
        <div class="ct">${e.title}</div>
      `;

      div.onclick = () => eventForm(e.id);
      c.appendChild(div);
    });
}

/* 一覧表示 */
function list(){
  const l = document.getElementById("list");
  l.innerHTML = "";

  S.events
    .sort((a,b)=>a.date.localeCompare(b.date))
    .forEach(e => {
      const div = document.createElement("div");
      div.className = "le";

      div.innerHTML = `
        <div class="ld">${e.date}</div>
        <div class="lt">${e.title}</div>
        <div class="lp">${S.people.find(x=>x.id===e.person)?.name || ""}</div>
      `;

      div.onclick = () => eventForm(e.id);
      l.appendChild(div);
    });
}

/* 人物・作品 */
function people(){
  const p = document.getElementById("people");
  p.innerHTML = "";

  S.people.forEach(x => {
    const div = document.createElement("div");
    div.className = "pe";

    div.innerHTML = `
      <div class="pn">${x.name}</div>
    `;

    div.onclick = () => {
      const name = prompt("名前を編集", x.name);
      if (!name) return;
      x.name = name;
      save();
      people();
      list();
      calendar();
    };

    p.appendChild(div);
  });
}

/* ツアー */
function tours(){
  const t = document.getElementById("tours");
  t.innerHTML = "";

  S.tours.forEach(x => {
    const div = document.createElement("div");
    div.className = "te";

    div.innerHTML = `
      <div class="tn">${x.title}</div>
    `;

    div.onclick = () => {
      const title = prompt("ツアー名を編集", x.title);
      if (!title) return;
      x.title = title;
      save();
      tours();
      list();
      calendar();
    };

    t.appendChild(div);
  });
}

/* 初期化 */
calendar();
list();
people();
tours();
