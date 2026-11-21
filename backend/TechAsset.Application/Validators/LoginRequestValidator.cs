using FluentValidation;
using TechAsset.Application.DTOs.Auth;

namespace TechAsset.Application.Validators;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Correo)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("Ingresa un correo electrónico válido.")
            .MaximumLength(150).WithMessage("El correo admite hasta 150 caracteres.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MaximumLength(72).WithMessage("La contraseña admite hasta 72 caracteres.");
    }
}
