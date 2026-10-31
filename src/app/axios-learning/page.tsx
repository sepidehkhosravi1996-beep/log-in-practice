"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function AxiosLearning() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function getUsers() {
      const response = await axios.get<User[]>(
        "https://jsonplaceholder.typicode.com/users",
      );

      setUsers(response.data);
      console.log(response.data);
    }

    getUsers().catch(console.error);
  }, []);

  return (
    <div>
      <h1>Axios Learning</h1>

      {users.map((user) => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
