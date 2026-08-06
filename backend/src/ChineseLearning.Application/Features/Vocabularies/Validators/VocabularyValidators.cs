using ChineseLearning.Application.Features.Vocabularies.DTOs;
using FluentValidation;

namespace ChineseLearning.Application.Features.Vocabularies.Validators;

public sealed class CreateVocabularyRequestValidator : AbstractValidator<CreateVocabularyRequest>
{
    public CreateVocabularyRequestValidator()
    {
        RuleFor(x => x.Simplified).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Pinyin).NotEmpty().MaximumLength(160);
        RuleFor(x => x.MeaningVi).NotEmpty().MaximumLength(500);
        RuleFor(x => x.HskLevel).InclusiveBetween(1, 9);
    }
}

public sealed class UpdateVocabularyRequestValidator : AbstractValidator<UpdateVocabularyRequest>
{
    public UpdateVocabularyRequestValidator()
    {
        RuleFor(x => x.Simplified).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Pinyin).NotEmpty().MaximumLength(160);
        RuleFor(x => x.MeaningVi).NotEmpty().MaximumLength(500);
        RuleFor(x => x.HskLevel).InclusiveBetween(1, 9);
    }
}
