/* ============================================================
 * Essay Master · Học thuộc tự luận Lịch sử Đảng
 * ------------------------------------------------------------
 * Memory-science modes (verbatim — every word matters):
 *   1. Đọc đáp án      — passive encoding + chunk preview
 *   2. Ghép từng câu    — active recall via word ordering
 *   3. Điền khuyết      — cloze deletion with full word bank
 *   4. Ôn chủ động      — Leitner spaced repetition
 *   5. Thuộc lòng       — full answer word-by-word assembly
 * ========================================================== */
(function () {
    "use strict";

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

    function esc(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /* ---- Text utilities (preserve every token) ---- */
    function tokenize(text) {
        return (text.match(/\S+/g) || []);
    }

    function splitChunks(text) {
        const normalized = text.replace(/\n+/g, " ").trim();
        const raw = normalized.split(/(?<=[.!?…])\s+(?=[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ+-•])/);
        const chunks = [];
        let buf = "";
        for (const part of raw) {
            const s = part.trim();
            if (!s) continue;
            if (s.length < 40 && buf) {
                buf += " " + s;
            } else if (buf) {
                chunks.push(buf);
                buf = s;
            } else {
                buf = s;
            }
        }
        if (buf) chunks.push(buf);
        return chunks.length ? chunks : [normalized];
    }

    function formatAnswerHtml(text) {
        return esc(text)
            .replace(/\n\n/g, "</p><p class=\"essay-p\">")
            .replace(/\n/g, "<br>")
            .replace(/^(.*)$/, "<p class=\"essay-p\">$1</p>");
    }

    function compareTokens(userTokens, correctTokens) {
        let correct = 0;
        const len = Math.max(userTokens.length, correctTokens.length);
        const details = [];
        for (let i = 0; i < len; i++) {
            const u = userTokens[i];
            const c = correctTokens[i];
            if (u === c) {
                correct++;
                details.push({ type: "ok", word: c });
            } else if (u && c) {
                details.push({ type: "wrong", expected: c, got: u });
            } else if (c) {
                details.push({ type: "missing", word: c });
            } else {
                details.push({ type: "extra", word: u });
            }
        }
        const pct = correctTokens.length ? Math.round((correct / correctTokens.length) * 100) : 0;
        return { correct, total: correctTokens.length, pct, details };
    }

    /* ---- Progress store ---- */
    const STORE = (function () {
        const KEY = "essay_progress_v1";
        let data = load();

        function load() {
            try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
            catch (e) { return {}; }
        }
        function save() {
            try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* */ }
        }
        function entry(id) {
            if (!data[id]) data[id] = { box: 1, due: 0, masteredChunks: [], bestScore: 0 };
            return data[id];
        }
        function grade(id, remembered) {
            const e = entry(id);
            const DAY = 86400000;
            const INTERVAL = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };
            if (remembered) e.box = Math.min(5, e.box + 1);
            else e.box = 1;
            e.due = Date.now() + (INTERVAL[e.box] || 0) * DAY;
            save();
        }
        function setBest(id, pct) {
            const e = entry(id);
            if (pct > e.bestScore) { e.bestScore = pct; save(); }
        }
        function markChunk(id, chunkIdx) {
            const e = entry(id);
            if (e.masteredChunks.indexOf(chunkIdx) === -1) {
                e.masteredChunks.push(chunkIdx);
                save();
            }
        }
        function stats() {
            let mastered = 0;
            ESSAY_QUESTIONS.forEach((q) => {
                const e = data[q.id];
                if (e && e.box >= 4) mastered++;
            });
            return { total: ESSAY_QUESTIONS.length, mastered };
        }
        return { entry, grade, setBest, markChunk, stats, isDue: (id) => !data[id] || data[id].due <= Date.now() };
    })();

    /* ---- Shared UI ---- */
    function essayTopbar(right) {
        return (
            '<div class="topbar">' +
            '<div class="topbar__group"><button class="back-btn" data-essay-back="menu">' +
            '<svg class="icon" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg> Trở lại</button></div>' +
            '<div class="topbar__group">' + (right || "") + "</div></div>"
        );
    }

    function bindEssayNav(root, router) {
        $$("[data-essay-back]", root).forEach((btn) =>
            btn.addEventListener("click", () => router.go(btn.dataset.essayBack))
        );
    }

    /* ---- ESSAY MENU ---- */
    function EssayMenu(shell, router) {
        const st = STORE.stats();
        const modes = [
            { key: "eread", icon: "📖", accent: "indigo", title: "Đọc Đáp Án", desc: "Đọc và làm quen từng đoạn. Não bộ cần 'nhìn thấy' trước khi ghi nhớ chủ động." },
            { key: "ebuild", icon: "🧩", accent: "emerald", title: "Ghép Từng Câu", desc: "Sắp xếp đúng thứ tự TẤT CẢ từ trong từng câu. Không được bỏ sót hay thêm từ." },
            { key: "ecloze", icon: "✏️", accent: "cyan", title: "Điền Khuyết", desc: "Điền từ bị ẩn từ ngân hàng từ. Mọi từ đều có trong đáp án gốc." },
            { key: "erecall", icon: "🧠", accent: "amber", title: "Ôn Chủ Động", desc: "Nhớ lại đáp án trong đầu, tự chấm điểm. Lặp lại ngắt quãng giúp nhớ lâu." },
            { key: "efull", icon: "🎯", accent: "rose", title: "Thuộc Lòng", desc: "Ghép toàn bộ đáp án từng câu một. Mục tiêu: 100% từ đúng vị trí." }
        ];

        const listItems = ESSAY_QUESTIONS.map((q) => {
            const e = STORE.entry(q.id);
            const chunks = splitChunks(q.answer);
            const prog = chunks.length ? Math.round((e.masteredChunks.length / chunks.length) * 100) : 0;
            return (
                '<div class="essay-item">' +
                '<div class="essay-item__num">Câu ' + q.id + "</div>" +
                '<div class="essay-item__body">' +
                '<div class="essay-item__q">' + esc(q.question) + "</div>" +
                '<div class="essay-item__meta">' +
                '<span class="pill">' + tokenize(q.answer).length + " từ</span>" +
                '<span class="pill">' + chunks.length + " đoạn</span>" +
                (e.bestScore ? '<span class="pill">🏆 ' + e.bestScore + "%</span>" : "") +
                "</div>" +
                '<div class="essay-progress"><div class="essay-progress__bar" style="width:' + prog + '%"></div></div>' +
                "</div></div>"
            );
        }).join("");

        shell(
            "essay-menu",
            '<div class="menu animate-pop">' +
            '<div class="menu__hero">' +
            '<h2 class="menu__title">Học thuộc <span class="accent">Tự luận</span></h2>' +
            '<p class="menu__subtitle">10 câu tự luận từ đề ôn tập. Mỗi chế độ được thiết kế để bạn <strong>không bỏ sót chữ nào</strong> trong đáp án.</p>' +
            '<div class="menu__stats">' +
            '<span class="pill">📚 <strong>' + st.total + " câu</strong></span>" +
            '<span class="pill">✅ Thuộc: <strong>' + st.mastered + "/" + st.total + "</strong></span>" +
            '<button class="btn btn--ghost btn--sm" data-essay-back="menu">← Trắc nghiệm</button>' +
            "</div></div>" +
            '<div class="section-title">Chọn chế độ luyện tập</div>' +
            '<div class="mode-grid mode-grid--essay">' +
            modes.map((m) =>
                '<button class="mode-card" data-accent="' + m.accent + '" data-essay-mode="' + m.key + '">' +
                '<span class="mode-card__icon">' + m.icon + "</span>" +
                '<span class="mode-card__title">' + m.title + "</span>" +
                '<span class="mode-card__desc">' + m.desc + "</span></button>"
            ).join("") +
            "</div>" +
            '<div class="section-title" style="margin-top:2rem">Danh sách câu hỏi</div>' +
            '<div class="essay-list">' + listItems + "</div></div>"
        );

        $$("[data-essay-mode]").forEach((btn) =>
            btn.addEventListener("click", () => router.go(btn.dataset.essayMode))
        );
        bindEssayNav(document, router);
    }

    /* ---- MODE: Đọc đáp án ---- */
    function EssayRead(shell, router) {
        let idx = 0;
        let chunkIdx = 0;
        let showAnswer = false;

        function draw() {
            const q = ESSAY_QUESTIONS[idx];
            const chunks = splitChunks(q.answer);
            const chunk = chunks[chunkIdx] || chunks[0];
            shell(
                "eread",
                '<div class="essay-stage animate-pop">' +
                essayTopbar('<span class="pill">Câu <strong>' + (idx + 1) + "</strong>/" + ESSAY_QUESTIONS.length +
                    '</span><span class="pill">Đoạn <strong>' + (chunkIdx + 1) + "</strong>/" + chunks.length + "</span>") +
                '<div class="progress"><div class="progress__bar" style="width:' + ((chunkIdx + 1) / chunks.length * 100) + '%"></div></div>' +
                '<div class="essay-qcard"><div class="essay-qcard__label">Câu hỏi</div><div class="essay-qcard__text">' + esc(q.question) + "</div></div>" +
                '<div class="essay-chunk-nav">' +
                chunks.map((_, i) =>
                    '<button class="essay-chunk-dot' + (i === chunkIdx ? " is-active" : "") + (STORE.entry(q.id).masteredChunks.indexOf(i) >= 0 ? " is-done" : "") +
                    '" data-chunk="' + i + '">' + (i + 1) + "</button>"
                ).join("") +
                "</div>" +
                '<div class="essay-answer-card' + (showAnswer ? " is-revealed" : "") + '">' +
                '<div class="essay-answer-card__label">' + (showAnswer ? "Đáp án — đoạn " + (chunkIdx + 1) : "Đoạn " + (chunkIdx + 1) + " / " + chunks.length) + "</div>" +
                '<div class="essay-answer-card__text">' + (showAnswer ? esc(chunk) : "👆 Bấm để xem đáp án đoạn này") + "</div>" +
                (showAnswer ? '<div class="essay-token-count">' + tokenize(chunk).length + " từ trong đoạn này</div>" : "") +
                "</div>" +
                '<div class="nav-row">' +
                '<button class="btn btn--ghost" id="prev-chunk"' + (chunkIdx === 0 ? " disabled" : "") + '>Đoạn trước</button>' +
                (showAnswer
                    ? '<button class="btn btn--emerald" id="mastered">✅ Đã thuộc đoạn này</button>'
                    : '<button class="btn btn--primary" id="reveal">👁️ Xem đáp án</button>') +
                '<button class="btn btn--ghost" id="next-chunk">' + (chunkIdx >= chunks.length - 1 ? "Câu tiếp →" : "Đoạn tiếp →") + '</button>' +
                "</div></div>"
            );
            bindEssayNav(document, router);
            $(".essay-answer-card").addEventListener("click", () => { if (!showAnswer) { showAnswer = true; draw(); } });
            $("#reveal") && $("#reveal").addEventListener("click", () => { showAnswer = true; draw(); });
            $("#mastered") && $("#mastered").addEventListener("click", () => {
                STORE.markChunk(q.id, chunkIdx);
                if (chunkIdx < chunks.length - 1) { chunkIdx++; showAnswer = false; }
                else if (idx < ESSAY_QUESTIONS.length - 1) { idx++; chunkIdx = 0; showAnswer = false; }
                draw();
            });
            $("#prev-chunk").addEventListener("click", () => { if (chunkIdx > 0) { chunkIdx--; showAnswer = false; draw(); } });
            $("#next-chunk").addEventListener("click", () => {
                if (chunkIdx < chunks.length - 1) { chunkIdx++; showAnswer = false; }
                else if (idx < ESSAY_QUESTIONS.length - 1) { idx++; chunkIdx = 0; showAnswer = false; }
                draw();
            });
            $$(".essay-chunk-dot").forEach((btn) =>
                btn.addEventListener("click", () => { chunkIdx = +btn.dataset.chunk; showAnswer = false; draw(); })
            );
        }
        draw();
    }

    /* ---- MODE: Ghép từng câu ---- */
    function EssayBuild(shell, router) {
        let qIdx = 0;
        let cIdx = 0;
        let built = [];
        let bank = [];
        let locked = false;

        function setupRound() {
            const q = ESSAY_QUESTIONS[qIdx];
            const chunks = splitChunks(q.answer);
            const target = tokenize(chunks[cIdx]);
            built = [];
            bank = shuffle(target.map((w, i) => ({ w: w, id: i })));
            locked = false;
        }

        function draw() {
            const q = ESSAY_QUESTIONS[qIdx];
            const chunks = splitChunks(q.answer);
            const target = tokenize(chunks[cIdx]);

            shell(
                "ebuild",
                '<div class="essay-stage animate-pop">' +
                essayTopbar('<span class="pill">Câu <strong>' + (qIdx + 1) + "</strong> · Đoạn <strong>" + (cIdx + 1) + "/" + chunks.length + "</strong></span>") +
                '<div class="essay-qcard essay-qcard--compact"><div class="essay-qcard__text">' + esc(q.question) + "</div></div>" +
                '<div class="essay-build-target" id="target">' +
                (built.length
                    ? built.map((t) => '<span class="essay-word essay-word--placed">' + esc(t.w) + "</span>").join("")
                    : '<span class="essay-build-hint">Chạm từ bên dưới để ghép theo đúng thứ tự…</span>') +
                "</div>" +
                '<div class="essay-build-bank" id="bank">' +
                bank.map((t, i) =>
                    '<button class="essay-word essay-word--bank" data-i="' + i + '">' + esc(t.w) + "</button>"
                ).join("") +
                "</div>" +
                '<div class="essay-build-actions">' +
                '<button class="btn btn--ghost" id="undo"' + (built.length ? "" : " disabled") + '>Hoàn tác</button>' +
                '<button class="btn btn--ghost" id="reset">Làm lại</button>' +
                '<span class="pill">' + built.length + "/" + target.length + " từ</span>" +
                "</div></div>"
            );
            bindEssayNav(document, router);

            $$(".essay-word--bank").forEach((btn) =>
                btn.addEventListener("click", () => {
                    if (locked) return;
                    const i = +btn.dataset.i;
                    const item = bank[i];
                    if (!item) return;
                    built.push(item);
                    bank.splice(i, 1);
                    if (built.length === target.length) checkAnswer(target);
                    else draw();
                })
            );
            $("#undo").addEventListener("click", () => {
                if (!built.length || locked) return;
                bank.push(built.pop());
                draw();
            });
            $("#reset").addEventListener("click", () => { setupRound(); draw(); });
        }

        function checkAnswer(target) {
            locked = true;
            const user = built.map((t) => t.w);
            const result = compareTokens(user, target);
            const q = ESSAY_QUESTIONS[qIdx];
            const chunks = splitChunks(q.answer);

            if (result.pct === 100) STORE.markChunk(q.id, cIdx);

            shell(
                "ebuild",
                '<div class="essay-stage animate-pop">' +
                essayTopbar("") +
                '<div class="panel">' +
                '<div class="panel__emoji">' + (result.pct === 100 ? "🎉" : "📝") + "</div>" +
                '<h2 class="panel__title">' + (result.pct === 100 ? "Chính xác 100%!" : "Kết quả: " + result.pct + "%") + "</h2>" +
                '<p class="panel__sub">' + result.correct + "/" + result.total + " từ đúng vị trí</p>" +
                '<div class="essay-diff">' +
                result.details.map((d) => {
                    if (d.type === "ok") return '<span class="essay-diff__ok">' + esc(d.word) + "</span> ";
                    if (d.type === "wrong") return '<span class="essay-diff__bad" title="Đúng: ' + esc(d.expected) + '">' + esc(d.got) + "</span> ";
                    if (d.type === "missing") return '<span class="essay-diff__miss">[' + esc(d.word) + "]</span> ";
                    return '<span class="essay-diff__extra"><s>' + esc(d.word) + "</s></span> ";
                }).join("") +
                "</div>" +
                '<div class="panel__actions">' +
                '<button class="btn btn--ghost" data-essay-back="ebuild-menu">Chọn câu</button>' +
                '<button class="btn btn--primary" id="next">' + (cIdx < chunks.length - 1 ? "Đoạn tiếp" : "Câu tiếp") + "</button>" +
                "</div></div></div>"
            );
            bindEssayNav(document, router);
            $("#next").addEventListener("click", () => {
                if (cIdx < chunks.length - 1) { cIdx++; setupRound(); draw(); }
                else if (qIdx < ESSAY_QUESTIONS.length - 1) { qIdx++; cIdx = 0; setupRound(); draw(); }
                else router.go("essay-menu");
            });
        }

        function pickQuestion() {
            shell(
                "ebuild-menu",
                '<div class="essay-pick animate-pop">' + essayTopbar("") +
                '<h2 class="setup__title">🧩 Ghép Từng Câu</h2>' +
                '<p class="setup__text">Chọn câu để luyện ghép từng đoạn.</p>' +
                '<div class="essay-pick-list">' +
                ESSAY_QUESTIONS.map((q, i) =>
                    '<button class="essay-pick-btn" data-i="' + i + '"><span class="essay-pick-btn__num">Câu ' + q.id + "</span>" +
                    '<span class="essay-pick-btn__q">' + esc(q.question.slice(0, 80)) + "…</span></button>"
                ).join("") +
                "</div></div>"
            );
            bindEssayNav(document, router);
            $$(".essay-pick-btn").forEach((btn) =>
                btn.addEventListener("click", () => { qIdx = +btn.dataset.i; cIdx = 0; setupRound(); draw(); })
            );
        }
        pickQuestion();
    }

    /* ---- MODE: Điền khuyết ---- */
    function EssayCloze(shell, router) {
        let qIdx = 0;
        let blanks = [];
        let bank = [];
        let filled = {};
        let targetTokens = [];

        function makePuzzle(text, ratio) {
            const tokens = tokenize(text);
            const n = Math.max(3, Math.floor(tokens.length * ratio));
            const indices = shuffle(tokens.map((_, i) => i)).slice(0, n).sort((a, b) => a - b);
            return { tokens, blankIndices: indices };
        }

        function setup() {
            const q = ESSAY_QUESTIONS[qIdx];
            const chunks = splitChunks(q.answer);
            const chunk = chunks[0];
            const puzzle = makePuzzle(chunk, 0.35);
            targetTokens = puzzle.tokens;
            blanks = puzzle.blankIndices;
            filled = {};
            const blankWords = blanks.map((i) => puzzle.tokens[i]);
            bank = shuffle(blankWords.map((w, i) => ({ w, id: i })));
        }

        function draw() {
            const q = ESSAY_QUESTIONS[qIdx];
            const display = targetTokens.map((t, i) => {
                if (blanks.indexOf(i) === -1) return '<span class="essay-cloze__word">' + esc(t) + "</span>";
                const val = filled[i];
                return '<span class="essay-cloze__blank' + (val ? " is-filled" : "") + '" data-i="' + i + '">' +
                    (val ? esc(val) : "___") + "</span>";
            }).join(" ");

            shell(
                "ecloze",
                '<div class="essay-stage animate-pop">' +
                essayTopbar('<span class="pill">Câu <strong>' + (qIdx + 1) + "</strong></span>") +
                '<div class="essay-qcard essay-qcard--compact"><div class="essay-qcard__text">' + esc(q.question) + "</div></div>" +
                '<div class="essay-cloze-text">' + display + "</div>" +
                '<div class="essay-build-bank" id="bank">' +
                bank.map((t, i) =>
                    '<button class="essay-word essay-word--bank" data-i="' + i + '">' + esc(t.w) + "</button>"
                ).join("") +
                "</div>" +
                '<div class="essay-build-actions">' +
                '<span class="pill">' + Object.keys(filled).length + "/" + blanks.length + " từ đã điền</span>" +
                '<button class="btn btn--primary" id="check"' + (Object.keys(filled).length < blanks.length ? " disabled" : "") + '>Kiểm tra</button>' +
                "</div></div>"
            );
            bindEssayNav(document, router);

            let selectedBlank = null;
            $$(".essay-cloze__blank").forEach((el) => {
                el.addEventListener("click", () => {
                    $$(".essay-cloze__blank").forEach((b) => b.classList.remove("is-selected"));
                    el.classList.add("is-selected");
                    selectedBlank = +el.dataset.i;
                });
            });

            $$(".essay-word--bank").forEach((btn) => {
                btn.addEventListener("click", () => {
                    if (selectedBlank === null || filled[selectedBlank]) return;
                    const i = +btn.dataset.i;
                    const item = bank[i];
                    if (!item) return;
                    filled[selectedBlank] = item.w;
                    bank.splice(i, 1);
                    selectedBlank = null;
                    draw();
                });
            });

            $("#check").addEventListener("click", () => {
                let correct = 0;
                blanks.forEach((bi) => { if (filled[bi] === targetTokens[bi]) correct++; });
                const pct = Math.round((correct / blanks.length) * 100);
                STORE.setBest(q.id, pct);
                alert("Kết quả: " + correct + "/" + blanks.length + " từ đúng (" + pct + "%)\n\n" +
                    (pct === 100 ? "Xuất sắc! Bạn không bỏ sót từ nào." : "Hãy thử lại để đạt 100%."));
                if (qIdx < ESSAY_QUESTIONS.length - 1) { qIdx++; setup(); draw(); }
                else router.go("essay-menu");
            });
        }

        function pickQuestion() {
            shell(
                "ecloze-menu",
                '<div class="essay-pick animate-pop">' + essayTopbar("") +
                '<h2 class="setup__title">✏️ Điền Khuyết</h2>' +
                '<p class="setup__text">Chọn câu — điền các từ bị ẩn từ ngân hàng (chỉ gồm từ trong đáp án).</p>' +
                '<div class="essay-pick-list">' +
                ESSAY_QUESTIONS.map((q, i) =>
                    '<button class="essay-pick-btn" data-i="' + i + '"><span class="essay-pick-btn__num">Câu ' + q.id + "</span>" +
                    '<span class="essay-pick-btn__q">' + esc(q.question.slice(0, 80)) + "…</span></button>"
                ).join("") +
                "</div></div>"
            );
            bindEssayNav(document, router);
            $$(".essay-pick-btn").forEach((btn) =>
                btn.addEventListener("click", () => { qIdx = +btn.dataset.i; setup(); draw(); })
            );
        }
        pickQuestion();
    }

    /* ---- MODE: Ôn chủ động (SRS) ---- */
    function EssayRecall(shell, router) {
        const due = ESSAY_QUESTIONS.filter((q) => STORE.isDue(q.id));
        let i = 0;
        let revealed = false;

        if (!due.length) {
            shell("erecall", '<div class="essay-stage animate-pop">' + essayTopbar("") +
                '<div class="empty-state"><div class="empty-state__icon">🎉</div>' +
                '<div class="empty-state__title">Đã ôn hết hôm nay!</div>' +
                '<p class="empty-state__text">Quay lại vào ngày mai theo lịch lặp lại ngắt quãng.</p>' +
                '<button class="btn btn--primary" data-essay-back="essay-menu">Về menu tự luận</button></div></div>');
            bindEssayNav(document, router);
            return;
        }

        function draw() {
            if (i >= due.length) {
                shell("erecall", '<div class="panel animate-pop"><div class="panel__emoji">🧠</div>' +
                    '<h2 class="panel__title">Hoàn tất phiên ôn</h2>' +
                    '<p class="panel__sub">Đã ôn ' + due.length + " câu.</p>" +
                    '<button class="btn btn--primary" data-essay-back="essay-menu">Về menu</button></div>');
                bindEssayNav(document, router);
                return;
            }
            const q = due[i];
            shell(
                "erecall",
                '<div class="essay-stage animate-pop">' +
                essayTopbar('<span class="pill">Còn <strong>' + (due.length - i) + "</strong></span>") +
                '<div class="essay-qcard"><div class="essay-qcard__label">Câu ' + q.id + '</div><div class="essay-qcard__text">' + esc(q.question) + "</div></div>" +
                (revealed
                    ? '<div class="essay-answer-full">' + formatAnswerHtml(q.answer) +
                    '<div class="essay-token-count">' + tokenize(q.answer).length + " từ · " + splitChunks(q.answer).length + " đoạn</div></div>" +
                    '<div class="recall-actions"><button class="btn btn--danger" id="forgot">❌ Chưa thuộc</button>' +
                    '<button class="btn btn--emerald" id="knew">✅ Đã thuộc</button></div>'
                    : '<p class="recall-prompt">Hãy tự nhớ lại toàn bộ đáp án trong đầu (từng chữ), rồi bấm hiện để đối chiếu.</p>' +
                    '<button class="btn btn--primary btn--block" id="reveal">👁️ Hiện đáp án đầy đủ</button>') +
                "</div>"
            );
            bindEssayNav(document, router);
            if (revealed) {
                $("#forgot").addEventListener("click", () => { STORE.grade(q.id, false); i++; revealed = false; draw(); });
                $("#knew").addEventListener("click", () => { STORE.grade(q.id, true); i++; revealed = false; draw(); });
            } else {
                $("#reveal").addEventListener("click", () => { revealed = true; draw(); });
            }
        }
        draw();
    }

    /* ---- MODE: Thuộc lòng (full build) ---- */
    function EssayFull(shell, router) {
        let qIdx = 0;
        let cIdx = 0;
        let built = [];
        let bank = [];
        let totalCorrect = 0;
        let totalWords = 0;

        function setupChunk() {
            const chunks = splitChunks(ESSAY_QUESTIONS[qIdx].answer);
            const target = tokenize(chunks[cIdx]);
            built = [];
            bank = shuffle(target.map((w, i) => ({ w, id: i })));
        }

        function draw() {
            const q = ESSAY_QUESTIONS[qIdx];
            const chunks = splitChunks(q.answer);
            const target = tokenize(chunks[cIdx]);
            const overall = totalWords ? Math.round((totalCorrect / totalWords) * 100) : 0;

            shell(
                "efull",
                '<div class="essay-stage animate-pop">' +
                essayTopbar('<span class="pill">🏆 ' + overall + "%</span>") +
                '<div class="progress"><div class="progress__bar progress__bar--emerald" style="width:' +
                ((cIdx + qIdx * 10) / (ESSAY_QUESTIONS.length * 10) * 100) + '%"></div></div>' +
                '<div class="essay-qcard essay-qcard--compact"><div class="essay-qcard__text">' + esc(q.question) + "</div></div>" +
                '<div class="essay-build-target">' +
                (built.length ? built.map((t) => '<span class="essay-word essay-word--placed">' + esc(t.w) + "</span>").join("")
                    : '<span class="essay-build-hint">Ghép đoạn ' + (cIdx + 1) + "/" + chunks.length + "…</span>") +
                "</div>" +
                '<div class="essay-build-bank">' +
                bank.map((t, i) => '<button class="essay-word essay-word--bank" data-i="' + i + '">' + esc(t.w) + "</button>").join("") +
                "</div>" +
                '<div class="essay-build-actions"><span class="pill">' + built.length + "/" + target.length + " từ</span></div></div>"
            );
            bindEssayNav(document, router);

            $$(".essay-word--bank").forEach((btn) =>
                btn.addEventListener("click", () => {
                    const item = bank[+btn.dataset.i];
                    if (!item) return;
                    built.push(item);
                    bank.splice(+btn.dataset.i, 1);
                    if (built.length === target.length) {
                        const user = built.map((t) => t.w);
                        const r = compareTokens(user, target);
                        totalCorrect += r.correct;
                        totalWords += r.total;
                        if (r.pct === 100) STORE.markChunk(q.id, cIdx);
                        if (cIdx < chunks.length - 1) { cIdx++; setupChunk(); draw(); }
                        else finish(q);
                    } else draw();
                })
            );
        }

        function finish(q) {
            const pct = totalWords ? Math.round((totalCorrect / totalWords) * 100) : 0;
            STORE.setBest(q.id, pct);
            if (pct >= 95) STORE.grade(q.id, true);
            shell("efull", '<div class="panel animate-pop"><div class="panel__emoji">' + (pct >= 95 ? "🏆" : "💪") + "</div>" +
                '<h2 class="panel__title">Hoàn thành Câu ' + q.id + "!</h2>" +
                '<div class="result__big">' + pct + "%</div>" +
                '<p class="panel__sub">' + totalCorrect + "/" + totalWords + " từ đúng · " +
                (pct >= 100 ? "Không bỏ sót chữ nào!" : "Hãy luyện lại để đạt 100%") + "</p>" +
                '<div class="panel__actions">' +
                '<button class="btn btn--ghost" data-essay-back="essay-menu">Về menu</button>' +
                '<button class="btn btn--primary" id="next-q">' + (qIdx < ESSAY_QUESTIONS.length - 1 ? "Câu tiếp" : "Xong") + "</button></div></div>");
            bindEssayNav(document, router);
            $("#next-q").addEventListener("click", () => {
                if (qIdx < ESSAY_QUESTIONS.length - 1) {
                    qIdx++; cIdx = 0; totalCorrect = 0; totalWords = 0; setupChunk(); draw();
                } else router.go("essay-menu");
            });
        }

        function pickQuestion() {
            shell("efull-menu", '<div class="essay-pick animate-pop">' + essayTopbar("") +
                '<h2 class="setup__title">🎯 Thuộc Lòng</h2>' +
                '<p class="setup__text">Ghép lần lượt TẤT CẢ đoạn của đáp án. Mục tiêu: 100% từ đúng.</p>' +
                '<div class="essay-pick-list">' +
                ESSAY_QUESTIONS.map((q, i) =>
                    '<button class="essay-pick-btn" data-i="' + i + '"><span class="essay-pick-btn__num">Câu ' + q.id + "</span>" +
                    '<span class="essay-pick-btn__q">' + esc(q.question.slice(0, 80)) + "…</span></button>"
                ).join("") + "</div></div>");
            bindEssayNav(document, router);
            $$(".essay-pick-btn").forEach((btn) =>
                btn.addEventListener("click", () => {
                    qIdx = +btn.dataset.i; cIdx = 0; totalCorrect = 0; totalWords = 0;
                    setupChunk(); draw();
                })
            );
        }
        pickQuestion();
    }

    /* ---- Router export ---- */
    window.EssayApp = {
        screens: {
            "essay-menu": EssayMenu,
            eread: EssayRead,
            ebuild: EssayBuild,
            "ebuild-menu": EssayBuild,
            ecloze: EssayCloze,
            "ecloze-menu": EssayCloze,
            erecall: EssayRecall,
            efull: EssayFull,
            "efull-menu": EssayFull
        },
        stats: () => STORE.stats()
    };
})();
