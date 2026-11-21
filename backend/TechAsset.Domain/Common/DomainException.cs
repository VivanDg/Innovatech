namespace TechAsset.Domain.Common;

public sealed class DomainException : Exception
{
    public DomainException(string codigo, string mensaje) : base(mensaje)
    {
        Codigo = codigo;
    }

    public string Codigo { get; }
}

public static class DomainErrorCodes
{
    public const string DatosInvalidos = "DOMINIO_DATOS_INVALIDOS";
    public const string EquipoNoDisponible = "DOMINIO_EQUIPO_NO_DISPONIBLE";
    public const string TransicionEstadoInvalida = "DOMINIO_TRANSICION_INVALIDA";
    public const string FechaDevolucionInvalida = "DOMINIO_FECHA_DEVOLUCION_INVALIDA";
    public const string DevolucionSinObservacion = "DOMINIO_DEVOLUCION_SIN_OBSERVACION";
    public const string PrestamoNoAprobable = "DOMINIO_PRESTAMO_NO_APROBABLE";
    public const string PrestamoNoRechazable = "DOMINIO_PRESTAMO_NO_RECHAZABLE";
    public const string PrestamoNoDevoluble = "DOMINIO_PRESTAMO_NO_DEVOLUBLE";
    public const string RechazoSinMotivo = "DOMINIO_RECHAZO_SIN_MOTIVO";
}
