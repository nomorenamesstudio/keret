/*
 * copy.js - the tabs on the run-it-yourself card, and its Copy button.
 *
 * The Clipboard API only exists in a secure context, and a phone opening the site
 * over http://<lan-ip> is not one. So the button is always visible and this falls
 * back to a selection copy, then to selecting the command itself; hiding the
 * button where the API is missing left a phone with no way to copy at all.
 */
(function () {
  var card = document.querySelector('[data-tabs]');
  var tabs = card ? [].slice.call(card.querySelectorAll('.cmd-tab')) : [];
  var panels = tabs.map(function (tab) { return document.getElementById(tab.getAttribute('data-tab')); });
  var button = document.querySelector('[data-copy-panel]');
  /* the label lives in its own span so the flash does not wipe the icon */
  var labelEl = button ? button.querySelector('[data-copy-label]') : null;
  var label = labelEl ? labelEl.textContent : '';

  function activeCode() {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i] && !panels[i].hidden) return panels[i].querySelector('code');
    }
    return null;
  }

  function select(tab) {
    tabs.forEach(function (other, i) {
      var on = other === tab;
      other.classList.toggle('is-on', on);
      other.setAttribute('aria-selected', on ? 'true' : 'false');
      other.tabIndex = on ? 0 : -1;
      if (panels[i]) panels[i].hidden = !on;
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { select(tab); });
    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      var at = tabs.indexOf(tab);
      var next = tabs[(at + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(next);
      next.focus();
    });
  });

  if (!button) return;

  function flash(text) {
    if (labelEl) labelEl.textContent = text;
    button.classList.add('done');
    setTimeout(function () {
      if (labelEl) labelEl.textContent = label;
      button.classList.remove('done');
    }, 1600);
  }

  /** Select the command itself, so the OS copy menu has something to take. */
  function selectCommand(code) {
    var range = document.createRange();
    range.selectNodeContents(code);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /** The pre-Clipboard-API route, which still works on an insecure origin. */
  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '0';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.focus();
    area.select();
    area.setSelectionRange(0, area.value.length);
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  function copy(code) {
    if (legacyCopy(code.textContent)) {
      flash('Copied');
      return;
    }
    selectCommand(code);
    flash('Selected');
  }

  button.addEventListener('click', function () {
    var code = activeCode();
    if (!code) return;
    // the API first where it exists; the gesture-tied fallback on an insecure origin
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code.textContent).then(function () {
        flash('Copied');
      }, function () {
        copy(code);
      });
      return;
    }
    copy(code);
  });
})();
