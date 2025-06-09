"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ProjectCard from "./ProjectCard";
import { Plus } from "lucide-react";
import styles from "../../styles/dashboard.module.css";

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

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useUser();

  const fetchProjects = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/projects", { cache: 'no-store' });
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      const projectsData = await res.json();
      
      // Fetch task count and completed task count for each project
      const projectsWithTaskCounts = await Promise.all(
        projectsData.map(async (project: Project) => {
          const projectId = project.id.includes(':') ? project.id.split(':')[1] : project.id;
          try {
            // Fetch all tasks
            const tasksRes = await fetch(`/api/tasks?projectId=${projectId}`, { cache: 'no-store' });
            if (!tasksRes.ok) {
              console.warn(`Failed to fetch tasks for project ${projectId}`);
              return { ...project, taskCount: 0, completedTaskCount: 0 };
            }
            const tasksData = await tasksRes.json();
            
            // Count completed tasks
            const completedTasks = tasksData.filter((task: { status: string }) => task.status === 'completed').length;

            return { 
              ...project, 
              taskCount: tasksData.length || 0,
              completedTaskCount: completedTasks || 0 
            };
          } catch (error) {
            console.warn(`Error fetching tasks for project ${projectId}:`, error);
            return { ...project, taskCount: 0, completedTaskCount: 0 };
          }
        })
      );

      console.log('Projects with task counts:', projectsWithTaskCounts);
      setProjects(projectsWithTaskCounts);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const removeProject = (projectId: string) => {
    setProjects((prevProjects) =>
      prevProjects.filter((project) =>
        project.id.includes(':')
          ? project.id.split(':')[1] !== projectId
          : project.id !== projectId
      )
    );
  };

  const refreshProjects = () => {
    fetchProjects();
  };

  if (!user) {
    return <div className={styles.container}>Please sign in to view your projects</div>;
  }

  if (loading) {
    return <div className={styles.container}>Loading projects...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Projects</h1>
      <div className={styles.projectsGrid}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            removeProject={removeProject}
            refreshProjects={refreshProjects}
          />
        ))}
        <div
          className={styles.addProjectCard}
          onClick={() => router.push("/dashboard/new-project")}
        >
          <Plus className={styles.addIcon} />
          <span className={styles.addText}>Create New Project</span>
        </div>
      </div>
    </div>
  );
}