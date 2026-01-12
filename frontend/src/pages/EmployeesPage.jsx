import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  ArrowUpDown,
} from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("registrationDate");
  const [order, setOrder] = useState("ASC");
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const limit = 10;

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm, sortBy, order]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        sortBy,
        order,
        ...(searchTerm && { firstName: searchTerm }),
      };
      const data = await userService.getUsers(params);
      setEmployees(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch employees",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      await userService.deleteUser(id);
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      fetchEmployees();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete employee",
      });
    }
  };

  const sortOptions = [
    { value: "registrationDate", label: "Registration Date" },
    { value: "programmingLanguage", label: "Programming Language" },
    { value: "position", label: "Position" },
    { value: "country", label: "Country" },
  ];

  if (isAdmin) {
    sortOptions.push(
      { value: "mentorName", label: "Mentor Name" },
      { value: "englishLevel", label: "English Level" }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate("/employees/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="w-[200px]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setOrder(order === "ASC" ? "DESC" : "ASC");
              setCurrentPage(1);
            }}
            title={`Sort ${order === "ASC" ? "Descending" : "Ascending"}`}
          >
            <ArrowUpDown className="h-4 w-4" />
            {order === "DESC" && (
              <span className="sr-only">Sorted descending</span>
            )}
            {order === "ASC" && (
              <span className="sr-only">Sorted ascending</span>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No employees found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card
                key={employee.id}
                className="hover:shadow-md hover:border-[#0969da]/30 transition-all"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">
                          {employee.firstName} {employee.lastName}
                        </CardTitle>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            employee.role === "admin"
                              ? "bg-[#ddf4ff] text-[#0969da] border border-[#54aeff]/30"
                              : "bg-[#ddf4ff] text-[#0969da] border border-[#54aeff]/30"
                          }`}
                        >
                          {employee.role === "admin" ? "Admin" : "Employee"}
                        </span>
                      </div>
                      <CardDescription className="mt-1">
                        {employee.email} • {employee.position || "No position"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/employees/${employee.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        Programming Language
                      </p>
                      <p className="font-medium">
                        {employee.programmingLanguage}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                    {employee.country && (
                      <div>
                        <p className="text-muted-foreground">Country</p>
                        <p className="font-medium">{employee.country}</p>
                      </div>
                    )}
                    {employee.englishLevel && (
                      <div>
                        <p className="text-muted-foreground">English Level</p>
                        <p className="font-medium">{employee.englishLevel}</p>
                      </div>
                    )}
                    {isAdmin && employee.registrationDate && (
                      <div>
                        <p className="text-muted-foreground">Registration Date</p>
                        <p className="font-medium">
                          {new Date(employee.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {isAdmin && employee.lastLoginDate && (
                      <div>
                        <p className="text-muted-foreground">Last Login</p>
                        <p className="font-medium">
                          {new Date(employee.lastLoginDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {isAdmin && employee.createdAt && (
                      <div>
                        <p className="text-muted-foreground">Created At</p>
                        <p className="font-medium">
                          {new Date(employee.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {isAdmin && employee.updatedAt && (
                      <div>
                        <p className="text-muted-foreground">Updated At</p>
                        <p className="font-medium">
                          {new Date(employee.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {employee.projects && employee.projects.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Projects ({employee.projects.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.projects.slice(0, 3).map((project) => (
                          <span
                            key={project.id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-[#ddf4ff] text-[#0969da] cursor-pointer hover:bg-[#b6e3ff] transition-colors border border-[#54aeff]/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employees/${employee.id}`);
                            }}
                            title={project.description}
                          >
                            {project.name}
                          </span>
                        ))}
                        {employee.projects.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-[#f6f8fa] text-[#57606a] border border-[#d0d7de]">
                            +{employee.projects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {employees.length} of {total} employees
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
