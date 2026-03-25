using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPilotBackend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveGeminiService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE ""UserProfiles"" DROP COLUMN IF EXISTS ""RefreshesResetsAt"";");
            migrationBuilder.Sql(@"ALTER TABLE ""UserProfiles"" DROP COLUMN IF EXISTS ""RefreshesUsedToday"";");
            migrationBuilder.Sql(@"ALTER TABLE ""Jobs"" DROP COLUMN IF EXISTS ""AiMatchReason"";");
            migrationBuilder.Sql(@"ALTER TABLE ""Jobs"" DROP COLUMN IF EXISTS ""AiMatchScore"";");
            migrationBuilder.Sql(@"ALTER TABLE ""Jobs"" DROP COLUMN IF EXISTS ""RawData"";");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
