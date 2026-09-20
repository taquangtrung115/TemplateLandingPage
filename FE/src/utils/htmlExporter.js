/**
 * Utility to export a standalone HTML landing page that can be run completely offline
 * or uploaded to any static web hosting provider (GitHub Pages, Vercel, Netlify, S3).
 */

import { extractPersonsList } from './animationConstants';

export const exportStandaloneHtml = (config, pageTitle = "Thiệp Mời Điện Tử") => {
  const safeConfig = JSON.stringify(config).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  const primaryColor = config?.theme?.primaryColor || '#e11d48';
  const secondaryColor = config?.theme?.secondaryColor || '#f43f5e';
  const accentColor = config?.theme?.accentColor || '#fef08a';
  const backgroundColor = config?.theme?.backgroundColor || '#ffffff';
  const textColor = config?.theme?.textColor || '#1e293b';
  const fontFamily = config?.theme?.fontFamily || 'Playfair Display';

  const personsList = extractPersonsList(config?.coupleOrCelebrant);
  const extraSections = (config?.extraSections || []).filter(s => s.enabled !== false);

  const getGridClass = (count) => {
    if (count === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto gap-6';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto gap-6';
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config?.hero?.title || pageTitle} - ${config?.hero?.subtitle || 'Trân trọng kính mời'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: '${fontFamily}', serif, system-ui;
      background-color: ${backgroundColor};
      color: ${textColor};
      overflow-x: hidden;
      margin: 0;
    }
    .custom-font-accent {
      font-family: 'Great Vibes', cursive;
    }

    /* Animation Engine Keyframes */
    @keyframes fade-up {
      0% { opacity: 0; transform: translateY(28px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-down {
      0% { opacity: 0; transform: translateY(-28px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-left {
      0% { opacity: 0; transform: translateX(28px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes fade-right {
      0% { opacity: 0; transform: translateX(-28px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes zoom-in {
      0% { opacity: 0; transform: scale(0.88); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes zoom-out {
      0% { opacity: 0; transform: scale(1.12); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes flip-up {
      0% { opacity: 0; transform: perspective(800px) rotateX(45deg); }
      100% { opacity: 1; transform: perspective(800px) rotateX(0deg); }
    }
    @keyframes bounce-subtle {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-12px); }
      60% { transform: translateY(-6px); }
    }
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(2deg); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 0.9; transform: scale(1.04); }
    }

    .animate-float { animation: float-slow 5s ease-in-out infinite; }
    .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }

    /* Scroll reveal base classes */
    .scroll-reveal {
      opacity: 0;
      transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .scroll-reveal.revealed {
      opacity: 1;
      transform: none;
    }
    .scroll-reveal.revealed.anim-fade-up { animation: fade-up 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .scroll-reveal.revealed.anim-fade-down { animation: fade-down 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .scroll-reveal.revealed.anim-fade-left { animation: fade-left 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .scroll-reveal.revealed.anim-fade-right { animation: fade-right 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .scroll-reveal.revealed.anim-zoom-in { animation: zoom-in 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .scroll-reveal.revealed.anim-zoom-out { animation: zoom-out 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .scroll-reveal.revealed.anim-flip-up { animation: flip-up 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .scroll-reveal.revealed.anim-bounce { animation: bounce-subtle 0.8s ease-in-out forwards; }
    .scroll-reveal.revealed.anim-float { animation: float-slow 6s ease-in-out infinite; }
    .scroll-reveal.revealed.anim-pulse { animation: pulse-glow 4s ease-in-out infinite; }
  </style>
</head>
<body class="relative">
  <!-- Particle Canvas -->
  <canvas id="particleCanvas" class="fixed inset-0 pointer-events-none z-10 w-full h-full"></canvas>

  <!-- Main Content Wrapper -->
  <div class="relative z-20 min-h-screen">
    <!-- Hero Section -->
    <header class="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 bg-cover bg-center overflow-hidden"
            style="background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.68)), url('${config?.hero?.coverImageUrl || ''}');">
      <div class="scroll-reveal max-w-3xl mx-auto text-white space-y-6" data-anim="${config?.hero?.animation || 'fade-up'}">
        <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border border-white/40 bg-white/10 backdrop-blur-md"
              style="border-color: ${accentColor};">
          ${config?.hero?.badge || 'SAVE THE DATE'}
        </span>
        <h1 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-md">
          ${config?.hero?.title || 'Minh & Linh'}
        </h1>
        <p class="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-xl mx-auto font-light">
          ${config?.hero?.subtitle || 'Trân trọng kính mời quý khách'}
        </p>

        <!-- Countdown Timer -->
        <div id="countdown" class="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto pt-6">
          <div class="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center">
            <span id="cd-days" class="block text-2xl sm:text-4xl font-bold text-white">00</span>
            <span class="text-xs uppercase tracking-wider text-gray-300">Ngày</span>
          </div>
          <div class="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center">
            <span id="cd-hours" class="block text-2xl sm:text-4xl font-bold text-white">00</span>
            <span class="text-xs uppercase tracking-wider text-gray-300">Giờ</span>
          </div>
          <div class="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center">
            <span id="cd-minutes" class="block text-2xl sm:text-4xl font-bold text-white">00</span>
            <span class="text-xs uppercase tracking-wider text-gray-300">Phút</span>
          </div>
          <div class="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center">
            <span id="cd-seconds" class="block text-2xl sm:text-4xl font-bold text-white">00</span>
            <span class="text-xs uppercase tracking-wider text-gray-300">Giây</span>
          </div>
        </div>

        <div class="pt-6">
          <a href="#rsvp" class="inline-block px-8 py-3.5 rounded-full font-semibold text-white shadow-xl hover:scale-105 transition-transform"
             style="background-color: ${primaryColor};">
            ${config?.hero?.callToActionText || 'Xác nhận tham dự'}
          </a>
        </div>
      </div>
    </header>

    <!-- Couple / Celebrant Section (Dynamic N Persons) -->
    <section class="py-24 px-4 max-w-7xl mx-auto">
      <div class="scroll-reveal text-center mb-16" data-anim="${config?.coupleOrCelebrant?.animation || 'fade-up'}">
        <h2 class="text-3xl sm:text-5xl font-bold mb-3" style="color: ${primaryColor};">
          ${config?.coupleOrCelebrant?.type === 'birthday' ? 'Chủ Nhân Bữa Tiệc' : config?.coupleOrCelebrant?.type === 'event' ? 'Gương Mặt Đại Diện' : 'Đôi Uyên Ương'}
        </h2>
        ${config?.coupleOrCelebrant?.storyQuote ? `
        <p class="italic text-gray-500 max-w-xl mx-auto text-base sm:text-lg">"${config.coupleOrCelebrant.storyQuote}"</p>
        ` : ''}
      </div>

      <div class="grid ${getGridClass(personsList.length)}">
        ${personsList.map((person, idx) => `
        <div class="scroll-reveal bg-white/70 backdrop-blur-md border border-gray-100 rounded-3xl p-6 sm:p-8 text-center shadow-lg hover:shadow-xl transition-all"
             data-anim="${person.animation || 'fade-up'}" style="transition-delay: ${idx * 120}ms;">
          ${person.avatarUrl ? `
          <img src="${person.avatarUrl}" alt="${person.name || ''}"
               class="w-36 h-36 sm:w-40 sm:h-40 object-cover rounded-full mx-auto mb-6 shadow-md ring-4 ring-offset-4"
               style="--tw-ring-color: ${primaryColor};" />
          ` : ''}
          <span class="text-xs uppercase font-bold tracking-widest text-gray-400 block mb-1">${person.title || ''}</span>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">${person.name || ''}</h3>
          ${person.bio ? `<p class="text-sm text-gray-600 mb-4 leading-relaxed">${person.bio}</p>` : ''}
          ${person.parents ? `<div class="text-xs text-gray-400 border-t border-gray-100 pt-3">${person.parents}</div>` : ''}
        </div>
        `).join('')}
      </div>
    </section>

    <!-- Event Details Section -->
    <section class="py-16 px-4 bg-white/40 border-y border-gray-100">
      <div class="scroll-reveal max-w-4xl mx-auto text-center space-y-6" data-anim="${config?.eventDetails?.animation || 'fade-up'}">
        <span class="text-xs uppercase font-bold tracking-widest text-gray-400">Thông Tin Sự Kiện</span>
        <h2 class="text-3xl font-bold text-gray-900">${config?.eventDetails?.ceremonyName || 'Tiệc Mừng'}</h2>
        <div class="text-lg font-semibold" style="color: ${primaryColor};">
          ${config?.eventDetails?.time || ''}
        </div>
        <div class="text-gray-700 max-w-lg mx-auto">
          <p class="font-bold text-lg">${config?.eventDetails?.venueName || ''}</p>
          <p class="text-sm text-gray-500">${config?.eventDetails?.address || ''}</p>
        </div>
        ${config?.eventDetails?.dressCode ? `
        <div class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          Dress Code: ${config?.eventDetails?.dressCode}
        </div>
        ` : ''}
        ${config?.eventDetails?.mapDirectLink ? `
        <div>
          <a href="${config.eventDetails.mapDirectLink}" target="_blank" rel="noopener noreferrer"
             class="inline-block text-sm font-semibold hover:underline" style="color: ${primaryColor};">
            Xem bản đồ chỉ đường Google Maps →
          </a>
        </div>
        ` : ''}
      </div>
    </section>

    <!-- Timeline Section -->
    ${config?.timeline && config?.timeline.length > 0 ? `
    <section class="py-20 px-4 max-w-3xl mx-auto">
      <div class="scroll-reveal text-center mb-12" data-anim="fade-up">
        <h2 class="text-3xl font-bold" style="color: ${primaryColor};">Chương Trình Buổi Tiệc</h2>
      </div>
      <div class="space-y-6">
        ${config.timeline.map((item, idx) => `
        <div class="scroll-reveal flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-gray-100 shadow-sm"
             data-anim="${item.animation || 'fade-up'}" style="transition-delay: ${idx * 80}ms;">
          <div class="w-16 text-right font-bold text-sm" style="color: ${primaryColor};">
            ${item.time}
          </div>
          <div class="w-2.5 h-2.5 rounded-full mt-1.5" style="background-color: ${primaryColor};"></div>
          <div class="flex-1">
            <h4 class="font-bold text-gray-800 text-base">${item.title}</h4>
            <p class="text-xs text-gray-500 mt-1">${item.description || ''}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Gallery Section -->
    ${config?.gallery && config?.gallery.length > 0 ? `
    <section class="py-20 px-4 max-w-5xl mx-auto">
      <div class="scroll-reveal text-center mb-12" data-anim="fade-up">
        <h2 class="text-3xl font-bold" style="color: ${primaryColor};">Khoảnh Khắc Kỷ Niệm</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${config.gallery.map((img, idx) => `
        <div class="scroll-reveal group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-md bg-gray-100"
             data-anim="${img.animation || 'zoom-in'}" style="transition-delay: ${idx * 60}ms;">
          <img src="${img.url}" alt="${img.caption || ''}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ${img.caption ? `
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <p class="text-xs text-white">${img.caption}</p>
          </div>
          ` : ''}
        </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Extra Sections (Thank You, VietQR, Q&A, Custom) -->
    ${extraSections.map(sec => {
      const vietQrUrl = sec.qrBank?.qrImageUrl 
        ? sec.qrBank.qrImageUrl 
        : sec.qrBank?.accountNumber 
          ? `https://img.vietqr.io/image/${encodeURIComponent(sec.qrBank.bankName || 'MB')}-${encodeURIComponent(sec.qrBank.accountNumber)}-compact2.jpg?accountName=${encodeURIComponent(sec.qrBank.accountHolder || '')}&amount=0`
          : null;

      if (sec.type === 'thankYou') {
        return `
        <section class="py-16 px-4 max-w-3xl mx-auto">
          <div class="scroll-reveal bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 text-center space-y-4"
               data-anim="${sec.animation || 'fade-up'}">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600">${sec.subtitle || 'Tri Ân'}</span>
            <h2 class="text-3xl font-bold" style="color: ${primaryColor};">${sec.title || 'Lời Cảm Ơn'}</h2>
            ${sec.imageUrl ? `<img src="${sec.imageUrl}" alt="Thank you" class="max-h-56 rounded-2xl mx-auto shadow-md" />` : ''}
            <p class="text-base text-gray-700 leading-relaxed whitespace-pre-line">${sec.content || ''}</p>
          </div>
        </section>`;
      }

      if (sec.type === 'giftQr') {
        return `
        <section class="py-16 px-4 max-w-xl mx-auto">
          <div class="scroll-reveal bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-xl border border-amber-100 text-center space-y-5"
               data-anim="${sec.animation || 'zoom-in'}">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700">Hộp Quà Mừng</span>
            <h2 class="text-3xl font-bold text-gray-900">${sec.title || 'Gửi Quà Chúc Mừng'}</h2>
            ${sec.subtitle ? `<p class="text-xs text-gray-500">${sec.subtitle}</p>` : ''}
            ${vietQrUrl ? `
            <div class="bg-white p-3 rounded-2xl inline-block shadow-md mx-auto border">
              <img src="${vietQrUrl}" alt="VietQR" class="w-52 h-auto mx-auto rounded-lg" />
            </div>` : ''}
            <div class="text-xs text-left bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-1">
              <div>Ngân hàng: <strong>${sec.qrBank?.bankName || 'N/A'}</strong></div>
              <div>Số tài khoản: <strong class="font-mono">${sec.qrBank?.accountNumber || 'N/A'}</strong></div>
              <div>Chủ tài khoản: <strong class="uppercase">${sec.qrBank?.accountHolder || 'N/A'}</strong></div>
            </div>
          </div>
        </section>`;
      }

      if (sec.type === 'qa') {
        return `
        <section class="py-16 px-4 max-w-3xl mx-auto">
          <div class="scroll-reveal bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6"
               data-anim="${sec.animation || 'fade-up'}">
            <div class="text-center space-y-1">
              <h2 class="text-3xl font-bold" style="color: ${primaryColor};">${sec.title || 'Câu Hỏi Thường Gặp'}</h2>
              ${sec.subtitle ? `<p class="text-xs text-gray-500">${sec.subtitle}</p>` : ''}
            </div>
            <div class="space-y-3">
              ${(sec.items || []).map(item => `
              <div class="border border-gray-200 rounded-2xl p-4 bg-white">
                <h4 class="font-bold text-sm text-gray-800 mb-1">❓ ${item.question}</h4>
                <p class="text-xs text-gray-600 leading-relaxed">${item.answer}</p>
              </div>
              `).join('')}
            </div>
          </div>
        </section>`;
      }

      return `
      <section class="py-16 px-4 max-w-3xl mx-auto">
        <div class="scroll-reveal bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-4"
             data-anim="${sec.animation || 'fade-up'}">
          <h2 class="text-3xl font-bold" style="color: ${primaryColor};">${sec.title || ''}</h2>
          ${sec.imageUrl ? `<img src="${sec.imageUrl}" alt="" class="max-h-56 rounded-2xl mx-auto shadow-md" />` : ''}
          <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">${sec.content || ''}</p>
        </div>
      </section>`;
    }).join('')}

    <!-- RSVP Section -->
    ${config?.rsvp?.enabled ? `
    <section id="rsvp" class="py-20 px-4 max-w-xl mx-auto">
      <div class="scroll-reveal bg-white/85 backdrop-blur-md rounded-3xl p-8 border border-gray-100 shadow-xl"
           data-anim="${config?.rsvp?.animation || 'fade-up'}">
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold mb-2" style="color: ${primaryColor};">Xác Nhận Tham Dự</h2>
          <p class="text-xs text-gray-500">${config?.rsvp?.note || 'Vui lòng phản hồi sớm để chúng mình chuẩn bị chu đáo nhất'}</p>
        </div>
        <form id="rsvpForm" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Họ và tên của bạn *</label>
            <input type="text" id="guestName" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" placeholder="Ví dụ: Nguyễn Văn A" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại</label>
              <input type="tel" id="guestPhone" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" placeholder="0987654321" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Số lượng khách</label>
              <select id="guestCount" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                <option value="1">1 người</option>
                ${config?.rsvp?.allowPlusOnes !== false ? `
                <option value="2">2 người (+1)</option>
                <option value="3">3 người</option>
                <option value="4">Gia đình (4+)</option>
                ` : ''}
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Bạn sẽ tham dự chứ?</label>
            <div class="flex gap-4">
              <label class="flex items-center text-sm gap-2 cursor-pointer">
                <input type="radio" name="attending" value="attending" checked /> Chắc chắn tham dự
              </label>
              <label class="flex items-center text-sm gap-2 cursor-pointer">
                <input type="radio" name="attending" value="declined" /> Rất tiếc không thể
              </label>
            </div>
          </div>
          ${config?.rsvp?.allowDietaryNotes ? `
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Ghi chú món ăn kiêng</label>
            <input type="text" id="guestDietary" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" placeholder="Ăn chay, dị ứng..." />
          </div>
          ` : ''}
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Lời chúc mừng</label>
            <textarea id="guestWishes" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" placeholder="Gửi lời chúc tốt đẹp nhất..."></textarea>
          </div>
          <button type="submit" class="w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all"
                  style="background-color: ${primaryColor};">
            Gửi Phản Hồi
          </button>
          <div id="rsvpSuccess" class="hidden text-center text-xs text-green-600 font-semibold pt-2">
            ✓ Đã ghi nhận thông tin phản hồi của bạn. Xin cảm ơn!
          </div>
        </form>
      </div>
    </section>
    ` : ''}

    <!-- Footer -->
    <footer class="py-8 text-center text-xs text-gray-400 border-t border-gray-100">
      <p>${config?.hero?.title || 'Forever & Always'} • Created with Motion Landing Page</p>
    </footer>
  </div>

  <!-- Audio Player Floating -->
  ${config?.music?.enabled && config?.music?.audioUrl ? `
  <div id="musicButton" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black/70 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-2xl cursor-pointer hover:bg-black/80 transition-all">
    <span id="musicIcon" class="text-sm">🎵</span>
    <span class="text-xs font-medium max-w-[120px] truncate">${config?.music?.title || 'Nhạc Nền'}</span>
    <audio id="bgAudio" loop src="${config?.music?.audioUrl}"></audio>
  </div>
  ` : ''}

  <!-- Scripts for offline interactivity & animations -->
  <script>
    const CONFIG = ${safeConfig};

    // Scroll Reveal Observer
    function initScrollReveal() {
      const elements = document.querySelectorAll('.scroll-reveal');
      if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('revealed'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const anim = el.getAttribute('data-anim') || 'fade-up';
            el.classList.add('revealed');
            if (anim !== 'none') {
              el.classList.add('anim-' + anim);
            }
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      elements.forEach(el => observer.observe(el));

      // Fallback reveal after 1 second if observer delayed
      setTimeout(() => {
        elements.forEach(el => el.classList.add('revealed'));
      }, 1000);
    }
    initScrollReveal();

    // Countdown logic
    function initCountdown() {
      const eventDateStr = CONFIG?.hero?.eventDate;
      if (!eventDateStr) return;
      const target = new Date(eventDateStr).getTime();

      function update() {
        const now = new Date().getTime();
        const diff = target - now;
        if (diff <= 0) {
          document.getElementById('countdown')?.classList.add('hidden');
          return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const elD = document.getElementById('cd-days');
        const elH = document.getElementById('cd-hours');
        const elM = document.getElementById('cd-minutes');
        const elS = document.getElementById('cd-seconds');
        if (elD) elD.innerText = String(d).padStart(2, '0');
        if (elH) elH.innerText = String(h).padStart(2, '0');
        if (elM) elM.innerText = String(m).padStart(2, '0');
        if (elS) elS.innerText = String(s).padStart(2, '0');
      }
      update();
      setInterval(update, 1000);
    }
    initCountdown();

    // Canvas Petals / Confetti
    function initCanvas() {
      const canvas = document.getElementById('particleCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let w = (canvas.width = window.innerWidth);
      let h = (canvas.height = window.innerHeight);

      window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      });

      const effect = CONFIG?.theme?.particlesEffect || 'petals';
      const count = effect === 'confetti' ? 45 : 30;
      const particles = [];

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 8 + 4,
          speedY: Math.random() * 1.5 + 0.5,
          speedX: Math.random() * 1 - 0.5,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 2 - 1,
          color: effect === 'confetti' 
            ? ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#fbbf24'][Math.floor(Math.random() * 5)]
            : ['#fecdd3', '#fda4af', '#f43f5e', '#ffe4e6'][Math.floor(Math.random() * 4)]
        });
      }

      function draw() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.65;
          if (effect === 'confetti') {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotationSpeed;

          if (p.y > h + 20) {
            p.y = -20;
            p.x = Math.random() * w;
          }
        });
        requestAnimationFrame(draw);
      }
      draw();
    }
    initCanvas();

    // Audio Player
    const musicBtn = document.getElementById('musicButton');
    const audio = document.getElementById('bgAudio');
    let isPlaying = false;

    if (musicBtn && audio) {
      musicBtn.addEventListener('click', () => {
        if (isPlaying) {
          audio.pause();
          isPlaying = false;
          document.getElementById('musicIcon').innerText = '🔇';
        } else {
          audio.play().then(() => {
            isPlaying = true;
            document.getElementById('musicIcon').innerText = '🎵';
          }).catch(e => console.log('Autoplay prevented:', e));
        }
      });
    }

    // RSVP form handler
    const form = document.getElementById('rsvpForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const successEl = document.getElementById('rsvpSuccess');
        if (successEl) successEl.classList.remove('hidden');
        form.reset();
      });
    }
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${config?.hero?.title ? config.hero.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'standalone-template'}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
