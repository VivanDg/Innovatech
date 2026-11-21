namespace TechAsset.Domain.Common;

public abstract class EntidadBase
{
    public Guid Id { get; protected set; } = Guid.CreateVersion7();
    public DateTime CreadoEn { get; protected set; } = DateTime.UtcNow;
    public DateTime? ActualizadoEn { get; protected set; }

    protected void MarcarActualizado()
    {
        ActualizadoEn = DateTime.UtcNow;
    }
}
