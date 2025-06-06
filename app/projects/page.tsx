"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import styles from "./projects.module.css";

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  taskCount: number;
  status: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Redesign company website",
    startDate: "2025-05-01",
    taskCount: 10,
    status: "In Progress",
  },
  {
    id: "2",
    name: "Mobile App",
    description: "Develop mobile app",
    startDate: "2025-04-15",
    taskCount: 5,
    status: "Planned",
  },
];

const ProjectsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <SignedIn>
        <h1 className={styles.title}>All Projects</h1>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Start Date</th>
              <th className={styles.th}>Tasks</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockProjects.map((project) => (
              <tr key={project.id} className={styles.tr}>
                <td className={styles.td}>{project.name}</td>
                <td className={styles.td}>{project.description}</td>
                <td className={styles.td}>{project.startDate}</td>
                <td className={styles.td}>{project.taskCount}</td>
                <td className={styles.td}>{project.status}</td>
                <td className={styles.td}>
                  <Link href={`/project/${project.id}`} className={styles.viewButton}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SignedIn>
      <SignedOut>
        <div className={styles.signInPrompt}>
          <h2 className={styles.promptTitle}>Please Sign In</h2>
          <p className={styles.promptText}>
            To view tasks and projects, please sign in.
          </p>
          <SignInButton mode="modal">
            <button className={styles.signInButton}>Sign In</button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
};

export default ProjectsPage;