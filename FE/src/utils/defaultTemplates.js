// Format 1: Thiệp Cưới & Đính Hôn Lãng Mạn (Motion Romance)
export const DEFAULT_WEDDING_CONFIG = {
  format: "wedding",
  theme: {
    primaryColor: "#e11d48",
    secondaryColor: "#f43f5e",
    accentColor: "#fef08a",
    backgroundColor: "#fff1f2",
    textColor: "#1e293b",
    fontFamily: "Playfair Display",
    stylePreset: "romantic",
    particlesEffect: "petals",
    defaultAnimation: "fade-up",
  },
  hero: {
    badge: "SAVE THE DATE",
    title: "Minh & Linh",
    subtitle: "Hân hoan thông báo ngày chung đôi hạnh phúc",
    eventDate: "2026-10-25T18:00:00",
    coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
    callToActionText: "Xác nhận tham dự",
    animation: "fade-up",
  },
  coupleOrCelebrant: {
    type: "wedding",
    animation: "fade-up",
    storyQuote: "Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng hạnh phúc.",
    person1: {
      name: "Nguyễn Văn Minh",
      title: "Chú Rể",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
      bio: "Kỹ sư phần mềm, yêu âm nhạc và nhiếp ảnh. Luôn tràn đầy năng lượng tích cực.",
      parents: "Ông Nguyễn Văn A & Bà Trần Thị B",
      animation: "fade-right",
    },
    person2: {
      name: "Lê Thùy Linh",
      title: "Cô Dâu",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
      bio: "Nhà thiết kế đồ họa, yêu thiên nhiên, thích cắm hoa và nấu những bữa cơm ấm áp.",
      parents: "Ông Lê Văn C & Bà Phạm Thị D",
      animation: "fade-left",
    },
  },
  eventDetails: {
    ceremonyName: "Lễ Thành Hôn & Tiệc Cưới",
    time: "17:30 - Chủ Nhật, 25/10/2026",
    venueName: "Trung tâm Hội nghị Tiệc cưới The Adora Center",
    address: "431 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh",
    mapEmbedUrl: "https://maps.google.com",
    mapDirectLink: "https://maps.google.com",
    dressCode: "Trắng / Pastel / Be thanh lịch",
    animation: "fade-up",
  },
  timeline: [
    { id: "1", time: "17:00", title: "Đón khách & Chụp ảnh", description: "Chào đón quý quan khách và lưu giữ những bức hình kỷ niệm", icon: "Camera", animation: "fade-up" },
    { id: "2", time: "18:00", title: "Làm lễ Thành hôn", description: "Nghi thức thề nguyện, trao nhẫn và cắt bánh hạnh phúc", icon: "Heart", animation: "fade-up" },
    { id: "3", time: "19:00", title: "Khai tiệc mừng", description: "Nâng ly chúc mừng và thưởng thức dạ tiệc ấm cúng", icon: "Utensils", animation: "fade-up" },
    { id: "4", time: "20:30", title: "Âm nhạc & Khiêu vũ", description: "Giao lưu văn nghệ và tung hoa cưới may mắn", icon: "Music", animation: "fade-up" },
  ],
  gallery: [
    { id: "1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", caption: "Khoảnh khắc hẹn thề", animation: "zoom-in" },
    { id: "2", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80", caption: "Nụ cười rạng rỡ ngày chung đôi", animation: "zoom-in" },
    { id: "3", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80", caption: "Nắm tay qua năm tháng", animation: "zoom-in" },
    { id: "4", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80", caption: "Nguyện ước trăm năm", animation: "zoom-in" },
  ],
  rsvp: {
    enabled: true,
    deadline: "2026-10-15",
    note: "Sự hiện diện của quý vị là niềm vinh hạnh to lớn cho gia đình chúng mình!",
    allowDietaryNotes: true,
    allowPlusOnes: true,
    animation: "fade-up",
  },
  music: {
    enabled: true,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    title: "A Thousand Years - Instrumental Piano",
    autoPlay: true,
  },
  wishes: {
    enabled: true,
    title: "Sổ Lưu Bút & Lời Chúc Mừng",
    subtitle: "Hãy để lại những lời chúc yêu thương nhất cho đôi tân lang tân nương",
    animation: "fade-up",
  },
  extraSections: [
    {
      id: "extra-wedding-1",
      type: "thankYou",
      enabled: true,
      title: "Lời Cảm Ơn Chân Thành",
      subtitle: "Từ tận đáy lòng của chúng mình",
      content: "Cảm ơn gia đình, bạn bè và những người thương yêu đã luôn đồng hành, chia sẻ và gửi những lời chúc phúc ấm áp nhất đến chúng mình trong ngày trọng đại này.",
      imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      animation: "fade-up",
    },
    {
      id: "extra-wedding-2",
      type: "giftQr",
      enabled: true,
      title: "Hộp Mừng Cưới & Gửi Quà Chúc Phúc",
      subtitle: "Dành cho những người bạn ở xa muốn gửi lời chúc phúc",
      qrBank: {
        bankName: "MB",
        accountNumber: "0987654321",
        accountHolder: "NGUYEN VAN MINH",
        qrImageUrl: "",
      },
      animation: "zoom-in",
    },
    {
      id: "extra-wedding-3",
      type: "qa",
      enabled: true,
      title: "Câu Hỏi Thường Gặp (Q&A)",
      subtitle: "Một số thông tin giúp bạn có trải nghiệm trọn vẹn nhất",
      items: [
        { question: "Địa điểm có bãi giữ xe ô tô không?", answer: "Có, The Adora Center có hầm giữ xe ô tô và xe máy rộng rãi, bảo vệ chu đáo và hoàn toàn miễn phí." },
        { question: "Thời gian đón khách bắt đầu từ lúc nào?", answer: "Sảnh tiệc bắt đầu đón khách từ 17:30 và nghi lễ chính thức diễn ra lúc 18:30." },
      ],
      animation: "fade-up",
    },
  ],
};

// Format 2: Hội Nghị Công Nghệ & AI (Virtual AI Summit 2026)
export const DEFAULT_AI_SUMMIT_CONFIG = {
  format: "summit",
  theme: {
    primaryColor: "#2563eb",
    secondaryColor: "#3b82f6",
    accentColor: "#60a5fa",
    backgroundColor: "#090d16",
    textColor: "#f8fafc",
    fontFamily: "Inter",
    stylePreset: "modern",
    particlesEffect: "snow",
    defaultAnimation: "fade-up",
  },
  hero: {
    badge: "GLOBAL VIRTUAL SUMMIT 2026",
    title: "Generative AI & Future Intelligence",
    subtitle: "Hội nghị cấp cao quy tụ 50+ chuyên gia và nhà nghiên cứu AI hàng đầu thế giới thảo luận về tương lai của Autonomous Agents.",
    eventDate: "2026-11-20T09:00:00",
    coverImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
    callToActionText: "Đăng Ký Nhận Vé Ngay",
    animation: "fade-up",
  },
  speakers: [
    {
      id: "spk-1",
      name: "Dr. Elena Rostova",
      role: "Chief AI Scientist",
      company: "DeepNexus Labs",
      bio: "Tiên phong trong kiến trúc Large Reasoning Models và hệ thống Multi-Agent tự hành thế hệ mới.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    },
    {
      id: "spk-2",
      name: "Marcus Vance",
      role: "VP of Engineering",
      company: "Synthetix AI",
      bio: "Kiến trúc sư hạ tầng phân tán xử lý mô hình 100 tỷ tham số với độ trễ siêu thấp dưới 10ms.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    },
    {
      id: "spk-3",
      name: "Sarah Chen",
      role: "Director of AI Ethics & Safety",
      company: "Frontier Foundation",
      bio: "Chủ trì các sáng kiến an toàn trí tuệ nhân tạo và kiểm định mô hình nhận thức tự động toàn cầu.",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
    },
  ],
  pricingTickets: [
    {
      id: "standard-pass",
      name: "Standard Pass",
      price: "1.490.000 đ",
      originalPrice: "2.500.000 đ",
      badge: "EARLY BIRD",
      description: "Truy cập toàn bộ livestream các phiên thảo luận chung và kho video playback.",
      perks: [
        "Truy cập 3 ngày sự kiện livestream trực tiếp",
        "Bộ slide bài thuyết trình từ diễn giả",
        "Chứng nhận tham dự số NFT",
      ],
      ctaText: "Đặt Vé Standard",
    },
    {
      id: "vip-pass",
      name: "VIP Executive Pass",
      price: "4.990.000 đ",
      originalPrice: "7.000.000 đ",
      badge: "POPULAR",
      description: "Quyền lợi cao cấp nhất với phòng thảo luận kín cùng diễn giả và tiệc Networking.",
      perks: [
        "Tất cả quyền lợi của hạng vé Standard",
        "Tham dự phòng hỏi đáp chuyên sâu cùng diễn giả",
        "Tặng 1 năm tài khoản Pro đối tác AI Platform",
        "Vé mời tiệc Networking Dinner tại Metropole",
      ],
      ctaText: "Đặt Vé VIP Executive",
    },
  ],
  timeline: [
    { id: "1", time: "09:00", title: "Khai mạc & Keynote: The Dawn of System-3 AI", description: "Diễn giả Dr. Elena Rostova mở màn về đột phá mô hình suy luận", icon: "Mic", animation: "fade-up" },
    { id: "2", time: "11:00", title: "Panel: Scaling Autonomous Agents in Enterprise", description: "Bàn tròn thảo luận triển khai AI trong khối tài chính và bán lẻ", icon: "Users", animation: "fade-up" },
    { id: "3", time: "14:00", title: "Workshop: Building Local LLM Pipelines", description: "Thực hành triển khai mô hình mã nguồn mở trên hạ tầng on-premise", icon: "Cpu", animation: "fade-up" },
  ],
  rsvp: {
    enabled: true,
    deadline: "2026-11-10",
    note: "Vui lòng xác nhận thông tin đăng ký để ban tổ chức gửi mã vé điện tử QR Code.",
    allowDietaryNotes: false,
    allowPlusOnes: false,
    animation: "fade-up",
  },
  extraSections: [
    {
      id: "summit-qa",
      type: "qa",
      enabled: true,
      title: "Hỏi Đáp Về Sự Kiện (FAQ)",
      subtitle: "Giải đáp mọi thắc mắc trước khi bạn tham gia",
      items: [
        { question: "Tôi có thể xem lại video sau sự kiện không?", answer: "Có, toàn bộ video các phiên thuyết trình sẽ được lưu trữ và cấp quyền xem lại trọn đời cho chủ vé." },
        { question: "Hóa đơn VAT có được cung cấp không?", answer: "Ban tổ chức hỗ trợ xuất hóa đơn điện tử cho doanh nghiệp ngay sau khi thanh toán." },
      ],
      animation: "fade-up",
    },
  ],
};

// Format 3: Ứng Dụng Quản Lý Năng Suất (Drift ADHD-Friendly Planner)
export const DEFAULT_DRIFT_PLANNER_CONFIG = {
  format: "app-showcase",
  theme: {
    primaryColor: "#10b981",
    secondaryColor: "#059669",
    accentColor: "#34d399",
    backgroundColor: "#0f172a",
    textColor: "#f8fafc",
    fontFamily: "Inter",
    stylePreset: "modern",
    particlesEffect: "snow",
    defaultAnimation: "fade-up",
  },
  hero: {
    badge: "ADHD-FRIENDLY WORKSPACE",
    title: "Drift — Năng Suất Nhẹ Nhàng Cho Não Bộ Của Bạn",
    subtitle: "Biến những danh sách công việc ngột ngạt thành các dòng sông thời gian êm dịu, loại bỏ cảm giác tội lỗi và khơi dậy cảm hứng làm việc tự nhiên.",
    videoUrl: "https://cdn.pixabay.com/video/demo-preview.mp4",
    coverImageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1600&q=80",
    callToActionText: "Dùng Thử Miễn Phí 14 Ngày",
    animation: "fade-up",
  },
  featureCardsGrid: [
    {
      id: "f-1",
      title: "Time-Blocking Trực Quan",
      description: "Thay vì áp đặt lịch cứng nhắc, Drift tạo ra các khối năng lượng linh hoạt giúp bạn dễ dàng thích nghi khi tâm trạng biến đổi.",
    },
    {
      id: "f-2",
      title: "Âm Thanh Tập Trung Song Nhĩ",
      description: "Tích hợp sẵn tần số sóng não 40Hz kích thích dopamin tự nhiên, đưa bạn vào trạng thái deep work chỉ trong 3 phút.",
    },
    {
      id: "f-3",
      title: "Tự Động Rã Nhỏ Nhiệm Vụ",
      description: "Trợ lý AI tự động phân rã một dự án phức tạp thành các hành động 5 phút dễ như ăn kẹo, đập tan bức tường trì hoãn.",
    },
  ],
  metrics: [
    { value: "50,000+", label: "Người dùng ADHD phục hồi năng lượng" },
    { value: "4.9/5", label: "Đánh giá xuất sắc trên App Store" },
    { value: "40%", label: "Giảm áp lực trì hoãn hàng ngày" },
    { value: "14 Ngày", label: "Dùng thử đầy đủ tính năng miễn phí" },
  ],
  rsvp: {
    enabled: true,
    deadline: "2026-12-31",
    note: "Đăng ký nhận mã kích hoạt sớm dành cho cộng đồng Neurodivergent.",
    allowDietaryNotes: false,
    allowPlusOnes: false,
    animation: "fade-up",
  },
};

// Format 4: Phòng Khám Nha Khoa Cao Cấp (SmileCraft Dental Clinic)
export const DEFAULT_DENTAL_CLINIC_CONFIG = {
  format: "dental-services",
  theme: {
    primaryColor: "#0ea5e9",
    secondaryColor: "#0284c7",
    accentColor: "#7dd3fc",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    fontFamily: "Inter",
    stylePreset: "modern",
    particlesEffect: "snow",
    defaultAnimation: "fade-up",
  },
  hero: {
    badge: "TIÊU CHUẨN NHA KHOA THỤY SỸ",
    title: "Kiến Tạo Nụ Cười Hoàn Hảo & Tự Tin",
    subtitle: "Phòng khám chuẩn Châu Âu với công nghệ Scan 3D không xâm lấn, bảo tồn răng thật tối đa cùng bảo hành trọn đời.",
    coverImageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&q=80",
    callToActionText: "Đặt Hẹn Khám Ngay",
    animation: "fade-up",
  },
  servicesGrid: [
    {
      id: "veneers",
      name: "Veneers Sứ Siêu Mỏng",
      description: "Bảo tồn 100% tủy và răng thật, độ trong bóng tự nhiên như ngọc trai, không mài nhỏ răng.",
      priceFrom: "6.000.000 đ/răng",
    },
    {
      id: "crowns",
      name: "Bọc Răng Sứ Thẩm Mỹ",
      description: "Khắc phục triệt để răng ố vàng nặng, răng mẻ gãy, chịu lực gấp 5 lần răng tự nhiên.",
      priceFrom: "4.500.000 đ/răng",
    },
    {
      id: "whitening",
      name: "Tẩy Trắng Laser Extra-White",
      description: "Nâng 3-5 tone màu trắng sáng ngay sau 45 phút, an toàn tuyệt đối cho men răng nhạy cảm.",
      priceFrom: "2.500.000 đ",
    },
    {
      id: "implants",
      name: "Cấy Ghép Implant Kỹ Thuật Số",
      description: "Trồng răng trọn gói, tích hợp xương sinh học vĩnh viễn không đau, phục hồi chức năng ăn nhai 100%.",
      priceFrom: "15.000.000 đ/trụ",
    },
  ],
  treatmentProcess: [
    { step: "01", title: "Thăm khám & Chụp CT 3D ConeBeam", desc: "Đánh giá chính xác cấu trúc hàm mặt và viền nướu bằng máy quét thế hệ mới." },
    { step: "02", title: "Mô phỏng Nụ Cười DSD", desc: "Xem trước kết quả thẩm mỹ trên màn hình 3D tương tác trước khi can thiệp." },
    { step: "03", title: "Điều trị nhẹ nhàng & Không đau", desc: "Đội ngũ bác sĩ trên 15 năm kinh nghiệm thực hiện trong phòng mổ vô trùng." },
    { step: "04", title: "Bảo hành & Chăm sóc trọn đời", desc: "Cấp thẻ bảo hành điện tử chính hãng toàn cầu và tái khám định kỳ miễn phí." },
  ],
  booking: {
    enabled: true,
    title: "Đặt Lịch Hẹn Tư Vấn Miễn Phí",
  },
  rsvp: {
    enabled: false,
  },
};

// Format 5: Nền Tảng Công Nghệ SaaS (CloudFlow Modern SaaS)
export const DEFAULT_MODERN_SAAS_CONFIG = {
  format: "saas",
  theme: {
    primaryColor: "#6366f1",
    secondaryColor: "#4f46e5",
    accentColor: "#818cf8",
    backgroundColor: "#0b0f19",
    textColor: "#f8fafc",
    fontFamily: "Inter",
    stylePreset: "modern",
    particlesEffect: "snow",
    defaultAnimation: "fade-up",
  },
  hero: {
    badge: "ENTERPRISE WORKFLOW AUTOMATION",
    title: "Nền Tảng Tự Động Hóa Dòng Chảy Dữ Liệu Doanh Nghiệp",
    subtitle: "Kết nối mọi hệ thống API, xử lý 10 triệu events/giây với độ trễ dưới 5ms và độ sẵn sàng 99.99%.",
    coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80",
    callToActionText: "Bắt Đầu Dùng Thử Miễn Phí",
    animation: "fade-up",
  },
  featureCardsGrid: [
    { title: "API-First Architecture", description: "Tích hợp mượt mà với GraphQL, REST và Webhooks bảo mật đa tầng." },
    { title: "Realtime Stream Engine", description: "Phân tích dòng dữ liệu theo thời gian thực không độ trễ nghẽn cổ chai." },
    { title: "Multi-Tenant Security", description: "Mã hóa AES-256 từ đầu cuối đến cơ sở dữ liệu tuân chuẩn SOC2 và HIPAA." },
    { title: "Automated CI/CD Workflows", description: "Tự động triển khai và rollback an toàn chỉ với một cú nhấp chuột." },
    { title: "Global Edge Network", description: "Mạng lưới máy chủ phân tán 320 điểm trên toàn cầu, phản hồi dưới 10ms." },
    { title: "Smart Cost Optimization", description: "Tự động co giãn tài nguyên đám mây thông minh, tiết kiệm tới 40% chi phí." },
  ],
  pricingPackages: [
    {
      id: "starter",
      name: "Starter",
      price: "$49",
      billingPeriod: "tháng",
      description: "Dành cho các startup và nhóm nhỏ muốn tự động hóa dữ liệu cơ bản.",
      perks: ["100,000 events/tháng", "5 Pipeline tự động", "Email support 24/7"],
      ctaText: "Chọn Gói Starter",
    },
    {
      id: "business",
      name: "Business Pro",
      price: "$199",
      billingPeriod: "tháng",
      badge: "POPULAR",
      description: "Dành cho doanh nghiệp tăng trưởng nhanh với khối lượng dữ liệu lớn.",
      perks: ["5,000,000 events/tháng", "Không giới hạn Pipeline", "Hỗ trợ Slack riêng & SLA 99.9%"],
      ctaText: "Chọn Gói Business Pro",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Liên hệ",
      description: "Hạ tầng dành riêng, hỗ trợ compliance khắt khe và kỹ sư trưởng đồng hành.",
      perks: ["Không giới hạn sự kiện", "Triển khai Dedicated On-Premise", "Kỹ sư kiến trúc hỗ trợ 1-1"],
      ctaText: "Liên Hệ Kinh Doanh",
    },
  ],
  metrics: [
    { value: "10M+", label: "Events xử lý mỗi giây" },
    { value: "99.99%", label: "Uptime cam kết theo SLA" },
    { value: "<5ms", label: "Độ trễ xử lý trung bình" },
    { value: "500+", label: "Doanh nghiệp tin cậy" },
  ],
  rsvp: {
    enabled: true,
    deadline: "2026-12-31",
    note: "Đăng ký nhận tư vấn kiến trúc giải pháp chuyên sâu từ chuyên gia CloudFlow.",
    allowDietaryNotes: false,
    allowPlusOnes: false,
    animation: "fade-up",
  },
};

// Format 6: Tiệc Sinh Nhật & Sự Kiện Vui Nhộn (WonderKids Party Celebration)
export const DEFAULT_KIDS_PARTY_CONFIG = {
  format: "kids-birthday",
  theme: {
    primaryColor: "#ec4899",
    secondaryColor: "#f59e0b",
    accentColor: "#fde68a",
    backgroundColor: "#fffbeb",
    textColor: "#1e293b",
    fontFamily: "Playfair Display",
    stylePreset: "playful",
    particlesEffect: "confetti",
    defaultAnimation: "zoom-in",
  },
  hero: {
    badge: "WONDERLAND BIRTHDAY 5TH",
    title: "Sinh Nhật Xứ Sở Thần Tiên Của Bé Mia",
    subtitle: "Cùng hòa mình vào bữa tiệc sắc màu, bong bóng khổng lồ và thế giới ảo thuật kỳ thú!",
    eventDate: "2026-11-15T16:00:00",
    coverImageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80",
    callToActionText: "Đăng Ký Dự Tiệc Cùng Bé",
    animation: "zoom-in",
  },
  coupleOrCelebrant: {
    type: "birthday",
    animation: "zoom-in",
    storyQuote: "Tuổi lên 5 rực rỡ với muôn vàn nụ cười và những giấc mơ ngọt ngào!",
    person1: {
      name: "Bé Mia (Nguyễn Hoàng Kim)",
      title: "Công Chúa Nhỏ 5 Tuổi",
      avatarUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80",
      bio: "Thích vẽ tranh, thích xem phim hoạt hình Elsa và ăn kem dâu tây.",
      parents: "Bố Nam & Mẹ Hương",
      animation: "zoom-in",
    },
  },
  eventDetails: {
    ceremonyName: "Đại Tiệc Sinh Nhật WonderKids",
    time: "16:00 - Chủ Nhật, 15/11/2026",
    venueName: "Khu vui chơi Wonderland Kidzone",
    address: "Tầng 4, TTTM Vincom Center, Quận 1, TP. Hồ Chí Minh",
    mapEmbedUrl: "https://maps.google.com",
    mapDirectLink: "https://maps.google.com",
    dressCode: "Hồng Pastel / Vàng Nhạt / Trắng",
    animation: "fade-up",
  },
  timeline: [
    { id: "1", time: "16:00", title: "Đón bé & Vẽ mặt hóa trang", description: "Bé được hóa thân thành các nhân vật cổ tích yêu thích", icon: "Sparkles", animation: "fade-up" },
    { id: "2", time: "17:00", title: "Show Ảo thuật & Chú hề bóng bay", description: "Những màn trình diễn bất ngờ và các món quà bóng bay nghệ thuật", icon: "Gift", animation: "fade-up" },
    { id: "3", time: "18:00", title: "Đập kẹo Piñata khổng lồ", description: "Trò chơi sôi động cùng cơn mưa kẹo ngọt ngào", icon: "Cake", animation: "bounce" },
    { id: "4", time: "18:30", title: "Thổi nến bánh kem lâu đài 3 tầng", description: "Cùng hát chúc mừng sinh nhật và ước nguyện tuổi lên 5", icon: "Heart", animation: "fade-up" },
  ],
  gallery: [
    { id: "1", url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80", caption: "Bong bóng sắc màu", animation: "zoom-in" },
    { id: "2", url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80", caption: "Bánh sinh nhật ngọt ngào", animation: "zoom-in" },
  ],
  rsvp: {
    enabled: true,
    deadline: "2026-11-08",
    note: "Ba mẹ vui lòng xác nhận số lượng bé đi kèm để công viên chuẩn bị quà và bánh nhé!",
    allowDietaryNotes: true,
    allowPlusOnes: true,
    animation: "fade-up",
  },
  extraSections: [
    {
      id: "kids-wishlist",
      type: "thankYou",
      enabled: true,
      title: "Món Quà Bé Yêu Thích",
      subtitle: "Gợi ý nhỏ cho các cô chú",
      content: "Bé Mia rất thích đồ chơi xếp hình Lego và màu sáp vẽ tranh. Sự hiện diện của mọi người là niềm vui lớn nhất của gia đình!",
      animation: "fade-up",
    },
  ],
};

// Backward-compatibility: Traditional 30th Birthday Config
export const DEFAULT_BIRTHDAY_CONFIG = {
  theme: {
    primaryColor: "#d97706",
    secondaryColor: "#f59e0b",
    accentColor: "#fde68a",
    backgroundColor: "#0f172a",
    textColor: "#f8fafc",
    fontFamily: "Cinzel",
    stylePreset: "luxury",
    particlesEffect: "confetti",
    defaultAnimation: "zoom-in",
  },
  hero: {
    badge: "HAPPY 30TH BIRTHDAY",
    title: "Hoàng Nam",
    subtitle: "Đêm tiệc kỷ niệm cột mốc tuổi 30 đáng nhớ và rực rỡ",
    eventDate: "2026-11-12T19:00:00",
    coverImageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&q=80",
    callToActionText: "Đăng ký tham dự",
    animation: "zoom-in",
  },
  coupleOrCelebrant: {
    type: "birthday",
    animation: "fade-up",
    storyQuote: "Tuổi 30 không phải là già đi, mà là bắt đầu chương huy hoàng nhất của cuộc đời!",
    person1: {
      name: "Trần Hoàng Nam",
      title: "Chủ Nhân Buổi Tiệc",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
      bio: "Tech Founder & Creator, chào đón tuổi 30 thăng hoa cùng những người bạn trân quý nhất.",
      parents: "Gia đình họ Trần",
      animation: "zoom-in",
    },
  },
  eventDetails: {
    ceremonyName: "Gala Dinner & Rooftop Night Party",
    time: "18:30 - Thứ Bảy, 12/11/2026",
    venueName: "Sky Lounge 36 Rooftop",
    address: "Tầng 36, Tòa nhà Landmark, Quận 1, TP. Hồ Chí Minh",
    mapEmbedUrl: "https://maps.google.com",
    mapDirectLink: "https://maps.google.com",
    dressCode: "Black Tie / Ánh Kim Sang Trọng",
    animation: "fade-up",
  },
  timeline: [
    { id: "1", time: "18:30", title: "Check-in & Welcome Cocktail", description: "Đón khách và thưởng thức ly cocktail signature", icon: "GlassWater", animation: "fade-up" },
    { id: "2", time: "19:30", title: "Thổi nến & Khai tiệc", description: "Nghi thức thổi nến chúc mừng tuổi mới bùng nổ", icon: "Cake", animation: "bounce" },
    { id: "3", time: "20:30", title: "DJ Live Set & Chill Night", description: "Âm nhạc sôi động và nâng ly thâu đêm", icon: "Music", animation: "fade-up" },
  ],
  gallery: [
    { id: "1", url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80", caption: "Ánh sáng lễ hội lung linh", animation: "zoom-in" },
    { id: "2", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", caption: "Khoảnh khắc tiệc tùng đáng nhớ", animation: "zoom-in" },
    { id: "3", url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80", caption: "Nâng ly cùng bạn bè", animation: "zoom-in" },
  ],
  rsvp: {
    enabled: true,
    deadline: "2026-11-05",
    note: "Vui lòng xác nhận trước 05/11 để ban tổ chức sắp xếp chỗ ngồi chu đáo nhất!",
    allowDietaryNotes: false,
    allowPlusOnes: true,
    animation: "fade-up",
  },
  music: {
    enabled: true,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
    title: "Celebration Night - Acoustic Vibe",
    autoPlay: false,
  },
  wishes: {
    enabled: true,
    title: "Sổ Lưu Bút & Chúc Mừng Tuổi Mới",
    subtitle: "Gửi những lời chúc mừng sinh nhật ý nghĩa nhất đến Hoàng Nam",
    animation: "fade-up",
  },
  extraSections: [
    {
      id: "extra-birthday-1",
      type: "thankYou",
      enabled: true,
      title: "Lời Cảm Ơn",
      subtitle: "Gửi đến những người bạn thân thương",
      content: "Cảm ơn tất cả mọi người đã bớt chút thời gian quý báu để cùng Nam đón mừng tuổi mới. Sự hiện diện của các bạn là món quà vô giá nhất!",
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      animation: "fade-up",
    },
    {
      id: "extra-birthday-2",
      type: "giftQr",
      enabled: true,
      title: "Quà Tặng Sinh Nhật (VietQR)",
      subtitle: "Gửi quà mừng tinh thần & tình cảm từ phương xa",
      qrBank: {
        bankName: "Techcombank",
        accountNumber: "1903668899",
        accountHolder: "TRAN HOANG NAM",
        qrImageUrl: "",
      },
      animation: "zoom-in",
    },
    {
      id: "extra-birthday-3",
      type: "qa",
      enabled: true,
      title: "Thông Tin Buổi Tiệc (Q&A)",
      subtitle: "Một vài lưu ý nhỏ cho đêm tiệc quẩy hết mình",
      items: [
        { question: "Dress Code của buổi tiệc là gì?", answer: "Trang phục thanh lịch tông màu Đen / Ánh kim (Black Tie / Metallic Glamour)." },
        { question: "Có thể dẫn theo bạn bè (+1) không?", answer: "Bạn hoàn toàn có thể dẫn thêm 1 người bạn đi cùng, vui lòng chọn số lượng khi RSVP nhé!" },
      ],
      animation: "fade-up",
    },
  ],
};

/**
 * Ánh xạ category hoặc format type sang default configuration tương ứng
 * Hỗ trợ 6 định dạng phong phú:
 * 1. Wedding / Romance
 * 2. AI Summit / Conference
 * 3. ADHD Planner / App Showcase
 * 4. Dental & Medical Clinic
 * 5. Modern Cloud SaaS
 * 6. Kids Birthday & Celebration
 */
export const getDefaultConfigByCategory = (category = 'Wedding') => {
  const cat = category?.toLowerCase() || '';

  if (cat === 'conference' || cat === 'summit' || cat.includes('summit') || cat.includes('ai') || cat === 'education' || cat.includes('edu')) {
    return JSON.parse(JSON.stringify(DEFAULT_AI_SUMMIT_CONFIG));
  }
  if (cat === 'app-showcase' || cat === 'planner' || cat.includes('drift') || cat.includes('adhd') || cat === 'real-estate') {
    return JSON.parse(JSON.stringify(DEFAULT_DRIFT_PLANNER_CONFIG));
  }
  if (cat === 'medical' || cat === 'dental' || cat.includes('dental') || cat.includes('clinic') || cat === 'restaurant') {
    return JSON.parse(JSON.stringify(DEFAULT_DENTAL_CLINIC_CONFIG));
  }
  if (cat === 'saas' || cat.includes('saas') || cat.includes('cloud') || cat === 'fitness') {
    return JSON.parse(JSON.stringify(DEFAULT_MODERN_SAAS_CONFIG));
  }
  if (cat === 'kids-birthday' || cat.includes('kid') || cat.includes('baby-shower') || cat.includes('baby') || cat === 'housewarming' || cat === 'art-craft') {
    return JSON.parse(JSON.stringify(DEFAULT_KIDS_PARTY_CONFIG));
  }
  if (cat === 'birthday') {
    return JSON.parse(JSON.stringify(DEFAULT_BIRTHDAY_CONFIG));
  }

  return JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG));
};
