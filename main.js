(function(){
  "use strict";

  /* ---------- Preloader (only present on pages that include it) ---------- */
  var pre = document.getElementById('preloader');
  if(pre){
    var pct = document.getElementById('prePct');
    var p = 0;
    var pctTimer = setInterval(function(){
      p += Math.random()*14;
      if(p>=100){p=100;clearInterval(pctTimer);}
      if(pct) pct.textContent = Math.floor(p)+'%';
    }, 180);
    window.addEventListener('load', function(){
      setTimeout(function(){
        if(pct) pct.textContent = '100%';
        pre.classList.add('hide');
        document.body.style.overflow = '';
      }, 2600);
    });
  }

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById('siteNav');
  if(nav){
    function navState(){
      if(window.scrollY > 40){ nav.classList.add('scrolled'); }
      else { nav.classList.remove('scrolled'); }
    }
    window.addEventListener('scroll', navState, {passive:true});
    navState();
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if(burger && menu){
    burger.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        menu.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Active nav link: same-page anchors ---------- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  if(sections.length && navLinks.length){
    var navObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          navLinks.forEach(function(l){
            var href = l.getAttribute('href') || '';
            if(href.indexOf('#') === 0){
              l.classList.toggle('active', href === '#'+entry.target.id);
            }
          });
        }
      });
    }, {rootMargin:'-45% 0px -45% 0px'});
    sections.forEach(function(s){ navObs.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if(revealEls.length){
    var revObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          revObs.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
    revealEls.forEach(function(el){ revObs.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el){
    var target = parseInt(el.getAttribute('data-count'), 10);
    var numEl = el.classList.contains('n') ? el : el.querySelector('.n');
    if(!numEl) return;
    var duration = 1400, startTime = null;
    function step(ts){
      if(!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      numEl.textContent = Math.floor(eased * target);
      if(progress < 1){ requestAnimationFrame(step); }
      else { numEl.textContent = target; }
    }
    requestAnimationFrame(step);
  }
  var countTargets = document.querySelectorAll('[data-count]');
  if(countTargets.length){
    var countObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCount(entry.target);
          countObs.unobserve(entry.target);
        }
      });
    }, {threshold:0.4});
    countTargets.forEach(function(el){ countObs.observe(el); });
  }

  /* ---------- Expandable services ---------- */
  var serviceRows = document.querySelectorAll('[data-service]');
  if(serviceRows.length){
    serviceRows.forEach(function(row){
      row.addEventListener('click', function(){
        var wasOpen = row.classList.contains('open');
        serviceRows.forEach(function(r){ r.classList.remove('open'); });
        if(!wasOpen){ row.classList.add('open'); }
      });
    });
  }

  /* ---------- Smooth anchor scroll offset for fixed nav (same-page only) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id.length < 2) return;
      var target = document.querySelector(id);
      if(target){
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({top:y, behavior:'smooth'});
      }
    });
  });

  /* ---------- Gallery lightbox (only on gallery page) ---------- */
  var galleryItems = document.querySelectorAll('.gallery-masonry .g-item img');
  var lightbox = document.getElementById('lightbox');
  if(galleryItems.length && lightbox){
    var lbImg = document.getElementById('lightboxImg');
    var lbCount = document.getElementById('lightboxCount');
    var lbClose = document.getElementById('lightboxClose');
    var lbPrev = document.getElementById('lightboxPrev');
    var lbNext = document.getElementById('lightboxNext');
    var current = 0;
    var srcs = Array.prototype.map.call(galleryItems, function(img){ return {src:img.getAttribute('src'), alt:img.getAttribute('alt')}; });

    function openLB(i){
      current = i;
      lbImg.src = srcs[current].src;
      lbImg.alt = srcs[current].alt || '';
      lbCount.textContent = (current+1) + ' / ' + srcs.length;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLB(){
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    function step(dir){
      current = (current + dir + srcs.length) % srcs.length;
      openLB(current);
    }
    galleryItems.forEach(function(img, i){
      img.closest('.g-item').addEventListener('click', function(){ openLB(i); });
    });
    if(lbClose) lbClose.addEventListener('click', closeLB);
    if(lbPrev) lbPrev.addEventListener('click', function(){ step(-1); });
    if(lbNext) lbNext.addEventListener('click', function(){ step(1); });
    lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLB(); });
    document.addEventListener('keydown', function(e){
      if(!lightbox.classList.contains('open')) return;
      if(e.key === 'Escape') closeLB();
      if(e.key === 'ArrowLeft') step(-1);
      if(e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Cursor-reactive contour lines (hero, index only) ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heroContours = document.getElementById('heroContours');
  if(heroContours && !reduceMotion && window.matchMedia('(hover: hover)').matches){
    var cPaths = heroContours.querySelectorAll('path[data-depth]');
    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    var heroEl = heroContours.closest('.hero');
    heroEl.addEventListener('mousemove', function(e){
      var r = heroEl.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;   // -1 .. 1
      targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    heroEl.addEventListener('mouseleave', function(){ targetX = 0; targetY = 0; });
    (function tick(){
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      cPaths.forEach(function(p){
        var depth = parseFloat(p.getAttribute('data-depth')) || 1;
        var dx = curX * depth * 9;
        var dy = curY * depth * 6;
        p.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0)';
      });
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- Journey: scroll-pinned "Ariel Method" story (index only) ---------- */
  var journeyPin = document.getElementById('journeyPin');
  if(journeyPin){
    var veinFill = document.getElementById('journeyVeinFill');
    var journeyIdx = document.getElementById('journeyIdx');
    var nodes = Array.prototype.slice.call(document.querySelectorAll('#journeyNodes .j-node'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('#journeyPanels .j-panel'));
    var stopCount = nodes.length;
    var lastIdx = -1;
    var ticking = false;

    function setActive(idx){
      if(idx === lastIdx) return;
      lastIdx = idx;
      nodes.forEach(function(n, i){
        n.classList.toggle('active', i === idx);
        n.classList.toggle('done', i < idx);
      });
      panels.forEach(function(p, i){ p.classList.toggle('active', i === idx); });
      if(journeyIdx) journeyIdx.textContent = String(idx + 1).padStart(2, '0');
    }

    function updateJourney(){
      ticking = false;
      var rect = journeyPin.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      if(total <= 0) return;
      var scrolled = -rect.top;
      var progress = Math.min(Math.max(scrolled / total, 0), 1);
      journeyPin.style.setProperty('--progress', progress);
      var idx = Math.min(stopCount - 1, Math.floor(progress * stopCount));
      setActive(idx);
    }
    window.addEventListener('scroll', function(){
      if(!ticking){ requestAnimationFrame(updateJourney); ticking = true; }
    }, {passive:true});
    window.addEventListener('resize', updateJourney);
    setActive(0);
    updateJourney();
  }

  /* ---------- Contact form (static demo submit) ---------- */
  var contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var success = document.getElementById('formSuccess');
      contactForm.reset();
      if(success){ success.classList.add('show'); }
      contactForm.style.display = 'none';
    });
  }
})();
