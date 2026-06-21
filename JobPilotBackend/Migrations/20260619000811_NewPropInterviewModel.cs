using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPilotBackend.Migrations
{
    /// <inheritdoc />
    public partial class NewPropInterviewModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DifficultyType",
                table: "UserInterviews",
                newName: "Status");

            migrationBuilder.AddColumn<string>(
                name: "CompletedAt",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CreatedAt",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CurrentQuestionNumber",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InterviewPlanJson",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InterviewSummary",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "JobDescriptionText",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ResumeText",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "CurrentQuestionNumber",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "InterviewPlanJson",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "InterviewSummary",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "JobDescriptionText",
                table: "UserInterviews");

            migrationBuilder.DropColumn(
                name: "ResumeText",
                table: "UserInterviews");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "UserInterviews",
                newName: "DifficultyType");
        }
    }
}
