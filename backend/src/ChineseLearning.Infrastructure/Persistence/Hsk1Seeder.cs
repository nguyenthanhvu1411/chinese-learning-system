using ChineseLearning.Domain.Constants;
using ChineseLearning.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ChineseLearning.Infrastructure.Persistence;

public sealed class Hsk1Seeder(ApplicationDbContext dbContext, ILogger<Hsk1Seeder> logger)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await dbContext.Topics.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Topics already exist. Skipping HSK 1 data seeding.");
            return;
        }

        logger.LogInformation("Seeding HSK 1 data...");

        var topicGreetings = Topic.Create("HSK 1 - Chào hỏi", "Từ vựng cơ bản để chào hỏi và giao tiếp cơ bản.");
        var topicNumbers = Topic.Create("HSK 1 - Số đếm", "Các số đếm cơ bản trong tiếng Trung.");
        var topicPronouns = Topic.Create("HSK 1 - Đại từ", "Đại từ nhân xưng cơ bản.");

        dbContext.Topics.AddRange(topicGreetings, topicNumbers, topicPronouns);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Greetings
        var vocabularies = new List<Vocabulary>
        {
            Vocabulary.Create(topicGreetings.Id, "你好", null, "nǐ hǎo", "Xin chào", 1),
            Vocabulary.Create(topicGreetings.Id, "再见", null, "zàijiàn", "Tạm biệt", 1),
            Vocabulary.Create(topicGreetings.Id, "谢谢", null, "xièxie", "Cảm ơn", 1),
            Vocabulary.Create(topicGreetings.Id, "不客气", null, "bú kèqi", "Không có gì", 1),
            Vocabulary.Create(topicGreetings.Id, "对不起", null, "duìbuqǐ", "Xin lỗi", 1),
            Vocabulary.Create(topicGreetings.Id, "没关系", null, "méi guānxi", "Không sao", 1),
            
            // Pronouns
            Vocabulary.Create(topicPronouns.Id, "我", null, "wǒ", "Tôi", 1),
            Vocabulary.Create(topicPronouns.Id, "你", null, "nǐ", "Bạn", 1),
            Vocabulary.Create(topicPronouns.Id, "他", null, "tā", "Anh ấy", 1),
            Vocabulary.Create(topicPronouns.Id, "她", null, "tā", "Cô ấy", 1),
            Vocabulary.Create(topicPronouns.Id, "我们", null, "wǒmen", "Chúng tôi", 1),
            
            // Numbers
            Vocabulary.Create(topicNumbers.Id, "一", null, "yī", "Một", 1),
            Vocabulary.Create(topicNumbers.Id, "二", null, "èr", "Hai", 1),
            Vocabulary.Create(topicNumbers.Id, "三", null, "sān", "Ba", 1),
            Vocabulary.Create(topicNumbers.Id, "四", null, "sì", "Bốn", 1),
            Vocabulary.Create(topicNumbers.Id, "五", null, "wǔ", "Năm", 1),
            Vocabulary.Create(topicNumbers.Id, "六", null, "liù", "Sáu", 1),
            Vocabulary.Create(topicNumbers.Id, "七", null, "qī", "Bảy", 1),
            Vocabulary.Create(topicNumbers.Id, "八", null, "bā", "Tám", 1),
            Vocabulary.Create(topicNumbers.Id, "九", null, "jiǔ", "Chín", 1),
            Vocabulary.Create(topicNumbers.Id, "十", null, "shí", "Mười", 1)
        };

        foreach (var v in vocabularies)
        {
            v.Publish();
        }

        dbContext.Vocabularies.AddRange(vocabularies);
        await dbContext.SaveChangesAsync(cancellationToken);
        
        logger.LogInformation("HSK 1 data seeded successfully.");
    }
}
