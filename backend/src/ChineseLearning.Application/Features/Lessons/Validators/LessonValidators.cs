using ChineseLearning.Application.Features.Lessons.DTOs;
using FluentValidation;

namespace ChineseLearning.Application.Features.Lessons.Validators;

public sealed class CreateLessonRequestValidator : AbstractValidator<CreateLessonRequest>
{
    public CreateLessonRequestValidator()
    {
        RuleFor(x => x.TopicId).NotEmpty().WithMessage("TopicId is required.");
        RuleFor(x => x.TitleVi).NotEmpty().MaximumLength(250).WithMessage("TitleVi must not exceed 250 characters.");
        RuleFor(x => x.DescriptionVi).MaximumLength(1500).WithMessage("DescriptionVi must not exceed 1500 characters.");
        RuleFor(x => x.EstimatedMinutes).GreaterThan(0).WithMessage("EstimatedMinutes must be greater than 0.");
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).WithMessage("SortOrder must be greater than or equal to 0.");
    }
}

public sealed class UpdateLessonRequestValidator : AbstractValidator<UpdateLessonRequest>
{
    public UpdateLessonRequestValidator()
    {
        RuleFor(x => x.TopicId).NotEmpty().WithMessage("TopicId is required.");
        RuleFor(x => x.TitleVi).NotEmpty().MaximumLength(250).WithMessage("TitleVi must not exceed 250 characters.");
        RuleFor(x => x.DescriptionVi).MaximumLength(1500).WithMessage("DescriptionVi must not exceed 1500 characters.");
        RuleFor(x => x.EstimatedMinutes).GreaterThan(0).WithMessage("EstimatedMinutes must be greater than 0.");
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).WithMessage("SortOrder must be greater than or equal to 0.");
    }
}

public sealed class AssignVocabularyRequestValidator : AbstractValidator<AssignVocabularyRequest>
{
    public AssignVocabularyRequestValidator()
    {
        RuleFor(x => x.VocabularyId).NotEmpty().WithMessage("VocabularyId is required.");
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).WithMessage("SortOrder must be greater than or equal to 0.");
    }
}

public sealed class UpdateVocabularyOrderRequestValidator : AbstractValidator<UpdateVocabularyOrderRequest>
{
    public UpdateVocabularyOrderRequestValidator()
    {
        RuleFor(x => x.VocabularyIds).NotEmpty().WithMessage("VocabularyIds list cannot be empty.");
    }
}
