using FluentValidation;
using TechAsset.Application.DTOs.Usuarios;

namespace TechAsset.Application.Validators;

public sealed class CrearUsuarioRequestValidator : AbstractValidator<CrearUsuarioRequest>
{
    public CrearUsuarioRequestValidator()
    {
        RuleFor(x => x.Nombres)
            .NotEmpty().WithMessage("Los nombres son obligatorios.")
            .MaximumLength(100).WithMessage("Los nombres admiten hasta 100 caracteres.");

        RuleFor(x => x.Apellidos)
            .NotEmpty().WithMessage("Los apellidos son obligatorios.")
            .MaximumLength(100).WithMessage("Los apellidos admiten hasta 100 caracteres.");

        RuleFor(x => x.Correo)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("Ingresa un correo electrónico válido.")
            .MaximumLength(150).WithMessage("El correo admite hasta 150 caracteres.");

        RuleFor(x => x.Area)
            .NotEmpty().WithMessage("El área es obligatoria.")
            .MaximumLength(100).WithMessage("El área admite hasta 100 caracteres.");

        RuleFor(x => x.Rol)
            .IsInEnum().WithMessage("El rol indicado no es válido.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres.")
            .MaximumLength(72).WithMessage("La contraseña admite hasta 72 caracteres.")
            .Matches("[A-Za-z]").WithMessage("La contraseña debe incluir al menos una letra.")
            .Matches("[0-9]").WithMessage("La contraseña debe incluir al menos un número.");
    }
}

public sealed class ActualizarUsuarioRequestValidator : AbstractValidator<ActualizarUsuarioRequest>
{
    public ActualizarUsuarioRequestValidator()
    {
        RuleFor(x => x.Nombres)
            .NotEmpty().WithMessage("Los nombres son obligatorios.")
            .MaximumLength(100).WithMessage("Los nombres admiten hasta 100 caracteres.");

        RuleFor(x => x.Apellidos)
            .NotEmpty().WithMessage("Los apellidos son obligatorios.")
            .MaximumLength(100).WithMessage("Los apellidos admiten hasta 100 caracteres.");

        RuleFor(x => x.Correo)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("Ingresa un correo electrónico válido.")
            .MaximumLength(150).WithMessage("El correo admite hasta 150 caracteres.");

        RuleFor(x => x.Area)
            .NotEmpty().WithMessage("El área es obligatoria.")
            .MaximumLength(100).WithMessage("El área admite hasta 100 caracteres.");

        RuleFor(x => x.Rol)
            .IsInEnum().WithMessage("El rol indicado no es válido.");
    }
}

public sealed class CambiarPasswordUsuarioRequestValidator : AbstractValidator<CambiarPasswordUsuarioRequest>
{
    public CambiarPasswordUsuarioRequestValidator()
    {
        RuleFor(x => x.NuevaPassword)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres.")
            .MaximumLength(72).WithMessage("La contraseña admite hasta 72 caracteres.")
            .Matches("[A-Za-z]").WithMessage("La contraseña debe incluir al menos una letra.")
            .Matches("[0-9]").WithMessage("La contraseña debe incluir al menos un número.");
    }
}

public sealed class UsuarioFiltroValidator : FiltroPaginadoValidator<UsuarioFiltro>
{
    public UsuarioFiltroValidator()
    {
        RuleFor(x => x.Rol)
            .IsInEnum()
            .When(x => x.Rol.HasValue)
            .WithMessage("El rol indicado no es válido.");
    }
}
