import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { projectService } from "../services/projectService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus } from "lucide-react";

export default function CreateEmployeePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    birthDate: "",
    phone: "",
    email: "",
    password: "",
    programmingLanguage: "",
    country: "",
    bankCard: "",
    position: "",
    salary: 400,
    role: "employee",
    mentorName: "",
    englishLevel: "",
    workingHoursPerWeek: "",
    vacationDates: [],
    githubLink: "",
    linkedinLink: "",
    adminNote: "",
  });
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableProjects();
  }, []);

  const fetchAvailableProjects = async () => {
    try {
      const data = await projectService.getProjects({ active: true, limit: 100 });
      setAvailableProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = { ...formData, projectIds: selectedProjects };
      await userService.createUser(dataToSend);
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      navigate("/employees");
    } catch (error) {
      // Handle validation errors array from backend
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const errorMessages = error.response.data.errors
          .map((err) => `${err.param}: ${err.msg}`)
          .join("\n");
        toast({
          variant: "destructive",
          title: "Validation Errors",
          description: errorMessages,
          duration: 8000, // Show longer for multiple errors
        });
      } else {
        // Single error message
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error.response?.data?.error || "Failed to create employee",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/employees")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Employee</CardTitle>
          <CardDescription>Add a new employee to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name *</Label>
              <Input
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date *</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="programmingLanguage">
                  Programming Language *
                </Label>
                <Input
                  id="programmingLanguage"
                  name="programmingLanguage"
                  value={formData.programmingLanguage}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript, Python"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g., USA, Canada"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankCard">Bank Card *</Label>
              <Input
                id="bankCard"
                name="bankCard"
                value={formData.bankCard}
                onChange={handleChange}
                placeholder="1234-5678-9012-3456"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                required
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mentorName">Mentor Name</Label>
                <Input
                  id="mentorName"
                  name="mentorName"
                  value={formData.mentorName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="englishLevel">English Level</Label>
                <Input
                  id="englishLevel"
                  name="englishLevel"
                  value={formData.englishLevel}
                  onChange={handleChange}
                  placeholder="e.g., B2, C1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned Projects</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                {availableProjects.length > 0 ? (
                  availableProjects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={`project-${project.id}`}
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="rounded"
                      />
                      <label htmlFor={`project-${project.id}`} className="text-sm flex-1">
                        {project.name} {!project.active && <span className="text-red-600">(Inactive)</span>}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No projects available</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingHoursPerWeek">Working Hours/Week</Label>
                <Input
                  id="workingHoursPerWeek"
                  name="workingHoursPerWeek"
                  type="number"
                  value={formData.workingHoursPerWeek}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacationDates">
                Vacation Dates (comma-separated: YYYY-MM-DD)
              </Label>
              <Input
                id="vacationDates"
                name="vacationDates"
                value={
                  Array.isArray(formData.vacationDates)
                    ? formData.vacationDates.join(", ")
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  const datesArray = value
                    ? value
                        .split(",")
                        .map((d) => d.trim())
                        .filter((d) => d)
                    : [];
                  setFormData({ ...formData, vacationDates: datesArray });
                }}
                placeholder="2024-12-25, 2024-12-26"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="githubLink">GitHub Link</Label>
                <Input
                  id="githubLink"
                  name="githubLink"
                  type="url"
                  value={formData.githubLink}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinLink">LinkedIn Link</Label>
                <Input
                  id="linkedinLink"
                  name="linkedinLink"
                  type="url"
                  value={formData.linkedinLink}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminNote">Admin Note</Label>
              <textarea
                id="adminNote"
                name="adminNote"
                value={formData.adminNote}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                placeholder="Internal notes about this employee..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                {loading ? "Creating..." : "Create Employee"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/employees")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
