namespace OnePortal.Persistence.Data;

using System.Text.Json;

public static class TemplateCatalogConfigBuilder
{
    private static readonly HashSet<string> PersonalEvents =
        ["wedding", "engagement", "birthday", "anniversary", "baby-shower", "housewarming"];

    public static string Build(CatalogCategoryDefinition category, CatalogStyleDefinition style,
        string concept, string image, int index)
    {
        var isPersonal = PersonalEvents.Contains(category.Slug);
        var isEvent = isPersonal || category.Slug == "conference";
        var coverImage = image.Replace(".svg", "-cover.svg", StringComparison.Ordinal);
        var content = GetContent(category.Slug);
        var sectionOrder = (index % 4) switch
        {
            0 => new[] { "hero", "event", "features", "services", "timeline", "extra", "gallery", "rsvp", "wishes" },
            1 => new[] { "hero", "extra", "services", "event", "features", "gallery", "timeline", "rsvp", "wishes" },
            2 => new[] { "hero", "features", "gallery", "event", "services", "extra", "timeline", "rsvp", "wishes" },
            _ => new[] { "hero", "services", "event", "timeline", "features", "gallery", "extra", "rsvp", "wishes" }
        };
        var config = new Dictionary<string, object?>
        {
            ["format"] = category.Format,
            ["theme"] = new { primaryColor = style.Primary, secondaryColor = style.Secondary,
                backgroundColor = style.Background, textColor = style.Text, accentColor = style.Accent,
                fontFamily = style.Font, defaultAnimation = "fade-up", stylePreset = isPersonal ? "romantic" : "modern",
                particlesEffect = isPersonal ? (index % 3 == 0 ? "petals" : "confetti") : "none" },
            ["hero"] = new { title = category.Title, subtitle = category.Subtitle, badge = concept,
                coverImageUrl = coverImage, layout = style.Layout, imageCaption = concept,
                editorialLabel = category.Name, eventDate = isEvent ? "2027-12-18T10:00:00+07:00" : null,
                callToActionText = isEvent ? "Thông tin tham dự" : "Khám phá", ctaUrl = "#catalog-details" },
            ["sectionOrder"] = sectionOrder,
            ["sectionHeadings"] = new
            {
                features = new { eyebrow = category.Name, title = content[0], subtitle = category.Subtitle },
                services = new { eyebrow = category.Name, title = "Lựa chọn dành cho bạn",
                    subtitle = "Thông tin minh họa — cập nhật dịch vụ, chi phí và liên kết phù hợp trước khi chia sẻ." }
            },
            ["extraSections"] = new[] {
                new { id = "catalog-details", type = "custom", enabled = true, title = concept,
                    subtitle = category.Name, content = content[1], imageUrl = index % 3 == 0 ? coverImage : "",
                    animation = "fade-up" },
                new { id = "catalog-note", type = "thankYou", enabled = true,
                    title = isPersonal ? "Hẹn gặp bạn trong ngày vui" : "Cùng bắt đầu một điều mới",
                    subtitle = isPersonal ? "Lời nhắn gửi" : "Liên hệ",
                    content = isPersonal ? "Sự hiện diện của bạn là món quà quý nhất. Cảm ơn bạn đã dành thời gian chung vui cùng gia đình."
                        : "Thay nội dung này bằng thông tin liên hệ của bạn. Thêm URL cho nút dịch vụ trong trình chỉnh sửa khi đã có địa chỉ đích.",
                    imageUrl = "", animation = "fade-up" }
            },
            ["rsvp"] = new { enabled = isEvent, title = "Xác nhận tham dự", subtitle = "Để chúng tôi chuẩn bị đón tiếp bạn chu đáo." },
            ["wishes"] = new { enabled = isPersonal, title = "Lời nhắn yêu thương" },
            ["music"] = new { enabled = false, audioUrl = "" },
            ["gallery"] = Array.Empty<object>(),
            ["coupleOrCelebrant"] = new { persons = Array.Empty<object>() }
        };
        if (isEvent)
        {
            config["eventDetails"] = new { ceremonyName = category.Name, venueName = "Không gian của chúng mình",
                address = "Cập nhật địa điểm tổ chức tại đây", date = "18/12/2027", time = "10:00",
                mapUrl = "", dressCode = index % 2 == 0 ? "Trang phục thoải mái" : "Màu sắc nhẹ nhàng" };
            config["timeline"] = new[] {
                new { time = "10:00", title = "Đón khách", description = "Gặp gỡ và lưu lại những khoảnh khắc đầu tiên.", icon = "camera" },
                new { time = "10:30", title = category.Slug == "conference" ? "Phiên chia sẻ chính" : "Bắt đầu chương trình",
                    description = content[1], icon = isPersonal ? "heart" : "sparkles" },
                new { time = "11:30", title = "Kết nối và trò chuyện", description = "Cùng chia sẻ niềm vui và câu chuyện của riêng mình.", icon = "glasswater" }
            };
        }
        else
        {
            config["featureCardsGrid"] = content.Skip(2).Select((title, number) => new
            {
                id = $"feature-{number}", title,
                description = $"Khám phá {title.ToLowerInvariant()} theo nhu cầu của bạn. Nội dung, hình ảnh và chi tiết đều có thể thay đổi trong trình chỉnh sửa."
            }).ToArray();
            if (index % 2 == 0 || category.Slug is "medical" or "restaurant" or "fitness" or "spa-beauty")
                config["servicesGrid"] = content.Skip(2).Select((title, number) => new
                {
                    id = $"service-{number}", name = title, description = $"Trao đổi về {title.ToLowerInvariant()} và lựa chọn phù hợp.",
                    priceFrom = "Liên hệ", ctaUrl = "", ctaText = "Tìm hiểu thêm"
                }).ToArray();
        }
        return JsonSerializer.Serialize(config);
    }

