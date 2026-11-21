using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechAsset.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "equipos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo_patrimonial = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    categoria = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    marca = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    modelo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    numero_serie = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    creado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_equipos", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombres = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    apellidos = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    correo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    area = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    estado = table.Column<bool>(type: "boolean", nullable: false),
                    rol = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    creado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "prestamos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    equipo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    solicitante_id = table.Column<Guid>(type: "uuid", nullable: false),
                    aprobado_por_id = table.Column<Guid>(type: "uuid", nullable: true),
                    fecha_prestamo = table.Column<DateOnly>(type: "date", nullable: false),
                    fecha_devolucion_programada = table.Column<DateOnly>(type: "date", nullable: false),
                    fecha_devolucion_real = table.Column<DateOnly>(type: "date", nullable: true),
                    estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    observacion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    observacion_devolucion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    motivo_rechazo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    fecha_aprobacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    creado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prestamos", x => x.id);
                    table.CheckConstraint("ck_prestamos_aprobacion", "\"estado\" NOT IN ('Aprobado', 'Devuelto') OR \"aprobado_por_id\" IS NOT NULL");
                    table.CheckConstraint("ck_prestamos_devolucion_observacion", "\"estado\" <> 'Devuelto' OR \"observacion_devolucion\" IS NOT NULL");
                    table.CheckConstraint("ck_prestamos_fecha_real", "\"fecha_devolucion_real\" IS NULL OR \"fecha_devolucion_real\" >= \"fecha_prestamo\"");
                    table.CheckConstraint("ck_prestamos_fechas", "\"fecha_devolucion_programada\" > \"fecha_prestamo\"");
                    table.ForeignKey(
                        name: "FK_prestamos_equipos_equipo_id",
                        column: x => x.equipo_id,
                        principalTable: "equipos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_prestamos_usuarios_aprobado_por_id",
                        column: x => x.aprobado_por_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_prestamos_usuarios_solicitante_id",
                        column: x => x.solicitante_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "movimientos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    equipo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    prestamo_id = table.Column<Guid>(type: "uuid", nullable: true),
                    tipo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    creado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movimientos", x => x.id);
                    table.ForeignKey(
                        name: "FK_movimientos_equipos_equipo_id",
                        column: x => x.equipo_id,
                        principalTable: "equipos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_movimientos_prestamos_prestamo_id",
                        column: x => x.prestamo_id,
                        principalTable: "prestamos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_movimientos_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_equipos_categoria",
                table: "equipos",
                column: "categoria");

            migrationBuilder.CreateIndex(
                name: "ix_equipos_estado",
                table: "equipos",
                column: "estado");

            migrationBuilder.CreateIndex(
                name: "ux_equipos_codigo_patrimonial",
                table: "equipos",
                column: "codigo_patrimonial",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_movimientos_equipo_fecha",
                table: "movimientos",
                columns: new[] { "equipo_id", "fecha" });

            migrationBuilder.CreateIndex(
                name: "IX_movimientos_prestamo_id",
                table: "movimientos",
                column: "prestamo_id");

            migrationBuilder.CreateIndex(
                name: "ix_movimientos_tipo",
                table: "movimientos",
                column: "tipo");

            migrationBuilder.CreateIndex(
                name: "IX_movimientos_usuario_id",
                table: "movimientos",
                column: "usuario_id");

            migrationBuilder.CreateIndex(
                name: "IX_prestamos_aprobado_por_id",
                table: "prestamos",
                column: "aprobado_por_id");

            migrationBuilder.CreateIndex(
                name: "ix_prestamos_equipo_estado",
                table: "prestamos",
                columns: new[] { "equipo_id", "estado" });

            migrationBuilder.CreateIndex(
                name: "ix_prestamos_estado",
                table: "prestamos",
                column: "estado");

            migrationBuilder.CreateIndex(
                name: "ix_prestamos_fecha_prestamo",
                table: "prestamos",
                column: "fecha_prestamo");

            migrationBuilder.CreateIndex(
                name: "ix_prestamos_solicitante",
                table: "prestamos",
                column: "solicitante_id");

            migrationBuilder.CreateIndex(
                name: "ux_prestamos_equipo_aprobado",
                table: "prestamos",
                column: "equipo_id",
                unique: true,
                filter: "\"estado\" = 'Aprobado'");

            migrationBuilder.CreateIndex(
                name: "ix_usuarios_area",
                table: "usuarios",
                column: "area");

            migrationBuilder.CreateIndex(
                name: "ux_usuarios_correo",
                table: "usuarios",
                column: "correo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "movimientos");

            migrationBuilder.DropTable(
                name: "prestamos");

            migrationBuilder.DropTable(
                name: "equipos");

            migrationBuilder.DropTable(
                name: "usuarios");
        }
    }
}
