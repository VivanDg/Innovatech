using FluentValidation;
using TechAsset.Application.DTOs.Equipos;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.Validators;

public sealed class CrearEquipoRequestValidator : AbstractValidator<CrearEquipoRequest>
{
    public CrearEquipoRequestValidator()
    {
        RuleFor(x => x.CodigoPatrimonial)
            .NotEmpty().WithMessage("El código patrimonial es obligatorio.")
            .MaximumLength(50).WithMessage("El código patrimonial admite hasta 50 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del equipo es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre admite hasta 100 caracteres.");

        RuleFor(x => x.Categoria)
            .IsInEnum().WithMessage("La categoría indicada no es válida.");

        RuleFor(x => x.Marca)
            .NotEmpty().WithMessage("La marca es obligatoria.")
            .MaximumLength(50).WithMessage("La marca admite hasta 50 caracteres.");

        RuleFor(x => x.Modelo).MaximumLength(50).WithMessage("El modelo admite hasta 50 caracteres.");
        RuleFor(x => x.NumeroSerie).MaximumLength(50).WithMessage("El número de serie admite hasta 50 caracteres.");
    }
}

public sealed class ActualizarEquipoRequestValidator : AbstractValidator<ActualizarEquipoRequest>
{
    public ActualizarEquipoRequestValidator()
    {
        RuleFor(x => x.CodigoPatrimonial)
            .NotEmpty().WithMessage("El código patrimonial es obligatorio.")
            .MaximumLength(50).WithMessage("El código patrimonial admite hasta 50 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del equipo es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre admite hasta 100 caracteres.");

        RuleFor(x => x.Categoria)
            .IsInEnum().WithMessage("La categoría indicada no es válida.");

        RuleFor(x => x.Marca)
            .NotEmpty().WithMessage("La marca es obligatoria.")
            .MaximumLength(50).WithMessage("La marca admite hasta 50 caracteres.");

        RuleFor(x => x.Modelo).MaximumLength(50).WithMessage("El modelo admite hasta 50 caracteres.");
        RuleFor(x => x.NumeroSerie).MaximumLength(50).WithMessage("El número de serie admite hasta 50 caracteres.");
    }
}

public sealed class CambiarEstadoEquipoRequestValidator : AbstractValidator<CambiarEstadoEquipoRequest>
{
    public CambiarEstadoEquipoRequestValidator()
    {
        RuleFor(x => x.Estado)
            .IsInEnum().WithMessage("El estado indicado no es válido.")
            .Must(estado => estado is EstadoEquipo.Disponible or EstadoEquipo.Mantenimiento or EstadoEquipo.Baja)
            .WithMessage("Solo se puede actualizar manualmente a Disponible, Mantenimiento o Baja.");
    }
}

public sealed class EquipoFiltroValidator : FiltroPaginadoValidator<EquipoFiltro>
{
    public EquipoFiltroValidator()
    {
        RuleFor(x => x.Estado)
            .IsInEnum()
            .When(x => x.Estado.HasValue)
            .WithMessage("El estado indicado no es válido.");

        RuleFor(x => x.Categoria)
            .IsInEnum()
            .When(x => x.Categoria.HasValue)
            .WithMessage("La categoría indicada no es válida.");
    }
}
