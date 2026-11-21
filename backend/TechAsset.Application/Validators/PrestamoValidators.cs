using FluentValidation;
using TechAsset.Application.DTOs.Prestamos;

namespace TechAsset.Application.Validators;

public sealed class SolicitarPrestamoRequestValidator : AbstractValidator<SolicitarPrestamoRequest>
{
    public SolicitarPrestamoRequestValidator()
    {
        RuleFor(x => x.EquipoId)
            .NotEmpty().WithMessage("Debe seleccionar un equipo.");

        RuleFor(x => x.FechaDevolucionProgramada)
            .Must(fecha => fecha != default)
            .WithMessage("La fecha de devolución es obligatoria.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500).WithMessage("La observación admite hasta 500 caracteres.");
    }
}

public sealed class RechazarPrestamoRequestValidator : AbstractValidator<RechazarPrestamoRequest>
{
    public RechazarPrestamoRequestValidator()
    {
        RuleFor(x => x.Motivo)
            .NotEmpty().WithMessage("Debe registrar el motivo del rechazo.")
            .MaximumLength(500).WithMessage("El motivo admite hasta 500 caracteres.");
    }
}

public sealed class DevolucionRequestValidator : AbstractValidator<DevolucionRequest>
{
    public DevolucionRequestValidator()
    {
        RuleFor(x => x.Observacion)
            .NotEmpty().WithMessage("Toda devolución debe registrar observaciones.")
            .MaximumLength(500).WithMessage("La observación admite hasta 500 caracteres.");
    }
}

public sealed class PrestamoFiltroValidator : FiltroPaginadoValidator<PrestamoFiltro>
{
    public PrestamoFiltroValidator()
    {
        RuleFor(x => x.Estado)
            .IsInEnum()
            .When(x => x.Estado.HasValue)
            .WithMessage("El estado indicado no es válido.");

        RuleFor(x => x.Area)
            .MaximumLength(100)
            .WithMessage("El área admite hasta 100 caracteres.");

        RuleFor(x => x)
            .Must(x => !x.Desde.HasValue || !x.Hasta.HasValue || x.Desde <= x.Hasta)
            .WithMessage("La fecha inicial no puede ser posterior a la fecha final.");
    }
}
