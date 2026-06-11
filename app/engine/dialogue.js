/* MedLing · Scripted Branching Dialogue (novel feature, tier 2 — D23 "context").
   Deterministic clinical roleplay: learner picks a reply → gets branch-specific
   feedback → advances. NO AI, NO API, NO hallucination — every branch authored.
   This is the D26 framework stress test: it manages dialogue state in vanilla JS.
   Verdict on whether vanilla stays adequate goes in the Wave B report.

   Section JSON shape (added to a lesson situation, or standalone):
   {
     "speaker": "Patient", "speaker_emoji": "🧑",
     "open": { "en": "...", "vi": "...", "audio": "<clip path|optional>" },
     "turns": [
       { "id": "t1", "prompt_en": "...", "prompt_vi": "...",
         "choices": [
           { "t": "reply text", "gl": {"word":"gloss"}, "ok": true|false,
             "feedback_en": "...", "feedback_vi": "...", "next": "t2"|"end" } ] }
     ],
     "close": { "en": "...", "vi": "..." }
   }
   `next:"end"` (or omitted on last turn) finishes the dialogue. */
'use strict';
window.MedLing = window.MedLing || {};

(function (ML) {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Render a dialogue into `mount` (an element). onDone() fires when finished.
     Returns a controller with .destroy(). State is local to this closure —
     no globals, so multiple dialogues can't collide. */
  function render(data, mount, opts) {
    opts = opts || {};
    var turnsById = {};
    data.turns.forEach(function (t) { turnsById[t.id] = t; });

    var state = { turnId: data.turns[0] && data.turns[0].id, picks: [], score: 0, answered: false, sel: null };

    function speak(text, clip) {
      if (window.speakWith) window.speakWith(text, clip || '');
      else if (window.speechSynthesis) {
        var u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = .9;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      }
    }

    function bubble(speaker, emoji, en, vi, clip) {
      return '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:14px">'
        + '<div style="width:36px;height:36px;border-radius:50%;background:var(--ml-linen);border:1px solid var(--ml-line);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">' + (emoji || '🧑') + '</div>'
        + '<div style="flex:1;background:var(--ml-paper);border:1px solid var(--ml-line);border-radius:4px 14px 14px 14px;padding:11px 14px">'
          + '<div style="font:500 10px/1 var(--ml-font-body);letter-spacing:.12em;text-transform:uppercase;color:var(--ml-sage);margin-bottom:5px">' + esc(speaker) + '</div>'
          + '<div style="font-size:14px;color:var(--ml-ink);line-height:1.5">' + esc(en) + '</div>'
          + (vi ? '<div style="font-size:12px;color:var(--ml-earth);font-style:italic;margin-top:3px">' + esc(vi) + '</div>' : '')
          + (en ? '<button data-speak="1" style="margin-top:8px;border:1px solid var(--ml-line);background:transparent;border-radius:var(--ml-radius-pill);font-size:12px;color:var(--ml-moss);padding:3px 11px;cursor:pointer">🔊</button>' : '')
        + '</div></div>';
    }

    function draw() {
      var turn = turnsById[state.turnId];
      var html = bubble(data.speaker || 'Patient', data.speaker_emoji, data.open.en, data.open.vi, data.open.audio);

      if (turn) {
        html += '<div style="margin:6px 0 12px">'
          + '<div class="ml-eyebrow" style="margin-bottom:7px">Bạn trả lời — Your reply</div>'
          + '<div style="font-size:14px;font-weight:500;color:var(--ml-ink);margin-bottom:2px">' + esc(turn.prompt_en) + '</div>'
          + (turn.prompt_vi ? '<div style="font-size:12px;color:var(--ml-earth);font-style:italic;margin-bottom:10px">' + esc(turn.prompt_vi) + '</div>' : '')
          + turn.choices.map(function (c, i) {
              var cls = 'opt';
              if (state.answered) {
                if (c.ok) cls += ' ok'; else if (i === state.sel) cls += ' no'; else cls += ' dim';
                cls += ' locked';
              }
              return '<button class="' + cls + '" data-choice="' + i + '">'
                + '<span>' + esc(c.t) + '</span></button>';
            }).join('')
          + '</div>';

        if (state.answered) {
          var c = turn.choices[state.sel];
          var good = c.ok;
          html += '<div class="pop" style="background:' + (good ? 'var(--ml-ok-bg)' : 'var(--ml-err-bg)')
            + ';border:1px solid ' + (good ? 'var(--ml-ok)' : 'var(--ml-err)')
            + ';border-radius:12px;padding:11px 14px;margin-top:4px">'
            + '<div style="font:600 12px/1.3 var(--ml-font-body);color:' + (good ? 'var(--ml-forest)' : 'var(--ml-err)') + ';margin-bottom:4px">'
              + (good ? '✓ Tốt — Good choice' : '↩ Thử lại cách nói này — Note this') + '</div>'
            + '<div style="font-size:13px;color:var(--ml-ink);line-height:1.55">' + esc(c.feedback_en) + '</div>'
            + (c.feedback_vi ? '<div style="font-size:12px;color:var(--ml-earth);font-style:italic;margin-top:2px">' + esc(c.feedback_vi) + '</div>' : '')
            + '</div>';
          var lastLabel = (c.next && c.next !== 'end') ? 'Tiếp tục — Continue →' : 'Kết thúc hội thoại — Finish →';
          html += '<div class="pop"><button class="mbtn" style="background:var(--ml-forest);color:var(--ml-cream);margin-top:12px" data-advance="1">' + lastLabel + '</button></div>';
        }
      }
      mount.innerHTML = '<div class="su">' + html + '</div>';
      wire();
    }

    function wire() {
      Array.prototype.forEach.call(mount.querySelectorAll('[data-choice]'), function (b) {
        b.onclick = function () {
          if (state.answered) return;
          state.sel = +b.getAttribute('data-choice');
          state.answered = true;
          var turn = turnsById[state.turnId];
          var c = turn.choices[state.sel];
          state.picks.push({ turn: state.turnId, choice: state.sel, ok: !!c.ok });
          if (c.ok) state.score++;
          draw();
        };
      });
      var spk = mount.querySelector('[data-speak]');
      if (spk) spk.onclick = function () { speak(data.open.en, data.open.audio); };
      var adv = mount.querySelector('[data-advance]');
      if (adv) adv.onclick = function () {
        var c = turnsById[state.turnId].choices[state.sel];
        var nxt = c.next;
        if (!nxt || nxt === 'end' || !turnsById[nxt]) { finish(); return; }
        state.turnId = nxt; state.answered = false; state.sel = null;
        draw(); mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    }

    function finish() {
      var total = state.picks.length;
      mount.innerHTML = '<div class="pop" style="text-align:center;padding:24px 8px">'
        + '<div style="font-size:42px;margin-bottom:8px">💬</div>'
        + '<div style="font:500 20px/1.2 var(--ml-font-display);color:var(--ml-forest);margin-bottom:4px">Hội thoại hoàn thành</div>'
        + '<div style="font-size:13px;color:var(--ml-earth);margin-bottom:14px">Dialogue complete · ' + state.score + '/' + total + ' lựa chọn tự nhiên</div>'
        + (data.close ? '<div style="max-width:340px;margin:0 auto 16px;font-size:13px;color:var(--ml-ink);line-height:1.55">' + esc(data.close.en) + (data.close.vi ? '<br><span style="color:var(--ml-earth);font-style:italic">' + esc(data.close.vi) + '</span>' : '') + '</div>' : '')
        + '</div>';
      if (opts.onDone) opts.onDone({ score: state.score, total: total, picks: state.picks });
    }

    draw();
    return { destroy: function () { mount.innerHTML = ''; } };
  }

  ML.dialogue = { render: render };
})(window.MedLing);
