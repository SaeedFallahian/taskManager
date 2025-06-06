import styles from '../styles/taskCard.module.css';

interface Task {
  id: string;
  title: string;
  status: string;
  assignedTo: string;
}

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>{task.title}</h4>
      <p className={styles.status}>Status: {task.status}</p>
      <p className={styles.assigned}>Assigned to: {task.assignedTo}</p>
    </div>
  );
};

export default TaskCard;