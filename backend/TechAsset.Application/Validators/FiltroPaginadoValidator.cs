using FluentValidation;

namespace TechAsset.Application.Validators;

public abstract class FiltroPaginadoValidator<T> : AbstractValidator<T> where T : Common.Contracts.FiltroPaginado
{
    protected FiltroPaginadoValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1).WithMessage("La página debe ser mayor o igual a 1.");
        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("El tamaño de página debe estar entre 1 y 100.");
        RuleFor(x => x.Buscar).MaximumLength(100).WithMessage("La búsqueda admite hasta 100 caracteres.");
    }
}
