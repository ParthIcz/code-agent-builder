import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Sparkles,
  Code,
  Eye,
  Calendar,
  User,
  Star,
  Download,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  GitBranch,
  Zap,
} from "lucide-react";

// Dummy project data
const dummyProjects = [
  {
    id: "project-1",
    name: "E-commerce Dashboard",
    description:
      "Modern admin dashboard for e-commerce platform with analytics, user management, and real-time data visualization.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center",
    creator: "John Doe",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    framework: "React",
    styling: "Tailwind CSS",
    features: ["Dark Mode", "Analytics", "Charts", "Authentication"],
    status: "active",
    stars: 24,
    views: 156,
  },
  {
    id: "project-2",
    name: "Portfolio Website",
    description:
      "Personal portfolio website with modern animations, project showcase, and contact form integration.",
    image:
      "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=300&fit=crop&crop=center",
    creator: "Jane Smith",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
    framework: "Next.js",
    styling: "Tailwind CSS",
    features: ["Animations", "Contact Form", "Blog", "SEO Optimized"],
    status: "active",
    stars: 18,
    views: 89,
  },
  {
    id: "project-3",
    name: "Task Management App",
    description:
      "Collaborative task management application with real-time updates, team collaboration, and project tracking.",
    image:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&crop=center",
    creator: "Mike Johnson",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-19",
    framework: "React",
    styling: "Material UI",
    features: [
      "Real-time Updates",
      "Team Collaboration",
      "Notifications",
      "File Upload",
    ],
    status: "completed",
    stars: 31,
    views: 203,
  },
  {
    id: "project-4",
    name: "SaaS Landing Page",
    description:
      "High-converting landing page for SaaS product with pricing tables, testimonials, and lead capture forms.",
    image:
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop&crop=center",
    creator: "Sarah Wilson",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-16",
    framework: "React",
    styling: "Tailwind CSS",
    features: [
      "Pricing Tables",
      "Testimonials",
      "Lead Capture",
      "Mobile Responsive",
    ],
    status: "active",
    stars: 42,
    views: 287,
  },
  {
    id: "project-5",
    name: "Blog Platform",
    description:
      "Full-featured blog platform with markdown support, commenting system, and content management.",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop&crop=center",
    creator: "Alex Chen",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-17",
    framework: "Next.js",
    styling: "Tailwind CSS",
    features: ["Markdown Support", "Comments", "Search", "Categories"],
    status: "in-progress",
    stars: 15,
    views: 124,
  },
  {
    id: "project-6",
    name: "Weather App",
    description:
      "Beautiful weather application with location-based forecasts, interactive maps, and weather alerts.",
    image:
      "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop&crop=center",
    creator: "Emma Davis",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-14",
    framework: "React",
    styling: "CSS Modules",
    features: [
      "Location Services",
      "Interactive Maps",
      "Weather Alerts",
      "Offline Support",
    ],
    status: "completed",
    stars: 27,
    views: 198,
  },
];

