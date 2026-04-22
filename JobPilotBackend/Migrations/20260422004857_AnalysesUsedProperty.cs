using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPilotBackend.Migrations
{
    /// <inheritdoc />
    public partial class AnalysesUsedProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AnalysesUsed",
                table: "UserProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnalysesUsed",
                table: "UserProfiles");
        }
    }
}
