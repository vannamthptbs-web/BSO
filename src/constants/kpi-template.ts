/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KPICriterion {
  id: string;
  label: string;
  subCriteria?: KPICriterion[];
  maxPoints?: number;
  products?: string[];
  description?: string;
}

export const GENERAL_TASKS: KPICriterion[] = [
  {
    id: 'I',
    label: 'I. Phẩm chất chính trị, phẩm chất đạo đức, văn hóa thực thi công vụ và ý thức kỷ luật, kỷ cương trong thực thi công vụ',
    maxPoints: 10,
    subCriteria: [
      {
        id: 'I-1',
        label: '1. Phẩm chất chính trị, phẩm chất đạo đức, văn hóa thực thi công vụ.',
        maxPoints: 5,
        subCriteria: [
          {
            id: 'I-1.1',
            label: '1.1. Chấp hành nghiêm túc đường lối, chủ trương của Đảng, chính sách pháp luật của Nhà nước và các nguyên tắc tổ chức, kỷ luật của Đảng',
            maxPoints: 1,
            products: [
              'Bản tự kiểm điểm, đánh giá, xếp loại viên chức hằng năm.',
              'Bản tự kiểm điểm, đánh giá, xếp loại đảng viên hằng năm.',
              'Bản cam kết tu dưỡng, rèn luyện và phấn đấu hằng năm.'
            ]
          },
          {
            id: 'I-1.2',
            label: '1.2. Có quan điểm, bản lĩnh chính trị vững vàng; kiên định lập trường; không dao động trước mọi khó khăn, thách thức',
            maxPoints: 1,
            products: [
              'Nói, viết, làm đúng pháp luật.',
              'Thực hiện tốt Luật an ninh mạng và văn hoá mạng xã hội.',
              'Đấu tranh bảo vệ cái tốt, phản đối cái xấu.',
              'Đấu tranh, phản bác các luận điệu sai trái, thù địch, xuyên tạc.'
            ]
          },
          {
            id: 'I-1.3',
            label: '1.3. Có ý thức nghiên cứu, học tập, vận dụng chủ nghĩa Mác – Lênin, tư tưởng Hồ Chí Minh, nghị quyết, chỉ thị, quyết định và các văn bản của Đảng',
            maxPoints: 0.5,
            products: [
              'Tham gia học tập chính trị.',
              'Sản phẩm góp ý nghị quyết.',
              'Tham gia các hội thi tuyên truyền về Đảng, Bác Hồ, về Nhà nước.'
            ]
          },
          {
            id: 'I-1.4',
            label: '1.4. Giữ gìn phẩm chất đạo đức, lối sống trong sáng, trung thực, khiêm tốn, chân thành, giản dị; không có biểu hiện suy thoái về tư tưởng chính trị, đạo đức, lối sống, “tự diễn biến”, “tự chuyển hóa”',
            maxPoints: 0.5,
            products: [
              'Đạo đức, phong cách sống.',
              'Phiếu đánh giá 27 biểu hiện "tự diễn biến", "tự chuyển hoá".',
              'Đánh giá, xếp loại học sinh trung thực, khách quan.'
            ]
          },
          {
            id: 'I-1.5',
            label: '1.5. Không tiêu cực, quan liêu, hách dịch, cửa quyền, vụ lợi',
            maxPoints: 0.5,
            products: [
              'Kết quả xét Gia đình văn hoá hằng năm.',
              'Xác nhận 213 (đối với đảng viên).',
              'Kết quả giải quyết kiến nghị, khiếu nại, tố cáo tại đơn vị.'
            ]
          },
          {
            id: 'I-1.6',
            label: '1.6. Có tinh thần đoàn kết, ý thức xây dựng cơ quan, tổ chức, đơn vị trong sạch, vững mạnh; tích cực tham gia các hoạt động tập thể',
            maxPoints: 0.5,
            products: [
              'Không gây mất đoàn kết nội bộ; có trách nhiệm trong công tác bảo vệ đoàn kết nội bộ.',
              'Không xa lánh đồng nghiệp, nhân dân, học sinh.',
              'Thực hiện tốt các nguyên tắc trong hội họp.'
            ]
          },
          {
            id: 'I-1.7',
            label: '1.7. Thực hiện văn hóa công vụ: có thái độ đúng mực, phong cách làm việc chuẩn mực trong các mối quan hệ công tác',
            maxPoints: 0.5,
            products: [
              'Chuẩn đạo đức nhà giáo.',
              'Thực hiện Quy chế làm việc của đơn vị, bộ Quy tắc ứng xử trong trường học.',
              'Thái độ đối với công dân khi đến liên hệ công việc.'
            ]
          },
          {
            id: 'I-1.8',
            label: '1.8. Tinh thần tự phê bình; tự soi, tự sửa; mức độ tự giác nhận diện hạn chế, khuyết điểm của bản thân và kết quả khắc phục sau khi đã được chỉ ra.',
            maxPoints: 0.5,
            products: [
              'Tự đánh giá 27 biểu hiện;',
              'Tự kiểm điểm, đánh giá;',
              'Tự phê bình và phê bình trong hội họp;',
              'Kết quả tự khắc phục hạn chế, yếu kém;',
              'Kết quả kiểm tra, giám sát.'
            ]
          }
        ]
      },
      {
        id: 'I-2',
        label: '2. Ý thức kỷ luật, kỷ cương trong thực thi công vụ',
        maxPoints: 5,
        subCriteria: [
          {
            id: 'I-2.1',
            label: '2.1. Chấp hành sự phân công của tổ chức',
            maxPoints: 2,
            products: [
              'Thái độ với công việc được giao.',
              'Hiệu quả trong công tác tham mưu khi nhận nhiệm vụ.'
            ]
          },
          {
            id: 'I-2.2',
            label: '2.2. Thực hiện các quy định, quy chế, nội quy của đơn vị nơi công tác',
            maxPoints: 1,
            products: [
              'Phiếu khảo sát từ đồng nghiệp.',
              'Đánh giá của Tổ trưởng.'
            ]
          },
          {
            id: 'I-2.3',
            label: '2.3. Thực hiện việc kê khai thông tin cá nhân theo quy định',
            maxPoints: 1,
            products: [
              'Cập nhật, bổ sung thông tin trên hệ thống quản lý.',
              'Phiếu bổ sung lý lịch hằng năm.',
              'Bổ sung đủ các loại hồ sơ vào tập Hồ sơ CB, VC.'
            ]
          },
          {
            id: 'I-2.4',
            label: '2.4. Báo cáo đầy đủ, trung thực, cung cấp thông tin chính xác, khách quan về những nội dung liên quan đến việc thực hiện chức trách, nhiệm vụ được giao',
            maxPoints: 1,
            products: [
              'Chất lượng của Bản đánh giá, xếp loại viên chức hằng năm.',
              'Kết quả đánh giá BDTX.',
              'Kết quả đánh giá chuẩn GV.',
              'Kết quả các báo cáo khi HT yêu cầu.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'II',
    label: 'II. Năng lực chuyên môn, nghiệp vụ theo yêu cầu của vị trí việc làm',
    maxPoints: 10,
    subCriteria: [
      {
        id: 'II-1',
        label: '1. Năng lực chuyên môn, nghiệp vụ theo yêu cầu của vị trí việc làm',
        maxPoints: 2.5,
        subCriteria: [
          {
            id: 'II-1.1',
            label: '1.1. Có kiến thức chuyên sâu, toàn diện về lĩnh vực công tác được phân công; hiểu biết đầy đủ về quy định pháp luật, quy trình nghiệp vụ có liên quan đến vị trí việc làm (*)',
            maxPoints: 1,
            products: [
              'Hồ sơ CB, VC theo quy định.',
              'Bồi dưỡng HSG, Hướng dẫn NCKH.'
            ]
          },
          {
            id: 'II-1.2',
            label: '1.2. Thường xuyên cập nhật kiến thức mới, có khả năng nghiên cứu, phân tích, tổng hợp và vận dụng sáng tạo vào công việc; đáp ứng yêu cầu đổi mới, cải cách hành chính',
            maxPoints: 0.75,
            products: [
              'Kế hoạch, sản phẩm BDTX.',
              'Hồ sơ tập huấn, Báo cáo chuyên đề.',
              'Đề tài sáng kiến và hướng dẫn nghiên cứu.'
            ]
          },
          {
            id: 'II-1.3',
            label: '1.3. Có kỹ năng xử lý công việc độc lập, làm việc nhóm hiệu quả; sử dụng thành thạo công nghệ thông tin và các công cụ hỗ trợ phục vụ chuyên môn, nghiệp vụ',
            maxPoints: 0.75,
            products: [
              'Kết quả công tác chủ nhiệm, sinh hoạt chuyên môn.',
              'Công tác chuyển đổi số.',
              'Sử dụng các phần mềm phục vụ giảng dạy, quản lý.'
            ]
          }
        ]
      },
      {
        id: 'II-2',
        label: '2. Khả năng đáp ứng yêu cầu thực thi nhiệm vụ được giao thường xuyên, đột xuất',
        maxPoints: 2.5,
        subCriteria: [
          {
            id: 'II-2.1',
            label: '2.1. Nhiệm vụ thường xuyên (*): Có khả năng vận dụng thành thạo kiến thức chuyên môn, nghiệp vụ để xử lý công việc chuyên môn theo kế hoạch định kỳ; duy trì ổn định chất lượng chuyên môn',
            maxPoints: 1.25,
            products: [
              'Kết quả kiểm tra hồ sơ chuyên môn và nghiệp vụ khác.',
              'Kết quả giáo dục học sinh.'
            ]
          },
          {
            id: 'II-2.2',
            label: '2.2. Nhiệm vụ đột xuất: Chủ động đề xuất giải pháp, thực hiện hiệu quả các công việc phát sinh có tính chất chuyên môn cao; có khả năng phản ứng nhanh, chính xác với yêu cầu mới',
            maxPoints: 1.25,
            products: [
              'Năng lực tham mưu cho Hiệu trưởng.',
              'Kết quả bồi dưỡng đội tuyển.',
              'Tham gia các hoạt động giáo dục khác.',
              'Kết quả thi GVDG, GVCNG.'
            ]
          }
        ]
      },
      {
        id: 'II-3',
        label: '3. Tinh thần trách nhiệm trong thực thi công vụ',
        maxPoints: 2.5,
        subCriteria: [
          {
            id: 'II-3.1',
            label: '3.1. Có tinh thần trách nhiệm trong việc nghiên cứu, đề xuất, tham mưu nội dung chuyên môn; chủ động tiếp cận thông tin, kịp thời điều chỉnh cách làm để phù hợp với yêu cầu mới',
            maxPoints: 1.25,
            products: [
              'Sáng kiến, đề xuất, tham mưu trong lĩnh vực chuyên môn.',
              'Nội dung cải tiến trong giảng dạy và các hoạt động giáo dục.'
            ]
          },
          {
            id: 'II-3.2',
            label: '3.2. Tích cực cập nhật, ứng dụng kiến thức, công nghệ mới trong công việc chuyên môn; có tinh thần cầu thị, phối hợp tốt trong các hoạt động liên quan đến chuyên môn',
            maxPoints: 1.25,
            products: [
              'Ứng dụng CNTT để đổi mới PPDH, KTĐG.',
              'Kết quả số hóa tài liệu dạy học.',
              'Chia sẻ kinh nghiệm trong công tác giáo dục.'
            ]
          }
        ]
      },
      {
        id: 'II-4',
        label: '4. Thái độ phục vụ người dân, doanh nghiệp và khả năng phối hợp với đồng nghiệp',
        maxPoints: 2.5,
        subCriteria: [
          {
            id: 'II-4.1',
            label: '4.1. Được người dân, học sinh đánh giá tích cực về tính chuyên nghiệp, rõ ràng, minh bạch trong cung cấp thông tin, tư vấn chuyên môn',
            maxPoints: 1.25,
            products: [
              'Kết quả khảo sát từ PH và HS.',
              'Thông tin thu thập từ đội ngũ nhà giáo.'
            ]
          },
          {
            id: 'II-4.2',
            label: '4.2. Được đánh giá có tinh thần trách nhiệm, hợp tác trong chuyên môn',
            maxPoints: 1.25,
            products: [
              'Trách nhiệm với tập thể, với mọi người trong công tác chuyên môn.',
              'Phát huy tốt tinh thần tự phê bình và phê bình; thực hiện tốt quy chế dân chủ cơ sở.',
              'Trách nhiệm trong công tác phối hợp giáo dục HS.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'III',
    label: 'III. Năng lực đổi mới, sáng tạo, dám nghĩ, dám làm, dám chịu trách nhiệm vì lợi ích chung trong thực thi công vụ',
    maxPoints: 10,
    subCriteria: [
      {
        id: 'III-1',
        label: '1. Giải pháp đột phá, sáng tạo đem lại giá trị, hiệu quả thiết thực, tác động tích cực đến kết quả thực hiện nhiệm vụ của đơn vị',
        maxPoints: 2.5,
        products: [
          'Báo cáo giải pháp.',
          'Sản phẩm đặc biệt được mang lại từ sự đóng góp cho sự nghiệp giáo dục.'
        ]
      },
      {
        id: 'III-2',
        label: '2. Sẵn sàng tham gia thực hiện nhiệm vụ chính trị đặc biệt quan trọng, nhiệm vụ có tính chất đột xuất, phức tạp hoặc trong điều kiện khó khăn',
        maxPoints: 2.5,
        products: [
          'Những hành động đặc biệt trong công tác xã hội đem lại giá trị giáo dục cao.',
          'Sản phẩm đặc biệt cụ thể trong quá trình công tác.'
        ]
      },
      {
        id: 'III-3',
        label: '3. Có tinh thần chịu trách nhiệm trước kết quả công việc; chủ động nhận trách nhiệm khi có sai sót và có biện pháp khắc phục rõ ràng, cụ thể',
        maxPoints: 2.5,
        products: [
          'Thể hiện tinh thần cầu thị đối với mọi công việc. Không đùn đẩy trách nhiệm hoặc đổ lỗi cho người khác.',
          'Chủ động nhận trách nhiệm với sai sót trong công tác và có biện pháp khắc phục kịp thời, hiệu quả.'
        ]
      },
      {
        id: 'III-4',
        label: '4. Chủ động đưa ra quyết định trong phạm vi thẩm quyền, không né tránh; có tinh thần tiên phong trong thực hiện những nhiệm vụ mới',
        maxPoints: 2.5,
        products: [
          'Thể hiện sự tiên phong, gương mẫu trong mọi công việc của đơn vị.',
          'Kết quả tham gia các hoạt động chuyên môn và công tác giáo dục khác.'
        ]
      }
    ]
  }
];

export const PROFESSIONAL_TASKS: KPICriterion[] = [
  {
    id: 'B-I',
    label: 'I. KẾT QUẢ THỰC HIỆN CÔNG TÁC CHUYÊN MÔN CỦA GIÁO VIÊN',
    subCriteria: [
      {
        id: 'B-I-1',
        label: '1. Hồ sơ chuyên môn giáo viên, hồ sơ chuyên môn tổ và việc thực hiện nội quy, quy chế',
        subCriteria: [
          {
            id: 'B-I-1.1',
            label: '1.1. Hồ sơ theo quy định.',
            maxPoints: 100,
            products: [
              'Kế hoạch giáo dục.',
              'Kế hoạch bài dạy.',
              'Sổ theo dõi, đánh giá học sinh.',
              'Các loại hồ sơ của đơn vị mình quản lý (tổ, Đoàn)'
            ]
          },
          {
            id: 'B-I-1.2',
            label: '1.2 Việc thực hiện nội quy, quy chế cơ quan',
            maxPoints: 100,
            products: [
              'Giờ giấc khi lên lớp',
              'Tham gia các cuộc họp, buổi lễ, hoạt động của nhà trường, Đoàn thể triệu tập',
              'Thực hiện Thông tư số 03/2026/TT-BGDĐT quy định về quy tắc ứng xử của nhà giáo'
            ]
          }
        ]
      },
      {
        id: 'B-I-2',
        label: '2. Hiệu quả và tiến độ thực hiện các công tác chuyên môn, giảng dạy, giáo dục',
        subCriteria: [
          {
            id: 'B-I-2.1',
            label: '2.1. Chất lượng học tập của học sinh do mình phụ trách và tiến độ thực hiện các công tác giảng dạy, giáo dục đối với lớp mình phụ trách',
            maxPoints: 100,
            products: [
              'Điểm sơ kết, tổng kết bộ môn so với mặt bằng chung với các lớp.',
              'Đảm bảo số cột điểm theo quy định, tiến độ vào điểm so với kế hoạch, tham gia ký học bạ'
            ]
          },
          {
            id: 'B-I-2.2',
            label: '2.2. Việc tham gia các hoạt động giáo dục khác',
            maxPoints: 100,
            products: [
              'Hướng dẫn nghiên cứu khoa học kỹ thuật, ý tưởng khởi nghiệp, hướng dẫn học sinh tham gia Robocon',
              'Tham gia bồi dưỡng Học sinh Giỏi, Huấn luyện học sinh tham gia các Hội thi về thể dục thể thao, văn hóa, văn nghệ',
              'Tham gia Tập luyện văn nghệ cho học sinh thực hiện các đợt hoạt động ngoại khóa (Lễ khai giảng, tổng kết, tri ân...) Tổ chức hoạt động các câu lạc bộ',
              'Tham gia các hoạt động giáo dục khác do nhà trường tổ chức'
            ]
          }
        ]
      },
      {
        id: 'B-I-3',
        label: '3. Công tác bồi dưỡng, tập huấn và nâng cao năng lực chuyên môn',
        subCriteria: [
          {
            id: 'B-I-3.1',
            label: '3.1. Bồi dưỡng, tập huấn theo kế hoạch của Sở',
            maxPoints: 100,
            products: [
              'Sản phẩm bồi dưỡng, tập huấn (chứng chỉ, chứng nhận).',
              'Báo cáo tại đơn vị.',
              'Học chính trị, bài thu hoạch.'
            ]
          },
          {
            id: 'B-I-3.2',
            label: '3.2. Tự đào tạo, bồi dưỡng',
            maxPoints: 100,
            products: [
              'Bằng cấp.',
              'Kế hoạch và sản phẩm BDTX.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'B-II',
    label: 'II. KẾT QUẢ THỰC HIỆN NGHIỆP VỤ CÔNG TÁC KIÊM NHIỆM',
    subCriteria: [
      {
        id: 'B-II-1',
        label: '1. Kết quả hoạt động của đơn vị hoặc lĩnh vực được giao lãnh đạo, quản lý, phụ trách',
        subCriteria: [
          {
            id: 'B-II-1.1',
            label: '1.1. Kết quả đánh giá, xếp loại tập thể.',
            maxPoints: 100,
            products: [
              'Đánh giá, xếp loại của tổ chức do cá nhân phụ trách.',
              'Kết quả xếp loại thi đua cuối năm học liền kề.'
            ]
          },
          {
            id: 'B-II-1.2',
            label: '1.2. Kết quả đánh giá, xếp loại cá nhân.',
            maxPoints: 100,
            products: [
              'Đánh giá, xếp loại cá nhân thuộc tổ chức do mình phụ trách.',
              'Đánh giá, xếp loại đảng viên (nếu có).'
            ]
          }
        ]
      },
      {
        id: 'B-II-2',
        label: '2. Khả năng tổ chức triển khai thực hiện nhiệm vụ',
        subCriteria: [
          {
            id: 'B-II-2.1',
            label: '2.1. Xây dựng nội dung kế hoạch tổ chức.',
            maxPoints: 100,
            products: [
              'Văn bản được xây dựng cho tổ chức'
            ]
          },
          {
            id: 'B-II-2.2',
            label: '2.2. Tổ chức triển khai.',
            maxPoints: 100,
            products: [
              'Kết quả thực hiện các chỉ đạo của cấp trên',
              'Mức độ đảm bảo các nguyên tắc sinh hoạt theo quy định.'
            ]
          },
          {
            id: 'B-II-2.3',
            label: '2.3. Kết luận.',
            maxPoints: 100,
            products: [
              'Văn bản được ban hành.'
            ]
          },
          {
            id: 'B-II-2.4',
            label: '2.4. Đánh giá, cải tiến.',
            maxPoints: 100,
            products: [
              'Giải trình, phúc đáp (nếu có)',
              'Cải tiến trong kỳ họp tiếp theo.',
              'Chất lượng, tiến độ công việc tổ chức sau khi tổ chức triển khai thực hiện các chỉ đạo'
            ]
          }
        ]
      },
      {
        id: 'B-II-3',
        label: '3. Năng lực tập hợp, đoàn kết công chức thuộc phạm vi quản lý',
        subCriteria: [
          {
            id: 'B-II-3.1',
            label: '3.1. Bảo vệ đoàn kết, nhất trí trong tổ chức.',
            maxPoints: 100,
            products: [
              'Thực hiện công bằng xã hội.',
              'Đảm bảo chế độ người lao động.',
              'Có biện pháp giám sát các nhóm không chính thức.'
            ]
          },
          {
            id: 'B-II-3.2',
            label: '3.2. Xây dựng bầu không khí làm việc trong tổ chức.',
            maxPoints: 100,
            products: [
              'Công bằng, khách quan và đảm bảo các nguyên tắc quản lý.'
            ]
          },
          {
            id: 'B-II-3.3',
            label: '3.3. Thực hiện cần, kiệm, liêm chính, chí công vô tư.',
            maxPoints: 100,
            products: [
              'Đảm bảo các điều trong Quy định số 144-QĐ/TW ngày 09/5/2024 của Ban Chấp hành Trung ương'
            ]
          }
        ]
      }
    ]
  }
];

export const BONUS_CRITERIA = [
  { id: '1', label: 'Tham gia và đạt giải trong các cuộc thi, hội thi do trường tổ chức', points: { 'Nhất': 5, 'Nhì': 4, 'Ba': 3, 'KK': 2 } },
  { id: '2', label: 'Tham gia và đạt giải trong cuộc thi, hội thi cấp tỉnh', points: { 'Nhất': 10, 'Nhì': 8, 'Ba': 6, 'KK': 5 } },
  { id: '3', label: 'Hướng dẫn học sinh tham gia KHKT, Ý tưởng khởi nghiệp...cấp trường và đạt giải', points: { 'Nhất': 5, 'Nhì': 4, 'Ba': 3, 'KK': 2 } },
  { id: '4', label: 'Hướng dẫn học sinh tham gia KHKT, Ý tưởng khởi nghiệp,... đạt giải cấp tỉnh', points: { 'Nhất': 10, 'Nhì': 8, 'Ba': 6, 'KK': 5 } },
  { id: '5', label: 'Bồi dưỡng, huấn luyện HS đạt giải cấp tỉnh về Văn hóa, KHKT, Văn nghệ, TDTT', points: { 'Cá nhân Nhất': 10, 'Cá nhân Nhì': 8, 'Cá nhân Ba': 6, 'Cá nhân KK': 5, 'Đồng đội Nhất': 15, 'Đồng đội Nhì': 12, 'Đồng đội Ba': 10 } },
  { id: '6', label: 'Được BGH, ĐTN điều động chấm thi cuộc thi, hội thi cấp trường và các hoạt động chính trị, xã hội', points: 1 },
  { id: '7', label: 'Có bài đăng trên trang web của trường', points: 3 },
  { id: '8', label: 'Cá nhân có thành tích đột xuất đặc biệt trong công tác PCCC, cứu nạn cứu hộ...', points: { 'Trung ương': 20, 'Tỉnh': 15, 'Xã/Phường': 10, 'Trường': 5 } },
  { id: '9', label: 'Trực tiếp dạy thao giảng cụm chuyên môn / Báo cáo chuyên đề, tập huấn', points: { 'Thao giảng': 5, 'Chuyên đề trường': 3, 'Chuyên đề tổ': 1 } },
  { id: '10', label: 'Cộng điểm cho viên chức làm công tác chủ nhiệm lớp', points: { 'Giải cá nhân Nhất/Nhì': 2, 'Giải cá nhân Ba': 1, 'Giải tập thể Nhất/Nhì': 3, 'Giải tập thể Ba': 2, 'Lớp Nhất': 4, 'Lớp Nhì': 3, 'Lớp Ba': 2, 'Lớp KK': 1, 'Tập thể xuất sắc': 5, 'Tập thể tiên tiến': 3 } },
  { id: '11', label: 'Viên chức tham gia công tác xã hội (hiến máu, thiện nguyện....)', points: 5 },
  { id: '12', label: 'Nội dung khác', points: 0 }
];
