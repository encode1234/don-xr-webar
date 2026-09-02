/* DON XR 데모 — 접근 게이트
   ① 비공개 경로(추측 불가 주소) + ② 암호 입력
   ⚠️ 정적 호스팅이라 암호 해시가 소스에 포함된다. 우연한 노출·검색 유입을 막는 용도이며
      의지를 가진 사람이 소스를 뜯으면 우회 가능하다. 진짜 접근제어가 필요하면 서버 인증 필요.
   암호 변경: 새 SHA-256 해시로 PW_HASH 교체
     python -c "import hashlib;print(hashlib.sha256('새암호'.encode()).hexdigest())"
*/
(function () {
  var PW_HASH = "02b02ad2ce5f6089b47e6f7aac3e6dbc4cea02ff269214392ea43df72845b7fa";
  var KEY = "donxr_ok";

  try { if (sessionStorage.getItem(KEY) === "1" || localStorage.getItem(KEY) === "1") return; } catch (e) {}

  // 검색엔진 차단
  var m = document.createElement("meta");
  m.name = "robots"; m.content = "noindex, nofollow, noarchive";
  (document.head || document.documentElement).appendChild(m);

  var css = document.createElement("style");
  css.textContent = `
    #donGate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
      background:radial-gradient(120% 120% at 50% 0%,#2b2350 0%,#140f2b 60%,#0b0918 100%);
      font-family:'Segoe UI','Malgun Gothic',system-ui,sans-serif;padding:24px}
    #donGate .box{width:min(380px,92%);text-align:center;color:#fff}
    #donGate .tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.14em;color:#fff;
      background:#ff5aa7;padding:4px 12px;border-radius:999px;margin-bottom:14px}
    #donGate h2{margin:0 0 6px;font-size:20px}
    #donGate p{margin:0 0 18px;font-size:13px;color:#c9bfe4;line-height:1.5}
    #donGate input{width:100%;padding:14px 16px;border-radius:14px;border:0;font-size:16px;
      text-align:center;letter-spacing:.06em;outline:none}
    #donGate button{margin-top:10px;width:100%;padding:14px;border:0;border-radius:14px;cursor:pointer;
      font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#ff5aa7,#a06bff)}
    #donGate .err{margin-top:10px;font-size:13px;color:#ff9db5;min-height:18px}
    #donGate .foot{margin-top:16px;font-size:11px;color:#8d82b0}
  `;
  (document.head || document.documentElement).appendChild(css);

  var wrap = document.createElement("div");
  wrap.id = "donGate";
  wrap.innerHTML =
    '<div class="box">' +
      '<span class="tag">DON XR 어드벤처</span>' +
      '<h2>비공개 시연 페이지</h2>' +
      '<p>제출 자료에 안내된 접속 암호를 입력해 주세요.</p>' +
      '<input id="donPw" type="password" inputmode="text" autocomplete="off" placeholder="접속 암호">' +
      '<button id="donGo">입장</button>' +
      '<div class="err" id="donErr"></div>' +
      '<div class="foot">라라스튜디오 · 심사 확인용 시연본</div>' +
    '</div>';

  function mount() {
    document.body.appendChild(wrap);
    document.documentElement.style.overflow = "hidden";
    var input = wrap.querySelector("#donPw");
    var btn = wrap.querySelector("#donGo");
    var err = wrap.querySelector("#donErr");
    setTimeout(function () { input.focus(); }, 100);

    async function sha256(s) {
      if (window.crypto && crypto.subtle) {
        var b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
        return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
      }
      return null;   // 구형 브라우저 / http 환경
    }

    async function submit() {
      var h = await sha256(input.value.trim());
      if (h === null) { err.textContent = "이 브라우저에서는 확인할 수 없어요. 최신 브라우저로 열어 주세요."; return; }
      if (h === PW_HASH) {
        try { sessionStorage.setItem(KEY, "1"); localStorage.setItem(KEY, "1"); } catch (e) {}
        wrap.remove();
        document.documentElement.style.overflow = "";
      } else {
        err.textContent = "암호가 맞지 않아요.";
        input.value = ""; input.focus();
      }
    }
    btn.addEventListener("click", submit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
