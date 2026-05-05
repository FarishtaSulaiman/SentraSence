using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SentraSence.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "AlarmEvents",
                columns: table => new
                {
                    AlarmEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TriggerType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlarmEvents", x => x.AlarmEventId);
                    table.ForeignKey(
                        name: "FK_AlarmEvents_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrustedContacts",
                columns: table => new
                {
                    TrustedContactId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelationshipType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContactStatus = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrustedContacts", x => x.TrustedContactId);
                    table.ForeignKey(
                        name: "FK_TrustedContacts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlarmLocations",
                columns: table => new
                {
                    AlarmLocationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlarmEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Lat = table.Column<double>(type: "float", nullable: false),
                    Lon = table.Column<double>(type: "float", nullable: false),
                    CapturedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Accuracy = table.Column<double>(type: "float", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlarmLocations", x => x.AlarmLocationId);
                    table.ForeignKey(
                        name: "FK_AlarmLocations_AlarmEvents_AlarmEventId",
                        column: x => x.AlarmEventId,
                        principalTable: "AlarmEvents",
                        principalColumn: "AlarmEventId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AudioClips",
                columns: table => new
                {
                    AudioClipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlarmEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StorageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DurationMs = table.Column<double>(type: "float", nullable: false),
                    RecordedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AudioClips", x => x.AudioClipId);
                    table.ForeignKey(
                        name: "FK_AudioClips_AlarmEvents_AlarmEventId",
                        column: x => x.AlarmEventId,
                        principalTable: "AlarmEvents",
                        principalColumn: "AlarmEventId");
                    table.ForeignKey(
                        name: "FK_AudioClips_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlarmEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TrustedContactId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Channel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProviderMessageId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttemptCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_Notifications_AlarmEvents_AlarmEventId",
                        column: x => x.AlarmEventId,
                        principalTable: "AlarmEvents",
                        principalColumn: "AlarmEventId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notifications_TrustedContacts_TrustedContactId",
                        column: x => x.TrustedContactId,
                        principalTable: "TrustedContacts",
                        principalColumn: "TrustedContactId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AiAnalyses",
                columns: table => new
                {
                    AiAnalysisId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AudioClipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModelName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModelVersion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoundCategory = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    AlertThreshold = table.Column<double>(type: "float", nullable: false),
                    InferenceMs = table.Column<int>(type: "int", nullable: false),
                    AnalyzedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RawOutputJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiAnalyses", x => x.AiAnalysisId);
                    table.ForeignKey(
                        name: "FK_AiAnalyses_AudioClips_AudioClipId",
                        column: x => x.AudioClipId,
                        principalTable: "AudioClips",
                        principalColumn: "AudioClipId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiAnalyses_AudioClipId",
                table: "AiAnalyses",
                column: "AudioClipId");

            migrationBuilder.CreateIndex(
                name: "IX_AlarmEvents_UserId",
                table: "AlarmEvents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AlarmLocations_AlarmEventId",
                table: "AlarmLocations",
                column: "AlarmEventId");

            migrationBuilder.CreateIndex(
                name: "IX_AudioClips_AlarmEventId",
                table: "AudioClips",
                column: "AlarmEventId");

            migrationBuilder.CreateIndex(
                name: "IX_AudioClips_UserId",
                table: "AudioClips",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_AlarmEventId",
                table: "Notifications",
                column: "AlarmEventId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TrustedContactId",
                table: "Notifications",
                column: "TrustedContactId");

            migrationBuilder.CreateIndex(
                name: "IX_TrustedContacts_UserId",
                table: "TrustedContacts",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiAnalyses");

            migrationBuilder.DropTable(
                name: "AlarmLocations");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "AudioClips");

            migrationBuilder.DropTable(
                name: "TrustedContacts");

            migrationBuilder.DropTable(
                name: "AlarmEvents");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
