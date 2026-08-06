using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChineseLearning.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                schema: "app",
                table: "lessons",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "app",
                table: "lessons",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "app",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "app",
                table: "lessons");
        }
    }
}
