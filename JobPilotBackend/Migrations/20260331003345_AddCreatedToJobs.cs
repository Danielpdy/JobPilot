using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPilotBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedToJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Jobs");

            migrationBuilder.RenameColumn(
                name: "WorkType",
                table: "Jobs",
                newName: "Created");

            migrationBuilder.AlterColumn<decimal>(
                name: "SalaryMin",
                table: "Jobs",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "SalaryMax",
                table: "Jobs",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Jobs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Jobs");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "Jobs",
                newName: "WorkType");

            migrationBuilder.AlterColumn<int>(
                name: "SalaryMin",
                table: "Jobs",
                type: "integer",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "SalaryMax",
                table: "Jobs",
                type: "integer",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "Tags",
                table: "Jobs",
                type: "text[]",
                nullable: false);
        }
    }
}
