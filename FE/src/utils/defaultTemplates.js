export const DEFAULT_WEDDING_CONFIG = {
  theme: {
    primaryColor: "#e11d48",
    secondaryColor: "#f43f5e",
    accentColor: "#fef08a",
    backgroundColor: "#fff1f2",
    textColor: "#1e293b",
    fontFamily: "Playfair Display",
    stylePreset: "romantic",
    particlesEffect: "petals"
  },
  hero: {
    badge: "SAVE THE DATE",
    title: "Minh & Linh",
    subtitle: "Hân hoan thông báo ngày chung đôi hạnh phúc",
    eventDate: "2026-10-25T18:00:00",
    coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
    callToActionText: "Xác nhận tham dự"
  },
  coupleOrCelebrant: {
    type: "wedding",
    person1: {
      name: "Nguyễn Văn Minh",
      title: "Chú Rể",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
      bio: "Kỹ sư phần mềm, yêu âm nhạc và nhiếp ảnh. Luôn tràn đầy năng lượng tích cực.",
      parents: "Ông Nguyễn Văn A & Bà Trần Thị B"
    },
    person2: {
      name: "Lê Thùy Linh",
      title: "Cô Dâu",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
      bio: "Nhà thiết kế đồ họa, yêu thiên nhiên, thích cắm hoa và nấu những bữa cơm ấm áp.",
      parents: "Ông Lê Văn C & Bà Phạm Thị D"
    },
    storyQuote: "Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng hạnh phúc."
  },
  eventDetails: {
    ceremonyName: "Lễ Thành Hôn & Tiệc Cưới",
    time: "17:30 - Chủ Nhật, 25/10/2026",
    venueName: "Trung tâm Hội nghị Tiệc cưới The Adora Center",
    address: "431 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh",
    mapEmbedUrl: "https://maps.google.com",
    mapDirectLink: "https://maps.google.com",
    dressCode: "Trắng / Pastel / Be thanh lịch"
  },
  timeline: [
    { id: "1", time: "17:00", title: "Đón khách & Chụp ảnh", description: "Chào đón quý quan khách và lưu giữ những bức hình kỷ niệm", icon: "Camera" },
    { id: "2", time: "18:00", title: "Làm lễ Thành hôn", description: "Nghi thức thề nguyện, trao nhẫn và cắt bánh hạnh phúc", icon: "Heart" },
    { id: "3", time: "19:00", title: "Khai tiệc mừng", description: "Nâng ly chúc mừng và thưởng thức dạ tiệc ấm cúng", icon: "Utensils" },
    { id: "4", time: "20:30", title: "Âm nhạc & Khiêu vũ", description: "Giao lưu văn nghệ và tung hoa cưới may mắn", icon: "Music" }
  ],
  gallery: [
    { id: "1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", caption: "Khoảnh khắc hẹn thề" },
    { id: "2", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80", caption: "Nụ cười rạng rỡ ngày chung đôi" },
    { id: "3", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80", caption: "Nắm tay qua năm tháng" },
    { id: "4", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80", caption: "Nguyện ước trăm năm" }
  ],
  rsvp: {
    enabled: true,
    deadline: "2026-10-15",
    note: "Sự hiện diện của quý vị là niềm vinh hạnh to lớn cho gia đình chúng mình!",
    allowDietaryNotes: true,
    allowPlusOnes: true
  },
  music: {
    enabled: true,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    title: "A Thousand Years - Instrumental Piano",
    autoPlay: true
  },
  wishes: {
    enabled: true,
    title: "Sổ Lưu Bút & Lời Chúc Mừng",
    subtitle: "Hãy để lại những lời chúc yêu thương nhất cho đôi tân lang tân nương"
  }
};

export const DEFAULT_BIRTHDAY_CONFIG = {
  theme: {
    primaryColor: "#d97706",
    secondaryColor: "#f59e0b",
    accentColor: "#fde68a",
    backgroundColor: "#0f172a",
    textColor: "#f8fafc",
    fontFamily: "Cinzel",
    stylePreset: "luxury",
    particlesEffect: "confetti"
  },
  hero: {
    badge: "HAPPY 30TH BIRTHDAY",
    title: "Hoàng Nam",
    subtitle: "Đêm tiệc kỷ niệm cột mốc tuổi 30 đáng nhớ và rực rỡ",
    eventDate: "2026-11-12T19:00:00",
    coverImageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&q=80",
    callToActionText: "Đăng ký tham dự"
  },
  coupleOrCelebrant: {
    type: "birthday",
    person1: {
      name: "Trần Hoàng Nam",
      title: "Chủ Nhân Buổi Tiệc",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
      bio: "Tech Founder & Creator, chào đón tuổi 30 thăng hoa cùng những người bạn trân quý nhất.",
      parents: "Gia đình họ Trần"
    },
    storyQuote: "Tuổi 30 không phải là già đi, mà là bắt đầu chương huy hoàng nhất của cuộc đời!"
  },
  eventDetails: {
    ceremonyName: "Gala Dinner & Rooftop Night Party",
    time: "18:30 - Thứ Bảy, 12/11/2026",
    venueName: "Sky Lounge 36 Rooftop",
    address: "Tầng 36, Tòa nhà Landmark, Quận 1, TP. Hồ Chí Minh",
    mapEmbedUrl: "https://maps.google.com",
    mapDirectLink: "https://maps.google.com",
    dressCode: "Black Tie / Ánh Kim Sang Trọng"
  },
  timeline: [
    { id: "1", time: "18:30", title: "Check-in & Welcome Cocktail", description: "Đón khách và thưởng thức ly cocktail signature", icon: "GlassWater" },
    { id: "2", time: "19:30", title: "Thổi nến & Khai tiệc", description: "Nghi thức thổi nến chúc mừng tuổi mới bùng nổ", icon: "Cake" },
    { id: "3", time: "20:30", title: "DJ Live Set & Chill Night", description: "Âm nhạc sôi động và nâng ly thâu đêm", icon: "Music" }
  ],
  gallery: [
    { id: "1", url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80", caption: "Ánh sáng lễ hội lung linh" },
    { id: "2", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", caption: "Khoảnh khắc tiệc tùng đáng nhớ" },
    { id: "3", url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80", caption: "Nâng ly cùng bạn bè" }
  ],
  rsvp: {
    enabled: true,
    deadline: "2026-11-05",
    note: "Vui lòng xác nhận trước 05/11 để ban tổ chức sắp xếp chỗ ngồi chu đáo nhất!",
    allowDietaryNotes: false,
    allowPlusOnes: true
  },
  music: {
    enabled: true,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
    title: "Celebration Night - Acoustic Vibe",
    autoPlay: false
  },
  wishes: {
    enabled: true,
    title: "Sổ Lưu Bút & Chúc Mừng Tuổi Mới",
    subtitle: "Gửi những lời chúc mừng sinh nhật ý nghĩa nhất đến Hoàng Nam"
  }
};

export const getDefaultConfigByCategory = (category = 'Wedding') => {
  if (category?.toLowerCase() === 'birthday') {
    return JSON.parse(JSON.stringify(DEFAULT_BIRTHDAY_CONFIG));
  }
  return JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG));
};
