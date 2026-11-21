using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechAsset.Domain.Common;
using TechAsset.Domain.Entities;

namespace TechAsset.Infrastructure.Persistence.Configurations;

public static class ConfiguracionComun
{
    public static void ConfigurarBase<T>(EntityTypeBuilder<T> builder) where T : EntidadBase
    {
        builder.HasKey(entidad => entidad.Id);
        builder.Property(entidad => entidad.Id).HasColumnName("id").ValueGeneratedNever();
        builder.Property(entidad => entidad.CreadoEn).HasColumnName("creado_en").IsRequired();
        builder.Property(entidad => entidad.ActualizadoEn).HasColumnName("actualizado_en");
    }
}

public sealed class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");
        ConfiguracionComun.ConfigurarBase(builder);

        builder.Property(usuario => usuario.Nombres).HasColumnName("nombres").HasMaxLength(100).IsRequired();
        builder.Property(usuario => usuario.Apellidos).HasColumnName("apellidos").HasMaxLength(100).IsRequired();
        builder.Property(usuario => usuario.Correo).HasColumnName("correo").HasMaxLength(150).IsRequired();
        builder.Property(usuario => usuario.Area).HasColumnName("area").HasMaxLength(100).IsRequired();
        builder.Property(usuario => usuario.Estado).HasColumnName("estado").IsRequired();
        builder.Property(usuario => usuario.Rol)
            .HasColumnName("rol")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();
        builder.Property(usuario => usuario.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();

        builder.Ignore(usuario => usuario.NombreCompleto);

        builder.HasIndex(usuario => usuario.Correo).IsUnique().HasDatabaseName("ux_usuarios_correo");
        builder.HasIndex(usuario => usuario.Area).HasDatabaseName("ix_usuarios_area");
    }
}

public sealed class EquipoConfiguration : IEntityTypeConfiguration<Equipo>
{
    public void Configure(EntityTypeBuilder<Equipo> builder)
    {
        builder.ToTable("equipos");
        ConfiguracionComun.ConfigurarBase(builder);

        builder.Property(equipo => equipo.CodigoPatrimonial)
            .HasColumnName("codigo_patrimonial")
            .HasMaxLength(50)
            .IsRequired();
        builder.Property(equipo => equipo.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
        builder.Property(equipo => equipo.Categoria)
            .HasColumnName("categoria")
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();
        builder.Property(equipo => equipo.Marca).HasColumnName("marca").HasMaxLength(50).IsRequired();
        builder.Property(equipo => equipo.Modelo).HasColumnName("modelo").HasMaxLength(50);
        builder.Property(equipo => equipo.NumeroSerie).HasColumnName("numero_serie").HasMaxLength(50);
        builder.Property(equipo => equipo.Estado)
            .HasColumnName("estado")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(equipo => equipo.CodigoPatrimonial)
            .IsUnique()
            .HasDatabaseName("ux_equipos_codigo_patrimonial");
        builder.HasIndex(equipo => equipo.Estado).HasDatabaseName("ix_equipos_estado");
        builder.HasIndex(equipo => equipo.Categoria).HasDatabaseName("ix_equipos_categoria");
    }
}
