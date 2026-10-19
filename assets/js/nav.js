/* Nav: active state + mobile drawer */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page');
    if (page) {
      document.querySelectorAll('.nav-links a').forEach(function (a) {
        if (a.getAttribute('data-nav') === page) a.classList.add('on');
      });
    }
    var burger = document.querySelector('.burger');
    var links = document.querySelector('.nav-links');
    if (burger && links) {
      burger.addEventListener('click', function () {
        links.classList.toggle('open');
        burger.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { links.classList.remove('open'); });
      });
    }
  });
})();
