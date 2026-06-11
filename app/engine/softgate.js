/* MedLing · Soft Freemium Gate (D32 / D4 / monetization doc).
   Shown at the vocab→clinical-application "aha moment" (Stage 1A lesson 6).
   Purpose THIS PHASE: measure willingness to pay — NOT to lock content hard.
   It records intent (auth.logIntent) and lets the learner continue. Real
   server-side locking (D21) arrives in Phase 2 when paid content exists.

   Usage: MedLing.softgate.show({ gateId:'1A-06-softgate', onContinue:fn }) */
'use strict';
window.MedLing = window.MedLing || {};

(function (ML) {
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  function log(gateId, action, meta) {
    if (ML.auth && ML.auth.logIntent) ML.auth.logIntent(gateId, action, meta);
  }

  function show(opts) {
    opts = opts || {};
    var gateId = opts.gateId || 'softgate';
    log(gateId, 'viewed');

    var ov = document.createElement('div');
    ov.id = 'ml-softgate';
    ov.style.cssText = 'position:fixed;inset:0;z-index:1200;background:rgba(30,43,35,.4);'
      + 'display:flex;align-items:flex-end;justify-content:center;animation:mlFade .2s ease both';
    ov.innerHTML =
      '<div role="dialog" style="background:var(--ml-paper);width:min(460px,100%);'
        + 'border-radius:var(--ml-radius-lg) var(--ml-radius-lg) 0 0;padding:26px 22px 30px;'
        + 'box-shadow:var(--ml-shadow-lift);animation:mlSheetUp .28s var(--ml-ease) both">'
      + '<div style="text-align:center;font-size:34px;margin-bottom:8px">🌿</div>'
      + '<h2 style="font:500 22px/1.25 var(--ml-font-display);color:var(--ml-forest);text-align:center;margin-bottom:6px">'
        + 'Bạn vừa đến "khoảnh khắc aha"</h2>'
      + '<p style="font-size:14px;color:var(--ml-earth);text-align:center;line-height:1.6;margin-bottom:4px">'
        + 'Từ đây, từ vựng bắt đầu biến thành <b style="color:var(--ml-ink)">ứng dụng lâm sàng thật</b>. '
        + 'Phần còn lại của Stage 1A và các stage sau đang được hoàn thiện.</p>'
      + '<p style="font-size:12px;color:var(--ml-sage);text-align:center;font-style:italic;margin-bottom:20px">'
        + 'You\'ve reached where vocabulary becomes clinical application.</p>'
      + '<div class="ml-eyebrow" style="text-align:center;margin-bottom:12px">Bạn có muốn học tiếp không?</div>'
      + '<button id="sg-yes" class="mbtn" style="background:var(--ml-forest);color:var(--ml-cream);margin-bottom:9px">'
        + '✋ Có — tôi muốn học tiếp khi mở</button>'
      + '<button id="sg-maybe" class="mbtn" style="background:var(--ml-ok-bg);color:var(--ml-forest);margin-bottom:9px">'
        + '🤔 Có thể — cho tôi xem giá trước</button>'
      + '<button id="sg-continue" class="obtn">Tiếp tục xem bản xem trước — Continue preview</button>'
      + '</div>';

    document.body.appendChild(ov);
    var done = function (action, then) {
      log(gateId, action);
      ov.remove();
      if (then) then();
    };
    ov.querySelector('#sg-yes').onclick = function () { done('interested', opts.onContinue); };
    ov.querySelector('#sg-maybe').onclick = function () { done('wants_pricing', opts.onContinue); };
    ov.querySelector('#sg-continue').onclick = function () { done('dismissed', opts.onContinue); };
    ov.addEventListener('click', function (e) { if (e.target === ov) done('dismissed', opts.onContinue); });
  }

  if (!document.getElementById('ml-softgate-style')) {
    var st = document.createElement('style');
    st.id = 'ml-softgate-style';
    st.textContent = '@keyframes mlFade{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(st);
  }

  ML.softgate = { show: show };
})(window.MedLing);
