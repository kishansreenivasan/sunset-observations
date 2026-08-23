/* -----------------------------------------------------------------
   Sunset Observations

   The page walks from daylight to night as you scroll, which is the
   subject of the project: over six weeks the sun sat lower at the
   same clock time until it was setting before 8pm.

   Two things make this readable rather than merely decorative:

   1. Text colour is derived from the sky, not hand-picked. The ink
      flips between near-black and near-white based on the sky's
      measured luminance, and the secondary tones tighten toward the
      ink when contrast headroom is small.

   2. There is a narrow luminance band where neither dark nor light
      text clears 4.5:1 against the background. The crossing is
      anchored to the figure plates in the data section, which carry
      their own fixed light palette, so no page-background prose is
      ever sitting inside that band.
   ----------------------------------------------------------------- */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduce.matches || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  }

  if (reduce.matches) return;

  /* ---------- colour helpers ---------- */
  function rgb(hex) {
    var h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function css(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }
  function mix(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }
  function lum(c) {
    function f(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  }
  function contrast(a, b) {
    var la = lum(a), lb = lum(b);
    var hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ---------- sky palette ---------- */
  var DAY   = rgb('#faf7f1');   // July 5, sun about 7 degrees up
  var WARM  = rgb('#f9efdb');
  var GOLD  = rgb('#f3d7ad');
  var LOW   = rgb('#e9b177');   // late July, sun nearing the treeline
  var SET   = rgb('#cf8253');   // August, sun at the horizon
  var DUSK  = rgb('#7c4650');
  var BLUE  = rgb('#413c5c');
  var NIGHT = rgb('#1c1f2c');
  var DEEP  = rgb('#14161f');

  var INK_DARK  = rgb('#12100b');
  var INK_LIGHT = rgb('#f7f2e9');
  var HUE       = rgb('#e07a1a');

  var rootStyle = document.documentElement.style;
  var night = false;

  function pick(stops, t) {
    var i = 0;
    while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
    var a = stops[i], b = stops[i + 1];
    var span = b[0] - a[0];
    var k = span <= 0 ? 0 : (t - a[0]) / span;
    return mix(a[1], b[1], smooth(clamp01(k)));
  }

  function skyAt(p, band) {
    var b0 = band[0], b1 = band[1];
    if (p <= b0) {
      return pick([[0, DAY], [0.30, WARM], [0.62, GOLD], [0.86, LOW], [1, SET]],
                  b0 <= 0 ? 1 : clamp01(p / b0));
    }
    if (p <= b1) {
      return pick([[0, SET], [0.55, DUSK], [1, BLUE]],
                  (b1 - b0) <= 0 ? 1 : clamp01((p - b0) / (b1 - b0)));
    }
    return pick([[0, BLUE], [0.55, NIGHT], [1, DEEP]],
                (1 - b1) <= 0 ? 1 : clamp01((p - b1) / (1 - b1)));
  }

  function paint(p, band) {
    var sky = skyAt(p, band);
    var L = lum(sky);

    // Discrete flip with hysteresis so a resting scroll position near
    // the threshold cannot strobe between palettes.
    if (!night && L < 0.175) night = true;
    else if (night && L > 0.235) night = false;

    var ink = night ? INK_LIGHT : INK_DARK;

    // Contrast headroom of the ink over the sky. When small, pull the
    // secondary tones toward the ink rather than toward the sky, which
    // is what keeps small labels legible through the transition.
    var head = clamp01((contrast(ink, sky) - 4.6) / 9);

    rootStyle.setProperty('--sky', css(sky));
    rootStyle.setProperty('--ink', css(ink));
    rootStyle.setProperty('--ink-2', css(mix(ink, sky, 0.03 + 0.15 * head)));
    rootStyle.setProperty('--ink-3', css(mix(ink, sky, 0.06 + 0.26 * head)));
    rootStyle.setProperty('--rule', css(mix(ink, sky, 0.10 + 0.72 * head)));
    rootStyle.setProperty('--amber', css(mix(ink, HUE, 0.12 + 0.45 * head)));

    rootStyle.setProperty('--stars', clamp01((0.16 - L) / 0.13).toFixed(3));
    rootStyle.setProperty('--glow-y', (8 + 104 * p).toFixed(2) + 'vh');
    rootStyle.setProperty('--glow-o',
      Math.max(0, 0.36 + 0.40 * Math.sin(Math.PI * clamp01(p / 0.74)) - 0.40 * clamp01((p - 0.74) / 0.26)).toFixed(3));
  }

  /* ---------- anchor the crossing to the figure plates ---------- */
  function computeBand() {
    var figs = document.querySelectorAll('#measurement .figbox');
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (!figs.length || max <= 0) return [0.62, 0.76];
    var y = window.scrollY;
    var first = figs[0].getBoundingClientRect();
    var last = figs[figs.length - 1].getBoundingClientRect();
    var start = clamp01((first.top + y - window.innerHeight * 0.50) / max);
    var end = clamp01((last.bottom + y - window.innerHeight * 0.60) / max);
    if (end - start < 0.05) end = clamp01(start + 0.05);
    return [start, end];
  }

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      // recomputed every frame: layout shifts as images and fonts land,
      // and a stale band puts the transition in the wrong place
      paint(max > 0 ? clamp01(window.scrollY / max) : 0, computeBand());
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  document.addEventListener('DOMContentLoaded', onScroll);
  onScroll();
})();
