import DashboardLayout from "../../../src/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../src/components/ui/tabs";
import { Button } from "../../../src/components/ui/button";
import { Input } from "../../../src/components/ui/input";
import { Label } from "../../../src/components/ui/label";
import { Switch } from "../../../src/components/ui/switch";
import { Separator } from "../../../src/components/ui/separator";
import { Badge } from "../../../src/components/ui/badge";
import { Progress } from "../../../src/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../src/components/ui/select";
import {
  Globe, Shield, Bell, Users, Puzzle, CreditCard,
  Copy, Key, Plus, ExternalLink, Check,
} from "lucide-react";
import { useAuth } from "../../../src/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and application preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="plan">Plan & Usage</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the application looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme across the application</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Reduce spacing for denser information display</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Set your preferred language and timezone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="utc8">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc8">UTC+8 (Shanghai)</SelectItem>
                        <SelectItem value="utc0">UTC+0 (London)</SelectItem>
                        <SelectItem value="utc-5">UTC-5 (New York)</SelectItem>
                        <SelectItem value="utc-8">UTC-8 (Los Angeles)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI & Report Generation</CardTitle>
                <CardDescription>Control how AI features and reports work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-generate reports</Label>
                    <p className="text-sm text-muted-foreground">Automatically generate evaluation reports when webinars complete</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Real-time Insights</Label>
                    <p className="text-sm text-muted-foreground">Show AI-powered insights during live negotiations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Risk Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive AI alerts for supplier risk factors</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name || ""} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ""} placeholder="your@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Your company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-title">Role</Label>
                    <Input id="role-title" placeholder="e.g. Sourcing Manager" />
                  </div>
                </div>
                <Button onClick={() => toast("Feature coming soon")}>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast("Feature coming soon")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization */}
          <TabsContent value="organization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Manage your organization information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input id="org-name" placeholder="Your company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-website">Website</Label>
                    <Input id="org-website" placeholder="https://yourcompany.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-industry">Industry</Label>
                    <Select defaultValue="ecommerce">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecommerce">E-Commerce</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-size">Company Size</Label>
                    <Select defaultValue="small">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="small">1-10</SelectItem>
                        <SelectItem value="medium">11-50</SelectItem>
                        <SelectItem value="large">51-200</SelectItem>
                        <SelectItem value="enterprise">200+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => toast("Feature coming soon")}>Update Organization</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what updates you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Webinar Updates", desc: "Get notified about webinar status changes" },
                  { label: "New Factory Joins", desc: "Receive alerts when factories join your webinars" },
                  { label: "Report Generation", desc: "Get notified when reports are ready" },
                  { label: "Order Status Changes", desc: "Track order progress in real-time" },
                  { label: "AI Risk Alerts", desc: "Receive AI-generated risk notifications" },
                  { label: "Weekly Digest", desc: "Get a weekly summary of your sourcing activity" },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={index < 4} />
                    </div>
                    {index < 5 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage who has access to your organization</CardDescription>
                </div>
                <Button size="sm" onClick={() => toast("Feature coming soon")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user?.name || "You"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Badge variant="default">Owner</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Manage API keys for external integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">API Key</p>
                      <p className="text-xs text-muted-foreground font-mono">rs_live_••••••••••••••••</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toast("Feature coming soon")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" onClick={() => toast("Feature coming soon")}>
                  <Key className="mr-2 h-4 w-4" />
                  Generate New Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>Third-party services connected to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Shopify", desc: "Sync orders and product data", connected: false },
                  { name: "Stripe", desc: "Process payments and invoices", connected: false },
                  { name: "Slack", desc: "Receive notifications in Slack channels", connected: false },
                  { name: "Google Sheets", desc: "Export data to spreadsheets", connected: false },
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Puzzle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.desc}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast("Feature coming soon")}>
                      {service.connected ? (
                        <>
                          <Check className="mr-1 h-3 w-3" /> Connected
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-1 h-3 w-3" /> Connect
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan & Usage */}
          <TabsContent value="plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>View your subscription and resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <div>
                    <p className="text-lg font-bold">Free Plan</p>
                    <p className="text-sm text-muted-foreground">Basic sourcing features</p>
                  </div>
                  <Button onClick={() => toast("Feature coming soon")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Webinars", used: 3, total: 10 },
                    { label: "Factories", used: 24, total: 50 },
                    { label: "Reports", used: 4, total: 20 },
                    { label: "Team Members", used: 1, total: 3 },
                    { label: "Storage", used: 120, total: 500, unit: "MB" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">
                          {item.used} / {item.total} {item.unit || ""}
                        </span>
                      </div>
                      <Progress value={(item.used / item.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
