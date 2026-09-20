namespace TemplateLandingPage.Contract.Abstractions.Shared;

public sealed class ValidationResult : Result, IValidationResult
{
    public Error[] Errors { get; }

    private ValidationResult(Error[] errors)
        : base(false, IValidationResult.ValidationError)
    {
        Errors = errors;
    }

    public static ValidationResult WithErrors(Error[] errors) => new(errors);
}

public sealed class ValidationResult<TValue> : Result<TValue>, IValidationResult
{
    public Error[] Errors { get; }

    private ValidationResult(Error[] errors)
        : base(default, false, IValidationResult.ValidationError)
    {
        Errors = errors;
    }

    public static ValidationResult<TValue> WithErrors(Error[] errors) => new(errors);
}
