import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { projectService } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, CheckCircle2, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployee();
    if (isAdmin) {
      fetchAvailableProjects();
    }
  }, [id]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const data = await userService.getUser(id);
      setEmployee(data);
      setFormData(data);
      setSelectedProjects(data.projects?.map(p => p.id) || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch employee details",
      });
    } finally {
      setLoading(false);
    }
  };

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
    try {
      // Clean up data before sending
      const dataToSend = { ...formData };
      
      // Remove password field if it's empty (don't update password)
      if (!dataToSend.password || dataToSend.password.trim() === '') {
        delete dataToSend.password;
      }

      // Add project IDs if admin and projects were selected
      if (isAdmin) {
        dataToSend.projectIds = selectedProjects;
      }
      
      await userService.updateUser(id, dataToSend);
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      setEditing(false);
      fetchEmployee();
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
            error.response?.data?.error || "Failed to update employee",
        });
      }
    }
  };

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const openProjectDialog = async (project) => {
    try {
      const fullProject = await projectService.getProject(project.id);
      setSelectedProjectDetail(fullProject);
      setShowProjectDialog(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch project details",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!employee) {
    return <div className="text-center py-12">Employee not found</div>;
  }

  const canEdit = isAdmin || user?.id === employee.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/employees")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
        {canEdit && !editing && (
          <Button onClick={() => setEditing(true)}>Edit</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {employee.firstName} {employee.lastName}
          </CardTitle>
          <CardDescription>Employee Details</CardDescription>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  name="middleName"
                  value={formData.middleName || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={
                      formData.birthDate
                        ? formData.birthDate.split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programmingLanguage">
                    Programming Language
                  </Label>
                  <Input
                    id="programmingLanguage"
                    name="programmingLanguage"
                    value={formData.programmingLanguage || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankCard">Bank Card</Label>
                  <Input
                    id="bankCard"
                    name="bankCard"
                    value={formData.bankCard || ""}
                    onChange={handleChange}
                    placeholder="1234-5678-9012-3456"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="githubLink">GitHub Link</Label>
                  <Input
                    id="githubLink"
                    name="githubLink"
                    value={formData.githubLink || ""}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinLink">LinkedIn Link</Label>
                  <Input
                    id="linkedinLink"
                    name="linkedinLink"
                    value={formData.linkedinLink || ""}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              {isAdmin && (
                <>
                  <hr className="my-6" />
                  <h3 className="text-lg font-semibold mb-4">
                    Admin-Only Fields
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        name="position"
                        value={formData.position || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary</Label>
                      <Input
                        id="salary"
                        name="salary"
                        type="number"
                        value={formData.salary || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role || "employee"}
                        onChange={handleChange}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mentorName">Mentor Name</Label>
                      <Input
                        id="mentorName"
                        name="mentorName"
                        value={formData.mentorName || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="englishLevel">English Level</Label>
                      <Input
                        id="englishLevel"
                        name="englishLevel"
                        value={formData.englishLevel || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input
                        id="hireDate"
                        name="hireDate"
                        type="date"
                        value={
                          formData.hireDate
                            ? formData.hireDate.split("T")[0]
                            : ""
                        }
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workingHoursPerWeek">
                        Working Hours/Week
                      </Label>
                      <Input
                        id="workingHoursPerWeek"
                        name="workingHoursPerWeek"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.workingHoursPerWeek || ""}
                        onChange={handleChange}
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
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      New Password (leave empty to keep current)
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password || ""}
                      onChange={handleChange}
                      placeholder="Enter new password to change"
                    />
                    <p className="text-xs text-muted-foreground">
                      Password will be automatically hashed for security
                    </p>
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
                          : formData.vacationDates || ""
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
                  <div className="space-y-2">
                    <Label htmlFor="adminNote">Admin Note</Label>
                    <textarea
                      id="adminNote"
                      name="adminNote"
                      value={formData.adminNote || ""}
                      onChange={handleChange}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData(employee);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </h3>
                  <p>{employee.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Phone
                  </h3>
                  <p>{employee.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Birth Date
                  </h3>
                  <p>
                    {employee.birthDate
                      ? format(new Date(employee.birthDate), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Programming Language
                  </h3>
                  <p>{employee.programmingLanguage}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Country
                  </h3>
                  <p>{employee.country || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Bank Card
                  </h3>
                  <p>{employee.bankCard || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    GitHub
                  </h3>
                  <p>
                    {employee.githubLink ? (
                      <a
                        href={employee.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {employee.githubLink}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    LinkedIn
                  </h3>
                  <p>
                    {employee.linkedinLink ? (
                      <a
                        href={employee.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {employee.linkedinLink}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Position
                  </h3>
                  <p>{employee.position || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Role
                  </h3>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {employee.role === "admin" ? "Admin" : "Employee"}
                    </span>
                  </p>
                </div>
                {isAdmin && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Salary
                      </h3>
                      <p>${employee.salary || 0}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Mentor
                      </h3>
                      <p>{employee.mentorName || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        English Level
                      </h3>
                      <p>{employee.englishLevel || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Working Hours/Week
                      </h3>
                      <p>{employee.workingHoursPerWeek || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Hire Date
                      </h3>
                      <p>
                        {employee.hireDate
                          ? format(new Date(employee.hireDate), "PPP")
                          : "N/A"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Vacation Dates
                      </h3>
                      <p>
                        {employee.vacationDates &&
                        Array.isArray(employee.vacationDates) &&
                        employee.vacationDates.length > 0
                          ? employee.vacationDates
                              .map((date) => format(new Date(date), "PPP"))
                              .join(", ")
                          : "N/A"}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {isAdmin && employee.adminNote && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Admin Note
                  </h3>
                  <p className="text-sm bg-muted p-4 rounded-md">
                    {employee.adminNote}
                  </p>
                </div>
              )}
              
              {/* Projects Section */}
              {employee.projects && employee.projects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {employee.projects.map((project) => (
                      <Card
                        key={project.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openProjectDialog(project)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            {project.active ? (
                              <span className="inline-flex items-center text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs text-red-600">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                          {isAdmin && project.wage !== undefined && (
                            <p className="text-sm font-medium mt-2">
                              Wage: ${project.wage}
                            </p>
                          )}
                          <div className="mt-3 flex items-center text-primary text-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Click to view details
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Detail Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProjectDetail?.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              {selectedProjectDetail?.active ? (
                <span className="inline-flex items-center text-xs text-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center text-xs text-red-600">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </span>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {selectedProjectDetail?.description}
              </p>
            </div>
            {isAdmin && selectedProjectDetail?.wage !== undefined && (
              <div>
                <h4 className="font-semibold mb-2">Wage</h4>
                <p className="text-sm">${selectedProjectDetail.wage}</p>
              </div>
            )}
            {selectedProjectDetail?.employees && selectedProjectDetail.employees.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Assigned Employees</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedProjectDetail.employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">
                        {emp.firstName} {emp.lastName}
                      </span>
                      {emp.position && (
                        <span className="text-xs text-muted-foreground">
                          {emp.position}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Button onClick={() => setShowProjectDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
