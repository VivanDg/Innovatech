using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.Services;

namespace TechAsset.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<IAuthService>(includeInternalTypes: true);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUsuarioService, UsuarioService>();
        services.AddScoped<IEquipoService, EquipoService>();
        services.AddScoped<IPrestamoService, PrestamoService>();
        services.AddScoped<IReporteService, ReporteService>();

        return services;
    }
}
