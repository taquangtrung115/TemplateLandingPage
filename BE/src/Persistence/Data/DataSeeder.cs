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
        if (!await context.Users.AnyAsync())
        {
            var adminUser = User.Create(
                "admin@template.com",
                passwordHasher.HashPassword("Admin@123456"),
                "Quản Trị Viên",
                "Admin");

            var normalUser = User.Create(
                "user@template.com",
                passwordHasher.HashPassword("User@123456"),
                "Người Dùng Mẫu",
                "User");

            context.Users.AddRange(adminUser, normalUser);
            await context.SaveChangesAsync();
        }

        // 2. Seed 5 Standard Cinelove Categories
        Category weddingCat;
        Category engagementCat;
        Category birthdayCat;
        Category anniversaryCat;
        Category babyShowerCat;

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

            context.Categories.AddRange(weddingCat, engagementCat, birthdayCat, anniversaryCat, babyShowerCat);
            await context.SaveChangesAsync();
        }
        else
        {
            weddingCat = await context.Categories.FirstAsync(c => c.Slug == "wedding");
            engagementCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "engagement") ?? weddingCat;
            birthdayCat = await context.Categories.FirstAsync(c => c.Slug == "birthday");
            anniversaryCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "anniversary") ?? weddingCat;
            babyShowerCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "baby-shower") ?? birthdayCat;
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

        // 4. Seed Templates (Rich Mockup, Audio, LongPreview)
        if (!await context.Templates.AnyAsync())
        {
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

            var t1 = Template.Create(
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

            var t2 = Template.Create(
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
                weddingConfigJson.Replace("Minh & Linh", "Hoàng Nam").Replace("SAVE THE DATE", "HAPPY BIRTHDAY"));

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

            var t5 = Template.Create(
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
                weddingConfigJson.Replace("Minh & Linh", "Bé Bắp Tròn 1 Tuổi").Replace("SAVE THE DATE", "HAPPY 1ST BIRTHDAY"));

            var t6 = Template.Create(
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
                weddingConfigJson.Replace("Minh & Linh", "Huy & Phương (25 Năm)").Replace("SAVE THE DATE", "25TH ANNIVERSARY"));

            context.Templates.AddRange(t1, t2, t3, t4, t5, t6);
            await context.SaveChangesAsync();
        }
    }
}