    private static string[] GetContent(string slug) => slug switch
    {
        "wedding" => ["Ngày chung đôi", "Từ những cuộc gặp gỡ giản dị, chúng mình chọn cùng nhau đi tiếp. Trân trọng mời bạn chứng kiến lời hẹn ước này."],
        "engagement" => ["Lời hẹn trăm năm", "Một buổi gặp gỡ ấm áp giữa hai gia đình, đánh dấu bước đầu của hành trình chung đôi."],
        "birthday" => ["Thêm tuổi, thêm niềm vui", "Một ngày để nhìn lại những điều đáng nhớ và cùng người thân đón chào những dự định mới."],
        "anniversary" => ["Cùng nhau qua năm tháng", "Mỗi kỷ niệm là một dấu mốc nhỏ của yêu thương. Cảm ơn bạn đã luôn ở bên trên hành trình này."],
        "baby-shower" => ["Mừng bé tròn một tuổi", "Mười hai tháng của những lần đầu tiên: nụ cười, tiếng bi bô và từng bước chập chững. Mời bạn cùng mừng tuổi mới của bé."],
        "housewarming" => ["Nhà mới, chuyện mới", "Ngôi nhà trở nên ấm áp khi có tiếng cười của người thân và bạn bè. Hẹn gặp bạn trong bữa cơm mừng nhà mới."],
        "conference" => ["Gặp gỡ để cùng phát triển", "Kết nối những người cùng quan tâm, trao đổi kinh nghiệm thực tế và mang về những ý tưởng có thể áp dụng."],
        "app-showcase" => ["Một ứng dụng, nhiều cách sử dụng", "Giới thiệu trải nghiệm sử dụng rõ ràng, từ lần đầu khám phá đến thói quen mỗi ngày.", "Sắp xếp công việc", "Theo dõi tiến độ", "Làm việc cùng nhóm"],
        "medical" => ["Chăm sóc từ sự thấu hiểu", "Giới thiệu phòng khám, đội ngũ và quy trình tiếp đón. Cập nhật thông tin chuyên môn đã được xác minh trước khi công khai.", "Tư vấn ban đầu", "Khám theo lịch hẹn", "Hướng dẫn chăm sóc"],
        "saas" => ["Công việc có tổ chức hơn", "Trình bày vấn đề sản phẩm giải quyết, cách hoạt động và lựa chọn phù hợp cho từng nhóm khách hàng.", "Quản lý dự án", "Báo cáo trực quan", "Kết nối công cụ"],
        "restaurant" => ["Hương vị cho những cuộc gặp", "Kể câu chuyện căn bếp, giới thiệu món theo mùa và không gian dùng bữa. Cập nhật thực đơn, giờ mở cửa và liên kết đặt bàn.", "Thực đơn theo mùa", "Bữa ăn gia đình", "Tiệc riêng"],
        "fitness" => ["Vận động theo nhịp của bạn", "Giới thiệu lớp tập, huấn luyện viên và lịch hoạt động. Chọn hình thức vận động phù hợp với mục tiêu và thể trạng.", "Lớp nhóm", "Huấn luyện cá nhân", "Yoga và giãn cơ"],
        "education" => ["Học qua những trải nghiệm", "Cho người học thấy mục tiêu, nội dung, phương pháp và lịch học trước khi đăng ký.", "Khóa học nền tảng", "Workshop thực hành", "Học theo dự án"],
        "real-estate" => ["Tìm một nơi để gắn bó", "Giới thiệu không gian sống bằng thông tin rõ ràng. Cập nhật diện tích, vị trí, pháp lý và hình ảnh thực tế trước khi đăng.", "Căn hộ", "Nhà phố", "Lịch xem nhà"],
        "art-craft" => ["Từ đôi tay đến câu chuyện", "Giới thiệu chất liệu, quá trình sáng tạo và những bộ sưu tập thủ công có dấu ấn riêng.", "Bộ sưu tập mới", "Sản phẩm đặt riêng", "Workshop thủ công"],
        "spa-beauty" => ["Một khoảng nghỉ dành cho bạn", "Giới thiệu không gian, dịch vụ và cách đặt lịch. Mô tả rõ trải nghiệm và thời lượng để khách dễ lựa chọn.", "Chăm sóc da", "Thư giãn cơ thể", "Tư vấn cá nhân"],
        "podcast-music" => ["Lắng nghe một câu chuyện mới", "Giới thiệu chương trình, chủ đề và người dẫn. Thêm liên kết nghe chính thức vào từng nội dung.", "Tập mới nhất", "Cuộc trò chuyện", "Playlist theo chủ đề"],
        "tech-startup" => ["Ý tưởng bắt đầu từ nhu cầu thực", "Giải thích sản phẩm đang xây dựng, đối tượng sử dụng và cách tham gia thử nghiệm.", "Sản phẩm", "Lộ trình phát triển", "Cộng đồng thử nghiệm"],
        "photography" => ["Giữ lại điều bạn muốn nhớ", "Trình bày phong cách ảnh, quy trình làm việc và bộ sưu tập. Thay các hình minh họa bằng tác phẩm của bạn.", "Chân dung", "Câu chuyện cưới", "Thương hiệu"],
        _ => ["Khám phá", "Giới thiệu câu chuyện và nội dung của bạn.", "Giới thiệu", "Dịch vụ", "Liên hệ"]
    };
}
