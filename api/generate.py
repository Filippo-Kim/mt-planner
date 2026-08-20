import json
import os
import urllib.request
import urllib.error

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"

SYSTEM_PROMPT = """너는 학과 MT·행사 기획 도우미야.
아래 입력을 바탕으로 반드시 아래 JSON 스키마 그대로만 응답해.
설명, 인사말, 마크다운 코드블록(```) 등 JSON 이외의 텍스트는 절대 포함하지 마.

스키마:
{
  "timetable": [{"time": "문자열", "activity": "문자열"}],
  "supplies": [{"item": "문자열", "quantity": "문자열", "estimatedPrice": "문자열"}],
  "budget": [{"category": "문자열", "amount": "문자열"}],
  "totalBudget": "문자열"
}
각 배열은 최대 6개 항목까지만 생성해. 설명은 짧고 간결하게 써.
"""

def build_prompt(data):
    return (
        f"행사 종류: {data.get('eventType')}\n"
        f"인원: {data.get('headcount')}명\n"
        f"기간: {data.get('duration')}\n"
        f"1인 예산: {data.get('budget')}원\n"
        f"요청사항: {data.get('notes', '없음')}\n"
    )

def clean_json_text(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text
        text = text.rsplit("```", 1)[0]
    return text.strip()

def json_response(status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    headers = [("Content-Type", "application/json; charset=utf-8")]
    return status, headers, body

def handle_post(environ):
    try:
        length = int(environ.get("CONTENT_LENGTH", 0) or 0)
        raw = environ["wsgi.input"].read(length)
        data = json.loads(raw)
    except (ValueError, json.JSONDecodeError, KeyError):
        return json_response("400 Bad Request", {"error": "요청 형식이 올바르지 않아요."})

    if not data.get("headcount") or not data.get("budget"):
        return json_response("400 Bad Request", {"error": "인원과 1인 예산을 입력해 주세요."})

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return json_response("500 Internal Server Error", {"error": "서버 설정 오류입니다. 관리자에게 문의해 주세요."})

    prompt = SYSTEM_PROMPT + "\n\n" + build_prompt(data)
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")

    req = urllib.request.Request(
        f"{GEMINI_URL}?key={api_key}",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=50) as res:
            result = json.loads(res.read())
    except urllib.error.HTTPError:
        return json_response("502 Bad Gateway", {"error": "AI 서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요."})
    except urllib.error.URLError:
        return json_response("504 Gateway Timeout", {"error": "응답이 지연되고 있어요. 다시 시도해 주세요."})

    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        cleaned = clean_json_text(text)
        plan = json.loads(cleaned)
    except (KeyError, IndexError, json.JSONDecodeError):
        return json_response("502 Bad Gateway", {"error": "결과를 처리하는 중 문제가 발생했어요. 다시 시도해 주세요."})

    return json_response("200 OK", plan)

def app(environ, start_response):
    method = environ.get("REQUEST_METHOD", "GET")

    if method == "POST":
        status, headers, body = handle_post(environ)
    else:
        status, headers, body = json_response("405 Method Not Allowed", {"error": "POST 요청만 지원해요."})

    start_response(status, headers)
    return [body]