"use client";

import { useState } from "react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Building2, Users, Mail, Loader2, ArrowLeft } from "lucide-react";

export default function CorporateSetup() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    employeeCount: "",
    adminEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await getSafeUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        router.push("/auth");
        return;
      }

      // Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            name: formData.companyName,
            industry: formData.industry,
            employee_count: parseInt(formData.employeeCount),
            admin_email: formData.adminEmail,
            subscription_plan: "basic",
            subscription_status: "trial",
          },
        ])
        .select()
        .single();

      if (companyError) throw companyError;

      // Add user as company admin
      const { error: adminError } = await supabase
        .from("company_admins")
        .insert([
          {
            company_id: company.id,
            user_id: user.id,
            role: "admin",
          },
        ]);

      if (adminError) throw adminError;

      // Update user's company_id
      const { error: userError } = await supabase
        .from("users")
        .update({ company_id: company.id })
        .eq("id", user.id);

      if (userError) throw userError;

      toast({
        title: "Success!",
        description: "Your corporate account has been created",
      });

      router.push("/dashboard/corporate");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create corporate account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 bg-[#8B6CFD] rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
              Corporate Wellness Setup
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Set up your company's wellness program dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Tech Innovators Inc"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  type="text"
                  placeholder="Technology, Finance, Healthcare, etc."
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Number of Employees</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="employeeCount"
                    type="number"
                    placeholder="50"
                    min="1"
                    value={formData.employeeCount}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeCount: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@company.com"
                    value={formData.adminEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, adminEmail: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  What's Included:
                </h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>✓ Aggregated employee wellness analytics</li>
                  <li>✓ Department-level insights</li>
                  <li>✓ AI-powered recommendations</li>
                  <li>✓ Real-time stress pattern detection</li>
                  <li>✓ Privacy-protected data (no individual access)</li>
                  <li>✓ 14-day free trial</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#8B6CFD] hover:bg-[#8B6CFD]/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Corporate Account"
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
                Employee data will be anonymized and aggregated.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}