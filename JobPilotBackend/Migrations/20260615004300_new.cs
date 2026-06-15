using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPilotBackend.Migrations
{
    /// <inheritdoc />
    public partial class @new : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DifficultyType",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InterviewType",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "JobTitle",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "QuestionCount",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DifficultyType",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "InterviewType",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "JobTitle",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "QuestionCount",
                table: "UserInterviews");
        }
    }
}
