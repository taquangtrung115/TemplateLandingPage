namespace OnePortal.Presentation.Abstractions;

using Microsoft.AspNetCore.Routing;

public interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder app);
}
