using Microsoft.AspNetCore.Mvc;
using TechAsset.Application.Common.Models;

namespace TechAsset.Api.Common;

public sealed record ApiError(string Codigo, string Mensaje);

public sealed record ApiErrorResponse(IReadOnlyList<ApiError> Errores)
{
    public ApiErrorResponse(Error error) : this(new[] { new ApiError(error.Codigo, error.Mensaje) })
    {
    }
}

public static class ApiErrorMapper
{
    public static int EstadoPara(string codigo) => codigo switch
    {
        "NO_ENCONTRADO" => StatusCodes.Status404NotFound,
        "PROHIBIDO" => StatusCodes.Status403Forbidden,
        "NO_AUTENTICADO" => StatusCodes.Status401Unauthorized,
        "AUTH_CREDENCIALES" => StatusCodes.Status401Unauthorized,
        "USUARIO_CORREO_DUPLICADO" => StatusCodes.Status409Conflict,
        "USUARIO_AUTO_DESHABILITACION" => StatusCodes.Status409Conflict,
        "EQUIPO_CODIGO_DUPLICADO" => StatusCodes.Status409Conflict,
        "EQUIPO_ESTADO_PRESTADO_MANUAL" => StatusCodes.Status409Conflict,
        "EQUIPO_ESTADO_INVALIDO" => StatusCodes.Status409Conflict,
        "PRESTAMO_VIGENTE" => StatusCodes.Status409Conflict,
        "DOMINIO_EQUIPO_NO_DISPONIBLE" => StatusCodes.Status409Conflict,
        "DOMINIO_TRANSICION_INVALIDA" => StatusCodes.Status409Conflict,
        "DOMINIO_PRESTAMO_NO_APROBABLE" => StatusCodes.Status409Conflict,
        "DOMINIO_PRESTAMO_NO_RECHAZABLE" => StatusCodes.Status409Conflict,
        "DOMINIO_PRESTAMO_NO_DEVOLUBLE" => StatusCodes.Status409Conflict,
        _ => StatusCodes.Status400BadRequest
    };
}

public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult FromResult<T>(Result<T> resultado, int estadoExito = StatusCodes.Status200OK)
    {
        if (resultado.EsExito)
        {
            return StatusCode(estadoExito, resultado.Valor);
        }

        return Error(resultado.Errores);
    }

    protected IActionResult Error(IReadOnlyList<Error> errores)
    {
        var estado = ApiErrorMapper.EstadoPara(errores.FirstOrDefault()?.Codigo ?? "ERROR");
        var respuesta = new ApiErrorResponse(errores.Select(error => new ApiError(error.Codigo, error.Mensaje)).ToList());
        return StatusCode(estado, respuesta);
    }
}
