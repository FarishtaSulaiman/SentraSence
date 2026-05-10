using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SentraSence.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserConsentAndCodeword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Codeword",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CodewordTrained",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "UserConsents",
                columns: table => new
                {
                    UserConsentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConsentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Granted = table.Column<bool>(type: "bit", nullable: false),
                    ConsentVersion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WithdrawnAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserConsents", x => x.UserConsentId);
                    table.ForeignKey(
                        name: "FK_UserConsents_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserConsents_UserId",
                table: "UserConsents",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserConsents");

            migrationBuilder.DropColumn(
                name: "Codeword",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CodewordTrained",
                table: "Users");
        }
    }
}
