namespace TemplateLandingPage.Persistence.Data;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Domain.Entities;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
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

        // 2. Seed Master Templates
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
                "title": "A Thousand Years - Instrumental",
                "autoPlay": true
              },
              "wishes": {
                "enabled": true,
                "title": "Sổ Lưu Bút & Lời Chúc",
                "subtitle": "Gửi những lời chúc yêu thương nhất tới chúng mình"
              }
            }
            """;

            var weddingTemplate = Template.Create(
                "Elegance Blossom",
                "elegance-blossom",
                "Mẫu thiệp cưới sang trọng mang phong cách châu Âu với hiệu ứng cánh hoa bay lãng mạn.",
                "Wedding",
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                "/preview/elegance-blossom",
                weddingConfigJson);

            var birthdayConfigJson = """
            {
              "theme": {
                "primaryColor": "#d97706",
                "secondaryColor": "#f59e0b",
                "accentColor": "#fde68a",
                "backgroundColor": "#0f172a",
                "textColor": "#f8fafc",
                "fontFamily": "Cinzel",
                "stylePreset": "luxury",
                "particlesEffect": "confetti"
              },
              "hero": {
                "badge": "HAPPY 30TH BIRTHDAY",
                "title": "Hoàng Nam",
                "subtitle": "Đêm tiệc kỷ niệm cột mốc tuổi 30 đáng nhớ",
                "eventDate": "2026-11-12T19:00:00",
                "coverImageUrl": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
                "callToActionText": "Đăng ký tham dự"
              },
              "coupleOrCelebrant": {
                "type": "birthday",
                "person1": {
                  "name": "Trần Hoàng Nam",
                  "title": "Chủ Nhân Buổi Tiệc",
                  "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
                  "bio": "Founder & Tech Enthusiast, đón chào tuổi 30 bùng nổ cùng những người bạn tuyệt vời!",
                  "parents": "Gia đình họ Trần"
                },
                "storyQuote": "Tuổi 30 không phải là già đi, mà là bắt đầu chương rực rỡ nhất của cuộc đời."
              },
              "eventDetails": {
                "ceremonyName": "Gala Dinner & Rooftop Night",
                "time": "18:30 - Thứ Bảy, 12/11/2026",
                "venueName": "Sky Lounge 36",
                "address": "Tầng 36, Tòa nhà Landmark, Quận 1, TP. Hồ Chí Minh",
                "mapEmbedUrl": "https://maps.google.com",
                "mapDirectLink": "https://maps.google.com",
                "dressCode": "Black Tie / Ánh Kim / Dạ Hội"
              },
              "timeline": [
                { "id": "1", "time": "18:30", "title": "Check-in & Welcome Cocktail", "description": "Đón tiếp khách mời và thưởng thức cocktail khai tiệc", "icon": "GlassWater" },
                { "id": "2", "time": "19:30", "title": "Thổi nến & Khai tiệc", "description": "Nghi thức thổi nến chúc mừng tuổi mới", "icon": "Cake" },
                { "id": "3", "time": "20:30", "title": "DJ Party & Chill Night", "description": "Âm nhạc sôi động và nâng ly cùng bạn bè", "icon": "Music" }
              ],
              "gallery": [
                { "id": "1", "url": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80", "caption": "Ánh sáng lễ hội" },
                { "id": "2", "url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", "caption": "Khoảnh khắc tiệc tùng" }
              ],
              "rsvp": {
                "enabled": true,
                "deadline": "2026-11-05",
                "note": "Xin vui lòng xác nhận sớm để ban tổ chức chuẩn bị chỗ ngồi chu đáo nhất!",
                "allowDietaryNotes": false,
                "allowPlusOnes": true
              },
              "music": {
                "enabled": true,
                "audioUrl": "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3",
                "title": "Celebration Night - Acoustic",
                "autoPlay": false
              },
              "wishes": {
                "enabled": true,
                "title": "Gửi Lời Chúc Mừng Sinh Nhật",
                "subtitle": "Để lại những kỷ niệm đẹp cùng Nam nhé!"
              }
            }
            """;

            var birthdayTemplate = Template.Create(
                "Golden Glamour",
                "golden-glamour",
                "Mẫu thiệp sinh nhật dạ tiệc sang trọng với tone vàng kim và hiệu ứng pháo hoa giấy confetti rực rỡ.",
                "Birthday",
                "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
                "/preview/golden-glamour",
                birthdayConfigJson);

            context.Templates.AddRange(weddingTemplate, birthdayTemplate);
            await context.SaveChangesAsync();
        }
    }
}
