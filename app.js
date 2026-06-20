/* ============================================================
 * BrainBooster · Lịch sử Đảng — app.js (vanilla JS, no build)
 * ------------------------------------------------------------
 * Structure
 *   §1  Question bank (data)
 *   §2  Small helpers (shuffle, escape, dom, format)
 *   §3  Spaced-repetition store (Leitner, localStorage)
 *   §4  App shell / router
 *   §5  Header + Main menu
 *   §6  Flashcard mode
 *   §7  Survival (timed quiz) mode
 *   §8  Smart Review — spaced repetition (NEW)
 *   §9  Exam / Test mode (NEW)
 *   §10 Matching mode (drag-to-connect, redesigned)
 *   §11 Boot
 * ========================================================== */
(function () {
    "use strict";

    /* §1 — QUESTION BANK ------------------------------------- */
    const QUESTIONS = [
        { id: 1, question: "Thực dân Pháp nổ súng tấn công xâm lược Việt Nam vào thời gian nào?", options: ["1/9/1857", "9/1/1858", "1/9/1858", "5/6/1862"], correctIndex: 2 },
        { id: 2, question: "Hiệp ước nào đánh dấu việc thực dân Pháp hoàn thành quá trình xâm lược Việt Nam và nước ta đã trở thành thuộc địa của thực dân Pháp?", options: ["Hòa ước Nhâm Tuất (5/6/1862)", "Hiệp ước Giáp Tuất (15/3/1874)", "Hiệp ước Quý Mùi (25/08/1883)", "Hiệp ước Pa-tơ-nốt (6/6/1884)"], correctIndex: 3 },
        { id: 3, question: "Vào đầu thế kỷ XX, xã hội Việt Nam có sự phân hóa gồm những giai cấp, tầng lớp nào?", options: ["Địa chủ, nông dân, công nhân, tư sản", "Địa chủ, nông dân, công nhân, tư sản, tiểu tư sản", "Địa chủ, nông dân, công nhân, sĩ phu, tư sản", "Địa chủ phong kiến và nông dân"], correctIndex: 1 },
        { id: 4, question: "Đặc điểm ra đời của giai cấp công nhân Việt Nam như thế nào?", options: ["Ra đời trước giai cấp tư sản, trong cuộc khai thác thuộc địa lần thứ nhất", "Phần lớn xuất thân từ nông dân", "Chịu sự áp bức bóc lột của đế quốc, phong kiến và tư sản", "Cả A, B và C"], correctIndex: 3 },
        { id: 5, question: "Mâu thuẫn gay gắt cần được giải quyết trước hết trong xã hội Việt Nam đầu thế kỷ XX là mâu thuẫn nào?", options: ["Nông dân với địa chủ phong kiến", "Dân tộc Việt Nam với đế quốc xâm lược và tay sai", "Công nhân, nông dân với đế quốc, phong kiến", "Công nhân với tư sản"], correctIndex: 1 },
        { id: 6, question: "Khi nào phong trào công nhân Việt Nam bước đầu chuyển từ đấu tranh tự phát sang tự giác?", options: ["Tổ chức công hội ở Sài Gòn thành lập 1920", "Cuộc bãi công Ba Son diễn ra năm 1925", "Ba tổ chức cộng sản ra đời năm 1929", "Đảng Cộng sản Việt Nam ra đời năm 1930"], correctIndex: 1 },
        { id: 7, question: "Tại sao năm 1925, Nguyễn Ái Quốc không thành lập ngay Đảng Cộng sản mà lại lập Hội Việt Nam Cách mạng thanh niên?", options: ["Điều kiện thành lập Đảng chưa chín muồi", "Chủ nghĩa Mác-Lênin chưa được truyền bá sâu rộng", "Phong trào yêu nước vẫn trong quỹ đạo dân chủ tư sản", "Phong trào công nhân vẫn ở trình độ tự phát"], correctIndex: 0 },
        { id: 8, question: "Tác phẩm đầu tiên vạch ra các vấn đề về chiến lược và sách lược của cách mạng Việt Nam là tác phẩm nào?", options: ["Bản án chế độ thực dân Pháp", "Đường Kách mệnh", "Kháng chiến nhất định thắng lợi", "Vấn đề dân cày"], correctIndex: 1 },
        { id: 9, question: "Trong tác phẩm Đường Kách mệnh, Nguyễn Ái Quốc viết: 'Đảng muốn vững thì phải có ... làm cốt'. Từ còn thiếu là gì?", options: ["Đường lối", "Chủ nghĩa", "Tư tưởng", "Lý luận"], correctIndex: 1 },
        { id: 10, question: "Hội Việt Nam Cách mạng thanh niên được coi là tổ chức tiền thân của Đảng vì?", options: ["Chuẩn bị chính trị, tư tưởng, tổ chức cho sự ra đời của Đảng", "Làm khuynh hướng vô sản ngày càng thắng thế", "Truyền bá Chủ nghĩa Mác-Lênin vào VN", "Thúc đẩy phong trào công nhân từ tự phát sang tự giác"], correctIndex: 0 },
        { id: 11, question: "Hội nghị thành lập Đảng đầu năm 1930 được tổ chức vì:", options: ["Được uỷ nhiệm của Quốc tế Cộng sản", "Nhận được Chỉ thị của Quốc tế Cộng sản", "Yêu cầu thống nhất của CMVN và sự chủ động của NAQ", "Các tổ chức cộng sản trong nước đề nghị"], correctIndex: 2 },
        { id: 12, question: "Hội nghị thành lập Đảng Cộng sản Việt Nam diễn ra vào thời gian nào?", options: ["6/1/1930 – 7/2/1930", "3/2/1930 – 7/2/1930", "6/1/1930 – 3/2/1930", "16/1/1930 – 7/2/1930"], correctIndex: 0 },
        { id: 13, question: "Hội nghị thành lập Đảng (1930) đã thông qua các văn kiện nào sau đây:", options: ["Chánh cương vắn tắt", "Sách lược vắn tắt", "Điều lệ vắn tắt và Chương trình tóm tắt", "Cả A, B và C"], correctIndex: 3 },
        { id: 14, question: "Đâu KHÔNG PHẢI là nội dung Hội nghị thành lập Đảng?", options: ["Tán thành hợp nhất các tổ chức cộng sản", "Ngày 24/2/1930, Đông Dương CS Liên đoàn gia nhập Đảng", "Thông qua Chánh cương, Sách lược, Chương trình, Điều lệ", "Định ra kế hoạch thống nhất trong nước"], correctIndex: 1 },
        { id: 15, question: "Sự ra đời của Đảng là sự phát triển về chất từ ............... đến ........... đến ............", options: ["Đảng CSVN / Hội VN cách mạng thanh niên / 3 tổ chức CS", "3 tổ chức CS / Hội VN cách mạng thanh niên / Đảng CSVN", "Tân Việt / 3 tổ chức CS / Đảng CSVN", "Hội VN cách mạng thanh niên / 3 tổ chức CS / Đảng CSVN"], correctIndex: 3 },
        { id: 16, question: "Cương lĩnh chính trị đầu tiên xác định phương hướng chiến lược của cách mạng Việt Nam là gì?", options: ["Đánh đổ đế quốc và phong kiến", "Tư sản dân quyền CM và thổ địa CM để đi tới xã hội cộng sản", "Làm cách mạng tư sản dân quyền", "Cả A và B"], correctIndex: 1 },
        { id: 17, question: "Văn kiện nào của Đảng đặt nhiệm vụ chống đế quốc lên hàng đầu?", options: ["Cương lĩnh chính trị đầu tiên (1930)", "Luận cương chính trị (10-1930)", "Thư của Trung ương gửi các cấp bộ (12-1930)", "Nghị quyết Đại hội I (3-1935)"], correctIndex: 0 },
        { id: 18, question: "Điểm khác nhau giữa Cương lĩnh đầu tiên và Luận cương 10/1930 là:", options: ["Chủ trương tập hợp lực lượng cách mạng", "Phương hướng chiến lược của cách mạng", "Giai cấp lãnh đạo cách mạng", "Quan hệ quốc tế"], correctIndex: 0 },
        { id: 19, question: "Nhiệm vụ cách mạng được Đảng xác định trong giai đoạn 1936-1939 là gì?", options: ["Tịch thu ruộng đất của địa chủ", "Đánh đuổi thực dân Pháp", "Chống phát xít, chống chiến tranh, đòi tự do, cơm áo, hoà bình", "Cả A, B, C đều đúng"], correctIndex: 2 },
        { id: 20, question: "Hình thức tổ chức và đấu tranh của cách mạng VN giai đoạn 1936-1939 là gì?", options: ["Công khai, hợp pháp", "Nửa công khai, nửa hợp pháp", "Bí mật, bất hợp pháp", "Tất cả các hình thức trên"], correctIndex: 3 },
        { id: 21, question: "Lá cờ đỏ sao vàng lần đầu tiên xuất hiện trong cuộc khởi nghĩa nào?", options: ["Khởi nghĩa Bắc Sơn (1940)", "Khởi nghĩa Nam Kì (1940)", "Binh biến Đô Lương (1941)", "Khởi nghĩa Ba Tơ (1945)"], correctIndex: 1 },
        { id: 22, question: "Chủ trương thể hiện rõ nhất sự chuyển hướng chỉ đạo chiến lược những năm 1939 - 1941?", options: ["Đặt nhiệm vụ giải phóng dân tộc lên hàng đầu", "Giải quyết vấn đề dân tộc trong từng nước Đông Dương", "Xúc tiến khởi nghĩa vũ trang", "Phát động cao trào kháng Nhật"], correctIndex: 0 },
        { id: 23, question: "Việt Minh là tên gọi tắt của mặt trận dân tộc nào?", options: ["Mặt trận Liên minh Việt Nam", "Mặt trận Liên Việt đồng minh", "Mặt trận Việt Nam đồng minh", "Mặt trận Việt Nam độc lập đồng minh"], correctIndex: 3 },
        { id: 24, question: "Việc thành lập Mặt trận Việt Minh (1941) là sự chuẩn bị của Đảng về:", options: ["Lực lượng chính trị", "Lực lượng vũ trang", "Nhân sự cho BCH Trung ương mới", "Cả A, B, C đều sai"], correctIndex: 0 },
        { id: 25, question: "Đội Việt Nam tuyên truyền giải phóng quân được thành lập vào thời gian nào?", options: ["22/12/1944", "24/12/1944", "13/8/1945", "16/8/1945"], correctIndex: 0 },
        { id: 26, question: "Ai là người được giao nhiệm vụ thành lập Đội VN tuyên truyền giải phóng quân?", options: ["Văn Tiến Dũng", "Phạm Văn Đồng", "Võ Nguyên Giáp", "Trường Chinh"], correctIndex: 2 },
        { id: 27, question: "Chỉ thị 'Nhật - Pháp bắn nhau và hành động của chúng ta' ra đời khi nào?", options: ["10/3/1944", "12/3/1945", "12/5/1945", "22/12/1946"], correctIndex: 1 },
        { id: 28, question: "Đâu là khẩu hiệu của cách mạng Việt Nam từ tháng 3/1945 đến tháng 8/1945?", options: ["Đánh đuổi Nhật - Pháp", "Đánh đuổi phát xít Nhật", "Đánh đổ địa chủ, chia ruộng đất", "Kháng chiến, kiến quốc"], correctIndex: 1 },
        { id: 29, question: "Trong Chỉ thị 'Nhật – Pháp bắn nhau...', Đảng chủ trương phát động cao trào gì?", options: ["Cao trào dân chủ", "Cao trào phá kho thóc", "Cao trào Tổng khởi nghĩa", "Cao trào kháng Nhật cứu nước"], correctIndex: 3 },
        { id: 30, question: "Khu giải phóng Việt Bắc (4/6/1945) gồm một phần những tỉnh nào?", options: ["Cao Bằng, Bắc Cạn, Hà Tây, Tuyên Quang, Thái Nguyên", "Cao Bằng, Bắc Cạn, Lạng Sơn, Hà Giang, Tuyên Quang, Thái Nguyên", "Hưng Yên, Bắc Cạn, Lạng Sơn, Hà Giang, Tuyên Quang, Thái Nguyên", "Cao Bằng, Bắc Cạn, Lạng Sơn, Hà Giang, Tuyên Quang, Yên Bái"], correctIndex: 1 },
        { id: 31, question: "Ngày 13/8/1945, Trung ương Đảng và Tổng bộ Việt Minh đã quyết định gì?", options: ["Khởi nghĩa ở Hà Nội", "Phát động cao trào kháng Nhật", "Thống nhất lực lượng vũ trang", "Phát lệnh Tổng khởi nghĩa trên cả nước"], correctIndex: 3 },
        { id: 32, question: "Đảng quyết định phát động Tổng khởi nghĩa trước khi quân Đồng minh vào vì:", options: ["So sánh lực lượng có lợi nhất", "Kẻ thù cũ ngã gục, kẻ thù mới chưa đến", "Đồng Minh có thể dựng chính quyền trái ý dân", "Tất cả các lý do trên"], correctIndex: 3 },
        { id: 33, question: "Cuộc Tổng khởi nghĩa giành chính quyền diễn ra thời gian nào?", options: ["13/8 đến 16/8 năm 1945", "13/8 đến 19/8 năm 1945", "14/8 đến 28/8 năm 1945", "14/8 đến 30/8 năm 1945"], correctIndex: 2 },
        { id: 34, question: "Phát biểu nào sau đây là ĐÚNG về CMT8:", options: ["Giành chính quyền từ Pháp, trước khi Đồng minh vào", "Giành chính quyền từ Nhật, trước khi Đồng minh vào", "Giành chính quyền từ Pháp, sau khi Đồng minh vào", "Giành chính quyền từ Nhật, sau khi Đồng minh vào"], correctIndex: 1 },
        { id: 35, question: "Một trong những nguyên nhân khách quan dẫn tới thắng lợi Cách mạng tháng Tám là?", options: ["Sự viện trợ của Liên Xô, TQ", "Sự chuẩn bị của Đảng trong 15 năm", "Thắng lợi của phe Đồng minh", "Truyền thống yêu nước"], correctIndex: 2 },
        { id: 36, question: "Ý nghĩa quốc tế của Cách mạng tháng Tám là gì?", options: ["Lật đổ thực dân phong kiến", "Ra đời nước VNDCCH", "Chọc thủng hệ thống thuộc địa của chủ nghĩa đế quốc", "Cả A, B và C"], correctIndex: 2 },
        { id: 37, question: "Khó khăn, thách thức sau CMT8 năm 1945 là:", options: ["Chính quyền non trẻ", "Kinh tế kiệt quệ, nạn đói", "Thế lực thù địch bao vây", "Tất cả các đáp án trên"], correctIndex: 3 },
        { id: 38, question: "Hoàn cảnh nước ta sau Cách mạng tháng Tám thường được mô tả là:", options: ["Không tiền, không đồng minh, không vũ khí", "Vận mệnh dân tộc như ngàn cân treo sợi tóc", "A và B đều đúng", "A và B đều sai"], correctIndex: 1 },
        { id: 39, question: "Thực dân Pháp nổ súng tấn công Sài Gòn, xâm lược nước ta lần hai vào ngày nào?", options: ["28/8/1945", "2/9/1945", "23/9/1945", "25/11/1945"], correctIndex: 2 },
        { id: 40, question: "Chủ trương, sách lược của Đảng đối phó với đế quốc sau CMT8 là:", options: ["Thêm bạn, bớt thù", "Hoa-Việt thân thiện", "Độc lập chính trị, nhân nhượng kinh tế với Pháp", "Tất cả các đáp án trên"], correctIndex: 3 },
        { id: 41, question: "Trong 'Kháng chiến kiến quốc', Đảng xác định kẻ thù chính sau CMT8 là:", options: ["Phát xít Nhật", "Quân đội Tưởng", "Thực dân Pháp", "Thực dân Anh"], correctIndex: 2 },
        { id: 42, question: "Câu 'Chúng ta thà hy sinh tất cả, chứ nhất định không chịu mất nước...' ở trong tác phẩm nào?", options: ["Chỉ thị Toàn dân kháng chiến", "Lời kêu gọi toàn quốc kháng chiến", "Kháng chiến nhất định thắng lợi", "Lời kêu gọi đồng bào chống Mỹ"], correctIndex: 1 },
        { id: 43, question: "Tháng 12/1946, ta phát động toàn quốc kháng chiến vì:", options: ["Có sự ủng hộ của nhân dân Pháp", "Đã chuẩn bị mọi mặt", "Không muốn hòa với Pháp", "Trước lập trường ngoan cố của Pháp, chỉ có một con đường"], correctIndex: 3 },
        { id: 44, question: "Phương châm kháng chiến chống Pháp được Đảng xác định là gì?", options: ["Tiến hành chiến tranh du kích", "Tiến công kiên quyết", "Toàn dân, toàn diện, lâu dài, dựa vào sức mình", "Dựa vào LLVT 3 thứ quân"], correctIndex: 2 },
        { id: 45, question: "Quốc hội đầu tiên của nước VNDCCH được bầu vào thời gian nào?", options: ["04/01/1946", "05/01/1946", "06/01/1946", "07/01/1946"], correctIndex: 2 },
        { id: 46, question: "Nhiệm vụ hàng đầu trong kháng chiến chống Pháp là:", options: ["Đánh đuổi đế quốc, giành độc lập thống nhất", "Xóa di tích phong kiến, người cày có ruộng", "Phát triển chế độ dân chủ nhân dân", "Cách mạng XHCN"], correctIndex: 0 },
        { id: 47, question: "Đâu được coi là căn cứ địa cách mạng của cả nước trong kháng chiến chống Pháp?", options: ["Tây Bắc", "Việt Bắc", "Hà Nội", "Điện Biên Phủ"], correctIndex: 1 },
        { id: 48, question: "Đại hội II (1951) ��ưa Đảng ra hoạt động công khai với tên là:", options: ["Đảng Cộng sản Việt Nam", "Đảng Cộng sản Đông Dương", "Đảng Lao động Việt Nam", "Đảng Nhân dân lao động Việt Nam"], correctIndex: 2 },
        { id: 49, question: "Đại hội II (1951) xác định cách mạng VN giai đoạn hiện tại là:", options: ["Cách mạng giải phóng dân tộc", "Cách mạng dân chủ tư sản", "Cách mạng dân tộc dân chủ nhân dân", "Cách mạng XHCN"], correctIndex: 2 },
        { id: 50, question: "Chiến dịch nào mở ra thời kỳ đấu tranh mới trong kháng chiến chống Pháp?", options: ["Việt Bắc (1947)", "Biên giới (1950)", "Trung du (1950-1951)", "Điện Biên Phủ (1954)"], correctIndex: 1 },
        { id: 51, question: "Chiến dịch Điện Biên Phủ kết thúc thắng lợi vào ngày nào?", options: ["06/05/1954", "07/05/1954", "08/05/1954", "09/05/1954"], correctIndex: 1 },
        { id: 52, question: "Hiệp định Giơnevơ quy định:", options: ["Tôn trọng độc lập, chủ quyền 3 nước", "Pháp rút quân, vĩ tuyến 17 là giới tuyến tạm thời", "Cấm đưa quân đội, vũ khí nước ngoài vào Đông Dương", "Tất cả các đáp án trên"], correctIndex: 3 },
        { id: 53, question: "Đảng lãnh đạo đồng thời 2 chiến lược cách mạng ở 2 miền trong giai đoạn nào?", options: ["1930 – 1945", "1945 – 1954", "1954 – 1975", "1975 – 1986"], correctIndex: 2 },
        { id: 54, question: "Vĩ tuyến 17, ranh giới phân chia 2 miền Nam - Bắc nằm ở đâu?", options: ["Sông Nhật Lệ", "Sông Gianh", "Sông Bến Hải – Quảng Trị", "Sông Thạch Hãn"], correctIndex: 2 },
        { id: 55, question: "Ai đứng đầu chính quyền tay sai đầu tiên Mỹ dựng lên ở miền Nam?", options: ["Ngô Đình Diệm", "Nguyễn Khánh", "Nguyễn Văn Thiệu", "Dương Văn Minh"], correctIndex: 0 },
        { id: 56, question: "Nghị quyết đầu tiên về đường lối cách mạng miền Nam được thông qua tại?", options: ["Đại hội II (1951)", "Hội nghị TW 13 (1957)", "Hội nghị TW 15 (1959)", "Đại hội III (1960)"], correctIndex: 2 },
        { id: 57, question: "Ý nghĩa của Nghị quyết Hội nghị Trung ương 15 (1959)?", options: ["Mở đường cho cách mạng miền Nam", "Thể hiện bản lĩnh độc lập tự chủ", "Dẫn tới thắng lợi Đồng khởi 1960", "Tất cả các đáp án trên"], correctIndex: 3 },
        { id: 58, question: "Đại hội nào là Đại hội xây dựng CNXH miền Bắc, hòa bình thống nhất nước nhà?", options: ["Đại hội II (1951)", "Đại hội III (1960)", "Đại hội IV (1976)", "Đại hội V (1982)"], correctIndex: 1 },
        { id: 59, question: "Thắng lợi nào chuyển cách mạng miền Nam từ thế giữ gìn lực lượng sang thế tiến công?", options: ["Đồng khởi (1960)", "Ấp Bắc (1963)", "Bình Giã (1964)", "Vạn Tường (1965)"], correctIndex: 0 },
        { id: 60, question: "Đại hội III xác định chiến lược nào giữ vai trò quyết định nhất đối với sự nghiệp thống nhất?", options: ["Cách mạng XHCN ở miền Bắc", "Cách mạng DTDC nhân dân ở miền Nam", "Cách mạng DTDC ở miền Bắc", "Cách mạng XHCN ở miền Nam"], correctIndex: 0 },
        { id: 61, question: "Câu nói: 'Nam Bộ là máu của máu Việt Nam, là thịt của thịt Việt Nam...' là của ai?", options: ["Chủ tịch Hồ Chí Minh", "Tổng Bí thư Trường Chinh", "Tổng Bí thư Lê Duẩn", "Thủ tướng Phạm Văn Đồng"], correctIndex: 0 },
        { id: 62, question: "Quân dân miền Nam đánh bại chiến lược chiến tranh nào của Mỹ 1965-1968?", options: ["Chiến tranh đơn phương", "Chiến tranh đặc biệt", "Chiến tranh cục bộ", "Việt Nam hóa chiến tranh"], correctIndex: 2 },
        { id: 63, question: "Ý nghĩa quan trọng nhất của chiến thắng Điện Biên Phủ trên không 1972?", options: ["Thể hiện sức mạnh miền Bắc", "Khẳng định ý chí quyết chiến", "Đè bẹp ý chí xâm lược", "Buộc Mỹ phải ký Hiệp định Paris"], correctIndex: 3 },
        { id: 64, question: "Hội nghị Paris kéo dài như thế nào?", options: ["5/1968 đến 01/1973", "01/1969 đến 01/1973", "5/1968 đến 4/1975", "01/1969 đến 4/1975"], correctIndex: 0 },
        { id: 65, question: "Phương châm tác chiến trong kế hoạch giải phóng miền Nam 1975 là?", options: ["Đánh nhanh, thắng nhanh", "Đánh chắc, tiến chắc", "Tích cực, chủ động, linh hoạt", "Thần tốc, táo bạo, bất ngờ, chắc thắng"], correctIndex: 3 },
        { id: 66, question: "Đại thắng mùa Xuân 1975 mở ra kỷ nguyên gì cho đất nước?", options: ["Độc lập, thống nhất, đi lên CNXH", "Hội nhập quốc tế", "Phát triển vươn mình", "Kỷ nguyên số"], correctIndex: 0 },
        { id: 67, question: "Nhiệm vụ bức thiết nhất ngay sau 30/4/1975 là gì?", options: ["Khôi phục kinh tế", "Thống nhất đất nước về mặt nhà nước", "Cải cách giáo dục", "Bảo vệ chủ quyền"], correctIndex: 1 },
        { id: 68, question: "Tại Đại hội IV (1976), Đảng Lao động Việt Nam đổi tên thành:", options: ["Đảng Cộng sản Đông Dương", "Đảng Dân chủ xã hội", "Đảng Nhân dân Cách mạng", "Đảng Cộng sản Việt Nam"], correctIndex: 3 },
        { id: 69, question: "Chủ trương cho 'sản xuất bung ra' nêu ở Hội nghị nào khóa IV?", options: ["Hội nghị lần thứ năm (12/1978)", "Hội nghị lần thứ sáu (8/1979)", "Hội nghị lần thứ bảy (3/1980)", "Hội nghị lần thứ tám (9/1980)"], correctIndex: 1 },
        { id: 70, question: "Chỉ thị 100 CT/TW khoán trong nông nghiệp ban hành năm nào?", options: ["1980", "1981", "1988", "1989"], correctIndex: 1 },
        { id: 71, question: "Chỉ thị 100 CT/TW đề ra chủ trương gì?", options: ["Phát huy quyền xí nghiệp quốc doanh", "Mở rộng trả lương khoán", "Khoán sản phẩm đến nhóm và người lao động", "Cải tiến phân phối lưu thông"], correctIndex: 2 },
        { id: 72, question: "Đại hội nào chủ trương coi nông nghiệp là mặt trận hàng đầu?", options: ["Đại hội III (1960)", "Đại hội IV (1976)", "Đại hội V (1982)", "B và C đều đúng"], correctIndex: 2 },
        { id: 73, question: "Đại hội V (1982) xác định hai nhiệm vụ chiến lược là:", options: ["Xây dựng CNXH và bảo vệ Tổ quốc XHCN", "Đẩy mạnh CNH-HĐH", "Cải thiện đời sống và xây dựng CSVC", "Cả A, B, C đều sai"], correctIndex: 0 },
        { id: 74, question: "Vì sao Hội nghị TW 8 (1985) là bước đột phá lần 2?", options: ["Quyết định dứt khoát xóa bỏ cơ chế tập trung quan liêu bao cấp", "Đổi cơ cấu thành phần kinh tế", "Cho sản xuất bung ra", "Thực hiện ba chương trình kinh tế lớn"], correctIndex: 0 },
        { id: 75, question: "Hội nghị nào là bước quyết định cho sự ra đời đường lối đổi mới?", options: ["Hội nghị TW 6 khóa V (1979)", "Hội nghị TW 8 khóa V (1985)", "Hội nghị TW 9 khóa V", "Hội nghị Bộ Chính trị khóa V (8/1986)"], correctIndex: 3 },
        { id: 76, question: "Ba chương trình kinh tế lớn (lương thực, tiêu dùng, xuất khẩu) đề ra ở ĐH nào?", options: ["Đại hội IV", "Đại hội V", "Đại hội VI", "Đại hội VII"], correctIndex: 2 },
        { id: 77, question: "Đại hội VI rút ra bài học kinh nghiệm nào?", options: ["Nắm vững bạo lực cách mạng", "Luôn xuất phát từ thực tế, tôn trọng quy luật khách quan", "Giương cao ngọn cờ dân tộc và CNXH", "Cả A, B và C"], correctIndex: 1 },
        { id: 78, question: "Đại hội VI (1986) được khẳng định là Đại hội đổi mới vì đã:", options: ["Quyết định đưa cả nước quá độ lên CNXH", "Thể hiện quyết tâm ra khỏi khủng hoảng", "Đề ra đường lối đổi mới toàn diện", "Hoàn chỉnh đường lối đổi mới"], correctIndex: 2 },
        { id: 79, question: "Điền từ: Đại hội VI chính là Đại hội ..... đường lối đổi mới toàn diện?", options: ["Khởi xướng", "Tiếp tục", "Phát triển", "Kế thừa"], correctIndex: 0 },
        { id: 80, question: "Đại hội VI xác định đổi mới trên lĩnh vực nào là trọng tâm?", options: ["Chính trị", "Kinh tế", "Văn hóa", "Ngoại giao"], correctIndex: 1 },
        { id: 81, question: "Đại hội VI đề ra bao nhiêu phương hướng lớn để phát triển kinh tế?", options: ["2", "3", "4", "5"], correctIndex: 3 },
        { id: 82, question: "Văn kiện quan trọng thông qua tại Đại hội VII (1991) là:", options: ["Cương lĩnh xây dựng đất nước thời kỳ quá độ", "Chiến lược ổn định và phát triển KT-XH đến năm 2000", "Cả A và B", "Không đáp án nào đúng"], correctIndex: 2 },
        { id: 83, question: "Đại hội nào chính thức đưa tư tưởng HCM vào nền tảng tư tưởng của Đảng?", options: ["Đại hội VI", "Đại hội VII", "Đại hội VIII", "Đại hội IX"], correctIndex: 1 },
        { id: 84, question: "Cương lĩnh 1991 khẳng định xã hội XHCN ta xây dựng có mấy đặc trưng?", options: ["6 đặc trưng", "7 đặc trưng", "8 đặc trưng", "10 đặc trưng"], correctIndex: 0 },
        { id: 85, question: "Đánh giá 'Nước ta đã ra khỏi khủng hoảng nhưng chưa vững chắc' là của Đại hội nào?", options: ["Đại hội VI", "Đại hội VII", "Đại hội VIII", "Đại hội IX"], correctIndex: 2 },
        { id: 86, question: "Đại hội nào quyết định đưa đất nước bước sang thời kỳ đẩy mạnh CNH, HĐH?", options: ["Đại hội VIII", "Đại hội IX", "Đại hội X", "Đại hội XI"], correctIndex: 0 },
        { id: 87, question: "Đại hội VIII xác định nguồn lực nào là yếu tố cơ bản cho phát triển nhanh bền vững?", options: ["Khoa học công nghệ", "Tài nguyên thiên nhiên", "Vốn", "Con người"], correctIndex: 3 },
        { id: 88, question: "Đại hội VIII xác định động lực của quá trình CNH, HĐH là:", options: ["Con người", "Tài nguyên thiên nhiên", "Vốn", "Khoa học công nghệ"], correctIndex: 3 },
        { id: 89, question: "Tại Đại hội VIII, quan điểm nào lần đầu được đề cập chính thức?", options: ["Giáo dục là quốc sách hàng đầu", "Giáo dục hướng tới con người toàn diện", "Văn hóa soi đường quốc dân", "Văn hóa là nền tảng tinh thần"], correctIndex: 0 },
        { id: 90, question: "Thế nào là Nhà nước pháp quyền xã hội chủ nghĩa?", options: ["Nhà nước của dân, do dân, vì dân", "Do Đảng lãnh đạo", "Tôn trọng quyền con người", "Quản lý bằng Hiến pháp, pháp luật tối thượng, người dân tự do theo pháp luật"], correctIndex: 3 },
        { id: 91, question: "Mặt trận Tổ quốc Việt Nam có vai trò gì?", options: ["Củng cố, tăng cường khối đại đoàn kết dân tộc", "Lãnh đạo nhân dân xây dựng CNXH", "Quản lý xã hội bằng pháp luật", "Tạo ra của cải"], correctIndex: 0 },
        { id: 92, question: "Nghị quyết 03 về văn hoá (TW5 khóa VIII) có ý nghĩa như thế nào?", options: ["Như một bản cương lĩnh văn hóa đầu tiên trong thời kỳ mới", "Như một báo cáo tổng kết", "Như một đề án hội nhập", "Như một tuyên ngôn văn hóa CNH-HĐH"], correctIndex: 0 },
        { id: 93, question: "Chủ đề Đại hội nào: 'Nâng cao năng lực lãnh đạo, phát huy sức mạnh, sớm đưa nước ta ra khỏi tình trạng kém phát triển'?", options: ["Đại hội VI", "Đại hội VIII", "Đại hội X", "Đại hội XII"], correctIndex: 2 },
        { id: 94, question: "Đại hội X diễn ra vào thời gian nào?", options: ["4/2001", "4/2006", "1/2011", "1/2016"], correctIndex: 1 },
        { id: 95, question: "Đại hội nào quyết định bổ sung, phát triển Cương lĩnh năm 1991?", options: ["Đại hội VIII", "Đại hội IX", "Đại hội X", "Đại hội XI"], correctIndex: 3 },
        { id: 96, question: "Đâu KHÔNG PHẢI đặc trưng xã hội XHCN trong Cương lĩnh (bổ sung 2011)?", options: ["Kinh tế phát triển cao", "Văn hóa tiên tiến", "Nhà nước dân chủ nhân dân do Đảng lãnh đạo", "Quan hệ hữu nghị hợp tác quốc tế"], correctIndex: 2 },
        { id: 97, question: "Đại hội XII (2016) bầu ai làm Tổng Bí thư?", options: ["TBT Lê Khả Phiêu", "TBT Nông Đức Mạnh", "TBT Nguyễn Phú Trọng", "TBT Tô Lâm"], correctIndex: 2 },
        { id: 98, question: "Đâu KHÔNG PHẢI là một trong 3 khâu đột phá chiến lược tại Đại hội XIII?", options: ["Hoàn thiện thể chế phát triển", "Phát triển nguồn nhân lực chất lượng cao", "Đổi mới tổ chức bộ máy hệ thống chính trị", "Xây dựng kết cấu hạ tầng hiện đại"], correctIndex: 2 },
        { id: 99, question: "Công nghiệp hóa, hiện đại hóa ở nước ta là sự nghiệp của thành phần kinh tế nào?", options: ["Kinh tế Nhà nước", "Kinh tế tư nhân", "Kinh tế vốn FDI", "Tất cả các thành phần kinh tế"], correctIndex: 3 },
        { id: 100, question: "Nghị quyết ĐH XIII đặt mục tiêu năm nào VN thành nước công nghiệp hiện đại, thu nhập TB cao?", options: ["2010", "2015", "2020", "2030"], correctIndex: 3 }
    ];

    /* §2 — HELPERS ------------------------------------------- */
    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

    // Escape text before injecting into innerHTML (questions contain quotes etc.)
    function esc(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // Fisher–Yates shuffle (returns a new array, does not mutate input)
    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const correctAnswerOf = (q) => q.options[q.correctIndex];
    const letter = (i) => String.fromCharCode(65 + i);

    /* §3 — SPACED REPETITION STORE (Leitner, localStorage) --- */
    // Memory science: items move up boxes when recalled, reset to box 1 when
    // forgotten. Higher box = longer interval before it is due again.
    const SRS = (function () {
        const KEY = "bb_srs_v1";
        const DAY = 86400000;
        // Interval (in days) before a card in each box becomes "due" again.
        const INTERVAL_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };
        const MAX_BOX = 5;

        let data = load();

        function load() {
            try {
                return JSON.parse(localStorage.getItem(KEY)) || {};
            } catch (e) {
                return {};
            }
        }
        function save() {
            try {
                localStorage.setItem(KEY, JSON.stringify(data));
            } catch (e) {
                /* storage may be unavailable (private mode) — fail silently */
            }
        }
        function entry(id) {
            if (!data[id]) data[id] = { box: 1, due: 0, seen: 0, correct: 0, wrong: 0 };
            return data[id];
        }
        function grade(id, remembered) {
            const e = entry(id);
            e.seen++;
            if (remembered) {
                e.correct++;
                e.box = Math.min(MAX_BOX, e.box + 1);
            } else {
                e.wrong++;
                e.box = 1;
            }
            e.due = Date.now() + INTERVAL_DAYS[e.box] * DAY;
            save();
        }
        function isDue(id) {
            const e = data[id];
            return !e || e.due <= Date.now();
        }
        function dueQuestions() {
            return QUESTIONS.filter((q) => isDue(q.id)).sort((a, b) => {
                const ea = data[a.id], eb = data[b.id];
                const da = ea ? ea.due : 0, db = eb ? eb.due : 0;
                return da - db;
            });
        }
        function boxOf(id) {
            return data[id] ? data[id].box : 1;
        }
        function stats() {
            let learned = 0, started = 0;
            QUESTIONS.forEach((q) => {
                const e = data[q.id];
                if (e) {
                    started++;
                    if (e.box >= 4) learned++;
                }
            });
            return { learned, started, due: dueQuestions().length, total: QUESTIONS.length };
        }
        return { grade, isDue, dueQuestions, boxOf, stats, MAX_BOX };
    })();

    /* §4 — APP SHELL / ROUTER -------------------------------- */
    const root = document.getElementById("app");
    let activeCleanup = null; // teardown hook for the current screen (timers/listeners)

    const Router = {
        go(screen) {
            if (typeof activeCleanup === "function") {
                activeCleanup();
                activeCleanup = null;
            }
            window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
            (SCREENS[screen] || SCREENS.menu)();
        }
    };

    function shell(headerActive, bodyHtml) {
        root.innerHTML = headerHtml() + '<main class="screen' + (headerActive === "menu" ? " screen--center" : "") + '">' + bodyHtml + "</main>";
        bindHeader();
    }

    /* §5 — HEADER + MAIN MENU -------------------------------- */
    function headerHtml() {
        return (
            '<header class="app-header">' +
            '<div class="brand" data-go="menu">' +
            '<div class="brand-logo">BB</div>' +
            '<div><div class="brand-title">LSD</div>' +
            '<span class="brand-sub">Auth: Đoàn Văn Ngọc</span></div>' +
            "</div>" +
            '<div class="header-credit">' +
            '<span class="dot"></span>' +
            'Tác giả: <a href="https://www.facebook.com/dngoc3107" target="_blank" rel="noopener noreferrer">Đoàn Văn Ngọc</a>' +
            '<span class="tag">DTD64CL</span>' +
            "</div>" +
            "</header>"
        );
    }
    function bindHeader() {
        const brand = $(".brand[data-go]");
        if (brand) brand.addEventListener("click", () => Router.go("menu"));
    }

    const MODES = [
        { key: "flashcard", accent: "indigo", icon: "🃏", badge: "", title: "Lật Thẻ", desc: "Ghi nhớ thụ động. Lướt qua câu hỏi và đáp án để não bộ làm quen với dữ liệu." },
        { key: "review", accent: "amber", icon: "🧠", badge: "", title: "Ôn Tập Thông Minh", desc: "Lặp lại ngắt quãng (Leitner). Hệ thống ưu tiên câu bạn hay quên để nhớ lâu hơn." },
        { key: "exam", accent: "cyan", icon: "📝", badge: "", title: "Thi Thử", desc: "Kiểm tra chủ động theo số câu tùy chọn, chấm điểm và xem lại câu sai chi tiết." },
        { key: "survival", accent: "rose", icon: "⏱️", badge: "", title: "Thực Chiến", desc: "Rèn phản xạ dưới áp lực thời gian. Bạn chỉ có 3 mạng — sai là mất mạng!" },
        { key: "matching", accent: "emerald", icon: "🧩", badge: "Nâng cấp", title: "Ghép Cặp", desc: "Kéo đáp án bên phải nối vào câu hỏi bên trái. Đường nối hiện ngay khi kéo." }
    ];

    function MainMenu() {
        const s = SRS.stats();
        const cards = MODES.map(
            (m) =>
                '<button class="mode-card" data-accent="' + m.accent + '" data-mode="' + m.key + '">' +
                (m.badge ? '<span class="mode-card__badge">' + m.badge + "</span>" : "") +
                '<span class="mode-card__icon">' + m.icon + "</span>" +
                '<span class="mode-card__title">' + m.title + "</span>" +
                '<span class="mode-card__desc">' + m.desc + "</span>" +
                "</button>"
        ).join("");

        shell(
            "menu",
            '<div class="menu animate-pop">' +
            '<div class="menu__hero">' +
            '<h2 class="menu__title">Ôn tập <span class="accent">Lịch sử Đảng</span></h2>' +
            '<p class="menu__subtitle">Ngân hàng <span class="menu__count">' + s.total + " câu hỏi</span>. Chọn một chế độ luyện tập được thiết kế theo nguyên lý ghi nhớ của não bộ.</p>" +
            '<div class="menu__stats">' +
            '<span class="pill">✅ Đã thuộc: <strong>' + s.learned + "/" + s.total + "</strong></span>" +
            '<span class="pill">🔁 Cần ôn hôm nay: <strong>' + s.due + "</strong></span>" +
            '<span class="pill">📚 Đã học: <strong>' + s.started + "</strong></span>" +
            "</div>" +
            "</div>" +
            '<div class="mode-grid">' + cards + "</div>" +
            "</div>"
        );

        $$(".mode-card").forEach((btn) =>
            btn.addEventListener("click", () => Router.go(btn.dataset.mode))
        );
    }

    /* §6 — FLASHCARD MODE ------------------------------------ */
    function FlashcardMode() {
        let order = shuffle(QUESTIONS);
        let idx = 0;
        let flipped = false;

        function draw() {
            const q = order[idx];
            const progress = ((idx + 1) / order.length) * 100;
            shell(
                "flashcard",
                '<div class="stage animate-pop">' +
                topbar("flashcard", '<span class="pill"><strong>' + (idx + 1) + "</strong> / " + order.length + "</span>") +
                '<div class="progress"><div class="progress__bar" style="width:' + progress + '%"></div></div>' +
                '<div class="flashcard' + (flipped ? " is-flipped" : "") + '" id="fcard">' +
                '<div class="flashcard__inner">' +
                '<div class="flashcard__face flashcard__face--front">' +
                '<div class="flashcard__tag">Câu hỏi #' + q.id + "</div>" +
                '<div class="flashcard__q">' + esc(q.question) + "</div>" +
                '<div class="flashcard__hint">👆 Chạm để xem đáp án</div>' +
                "</div>" +
                '<div class="flashcard__face flashcard__face--back">' +
                '<div class="flashcard__check">' + iconCheck() + "</div>" +
                '<div class="flashcard__a">' + esc(correctAnswerOf(q)) + "</div>" +
                "</div>" +
                "</div></div>" +
                '<div class="nav-row">' +
                '<button class="btn btn--ghost" id="prev">Câu trước</button>' +
                '<button class="btn btn--primary" id="next">Câu tiếp ' + iconArrow() + "</button>" +
                "</div>" +
                "</div>"
            );
            bindTopbar();
            $("#fcard").addEventListener("click", () => {
                flipped = !flipped;
                $("#fcard").classList.toggle("is-flipped", flipped);
            });
            $("#next").addEventListener("click", () => {
                flipped = false;
                idx = (idx + 1) % order.length;
                draw();
            });
            $("#prev").addEventListener("click", () => {
                flipped = false;
                idx = (idx - 1 + order.length) % order.length;
                draw();
            });
        }
        draw();
    }

    /* §7 — SURVIVAL (TIMED QUIZ) MODE ------------------------ */
    function SurvivalMode() {
        const MAX_MS = 20000;
        let queue = shuffle(QUESTIONS);
        let pos = 0;
        let lives = 3;
        let score = 0;
        let current = null;
        let displayOptions = [];
        let timeLeft = MAX_MS;
        let locked = false;
        let timer = null;

        activeCleanup = () => clearInterval(timer);

        function stopTimer() {
            clearInterval(timer);
            timer = null;
        }
        function startTimer() {
            stopTimer();
            const tick = 50;
            timer = setInterval(() => {
                if (locked) return;
                timeLeft -= tick;
                if (timeLeft <= 0) {
                    timeLeft = 0;
                    updateTimer();
                    onWrong(-1); // ran out of time
                    return;
                }
                updateTimer();
            }, tick);
        }
        function updateTimer() {
            const t = $("#timer");
            const bar = $("#timebar");
            if (!t || !bar) return;
            t.textContent = (timeLeft / 1000).toFixed(1) + "s";
            const warn = timeLeft <= 5000;
            t.classList.toggle("is-warn", warn);
            bar.style.width = (timeLeft / MAX_MS) * 100 + "%";
            bar.classList.toggle("progress__bar--emerald", !warn);
        }
        function loadNext() {
            if (pos >= queue.length) return finish(true);
            current = queue[pos++];
            displayOptions = shuffle(
                current.options.map((text, i) => ({ text, isCorrect: i === current.correctIndex }))
            );
            timeLeft = MAX_MS;
            locked = false;
            draw();
            startTimer();
        }
        function onWrong(selectedIdx) {
            if (locked && selectedIdx !== -1) return;
            locked = true;
            stopTimer();
            lives--;
            SRS.grade(current.id, false);
            revealAnswers(selectedIdx);
            setTimeout(() => {
                if (lives <= 0) finish(false);
                else loadNext();
            }, 1400);
        }
        function onSelect(domIdx, isCorrect) {
            if (locked) return;
            if (isCorrect) {
                locked = true;
                stopTimer();
                const bonus = Math.ceil(timeLeft / 1000) * 10;
                score += 100 + bonus;
                SRS.grade(current.id, true);
                revealAnswers(domIdx);
                setTimeout(loadNext, 900);
            } else {
                onWrong(domIdx);
            }
        }
        function revealAnswers(selectedIdx) {
            $$(".answer").forEach((btn, i) => {
                btn.disabled = true;
                const opt = displayOptions[i];
                if (opt.isCorrect) btn.classList.add("answer--correct");
                else if (i === selectedIdx) btn.classList.add("answer--wrong", "animate-shake");
                else btn.classList.add("answer--dim");
            });
            drawHearts();
        }
        function drawHearts() {
            const wrap = $("#lives");
            if (!wrap) return;
            wrap.innerHTML = [0, 1, 2]
                .map((i) => '<svg class="heart' + (i < lives ? "" : " is-lost") + '" viewBox="0 0 20 20"><path d="M3.17 5.17a4 4 0 015.66 0L10 6.34l1.17-1.17a4 4 0 115.66 5.66L10 17.66l-6.83-6.83a4 4 0 010-5.66z"/></svg>')
                .join("");
        }
        function draw() {
            shell(
                "survival",
                '<div class="quiz animate-pop">' +
                '<div class="hud">' +
                '<button class="back-btn" id="back">' + iconBack() + " Thoát</button>" +
                '<div class="lives" id="lives"></div>' +
                '<div class="hud__right">' +
                '<div class="timer" id="timer">--</div>' +
                '<div class="score-box"><div class="score-box__label">Điểm</div><div class="score-box__value" id="score">' + score + "</div></div>" +
                "</div></div>" +
                '<div class="progress"><div class="progress__bar progress__bar--emerald" id="timebar" style="width:100%"></div></div>' +
                '<div class="qcard"><div class="qcard__num">Câu hỏi #' + current.id + '</div><div class="qcard__text">' + esc(current.question) + "</div></div>" +
                '<div class="answers">' +
                displayOptions
                    .map(
                        (opt, i) =>
                            '<button class="answer" data-i="' + i + '"><span class="answer__key">' + letter(i) + '</span><span class="answer__text">' + esc(opt.text) + "</span></button>"
                    )
                    .join("") +
                "</div></div>"
            );
            $("#back").addEventListener("click", () => Router.go("menu"));
            $$(".answer").forEach((btn) =>
                btn.addEventListener("click", () => onSelect(+btn.dataset.i, displayOptions[+btn.dataset.i].isCorrect))
            );
            drawHearts();
            updateTimer();
        }
        function finish(cleared) {
            stopTimer();
            shell(
                "survival",
                '<div class="panel animate-pop">' +
                '<div class="panel__emoji">' + (cleared ? "🏆" : "💥") + "</div>" +
                '<h2 class="panel__title">' + (cleared ? "Hoàn thành xuất sắc!" : "Hết luowtj rồi!") + "</h2>" +
                '<p class="panel__sub">Điểm đánh giá năng lực của bạn</p>' +
                '<div class="result__big">' + score + "</div>" +
                '<div class="panel__actions">' +
                '<button class="btn btn--ghost" id="menu">Về menu</button>' +
                '<button class="btn btn--primary" id="again">Chơi lại</button>' +
                "</div></div>"
            );
            $("#menu").addEventListener("click", () => Router.go("menu"));
            $("#again").addEventListener("click", () => Router.go("survival"));
        }
        loadNext();
    }

    /* §8 — SMART REVIEW (SPACED REPETITION) — NEW ------------ */
    function ReviewMode() {
        let due = SRS.dueQuestions();
        let i = 0;
        let revealed = false;
        let reviewed = 0;

        if (due.length === 0) {
            return shell(
                "review",
                '<div class="recall animate-pop">' +
                topbar("review", "") +
                '<div class="empty-state">' +
                '<div class="empty-state__icon">🎉</div>' +
                '<div class="empty-state__title">Bạn đã ôn hết hôm nay!</div>' +
                '<p class="empty-state__text">Không còn thẻ nào đến hạn ôn. Hệ thống lặp lại ngắt quãng sẽ nhắc bạn ôn những thẻ này vào đúng thời điểm dễ quên nhất để ghi nhớ bền vững.</p>' +
                '<button class="btn btn--primary" id="menu">Về menu</button>' +
                "</div></div>"
            ), bindBack();
        }

        function bindBack() {
            const m = $("#menu");
            if (m) m.addEventListener("click", () => Router.go("menu"));
            bindTopbar();
        }

        function draw() {
            if (i >= due.length) return finish();
            const q = due[i];
            const box = SRS.boxOf(q.id);
            const progress = (reviewed / due.length) * 100;
            shell(
                "review",
                '<div class="recall animate-pop">' +
                topbar("review", '<span class="pill">🔁 Còn lại <strong>' + (due.length - i) + "</strong></span>") +
                '<div class="progress"><div class="progress__bar progress__bar--emerald" style="width:' + progress + '%"></div></div>' +
                '<div class="recall-card">' +
                '<div class="recall-card__box">Cấp ' + box + "/" + SRS.MAX_BOX + "</div>" +
                '<div class="recall-card__q">' + esc(q.question) + "</div>" +
                (revealed
                    ? '<hr class="recall-card__divider"><div class="recall-card__a">' + esc(correctAnswerOf(q)) + "</div>"
                    : '<p class="recall-prompt">Hãy tự nhớ lại đáp án trong đầu, rồi bấm hiện để kiểm tra.</p>') +
                "</div>" +
                (revealed
                    ? '<div class="recall-actions">' +
                    '<button class="btn btn--danger" id="forgot">❌ Tôi quên</button>' +
                    '<button class="btn btn--emerald" id="knew">✅ Tôi nhớ đúng</button>' +
                    "</div>"
                    : '<div class="recall-actions"><button class="btn btn--primary btn--block" id="reveal">👁️ Hiện đáp án</button></div>') +
                "</div>"
            );
            bindTopbar();
            if (revealed) {
                $("#knew").addEventListener("click", () => rate(true));
                $("#forgot").addEventListener("click", () => rate(false));
            } else {
                $("#reveal").addEventListener("click", () => {
                    revealed = true;
                    draw();
                });
            }
        }
        function rate(remembered) {
            SRS.grade(due[i].id, remembered);
            reviewed++;
            i++;
            revealed = false;
            draw();
        }
        function finish() {
            shell(
                "review",
                '<div class="panel animate-pop">' +
                '<div class="panel__emoji">🧠</div>' +
                '<h2 class="panel__title">Phiên ôn tập hoàn tất</h2>' +
                '<p class="panel__sub">Bạn đã ôn <strong>' + reviewed + "</strong> thẻ. Những thẻ nhớ tốt sẽ được giãn cách lâu hơn.</p>" +
                '<div class="panel__actions">' +
                '<button class="btn btn--ghost" id="menu">Về menu</button>' +
                '<button class="btn btn--primary" id="again">Ôn tiếp</button>' +
                "</div></div>"
            );
            $("#menu").addEventListener("click", () => Router.go("menu"));
            $("#again").addEventListener("click", () => Router.go("review"));
        }
        draw();
    }

    /* §9 — EXAM / TEST MODE — NEW ---------------------------- */
    function ExamMode() {
        const CHOICES = [
            { n: 10, cap: "nhanh gọn" },
            { n: 20, cap: "tiêu chuẩn" },
            { n: 40, cap: "chuyên sâu" },
            { n: QUESTIONS.length, cap: "toàn bộ" }
        ];
        let chosen = 20;

        function setup() {
            shell(
                "exam",
                '<div class="setup animate-pop">' +
                topbar("exam", "") +
                '<h2 class="setup__title">📝 Thi thử</h2>' +
                '<p class="setup__text">Trả lời chủ động giúp ghi nhớ tốt hơn nhiều so với đọc lại. Chọn số câu cho bài kiểm tra của bạn.</p>' +
                '<div class="choice-grid">' +
                CHOICES.map(
                    (c) =>
                        '<button class="choice' + (c.n === chosen ? " is-active" : "") + '" data-n="' + c.n + '"><span class="choice__num">' + c.n + '</span><span class="choice__cap">' + c.cap + "</span></button>"
                ).join("") +
                "</div>" +
                '<button class="btn btn--primary btn--lg btn--block" id="start">Bắt đầu làm bài</button>' +
                "</div>"
            );
            bindTopbar();
            $$(".choice").forEach((b) =>
                b.addEventListener("click", () => {
                    chosen = +b.dataset.n;
                    setup();
                })
            );
            $("#start").addEventListener("click", () => run());
        }

        function run() {
            const quiz = shuffle(QUESTIONS).slice(0, chosen).map((q) => ({
                q: q,
                display: shuffle(q.options.map((text, i) => ({ text, isCorrect: i === q.correctIndex }))),
                picked: null
            }));
            let i = 0;

            function draw() {
                const item = quiz[i];
                const progress = ((i + 1) / quiz.length) * 100;
                shell(
                    "exam",
                    '<div class="quiz animate-pop">' +
                    topbar("exam", '<span class="pill"><strong>' + (i + 1) + "</strong> / " + quiz.length + "</span>") +
                    '<div class="progress"><div class="progress__bar" style="width:' + progress + '%"></div></div>' +
                    '<div class="qcard"><div class="qcard__num">Câu ' + (i + 1) + '</div><div class="qcard__text">' + esc(item.q.question) + "</div></div>" +
                    '<div class="answers">' +
                    item.display
                        .map(
                            (opt, k) =>
                                '<button class="answer' + (item.picked === k ? " answer--correct" : "") + '" data-k="' + k + '"><span class="answer__key">' + letter(k) + '</span><span class="answer__text">' + esc(opt.text) + "</span></button>"
                        )
                        .join("") +
                    "</div>" +
                    '<div class="nav-row">' +
                    '<button class="btn btn--ghost" id="prev">Câu trước</button>' +
                    '<button class="btn btn--primary" id="next">' + (i === quiz.length - 1 ? "Nộp bài" : "Câu tiếp") + "</button>" +
                    "</div></div>"
                );
                bindTopbar();
                $$(".answer").forEach((btn) =>
                    btn.addEventListener("click", () => {
                        item.picked = +btn.dataset.k;
                        $$(".answer").forEach((b) => b.classList.remove("answer--correct"));
                        btn.classList.add("answer--correct");
                    })
                );
                $("#prev").addEventListener("click", () => {
                    if (i > 0) { i--; draw(); }
                });
                $("#next").addEventListener("click", () => {
                    if (i === quiz.length - 1) finish();
                    else { i++; draw(); }
                });
            }

            function finish() {
                let correct = 0;
                quiz.forEach((item) => {
                    const ok = item.picked !== null && item.display[item.picked].isCorrect;
                    if (ok) correct++;
                    SRS.grade(item.q.id, ok);
                });
                const pct = Math.round((correct / quiz.length) * 100);
                const wrongItems = quiz.filter((item) => !(item.picked !== null && item.display[item.picked].isCorrect));

                const review = wrongItems.length
                    ? '<h3 class="section-title">Xem lại ' + wrongItems.length + ' câu chưa đúng</h3>' +
                    '<div class="review-list">' +
                    wrongItems
                        .map((item) => {
                            const your = item.picked === null ? "Bỏ trống" : esc(item.display[item.picked].text);
                            return (
                                '<div class="review-item">' +
                                '<div class="review-item__q">' + esc(item.q.question) + "</div>" +
                                '<div class="review-item__row"><span class="review-item__tag tag-wrong">Bạn chọn</span><span>' + your + "</span></div>" +
                                '<div class="review-item__row"><span class="review-item__tag tag-correct">Đáp án</span><span>' + esc(correctAnswerOf(item.q)) + "</span></div>" +
                                "</div>"
                            );
                        })
                        .join("") +
                    "</div>"
                    : '<div class="banner" style="max-width:480px;margin:0 auto">🌟 Tuyệt vời! Bạn trả lời đúng tất cả các câu.</div>';

                const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚";
                shell(
                    "exam",
                    '<div class="animate-pop" style="width:100%;display:flex;flex-direction:column;align-items:center">' +
                    '<div class="panel">' +
                    '<div class="panel__emoji">' + emoji + "</div>" +
                    '<h2 class="panel__title">Kết quả bài thi</h2>' +
                    '<div class="result__big">' + pct + "%</div>" +
                    '<div class="stat-grid">' +
                    '<div class="stat"><div class="stat__label">Đúng</div><div class="stat__value is-good">' + correct + "</div></div>" +
                    '<div class="stat"><div class="stat__label">Sai / bỏ</div><div class="stat__value is-bad">' + (quiz.length - correct) + "</div></div>" +
                    "</div>" +
                    '<div class="panel__actions">' +
                    '<button class="btn btn--ghost" id="menu">Về menu</button>' +
                    '<button class="btn btn--primary" id="again">Thi lại</button>' +
                    "</div></div>" +
                    review +
                    "</div>"
                );
                $("#menu").addEventListener("click", () => Router.go("menu"));
                $("#again").addEventListener("click", () => Router.go("exam"));
            }
            draw();
        }
        setup();
    }

    /* §10 — MATCHING MODE (drag-to-connect) — REDESIGNED ----- */
    function MatchingMode() {
        const PAIRS = 4;
        let playedIds = [];
        let round = null; // { pairs:[{id,question,answer}], matched:Set, moves, start }
        let drag = null; // active drag state

        activeCleanup = teardownDrag;

        function newRound(fresh) {
            if (fresh) playedIds = [];
            let pool = QUESTIONS.filter((q) => playedIds.indexOf(q.id) === -1);
            if (pool.length < PAIRS) {
                pool = QUESTIONS.slice();
                playedIds = [];
            }
            const picked = shuffle(pool).slice(0, PAIRS);
            playedIds = playedIds.concat(picked.map((q) => q.id));
            round = {
                pairs: picked.map((q) => ({ id: q.id, question: q.question, answer: correctAnswerOf(q) })),
                left: shuffle(picked.map((q) => q.id)),
                right: shuffle(picked.map((q) => q.id)),
                matched: [],
                moves: 0,
                start: Date.now()
            };
            draw();
        }

        function pairById(id) {
            return round.pairs.find((p) => p.id === id);
        }

        function draw() {
            const leftCards = round.left
                .map((id, idx) => {
                    const p = pairById(id);
                    const done = round.matched.indexOf(id) !== -1;
                    return (
                        '<div class="match-card match-card--left' + (done ? " is-matched" : "") + '" data-side="left" data-id="' + id + '">' +
                        '<span class="match-card__index">' + (idx + 1) + "</span>" +
                        "<span>" + esc(p.question) + "</span>" +
                        '<span class="match-card__nub"></span>' +
                        "</div>"
                    );
                })
                .join("");
            const rightCards = round.right
                .map((id, idx) => {
                    const p = pairById(id);
                    const done = round.matched.indexOf(id) !== -1;
                    return (
                        '<div class="match-card match-card--right' + (done ? " is-matched" : "") + '" data-side="right" data-id="' + id + '">' +
                        '<span class="match-card__nub"></span>' +
                        '<span class="match-card__index">' + letter(idx) + "</span>" +
                        "<span>" + esc(p.answer) + "</span>" +
                        "</div>"
                    );
                })
                .join("");

            shell(
                "matching",
                '<div class="match animate-pop">' +
                '<div class="topbar">' +
                '<div class="topbar__group"><button class="back-btn" id="back">' + iconBack() + " Trở lại</button></div>" +
                '<div class="topbar__group">' +
                '<span class="pill">Tiến độ <strong>' + Math.min(playedIds.length, QUESTIONS.length) + "/" + QUESTIONS.length + "</strong></span>" +
                '<span class="pill">Lượt <strong>' + round.moves + "</strong></span>" +
                "</div></div>" +
                '<p class="match__hint">🔗 Giữ và kéo một thẻ đáp án (bên phải) thả vào câu hỏi tương ứng (bên trái).</p>' +
                '<div class="match-board" id="board">' +
                '<svg class="match-lines" id="lines"></svg>' +
                '<div class="match-col"><div class="match-col__head">Câu hỏi</div>' + leftCards + "</div>" +
                '<div class="match-col"><div class="match-col__head">Đáp án</div>' + rightCards + "</div>" +
                "</div></div>"
            );
            $("#back").addEventListener("click", () => Router.go("menu"));
            bindDrag();
            redrawLines();
        }

        /* ---- Connecting-line rendering ---- */
        function boardRect() {
            return $("#board").getBoundingClientRect();
        }
        function nubPoint(card, side) {
            const r = card.getBoundingClientRect();
            const b = boardRect();
            const x = side === "left" ? r.right - b.left : r.left - b.left;
            const y = r.top - b.top + r.height / 2;
            return { x: x, y: y };
        }
        function lineEl(x1, y1, x2, y2, cls) {
            const svgns = "http://www.w3.org/2000/svg";
            const path = document.createElementNS(svgns, "path");
            const dx = Math.abs(x2 - x1) * 0.45;
            path.setAttribute("d", "M " + x1 + " " + y1 + " C " + (x1 + dx) + " " + y1 + " " + (x2 - dx) + " " + y2 + " " + x2 + " " + y2);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke-width", "3");
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("class", cls);
            return path;
        }
        function redrawLines() {
            const svg = $("#lines");
            if (!svg) return;
            while (svg.firstChild) svg.removeChild(svg.firstChild);
            // locked (matched) lines
            round.matched.forEach((id) => {
                const l = $('.match-card--left[data-id="' + id + '"]');
                const r = $('.match-card--right[data-id="' + id + '"]');
                if (!l || !r) return;
                const a = nubPoint(l, "left");
                const b = nubPoint(r, "right");
                const p = lineEl(a.x, a.y, b.x, b.y, "");
                p.setAttribute("stroke", "#10b981");
                p.setAttribute("opacity", "0.8");
                svg.appendChild(p);
            });
            // active drag line
            if (drag && drag.curX != null) {
                const start = nubPoint(drag.card, "right");
                const b = boardRect();
                const p = lineEl(start.x, start.y, drag.curX - b.left, drag.curY - b.top, "");
                p.setAttribute("stroke", drag.overId === drag.sourceId ? "#34d399" : "#818cf8");
                p.setAttribute("stroke-dasharray", "7 6");
                svg.appendChild(p);
            }
        }

        /* ---- Pointer drag handling (mouse + touch unified) ---- */
        function bindDrag() {
            $$('.match-card--right').forEach((card) => {
                if (round.matched.indexOf(+card.dataset.id) !== -1) return;
                card.addEventListener("pointerdown", onDown);
            });
            window.addEventListener("resize", redrawLines);
        }
        function teardownDrag() {
            window.removeEventListener("resize", redrawLines);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            removeGhost();
        }
        function onDown(e) {
            const card = e.currentTarget;
            const id = +card.dataset.id;
            if (round.matched.indexOf(id) !== -1) return;
            e.preventDefault();
            drag = { card: card, sourceId: id, curX: e.clientX, curY: e.clientY, overId: null };
            card.classList.add("is-source");
            makeGhost(pairById(id).answer, e.clientX, e.clientY);
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
            redrawLines();
        }
        function onMove(e) {
            if (!drag) return;
            drag.curX = e.clientX;
            drag.curY = e.clientY;
            moveGhost(e.clientX, e.clientY);
            const target = document.elementFromPoint(e.clientX, e.clientY);
            const leftCard = target ? target.closest(".match-card--left") : null;
            const overId = leftCard && round.matched.indexOf(+leftCard.dataset.id) === -1 ? +leftCard.dataset.id : null;
            if (overId !== drag.overId) {
                $$(".match-card--left").forEach((c) => c.classList.remove("is-target"));
                if (overId !== null) leftCard.classList.add("is-target");
                drag.overId = overId;
            }
            redrawLines();
        }
        function onUp() {
            if (!drag) return;
            const sourceId = drag.sourceId;
            const overId = drag.overId;
            const sourceCard = drag.card;
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            removeGhost();
            sourceCard.classList.remove("is-source");
            $$(".match-card--left").forEach((c) => c.classList.remove("is-target"));

            if (overId !== null) {
                round.moves++;
                if (overId === sourceId) {
                    // correct match
                    round.matched.push(sourceId);
                    SRS.grade(sourceId, true);
                    drag = null;
                    if (round.matched.length === round.pairs.length) {
                        updateMovesPill();
                        redrawLines();
                        setTimeout(finish, 450);
                        return;
                    }
                    draw();
                    return;
                } else {
                    // wrong match: brief shake feedback
                    SRS.grade(sourceId, false);
                    const lc = $('.match-card--left[data-id="' + overId + '"]');
                    if (lc) { lc.classList.add("is-wrong", "animate-shake"); }
                    sourceCard.classList.add("is-wrong", "animate-shake");
                    updateMovesPill();
                    setTimeout(() => {
                        if (lc) lc.classList.remove("is-wrong", "animate-shake");
                        sourceCard.classList.remove("is-wrong", "animate-shake");
                    }, 600);
                }
            }
            drag = null;
            redrawLines();
        }
        function updateMovesPill() {
            const pills = $$(".pill strong");
            if (pills[1]) pills[1].textContent = round.moves;
        }

        /* ---- Floating ghost that follows the pointer ---- */
        let ghost = null;
        function makeGhost(text, x, y) {
            removeGhost();
            ghost = document.createElement("div");
            ghost.className = "match-ghost";
            ghost.textContent = text;
            document.body.appendChild(ghost);
            moveGhost(x, y);
        }
        function moveGhost(x, y) {
            if (!ghost) return;
            ghost.style.left = x + "px";
            ghost.style.top = y + "px";
        }
        function removeGhost() {
            if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
            ghost = null;
        }

        function finish() {
            const secs = ((Date.now() - round.start) / 1000).toFixed(1);
            const doneAll = playedIds.length >= QUESTIONS.length;
            shell(
                "matching",
                '<div class="panel animate-pop">' +
                '<div class="panel__emoji">🧠</div>' +
                '<h2 class="panel__title">Liên kết thành công!</h2>' +
                (doneAll ? '<div class="banner">🎉 Bạn đã ghép hết toàn bộ ' + QUESTIONS.length + " câu!</div>" : "") +
                '<div class="stat-grid">' +
                '<div class="stat"><div class="stat__label">Thời gian</div><div class="stat__value is-good">' + secs + "s</div></div>" +
                '<div class="stat"><div class="stat__label">Số lượt thử</div><div class="stat__value">' + round.moves + "</div></div>" +
                "</div>" +
                '<div class="panel__actions">' +
                '<button class="btn btn--ghost" id="menu">Về menu</button>' +
                '<button class="btn btn--primary" id="again">Ván mới</button>' +
                "</div></div>"
            );
            $("#menu").addEventListener("click", () => Router.go("menu"));
            $("#again").addEventListener("click", () => newRound(false));
        }

        newRound(true);
    }

    /* ---- Shared small UI builders ---- */
    function topbar(active, rightHtml) {
        return (
            '<div class="topbar">' +
            '<div class="topbar__group"><button class="back-btn" data-back="1">' + iconBack() + " Trở lại</button></div>" +
            '<div class="topbar__group">' + (rightHtml || "") + "</div>" +
            "</div>"
        );
    }
    function bindTopbar() {
        const b = $('[data-back="1"]');
        if (b) b.addEventListener("click", () => Router.go("menu"));
    }
    function iconBack() {
        return '<svg class="icon" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>';
    }
    function iconArrow() {
        return '<svg class="icon" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>';
    }
    function iconCheck() {
        return '<svg class="icon" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
    }

    /* §11 — BOOT --------------------------------------------- */
    const SCREENS = {
        menu: MainMenu,
        flashcard: FlashcardMode,
        review: ReviewMode,
        exam: ExamMode,
        survival: SurvivalMode,
        matching: MatchingMode
    };

    Router.go("menu");
})();
