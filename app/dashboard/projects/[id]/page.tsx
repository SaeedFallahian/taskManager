"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import styles from "../../../../styles/projectDetails.module.css";

type Project = {
  id: string;
  name: string;
  description: string;
  summary: string;
  author: string;
  authorName: string;
  created_at: string;
  deadline: string;
  progress: number;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  deadline: string;
  assignee: string;
  assigneeName: string;
};

type User = {
  id: string;
  name: string;
};

export default function ProjectDetails() {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch project
        const projectRes = await fetch(`/api/projects/${id}`, { cache: 'no-store' });
        if (!projectRes.ok) {
          throw new Error("Project not found");
        }
        const projectData = await projectRes.json();
        console.log('Fetched project:', projectData);
        setProject(projectData);

        // Fetch tasks
        const tasksRes = await fetch(`/api/tasks?projectId=${id}`, { cache: 'no-store' });
        if (!tasksRes.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const tasksData = await tasksRes.json();
        console.log('Fetched tasks:', tasksData);
        setTasks(tasksData.map((task: Task) => ({
          ...task,
          id: task.id.split(':')[1] || task.id,
        })));

        // Fetch users
        const usersRes = await fetch('/api/users', { cache: 'no-store' });
        if (!usersRes.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData = await usersRes.json();
        setUsers(usersData);

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      console.log('Creating task with:', {
        title: newTaskTitle,
        description: newTaskDescription,
        projectId: id,
        deadline: newTaskDeadline,
        assignee: newTaskAssignee,
      });
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          projectId: id,
          deadline: newTaskDeadline,
          assignee: newTaskAssignee,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create task");
      }
      const newTaskData = await res.json();
      console.log('New task created:', newTaskData);
      const newTask = Array.isArray(newTaskData) && newTaskData.length > 0 ? newTaskData[0] : newTaskData;
      setTasks([
        ...tasks,
        {
          id: newTask.id ? (newTask.id.split(':')[1] || newTask.id) : `temp_${Date.now()}`,
          title: newTask.title || "Untitled Task",
          description: newTask.description || "",
          status: newTask.status || "pending",
          created_at: newTask.created_at || new Date().toISOString(),
          deadline: newTask.deadline || "",
          assignee: newTask.assignee || "",
          assigneeName: users.find(u => u.id === newTask.assignee)?.name || "Unknown User",
        },
      ]);
      // Refresh projects to update progress
      const projectsRes = await fetch("/api/projects", { cache: 'no-store' });
      if (projectsRes.ok) {
        router.push('/dashboard');
      }
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDeadline("");
      setNewTaskAssignee("");
    } catch (err: any) {
      console.error('Add task error:', err.message);
      setError(err.message);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    try {
      console.log('Updating task with ID:', taskId, 'to status:', newStatus);
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update task status");
      }
      const updatedTaskData = await res.json();
      console.log('Updated task response:', updatedTaskData);
      const updatedTask = Array.isArray(updatedTaskData) && updatedTaskData.length > 0 ? updatedTaskData[0] : updatedTaskData;
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: updatedTask.status } : task
      ));
      // Refresh projects to update progress
      const projectsRes = await fetch("/api/projects", { cache: 'no-store' });
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        console.log('Refreshed projects:', projectsData);
        router.push('/dashboard');
      } else {
        throw new Error("Failed to refresh projects");
      }
    } catch (err: any) {
      console.error('Status change error:', err.message);
      setError(err.message);
    }
  }

  const isAuthor = user && user.id === project?.author;
  const maxDeadline = project?.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '';

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.container}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{project?.name}</h1>
        {isAuthor && (
          <button
            className={styles.editButton}
            onClick={() => router.push(`/dashboard/edit-project/${id}`)}
          >
            Edit Project
          </button>
        )}
      </div>
      <div className={styles.infoCard}>
        <p className={styles.summary}><strong>Summary:</strong> {project?.summary}</p>
        <p className={styles.description}><strong>Description:</strong> {project?.description}</p>
        <p className={styles.author}><strong>Author:</strong> {project?.authorName}</p>
        <p className={styles.date}><strong>Created At:</strong> {new Date(project?.created_at || '').toLocaleDateString()}</p>
        <p className={styles.date}><strong>Deadline:</strong> {new Date(project?.deadline || '').toLocaleDateString()}</p>
        <p className={styles.date}><strong>Progress:</strong> {project ? Math.round(project.progress) : 0}%</p>
      </div>
      <h2 className={styles.tasksTitle}>Tasks</h2>
      <div className={styles.tasksContainer}>
        {tasks.length === 0 ? (
          <p className={styles.noTasks}>No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={styles.taskCard}>
              <h3 className={styles.taskTitle}>{task.title}</h3>
              <p className={styles.taskDescription}>{task.description || 'No description'}</p>
              <p className={styles.taskStatus}><strong>Status:</strong> {task.status}</p>
              <p className={styles.taskDate}><strong>Created At:</strong> {new Date(task.created_at).toLocaleDateString()}</p>
              <p className={styles.taskDate}><strong>Deadline:</strong> {new Date(task.deadline || '').toLocaleDateString()}</p>
              <p className={styles.taskAssignee}><strong>Assignee:</strong> {task.assigneeName}</p>
              {(isAuthor || (user && user.id === task.assignee)) && (
                <div className={styles.statusSelect}>
                  <label className={styles.label}>Change Status</label>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={styles.select}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {isAuthor && (
        <form onSubmit={handleAddTask} className={styles.taskForm}>
          <h3 className={styles.formTitle}>Add New Task</h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Task Title</label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className={styles.textarea}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Deadline</label>
            <input
              type="date"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              className={styles.input}
              max={maxDeadline}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Assignee</label>
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitButton}>
            Add Task
          </button>
        </form>
      )}
    </div>
  );
}