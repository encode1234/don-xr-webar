# 짱짱이 WebAR 데모

**라이브 (폰으로 열기)**: https://encode1234.github.io/don-xr-webar/
> ⚠️ 아이폰은 **사파리(Safari)로** 여세요 (카톡·인스타 등 인앱브라우저는 AR 안 됨)

## 3가지 모드
| 버튼 | 방식 | 트래킹 | 지원 |
|---|---|---|---|
| 📷 라이브 카메라에 짱짱이 띄우기 | 카메라 위 3D 합성(스크린 고정) | 없음 | iOS·Android |
| 🧭 바닥에 배치 (공간 AR) | Quick Look/Scene Viewer | **월드트래킹**(바닥고정) | iOS·Android |
| 🤖 인페이지 바닥고정 (`webxr.html`) | WebXR hit-test | 페이지 내 월드트래킹 | Android만 |

## 🗣️ 대화 기능 (2026-08-29 추가)
**짱짱이가 먼저 말을 겁니다.**
- **근접 트리거** — 가까이 다가가면(WebXR: 1.2m 이내 / model-viewer: 기준거리의 55% 이내로 확대) **자동 인사**. 멀어지면 재무장
- **🎤 말 걸기** — 브라우저 내장 음성인식(Web Speech API, ko-KR)으로 말하면 알아듣고 대답
- **빠른 질문 칩** — 이름·여긴 어디·사진·미션·퀴즈·잘가 (음성인식 미지원 기기 대비)
- WebXR 모드에선 짱짱이가 **관람객 쪽을 바라봄**(lookAt)

### 구조 (정적 호스팅 안전)
| 요소 | 구현 | 이유 |
|---|---|---|
| 음성 | **사전 생성 TTS** `voice/*.mp3` 9종 | 정적 페이지라 **API 키 노출 불가** → 동봉 재생 |
| 알아듣기 | Web Speech API(브라우저 내장) | 키 불필요 |
| 응답 선택 | 키워드 매칭 대화트리 `chat.js` | 서버 없이 실동작 |

> 🔜 **선정 후 확장**: `chat.js`의 응답 선택부만 **서버 프록시 + LLM 실시간 생성**으로 교체(인터페이스 동일).
> 대사 수정/추가 = `_mkvoice.py`의 `LINES` 편집 후 재실행(기존 파일 skip) → `chat.js`의 `LINES`·`RULES` 동기화.

⚠️ 브라우저 정책상 **사용자가 화면을 한 번 터치한 뒤** 음성이 재생됩니다(자동재생 차단 회피). 음성인식은 **안드로이드 Chrome**에서 가장 안정적.

## 아이폰에서 "바닥에 배치"가 안 될 때
1. **사파리로** 여세요 (인앱브라우저 X)
2. Quick Look 창 상단 **[오브젝트 | AR] 탭에서 "AR" 선택**
3. 카메라 권한 허용 → 바닥 인식 → 탭해서 배치 → 걸어보기

## 파일
- `index.html` — model-viewer(3모드) · `webxr.html` — Three.js WebXR(안드)
- `chat.js` — 대화 모듈(대사·키워드규칙·UI·근접트리거) · `voice/` — 사전생성 음성 9종 + `lines.json`
- `_mkvoice.py` — 음성 재생성 스크립트(허브 OpenAI TTS, `gpt-4o-mini-tts`/voice=ash)
- `jangjang.glb`(짱짱이 v2, **0.5m**) · `jangjang.usdz`(iOS AR)

## 배포·갱신 (GitHub Pages)
- 저장소: `encode1234/don-xr-webar` (public, main/root)
- 파일 수정 → push → Pages 자동 재빌드(~1분) → 새로고침
- 모델 교체: `jangjang.glb`/`.usdz` 교체 후 push · 크기조절: Blender 헤드리스 재스케일

## 다음 작업 (확정 후)
8th Wall(오픈소스)로 iOS 인페이지 월드트래킹 · 기기 자동분기 · 멀티캐릭터(뿔퉁·새치미·떠벌이·돈) · 미션형 확장
→ 상세: [../10_인계문서_WebAR기술.md](../10_인계문서_WebAR기술.md)
