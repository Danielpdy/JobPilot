using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPilotBackend.Migrations
{
    /// <inheritdoc />
    public partial class RenameJobTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "JobTiTle",
                table: "UserProfiles",
                newName: "JobTitle");

            migrationBuilder.Sql(
                "ALTER TABLE \"UserProfiles\" ALTER COLUMN \"Skills\" TYPE text[] USING ARRAY[\"Skills\"]::text[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "JobTitle",
                table: "UserProfiles",
                newName: "JobTiTle");

            migrationBuilder.AlterColumn<string>(
                name: "Skills",
                table: "UserProfiles",
                type: "text",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]");
        }
    }
}
