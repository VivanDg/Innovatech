using FluentValidation;
using TechAsset.Application.DTOs.Reportes;

namespace TechAsset.Application.Validators;

public sealed class MovimientoFiltroValidator : FiltroPaginadoValidator<MovimientoFiltro>
{
    public MovimientoFiltroValidator()
    {
        RuleFor(x => x.Tipo)
            .IsInEnum()
            .When(x => x.Tipo.HasValue)
            .WithMessage("El tipo de movimiento no es válido.");

        RuleFor(x => x)
            .Must(x => !x.Desde.HasValue || !x.Hasta.HasValue || x.Desde <= x.Hasta)
            .WithMessage("La fecha inicial no puede ser posterior a la fecha final.");
    }
}
