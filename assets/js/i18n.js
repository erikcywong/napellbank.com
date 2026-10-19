/* NAPELL BANK i18n
   Markup contract:
     <h1 data-en="English" data-zh="中文">English</h1>
     <input data-en-ph="Placeholder" data-zh-ph="占位符">
     <title data-en="..." data-zh="...">
   Persisted in localStorage under napellbank_lang.
   Fires window event "langchange" with {detail:{lang}}.
*/
(function () {
  var KEY = 'napellbank_lang';
  var DICT = {
    en: { label: 'EN' },
    zh: { label: '中文' }
  };

  function current() {
    try { return localStorage.getItem(KEY) || 'en'; } catch (e) { return 'en'; }
  }

  function apply(lang) {
    if (lang !== 'zh') lang = 'en';
    var root = document.documentElement;
    root.setAttribute('lang', lang === 'zh' ? 'zh-Hans' : 'en');
    root.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-en]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (v !== null) el.innerHTML = v;
    });

    document.querySelectorAll('[data-en-ph]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang + '-ph');
      if (v !== null) el.setAttribute('placeholder', v);
    });

    document.querySelectorAll('title[data-en]').forEach(function (el) {
      document.title = el.getAttribute('data-' + lang) || document.title;
    });

    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang-btn') === lang);
    });

    try { localStorage.setItem(KEY, lang); } catch (e) {}

    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  window.NAPELLBANK_LANG = current;
  window.NAPELLBANK_SET_LANG = apply;

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-lang-btn')); });
    });
    apply(current());
  });
})();
