import { useEffect, useState, type FormEvent } from "react";
import API from "../api";
import AssignAdminModal from "../components/AssignAdminModal";
import MemberDashboard from "../components/MemberDashboard";
import AdminPanel from "../components/AdminPanel";

interface Department {
  id: number;
  name: string;
}

interface User {
  role: string;
}

export default function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null",
  ) as User | null;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [adminDeptId, setAdminDeptId] = useState<number | null>(null);
  const [isAssignAdminOpen, setIsAssignAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{
    email: string;
    pass: string;
  } | null>(null);

  useEffect(() => {
    if (user?.role !== "ORG_ADMIN") return;

    const fetchDepartments = async () => {
      try {
        const { data } = await API.get<{ departments: Department[] }>(
          "/departments",
        );
        setDepartments(data.departments);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };

    void fetchDepartments();
  }, [user?.role]);

  const handleCreateDepartment = async () => {
    const name = newDeptName.trim();
    if (!name) return;

    setIsCreatingDept(true);
    try {
      const { data } = await API.post<{ department: Department }>(
        "/departments",
        { name },
      );
      setDepartments((current) => [...current, data.department]);
      setNewDeptName("");
    } catch (error) {
      console.error("Failed to create department:", error);
      window.alert("Failed to create department.");
    } finally {
      setIsCreatingDept(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      await API.delete(`/departments/${id}`);
      setDepartments((current) =>
        current.filter((department) => department.id !== id),
      );
    } catch (error) {
      console.error("Failed to delete department:", error);
      window.alert("Failed to delete department.");
    }
  };

  const handleAssignAdmin = async (event: FormEvent) => {
    event.preventDefault();
    if (adminDeptId === null) return;

    setIsAssigning(true);
    try {
      const { data } = await API.post<{
        adminEmail: string;
        tempPassword: string;
      }>(`/departments/${adminDeptId}/assign-admin`, {
        name: adminName,
        email: adminEmail,
      });
      setGeneratedCreds({ email: data.adminEmail, pass: data.tempPassword });
      setAdminName("");
      setAdminEmail("");
    } catch (error) {
      console.error("Failed to assign department admin:", error);
      window.alert("Failed to assign department admin.");
    } finally {
      setIsAssigning(false);
    }
  };

  const closeAssignAdminModal = () => {
    setIsAssignAdminOpen(false);
    setAdminDeptId(null);
    setGeneratedCreds(null);
  };

  if (user?.role === "MEMBER") {
    return <MemberDashboard />;
  }

  if (user?.role === "ORG_ADMIN") {
    return (
      <>
        <AdminPanel
          departments={departments}
          newDeptName={newDeptName}
          setNewDeptName={setNewDeptName}
          isCreatingDept={isCreatingDept}
          handleCreateDepartment={handleCreateDepartment}
          setAdminDeptId={setAdminDeptId}
          setGeneratedCreds={setGeneratedCreds}
          setIsAssignAdminOpen={setIsAssignAdminOpen}
          handleDeleteDepartment={handleDeleteDepartment}
        />
        <AssignAdminModal
          isOpen={isAssignAdminOpen}
          onClose={closeAssignAdminModal}
          adminName={adminName}
          setAdminName={setAdminName}
          adminEmail={adminEmail}
          setAdminEmail={setAdminEmail}
          isAssigning={isAssigning}
          generatedCreds={generatedCreds}
          onSubmit={handleAssignAdmin}
        />
      </>
    );
  }

  return <div>Unauthorized</div>;
}
