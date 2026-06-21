using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPilotBackend.Migrations
{
    /// <inheritdoc />
    public partial class interviewQuestionModelAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InterviewPlanJson",
                table: "UserInterviews");

            migrationBuilder.Sql(@"ALTER TABLE ""UserInterviews"" ALTER COLUMN ""QuestionCount"" DROP DEFAULT");
            migrationBuilder.Sql(@"ALTER TABLE ""UserInterviews"" ALTER COLUMN ""QuestionCount"" TYPE integer USING ""QuestionCount""::integer");

            migrationBuilder.Sql(@"ALTER TABLE ""UserInterviews"" ALTER COLUMN ""CurrentQuestionNumber"" DROP DEFAULT");
            migrationBuilder.Sql(@"ALTER TABLE ""UserInterviews"" ALTER COLUMN ""CurrentQuestionNumber"" TYPE integer USING ""CurrentQuestionNumber""::integer");

            migrationBuilder.Sql(@"ALTER TABLE ""UserInterviews"" ALTER COLUMN ""CreatedAt"" DROP DEFAULT");
            migrationBuilder.Sql(@"ALTER TABLE ""UserInterviews"" ALTER COLUMN ""CreatedAt"" TYPE timestamp with time zone USING ""CreatedAt""::timestamp with time zone");

            migrationBuilder.Sql(@"ALTER TABLE ""UserInterviews"" ALTER COLUMN ""CompletedAt"" DROP DEFAULT");
            migrationBuilder.Sql(@"ALTER TABLE ""UserInterviews"" ALTER COLUMN ""CompletedAt"" TYPE timestamp with time zone USING NULLIF(""CompletedAt"", '')::timestamp with time zone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "QuestionCount",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "CurrentQuestionNumber",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedAt",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "CompletedAt",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InterviewPlanJson",
                table: "UserInterviews",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
