namespace TemplateLandingPage.Persistence.Data;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Domain.Entities;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        await context.Database.EnsureCreatedAsync();

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

        // 2. Seed 9 Standard Categories (Wedding & Diverse Formats)
        Category weddingCat;
        Category engagementCat;
        Category birthdayCat;
        Category anniversaryCat;
        Category babyShowerCat;
        Category conferenceCat;
        Category appShowcaseCat;
        Category medicalCat;
        Category saasCat;

        if (!await context.Categories.AnyAsync())
        {
            weddingCat = Category.Create(
                "Thiệp Cưới",
                "wedding",
                "Mẫu thiệp cưới online lãng mạn, hiện đại tích hợp album ảnh, âm nhạc và xác nhận RSVP.",
                "Heart",
                1,
                true);

            engagementCat = Category.Create(
                "Lễ Đính Hôn",
                "engagement",
                "Thiệp lễ ăn hỏi, đính hôn phong cách thanh lịch truyền thống kết hợp hiện đại.",
                "Ring",
                2,
                true);

            birthdayCat = Category.Create(
                "Sinh Nhật",
                "birthday",
                "Mẫu thiệp sinh nhật dạ tiệc sôi động, pháo hoa giấy và âm thanh lôi cuốn.",
                "Cake",
                3,
                true);

            anniversaryCat = Category.Create(
                "Kỷ Niệm Ngày Cưới",
                "anniversary",
                "Ôn lại chặng đường tình yêu ngọt ngào với thiệp kỷ niệm ngày chung đôi.",
                "Sparkles",
                4,
                true);

            babyShowerCat = Category.Create(
                "Thôi Nôi & Đầy Tháng",
                "baby-shower",
                "Chào đón thiên thần nhỏ với những thiết kế dễ thương, ấm áp.",
                "Baby",
                5,
                true);

            conferenceCat = Category.Create(
                "Hội Nghị & Sự Kiện",
                "conference",
                "Hội nghị cấp cao, công nghệ, diễn giả và hệ thống bán vé trực tuyến.",
                "Mic",
                6,
                true);

            appShowcaseCat = Category.Create(
                "Ứng Dụng & Năng Suất",
                "app-showcase",
                "Landing page ứng dụng di động, video demo và triết lý sản phẩm.",
                "Layers",
                7,
                true);

            medicalCat = Category.Create(
                "Y Tế & Nha Khoa",
                "medical",
                "Phòng khám nha khoa cao cấp, danh mục dịch vụ và đặt lịch hẹn tư vấn.",
                "Stethoscope",
                8,
                true);

            saasCat = Category.Create(
                "Nền Tảng SaaS",
                "saas",
                "Giải pháp phần mềm B2B, tự động hóa quy trình và bảng giá dịch vụ.",
                "Cpu",
                9,
                true);

            context.Categories.AddRange(weddingCat, engagementCat, birthdayCat, anniversaryCat, babyShowerCat, conferenceCat, appShowcaseCat, medicalCat, saasCat);
            await context.SaveChangesAsync();
        }
        else
        {
            weddingCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "wedding") ?? await context.Categories.FirstAsync();
            engagementCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "engagement") ?? weddingCat;
            birthdayCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "birthday") ?? weddingCat;
            anniversaryCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "anniversary") ?? weddingCat;
            babyShowerCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "baby-shower") ?? birthdayCat;
            conferenceCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "conference") ?? weddingCat;
            appShowcaseCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "app-showcase") ?? weddingCat;
            medicalCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "medical") ?? weddingCat;
            saasCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "saas") ?? weddingCat;
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

        // 4. Seed Templates (Rich Mockup, Audio, LongPreview for all Categories)
        Template t1;
        Template t2;
        Template t5;
        Template t6;
        Template tAiSummit;
        Template tDriftPlanner;
        Template tSmileCraft;
        Template tCloudFlow;

        if (!await context.Templates.AnyAsync())
        {
            t1 = Template.Create(
                "Elegance Blossom",
                "elegance-blossom",
                "Mẫu thiệp cưới sang trọng phong cách Châu Âu, tone màu hồng pastel dịu dàng với hiệu ứng cánh hoa bay lãng mạn.",
                weddingCat.Id,
                "Wedding",
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                "/preview/elegance-blossom",
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                "Premium",
                "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
                "A Thousand Years - Piano Instrumental",
                weddingConfigJson);

            t2 = Template.Create(
                "Golden Glamour",
                "golden-glamour",
                "Mẫu thiệp sinh nhật dạ tiệc sang trọng với tone vàng kim, hiệu ứng pháo hoa giấy confetti lung linh rực rỡ.",
                birthdayCat.Id,
                "Birthday",
                "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
                "/preview/golden-glamour",
                "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
                "Hot",
                "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
                "Celebration Night - Acoustic Vibe",
                birthdayConfigJson);

            var t3 = Template.Create(
                "Sweet Romance",
                "sweet-romance",
                "Mẫu thiệp cưới cổ điển phương Tây, font chữ thanh lịch cùng giai điệu vĩ cầm du dương.",
                weddingCat.Id,
                "Wedding",
                "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
                "/preview/sweet-romance",
                "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
                "Basic",
                "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
                "Can't Help Falling in Love - Violin Cover",
                weddingConfigJson.Replace("Minh & Linh", "Tuấn & Trang"));

            var t4 = Template.Create(
                "Eternal Love",
                "eternal-love",
                "Mẫu thiệp cưới tối giản hiện đại (Minimalist), tinh khôi và trường tồn cùng năm tháng.",
                weddingCat.Id,
                "Wedding",
                "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
                "/preview/eternal-love",
                "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
                "Free",
                "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3",
                "River Flows in You - Yiruma",
                weddingConfigJson.Replace("Minh & Linh", "Bảo & Vy"));

            t5 = Template.Create(
                "Pastel Dream Baby",
                "pastel-dream-baby",
                "Mẫu thiệp thôi nôi đầy tháng ngọt ngào với gam màu baby pastel, hình vẽ ngộ nghĩnh và lời nhắn ấm áp.",
                babyShowerCat.Id,
                "BabyShower",
                "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
                "/preview/pastel-dream-baby",
                "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
                "New",
                "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3",
                "Lullaby Goodnight - Music Box",
                babyShowerConfigJson);

            t6 = Template.Create(
                "Silver Jubilee",
                "silver-jubilee",
                "Mẫu thiệp kỷ niệm ngày cưới bạc và vàng, gắn kết những khoảnh khắc yêu thương suốt nhiều thập kỷ.",
                anniversaryCat.Id,
                "Anniversary",
                "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
                "/preview/silver-jubilee",
                "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
                "Premium",
                "https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d659ad76.mp3",
                "Memories of Love - Orchestra",
                anniversaryConfigJson);

            var t7 = Template.Create(
                "Traditional Grace",
                "traditional-grace",
                "Mẫu thiệp lễ đính hôn và lễ ăn hỏi truyền thống Á Đông kết hợp sự thanh lịch hiện đại.",
                engagementCat.Id,
                "Engagement",
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                "/preview/traditional-grace",
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                "New",
                "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
                "Beautiful In White - Acoustic Guitar",
                engagementConfigJson);

            tAiSummit = Template.Create(
                "Virtual AI Summit 2026",
                "ai-summit-pro",
                "Hội nghị thượng đỉnh quy tụ 50+ chuyên gia AI hàng đầu thế giới thảo luận về tương lai của Autonomous Agents.",
                conferenceCat.Id,
                "Conference",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                "/preview/ai-summit-pro",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                "Premium",
                null,
                null,
                aiSummitConfigJson);

            tDriftPlanner = Template.Create(
                "Drift ADHD Planner",
                "drift-planner-app",
                "Ứng dụng quản lý thời gian và năng suất nhẹ nhàng dành riêng cho não bộ ADHD, không áp lực.",
                appShowcaseCat.Id,
                "AppShowcase",
                "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
                "/preview/drift-planner-app",
                "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
                "Hot",
                null,
                null,
                driftPlannerConfigJson);

            tSmileCraft = Template.Create(
                "SmileCraft Dental Clinic",
                "smilecraft-dental",
                "Phòng khám nha khoa thẩm mỹ cao cấp chuẩn Thụy Sỹ với công nghệ Scan 3D không xâm lấn.",
                medicalCat.Id,
                "Medical",
                "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
                "/preview/smilecraft-dental",
                "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
                "Premium",
                null,
                null,
                dentalClinicConfigJson);

            tCloudFlow = Template.Create(
                "CloudFlow Modern SaaS",
                "cloudflow-saas",
                "Nền tảng tự động hóa luồng dữ liệu doanh nghiệp thời gian thực với độ trễ dưới 5ms.",
                saasCat.Id,
                "SaaS",
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
                "/preview/cloudflow-saas",
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
                "New",
                null,
                null,
                modernSaasConfigJson);

            context.Templates.AddRange(t1, t2, t3, t4, t5, t6, t7, tAiSummit, tDriftPlanner, tSmileCraft, tCloudFlow);
            await context.SaveChangesAsync();
        }
        else
        {
            t1 = await context.Templates.FirstOrDefaultAsync(t => t.Slug == "elegance-blossom") ?? await context.Templates.FirstAsync();
            t2 = await context.Templates.FirstOrDefaultAsync(t => t.Slug == "golden-glamour") ?? t1;
            t5 = await context.Templates.FirstOrDefaultAsync(t => t.Slug == "pastel-dream-baby") ?? t1;
            t6 = await context.Templates.FirstOrDefaultAsync(t => t.Slug == "silver-jubilee") ?? t1;
            tAiSummit = await context.Templates.FirstOrDefaultAsync(t => t.Slug == "ai-summit-pro") ?? t1;
            tDriftPlanner = await context.Templates.FirstOrDefaultAsync(t => t.Slug == "drift-planner-app") ?? t1;
            tSmileCraft = await context.Templates.FirstOrDefaultAsync(t => t.Slug == "smilecraft-dental") ?? t1;
            tCloudFlow = await context.Templates.FirstOrDefaultAsync(t => t.Slug == "cloudflow-saas") ?? t1;
        }

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
