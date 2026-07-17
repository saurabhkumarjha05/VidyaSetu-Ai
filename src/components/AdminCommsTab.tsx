import React from "react";
import { User, Student } from "../types";
import ParentCommsCenter from "./ParentCommsCenter";

interface AdminCommsTabProps {
  user: User;
  students: Student[];
}

export default function AdminCommsTab({ user, students }: AdminCommsTabProps) {
  return (
    <ParentCommsCenter
      user={user}
      students={students}
    />
  );
}
