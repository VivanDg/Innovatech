using TechAsset.Domain.Entities;

namespace TechAsset.Application.Common.Interfaces;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiraEn) Generar(Usuario usuario);
}

public interface ICurrentUserService
{
    Guid? UsuarioId { get; }
    string? Correo { get; }
    string? Rol { get; }
    string? Area { get; }
    bool EstaAutenticado { get; }
}

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
    DateOnly Today { get; }
}
