const header = document.querySelector('.site-header');
const cursor = document.querySelector('.cursor');
const cursorLabel = cursor?.querySelector('span');
const revealItems = document.querySelectorAll('.reveal');
const parallaxItems = document.querySelectorAll('[data-parallax]');
const planFilterButtons = [...document.querySelectorAll('[data-plan-filter]')];
const planCards = [...document.querySelectorAll('.plan[data-room]')];
const showroomRail = document.querySelector('.showroom__rail');
const showroomSlides = [...document.querySelectorAll('.showroom__rail figure')];
const showroomCounter = document.querySelector('[data-showroom-current]');
const showroomButtons = document.querySelectorAll('[data-showroom-slide]');
const comfortGrid = document.querySelector('[data-comfort-grid]');
const comfortCards = [...document.querySelectorAll('.comfort-card')];
const comfortCounter = document.querySelector('[data-comfort-current]');
const form = document.querySelector('.lead-form');
const phoneInput = form?.querySelector('input[type="tel"]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.13, rootMargin: '0px 0px -4% 0px' });

revealItems.forEach((item) => revealObserver.observe(item));

if (planFilterButtons.length && planCards.length) {
  const setPlanFilter = (room) => {
    planFilterButtons.forEach((button) => {
      const isActive = button.dataset.planFilter === room;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    planCards.forEach((card) => {
      const isVisible = card.dataset.room === room;
      card.hidden = !isVisible;
      if (isVisible) card.classList.add('is-visible');
    });
  };

  planFilterButtons.forEach((button) => {
    button.addEventListener('click', () => setPlanFilter(button.dataset.planFilter));
  });
}

window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 60);
}, { passive: true });

if (window.matchMedia('(pointer:fine)').matches && cursor) {
  window.addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll('[data-cursor]').forEach((target) => {
    target.addEventListener('mouseenter', () => {
      cursorLabel.textContent = target.dataset.cursor || 'Смотреть';
      cursor.classList.add('is-visible');
    });
    target.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  });
}

if (!reducedMotion && parallaxItems.length) {
  let parallaxFrame = 0;
  const updateParallax = () => {
    parallaxItems.forEach((item) => {
      const parentRect = item.parentElement.getBoundingClientRect();
      const speed = Number(item.dataset.parallax || 0);
      const shift = (parentRect.top - window.innerHeight / 2) * speed;
      item.style.transform = `translate3d(0, ${shift}px, 0)`;
    });
    parallaxFrame = 0;
  };

  window.addEventListener('scroll', () => {
    if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax);
  }, { passive: true });
}

if (showroomRail && showroomSlides.length) {
  const originalCount = showroomSlides.length;
  const cloneCount = Math.min(3, originalCount);
  const leadingClones = showroomSlides.slice(-cloneCount).map((slide) => slide.cloneNode(true));
  const trailingClones = showroomSlides.slice(0, cloneCount).map((slide) => slide.cloneNode(true));

  leadingClones.forEach((slide) => {
    slide.dataset.clone = 'true';
    slide.setAttribute('aria-hidden', 'true');
  });
  trailingClones.forEach((slide) => {
    slide.dataset.clone = 'true';
    slide.setAttribute('aria-hidden', 'true');
  });

  const leadingFragment = document.createDocumentFragment();
  leadingClones.forEach((slide) => leadingFragment.append(slide));
  showroomRail.prepend(leadingFragment);
  trailingClones.forEach((slide) => showroomRail.append(slide));

  const trackSlides = [...showroomRail.querySelectorAll('figure')];
  let trackIndex = cloneCount;
  let scrollTimer = 0;
  let resizeFrame = 0;

  const getStep = () => trackSlides.length > 1
    ? trackSlides[1].offsetLeft - trackSlides[0].offsetLeft
    : trackSlides[0].getBoundingClientRect().width;

  const getLogicalIndex = (index) => ((index - cloneCount) % originalCount + originalCount) % originalCount;

  const updateShowroomState = (index) => {
    trackIndex = index;
    showroomRail.dataset.trackIndex = String(index);
    const logicalIndex = getLogicalIndex(index);
    showroomRail.dataset.activeSlide = String(logicalIndex);
    if (showroomCounter) showroomCounter.textContent = String(logicalIndex + 1).padStart(2, '0');
  };

  const scrollToTrack = (index, behavior = 'smooth') => {
    const step = getStep();
    showroomRail.scrollTo({ left: index * step, behavior: reducedMotion ? 'auto' : behavior });
    updateShowroomState(index);
  };

  const normalizeLoop = () => {
    let normalizedIndex = trackIndex;
    if (trackIndex >= cloneCount + originalCount) normalizedIndex = trackIndex - originalCount;
    if (trackIndex < cloneCount) normalizedIndex = trackIndex + originalCount;
    if (normalizedIndex !== trackIndex) scrollToTrack(normalizedIndex, 'auto');
  };

  const syncFromScroll = () => {
    const step = getStep();
    if (!step) return;
    updateShowroomState(Math.round(showroomRail.scrollLeft / step));
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(normalizeLoop, 120);
  };

  const showShowroomSlide = (direction) => scrollToTrack(trackIndex + direction);

  showroomButtons.forEach((button) => {
    button.addEventListener('click', () => showShowroomSlide(button.dataset.showroomSlide === 'next' ? 1 : -1));
  });

  showroomRail.addEventListener('scroll', () => window.requestAnimationFrame(syncFromScroll), { passive: true });
  showroomRail.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showShowroomSlide(event.key === 'ArrowRight' ? 1 : -1);
  });

  window.addEventListener('resize', () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      scrollToTrack(cloneCount + Number(showroomRail.dataset.activeSlide || 0), 'auto');
      resizeFrame = 0;
    });
  });

  window.requestAnimationFrame(() => scrollToTrack(cloneCount, 'auto'));
}

