"use client";

import { useState, useEffect } from "react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  UserPlus,
  Shield,
  Trash2,
  Edit,
  Search,
  Loader2,
  LogOut,
  Settings,
  Stethoscope,
  Plus,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry: string;
  employee_count: number;
  admin_email: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
}

interface CompanyAdmin {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  users: {
    email: string;
    full_name: string;
  };
}

interface CompanyEmployee {
  id: string;
  company_id: string;
  user_id: string;
  department: string;
  position: string;
  employee_id: string;
  users: {
    email: string;
    full_name: string;
  };
}

interface Professional {
  id: string;
  user_id: string;
  specialization: string;
  category: string;
  bio: string;
  price: number;
  is_available: boolean;
  users: {
    email: string;
    full_name: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyAdmins, setCompanyAdmins] = useState<CompanyAdmin[]>([]);
  const [companyEmployees, setCompanyEmployees] = useState<CompanyEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [isAddProfessionalOpen, setIsAddProfessionalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newEmployeeData, setNewEmployeeData] = useState({
    email: "",
    department: "",
    position: "",
    employee_id: "",
  });
  const [editCompanyData, setEditCompanyData] = useState({
    name: "",
    industry: "",
    employee_count: 0,
    subscription_plan: "",
    subscription_status: "",
  });
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    industry: "",
    employee_count: 0,
    admin_email: "",
    subscription_plan: "basic",
    subscription_status: "trial",
  });
  const [newProfessionalData, setNewProfessionalData] = useState({
    email: "",
    specialization: "",
    category: "psychologist",
    bio: "",
    price: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await getSafeUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      await fetchCompanies();
      await fetchProfessionals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify access",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch companies",
        variant: "destructive",
      });
    }
  };

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from("professionals")
        .select("*, users(email, full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch professionals",
        variant: "destructive",
      });
    }
  };

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      // Fetch admins
      const { data: admins, error: adminsError } = await supabase
        .from("company_admins")
        .select("*, users(email, full_name)")
        .eq("company_id", companyId);

      if (adminsError) throw adminsError;
      setCompanyAdmins(admins || []);

      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from("company_employees")
        .select("*, users(email, full_name)")
        .eq("company_id", companyId);

      if (employeesError) throw employeesError;
      setCompanyEmployees(employees || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch company details",
        variant: "destructive",
      });
    }
  };

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setEditCompanyData({
      name: company.name,
      industry: company.industry,
      employee_count: company.employee_count,
      subscription_plan: company.subscription_plan,
      subscription_status: company.subscription_status,
    });
    fetchCompanyDetails(company.id);
  };

  const handleCreateCompany = async () => {
    if (!newCompanyData.name || !newCompanyData.admin_email) {
      toast({
        title: "Error",
        description: "Company name and admin email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: newCompanyData.name,
          industry: newCompanyData.industry,
          employee_count: newCompanyData.employee_count,
          admin_email: newCompanyData.admin_email,
          subscription_plan: newCompanyData.subscription_plan,
          subscription_status: newCompanyData.subscription_status,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Find admin user by email
      const { data: adminUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", newCompanyData.admin_email)
        .single();

      if (!userError && adminUser) {
        // Add as company admin
        await supabase.from("company_admins").insert({
          company_id: company.id,
          user_id: adminUser.id,
          role: "admin",
        });

        // Update user's company_id
        await supabase
          .from("users")
          .update({ company_id: company.id })
          .eq("id", adminUser.id);
      }

      toast({
        title: "Success",
        description: "Company created successfully",
      });

      setNewCompanyData({
        name: "",
        industry: "",
        employee_count: 0,
        admin_email: "",
        subscription_plan: "basic",
        subscription_status: "trial",
      });
      setIsCreateCompanyOpen(false);
      await fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedCompany || !newAdminEmail) return;

    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", newAdminEmail)
        .single();

      if (userError || !user) {
        toast({
          title: "Error",
          description: "User not found with this email",
          variant: "destructive",
        });
        return;
      }

      // Add as company admin
      const { error: adminError } = await supabase
        .from("company_admins")
        .insert({
          company_id: selectedCompany.id,
          user_id: user.id,
          role: "admin",
        });

      if (adminError) throw adminError;

      // Update user's company_id
      await supabase
        .from("users")
        .update({ company_id: selectedCompany.id })
        .eq("id", user.id);

      toast({
        title: "Success",
        description: "Company admin added successfully",
      });

      setNewAdminEmail("");
      setIsAddAdminOpen(false);
      fetchCompanyDetails(selectedCompany.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;

    try {
      const { error } = await supabase
        .from("company_admins")
        .delete()
        .eq("id", adminId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin removed successfully",
      });

      if (selectedCompany) {
        fetchCompanyDetails(selectedCompany.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin",
        variant: "destructive",
      });
    }
  };

  const handleAddEmployee = async () => {
    if (!selectedCompany || !newEmployeeData.email) return;

    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", newEmployeeData.email)
        .single();

      if (userError || !user) {
        toast({
          title: "Error",
          description: "User not found with this email",
          variant: "destructive",
        });
        return;
      }

      // Add as company employee
      const { error: employeeError } = await supabase
        .from("company_employees")
        .insert({
          company_id: selectedCompany.id,
          user_id: user.id,
          department: newEmployeeData.department,
          position: newEmployeeData.position,
          employee_id: newEmployeeData.employee_id,
        });

      if (employeeError) throw employeeError;

      // Update user's company info
      await supabase
        .from("users")
        .update({
          company_id: selectedCompany.id,
          department: newEmployeeData.department,
          position: newEmployeeData.position,
        })
        .eq("id", user.id);

      toast({
        title: "Success",
        description: "Employee added successfully",
      });

      setNewEmployeeData({
        email: "",
        department: "",
        position: "",
        employee_id: "",
      });
      setIsAddEmployeeOpen(false);
      fetchCompanyDetails(selectedCompany.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!confirm("Are you sure you want to remove this employee?")) return;

    try {
      const { error } = await supabase
        .from("company_employees")
        .delete()
        .eq("id", employeeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee removed successfully",
      });

      if (selectedCompany) {
        fetchCompanyDetails(selectedCompany.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove employee",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;

    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: editCompanyData.name,
          industry: editCompanyData.industry,
          employee_count: editCompanyData.employee_count,
          subscription_plan: editCompanyData.subscription_plan,
          subscription_status: editCompanyData.subscription_status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedCompany.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company updated successfully",
      });

      setIsEditCompanyOpen(false);
      await fetchCompanies();
      
      // Update selected company
      const updatedCompany = companies.find(c => c.id === selectedCompany.id);
      if (updatedCompany) {
        setSelectedCompany(updatedCompany);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    }
  };

  const handleAddProfessional = async () => {
    if (!newProfessionalData.email || !newProfessionalData.specialization) {
      toast({
        title: "Error",
        description: "Email and specialization are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", newProfessionalData.email)
        .single();

      if (userError || !user) {
        toast({
          title: "Error",
          description: "User not found with this email",
          variant: "destructive",
        });
        return;
      }

      // Add as professional
      const { error: professionalError } = await supabase
        .from("professionals")
        .insert({
          user_id: user.id,
          specialization: newProfessionalData.specialization,
          category: newProfessionalData.category,
          bio: newProfessionalData.bio,
          price: newProfessionalData.price,
          is_available: true,
        });

      if (professionalError) throw professionalError;

      // Update user role
      await supabase
        .from("users")
        .update({ role: "professional" })
        .eq("id", user.id);

      toast({
        title: "Success",
        description: "Professional added successfully",
      });

      setNewProfessionalData({
        email: "",
        specialization: "",
        category: "psychologist",
        bio: "",
        price: 0,
      });
      setIsAddProfessionalOpen(false);
      await fetchProfessionals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add professional",
        variant: "destructive",
      });
    }
  };

  const handleToggleProfessionalAvailability = async (professionalId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("professionals")
        .update({ is_available: !currentStatus })
        .eq("id", professionalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Professional availability updated",
      });

      await fetchProfessionals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage companies, professionals, and wellness programs
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-800">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="professionals">Professionals</TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Companies List */}
              <div className="lg:col-span-1">
                <Card className="bg-white dark:bg-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-[#8B6CFD]" />
                        Companies
                      </CardTitle>
                      <Dialog open={isCreateCompanyOpen} onOpenChange={setIsCreateCompanyOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Company</DialogTitle>
                            <DialogDescription>
                              Add a new company to the wellness platform
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Company Name *</Label>
                              <Input
                                placeholder="Acme Corporation"
                                value={newCompanyData.name}
                                onChange={(e) =>
                                  setNewCompanyData({ ...newCompanyData, name: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Industry</Label>
                              <Input
                                placeholder="Technology, Healthcare, etc."
                                value={newCompanyData.industry}
                                onChange={(e) =>
                                  setNewCompanyData({ ...newCompanyData, industry: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Employee Count</Label>
                              <Input
                                type="number"
                                value={newCompanyData.employee_count}
                                onChange={(e) =>
                                  setNewCompanyData({
                                    ...newCompanyData,
                                    employee_count: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Admin Email *</Label>
                              <Input
                                type="email"
                                placeholder="admin@company.com"
                                value={newCompanyData.admin_email}
                                onChange={(e) =>
                                  setNewCompanyData({ ...newCompanyData, admin_email: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Subscription Plan</Label>
                              <Select
                                value={newCompanyData.subscription_plan}
                                onValueChange={(value) =>
                                  setNewCompanyData({ ...newCompanyData, subscription_plan: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="basic">Basic</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                  <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Subscription Status</Label>
                              <Select
                                value={newCompanyData.subscription_status}
                                onValueChange={(value) =>
                                  setNewCompanyData({ ...newCompanyData, subscription_status: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="trial">Trial</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="suspended">Suspended</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={handleCreateCompany} className="w-full">
                              Create Company
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="relative mt-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {filteredCompanies.map((company) => (
                        <div
                          key={company.id}
                          onClick={() => handleSelectCompany(company)}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedCompany?.id === company.id
                              ? "bg-[#8B6CFD]/10 border-[#8B6CFD]"
                              : "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 dark:text-white">
                                {company.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {company.industry}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {company.employee_count} employees
                                </Badge>
                                <Badge
                                  className={`text-xs ${
                                    company.subscription_status === "active"
                                      ? "bg-green-500"
                                      : company.subscription_status === "trial"
                                      ? "bg-blue-500"
                                      : "bg-gray-500"
                                  }`}
                                >
                                  {company.subscription_status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Company Details */}
              <div className="lg:col-span-2">
                {selectedCompany ? (
                  <div className="space-y-6">
                    {/* Company Info Card */}
                    <Card className="bg-white dark:bg-slate-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-[#8B6CFD]" />
                            {selectedCompany.name}
                          </CardTitle>
                          <Dialog open={isEditCompanyOpen} onOpenChange={setIsEditCompanyOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Company</DialogTitle>
                                <DialogDescription>
                                  Update company information and settings
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Company Name</Label>
                                  <Input
                                    value={editCompanyData.name}
                                    onChange={(e) =>
                                      setEditCompanyData({ ...editCompanyData, name: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Industry</Label>
                                  <Input
                                    value={editCompanyData.industry}
                                    onChange={(e) =>
                                      setEditCompanyData({ ...editCompanyData, industry: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Employee Count</Label>
                                  <Input
                                    type="number"
                                    value={editCompanyData.employee_count}
                                    onChange={(e) =>
                                      setEditCompanyData({
                                        ...editCompanyData,
                                        employee_count: parseInt(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Subscription Plan</Label>
                                  <Select
                                    value={editCompanyData.subscription_plan}
                                    onValueChange={(value) =>
                                      setEditCompanyData({ ...editCompanyData, subscription_plan: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="basic">Basic</SelectItem>
                                      <SelectItem value="premium">Premium</SelectItem>
                                      <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Subscription Status</Label>
                                  <Select
                                    value={editCompanyData.subscription_status}
                                    onValueChange={(value) =>
                                      setEditCompanyData({ ...editCompanyData, subscription_status: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="trial">Trial</SelectItem>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="suspended">Suspended</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button onClick={handleUpdateCompany} className="w-full">
                                  Update Company
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Industry</p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {selectedCompany.industry}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Employees</p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {selectedCompany.employee_count}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                            <Badge className="bg-[#8B6CFD]">
                              {selectedCompany.subscription_plan}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                            <Badge
                              className={
                                selectedCompany.subscription_status === "active"
                                  ? "bg-green-500"
                                  : selectedCompany.subscription_status === "trial"
                                  ? "bg-blue-500"
                                  : "bg-gray-500"
                              }
                            >
                              {selectedCompany.subscription_status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tabs for Admins and Employees */}
                    <Tabs defaultValue="admins" className="space-y-4">
                      <TabsList className="bg-white dark:bg-slate-800">
                        <TabsTrigger value="admins">Company Admins</TabsTrigger>
                        <TabsTrigger value="employees">Employees</TabsTrigger>
                      </TabsList>

                      {/* Admins Tab */}
                      <TabsContent value="admins">
                        <Card className="bg-white dark:bg-slate-800">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-[#8B6CFD]" />
                                Company Admins
                              </CardTitle>
                              <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Admin
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Company Admin</DialogTitle>
                                    <DialogDescription>
                                      Assign a user as company admin
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>User Email</Label>
                                      <Input
                                        type="email"
                                        placeholder="user@example.com"
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                      />
                                    </div>
                                    <Button onClick={handleAddAdmin} className="w-full">
                                      Add Admin
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {companyAdmins.map((admin) => (
                                  <TableRow key={admin.id}>
                                    <TableCell className="font-medium">
                                      {admin.users.full_name || "N/A"}
                                    </TableCell>
                                    <TableCell>{admin.users.email}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{admin.role}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveAdmin(admin.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Employees Tab */}
                      <TabsContent value="employees">
                        <Card className="bg-white dark:bg-slate-800">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-[#8B6CFD]" />
                                Company Employees
                              </CardTitle>
                              <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Employee
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Employee</DialogTitle>
                                    <DialogDescription>
                                      Add a user to the company wellness program
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>User Email</Label>
                                      <Input
                                        type="email"
                                        placeholder="user@example.com"
                                        value={newEmployeeData.email}
                                        onChange={(e) =>
                                          setNewEmployeeData({
                                            ...newEmployeeData,
                                            email: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Department</Label>
                                      <Input
                                        placeholder="Engineering, HR, Sales, etc."
                                        value={newEmployeeData.department}
                                        onChange={(e) =>
                                          setNewEmployeeData({
                                            ...newEmployeeData,
                                            department: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Position</Label>
                                      <Input
                                        placeholder="Software Engineer, Manager, etc."
                                        value={newEmployeeData.position}
                                        onChange={(e) =>
                                          setNewEmployeeData({
                                            ...newEmployeeData,
                                            position: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Employee ID</Label>
                                      <Input
                                        placeholder="EMP001"
                                        value={newEmployeeData.employee_id}
                                        onChange={(e) =>
                                          setNewEmployeeData({
                                            ...newEmployeeData,
                                            employee_id: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <Button onClick={handleAddEmployee} className="w-full">
                                      Add Employee
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Department</TableHead>
                                  <TableHead>Position</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {companyEmployees.map((employee) => (
                                  <TableRow key={employee.id}>
                                    <TableCell className="font-medium">
                                      {employee.users.full_name || "N/A"}
                                    </TableCell>
                                    <TableCell>{employee.users.email}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{employee.department || "N/A"}</Badge>
                                    </TableCell>
                                    <TableCell>{employee.position || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveEmployee(employee.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <Card className="bg-white dark:bg-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Building2 className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        No Company Selected
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        Select a company from the list to manage its wellness program
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-[#8B6CFD]" />
                    Mental Health Professionals
                  </CardTitle>
                  <Dialog open={isAddProfessionalOpen} onOpenChange={setIsAddProfessionalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Professional
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Professional</DialogTitle>
                        <DialogDescription>
                          Assign a user as a mental health professional
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>User Email *</Label>
                          <Input
                            type="email"
                            placeholder="professional@example.com"
                            value={newProfessionalData.email}
                            onChange={(e) =>
                              setNewProfessionalData({ ...newProfessionalData, email: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select
                            value={newProfessionalData.category}
                            onValueChange={(value) =>
                              setNewProfessionalData({ ...newProfessionalData, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="psychologist">Psychologist</SelectItem>
                              <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                              <SelectItem value="counselor">Counselor</SelectItem>
                              <SelectItem value="therapist">Therapist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Specialization *</Label>
                          <Input
                            placeholder="Anxiety, Depression, Trauma, etc."
                            value={newProfessionalData.specialization}
                            onChange={(e) =>
                              setNewProfessionalData({ ...newProfessionalData, specialization: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Bio</Label>
                          <Input
                            placeholder="Brief professional bio"
                            value={newProfessionalData.bio}
                            onChange={(e) =>
                              setNewProfessionalData({ ...newProfessionalData, bio: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Price (IDR)</Label>
                          <Input
                            type="number"
                            placeholder="150000"
                            value={newProfessionalData.price}
                            onChange={(e) =>
                              setNewProfessionalData({
                                ...newProfessionalData,
                                price: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <Button onClick={handleAddProfessional} className="w-full">
                          Add Professional
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professionals.map((professional) => (
                      <TableRow key={professional.id}>
                        <TableCell className="font-medium">
                          {professional.users.full_name || "N/A"}
                        </TableCell>
                        <TableCell>{professional.users.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{professional.category}</Badge>
                        </TableCell>
                        <TableCell>{professional.specialization}</TableCell>
                        <TableCell>Rp {(professional.price || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              professional.is_available ? "bg-green-500" : "bg-gray-500"
                            }
                          >
                            {professional.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleProfessionalAvailability(
                                professional.id,
                                professional.is_available
                              )
                            }
                          >
                            {professional.is_available ? "Disable" : "Enable"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}