using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SentraSence.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPushNotificationsAndAudioRetention : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletionReminderSentAt",
                table: "AudioClips",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledDeletionAt",
                table: "AudioClips",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PushNotificationTokens",
                columns: table => new
                {
                    PushNotificationTokenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    Platform = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PushNotificationTokens", x => x.PushNotificationTokenId);
                    table.ForeignKey(
                        name: "FK_PushNotificationTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PushNotificationTokens_Token",
                table: "PushNotificationTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PushNotificationTokens_UserId",
                table: "PushNotificationTokens",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PushNotificationTokens");

            migrationBuilder.DropColumn(
                name: "DeletionReminderSentAt",
                table: "AudioClips");

            migrationBuilder.DropColumn(
                name: "ScheduledDeletionAt",
                table: "AudioClips");
        }
    }
}
