using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TechAsset.Api.Common;

namespace TechAsset.Api.Filters;

public sealed class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argumento in context.ActionArguments.Values)
        {
            if (argumento is null)
            {
                continue;
            }

            var tipoValidador = typeof(IValidator<>).MakeGenericType(argumento.GetType());
            if (context.HttpContext.RequestServices.GetService(tipoValidador) is not IValidator validador)
            {
                continue;
            }

            var resultado = await validador.ValidateAsync(
                new ValidationContext<object>(argumento),
                context.HttpContext.RequestAborted);

            if (resultado.IsValid)
            {
                continue;
            }

            var errores = resultado.Errors
                .Select(error => new ApiError(
                    string.IsNullOrWhiteSpace(error.PropertyName) ? "VALIDACION" : error.PropertyName,
                    error.ErrorMessage))
                .ToList();

            context.Result = new BadRequestObjectResult(new ApiErrorResponse(errores));
            return;
        }

        await next();
    }
}
