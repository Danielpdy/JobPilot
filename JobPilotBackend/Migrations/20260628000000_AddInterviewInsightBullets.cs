using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPilotBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddInterviewInsightBullets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StrengthBullets",
                table: "UserInterviews",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImprovementBullets",
                table: "UserInterviews",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StrengthBullets",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "ImprovementBullets",
                table: "UserInterviews");
        }
    }
}
