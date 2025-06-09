"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import styles from "../../styles/ProjectCard.module.css";

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
  taskCount: number;
  completedTaskCount: number; // Added for completed task count
};

type ProjectCardProps = {
  project: Project;
  removeProject: (projectId: string) => void;
  refreshProjects: () => void;
};

export default function ProjectCard({ project, removeProject, refreshProjects }: ProjectCardProps) {
  const router = useRouter();
  const { user } = useUser();

  function handleViewDetails() {
    const projectId = project.id.includes(':') ? project.id.split(':')[1] : project.id;
    console.log('Navigating to project details with ID:', projectId);
    router.push(`/dashboard/projects/${projectId}`);
  }

  async function handleEdit() {
    const projectId = project.id.includes(':') ? project.id.split(':')[1] : project.id;
    router.push(`/dashboard/edit-project/${projectId}`);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const projectId = project.id.includes(':') ? project.id.split(':')[1] : project.id;
      console.log('Sending DELETE request for ID:', projectId);
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || "Failed to delete project");
      }
      removeProject(projectId);
    } catch (error: any) {
      console.error('Client-side DELETE error:', error.message);
      alert(`Error: ${error.message}`);
    }
  }

  const isAuthor = user && user.id === project.author;

  return (
    <div className={styles.card}>
      <div>
        <h2 className={styles.title}>{project.name}</h2>
        <p className={styles.summary}>{project.summary}</p>
        <p className={styles.meta}>
          <strong>Author:</strong> {project.authorName}
        </p>
        <p className={styles.meta}>
          <strong>Created:</strong> {new Date(project.created_at).toLocaleDateString('en-US')}
        </p>
        <p className={styles.meta}>
          <strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString('en-US')}
        </p>
        <p className={styles.meta}>
        </p>
        <p className={styles.meta}>
          <strong>Tasks:</strong> {project.taskCount} ({project.completedTaskCount} completed)
        </p>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button className={styles.viewButton} onClick={handleViewDetails}>
          View Details
        </button>
        {isAuthor && (
          <div className={styles.actionButtons}>
            <button className={styles.editButton} onClick={handleEdit}>
              Edit
            </button>
            <button className={styles.deleteButton} onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}