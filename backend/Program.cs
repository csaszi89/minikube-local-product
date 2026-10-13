using TaskApi.Models;
using TaskApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<TaskService>();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();

var tasks = app.MapGroup("/api/tasks");

tasks.MapGet("/", async (TaskService svc) => await svc.GetAllAsync());

tasks.MapGet("/{id}", async (string id, TaskService svc) =>
    await svc.GetByIdAsync(id) is TaskItem task ? Results.Ok(task) : Results.NotFound());

tasks.MapPost("/", async (TaskItem task, TaskService svc) =>
{
    if (string.IsNullOrWhiteSpace(task.Title) || task.Title.Length > 100)
        return Results.BadRequest("Title is required and must be at most 100 characters.");

    var created = await svc.CreateAsync(task);
    return Results.Created($"/api/tasks/{created.Id}", created);
});

tasks.MapPut("/{id}", async (string id, TaskItem updated, TaskService svc) =>
{
    if (string.IsNullOrWhiteSpace(updated.Title) || updated.Title.Length > 100)
        return Results.BadRequest("Title is required and must be at most 100 characters.");

    if (await svc.GetByIdAsync(id) is null) return Results.NotFound();
    updated.Id = id;
    await svc.UpdateAsync(id, updated);
    return Results.NoContent();
});

tasks.MapDelete("/{id}", async (string id, TaskService svc) =>
{
    if (await svc.GetByIdAsync(id) is null) return Results.NotFound();
    await svc.DeleteAsync(id);
    return Results.NoContent();
});

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();
