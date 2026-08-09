using MongoDB.Driver;
using TaskApi.Models;

namespace TaskApi.Services;

public class TaskService
{
    private readonly IMongoCollection<TaskItem> _tasks;

    public TaskService(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDB:ConnectionString"]);
        var db = client.GetDatabase(config["MongoDB:Database"]);
        _tasks = db.GetCollection<TaskItem>("tasks");
    }

    public async Task<List<TaskItem>> GetAllAsync() =>
        await _tasks.Find(_ => true).ToListAsync();

    public async Task<TaskItem?> GetByIdAsync(string id) =>
        await _tasks.Find(t => t.Id == id).FirstOrDefaultAsync();

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        await _tasks.InsertOneAsync(task);
        return task;
    }

    public async Task UpdateAsync(string id, TaskItem updated) =>
        await _tasks.ReplaceOneAsync(t => t.Id == id, updated);

    public async Task DeleteAsync(string id) =>
        await _tasks.DeleteOneAsync(t => t.Id == id);
}
