"""Extract essay Q&A from LSD.pdf into essay-data.js — preserves every character."""
import fitz
import re
import json
import os

PDF_PATH = r"C:\Users\ngoc1\Documents\LSD.pdf"
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "essay-data.js")

# Verified question texts from PDF (multi-line questions merged)
QUESTION_TEXTS = {
    1: "Phân tích hoàn cảnh lịch sử và chủ trương chuyển hướng chỉ đạo chiến lược của Đảng trong những năm 1939-1941?",
    2: "Phân tích nội dung của Chính cương Đảng Lao động Việt Nám được thông qua tại Đại hội II 1951",
    3: "Phân tích nội dung của Nghị quyết Hội nghị Trung ương Đảng lần thứ 15 (1/1959)?",
    4: "Phân tích nội dung ba bước đột phá về đổi mới kinh tế của Đảng từ năm 1979 đến năm 1986?",
    5: "Phân tích nội dung của Đại hội đại biểu toàn quốc lần thứ VI của Đảng (12/1986)?",
    6: "Hãy nêu phương thức lãnh đạo của Đảng Cộng sản Việt Nam hiện nay? Vì sao nói sự lãnh đạo đúng đắn của Đảng là nhân tố hàng đầu quyết định thắng lợi của cách mạng Việt Nam?",
    7: "Vì sao nói thắng lợi của cuộc kháng chiến chống đế quốc Mỹ xâm lược là thắng lợi có ý nghĩa dân tộc và thơi đại? Hãy làm rõ trách nhiệm của bản thân bạn đối với việc bảo vệ thành quả của cuộc kháng chiến đó?",
    8: "Trình bày những đặc điểm của Nhà nước pháp quyền XHCN Việt Nam? Bản thân bạn nên làm gì để góp phần xây dựng Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam",
    9: "Nêu quan điểm của Đảng về công nghiệp hóa thời kỳ đổi mới tại Đại hội VIII (1996)? Hiện nay, việc đẩy mạnh quá trình công nghiệp hóa, hiện đại hóa nông nghiệp, nông thôn ở nước ta đang gặp những khó khăn gì?",
    10: "Trình bày 5 quan điểm của Đảng về văn hóa được nêu ra tại Hội nghị Trung ương Đảng lần thứ 5 khóa VIII (7/1998)? Bản thân bạn nên làm gì để góp phần giữ gìn, phát huy những giá trị tốt đẹp của văn hóa Việt Nam trong thời kỳ hội nhập hiện nay?",
}

PARA_STARTERS = (
    "Một là", "Hai là", "Ba là", "Bốn là", "Năm là", "Sáu là",
    "Thứ nhất", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm",
    "Tháng", "Ở ", "Trước", "Với", "Hội", "Đại", "Đáp", "Báo",
    "Nội", "Theo", "Là ", "Đã ", "Có ", "Vì", "Về ", "Quan",
    "Công", "Sau ", "Đứng", "Thắng", "Làm", "Trong", "- ", "+ ",
)


def fix_pdf_wraps(text: str) -> str:
    """Join PDF line-wrap breaks; keep real paragraph breaks."""
    lines = [ln.strip() for ln in text.split("\n")]
    merged: list[str] = []
    buf = ""

    def flush():
        nonlocal buf
        if buf:
            merged.append(buf)
            buf = ""

    for line in lines:
        if not line:
            flush()
            merged.append("")
            continue

        if not buf:
            buf = line
            continue

        # New paragraph / list item
        is_new_para = (
            line.startswith(("-", "+", "•"))
            or any(line.startswith(s) for s in PARA_STARTERS)
        )
        prev_ends = buf[-1] in ".!?;:)"
        if prev_ends or is_new_para:
            flush()
            buf = line
        else:
            buf += " " + line

    flush()
    # Collapse 3+ blank lines to 2
    out = "\n".join(merged)
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out.strip()


doc = fitz.open(PDF_PATH)
raw = ""
for page in doc:
    raw += page.get_text()

raw = re.sub(r"-- \d+ of \d+ --", "", raw)

# Split by question markers
blocks = re.split(r"(?=Câu \d+:)", raw)
blocks = [b.strip() for b in blocks if re.match(r"Câu \d+:", b)]

essays = []
for block in blocks:
    m = re.match(r"Câu (\d+):\s*(.*)", block, re.DOTALL)
    if not m:
        continue
    num = int(m.group(1))
    body = m.group(2).strip()
    question = QUESTION_TEXTS.get(num, "")
    if not question:
        q_end = body.find("?")
        question = body[: q_end + 1] if q_end >= 0 else body.split("\n")[0]

    body_fixed = fix_pdf_wraps(body)
    body_one = re.sub(r"\s+", " ", body_fixed).strip()
    q_one = re.sub(r"\s+", " ", question).strip()

    if body_one.startswith(q_one):
        answer = body_one[len(q_one) :].strip()
    elif q_one in body_one:
        answer = body_one.split(q_one, 1)[1].strip()
    else:
        # Fallback: strip until first answer marker
        markers = [
            "Tháng 9-1939", "Báo cáo của", "Đáp ứng yêu cầu", "- Hội nghị",
            "Đại hội đã đề ra", "Về phương thức", "Thắng lợi vĩ đại",
            "Thứ nhất, đó là", "Quan điểm về", "Sau Đại hội VIII",
        ]
        answer = body_one
        for mk in markers:
            if mk in body_one:
                answer = body_one.split(mk, 1)[1]
                answer = mk + answer
                break
    essays.append({"id": num, "question": question, "answer": answer})

essays.sort(key=lambda x: x["id"])

print(f"Extracted {len(essays)} essays")
for e in essays:
    w = len(re.findall(r"\S+", e["answer"]))
    print(f"  Cau {e['id']}: {w} tokens, Q len={len(e['question'])}")

js = (
    "// Auto-generated from LSD.pdf — preserves full answer text\n"
    "const ESSAY_QUESTIONS = "
    + json.dumps(essays, ensure_ascii=False, indent=2)
    + ";\n"
)

with open(OUT_PATH, "w", encoding="utf-8") as f:
    f.write(js)

print(f"Written {OUT_PATH}")
