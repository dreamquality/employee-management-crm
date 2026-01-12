import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    wage: "",
    active: true,
  });
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const limit = 10;

  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchTerm]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        ...(searchTerm && { search: searchTerm }),
      };
      const data = await projectService.getProjects(params);
      setProjects(data.projects || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch projects",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectService.createProject(formData);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setShowCreateDialog(false);
      setFormData({ name: "", description: "", wage: "", active: true });
      fetchProjects();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg ||
        "Failed to create project";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await projectService.updateProject(selectedProject.id, formData);
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      setShowEditDialog(false);
      setSelectedProject(null);
      setFormData({ name: "", description: "", wage: "", active: true });
      fetchProjects();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg ||
        "Failed to update project";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await projectService.deleteProject(id);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      fetchProjects();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project",
      });
    }
  };

  const openEditDialog = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      wage: project.wage || "",
      active: project.active,
    });
    setShowEditDialog(true);
  };

  const openViewDialog = async (project) => {
    try {
      // Fetch project details and employees separately using the new endpoint
      const [fullProject, employeesData] = await Promise.all([
        projectService.getProject(project.id),
        projectService.getProjectEmployees(project.id)
      ]);
      
      // Merge employees data into the project object
      setSelectedProject({
        ...fullProject,
        employees: employeesData.employees || []
      });
      setShowViewDialog(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch project details",
      });
    }
  };

  if (loading && projects.length === 0) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage company projects
          </p>
        </div>
        {isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                      rows={4}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/5000 characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="wage">Wage</Label>
                    <Input
                      id="wage"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.wage}
                      onChange={(e) =>
                        setFormData({ ...formData, wage: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search projects by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md hover:border-[#0969da]/30 transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {project.active ? (
                      <span className="inline-flex items-center text-xs text-[#1a7f37] bg-[#dafbe1] px-2 py-0.5 rounded-full border border-[#1a7f37]/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-[#cf222e] bg-[#ffebe9] px-2 py-0.5 rounded-full border border-[#cf222e]/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-3 mb-4">
                {project.description}
              </CardDescription>
              {isAdmin && project.wage !== undefined && (
                <p className="text-sm font-medium mb-4">
                  Wage: ${project.wage}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openViewDialog(project)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      {isAdmin && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Project Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description *</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={4}
                    maxLength={5000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/5000 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-wage">Wage</Label>
                  <Input
                    id="edit-wage"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.wage}
                    onChange={(e) =>
                      setFormData({ ...formData, wage: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              {selectedProject?.active ? (
                <span className="inline-flex items-center text-xs text-[#1a7f37] bg-[#dafbe1] px-2 py-0.5 rounded-full border border-[#1a7f37]/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center text-xs text-[#cf222e] bg-[#ffebe9] px-2 py-0.5 rounded-full border border-[#cf222e]/20">
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
                {selectedProject?.description}
              </p>
            </div>
            {isAdmin && selectedProject?.wage !== undefined && (
              <div>
                <h4 className="font-semibold mb-2">Wage</h4>
                <p className="text-sm">${selectedProject.wage}</p>
              </div>
            )}
            {selectedProject?.employees && selectedProject.employees.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Assigned Employees</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedProject.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">
                        {employee.firstName} {employee.lastName}
                      </span>
                      {employee.position && (
                        <span className="text-xs text-muted-foreground">
                          {employee.position}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
