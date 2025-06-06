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
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    async function fetchProjects() {
      if (!user) return;
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await res.json();
        setProjects(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchProjects();
  }, [user]);

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
          <ProjectCard key={project.id} project={project} />
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