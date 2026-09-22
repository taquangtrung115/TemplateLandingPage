namespace TemplateLandingPage.Persistence.Data;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Domain.Entities;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        if (context.Database.IsRelational())
        {
            await context.Database.MigrateAsync();
        }
        else
        {
            await context.Database.EnsureCreatedAsync();
        }

        // 1. Seed Users
        User adminUser;
        User normalUser;

        if (!await context.Users.AnyAsync())
        {
            adminUser = User.Create(
                "admin@template.com",
                passwordHasher.HashPassword("Admin@123456"),
                "Quản Trị Viên",
                "Admin");

            normalUser = User.Create(
                "user@template.com",
                passwordHasher.HashPassword("User@123456"),
                "Người Dùng Mẫu",
                "User");

            var minhLinhUser = User.Create(
                "minhlinh@template.com",
                passwordHasher.HashPassword("User@123456"),
                "Nguyễn Văn Minh",
                "User");

            context.Users.AddRange(adminUser, normalUser, minhLinhUser);
            await context.SaveChangesAsync();
        }
        else
        {
            adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@template.com")
                ?? await context.Users.FirstAsync();
            normalUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "user@template.com")
                ?? adminUser;
        }

        // 2. Seed 15 Standard Categories Idempotent (Wedding & Diverse Formats)
        var allCategories = new[]
        {
            new { Name = "Thiệp Cưới", Slug = "wedding", Description = "Mẫu thiệp cưới online lãng mạn, hiện đại tích hợp album ảnh, âm nhạc và xác nhận RSVP.", Icon = "Heart", OrderIndex = 1 },
            new { Name = "Lễ Đính Hôn", Slug = "engagement", Description = "Thiệp lễ ăn hỏi, đính hôn phong cách thanh lịch truyền thống kết hợp hiện đại.", Icon = "Ring", OrderIndex = 2 },
            new { Name = "Sinh Nhật", Slug = "birthday", Description = "Mẫu thiệp sinh nhật dạ tiệc sôi động, pháo hoa giấy và âm thanh lôi cuốn.", Icon = "Cake", OrderIndex = 3 },
            new { Name = "Kỷ Niệm Ngày Cưới", Slug = "anniversary", Description = "Ôn lại chặng đường tình yêu ngọt ngào với thiệp kỷ niệm ngày chung đôi.", Icon = "Sparkles", OrderIndex = 4 },
            new { Name = "Thôi Nôi & Đầy Tháng", Slug = "baby-shower", Description = "Chào đón thiên thần nhỏ với những thiết kế dễ thương, ấm áp.", Icon = "Baby", OrderIndex = 5 },
            new { Name = "Hội Nghị & Sự Kiện", Slug = "conference", Description = "Hội nghị cấp cao, công nghệ, diễn giả và hệ thống bán vé trực tuyến.", Icon = "Mic", OrderIndex = 6 },
            new { Name = "Ứng Dụng & Năng Suất", Slug = "app-showcase", Description = "Landing page ứng dụng di động, video demo và triết lý sản phẩm.", Icon = "Layers", OrderIndex = 7 },
            new { Name = "Y Tế & Nha Khoa", Slug = "medical", Description = "Phòng khám nha khoa cao cấp, danh mục dịch vụ và đặt lịch hẹn tư vấn.", Icon = "Stethoscope", OrderIndex = 8 },
            new { Name = "Nền Tảng SaaS", Slug = "saas", Description = "Giải pháp phần mềm B2B, tự động hóa quy trình và bảng giá dịch vụ.", Icon = "Cpu", OrderIndex = 9 },
            new { Name = "Ẩm Thực & Nhà Hàng", Slug = "restaurant", Description = "Khai trương nhà hàng ẩm thực, tiệc thưởng vị Fine Dining và đặt bàn trực tuyến.", Icon = "Utensils", OrderIndex = 10 },
            new { Name = "Thể Thao & Fitness", Slug = "fitness", Description = "Câu lạc bộ thể hình cao cấp, huấn luyện viên cá nhân và gói tập chuyển hóa cơ thể.", Icon = "Dumbbell", OrderIndex = 11 },
            new { Name = "Tiệc Tân Gia", Slug = "housewarming", Description = "Tiệc mừng nhà mới ấm cúng, sơ đồ chỉ đường và hộp quà mừng tân gia.", Icon = "Home", OrderIndex = 12 },
            new { Name = "Giáo Dục & Khóa Học", Slug = "education", Description = "Khóa học chuyên sâu, workshop công nghệ và hội thảo trực tuyến.", Icon = "GraduationCap", OrderIndex = 13 },
            new { Name = "Bất Động Sản & Nghỉ Dưỡng", Slug = "real-estate", Description = "Biệt thự nghỉ dưỡng cao cấp, căn hộ độc bản và đặt lịch trải nghiệm riêng tư.", Icon = "Building", OrderIndex = 14 },
            new { Name = "Nghệ Thuật & Triển Lãm", Slug = "art-craft", Description = "Triển lãm mỹ thuật đương đại, gốm thủ công độc bản và đêm tiệc Vernissage.", Icon = "Palette", OrderIndex = 15 },
            new { Name = "Spa & Chăm Sóc Sắc Đẹp", Slug = "spa-beauty", Description = "Không gian trị liệu thư giãn, trẻ hóa làn da và đặt lịch chăm sóc chuyên sâu.", Icon = "Sparkles", OrderIndex = 16 },
            new { Name = "Podcast & Âm Nhạc", Slug = "podcast-music", Description = "Kênh podcast chuyên sâu, giới thiệu album âm nhạc và tập phát sóng mới nhất.", Icon = "Headphones", OrderIndex = 17 },
            new { Name = "Khởi Nghiệp Công Nghệ", Slug = "tech-startup", Description = "Landing page gọi vốn công nghệ, giải pháp trí tuệ nhân tạo và lộ trình sản phẩm.", Icon = "Rocket", OrderIndex = 18 },
            new { Name = "Nhiếp Ảnh & Studio", Slug = "photography", Description = "Portfolio nhiếp ảnh nghệ thuật, studio ảnh cưới độc bản và đặt lịch chụp.", Icon = "Camera", OrderIndex = 19 }
        };

        var existingCategories = await context.Categories.ToListAsync();
        var categoryDict = existingCategories.ToDictionary(c => c.Slug, c => c);

        var categoriesToAdd = new List<Category>();
        foreach (var c in allCategories)
        {
            if (!categoryDict.ContainsKey(c.Slug))
            {
                var newCat = Category.Create(c.Name, c.Slug, c.Description, c.Icon, c.OrderIndex, true);
                categoriesToAdd.Add(newCat);
                categoryDict[c.Slug] = newCat;
            }
        }

        if (categoriesToAdd.Count > 0)
        {
            context.Categories.AddRange(categoriesToAdd);
            await context.SaveChangesAsync();
        }

        // 3. Seed Dynamic Navigation Menus (Parent & Submenu Tree)
        if (!await context.NavigationMenus.AnyAsync())
        {
            var homeMenu = NavigationMenu.Create(
                "Trang Chủ",
                "/",
                null,
                1,
                "_self",
                null,
                null,
                "Home",
                true);

            var templatesMenu = NavigationMenu.Create(
                "Kho Mẫu Thiệp",
                "/templates",
                null,
                2,
                "_self",
                "HOT",
                "rose",
                "LayoutTemplate",
                true);

            var pricingMenu = NavigationMenu.Create(
                "Bảng Giá",
                "/#pricing",
                null,
                3,
                "_self",
                null,
                null,
                "BadgePercent",
                true);

            var guideMenu = NavigationMenu.Create(
                "Hướng Dẫn",
                "/#guide",
                null,
                4,
                "_self",
                null,
                null,
                "BookOpen",
                true);

            var contactMenu = NavigationMenu.Create(
                "Liên Hệ",
                "/#contact",
                null,
                5,
                "_self",
                null,
                null,
                "Mail",
                true);

            context.NavigationMenus.AddRange(homeMenu, templatesMenu, pricingMenu, guideMenu, contactMenu);
            await context.SaveChangesAsync();

            // Submenus under "Kho Mẫu Thiệp"
            var sub1 = NavigationMenu.Create(
                "Thiệp Cưới",
                "/templates?category=wedding",
                templatesMenu.Id,
                1,
                "_self",
                "HOT",
                "rose",
                "Heart",
                true);

            var sub2 = NavigationMenu.Create(
                "Lễ Đính Hôn",
                "/templates?category=engagement",
                templatesMenu.Id,
                2,
                "_self",
                null,
                null,
                "Ring",
                true);

            var sub3 = NavigationMenu.Create(
                "Thiệp Sinh Nhật",
                "/templates?category=birthday",
                templatesMenu.Id,
                3,
                "_self",
                "NEW",
                "blue",
                "Cake",
                true);

            var sub4 = NavigationMenu.Create(
                "Kỷ Niệm Ngày Cưới",
                "/templates?category=anniversary",
                templatesMenu.Id,
                4,
                "_self",
                null,
                null,
                "Sparkles",
                true);

            var sub5 = NavigationMenu.Create(
                "Thôi Nôi & Đầy Tháng",
                "/templates?category=baby-shower",
                templatesMenu.Id,
                5,
                "_self",
                null,
                null,
                "Baby",
                true);

            context.NavigationMenus.AddRange(sub1, sub2, sub3, sub4, sub5);
            await context.SaveChangesAsync();
        }

        // Shared JSON Configurations for Templates and UserCustomizations
        var weddingConfigJson = """
        {
          "theme": {
            "primaryColor": "#e11d48",
            "secondaryColor": "#f43f5e",
            "accentColor": "#fef08a",
            "backgroundColor": "#fff1f2",
            "textColor": "#1e293b",
            "fontFamily": "Playfair Display",
            "stylePreset": "romantic",
            "particlesEffect": "petals"
          },
          "hero": {
            "badge": "SAVE THE DATE",
            "title": "Minh & Linh",
            "subtitle": "Hân hoan thông báo ngày chung đôi",
            "eventDate": "2026-10-25T18:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1519741497674-611481863552",
            "callToActionText": "Xác nhận tham dự"
          },
          "coupleOrCelebrant": {
            "type": "wedding",
            "person1": {
              "name": "Nguyễn Văn Minh",
              "title": "Chú Rể",
              "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
              "bio": "Kỹ sư phần mềm, yêu âm nhạc và nhiếp ảnh",
              "parents": "Ông Nguyễn Văn A & Bà Trần Thị B"
            },
            "person2": {
              "name": "Lê Thùy Linh",
              "title": "Cô Dâu",
              "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
              "bio": "Nhà thiết kế đồ họa, thích hoa và du lịch",
              "parents": "Ông Lê Văn C & Bà Phạm Thị D"
            },
            "storyQuote": "Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng."
          },
          "eventDetails": {
            "ceremonyName": "Lễ Thành Hôn",
            "time": "17:30 - Chủ Nhật, 25/10/2026",
            "venueName": "The Adora Center",
            "address": "431 Hoàng Văn Thụ, Phường 4, Tân Bình, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Trắng / Pastel / Be"
          },
          "timeline": [
            { "id": "1", "time": "17:00", "title": "Đón khách & Chụp ảnh", "description": "Chào đón khách quý và chụp ảnh kỷ niệm", "icon": "Camera" },
            { "id": "2", "time": "18:00", "title": "Làm lễ Thành hôn", "description": "Nghi thức trao nhẫn và cắt bánh cưới", "icon": "Heart" },
            { "id": "3", "time": "19:00", "title": "Khai tiệc mừng", "description": "Dùng tiệc cùng gia đình và bạn bè", "icon": "Utensils" },
            { "id": "4", "time": "20:30", "title": "Âm nhạc & Khiêu vũ", "description": "Giao lưu văn nghệ và tung hoa cưới", "icon": "Music" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1519741497674-611481863552", "caption": "Khoảnh khắc hạnh phúc" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc", "caption": "Nụ cười rạng rỡ" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-10-15",
            "note": "Xin vui lòng phản hồi trước ngày 15/10 để chúng mình đón tiếp chu đáo nhất!",
            "allowDietaryNotes": true,
            "allowPlusOnes": true
          },
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
            "title": "A Thousand Years - Piano Instrumental",
            "autoPlay": true
          },
          "wishes": {
            "enabled": true,
            "title": "Sổ Lưu Bút & Lời Chúc",
            "subtitle": "Gửi những lời chúc yêu thương nhất tới chúng mình"
          }
        }
        """;

        var engagementConfigJson = """
        {
          "theme": {
            "primaryColor": "#b91c1c",
            "secondaryColor": "#dc2626",
            "accentColor": "#fef08a",
            "backgroundColor": "#fef2f2",
            "textColor": "#1e293b",
            "fontFamily": "Playfair Display",
            "stylePreset": "traditional",
            "particlesEffect": "sparkles"
          },
          "hero": {
            "badge": "LỄ ĐÍNH HÔN",
            "title": "Trần Quân & Mai Phương",
            "subtitle": "Kính mời quý khách tới tham dự Lễ Đính Hôn & Lễ Ăn Hỏi",
            "eventDate": "2026-09-12T09:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
            "callToActionText": "Xác nhận tham dự"
          },
          "coupleOrCelebrant": {
            "type": "engagement",
            "person1": {
              "name": "Trần Anh Quân",
              "title": "Vị Hôn Phu",
              "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
              "bio": "Chàng trai yêu gia đình, luôn trân trọng từng khoảnh khắc bình yên.",
              "parents": "Ông Trần Văn Hùng & Bà Đỗ Thị Lan"
            },
            "person2": {
              "name": "Lê Mai Phương",
              "title": "Vị Hôn Thê",
              "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
              "bio": "Cô gái dịu dàng, chu đáo, thích nấu ăn và cắm hoa.",
              "parents": "Ông Lê Văn Thành & Bà Nguyễn Thị Mai"
            },
            "storyQuote": "Duyên do trời định, phận do người tạo, hạnh phúc là do hai ta cùng nắm giữ."
          },
          "eventDetails": {
            "ceremonyName": "Lễ Ăn Hỏi & Trao Duyên",
            "time": "09:00 - Thứ Bảy, 12/09/2026",
            "venueName": "Tư gia Nhà Gái",
            "address": "Số 68 Đường Hoa Lan, Phường 2, Phú Nhuận, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Áo Dài Truyền Thống / Đỏ / Kem"
          },
          "timeline": [
            { "id": "1", "time": "08:30", "title": "Đoàn Nhà Trai xuất phát", "description": "Đoàn bưng mâm quả sính lễ tiến về tư gia nhà gái", "icon": "Heart" },
            { "id": "2", "time": "09:00", "title": "Nghi thức Trao mâm quả", "description": "Đội hình bưng quả trao duyên và đón chào nhà trai", "icon": "Sparkles" },
            { "id": "3", "time": "09:30", "title": "Làm lễ Gia tiên", "description": "Cô dâu chú rể dâng hương báo cáo tổ tiên hai họ", "icon": "Camera" },
            { "id": "4", "time": "10:30", "title": "Tiệc trà & Thân mật hai họ", "description": "Giao lưu, dùng tiệc thân mật và chúc mừng đôi trẻ", "icon": "Utensils" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", "caption": "Mâm quả trao duyên" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80", "caption": "Ánh mắt trao nhau" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-09-05",
            "note": "Gia đình chúng tôi rất hân hạnh được đón tiếp quý vị trong ngày vui đính ước!",
            "allowDietaryNotes": true,
            "allowPlusOnes": true
          },
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
            "title": "Beautiful In White - Acoustic Guitar",
            "autoPlay": true
          },
          "wishes": {
            "enabled": true,
            "title": "Sổ Lưu Bút Lễ Đính Hôn",
            "subtitle": "Gửi những lời chúc phúc ngọt ngào nhất đến đôi trẻ Quân & Phương"
          }
        }
        """;

        var birthdayConfigJson = """
        {
          "theme": {
            "primaryColor": "#d97706",
            "secondaryColor": "#f59e0b",
            "accentColor": "#fef08a",
            "backgroundColor": "#fffbeb",
            "textColor": "#1e293b",
            "fontFamily": "Playfair Display",
            "stylePreset": "luxury",
            "particlesEffect": "confetti"
          },
          "hero": {
            "badge": "HAPPY BIRTHDAY",
            "title": "Dạ Tiệc Sinh Nhật Hoàng Nam",
            "subtitle": "Đánh dấu cột mốc tuổi 30 rực rỡ và đáng nhớ",
            "eventDate": "2026-11-15T19:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&q=80",
            "callToActionText": "Xác nhận tham dự"
          },
          "coupleOrCelebrant": {
            "type": "birthday",
            "person1": {
              "name": "Hoàng Nam",
              "title": "Nhân Vật Chính",
              "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
              "bio": "30 tuổi - Hành trình mới, đam mê mới và những mục tiêu rực rỡ phía trước.",
              "parents": ""
            },
            "storyQuote": "Tuổi 30 không phải là điểm dừng, mà là khởi đầu cho những ước mơ vĩ đại hơn."
          },
          "eventDetails": {
            "ceremonyName": "Dạ Tiệc Sinh Nhật Tuổi 30",
            "time": "18:30 - Thứ Bảy, 15/11/2026",
            "venueName": "Sky Lounge Rooftop",
            "address": "Tầng 28, Landmark 81, Bình Thạnh, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Black Tie / Gold & Black"
          },
          "timeline": [
            { "id": "1", "time": "18:30", "title": "Check-in & Welcome Drink", "description": "Chụp ảnh thảm đỏ và thưởng thức cocktail khai tiệc", "icon": "GlassWater" },
            { "id": "2", "time": "19:30", "title": "Khai tiệc & Cắt bánh sinh nhật", "description": "Thổi nến, ước nguyện và nâng ly chúc mừng tuổi 30", "icon": "Cake" },
            { "id": "3", "time": "20:30", "title": "Minigame & Bốc thăm may mắn", "description": "Trò chơi gắn kết và trao những phần quà thú vị", "icon": "Sparkles" },
            { "id": "4", "time": "21:30", "title": "DJ Party & Chill Music", "description": "Hòa mình vào giai điệu âm nhạc sôi động", "icon": "Music" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80", "caption": "Ánh sáng lung linh" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", "caption": "Khoảnh khắc bùng nổ" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-05",
            "note": "Vui lòng xác nhận trước ngày 05/11 để ban tổ chức chuẩn bị chỗ ngồi chu đáo!",
            "allowDietaryNotes": true,
            "allowPlusOnes": true
          },
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
            "title": "Celebration Night - Acoustic Vibe",
            "autoPlay": true
          },
          "wishes": {
            "enabled": true,
            "title": "Lời Chúc Mừng Sinh Nhật",
            "subtitle": "Gửi những lời chúc tốt đẹp nhất tới Hoàng Nam"
          }
        }
        """;

        var babyShowerConfigJson = """
        {
          "theme": {
            "primaryColor": "#0ea5e9",
            "secondaryColor": "#38bdf8",
            "accentColor": "#fef08a",
            "backgroundColor": "#f0f9ff",
            "textColor": "#1e293b",
            "fontFamily": "Playfair Display",
            "stylePreset": "playful",
            "particlesEffect": "sparkles"
          },
          "hero": {
            "badge": "HAPPY 1ST BIRTHDAY",
            "title": "Thôi Nôi Bé Bắp Tròn 1 Tuổi",
            "subtitle": "Mừng thiên thần nhỏ tròn 1 năm tuổi ngập tràn niềm vui",
            "eventDate": "2026-12-06T11:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1600&q=80",
            "callToActionText": "Xác nhận tham dự"
          },
          "coupleOrCelebrant": {
            "type": "baby",
            "person1": {
              "name": "Bé Bắp (Nguyễn Gia Khang)",
              "title": "Thiên Thần Nhỏ",
              "avatarUrl": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80",
              "bio": "Sở thích: Thích cười toe toét, uống sữa và vỗ tay theo nhạc ba mẹ bật.",
              "parents": "Ba Minh & Mẹ Linh"
            },
            "storyQuote": "Con là món quà tuyệt vời nhất mà cuộc sống ban tặng cho ba mẹ."
          },
          "eventDetails": {
            "ceremonyName": "Tiệc Thôi Nôi Bé Bắp",
            "time": "11:00 - Chủ Nhật, 06/12/2026",
            "venueName": "Nhà hàng White Palace",
            "address": "194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Xanh Pastel / Trắng / Vàng Nhạt"
          },
          "timeline": [
            { "id": "1", "time": "10:30", "title": "Đón khách & Check-in", "description": "Chụp hình lưu niệm tại backdrop bong bóng cùng bé Bắp", "icon": "Camera" },
            { "id": "2", "time": "11:15", "title": "Nghi thức Bốc đồ thôi nôi", "description": "Bé Bắp chọn món đồ tiên tri nghề nghiệp tương lai", "icon": "Sparkles" },
            { "id": "3", "time": "11:45", "title": "Khai tiệc thôi nôi", "description": "Dùng tiệc trưa ấm cúng cùng gia đình và bạn bè", "icon": "Utensils" },
            { "id": "4", "time": "13:00", "title": "Cắt bánh kem & Trao quà", "description": "Cắt bánh kem thôi nôi và trao quà lưu niệm cho khách", "icon": "Cake" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80", "caption": "Nụ cười đầu đời" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80", "caption": "Những bước chân đầu tiên" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-28",
            "note": "Kính mời quý cô chú, anh chị xác nhận tham dự để ba mẹ chuẩn bị tiệc chu đáo!",
            "allowDietaryNotes": true,
            "allowPlusOnes": true
          },
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3",
            "title": "Lullaby Goodnight - Music Box",
            "autoPlay": true
          },
          "wishes": {
            "enabled": true,
            "title": "Sổ Lưu Bút Chúc Mừng Bé Bắp",
            "subtitle": "Gửi những lời chúc bình an và khỏe mạnh đến thiên thần nhỏ"
          }
        }
        """;

        var anniversaryConfigJson = """
        {
          "theme": {
            "primaryColor": "#64748b",
            "secondaryColor": "#94a3b8",
            "accentColor": "#cbd5e1",
            "backgroundColor": "#f8fafc",
            "textColor": "#0f172a",
            "fontFamily": "Playfair Display",
            "stylePreset": "classic",
            "particlesEffect": "sparkles"
          },
          "hero": {
            "badge": "25TH ANNIVERSARY",
            "title": "Huy & Phương",
            "subtitle": "Kỷ niệm 25 năm ngày cưới - Một phần tư thế kỷ yêu thương",
            "eventDate": "2026-11-20T18:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=80",
            "callToActionText": "Xác nhận tham dự"
          },
          "coupleOrCelebrant": {
            "type": "anniversary",
            "person1": {
              "name": "Nguyễn Quốc Huy",
              "title": "Chồng",
              "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
              "bio": "25 năm qua, mỗi ngày thức dậy đều biết ơn vì luôn có em đồng hành.",
              "parents": ""
            },
            "person2": {
              "name": "Trần Mai Phương",
              "title": "Vợ",
              "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
              "bio": "Hạnh phúc không phải là không có bão giông, mà là cùng nhau vượt qua tất cả.",
              "parents": ""
            },
            "storyQuote": "25 năm không chỉ là thời gian, đó là chứng nhân cho sự thấu hiểu và gắn kết vĩnh cửu."
          },
          "eventDetails": {
            "ceremonyName": "Lễ Kỷ Niệm Đám Cưới Bạc",
            "time": "18:00 - Thứ Sáu, 20/11/2026",
            "venueName": "Park Hyatt Saigon",
            "address": "2 Lam Son Square, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Ánh Bạc / Xanh Navy / Trắng Sang Trọng"
          },
          "timeline": [
            { "id": "1", "time": "17:30", "title": "Đón khách & Trưng bày kỷ vật", "description": "Cùng nhìn lại album ảnh cưới 25 năm và ký tên lưu niệm", "icon": "Camera" },
            { "id": "2", "time": "18:30", "title": "Tái hiện lời thề ước", "description": "Trao nhau cặp nhẫn bạc kỷ niệm 25 năm ngày chung đôi", "icon": "Heart" },
            { "id": "3", "time": "19:15", "title": "Dạ tiệc tri ân", "description": "Nâng ly rượu mừng cùng gia đình, con cháu và bạn hữu", "icon": "Utensils" },
            { "id": "4", "time": "20:30", "title": "Vũ điệu tình yêu (First Dance)", "description": "Bản valse lãng mạn ôn lại những kỷ niệm thanh xuân", "icon": "Music" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80", "caption": "Hành trình 25 năm" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80", "caption": "Nụ cười vẫn như ngày đầu" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-10",
            "note": "Sự hiện diện của quý vị là niềm vinh hạnh lớn nhất của gia đình chúng tôi!",
            "allowDietaryNotes": true,
            "allowPlusOnes": true
          },
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d659ad76.mp3",
            "title": "Memories of Love - Orchestra",
            "autoPlay": true
          },
          "wishes": {
            "enabled": true,
            "title": "Sổ Lưu Bút Kỷ Niệm 25 Năm",
            "subtitle": "Gửi những lời chúc mừng hạnh phúc đến Huy & Phương"
          }
        }
        """;

        var aiSummitConfigJson = """
        {
          "format": "summit",
          "theme": {
            "primaryColor": "#2563eb",
            "secondaryColor": "#3b82f6",
            "accentColor": "#60a5fa",
            "backgroundColor": "#090d16",
            "textColor": "#f8fafc",
            "fontFamily": "Inter"
          },
          "hero": {
            "badge": "GLOBAL VIRTUAL SUMMIT 2026",
            "title": "Generative AI & Future Intelligence",
            "subtitle": "Hội nghị cấp cao quy tụ 50+ chuyên gia AI hàng đầu thế giới",
            "eventDate": "2026-11-20T09:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
            "callToActionText": "Đặt Vé Ngay"
          },
          "speakers": [
            {
              "id": "spk-1",
              "name": "Dr. Elena Rostova",
              "role": "Chief AI Scientist",
              "company": "DeepNexus Labs",
              "bio": "Tiên phong trong kiến trúc Large Reasoning Models và Autonomous Agents.",
              "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80"
            },
            {
              "id": "spk-2",
              "name": "Marcus Vance",
              "role": "VP of Engineering",
              "company": "Synthetix AI",
              "bio": "Kiến trúc sư hạ tầng phân tán xử lý mô hình 100 tỷ tham số.",
              "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80"
            }
          ],
          "pricingTickets": [
            {
              "id": "early-bird",
              "name": "Standard Pass",
              "price": "1.490.000 đ",
              "originalPrice": "2.500.000 đ",
              "badge": "EARLY BIRD",
              "perks": ["Truy cập toàn bộ livestream", "Bộ slide thuyết trình", "Chứng nhận tham dự NFT"],
              "ctaText": "Đặt Vé Standard"
            },
            {
              "id": "vip-pass",
              "name": "VIP Executive",
              "price": "4.990.000 đ",
              "badge": "POPULAR",
              "perks": ["Bao gồm quyền lợi Standard", "Phòng thảo luận kín với Speakers", "Tài khoản Pro 1 năm đối tác AI"],
              "ctaText": "Đặt Vé VIP"
            }
          ],
          "eventDetails": {
            "ceremonyName": "Hội Nghị Virtual AI Summit 2026",
            "time": "09:00 - Thứ Sáu, 20/11/2026",
            "venueName": "Online Metaverse Stage & Metropole",
            "address": "Phát trực tuyến toàn cầu",
            "dressCode": "Business Casual"
          },
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-10",
            "note": "Xác nhận để nhận mã vé QR Code tham dự sự kiện."
          },
          "extraSections": [
            {
              "id": "summit-qa",
              "type": "qa",
              "enabled": true,
              "title": "Hỏi Đáp Về Sự Kiện (FAQ)",
              "items": [
                { "question": "Tôi có thể xem lại video sau sự kiện không?", "answer": "Có, toàn bộ video các phiên thuyết trình sẽ được lưu trữ trọn đời." }
              ]
            }
          ]
        }
        """;

        var driftPlannerConfigJson = """
        {
          "format": "app-showcase",
          "theme": {
            "primaryColor": "#10b981",
            "secondaryColor": "#059669",
            "accentColor": "#34d399",
            "backgroundColor": "#0f172a",
            "textColor": "#f8fafc",
            "fontFamily": "Inter"
          },
          "hero": {
            "badge": "ADHD-FRIENDLY WORKSPACE",
            "title": "Drift — Năng Suất Nhẹ Nhàng Dành Cho Não Bộ Của Bạn",
            "subtitle": "Biến những danh sách công việc ngột ngạt thành các dòng sông thời gian êm dịu.",
            "videoUrl": "https://cdn.pixabay.com/video/demo-preview.mp4",
            "coverImageUrl": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1600&q=80",
            "callToActionText": "Dùng Thử 14 Ngày Miễn Phí"
          },
          "eventDetails": {
            "ceremonyName": "Drift ADHD Workspace Showcase",
            "time": "Phát hành phiên bản 2.0 toàn cầu",
            "venueName": "App Store & Google Play",
            "address": "driftplanner.app"
          },
          "featureCardsGrid": [
            {
              "id": "f-1",
              "title": "Time-Blocking Trực Quan",
              "description": "Các khối năng lượng linh hoạt giúp bạn dễ dàng thích nghi khi tâm trạng biến đổi."
            },
            {
              "id": "f-2",
              "title": "Âm Thanh Tập Trung Song Nhĩ",
              "description": "Tần số sóng não 40Hz kích thích dopamin tự nhiên, đưa bạn vào trạng thái deep work."
            },
            {
              "id": "f-3",
              "title": "Tự Động Rã Nhỏ Nhiệm Vụ",
              "description": "Trợ lý AI tự động rã dự án khó thành các bước 5 phút dễ như ăn kẹo."
            }
          ],
          "metrics": [
            { "value": "50,000+", "label": "Người dùng ADHD phục hồi năng lượng" },
            { "value": "4.9/5", "label": "Đánh giá trên App Store" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-12-31"
          }
        }
        """;

        var dentalClinicConfigJson = """
        {
          "format": "dental-services",
          "theme": {
            "primaryColor": "#0ea5e9",
            "secondaryColor": "#0284c7",
            "accentColor": "#7dd3fc",
            "backgroundColor": "#ffffff",
            "textColor": "#0f172a",
            "fontFamily": "Inter"
          },
          "hero": {
            "badge": "TIÊU CHUẨN NHA KHOA THỤY SỸ",
            "title": "Kiến Tạo Nụ Cười Hoàn Hảo & Tự Tin",
            "subtitle": "Phòng khám chuẩn Châu Âu với công nghệ Scan 3D không xâm lấn.",
            "coverImageUrl": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&q=80",
            "callToActionText": "Đặt Lịch Khám Ngay"
          },
          "servicesGrid": [
            { "id": "veneers", "name": "Veneers Sứ Siêu Mỏng", "description": "Bảo tồn 100% răng thật, tự nhiên như ngọc trai.", "priceFrom": "6.000.000 đ/răng" },
            { "id": "crowns", "name": "Bọc Răng Sứ Thẩm Mỹ", "description": "Khắc phục triệt để răng ố vàng nặng, chịu lực gấp 5 lần răng thật.", "priceFrom": "4.500.000 đ/răng" },
            { "id": "whitening", "name": "Tẩy Trắng Laser Extra-White", "description": "Nâng 3-5 tone ngay sau 45 phút, an toàn tuyệt đối.", "priceFrom": "2.500.000 đ" },
            { "id": "implants", "name": "Cấy Ghép Implant Kỹ Thuật Số", "description": "Trồng răng trọn gói, tích hợp xương sinh học không đau.", "priceFrom": "15.000.000 đ/trụ" }
          ],
          "treatmentProcess": [
            { "step": "01", "title": "Thăm khám & Chụp CT 3D", "desc": "Đánh giá cấu trúc hàm mặt chính xác" },
            { "step": "02", "title": "Mô phỏng DSD", "desc": "Xem trước nụ cười trên màn hình" },
            { "step": "03", "title": "Điều trị nhẹ nhàng", "desc": "Bác sĩ 15 năm kinh nghiệm thực hiện" },
            { "step": "04", "title": "Bảo hành trọn đời", "desc": "Cấp thẻ bảo hành điện tử chính hãng" }
          ],
          "booking": {
            "enabled": true,
            "title": "Đặt Lịch Hẹn Tư Vấn Miễn Phí"
          },
          "rsvp": {
            "enabled": false
          }
        }
        """;

        var modernSaasConfigJson = """
        {
          "format": "saas",
          "theme": {
            "primaryColor": "#6366f1",
            "secondaryColor": "#4f46e5",
            "accentColor": "#818cf8",
            "backgroundColor": "#0b0f19",
            "textColor": "#f8fafc",
            "fontFamily": "Inter"
          },
          "hero": {
            "badge": "ENTERPRISE WORKFLOW AUTOMATION",
            "title": "Nền Tảng Tự Động Hóa Dòng Chảy Dữ Liệu Doanh Nghiệp",
            "subtitle": "Kết nối mọi API, xử lý 10 triệu events/giây với độ trễ dưới 5ms.",
            "coverImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80",
            "callToActionText": "Dùng Thử Ngay"
          },
          "featureCardsGrid": [
            { "title": "API-First Architecture", "description": "Tích hợp GraphQL, REST và Webhooks bảo mật cao." },
            { "title": "Realtime Stream Engine", "description": "Phân tích dữ liệu theo thời gian thực không độ trễ." },
            { "title": "Multi-Tenant Security", "description": "Mã hóa AES-256 từ đầu cuối đến cơ sở dữ liệu." },
            { "title": "Automated CI/CD Workflows", "description": "Tự động triển khai và roll-back chỉ với 1 cú click." },
            { "title": "Global Edge Network", "description": "Mạng lưới phân tán 320 điểm trên toàn thế giới." },
            { "title": "Smart Cost Optimization", "description": "Tự động co giãn tài nguyên đám mây, tiết kiệm 40% chi phí." }
          ],
          "pricingPackages": [
            { "id": "starter", "name": "Starter", "price": "$49", "billingPeriod": "tháng", "description": "Dành cho startup nhỏ", "perks": ["100K events/tháng", "5 Pipelines"] },
            { "id": "business", "name": "Business Pro", "price": "$199", "billingPeriod": "tháng", "badge": "POPULAR", "description": "Dành cho doanh nghiệp", "perks": ["5M events/tháng", "Không giới hạn"] }
          ],
          "metrics": [
            { "value": "10M+", "label": "Events/giây" },
            { "value": "99.99%", "label": "Uptime SLA" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-12-31"
          }
        }
        """;

        var lauraBistroConfigJson = """
        {
          "format": "restaurant",
          "theme": {
            "primaryColor": "#c2410c",
            "secondaryColor": "#ea580c",
            "accentColor": "#fef08a",
            "backgroundColor": "#0c0a09",
            "textColor": "#f8fafc",
            "fontFamily": "Playfair Display",
            "particlesEffect": "none"
          },
          "hero": {
            "badge": "GRAND OPENING & EXCLUSIVE TASTING",
            "title": "L'Aura Gourmet Bistro",
            "subtitle": "Bản hòa tấu ẩm thực tinh hoa Pháp giữa lòng Sài Gòn",
            "eventDate": "2026-11-28T18:30:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&q=80",
            "callToActionText": "Đặt Bàn Trải Nghiệm"
          },
          "servicesGrid": [
            { "id": "dish-1", "name": "Truffle Wagyu A5 Tartare", "description": "Bò Wagyu A5 thái tay kết hợp nấm Truffle đen Périgord và trứng chim cút chần chậm.", "priceFrom": "850.000 đ" },
            { "id": "dish-2", "name": "Pan-Seared Foie Gras", "description": "Gan ngỗng áp chảo béo ngậy kèm sốt mận đỏ hữu cơ và bánh mì Brioche nướng bơ.", "priceFrom": "680.000 đ" },
            { "id": "dish-3", "name": "Wild French Turbot", "description": "Cá bơn biển Pháp nướng bơ tỏi đen, rau bina non và sốt bơ trắng Beurre Blanc.", "priceFrom": "1.250.000 đ" },
            { "id": "dish-4", "name": "Dark Chocolate Lava Sphere", "description": "Quả cầu chocolate Grand Cru 72% tan chảy cùng kem quả mâm xôi tuyết và vàng lá.", "priceFrom": "320.000 đ" }
          ],
          "treatmentProcess": [
            { "step": "01", "title": "Khai vị Amuse-Bouche", "desc": "Đánh thức vị giác cùng canapé hải sản và vang sủi Champagne Brut Reserve." },
            { "step": "02", "title": "Rượu vang Sommelier Pairing", "desc": "Bộ sưu tập vang Bordeaux & Burgundy tuyển chọn riêng cho từng món ăn." },
            { "step": "03", "title": "Món chính Chef's Special", "desc": "Bò Wagyu mọng nước thượng hạng đượm khói gỗ sồi nướng than Binchotan." },
            { "step": "04", "title": "Tráng miệng & Digestif", "desc": "Kết thúc dạ tiệc với ngọt ngào tinh tế và ly rượu mạnh Cognac ủ lâu năm." }
          ],
          "booking": {
            "enabled": true,
            "title": "Đặt Bàn Dạ Tiệc Khai Trương (VIP Reserve)"
          },
          "eventDetails": {
            "ceremonyName": "Đêm Tiệc Thưởng Vị Khai Trương",
            "time": "18:30 - Thứ Bảy, 28/11/2026",
            "venueName": "L'Aura Bistro Mansion",
            "address": "18 Phùng Khắc Khoan, Đa Kao, Quận 1, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Cocktail Attire / Smart Elegance"
          },
          "timeline": [
            { "id": "1", "time": "18:30", "title": "Đón khách & Champagne Thượng Hạng", "description": "Thưởng thức Champagne Welcome drink và canapé trong tiếng đàn harp du dương.", "icon": "GlassWater" },
            { "id": "2", "time": "19:15", "title": "Triết Lý Bếp Trưởng & Khai Tiệc", "description": "Executive Chef Guillaume giới thiệu hành trình vị giác mùa thu 2026.", "icon": "Sparkles" },
            { "id": "3", "time": "19:45", "title": "Dạ Tiệc Thưởng Vị 5 Khóa (5-Course Tasting)", "description": "Trải nghiệm ẩm thực Pháp đương đại kết hợp pairing vang hảo hạng.", "icon": "Utensils" },
            { "id": "4", "time": "21:30", "title": "Live French Jazz & Giao Lưu", "description": "Hòa mình vào giai điệu Jazz acoustic và chia sẻ cảm xúc cùng sommelier.", "icon": "Music" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "caption": "Không gian kiến trúc cổ điển ấm cúng" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", "caption": "Tỉ mỉ trong từng đĩa món nghệ thuật" },
            { "id": "3", "url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80", "caption": "Hầm rượu vang lưu trữ hơn 500 nhãn vang quý" },
            { "id": "4", "url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80", "caption": "Bàn tiệc VIP dưới ánh nến lung linh" }
          ],
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/05/16/audio_c16e78cfbc.mp3",
            "title": "French Cafe Jazz & Smooth Acoustic",
            "autoPlay": true
          },
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-20",
            "note": "Số lượng bàn trải nghiệm giới hạn 40 khách VIP. Vui lòng xác nhận trước ngày 20/11.",
            "allowDietaryNotes": true,
            "allowPlusOnes": true
          },
          "extraSections": [
            {
              "id": "restaurant-qa",
              "type": "qa",
              "enabled": true,
              "title": "Thông Tin Dành Cho Thực Khách",
              "items": [
                { "question": "Nhà hàng có chỗ đỗ xe ô tô không?", "answer": "L'Aura Bistro có dịch vụ Valet Parking đỗ xe miễn phí cho quý khách ngay cổng chính." },
                { "question": "Nhà hàng có phục vụ thực đơn chay không?", "answer": "Có, quý khách vui lòng ghi chú chế độ ăn kiêng hoặc ăn chay khi xác nhận đặt bàn." }
              ]
            }
          ]
        }
        """;

        var apexFitnessConfigJson = """
        {
          "format": "fitness",
          "theme": {
            "primaryColor": "#eab308",
            "secondaryColor": "#ca8a04",
            "accentColor": "#fef08a",
            "backgroundColor": "#09090b",
            "textColor": "#fafafa",
            "fontFamily": "Inter",
            "particlesEffect": "none"
          },
          "hero": {
            "badge": "THE ULTIMATE BODY TRANSFORMATION",
            "title": "Apex Titanium Club",
            "subtitle": "Phòng tập thể hình hybrid chuẩn 5 sao với thiết bị Technogym & phân tích sinh trắc học InBody 970.",
            "eventDate": "2026-12-01T06:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80",
            "callToActionText": "Đăng Ký Tập Thử Miễn Phí"
          },
          "featureCardsGrid": [
            { "id": "f-1", "title": "Công Nghệ AI Bio-Scan", "description": "Quét chỉ số cơ xương khớp 3D và lập lộ trình tập luyện thích ứng theo tuần." },
            { "id": "f-2", "title": "Thiết Bị Technogym Pure", "description": "100% máy tập nhập khẩu từ Ý với quỹ đạo sinh học chuẩn xác, giảm tải chấn thương." },
            { "id": "f-3", "title": "HLV Đạt Chuẩn NASM/IFBB", "description": "Master Coach giàu kinh nghiệm đồng hành 1-1, kiểm soát dinh dưỡng và nhịp tim từng buổi." },
            { "id": "f-4", "title": "Phục Hồi Cryotherapy & Sauna", "description": "Khu thủy trị liệu xông hơi đá muối Himalaya và buồng lạnh hồi phục cơ bắp cấp tốc." }
          ],
          "metrics": [
            { "value": "2,500+", "label": "Hội viên chuyển hóa thành công" },
            { "value": "98.7%", "label": "Duy trì tập luyện sau 6 tháng" },
            { "value": "15+", "label": "Master Trainer quốc tế" },
            { "value": "24/7", "label": "Mở cửa liên tục phục vụ hội viên" }
          ],
          "pricingPackages": [
            {
              "id": "pkg-silver",
              "name": "Silver Access",
              "price": "$49",
              "billingPeriod": "tháng",
              "description": "Tự do tập luyện không giới hạn thời gian",
              "perks": ["Sử dụng toàn bộ thiết bị gym & cardio", "Tủ locker cá nhân thông minh", "2 buổi đo InBody định kỳ"]
            },
            {
              "id": "pkg-titanium",
              "name": "Titanium Pro",
              "price": "$129",
              "billingPeriod": "tháng",
              "badge": "POPULAR",
              "description": "Lựa chọn toàn diện nhất cho người tập nghiêm túc",
              "perks": ["Bao gồm toàn bộ quyền lợi Silver", "4 buổi PT 1 kèm 1 mỗi tháng", "Không giới hạn lớp Yoga, Boxing, HIIT", "Sử dụng Sauna & Jacuzzi thủy lực"]
            },
            {
              "id": "pkg-vip",
              "name": "VIP Elite Black",
              "price": "$299",
              "billingPeriod": "tháng",
              "description": "Đẳng cấp không giới hạn dành riêng cho VIP",
              "perks": ["HLV riêng toàn thời gian 1-1", "Phòng VIP Lounge riêng tư", "Trọn gói Cryotherapy hồi phục lạnh", "Được cấp phát đồ tập & khăn cao cấp mỗi ngày"]
            }
          ],
          "eventDetails": {
            "ceremonyName": "Tuần Lễ Khai Trương Apex Titanium Flagship",
            "time": "06:00 - 22:00, Từ 01/12/2026",
            "venueName": "Apex Titanium Tower",
            "address": "88 Song Hành, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Sporty / Athletic Chic"
          },
          "timeline": [
            { "id": "1", "time": "06:00", "title": "Mở cửa đón hội viên & Check-in FaceID", "description": "Khám phá không gian tập luyện 3,000 m² và quầy Bar Nutrition.", "icon": "Sparkles" },
            { "id": "2", "time": "09:00", "title": "Workshops: Kỹ Thuật Nâng Tạ & Chống Chấn Thương", "description": "Chia sẻ trực tiếp từ IFBB Pro Coach về tối ưu cơ sinh học.", "icon": "Dumbbell" },
            { "id": "3", "time": "16:00", "title": "Thử thách thể lực Titan Challenge", "description": "Tranh tài Deadlift & Burpees với giải thưởng gói tập 1 năm.", "icon": "Utensils" },
            { "id": "4", "time": "19:00", "title": "DJ Energy Night & Giao Lưu Hội Viên", "description": "Tiệc âm nhạc EDM tràn đầy năng lượng cùng protein shake tươi.", "icon": "Music" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", "caption": "Khu tạ tự do Free-Weights quy mô lớn" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80", "caption": "Dàn máy chạy Technogym hướng view Panorama" },
            { "id": "3", "url": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80", "caption": "Phòng tập Boxing & Functional Training" },
            { "id": "4", "url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80", "caption": "Khu vực giãn cơ và hồi phục cơ bắp" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-12-05",
            "note": "Đăng ký trước để nhận 7 ngày tập thử miễn phí và đo InBody 3D chuyên sâu."
          }
        }
        """;

        var warmNestConfigJson = """
        {
          "theme": {
            "primaryColor": "#059669",
            "secondaryColor": "#10b981",
            "accentColor": "#fef08a",
            "backgroundColor": "#f0fdf4",
            "textColor": "#1e293b",
            "fontFamily": "Playfair Display",
            "particlesEffect": "confetti"
          },
          "hero": {
            "badge": "LỄ MỪNG NHÀ MỚI (TÂN GIA)",
            "title": "Gia Đình Tuấn & Mai",
            "subtitle": "Tổ ấm mới ngập tràn yêu thương và bình yên đã sẵn sàng chào đón bạn",
            "eventDate": "2026-11-08T11:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
            "callToActionText": "Xác Nhận Đến Chung Vui"
          },
          "coupleOrCelebrant": {
            "type": "event",
            "person1": {
              "name": "Đức Tuấn & Quỳnh Mai",
              "title": "Gia Chủ",
              "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
              "bio": "Sau 5 năm ấp ủ và vun vén, tổ ấm mơ ước đã hoàn thành. Rất mong được đón tiếp anh em bạn bè!",
              "parents": ""
            },
            "storyQuote": "Nhà không chỉ là nơi để ở, nhà là nơi bão dừng sau cánh cửa."
          },
          "eventDetails": {
            "ceremonyName": "Tiệc Tân Gia Mừng An Cư Lạc Nghiệp",
            "time": "11:00 - Chủ Nhật, 08/11/2026",
            "venueName": "Biệt Thự Vườn The Green Haven",
            "address": "Lô B12 Khu Đô Thị Vạn Phúc, Quốc Lộ 13, Hiệp Bình Phước, TP. Thủ Đức",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Xanh Lá / Trắng / Be Ấm Áp"
          },
          "timeline": [
            { "id": "1", "time": "10:30", "title": "Đón khách & Tham quan tổ ấm", "description": "Chào đón khách quý, dẫn tour tham quan không gian kiến trúc căn nhà mới.", "icon": "Camera" },
            { "id": "2", "time": "11:30", "title": "Khai rượu mừng tân gia", "description": "Khui champagne chúc mừng an cư lạc nghiệp, gia đạo bình an.", "icon": "Sparkles" },
            { "id": "3", "time": "12:00", "title": "Tiệc BBQ sân vườn ấm cúng", "description": "Thưởng thức tiệc nướng ngoài trời, rượu vang cùng gia đình và bạn hữu.", "icon": "Utensils" },
            { "id": "4", "time": "13:30", "title": "Hàn huyên, Trà chiều & Boardgame", "description": "Giao lưu, nghe nhạc acoustic sân vườn và chia sẻ kỷ niệm.", "icon": "Music" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", "caption": "Phòng khách ngập tràn ánh sáng tự nhiên" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", "caption": "Góc bếp ấm cúng nơi giữ lửa gia đình" },
            { "id": "3", "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", "caption": "Khoảng sân vườn xanh mát nhiều hoa trái" },
            { "id": "4", "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", "caption": "Khu ban công ngắm hoàng hôn chill mỗi chiều" }
          ],
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
            "title": "Home Sweet Home - Acoustic Guitar Melody",
            "autoPlay": true
          },
          "extraSections": [
            {
              "id": "housewarming-gift",
              "type": "giftQr",
              "enabled": true,
              "title": "Hộp Quà Mừng Tân Gia",
              "subtitle": "Quà mừng tinh thần và chúc phúc an cư từ phương xa",
              "qrBank": {
                "bankName": "MBBank",
                "accountNumber": "9876543210",
                "accountHolder": "NGUYEN DUC TUAN",
                "qrImageUrl": ""
              }
            }
          ],
          "wishes": {
            "enabled": true,
            "title": "Sổ Lưu Bút Mừng Nhà Mới",
            "subtitle": "Gửi những lời chúc tài lộc, bình an và hạnh phúc đến tổ ấm mới của Tuấn & Mai"
          },
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-01",
            "note": "Xin quý bạn vui lòng xác nhận trước 01/11 để gia đình chuẩn bị phần tiệc chu đáo nhất!",
            "allowDietaryNotes": true,
            "allowPlusOnes": true
          }
        }
        """;

        var azureBreezeWeddingConfigJson = """
        {
          "theme": {
            "primaryColor": "#0284c7",
            "secondaryColor": "#0ea5e9",
            "accentColor": "#fef08a",
            "backgroundColor": "#f0fdfa",
            "textColor": "#0f172a",
            "fontFamily": "Playfair Display",
            "particlesEffect": "petals"
          },
          "hero": {
            "badge": "DESTINATION BEACH WEDDING",
            "title": "Khánh & Vy",
            "subtitle": "Cùng nhau trao lời thề ước dưới ánh hoàng hôn biển Phú Quốc",
            "eventDate": "2026-12-18T16:30:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1600&q=80",
            "callToActionText": "Xác Nhận Tham Dự"
          },
          "coupleOrCelebrant": {
            "type": "wedding",
            "person1": {
              "name": "Trần Nam Khánh",
              "title": "Chú Rể",
              "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
              "bio": "Kiến trúc sư yêu biển cả, người luôn muốn dựng xây một bến đỗ bình yên.",
              "parents": "Ông Trần Đình Long & Bà Vũ Kim Oanh"
            },
            "person2": {
              "name": "Hoàng Thảo Vy",
              "title": "Cô Dâu",
              "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
              "bio": "Nhiếp ảnh gia thiên nhiên, luôn tìm thấy thơ mộng trong từng con sóng biển.",
              "parents": "Ông Hoàng Quốc Việt & Bà Nguyễn Bích Thủy"
            },
            "storyQuote": "Em là bờ cát trắng dịu êm, anh là ngọn sóng vỗ về ngàn năm."
          },
          "eventDetails": {
            "ceremonyName": "Lễ Thành Hôn Hoàng Hôn Trên Biển",
            "time": "16:30 - Thứ Sáu, 18/12/2026",
            "venueName": "InterContinental Phu Quoc Long Beach Resort",
            "address": "Bãi Trường, Dương Tơ, TP. Phú Quốc, Kiên Giang",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Linen Trắng / Xanh Dương / Be Nhiệt Đới"
          },
          "timeline": [
            { "id": "1", "time": "16:00", "title": "Đón khách & Nước dừa tươi nhiệt đới", "description": "Check-in bãi cát trắng và thưởng thức nước dừa mát lạnh cùng âm thanh sóng biển.", "icon": "GlassWater" },
            { "id": "2", "time": "16:45", "title": "Thề ước dưới vòm hoa biển", "description": "Nghi thức trao nhẫn cưới dưới ánh hoàng hôn rực rỡ của biển Phú Quốc.", "icon": "Heart" },
            { "id": "3", "time": "17:45", "title": "Chụp ảnh đón hoàng hôn (Golden Hour)", "description": "Lưu giữ những khoảnh khắc nhiệm màu cùng quan khách khi mặt trời lặn.", "icon": "Camera" },
            { "id": "4", "time": "18:30", "title": "Dạ tiệc hải sản & Lửa trại trên biển", "description": "Tiệc tối ngoài trời, âm nhạc sống acoustic và khiêu vũ bên lửa trại.", "icon": "Music" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80", "caption": "Vòm hoa cưới hướng thẳng ra biển xanh" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80", "caption": "Hoàng hôn phủ bóng đôi uyên ương" },
            { "id": "3", "url": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", "caption": "Bàn tiệc lãng mạn dưới bầu trời đầy sao" },
            { "id": "4", "url": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80", "caption": "Khoảnh khắc trao lời thề ước trọn đời" }
          ],
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3",
            "title": "Ocean Waves & Acoustic Ukulele Romance",
            "autoPlay": true
          },
          "extraSections": [
            {
              "id": "beach-faq",
              "type": "qa",
              "enabled": true,
              "title": "Cẩm Nang Đi Tiệc Bãi Biển",
              "items": [
                { "question": "Resort có xe đón tiễn sân bay không?", "answer": "Có, resort bố trí shuttle bus đón khách từ sân bay Phú Quốc về resort miễn phí." },
                { "question": "Nên mang giày gì khi đi tiệc trên cát?", "answer": "Quý khách nên mang sandal bệt hoặc giày đế xuồng để đi dạo êm ái trên bãi cát." }
              ]
            }
          ],
          "wishes": {
            "enabled": true,
            "title": "Sổ Lưu Bút Biển Xanh",
            "subtitle": "Gửi những lời chúc phúc bình yên và ngọt ngào nhất tới Khánh & Vy"
          },
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-25",
            "note": "Để hỗ trợ gia đình đặt phòng và chuẩn bị vé chu đáo, quý khách vui lòng phản hồi trước 25/11.",
            "allowDietaryNotes": true,
            "allowPlusOnes": true
          }
        }
        """;

        var genAiMasterclassConfigJson = """
        {
          "format": "summit",
          "theme": {
            "primaryColor": "#7c3aed",
            "secondaryColor": "#8b5cf6",
            "accentColor": "#c4b5fd",
            "backgroundColor": "#0f0728",
            "textColor": "#f8fafc",
            "fontFamily": "Inter",
            "particlesEffect": "none"
          },
          "hero": {
            "badge": "INTENSIVE 4-WEEK COHORT",
            "title": "Mastering Prompt Engineering & Autonomous AI Agents",
            "subtitle": "Khóa huấn luyện thực chiến xây dựng hệ thống Multi-Agent và tự động hóa quy trình với LLMs.",
            "eventDate": "2026-11-10T19:30:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80",
            "callToActionText": "Giữ Chỗ Lớp Khai Giảng"
          },
          "speakers": [
            {
              "id": "spk-1",
              "name": "ThS. Đặng Hoàng Nam",
              "role": "Head of AI Research",
              "company": "NexusMind",
              "bio": "Chuyên gia với 10 năm kinh nghiệm NLP & LLM, tác giả cuốn sách 'Kiến Tạo Tác Nhân AI Thông Minh'.",
              "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
            },
            {
              "id": "spk-2",
              "name": "Dr. Sarah Nguyễn",
              "role": "Lead Prompt Architect",
              "company": "OpenSynth",
              "bio": "Kiến trúc sư thiết kế hệ thống prompt tối ưu ngữ cảnh hàng đầu khu vực Đông Nam Á.",
              "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80"
            }
          ],
          "pricingTickets": [
            {
              "id": "ticket-standard",
              "name": "Học Viên Tiêu Chuẩn",
              "price": "2.890.000 đ",
              "originalPrice": "4.500.000 đ",
              "badge": "EARLY BIRD",
              "perks": ["8 buổi học tương tác trực tuyến qua Zoom", "Kho prompt template bản quyền 500+ mẫu", "Mã nguồn thực hành GitHub riêng tư", "Chứng chỉ hoàn thành khóa học"],
              "ctaText": "Đăng Ký Khóa Học"
            },
            {
              "id": "ticket-pro",
              "name": "Gói Pro Mentorship 1-1",
              "price": "5.990.000 đ",
              "badge": "POPULAR",
              "perks": ["Toàn bộ quyền lợi gói Tiêu Chuẩn", "4 giờ Coaching 1-1 trực tiếp cùng Giảng viên", "Review đồ án capstone Multi-Agent thực tế", "Giới thiệu cơ hội việc làm tại đối tác AI"],
              "ctaText": "Đăng Ký Gói Pro"
            }
          ],
          "eventDetails": {
            "ceremonyName": "Lịch Khai Giảng Khóa Học Cohort 8",
            "time": "19:30 - 21:30, Thứ Ba & Thứ Năm hàng tuần",
            "venueName": "Live Zoom HD & Discord Community",
            "address": "Học trực tuyến có ghi hình xem lại trọn đời",
            "dressCode": "Tự do / Máy tính cá nhân kết nối Internet"
          },
          "timeline": [
            { "id": "1", "time": "Tuần 1", "title": "Nền Tảng Advanced Prompting", "description": "Kỹ thuật Chain-of-Thought, ReAct framework và cấu trúc hóa dữ liệu JSON đầu ra.", "icon": "Sparkles" },
            { "id": "2", "time": "Tuần 2", "title": "Hệ Thống RAG & Vector Database", "description": "Xây dựng kho tri thức riêng biệt với Milvus, LangChain và Semantic Search.", "icon": "Cpu" },
            { "id": "3", "time": "Tuần 3", "title": "Xây Dựng Autonomous Multi-Agents", "description": "Thiết kế bầy tác nhân phối hợp giải quyết bài toán nghiệp vụ phức tạp.", "icon": "Layers" },
            { "id": "4", "time": "Tuần 4", "title": "Demo Day & Triển Khai Production", "description": "Tối ưu hóa độ trễ, chi phí token và đóng gói sản phẩm thương mại.", "icon": "Mic" }
          ],
          "extraSections": [
            {
              "id": "course-faq",
              "type": "qa",
              "enabled": true,
              "title": "Câu Hỏi Thường Gặp Về Khóa Học",
              "items": [
                { "question": "Tôi chưa biết lập trình có học được không?", "answer": "Khóa học thiết kế từ cơ bản đến nâng cao, có module no-code/low-code dành cho non-tech." },
                { "question": "Nếu tôi bận một buổi học có xem lại được không?", "answer": "Mỗi buổi học đều được ghi hình chất lượng 4K và tải lên portal trong vòng 2 giờ." }
              ]
            }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-08",
            "note": "Lớp học giới hạn 30 học viên để đảm bảo chất lượng hướng dẫn 1-1 tốt nhất."
          }
        }
        """;

        var horizonVillasConfigJson = """
        {
          "format": "app-showcase",
          "theme": {
            "primaryColor": "#d97706",
            "secondaryColor": "#b45309",
            "accentColor": "#fef08a",
            "backgroundColor": "#0c0a09",
            "textColor": "#f8fafc",
            "fontFamily": "Playfair Display",
            "particlesEffect": "none"
          },
          "hero": {
            "badge": "LIMITED EDITION VILLA COLLECTION",
            "title": "The Horizon Ocean Sanctuary",
            "subtitle": "Bộ sưu tập 18 căn biệt thự độc bản trên vách đá ngắm trọn vịnh biển thiên đường",
            "eventDate": "2026-12-12T09:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
            "callToActionText": "Đăng Ký Tham Quan Riêng Tư"
          },
          "featureCardsGrid": [
            { "id": "f-1", "title": "Tầm Nhìn Biển Panorama 360°", "description": "100% vách kính Low-E tràn viền thu trọn vẻ đẹp hoang sơ của vịnh biển bình minh." },
            { "id": "f-2", "title": "Bến Du Thuyền & Sân Đỗ Trực Thăng", "description": "Hạ tầng hàng hải và hàng không riêng biệt, sẵn sàng đón tiếp những chuyến du ngoạn siêu sang." },
            { "id": "f-3", "title": "Hồ Bơi Vô Cực Nước Mặn Điện Phân", "description": "Bể bơi treo vách đá công nghệ khoáng mặn sinh học tốt cho sức khỏe và làn da." },
            { "id": "f-4", "title": "Quản Gia Riêng Les Clefs d'Or", "description": "Đội ngũ phục vụ chuẩn mực quý tộc Châu Âu chăm sóc chu đáo 24/7." }
          ],
          "metrics": [
            { "value": "18", "label": "Căn biệt thự độc bản giới hạn" },
            { "value": "1,200 m²", "label": "Khuôn viên đất dinh thự" },
            { "value": "100%", "label": "Trực diện biển không góc khuất" },
            { "value": "Sở Hữu", "label": "Lâu dài với pháp lý hoàn chỉnh" }
          ],
          "eventDetails": {
            "ceremonyName": "Sự Kiện Ra Mắt Giới Hạn The Horizon Private Showcase",
            "time": "09:00 - Thứ Bảy, 12/12/2026",
            "venueName": "The Horizon VIP Lounge & Marina Club",
            "address": "Bán đảo Sơn Trà, Bãi Bụt, TP. Đà Nẵng",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Elegance Resort / All White"
          },
          "timeline": [
            { "id": "1", "time": "09:00", "title": "Đón khách bằng du thuyền tư nhân", "description": "Hành trình thưởng ngoạn vịnh biển và cập bến du thuyền The Horizon Marina.", "icon": "Camera" },
            { "id": "2", "time": "10:00", "title": "Khám phá Biệt thự mẫu The Presidential Suite", "description": "Trải nghiệm nội thất hàng hiệu Minotti & Poliform độc bản chế tác riêng.", "icon": "Sparkles" },
            { "id": "3", "time": "11:30", "title": "Dạ tiệc Champagne & Thưởng vị ẩm thực biển", "description": "Tiệc trưa do bếp trưởng Michelin thiết kế riêng bên bờ biển.", "icon": "Utensils" },
            { "id": "4", "time": "14:00", "title": "Tư vấn đặc quyền đầu tư riêng tư", "description": "Buổi làm việc kín 1-1 cùng ban phát triển dự án và chuyên gia tài chính.", "icon": "Building" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80", "caption": "Kiến trúc hiện đại hòa quyện vào vách đá tự nhiên" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", "caption": "Hồ bơi vô cực ngắm trọn hoàng hôn biển" },
            { "id": "3", "url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80", "caption": "Phòng khách mở thông tầng đón trọn gió trời" },
            { "id": "4", "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", "caption": "Phòng ngủ Master Suite hướng tầm nhìn triệu đô" }
          ],
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d659ad76.mp3",
            "title": "Elegance Ambience - Soft Classical Piano",
            "autoPlay": true
          },
          "rsvp": {
            "enabled": true,
            "deadline": "2026-12-05",
            "note": "Sự kiện riêng tư chỉ đón tiếp 20 khách mời VIP có thư mời xác nhận."
          }
        }
        """;

        var academicGloryConfigJson = """
        {
          "format": "graduation",
          "theme": {
            "primaryColor": "#1d4ed8",
            "secondaryColor": "#2563eb",
            "accentColor": "#facc15",
            "backgroundColor": "#eff6ff",
            "textColor": "#1e293b",
            "fontFamily": "Playfair Display",
            "particlesEffect": "confetti"
          },
          "hero": {
            "badge": "COMMENCEMENT CEREMONY 2026",
            "title": "Lễ Tốt Nghiệp — Hoàng Minh Triết",
            "subtitle": "Đánh dấu cột mốc Cử nhân Xuất sắc ngành Kỹ nghệ Phần mềm",
            "eventDate": "2026-11-22T08:30:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80",
            "callToActionText": "Đến Tham Dự & Chụp Ảnh Cùng Triết"
          },
          "coupleOrCelebrant": {
            "type": "birthday",
            "person1": {
              "name": "Hoàng Minh Triết",
              "title": "Tân Cử Nhân Thủ Khoa",
              "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
              "bio": "4 năm thanh xuân rèn luyện dưới giảng đường Bách Khoa, khép lại một chương đáng nhớ để sẵn sàng vươn biển lớn.",
              "parents": "Gia đình Bố Mẹ Hoàng Văn Sơn & Lê Thị Tuyết"
            },
            "storyQuote": "Học vấn là hạt giống của ngày hôm nay, thành quả là tương lai của ngày mai."
          },
          "eventDetails": {
            "ceremonyName": "Lễ Bế Giảng & Trao Bằng Cử Nhân Đợt 2 - Năm 2026",
            "time": "08:30 - Chủ Nhật, 22/11/2026",
            "venueName": "Hội Trường Lớn A5 - Trường Đại Học Bách Khoa",
            "address": "268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Lịch sự / Sơ mi trắng / Áo cử nhân"
          },
          "timeline": [
            { "id": "1", "time": "07:30", "title": "Đón tiếp người thân & Tặng hoa lưu niệm", "description": "Chào đón gia đình, thầy cô và bạn bè tại sảnh khuôn viên A5.", "icon": "Camera" },
            { "id": "2", "time": "08:30", "title": "Khai mạc Lễ Bế giảng chính thức", "description": "Chào cờ và phát biểu bế giảng của Hiệu trưởng nhà trường.", "icon": "GraduationCap" },
            { "id": "3", "time": "09:30", "title": "Xướng tên & Trao bằng vinh danh", "description": "Khoảnh khắc nhận bằng Cử nhân Xuất sắc trên bục danh dự.", "icon": "Sparkles" },
            { "id": "4", "time": "11:00", "title": "Tung nón cử nhân & Chụp ảnh kỷ yếu", "description": "Chụp ảnh cùng hội trường, gia đình và bạn bè trong sân trường rợp bóng cây.", "icon": "Heart" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80", "caption": "Mũ cử nhân bay cao cùng ước mơ thanh xuân" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80", "caption": "Nụ cười rạng rỡ của tân cử nhân ngày nhận bằng" },
            { "id": "3", "url": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80", "caption": "Khoảnh khắc xúc động bên gia đình và người thân" },
            { "id": "4", "url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80", "caption": "Khuôn viên giảng đường Bách Khoa dấu yêu" }
          ],
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
            "title": "Celebration of Youth - Uplifting Acoustic",
            "autoPlay": true
          },
          "wishes": {
            "enabled": true,
            "title": "Sổ Lưu Bút Kỷ Yếu Tốt Nghiệp",
            "subtitle": "Gửi những lời chúc mừng tương lai rộng mở và thành công đến Minh Triết"
          },
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-18",
            "note": "Nhắn gửi Triết trước ngày 18/11 để mình chuẩn bị sẵn hoa và đón tiếp mọi người chu đáo nhé!",
            "allowDietaryNotes": false,
            "allowPlusOnes": true
          }
        }
        """;

        var terraSoulArtConfigJson = """
        {
          "format": "art-craft",
          "theme": {
            "primaryColor": "#92400e",
            "secondaryColor": "#b45309",
            "accentColor": "#fef08a",
            "backgroundColor": "#fefce8",
            "textColor": "#292524",
            "fontFamily": "Playfair Display",
            "particlesEffect": "none"
          },
          "hero": {
            "badge": "CONTEMPORARY CERAMIC EXHIBITION",
            "title": "Terra & Soul — Vết Đất & Hồn Gốm",
            "subtitle": "Hành trình đối thoại giữa đất sét thô mộc, lửa đỏ và tâm thức nghệ nhân Wabi-sabi",
            "eventDate": "2026-11-14T15:00:00",
            "coverImageUrl": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&q=80",
            "callToActionText": "Đăng Ký Tham Dự Khai Mạc"
          },
          "coupleOrCelebrant": {
            "type": "event",
            "person1": {
              "name": "Nghệ nhân An Nhiên & Giám tuyển Minh Long",
              "title": "Nghệ Nhân Gốm & Giám Tuyển Nghệ Thuật",
              "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
              "bio": "20 năm theo đuổi kỹ thuật men tro củi cổ truyền kết hợp ngôn ngữ điêu khắc trừu tượng đương đại.",
              "parents": ""
            },
            "storyQuote": "Đất và lửa không chỉ tạo nên hình hài, mà lưu giữ hơi thở của thời gian."
          },
          "eventDetails": {
            "ceremonyName": "Đêm Khai Mạc Vernissage Triển Lãm Terra & Soul",
            "time": "15:00 - Thứ Bảy, 14/11/2026",
            "venueName": "The Factory Contemporary Arts Space",
            "address": "15 Nguyễn Ư Dĩ, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com",
            "dressCode": "Linen Mộc / Nâu Đất / Trắng Tự Nhiên"
          },
          "timeline": [
            { "id": "1", "time": "15:00", "title": "Đón khách, Trà đạo & Thiền vị", "description": "Thưởng thức trà sen cổ thụ trong những chiếc chén gốm mộc nung củi độc bản.", "icon": "GlassWater" },
            { "id": "2", "time": "15:45", "title": "Chia sẻ kỹ thuật men tro củi cổ truyền", "description": "Nghệ nhân chia sẻ về kỹ thuật đốt lò củi Anagama 72 giờ liên tục.", "icon": "Palette" },
            { "id": "3", "time": "16:30", "title": "Tour Giám tuyển 60 tác phẩm độc bản", "description": "Giám tuyển Minh Long dẫn dắt câu chuyện qua từng không gian sắp đặt ánh sáng.", "icon": "Sparkles" },
            { "id": "4", "time": "17:30", "title": "Workshop tự tay chuốt gốm trên bàn xoay", "description": "Khách mời tự do chạm tay vào đất sét thô và tạo hình tác phẩm lưu niệm của riêng mình.", "icon": "Heart" }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80", "caption": "Bình hoa gốm men tro hỏa biến tự nhiên" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80", "caption": "Bộ chén trà Wabi-sabi nung lò củi Anagama" },
            { "id": "3", "url": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80", "caption": "Tác phẩm điêu khắc đất sét trừu tượng Dòng Thời Gian" },
            { "id": "4", "url": "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&q=80", "caption": "Nghệ nhân bên bàn xoay gốm truyền thống" }
          ],
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
            "title": "Zen Pottery & Meditative Flute",
            "autoPlay": true
          },
          "extraSections": [
            {
              "id": "art-faq",
              "type": "qa",
              "enabled": true,
              "title": "Thông Tin Dành Cho Khách Thưởng Lãm",
              "items": [
                { "question": "Tôi có thể mua các tác phẩm trưng bày không?", "answer": "Có, 60 tác phẩm đều được đánh số sưu tập độc bản. Quý khách liên hệ quầy Giám tuyển để đặt mua." },
                { "question": "Triển lãm mở cửa trong bao lâu?", "answer": "Triển lãm kéo dài từ ngày 14/11/2026 đến hết ngày 30/11/2026, mở cửa tự do các ngày trong tuần." }
              ]
            }
          ],
          "wishes": {
            "enabled": true,
            "title": "Sổ Ký Tên Triển Lãm Mỹ Thuật",
            "subtitle": "Lưu lại cảm xúc và suy tưởng của bạn sau khi chiêm ngưỡng các tác phẩm gốm mộc"
          },
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-10",
            "note": "Đăng ký tham dự đêm khai mạc giới hạn 50 người yêu nghệ thuật.",
            "allowDietaryNotes": false,
            "allowPlusOnes": true
          }
        }
        """;

        var spaBeautyConfigJson = """
        {
          "format": "spa-beauty",
          "theme": {
            "primaryColor": "#059669",
            "secondaryColor": "#10b981",
            "accentColor": "#6ee7b7",
            "backgroundColor": "#f0fdf4",
            "textColor": "#064e3b",
            "fontFamily": "Playfair Display",
            "stylePreset": "glass",
            "particlesEffect": "bubbles"
          },
          "hero": {
            "badge": "AURA WELLNESS & LUXURY RETREAT",
            "title": "Aura Spa — Đánh Thức Vẻ Đẹp & Năng Lượng Thuần Khiết",
            "subtitle": "Liệu pháp thải độc thảo mộc cổ truyền kết hợp công nghệ trẻ hóa da hàng đầu Thụy Sĩ.",
            "coverImageUrl": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=80",
            "callToActionText": "Đặt Lịch Trải Nghiệm"
          },
          "eventDetails": {
            "ceremonyName": "Trải Nghiệm Trị Liệu Trẻ Hóa Tự Nhiên",
            "time": "09:00 - 21:00 Hàng ngày",
            "venueName": "Aura Wellness Haven",
            "address": "88 Đường Thảo Điền, Quận 2, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com"
          },
          "servicesGrid": [
            { "id": "svc-1", "name": "Massage Đá Nóng Thảo Dược", "description": "Lưu thông khí huyết, giải tỏa căng thẳng với đá nham thạch Himalaya.", "priceFrom": "650.000 đ/75p" },
            { "id": "svc-2", "name": "Trẻ Hóa Da Tế Bào Tươi", "description": "Cung cấp độ ẩm sâu và collagen hữu cơ phục hồi đàn hồi da.", "priceFrom": "1.200.000 đ/90p" },
            { "id": "svc-3", "name": "Liệu Pháp Tắm Trắng Onsen", "description": "Ngâm khoáng ấm và ủ thảo mộc thiên nhiên sáng mịn làn da.", "priceFrom": "890.000 đ/60p" },
            { "id": "svc-4", "name": "Chăm Sóc Toàn Diện Thải Độc", "description": "Xông hơi tinh dầu tràm trà và massage ấn huyệt chuyên sâu.", "priceFrom": "1.500.000 đ/120p" }
          ],
          "hierarchicalCards": [
            {
              "id": "card-spa-1",
              "title": "Gói Chăm Sóc Thư Thái Thân Tâm",
              "subHeader": "Liệu trình chăm sóc toàn diện 120 phút",
              "content": "Kết hợp tinh hoa thảo mộc tự nhiên và bàn tay điêu luyện của các chuyên gia hàng đầu.",
              "stylePreset": "glass",
              "backgroundColor": "#ffffff",
              "textColor": "#064e3b",
              "animation": "fade-up",
              "subCards": [
                { "id": "sub-spa-1", "title": "Xông Hơi Đá Muối Himalaya", "subHeader": "30 phút", "content": "Thải độc tố, giải phóng năng lượng ứ trệ", "animation": "zoom-in" },
                { "id": "sub-spa-2", "title": "Massage Tinh Dầu Oải Hương", "subHeader": "60 phút", "content": "Thư giãn hệ thần kinh, tái tạo tế bào cơ", "animation": "zoom-in" }
              ]
            }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80", "caption": "Không gian thiền định ngập tràn hương hoa" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80", "caption": "Liệu pháp massage đá nóng thư giãn sâu" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-12-31",
            "note": "Đặt hẹn trước ít nhất 2 giờ để chuẩn bị phòng trị liệu riêng tư tốt nhất."
          },
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
            "title": "Zen Spa Relaxation - Bamboo Flute & Water Stream",
            "autoPlay": true
          }
        }
        """;

        var podcastMusicConfigJson = """
        {
          "format": "podcast-music",
          "theme": {
            "primaryColor": "#8b5cf6",
            "secondaryColor": "#a78bfa",
            "accentColor": "#f472b6",
            "backgroundColor": "#0d0d15",
            "textColor": "#f8fafc",
            "fontFamily": "Inter",
            "stylePreset": "glass",
            "particlesEffect": "cyber-grid"
          },
          "hero": {
            "badge": "NEW ALBUM & PODCAST PREMIERE",
            "title": "Sonic Wave — Tiếng Vọng Trong Tâm Thức",
            "subtitle": "Kênh podcast âm nhạc độc lập khám phá thế giới Ambient, Lo-Fi và những câu chuyện sáng tác.",
            "coverImageUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80",
            "callToActionText": "Nghe Ngay Trên Spotify"
          },
          "eventDetails": {
            "ceremonyName": "Buổi Phát Hành Album Trực Tiếp",
            "time": "20:00 - Thứ Sáu, 16/10/2026",
            "venueName": "Spotify Live Studio & YouTube Music",
            "address": "Phát sóng toàn cầu trực tuyến"
          },
          "featureCardsGrid": [
            { "id": "ep-1", "title": "Tập 01: Vũ Trụ Ambient & Đêm Mưa Hà Nội", "description": "Cuộc trò chuyện cùng nghệ sĩ Hoàng Touliver về sự tối giản trong hòa âm." },
            { "id": "ep-2", "title": "Tập 02: Tần Số Chữa Lành 432Hz", "description": "Giải mã khoa học tâm lý âm học và tác động của sóng âm lên hệ thần kinh." },
            { "id": "ep-3", "title": "Tập 03: Những Giai Điệu Bị Lãng Quên", "description": "Hồi ức về các bản nhạc Jazz của thế kỷ trước được tái sinh qua bàn tay synthesizer." }
          ],
          "hierarchicalCards": [
            {
              "id": "card-music-1",
              "title": "Danh Sách Bài Hát Mới Nhất (Tracklist)",
              "subHeader": "Trải nghiệm âm thanh vòm Spatial Audio",
              "content": "Bao gồm 8 ca khúc nguyên bản hòa quyện cùng âm thanh tự nhiên của đại ngàn và sóng biển.",
              "stylePreset": "glass",
              "backgroundColor": "#181824",
              "textColor": "#ffffff",
              "animation": "fade-up",
              "subCards": [
                { "id": "sub-trk-1", "title": "01. Midnight Solitude", "subHeader": "04:15", "content": "Ambient Synth & Piano Solo", "animation": "zoom-in" },
                { "id": "sub-trk-2", "title": "02. Echoes in the Rain", "subHeader": "03:48", "content": "Lo-Fi Beats & Cellos", "animation": "zoom-in" }
              ]
            }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80", "caption": "Phòng thu âm chuyên nghiệp với dàn mixer analog" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80", "caption": "Đêm nhạc thính phòng giới hạn người nghe" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-10-15",
            "note": "Đăng ký nhận thông báo khi tập mới phát hành độc quyền trên podcast."
          },
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
            "title": "Sonic Wave Ambient Theme - Synthwave Chill",
            "autoPlay": true
          }
        }
        """;

        var techStartupConfigJson = """
        {
          "format": "tech-startup",
          "theme": {
            "primaryColor": "#00f0ff",
            "secondaryColor": "#3b82f6",
            "accentColor": "#ffe600",
            "backgroundColor": "#0b0f19",
            "textColor": "#f8fafc",
            "fontFamily": "Inter",
            "stylePreset": "glass",
            "particlesEffect": "cyber-grid"
          },
          "hero": {
            "badge": "SEED ROUND $3.5M ANNOUNCEMENT",
            "title": "Nexus AI — Nền Tảng Tự Động Hóa Trí Tuệ Đa Tác Nhân",
            "subtitle": "Trao quyền cho các kỹ sư xây dựng hệ thống Autonomous Agents vận hành 24/7 với độ tin cậy tuyệt đối.",
            "coverImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80",
            "callToActionText": "Nhận Bản Demo & Whitepaper"
          },
          "eventDetails": {
            "ceremonyName": "Nexus AI Global Launch & Pitch Day",
            "time": "14:00 - Thứ Tư, 18/11/2026",
            "venueName": "Silicon Valley Innovation Center & Live Stream",
            "address": "Palo Alto, California & Trực tuyến toàn cầu"
          },
          "featureCardsGrid": [
            { "id": "feat-1", "title": "Multi-Agent Coordination", "description": "Giao thức định tuyến thông minh cho phép các mô hình AI cộng tác giải quyết bài toán phức tạp." },
            { "id": "feat-2", "title": "Zero-Latency Memory Vault", "description": "Lưu trữ bộ nhớ ngữ cảnh vector siêu tốc với thời gian truy xuất dưới 2 mili-giây." },
            { "id": "feat-3", "title": "Enterprise Guardrails", "description": "Hệ thống phòng vệ an ninh hai tầng ngăn ngừa prompt injection và rò rỉ dữ liệu." }
          ],
          "hierarchicalCards": [
            {
              "id": "card-startup-1",
              "title": "Lộ Trình Phát Triển Sản Phẩm (Roadmap 2026-2027)",
              "subHeader": "Từ phiên bản Alpha đến Hệ sinh thái AI mở",
              "content": "Cam kết mang đến cho cộng đồng công nghệ những công cụ lập trình mạnh mẽ nhất.",
              "stylePreset": "glass",
              "backgroundColor": "#131b2e",
              "textColor": "#f8fafc",
              "animation": "fade-up",
              "subCards": [
                { "id": "sub-st-1", "title": "Q4 2026: Private Alpha", "subHeader": "500 Developers", "content": "Mở quyền truy cập sớm cho các đối tác Enterprise", "animation": "zoom-in" },
                { "id": "sub-st-2", "title": "Q1 2027: Public Beta & SDK", "subHeader": "Open Source", "content": "Phát hành Python & TypeScript SDK chính thức", "animation": "zoom-in" }
              ]
            }
          ],
          "metrics": [
            { "value": "$3.5M", "label": "Vốn vòng Hạt Giống từ quỹ mạo hiểm hàng đầu" },
            { "value": "12,000+", "label": "Lập trình viên trong danh sách chờ Waitlist" },
            { "value": "99.99%", "label": "Uptime cam kết cho dịch vụ đám mây" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-11-15",
            "note": "Đăng ký tham gia để nhận vé mời VIP tại sự kiện công bố sản phẩm."
          },
          "music": {
            "enabled": false
          }
        }
        """;

        var photographyConfigJson = """
        {
          "format": "photography",
          "theme": {
            "primaryColor": "#d4af37",
            "secondaryColor": "#aa771c",
            "accentColor": "#fff8dc",
            "backgroundColor": "#121214",
            "textColor": "#f5f5f0",
            "fontFamily": "Playfair Display",
            "stylePreset": "luxury",
            "particlesEffect": "sparkles"
          },
          "hero": {
            "badge": "VISUAL STORYTELLING & FINE ART",
            "title": "Lumina Studio — Ghi Lại Vẻ Đẹp Của Từng Khoảnh Khắc",
            "subtitle": "Nhiếp ảnh chân dung, cưới nghệ thuật và sự kiện độc bản với ánh sáng điện ảnh kinh điển.",
            "coverImageUrl": "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1600&q=80",
            "callToActionText": "Đặt Lịch Chụp Ảnh"
          },
          "eventDetails": {
            "ceremonyName": "Triển Lãm Ảnh & Workshop Nhiếp Ảnh Ánh Sáng",
            "time": "10:00 - 18:00 Hàng ngày",
            "venueName": "Lumina Creative Hub",
            "address": "25 Ngô Thời Nhiệm, Phường 6, Quận 3, TP. Hồ Chí Minh",
            "mapEmbedUrl": "https://maps.google.com",
            "mapDirectLink": "https://maps.google.com"
          },
          "servicesGrid": [
            { "id": "pack-1", "name": "Gói Ảnh Cưới Pre-Wedding", "description": "Chụp ngoại cảnh hoặc studio phong cách tối giản nghệ thuật Châu Âu.", "priceFrom": "12.000.000 đ" },
            { "id": "pack-2", "name": "Chân Dung Nghệ Thuật (Fine Art)", "description": "Ánh sáng studio điện ảnh, tôn vinh cá tính và thần thái riêng biệt.", "priceFrom": "3.500.000 đ" },
            { "id": "pack-3", "name": "Kỷ Niệm Gia Đình & Bầu", "description": "Lưu giữ khoảnh khắc ấm áp sum vầy của các thành viên gia đình.", "priceFrom": "5.000.000 đ" },
            { "id": "pack-4", "name": "Sự Kiện Cao Cấp & Fashion", "description": "Ghi hình sự kiện doanh nghiệp, lookbook thời trang thương hiệu.", "priceFrom": "8.000.000 đ" }
          ],
          "hierarchicalCards": [
            {
              "id": "card-photo-1",
              "title": "Quy Trình Sáng Tác Ảnh Độc Bản",
              "subHeader": "Từ lên ý tưởng concept đến ấn phẩm hoàn thiện",
              "content": "Chúng tôi không chỉ bấm máy, chúng tôi lắng nghe câu chuyện của bạn và vẽ nên tác phẩm bằng ánh sáng.",
              "stylePreset": "luxury",
              "backgroundColor": "#1a1a1e",
              "textColor": "#f5f5f0",
              "animation": "fade-up",
              "subCards": [
                { "id": "sub-ph-1", "title": "Bước 1: Moodboard & Styling", "subHeader": "Thảo luận", "content": "Định hình phong cách, màu sắc và trang phục phù hợp", "animation": "zoom-in" },
                { "id": "sub-ph-2", "title": "Bước 2: Buổi Chụp Cảm Xúc", "subHeader": "Shooting Day", "content": "Tạo không khí tự nhiên, thoải mái nhất cho khách hàng", "animation": "zoom-in" }
              ]
            }
          ],
          "gallery": [
            { "id": "1", "url": "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80", "caption": "Khoảnh khắc đôi lứa say đắm trong ánh hoàng hôn" },
            { "id": "2", "url": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", "caption": "Nụ cười rạng rỡ của cô dâu ngày trọng đại" }
          ],
          "rsvp": {
            "enabled": true,
            "deadline": "2026-12-31",
            "note": "Vui lòng đặt lịch trước ít nhất 1 tuần để studio chuẩn bị concept tốt nhất."
          },
          "music": {
            "enabled": true,
            "audioUrl": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
            "title": "Lumina Fine Art - Cinematic Piano",
            "autoPlay": true
          }
        }
        """;

        // 4. Seed Templates (23 Templates: Diverse Formats & Categories)
        var allTemplateDefinitions = new[]
        {
            new
            {
                Name = "Elegance Blossom",
                Slug = "elegance-blossom",
                Description = "Mẫu thiệp cưới sang trọng phong cách Châu Âu, tone màu hồng pastel dịu dàng với hiệu ứng cánh hoa bay lãng mạn.",
                CategorySlug = "wedding",
                CategoryName = "Wedding",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                PreviewUrl = "/preview/elegance-blossom",
                LongPreviewUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                Badge = "Premium",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
                MusicTitle = (string?)"A Thousand Years - Piano Instrumental",
                ConfigJson = weddingConfigJson
            },
            new
            {
                Name = "Golden Glamour",
                Slug = "golden-glamour",
                Description = "Mẫu thiệp sinh nhật dạ tiệc sang trọng với tone vàng kim, hiệu ứng pháo hoa giấy confetti lung linh rực rỡ.",
                CategorySlug = "birthday",
                CategoryName = "Birthday",
                ThumbnailUrl = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
                PreviewUrl = "/preview/golden-glamour",
                LongPreviewUrl = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
                Badge = "Hot",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
                MusicTitle = (string?)"Celebration Night - Acoustic Vibe",
                ConfigJson = birthdayConfigJson
            },
            new
            {
                Name = "Sweet Romance",
                Slug = "sweet-romance",
                Description = "Mẫu thiệp cưới cổ điển phương Tây, font chữ thanh lịch cùng giai điệu vĩ cầm du dương.",
                CategorySlug = "wedding",
                CategoryName = "Wedding",
                ThumbnailUrl = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
                PreviewUrl = "/preview/sweet-romance",
                LongPreviewUrl = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
                Badge = "Basic",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
                MusicTitle = (string?)"Can't Help Falling in Love - Violin Cover",
                ConfigJson = weddingConfigJson.Replace("Minh & Linh", "Tuấn & Trang")
            },
            new
            {
                Name = "Eternal Love",
                Slug = "eternal-love",
                Description = "Mẫu thiệp cưới tối giản hiện đại (Minimalist), tinh khôi và trường tồn cùng năm tháng.",
                CategorySlug = "wedding",
                CategoryName = "Wedding",
                ThumbnailUrl = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
                PreviewUrl = "/preview/eternal-love",
                LongPreviewUrl = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
                Badge = "Free",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3",
                MusicTitle = (string?)"River Flows in You - Yiruma",
                ConfigJson = weddingConfigJson.Replace("Minh & Linh", "Bảo & Vy")
            },
            new
            {
                Name = "Pastel Dream Baby",
                Slug = "pastel-dream-baby",
                Description = "Mẫu thiệp thôi nôi đầy tháng ngọt ngào với gam màu baby pastel, hình vẽ ngộ nghĩnh và lời nhắn ấm áp.",
                CategorySlug = "baby-shower",
                CategoryName = "BabyShower",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
                PreviewUrl = "/preview/pastel-dream-baby",
                LongPreviewUrl = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
                Badge = "New",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3",
                MusicTitle = (string?)"Lullaby Goodnight - Music Box",
                ConfigJson = babyShowerConfigJson
            },
            new
            {
                Name = "Silver Jubilee",
                Slug = "silver-jubilee",
                Description = "Mẫu thiệp kỷ niệm ngày cưới bạc và vàng, gắn kết những khoảnh khắc yêu thương suốt nhiều thập kỷ.",
                CategorySlug = "anniversary",
                CategoryName = "Anniversary",
                ThumbnailUrl = "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
                PreviewUrl = "/preview/silver-jubilee",
                LongPreviewUrl = "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
                Badge = "Premium",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d659ad76.mp3",
                MusicTitle = (string?)"Memories of Love - Orchestra",
                ConfigJson = anniversaryConfigJson
            },
            new
            {
                Name = "Traditional Grace",
                Slug = "traditional-grace",
                Description = "Mẫu thiệp lễ đính hôn và lễ ăn hỏi truyền thống Á Đông kết hợp sự thanh lịch hiện đại.",
                CategorySlug = "engagement",
                CategoryName = "Engagement",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                PreviewUrl = "/preview/traditional-grace",
                LongPreviewUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                Badge = "New",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
                MusicTitle = (string?)"Beautiful In White - Acoustic Guitar",
                ConfigJson = engagementConfigJson
            },
            new
            {
                Name = "Virtual AI Summit 2026",
                Slug = "ai-summit-pro",
                Description = "Hội nghị thượng đỉnh quy tụ 50+ chuyên gia AI hàng đầu thế giới thảo luận về tương lai của Autonomous Agents.",
                CategorySlug = "conference",
                CategoryName = "Conference",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                PreviewUrl = "/preview/ai-summit-pro",
                LongPreviewUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                Badge = "Premium",
                AudioUrl = (string?)null,
                MusicTitle = (string?)null,
                ConfigJson = aiSummitConfigJson
            },
            new
            {
                Name = "Drift ADHD Planner",
                Slug = "drift-planner-app",
                Description = "Ứng dụng quản lý thời gian và năng suất nhẹ nhàng dành riêng cho não bộ ADHD, không áp lực.",
                CategorySlug = "app-showcase",
                CategoryName = "AppShowcase",
                ThumbnailUrl = "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
                PreviewUrl = "/preview/drift-planner-app",
                LongPreviewUrl = "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
                Badge = "Hot",
                AudioUrl = (string?)null,
                MusicTitle = (string?)null,
                ConfigJson = driftPlannerConfigJson
            },
            new
            {
                Name = "SmileCraft Dental Clinic",
                Slug = "smilecraft-dental",
                Description = "Phòng khám nha khoa thẩm mỹ cao cấp chuẩn Thụy Sỹ với công nghệ Scan 3D không xâm lấn.",
                CategorySlug = "medical",
                CategoryName = "Medical",
                ThumbnailUrl = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
                PreviewUrl = "/preview/smilecraft-dental",
                LongPreviewUrl = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
                Badge = "Premium",
                AudioUrl = (string?)null,
                MusicTitle = (string?)null,
                ConfigJson = dentalClinicConfigJson
            },
            new
            {
                Name = "CloudFlow Modern SaaS",
                Slug = "cloudflow-saas",
                Description = "Nền tảng tự động hóa luồng dữ liệu doanh nghiệp thời gian thực với độ trễ dưới 5ms.",
                CategorySlug = "saas",
                CategoryName = "SaaS",
                ThumbnailUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
                PreviewUrl = "/preview/cloudflow-saas",
                LongPreviewUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
                Badge = "New",
                AudioUrl = (string?)null,
                MusicTitle = (string?)null,
                ConfigJson = modernSaasConfigJson
            },
            // 8 New Diverse Templates
            new
            {
                Name = "L'Aura Fine Dining & Bistro",
                Slug = "laura-bistro-gourmet",
                Description = "Mẫu website nhà hàng ẩm thực Pháp Fine Dining thượng lưu với menu món ký danh, đặt bàn VIP và dạ tiệc thử vị.",
                CategorySlug = "restaurant",
                CategoryName = "Restaurant",
                ThumbnailUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
                PreviewUrl = "/preview/laura-bistro-gourmet",
                LongPreviewUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
                Badge = "Hot",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/05/16/audio_c16e78cfbc.mp3",
                MusicTitle = (string?)"French Cafe Jazz & Smooth Acoustic",
                ConfigJson = lauraBistroConfigJson
            },
            new
            {
                Name = "Apex Titanium Fitness Club",
                Slug = "apex-titanium-fitness",
                Description = "Mẫu landing page phòng tập thể hình công nghệ cao, bảng giá hội viên, chỉ số năng lực và đăng ký tập thử miễn phí.",
                CategorySlug = "fitness",
                CategoryName = "Fitness",
                ThumbnailUrl = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
                PreviewUrl = "/preview/apex-titanium-fitness",
                LongPreviewUrl = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
                Badge = "Premium",
                AudioUrl = (string?)null,
                MusicTitle = (string?)null,
                ConfigJson = apexFitnessConfigJson
            },
            new
            {
                Name = "Warm Nest Modern Villa",
                Slug = "warm-nest-housewarming",
                Description = "Mẫu thiệp mời tân gia ấm áp, giới thiệu không gian tổ ấm mới, sơ đồ chỉ đường và hộp quà mừng VietQR.",
                CategorySlug = "housewarming",
                CategoryName = "Housewarming",
                ThumbnailUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
                PreviewUrl = "/preview/warm-nest-housewarming",
                LongPreviewUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
                Badge = "Hot",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
                MusicTitle = (string?)"Home Sweet Home - Acoustic Guitar Melody",
                ConfigJson = warmNestConfigJson
            },
            new
            {
                Name = "Azure Breeze Tropical Wedding",
                Slug = "azure-breeze-beach-wedding",
                Description = "Mẫu thiệp cưới bãi biển nhiệt đới lãng mạn phong cách Destination Wedding với tông xanh biển tươi mát, nhạc ukulele và hoàng hôn lộng lẫy.",
                CategorySlug = "wedding",
                CategoryName = "Wedding",
                ThumbnailUrl = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80",
                PreviewUrl = "/preview/azure-breeze-beach-wedding",
                LongPreviewUrl = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80",
                Badge = "Premium",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3",
                MusicTitle = (string?)"Ocean Waves & Acoustic Ukulele Romance",
                ConfigJson = azureBreezeWeddingConfigJson
            },
            new
            {
                Name = "Prompt Engineering & GenAI Masterclass",
                Slug = "genai-prompt-masterclass",
                Description = "Landing page tuyển sinh khóa học công nghệ AI chuyên sâu với lộ trình học, diễn giả quốc tế, bảng giá vé và FAQ giải đáp.",
                CategorySlug = "education",
                CategoryName = "Education",
                ThumbnailUrl = "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
                PreviewUrl = "/preview/genai-prompt-masterclass",
                LongPreviewUrl = "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
                Badge = "New",
                AudioUrl = (string?)null,
                MusicTitle = (string?)null,
                ConfigJson = genAiMasterclassConfigJson
            },
            new
            {
                Name = "The Horizon Grand Luxury Villa",
                Slug = "horizon-luxury-villas",
                Description = "Mẫu giới thiệu dự án bất động sản nghỉ dưỡng siêu sang trên vách biển với kiến trúc độc bản, tiện ích 6 sao và đăng ký tham quan bảo mật.",
                CategorySlug = "real-estate",
                CategoryName = "RealEstate",
                ThumbnailUrl = "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
                PreviewUrl = "/preview/horizon-luxury-villas",
                LongPreviewUrl = "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
                Badge = "Premium",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d659ad76.mp3",
                MusicTitle = (string?)"Elegance Ambience - Soft Classical Piano",
                ConfigJson = horizonVillasConfigJson
            },
            new
            {
                Name = "Academic Glory Graduation",
                Slug = "academic-glory-graduation",
                Description = "Mẫu thiệp mời lễ tốt nghiệp đại học trang trọng, lịch trình trao bằng vinh danh, album kỷ yếu và sổ lưu bút chúc mừng tương lai.",
                CategorySlug = "education",
                CategoryName = "Education",
                ThumbnailUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
                PreviewUrl = "/preview/academic-glory-graduation",
                LongPreviewUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
                Badge = "New",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
                MusicTitle = (string?)"Celebration of Youth - Uplifting Acoustic",
                ConfigJson = academicGloryConfigJson
            },
            new
            {
                Name = "Terra & Soul Ceramic Exhibition",
                Slug = "terra-soul-art-exhibition",
                Description = "Mẫu thiệp mời triển lãm mỹ thuật và gốm thủ công phong cách Wabi-sabi mộc mạc, giới thiệu tác phẩm nghệ thuật, workshop và đêm tiệc Vernissage.",
                CategorySlug = "art-craft",
                CategoryName = "ArtCraft",
                ThumbnailUrl = "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
                PreviewUrl = "/preview/terra-soul-art-exhibition",
                LongPreviewUrl = "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
                Badge = "Premium",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
                MusicTitle = (string?)"Zen Pottery & Meditative Flute",
                ConfigJson = terraSoulArtConfigJson
            },
            new
            {
                Name = "Aura Wellness & Luxury Spa",
                Slug = "aura-wellness-spa",
                Description = "Mẫu landing page trung tâm spa và chăm sóc sắc đẹp cao cấp, trị liệu thảo mộc tự nhiên, bảng giá dịch vụ và đặt lịch trực tuyến.",
                CategorySlug = "spa-beauty",
                CategoryName = "SpaBeauty",
                ThumbnailUrl = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
                PreviewUrl = "/preview/aura-wellness-spa",
                LongPreviewUrl = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
                Badge = "Hot",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
                MusicTitle = (string?)"Zen Spa Relaxation - Bamboo Flute & Water Stream",
                ConfigJson = spaBeautyConfigJson
            },
            new
            {
                Name = "Sonic Wave Podcast & Music",
                Slug = "sonic-wave-podcast",
                Description = "Mẫu landing page giới thiệu podcast âm nhạc độc lập, phát hành album mới, danh sách bài hát và liên kết nền tảng trực tuyến.",
                CategorySlug = "podcast-music",
                CategoryName = "PodcastMusic",
                ThumbnailUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
                PreviewUrl = "/preview/sonic-wave-podcast",
                LongPreviewUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
                Badge = "New",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
                MusicTitle = (string?)"Sonic Wave Ambient Theme - Synthwave Chill",
                ConfigJson = podcastMusicConfigJson
            },
            new
            {
                Name = "Nexus AI Cloud & NextGen Startup",
                Slug = "nexus-ai-startup",
                Description = "Landing page gọi vốn công nghệ và giới thiệu sản phẩm trí tuệ nhân tạo đa tác nhân, lộ trình phát triển và đăng ký trải nghiệm sớm.",
                CategorySlug = "tech-startup",
                CategoryName = "TechStartup",
                ThumbnailUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
                PreviewUrl = "/preview/nexus-ai-startup",
                LongPreviewUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
                Badge = "Premium",
                AudioUrl = (string?)null,
                MusicTitle = (string?)null,
                ConfigJson = techStartupConfigJson
            },
            new
            {
                Name = "Lumina Fine Art Photography & Studio",
                Slug = "lumina-photography-studio",
                Description = "Mẫu portfolio nhiếp ảnh nghệ thuật, chân dung điện ảnh và ảnh cưới phong cách Châu Âu với quy trình sáng tác chuyên nghiệp.",
                CategorySlug = "photography",
                CategoryName = "Photography",
                ThumbnailUrl = "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
                PreviewUrl = "/preview/lumina-photography-studio",
                LongPreviewUrl = "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
                Badge = "Hot",
                AudioUrl = (string?)"https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
                MusicTitle = (string?)"Lumina Fine Art - Cinematic Piano",
                ConfigJson = photographyConfigJson
            }
        };

        var existingTemplates = await context.Templates.ToListAsync();
        var templateDict = existingTemplates.ToDictionary(t => t.Slug, t => t);

        var templatesToAdd = new List<Template>();
        foreach (var def in allTemplateDefinitions)
        {
            if (!templateDict.ContainsKey(def.Slug))
            {
                var categoryId = categoryDict.TryGetValue(def.CategorySlug, out var cat) ? cat.Id : (Guid?)null;
                var tmpl = Template.Create(
                    def.Name,
                    def.Slug,
                    def.Description,
                    categoryId,
                    def.CategoryName,
                    def.ThumbnailUrl,
                    def.PreviewUrl,
                    def.LongPreviewUrl,
                    def.Badge,
                    def.AudioUrl,
                    def.MusicTitle,
                    def.ConfigJson);

                templatesToAdd.Add(tmpl);
                templateDict[def.Slug] = tmpl;
            }
        }

        if (templatesToAdd.Count > 0)
        {
            context.Templates.AddRange(templatesToAdd);
            await context.SaveChangesAsync();
        }

        var t1 = templateDict.GetValueOrDefault("elegance-blossom") ?? templateDict.Values.First();
        var t2 = templateDict.GetValueOrDefault("golden-glamour") ?? t1;
        var t5 = templateDict.GetValueOrDefault("pastel-dream-baby") ?? t1;
        var t6 = templateDict.GetValueOrDefault("silver-jubilee") ?? t1;
        var tAiSummit = templateDict.GetValueOrDefault("ai-summit-pro") ?? t1;
        var tDriftPlanner = templateDict.GetValueOrDefault("drift-planner-app") ?? t1;

        // 5. Seed UserCustomizations (Published customized landing pages)
        UserCustomization? c1 = null;
        UserCustomization? c2 = null;
        UserCustomization? c3 = null;
        UserCustomization? c4 = null;
        UserCustomization? c5 = null;
        UserCustomization? c6 = null;

        if (!await context.UserCustomizations.AnyAsync())
        {
            c1 = UserCustomization.Create(
                normalUser.Id,
                t1.Id,
                "Đám Cưới Minh & Linh",
                "minh-linh-wedding",
                weddingConfigJson,
                true);

            c2 = UserCustomization.Create(
                normalUser.Id,
                t5.Id,
                "Thôi Nôi Bé Bắp Tròn 1 Tuổi",
                "be-bap-1-tuoi",
                babyShowerConfigJson,
                true);

            c3 = UserCustomization.Create(
                adminUser.Id,
                t2.Id,
                "Dạ Tiệc Sinh Nhật Hoàng Nam",
                "hoang-nam-30th",
                birthdayConfigJson,
                true);

            c4 = UserCustomization.Create(
                adminUser.Id,
                t6.Id,
                "Kỷ Niệm 25 Năm Ngày Cưới - Huy & Phương",
                "huy-phuong-silver-jubilee",
                anniversaryConfigJson,
                true);

            c5 = UserCustomization.Create(
                adminUser.Id,
                tAiSummit.Id,
                "Virtual AI Summit 2026 - Global Keynote",
                "global-ai-summit-2026",
                aiSummitConfigJson,
                true);

            c6 = UserCustomization.Create(
                normalUser.Id,
                tDriftPlanner.Id,
                "Drift — Không Gian Năng Suất Nhẹ Nhàng",
                "drift-workspace-adhd",
                driftPlannerConfigJson,
                true);

            context.UserCustomizations.AddRange(c1, c2, c3, c4, c5, c6);
            await context.SaveChangesAsync();
        }
        else
        {
            c1 = await context.UserCustomizations.FirstOrDefaultAsync(c => c.Slug == "minh-linh-wedding");
            c2 = await context.UserCustomizations.FirstOrDefaultAsync(c => c.Slug == "be-bap-1-tuoi");
            c3 = await context.UserCustomizations.FirstOrDefaultAsync(c => c.Slug == "hoang-nam-30th");
            c4 = await context.UserCustomizations.FirstOrDefaultAsync(c => c.Slug == "huy-phuong-silver-jubilee");
            c5 = await context.UserCustomizations.FirstOrDefaultAsync(c => c.Slug == "global-ai-summit-2026");
            c6 = await context.UserCustomizations.FirstOrDefaultAsync(c => c.Slug == "drift-workspace-adhd");
        }

        // 6. Seed RsvpEntries
        if (!await context.RsvpEntries.AnyAsync())
        {
            var fallbackCustomization = c1 ?? await context.UserCustomizations.FirstOrDefaultAsync();
            var custom1Id = c1?.Id ?? fallbackCustomization?.Id;
            var custom3Id = c3?.Id ?? fallbackCustomization?.Id;

            var rsvpList = new List<RsvpEntry>();

            if (custom1Id.HasValue)
            {
                rsvpList.Add(RsvpEntry.Create(
                    custom1Id,
                    "Trần Anh Tuấn",
                    "tuan.tran@gmail.com",
                    "0901234567",
                    "attending",
                    2,
                    "Không ăn hải sản",
                    "Chúc hai bạn trăm năm hạnh phúc!"));

                rsvpList.Add(RsvpEntry.Create(
                    custom1Id,
                    "Phạm Hồng Nhung",
                    "nhung.pham@gmail.com",
                    "0912345678",
                    "attending",
                    1,
                    "Ăn chay",
                    "Happy Wedding!"));

                rsvpList.Add(RsvpEntry.Create(
                    custom1Id,
                    "Lê Quốc Bảo",
                    "bao.le@gmail.com",
                    "0923456789",
                    "declined",
                    1,
                    null,
                    "Hôm đó mình bận công tác, chúc hai bạn hạnh phúc!"));

                rsvpList.Add(RsvpEntry.Create(
                    custom1Id,
                    "Ngô Mai Phương",
                    "phuong.ngo@gmail.com",
                    "0934567890",
                    "attending",
                    2,
                    null,
                    "Trăm năm hạnh phúc viên mãn nhé hai bạn!"));
            }

            if (custom3Id.HasValue)
            {
                rsvpList.Add(RsvpEntry.Create(
                    custom3Id,
                    "Đỗ Thành Đạt",
                    "dat.do@gmail.com",
                    "0945678901",
                    "attending",
                    1,
                    null,
                    "Sinh nhật vui vẻ, tuổi mới bứt phá rực rỡ!"));

                rsvpList.Add(RsvpEntry.Create(
                    custom3Id,
                    "Vũ Kim Ngân",
                    "ngan.vu@gmail.com",
                    "0956789012",
                    "attending",
                    2,
                    "Dị ứng đậu phộng",
                    "Happy 30th Birthday!"));
            }

            if (rsvpList.Count > 0)
            {
                context.RsvpEntries.AddRange(rsvpList);
                await context.SaveChangesAsync();
            }
        }

        // 7. Seed GuestbookEntries
        if (!await context.GuestbookEntries.AnyAsync())
        {
            var fallbackCustomization = c1 ?? await context.UserCustomizations.FirstOrDefaultAsync();
            var custom1Id = c1?.Id ?? fallbackCustomization?.Id;
            var custom2Id = c2?.Id ?? fallbackCustomization?.Id;
            var custom3Id = c3?.Id ?? fallbackCustomization?.Id;

            var guestbookList = new List<GuestbookEntry>();

            if (custom1Id.HasValue)
            {
                guestbookList.Add(GuestbookEntry.Create(
                    custom1Id,
                    "Gia đình Bác Hai",
                    "Chúc hai cháu đầu bạc răng long, thuận vợ thuận chồng tát biển đông cũng cạn."));

                guestbookList.Add(GuestbookEntry.Create(
                    custom1Id,
                    "Nhóm Bạn Đại Học",
                    "Chúc mừng Minh thoát ế thành công rực rỡ! Nhậu hết mình ngày vui nhé bạn hiền!"));

                guestbookList.Add(GuestbookEntry.Create(
                    custom1Id,
                    "Thanh Thảo",
                    "Cô dâu xinh đẹp tuyệt vời, chúc hai bạn một đời an yên và hạnh phúc!"));

                guestbookList.Add(GuestbookEntry.Create(
                    custom1Id,
                    "Hải Đăng",
                    "Mừng hạnh phúc hai bạn! Thiệp cưới online làm xịn xò và ấn tượng quá!"));
            }

            if (custom2Id.HasValue)
            {
                guestbookList.Add(GuestbookEntry.Create(
                    custom2Id,
                    "Dì Út",
                    "Chúc bé Bắp mau ăn chóng lớn, luôn vui vẻ và là niềm tự hào của ba mẹ!"));

                guestbookList.Add(GuestbookEntry.Create(
                    custom2Id,
                    "Chú Hùng",
                    "Mừng sinh nhật đầu tiên của Bắp, chúc con một đời bình an!"));
            }

            if (custom3Id.HasValue)
            {
                guestbookList.Add(GuestbookEntry.Create(
                    custom3Id,
                    "Anh Em Phòng Kỹ Thuật",
                    "Chúc sếp tuổi 30 dồi dào sức khỏe, dự án nào cũng thắng lớn!"));
            }

            if (guestbookList.Count > 0)
            {
                context.GuestbookEntries.AddRange(guestbookList);
                await context.SaveChangesAsync();
            }
        }

        // 8. Seed Products (Pricing Plans)
        if (!await context.Products.AnyAsync())
        {
            var p1 = Product.Create(
                "Gói Tiêu Chuẩn (Standard)",
                "Đầy đủ tính năng thiệp cưới online, lưu trữ 6 tháng, nhạc nền tự chọn, không giới hạn RSVP.",
                199000m);

            var p2 = Product.Create(
                "Gói Cao Cấp (Premium VIP)",
                "Lưu trữ vĩnh viễn, tên miền riêng, hiệu ứng 3D, album ảnh HD không giới hạn, trích xuất sổ lưu bút Excel.",
                399000m);

            var p3 = Product.Create(
                "Gói Đa Sự Kiện (Combo Wedding)",
                "Trọn gói 2 thiệp mời cho Lễ Đính Hôn & Lễ Thành Hôn, đồng bộ danh sách khách mời.",
                599000m);

            var p4 = Product.Create(
                "Gói Thiết Kế Riêng (Bespoke)",
                "Designer thiết kế độc quyền theo concept riêng, hỗ trợ chỉnh sửa không giới hạn, tích hợp QR mừng cưới chuyển khoản.",
                899000m);

            context.Products.AddRange(p1, p2, p3, p4);
            await context.SaveChangesAsync();
        }
    }
}
