"use client";

import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useState } from "react";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(pwd),
      });
      setMsg("Password updated");
    } catch {
      setMsg("Failed to update password");
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <Card className="mb-6">
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Username:</strong> {user?.username}
        </p>
        <p>
          <strong>Class:</strong> {user?.classLevel}
        </p>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-3 max-w-md">
          <Input
            type="password"
            placeholder="Current password"
            value={pwd.currentPassword}
            onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
            required
          />
          <Input
            type="password"
            placeholder="New password (min 8)"
            value={pwd.newPassword}
            onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
            required
          />
          <Button type="submit">Update</Button>
          {msg && <p className="text-sm">{msg}</p>}
        </form>
      </Card>
    </div>
  );
}