if (comfortGrid && comfortCards.length) {
  const closeComfortCard = (card) => {
    card.classList.remove('is-open');
    const trigger = card.querySelector('.comfort-card__trigger');
    const label = card.querySelector('[data-comfort-label]');
    trigger?.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Подробнее';
  };

  comfortCards.forEach((card) => {
    const trigger = card.querySelector('.comfort-card__trigger');
    trigger?.addEventListener('click', () => {
      const willOpen = !card.classList.contains('is-open');
      comfortCards.forEach(closeComfortCard);
      if (!willOpen) return;
      card.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      const label = card.querySelector('[data-comfort-label]');
      if (label) label.textContent = 'Свернуть';
    });
  });

  const getComfortStep = () => comfortCards.length > 1
    ? comfortCards[1].offsetLeft - comfortCards[0].offsetLeft
    : comfortCards[0].getBoundingClientRect().width;

  const updateComfortCounter = () => {
    const step = getComfortStep();
    if (!step || !comfortCounter) return;
    const index = Math.max(0, Math.min(comfortCards.length - 1, Math.round(comfortGrid.scrollLeft / step)));
    comfortCounter.textContent = String(index + 1).padStart(2, '0');
  };

  comfortGrid.addEventListener('scroll', () => window.requestAnimationFrame(updateComfortCounter), { passive: true });
  comfortGrid.addEventListener('keydown', (event) => {
    if (event.target !== comfortGrid || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    comfortGrid.scrollBy({ left: getComfortStep() * (event.key === 'ArrowRight' ? 1 : -1), behavior: reducedMotion ? 'auto' : 'smooth' });
  });
}

const normalizePhoneDigits = (value) => {
  let digits = value.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11);
  if (digits && digits[0] !== '7') digits = `7${digits}`.slice(0, 11);
  return digits;
};

const formatPhoneDigits = (digits) => {
  if (!digits) return '';
  const groups = [digits.slice(1, 4), digits.slice(4, 7), digits.slice(7, 9), digits.slice(9, 11)];
  return `+7${groups[0] ? ` (${groups[0]}` : ''}${groups[0].length === 3 ? ')' : ''}${groups[1] ? ` ${groups[1]}` : ''}${groups[2] ? `-${groups[2]}` : ''}${groups[3] ? `-${groups[3]}` : ''}`;
};

const countLocalDigitsBefore = (value, position) => {
  const digitsBefore = (value.slice(0, position).match(/\d/g) || []).length;
  return Math.max(0, digitsBefore - 1);
};

const caretAfterLocalDigits = (value, localDigitCount) => {
  if (localDigitCount <= 0) return Math.min(2, value.length);
  let seenCountryCode = false;
  let seenLocalDigits = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (!/\d/.test(value[index])) continue;
    if (!seenCountryCode) {
      seenCountryCode = true;
      continue;
    }
    seenLocalDigits += 1;
    if (seenLocalDigits === localDigitCount) return index + 1;
  }

  return value.length;
};

phoneInput?.addEventListener('input', () => {
  phoneInput.value = formatPhoneDigits(normalizePhoneDigits(phoneInput.value));
});

phoneInput?.addEventListener('keydown', (event) => {
  if (event.key !== 'Backspace' && event.key !== 'Delete') return;

  const value = phoneInput.value;
  const selectionStart = phoneInput.selectionStart ?? value.length;
  const selectionEnd = phoneInput.selectionEnd ?? selectionStart;
  const digits = normalizePhoneDigits(value);
  let localDigits = digits.slice(1);

  if (!localDigits) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      phoneInput.value = '';
    }
    return;
  }

  const localStart = countLocalDigitsBefore(value, selectionStart);
  const localEnd = countLocalDigitsBefore(value, selectionEnd);
  let deleteFrom = localStart;
  let deleteCount = Math.max(0, localEnd - localStart);

  if (!deleteCount) {
    deleteFrom = event.key === 'Backspace' ? localStart - 1 : localStart;
    deleteCount = 1;
  }

  if (deleteFrom < 0 || deleteFrom >= localDigits.length) return;

  event.preventDefault();
  localDigits = `${localDigits.slice(0, deleteFrom)}${localDigits.slice(deleteFrom + deleteCount)}`;
  phoneInput.value = localDigits ? formatPhoneDigits(`7${localDigits}`) : '+7';
  const nextCaret = caretAfterLocalDigits(phoneInput.value, deleteFrom);
  phoneInput.setSelectionRange(nextCaret, nextCaret);
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = form.querySelector('.form-status');
  const endpoint = form.dataset.leadEndpoint;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (!endpoint) {
    status.textContent = 'Форма готова. Перед публикацией подключите её к CRM.';
    return;
  }

  try {
    const response = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
    if (!response.ok) throw new Error('Lead endpoint error');
    form.reset();
    status.textContent = 'Спасибо! Менеджер свяжется с вами в ближайшее время.';
  } catch {
    status.textContent = 'Не удалось отправить заявку. Позвоните по номеру на странице.';
  }
});
