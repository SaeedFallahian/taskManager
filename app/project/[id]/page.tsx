"use client";

import TaskCard from '../../../components/TaskCard';
import Form from '../../../components/Form';
import styles from './project.module.css';

interface Task {
  id: string;
  title: string;
  status: string;
  assignedTo: string;
}

const mockTasks: Task[] = [
  { id: '1', title: 'Design UI', status: 'In Progress', assignedTo: 'Jane' },
  { id: '2', title: 'Write API', status: 'To Do', assignedTo: 'John' },
];

const ProjectPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Project: Website Redesign</h1>
      <Form
        onSubmit={(data) => console.log('New Task:', data)}
        submitText="Add Task"
      />
      <div className={styles.taskList}>
        {mockTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default ProjectPage;