const Projects = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredProjects = dummyProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleProjectClick = (projectId: string) => {
    navigate(`/editor?project=${projectId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Premium Background */}
      <div className="absolute inset-0 hero-gradient opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 premium-gradient rounded-full opacity-10 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 premium-gradient rounded-full opacity-8 blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <header className="relative z-[200] border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between min-h-[60px]">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-gray-300 hover:text-white border-white/20 hover:border-white/40 px-3 py-2 h-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <div className="w-px h-6 bg-border hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-xl glow-gradient border border-purple-500/30 shadow-2xl">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white animate-pulse-glow" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold glow-gradient bg-clip-text text-transparent">
                    My Projects
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300">
                    Build • Manage • Deploy
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/editor")}
                className="glow-gradient text-white border-0 hover:opacity-90 shadow-lg px-4 py-2 h-auto"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Project</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-purple-300" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 luxury-gradient border-purple-400/30 focus:border-purple-300/60 text-white placeholder:text-purple-300/70"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="luxury-gradient border-purple-400/30 text-white"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="expensive-gradient border-purple-500/30">
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("all")}
                    className="text-purple-100"
                  >
                    All Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("active")}
                    className="text-purple-100"
                  >
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("completed")}
                    className="text-purple-100"
                  >
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("in-progress")}
                    className="text-purple-100"
                  >
                    In Progress
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border border-purple-400/30 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }`}
        >
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`expensive-gradient border border-purple-500/30 shadow-2xl backdrop-blur-sm hover:border-purple-400/50 transition-all group cursor-pointer ${
                viewMode === "list" ? "flex flex-row" : ""
              }`}
              onClick={() => handleProjectClick(project.id)}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge
                        className={`${getStatusColor(project.status)} border`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg group-hover:text-purple-300 transition-colors">
                      {project.name}
                    </CardTitle>
                    <p className="text-purple-200 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Creator and Date */}
                      <div className="flex items-center justify-between text-xs text-purple-300">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {project.creator}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(project.updatedAt)}
                        </div>
                      </div>

                      {/* Framework and Styling */}
                      <div className="flex gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs expensive-gradient text-white border-0"
                        >
                          {project.framework}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs accent-gradient text-white border-0"
                        >
                          {project.styling}
                        </Badge>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1">
                        {project.features.slice(0, 3).map((feature, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs border-purple-400/30 text-purple-200"
                          >
                            {feature}
                          </Badge>
                        ))}
                        {project.features.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-purple-400/30 text-purple-200"
                          >
                            +{project.features.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                        <div className="flex items-center gap-4 text-xs text-purple-300">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {project.stars}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {project.views}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-300 hover:text-white p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle download logic
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                // List view
                <div className="flex flex-1">
                  <div className="w-24 h-24 flex-shrink-0 m-4">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white text-lg font-semibold group-hover:text-purple-300 transition-colors">
                            {project.name}
                          </h3>
                          <Badge
                            className={`${getStatusColor(project.status)} border text-xs`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-purple-200 text-sm mb-3 line-clamp-1">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-purple-300">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {project.creator}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Updated {formatDate(project.updatedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {project.stars}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {project.views}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 rounded-xl bg-primary/10 inline-flex mb-4">
              <Code className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No projects found
            </h3>
            <p className="text-purple-200 mb-6">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Create your first project to get started"}
            </p>
            <Button
              onClick={() => navigate("/editor")}
              className="glow-gradient hover:opacity-90 shadow-xl text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
          </div>
        )}

        {/* Existing Projects Section */}
        <div className="mt-16 pt-8 border-t border-purple-500/20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Explore Existing Projects
            </h2>
            <p className="text-purple-200 max-w-2xl mx-auto">
              Browse through community projects, templates, and examples to
              kickstart your development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="luxury-gradient border border-purple-500/30 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-xl expensive-gradient inline-flex mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-3 text-xl text-white">
                  Templates
                </h3>
                <p className="text-purple-200 text-sm leading-relaxed mb-4">
                  Ready-to-use project templates for common use cases and
                  frameworks.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-400/30 text-purple-200 hover:border-purple-300/50"
                >
                  Browse Templates
                </Button>
              </CardContent>
            </Card>

            <Card className="luxury-gradient border border-purple-500/30 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-xl accent-gradient inline-flex mb-4">
                  <GitBranch className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-3 text-xl text-white">
                  Community
                </h3>
                <p className="text-purple-200 text-sm leading-relaxed mb-4">
                  Discover projects shared by the community and learn from
                  others.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-400/30 text-purple-200 hover:border-purple-300/50"
                >
                  Explore Community
                </Button>
              </CardContent>
            </Card>

            <Card className="luxury-gradient border border-purple-500/30 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-xl glow-gradient inline-flex mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-3 text-xl text-white">
                  Featured
                </h3>
                <p className="text-purple-200 text-sm leading-relaxed mb-4">
                  Handpicked exceptional projects showcasing best practices.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-400/30 text-purple-200 hover:border-purple-300/50"
                >
                  View Featured
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
