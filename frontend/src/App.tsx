import { useEffect, useState } from 'react';
import './App.css';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const TITLE_MAX_LENGTH = 100;

interface Task {
  id?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt?: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [titleError, setTitleError] = useState('');
  const [editTitleError, setEditTitleError] = useState('');

  const fetchTasks = async () => {
    const res = await fetch(`${API}/api/tasks`);
    setTasks(await res.json());
  };

  useEffect(() => { fetchTasks(); }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length > TITLE_MAX_LENGTH) return;
    await fetch(`${API}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, isCompleted: false }),
    });
    setTitle('');
    setDescription('');
    setTitleError('');
    fetchTasks();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setTitleError(value.length > TITLE_MAX_LENGTH ? `Task name can be at most ${TITLE_MAX_LENGTH} characters.` : '');
  };

  const handleEditTitleChange = (value: string) => {
    setEditTitle(value);
    setEditTitleError(value.length > TITLE_MAX_LENGTH ? `Task name can be at most ${TITLE_MAX_LENGTH} characters.` : '');
  };

  const toggleComplete = async (task: Task) => {
    await fetch(`${API}/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, isCompleted: !task.isCompleted }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const saveEdit = async (task: Task) => {
    if (!editTitle.trim() || editTitle.length > TITLE_MAX_LENGTH) return;
    await fetch(`${API}/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, title: editTitle, description: editDesc }),
    });
    setEditingId(null);
    setEditTitleError('');
    fetchTasks();
  };

  return (
    <div className="container">
      <h1>Task Manager</h1>

      <form onSubmit={createTask} className="form">
        <input
          placeholder="Task title"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          maxLength={TITLE_MAX_LENGTH}
          required
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button type="submit" disabled={!!titleError}>Add Task</button>
        {titleError && <span className="error">{titleError}</span>}
      </form>

      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={task.isCompleted ? 'completed' : ''}>
            {editingId === task.id ? (
              <div className="edit-row">
                <input value={editTitle} onChange={e => handleEditTitleChange(e.target.value)} maxLength={TITLE_MAX_LENGTH} />
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                <button onClick={() => saveEdit(task)} disabled={!!editTitleError}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
                {editTitleError && <span className="error">{editTitleError}</span>}
              </div>
            ) : (
              <div className="task-row">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleComplete(task)}
                />
                <div className="task-info">
                  <strong>{task.title}</strong>
                  {task.description && <span>{task.description}</span>}
                </div>
                <div className="actions">
                  <button onClick={() => { setEditingId(task.id!); setEditTitle(task.title); setEditDesc(task.description || ''); setEditTitleError(''); }}>Edit</button>
                  <button onClick={() => deleteTask(task.id!)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
