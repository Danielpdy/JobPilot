using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPilotBackend.Migrations
{
    /// <inheritdoc />
    public partial class newtwo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "UserInterviews",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "UserInterviews");
        }
    }
}
