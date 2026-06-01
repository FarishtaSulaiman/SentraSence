using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SentraSence.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAudioToAlarmEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AudioUploadedAt",
                table: "AlarmEvents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AudioUrl",
                table: "AlarmEvents",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AudioUploadedAt",
                table: "AlarmEvents");

            migrationBuilder.DropColumn(
                name: "AudioUrl",
                table: "AlarmEvents");
        }
    }
}
