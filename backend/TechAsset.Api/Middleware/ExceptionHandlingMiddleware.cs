using System.Text.Json;
using FluentValidation;
using TechAsset.Api.Common;
using TechAsset.Domain.Common;

namespace TechAsset.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainException ex)
        {
            await EscribirAsync(context, ApiErrorMapper.EstadoPara(ex.Codigo), ex.Codigo, ex.Message);
        }
        catch (ValidationException ex)
        {
            var errores = ex.Errors
                .Select(error => new ApiError(
                    string.IsNullOrWhiteSpace(error.PropertyName) ? "VALIDACION" : error.PropertyName,
                    error.ErrorMessage))
                .ToList();

            await EscribirAsync(context, StatusCodes.Status400BadRequest, errores);
        }
        catch (UnauthorizedAccessException ex)
        {
            await EscribirAsync(context, StatusCodes.Status403Forbidden, "PROHIBIDO", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al procesar {Metodo} {Ruta}", context.Request.Method, context.Request.Path);
            await EscribirAsync(
                context,
                StatusCodes.Status500InternalServerError,
                "ERROR_INTERNO",
                "Ocurrió un error interno. Intenta nuevamente.");
        }
    }

    private static async Task EscribirAsync(HttpContext context, int estado, string codigo, string mensaje)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        await EscribirAsync(context, estado, new[] { new ApiError(codigo, mensaje) });
    }

    private static async Task EscribirAsync(HttpContext context, int estado, IReadOnlyList<ApiError> errores)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = estado;
        context.Response.ContentType = "application/json";

        var respuesta = new ApiErrorResponse(errores);
        await context.Response.WriteAsync(JsonSerializer.Serialize(respuesta, OpcionesJson));
    }

    private static readonly JsonSerializerOptions OpcionesJson = new(JsonSerializerDefaults.Web);
}
