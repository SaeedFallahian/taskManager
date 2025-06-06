"use client";

import { useState, FormEvent } from 'react';
import styles from '../styles/form.module.css';

interface FormProps {
  onSubmit: (data: { title: string; description: string }) => void;
  initialData?: { title: string; description: string };
  submitText: string;
}

const Form: React.FC<FormProps> = ({ onSubmit, initialData, submitText }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          required
        />
      </div>
      <button type="submit" className={styles.submitButton}>
        {submitText}
      </button>
    </form>
  );
};

export default Form;
