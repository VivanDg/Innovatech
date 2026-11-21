using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechAsset.Domain.Entities;

namespace TechAsset.Infrastructure.Persistence.Configurations;

public sealed class PrestamoConfiguration : IEntityTypeConfiguration<Prestamo>
{
    public void Configure(EntityTypeBuilder<Prestamo> builder)
    {
        builder.ToTable("prestamos", tabla =>
        {
            tabla.HasCheckConstraint(
                "ck_prestamos_fechas",
                "\"fecha_devolucion_programada\" > \"fecha_prestamo\"");
            tabla.HasCheckConstraint(
                "ck_prestamos_devolucion_observacion",
                "\"estado\" <> 'Devuelto' OR \"observacion_devolucion\" IS NOT NULL");
            tabla.HasCheckConstraint(
                "ck_prestamos_aprobacion",
                "\"estado\" NOT IN ('Aprobado', 'Devuelto') OR \"aprobado_por_id\" IS NOT NULL");
            tabla.HasCheckConstraint(
                "ck_prestamos_fecha_real",
                "\"fecha_devolucion_real\" IS NULL OR \"fecha_devolucion_real\" >= \"fecha_prestamo\"");
        });

        ConfiguracionComun.ConfigurarBase(builder);

        builder.Property(prestamo => prestamo.EquipoId).HasColumnName("equipo_id").IsRequired();
        builder.Property(prestamo => prestamo.SolicitanteId).HasColumnName("solicitante_id").IsRequired();
        builder.Property(prestamo => prestamo.AprobadoPorId).HasColumnName("aprobado_por_id");
        builder.Property(prestamo => prestamo.FechaPrestamo).HasColumnName("fecha_prestamo").IsRequired();
        builder.Property(prestamo => prestamo.FechaDevolucionProgramada)
            .HasColumnName("fecha_devolucion_programada")
            .IsRequired();
        builder.Property(prestamo => prestamo.FechaDevolucionReal).HasColumnName("fecha_devolucion_real");
        builder.Property(prestamo => prestamo.Estado)
            .HasColumnName("estado")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();
        builder.Property(prestamo => prestamo.Observacion).HasColumnName("observacion").HasMaxLength(500).IsRequired();
        builder.Property(prestamo => prestamo.ObservacionDevolucion)
            .HasColumnName("observacion_devolucion")
            .HasMaxLength(500);
        builder.Property(prestamo => prestamo.MotivoRechazo).HasColumnName("motivo_rechazo").HasMaxLength(500);
        builder.Property(prestamo => prestamo.FechaAprobacion).HasColumnName("fecha_aprobacion");

        builder.Ignore(prestamo => prestamo.EstaVigente);

        builder.HasOne(prestamo => prestamo.Equipo)
            .WithMany()
            .HasForeignKey(prestamo => prestamo.EquipoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(prestamo => prestamo.Solicitante)
            .WithMany()
            .HasForeignKey(prestamo => prestamo.SolicitanteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(prestamo => prestamo.Aprobador)
            .WithMany()
            .HasForeignKey(prestamo => prestamo.AprobadoPorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(prestamo => new { prestamo.EquipoId, prestamo.Estado })
            .HasDatabaseName("ix_prestamos_equipo_estado");
        builder.HasIndex(prestamo => prestamo.EquipoId)
            .IsUnique()
            .HasFilter("\"estado\" = 'Aprobado'")
            .HasDatabaseName("ux_prestamos_equipo_aprobado");
        builder.HasIndex(prestamo => prestamo.SolicitanteId).HasDatabaseName("ix_prestamos_solicitante");
        builder.HasIndex(prestamo => prestamo.FechaPrestamo).HasDatabaseName("ix_prestamos_fecha_prestamo");
        builder.HasIndex(prestamo => prestamo.Estado).HasDatabaseName("ix_prestamos_estado");
    }
}

public sealed class MovimientoConfiguration : IEntityTypeConfiguration<Movimiento>
{
    public void Configure(EntityTypeBuilder<Movimiento> builder)
    {
        builder.ToTable("movimientos");
        ConfiguracionComun.ConfigurarBase(builder);

        builder.Property(movimiento => movimiento.EquipoId).HasColumnName("equipo_id").IsRequired();
        builder.Property(movimiento => movimiento.UsuarioId).HasColumnName("usuario_id").IsRequired();
        builder.Property(movimiento => movimiento.PrestamoId).HasColumnName("prestamo_id");
        builder.Property(movimiento => movimiento.Tipo)
            .HasColumnName("tipo")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();
        builder.Property(movimiento => movimiento.Descripcion)
            .HasColumnName("descripcion")
            .HasMaxLength(500)
            .IsRequired();
        builder.Property(movimiento => movimiento.Fecha).HasColumnName("fecha").IsRequired();

        builder.HasOne(movimiento => movimiento.Equipo)
            .WithMany()
            .HasForeignKey(movimiento => movimiento.EquipoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(movimiento => movimiento.Usuario)
            .WithMany()
            .HasForeignKey(movimiento => movimiento.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(movimiento => movimiento.Prestamo)
            .WithMany()
            .HasForeignKey(movimiento => movimiento.PrestamoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(movimiento => new { movimiento.EquipoId, movimiento.Fecha })
            .HasDatabaseName("ix_movimientos_equipo_fecha");
        builder.HasIndex(movimiento => movimiento.Tipo).HasDatabaseName("ix_movimientos_tipo");
    }
}
