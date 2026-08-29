/* DON XR — 짱짱이 대화 모듈 (온디바이스)
   · 음성 = 사전 생성 TTS(voice/*.mp3) → 정적 호스팅에서 키 노출 없음
   · 알아듣기 = Web Speech API(브라우저 내장 STT, ko-KR)
   · 응답 = 키워드 매칭 대화트리
   · 선정 후 확장: 서버 프록시 + LLM 실시간 생성으로 교체(인터페이스 동일)
*/
(function (global) {
  const LINES = {
    greet:   "우와! 드디어 만났다! 나는 돈 특공대의 리더, 짱짱이야! 반가워!",
    intro:   "내 이름은 짱짱이! 빨간 티라노사우루스 형아지! 우리 특공대엔 돈이랑 떠벌이, 새치미, 뿔퉁이도 있어!",
    place:   "여기 순천만은 갈대가 끝없이 펼쳐진 멋진 곳이야! 우리가 자연을 잘 지키면, 미래엔 훨씬 더 아름다워질 거야!",
    photo:   "좋아! 사진 찍자! 내가 제일 멋진 포즈 보여 줄게. 하나, 둘, 셋! 찰칵!",
    mission: "미션 갈까? 정찰하고, 수집하고, 배틀하고, 치유하고, 마지막엔 합체! 준비 됐어?",
    quiz:    "퀴즈! 순천만에 찾아오는 천연기념물 새는 뭘까? 정답은, 흑두루미! 맞췄어?",
    praise:  "역시! 너 진짜 대단한걸! 우리 특공대에 딱이야!",
    bye:     "오늘 정말 즐거웠어! 또 만나자, 친구야! 안녕!",
    huh:     "음? 잘 못 들었어! 다시 한 번 말해 줄래?"
  };

  // 키워드 → 응답 (위에서부터 우선)
  const RULES = [
    [/(잘\s*가|안녕히|바이|빠이|또\s*만나)/, "bye"],
    [/(이름|누구|넌\s*뭐|너\s*뭐|소개)/, "intro"],
    [/(순천|여기|어디|장소|갈대|자연|환경)/, "place"],
    [/(사진|찍|촬영|셀카|포즈)/, "photo"],
    [/(미션|게임|놀|퀘스트|모험|같이)/, "mission"],
    [/(퀴즈|문제|맞춰|맞혀)/, "quiz"],
    [/(멋지|대단|최고|좋아|귀여|사랑|짱)/, "praise"],
    [/(안녕|하이|반가|헬로|만나)/, "greet"]
  ];

  const CHIPS = [
    ["이름이 뭐야?", "intro"],
    ["여긴 어디야?", "place"],
    ["사진 찍자!", "photo"],
    ["미션 가자!", "mission"],
    ["퀴즈 내줘", "quiz"],
    ["잘 가!", "bye"]
  ];

  const audio = new Audio();
  let ui = null, greeted = false, recog = null, listening = false;

  function pick(text) {
    for (const [re, key] of RULES) if (re.test(text)) return key;
    return "huh";
  }

  function say(key) {
    if (!LINES[key]) key = "huh";
    if (ui) {
      ui.bubble.textContent = LINES[key];
      ui.bubble.classList.add("show");
      document.body.classList.add("talking");
    }
    try {
      audio.pause();
      audio.src = "voice/" + key + ".mp3";
      audio.play().catch(() => {});
    } catch (e) {}
    audio.onended = () => document.body.classList.remove("talking");
    return key;
  }

  function userSaid(text) {
    if (ui) { ui.you.textContent = "🙋 " + text; ui.you.classList.add("show"); }
    say(pick(text));
  }

  function listen() {
    const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!SR) {
      ui.you.textContent = "🎤 이 브라우저는 음성 인식을 지원하지 않아요. 아래 버튼으로 말 걸어 보세요!";
      ui.you.classList.add("show");
      return;
    }
    if (listening) { try { recog.stop(); } catch (e) {} return; }
    recog = new SR();
    recog.lang = "ko-KR"; recog.interimResults = false; recog.maxAlternatives = 1;
    listening = true;
    ui.mic.classList.add("on"); ui.mic.textContent = "🎙️ 듣는 중…";
    recog.onresult = (e) => userSaid(e.results[0][0].transcript);
    recog.onerror = () => { ui.you.textContent = "🎤 잘 안 들렸어요. 다시 눌러 주세요."; ui.you.classList.add("show"); };
    recog.onend = () => { listening = false; ui.mic.classList.remove("on"); ui.mic.textContent = "🎤 말 걸기"; };
    try { recog.start(); } catch (e) { listening = false; }
  }

  /** 근접 트리거 — 가까워지면 1회 인사 */
  function proximity(isNear) {
    if (isNear && !greeted) { greeted = true; open(); say("greet"); }
  }
  function resetProximity() { greeted = false; }

  function open()  { document.body.classList.add("chatting"); }
  function close() { document.body.classList.remove("chatting"); try { audio.pause(); } catch (e) {} }

  function mount() {
    const css = document.createElement("style");
    css.textContent = `
      #chatUI{position:absolute;left:0;right:0;bottom:96px;z-index:3;display:none;
        padding:0 14px;pointer-events:none}
      body.chatting #chatUI{display:block}
      #bubble{max-width:min(560px,92%);margin:0 auto 8px;background:#fff;color:#1b1330;
        border-radius:18px;padding:13px 16px;font-size:15px;line-height:1.45;font-weight:600;
        box-shadow:0 10px 30px rgba(0,0,0,.28);opacity:0;transform:translateY(8px);
        transition:.22s;pointer-events:auto;border-left:6px solid #ff5aa7}
      #bubble.show{opacity:1;transform:none}
      #bubble::before{content:"짱짱이";display:block;font-size:11px;font-weight:800;
        letter-spacing:.1em;color:#ff5aa7;margin-bottom:4px}
      #you{max-width:min(560px,92%);margin:0 auto 8px;font-size:13px;color:#fff;
        background:#00000088;border-radius:14px;padding:8px 12px;opacity:0;transition:.2s;text-align:center}
      #you.show{opacity:1}
      #chips{display:flex;gap:7px;overflow-x:auto;padding:2px 2px 6px;justify-content:flex-start;
        pointer-events:auto;-webkit-overflow-scrolling:touch}
      #chips button{flex:0 0 auto;font-size:13px;padding:9px 13px;border-radius:999px;
        background:#ffffffee;color:#2b2350;font-weight:700;box-shadow:0 3px 10px rgba(0,0,0,.18)}
      .mic-btn{background:linear-gradient(135deg,#00b894,#0984e3)}
      .mic-btn.on{background:#e0466e}
      body.talking model-viewer{animation:talkpulse .5s ease-in-out infinite alternate}
      @keyframes talkpulse{from{transform:translateY(0)}to{transform:translateY(-6px)}}
    `;
    document.head.appendChild(css);

    const wrap = document.createElement("div");
    wrap.id = "chatUI";
    wrap.innerHTML = `<div id="you"></div><div id="bubble"></div><div id="chips"></div>`;
    (document.getElementById("stage") || document.body).appendChild(wrap);

    const chips = wrap.querySelector("#chips");
    CHIPS.forEach(([label, key]) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = () => { ui.you.textContent = "🙋 " + label; ui.you.classList.add("show"); say(key); };
      chips.appendChild(b);
    });

    ui = { bubble: wrap.querySelector("#bubble"), you: wrap.querySelector("#you"), chips, mic: null };
    return ui;
  }

  global.DonChat = { mount, say, listen, userSaid, open, close, proximity, resetProximity, LINES,
    setMic(btn) { ui.mic = btn; } };
})(window);
