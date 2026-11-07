"use client";

import { useEffect, useState, type FormEvent } from "react";
import api from "../../api/axios";
import styles from "./page.module.css";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function AxiosLearning() {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function getUsers() {
      try {
        const response = await api.get<User[]>("/users");
        setUsers(response.data);
        console.log(response.data);
      } catch (error) {
        setError("Failed to fetch users");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    getUsers().catch(console.error);
  }, []);

  async function addUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await api.post<User>("/users", {
        name: name,
        email: email,
      });

      console.log("User created:", response.data);

      setUsers((prevUsers) => [...prevUsers, response.data]);

      setName("");
      setEmail("");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }
  async function deleteUser(id: number) {
    try {
      await api.delete(`/users/${id}`);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      console.log("User deleted:", id);
    } catch (error) {
      console.error("Eroor deleting user:", error);
    }
  }

  if (loading) {
    return <div className={styles.status}>Loading users...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Axios Learning</h1>

      <p className={styles.description}>
        Users fetched from JSONPlaceholder API
      </p>
      <form onSubmit={addUser} className={styles.form}>
        <h2 className={styles.formTitle}> Add New Users</h2>
        <input
          className={styles.input}
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Add User</button>
      </form>

      <h2>Total Users: {users.length}</h2>

      {users.map((user) => (
        <div key={user.id} className={styles.card}>
          <h3 className={styles.name}>{user.name}</h3>
          <p className={styles.email}>{user.email}</p>

          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => deleteUser(user.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </main>
  );
}

