namespace TemplateLandingPage.Application.Exceptions;

using TemplateLandingPage.Contract.Abstractions.Shared;

public sealed class ValidationException : Exception
{
    public IReadOnlyCollection<Error> Errors { get; }

    public ValidationException(IReadOnlyCollection<Error> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors;
    }
}
