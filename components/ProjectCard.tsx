import styles from "./projectCard.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Project {
  id: string;
  name: string;
  description: string;
  summary: string;
  created_at: string;
  author: string;
  authorName: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const router = useRouter();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${project.id.split(':')[1]}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete project");
      }

      onDelete(project.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/edit-project/${project.id.split(':')[1]}`);
  };

  const handleViewDetails = () => {
    router.push(`/dashboard/projects/${project.id.split(':')[1]}`);
  };

  const isAuthor = user && user.id === project.author;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{project.name}</h3>
      <p className={styles.summary}>{project.summary}</p>
      <p className={styles.author}>Author: {project.authorName}</p>
      <button className={styles.viewButton} onClick={handleViewDetails}>
        View Details
      </button>
      {error && <p className={styles.error}>{error}</p>}
      {isAuthor && (
        <div className={styles.actions}>
          <button className={styles.editButton} onClick={handleEdit}>
            Edit
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;