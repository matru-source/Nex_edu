import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { uploadMediaFile } from "../../../lib/upload";
import {
  Upload,
  Image,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  GripVertical,
  Info,
  Eye,
  EyeOff,
  Edit2,
  X,
  ImagePlus,
  ImageIcon,
  Maximize2,
  ExternalLink,
} from "lucide-react";

type TabType = "banners" | "logos";

interface Banner {
  id: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  order: number;
  isActive: boolean;
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ClientLogo {
  id: string;
  imageUrl: string;
  name: string | null;
  order: number;
  isActive: boolean;
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
}

interface BannersResponse {
  status: boolean;
  msg?: string;
  data?: Banner[];
  standardSize?: { width: number; height: number };
}

interface ClientLogosResponse {
  status: boolean;
  msg?: string;
  data?: ClientLogo[];
}

interface StandardSizeResponse {
  status: boolean;
  data?: { width: number; height: number; aspectRatio: string; message: string };
}

export default function AdminMediaManagement() {
  useInitNavStackOnce([
    { title: "Dashboard", path: "/admin/dashboard" },
    { title: "Media Management", path: "/admin/media" },
  ]);

  const [activeTab, setActiveTab] = useState<TabType>("banners");
  const queryClient = useQueryClient();

  // Banner state
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [viewingMedia, setViewingMedia] = useState<{ url: string; title?: string | null; description?: string | null; type: "banner" | "logo" } | null>(null);
  const [draggedBanner, setDraggedBanner] = useState<Banner | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "uploaded" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client Logo state
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [logoName, setLogoName] = useState("");
  const [editingLogo, setEditingLogo] = useState<ClientLogo | null>(null);
  const [draggedLogo, setDraggedLogo] = useState<ClientLogo | null>(null);
  const [logoUploadState, setLogoUploadState] = useState<"idle" | "uploading" | "uploaded" | "error">("idle");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Banner queries
  const { data: standardSizeData } = useQuery({
    queryKey: ["banner-standard-size"],
    queryFn: async () => {
      const res = await api.get<StandardSizeResponse>(API_ROUTES.BANNER.STANDARD_SIZE);
      return res.data;
    },
  });
  const standardSize = standardSizeData?.data;

  const { data: bannersData, isLoading: isLoadingBanners } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const res = await api.get<BannersResponse>(API_ROUTES.BANNER.ALL);
      return res.data;
    },
  });
  const banners = bannersData?.data || [];

  // Client Logo queries
  const { data: logosData, isLoading: isLoadingLogos } = useQuery({
    queryKey: ["admin-client-logos"],
    queryFn: async () => {
      const res = await api.get<ClientLogosResponse>(API_ROUTES.CLIENT_LOGO.ALL);
      return res.data;
    },
  });
  const logos = logosData?.data || [];

  // Banner mutations
  const createMutation = useMutation({
    mutationFn: async (data: { imageUrl: string; title?: string; description?: string }) => {
      const res = await api.post<BannersResponse>(API_ROUTES.BANNER.CREATE, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      resetUpload();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Banner> }) => {
      const res = await api.put<BannersResponse>(API_ROUTES.BANNER.UPDATE(id), data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setEditingBanner(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<BannersResponse>(API_ROUTES.BANNER.DELETE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (bannerIds: string[]) => {
      const res = await api.post<BannersResponse>(API_ROUTES.BANNER.REORDER, { bannerIds });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  // Client Logo mutations
  const createLogoMutation = useMutation({
    mutationFn: async (data: { imageUrl: string; name?: string }) => {
      const res = await api.post<ClientLogosResponse>(API_ROUTES.CLIENT_LOGO.CREATE, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-client-logos"] });
      queryClient.invalidateQueries({ queryKey: ["client-logos"] });
      resetLogoUpload();
    },
  });

  const updateLogoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientLogo> }) => {
      const res = await api.put<ClientLogosResponse>(API_ROUTES.CLIENT_LOGO.UPDATE(id), data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-client-logos"] });
      queryClient.invalidateQueries({ queryKey: ["client-logos"] });
      setEditingLogo(null);
    },
  });

  const deleteLogoMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ClientLogosResponse>(API_ROUTES.CLIENT_LOGO.DELETE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-client-logos"] });
      queryClient.invalidateQueries({ queryKey: ["client-logos"] });
    },
  });

  const reorderLogoMutation = useMutation({
    mutationFn: async (logoIds: string[]) => {
      const res = await api.post<ClientLogosResponse>(API_ROUTES.CLIENT_LOGO.REORDER, { logoIds });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-client-logos"] });
      queryClient.invalidateQueries({ queryKey: ["client-logos"] });
    },
  });

  // Banner handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const preview = URL.createObjectURL(selectedFile);
    setPreviewUrl(preview);
    setUploadState("uploading");

    try {
      const result = await uploadMediaFile(selectedFile, { folder: "erp-bugs/banners" });
      setImageUrl(result.fileUrl);
      setUploadState("uploaded");
    } catch (err) {
      console.error(err);
      setUploadState("error");
      setPreviewUrl(null);
    }
  };

  const resetUpload = () => {
    setImageUrl("");
    setPreviewUrl(null);
    setUploadState("idle");
    setTitle("");
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreate = () => {
    if (!imageUrl.trim()) { alert("Please upload a banner image"); return; }
    createMutation.mutate({ imageUrl: imageUrl.trim(), title: title.trim() || undefined, description: description.trim() || undefined });
  };

  const handleToggleActive = (banner: Banner) => {
    updateMutation.mutate({ id: banner.id, data: { isActive: !banner.isActive } });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) deleteMutation.mutate(id);
  };

  const handleDragStart = (banner: Banner) => setDraggedBanner(banner);
  const handleDragOver = (e: React.DragEvent, targetBanner: Banner) => {
    e.preventDefault();
    if (!draggedBanner || draggedBanner.id === targetBanner.id) return;
    const newBanners = [...banners];
    const draggedIndex = newBanners.findIndex((b) => b.id === draggedBanner.id);
    const targetIndex = newBanners.findIndex((b) => b.id === targetBanner.id);
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(targetIndex, 0, draggedBanner);
    queryClient.setQueryData(["admin-banners"], { ...bannersData, data: newBanners });
  };
  const handleDragEnd = () => {
    if (draggedBanner) reorderMutation.mutate(banners.map((b) => b.id));
    setDraggedBanner(null);
  };

  // Logo handlers
  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const preview = URL.createObjectURL(selectedFile);
    setLogoPreviewUrl(preview);
    setLogoUploadState("uploading");

    try {
      const result = await uploadMediaFile(selectedFile, { folder: "erp-bugs/logos" });
      setLogoImageUrl(result.fileUrl);
      setLogoUploadState("uploaded");
    } catch (err) {
      console.error(err);
      setLogoUploadState("error");
      setLogoPreviewUrl(null);
    }
  };

  const resetLogoUpload = () => {
    setLogoImageUrl("");
    setLogoPreviewUrl(null);
    setLogoUploadState("idle");
    setLogoName("");
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
  };

  const handleCreateLogo = () => {
    if (!logoImageUrl.trim()) { alert("Please upload a logo image"); return; }
    createLogoMutation.mutate({ imageUrl: logoImageUrl.trim(), name: logoName.trim() || undefined });
  };

  const handleToggleLogoActive = (logo: ClientLogo) => {
    updateLogoMutation.mutate({ id: logo.id, data: { isActive: !logo.isActive } });
  };

  const handleDeleteLogo = (id: string) => {
    if (confirm("Are you sure you want to delete this logo?")) deleteLogoMutation.mutate(id);
  };

  const handleLogoDragStart = (logo: ClientLogo) => setDraggedLogo(logo);
  const handleLogoDragOver = (e: React.DragEvent, targetLogo: ClientLogo) => {
    e.preventDefault();
    if (!draggedLogo || draggedLogo.id === targetLogo.id) return;
    const newLogos = [...logos];
    const draggedIndex = newLogos.findIndex((l) => l.id === draggedLogo.id);
    const targetIndex = newLogos.findIndex((l) => l.id === targetLogo.id);
    newLogos.splice(draggedIndex, 1);
    newLogos.splice(targetIndex, 0, draggedLogo);
    queryClient.setQueryData(["admin-client-logos"], { ...logosData, data: newLogos });
  };
  const handleLogoDragEnd = () => {
    if (draggedLogo) reorderLogoMutation.mutate(logos.map((l) => l.id));
    setDraggedLogo(null);
  };

  return (
    <>
      <TopBar />
      <div className="w-full p-6 lg:p-8 space-y-8 bg-background min-h-screen">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Media Management</h1>
          <p className="text-muted-foreground">Manage carousel banners and client logos for your platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border">
          <button onClick={() => setActiveTab("banners")} className={`px-6 py-3 font-medium transition-all border-b-2 ${activeTab === "banners" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <div className="flex items-center gap-2"><ImageIcon size={18} /> Banners</div>
          </button>
          <button onClick={() => setActiveTab("logos")} className={`px-6 py-3 font-medium transition-all border-b-2 ${activeTab === "logos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <div className="flex items-center gap-2"><Image size={18} /> Client Logos</div>
          </button>
        </div>

        {/* Banner Tab */}
        {activeTab === "banners" && (
          <>
            {standardSize && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <Info className="text-blue-500 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-foreground">Recommended Banner Size</h3>
                  <p className="text-sm text-muted-foreground">{standardSize.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">Aspect Ratio: <span className="font-medium">{standardSize.aspectRatio}</span></p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add New Banner */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="text-primary" size={24} />
                  <h2 className="text-xl font-bold text-foreground">Add New Banner</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Banner Image <span className="text-destructive">*</span></label>
                    {!previewUrl && !imageUrl ? (
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 cursor-pointer transition-colors bg-muted/30 hover:bg-muted/50">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><ImagePlus className="text-primary" size={32} /></div>
                          <div className="text-center">
                            <p className="font-medium text-foreground">Click to upload banner image</p>
                            <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                            <p className="text-xs text-muted-foreground mt-1">Recommended: {standardSize?.width || 1920}×{standardSize?.height || 500}px</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        <img src={previewUrl || imageUrl} alt="Banner preview" className="w-full h-48 object-cover" />
                        {uploadState === "uploading" && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="flex items-center gap-2 text-white"><Loader2 className="animate-spin" size={24} /><span>Uploading...</span></div></div>}
                        {uploadState === "uploaded" && <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"><Check size={14} /> Uploaded</div>}
                        <button onClick={resetUpload} className="absolute top-2 left-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors" title="Remove image"><X size={16} /></button>
                      </div>
                    )}
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    {uploadState === "error" && <p className="text-destructive text-sm mt-2 flex items-center gap-1"><AlertCircle size={14} /> Upload failed. Please try again.</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Title (Optional)</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Banner title" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Banner description" rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                  </div>
                  <button onClick={handleCreate} disabled={!imageUrl.trim() || createMutation.isPending || uploadState === "uploading"} className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                    {createMutation.isPending ? <><Loader2 className="animate-spin" size={20} /> Adding...</> : <><Upload size={20} /> Add Banner</>}
                  </button>
                  {createMutation.isSuccess && <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-600"><Check size={20} /><span>Banner added successfully!</span></div>}
                  {createMutation.isError && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive"><AlertCircle size={20} /><span>Failed to add banner</span></div>}
                </div>
              </div>

              {/* Current Banners */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><Image className="text-primary" size={24} /><h2 className="text-xl font-bold text-foreground">Current Banners ({banners.length})</h2></div>
                  <button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-banners"] })} className="p-2 hover:bg-muted rounded-lg transition-colors"><RefreshCw size={18} /></button>
                </div>
                {isLoadingBanners ? (
                  <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
                ) : banners.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-muted-foreground"><Image size={48} className="mb-2 opacity-50" /><p>No banners yet</p><p className="text-sm">Add your first banner to get started</p></div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {banners.map((banner, index) => (
                      <div key={banner.id} draggable onDragStart={() => handleDragStart(banner)} onDragOver={(e) => handleDragOver(e, banner)} onDragEnd={handleDragEnd} className={`relative bg-muted/50 rounded-lg overflow-hidden border border-border cursor-move transition-all ${draggedBanner?.id === banner.id ? "opacity-50" : ""} ${!banner.isActive ? "opacity-60" : ""}`}>
                        <div className="flex items-center gap-3 p-3">
                          <div className="flex items-center gap-2 text-muted-foreground"><GripVertical size={18} /><span className="font-medium w-6">{index + 1}</span></div>
                          <div 
                            onClick={() => setViewingMedia({ url: banner.imageUrl, title: banner.title, description: banner.description, type: "banner" })}
                            className="relative group/thumb cursor-pointer flex-shrink-0"
                            title="Click to view full banner"
                          >
                            <img src={banner.imageUrl} alt={banner.title || `Banner ${index + 1}`} className="w-24 h-14 object-cover rounded transition-transform group-hover/thumb:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded flex items-center justify-center text-white">
                              <Maximize2 size={16} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0"><p className="font-medium text-foreground truncate">{banner.title || "Untitled Banner"}</p><p className="text-xs text-muted-foreground">{banner.width}x{banner.height || "auto"}</p></div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewingMedia({ url: banner.imageUrl, title: banner.title, description: banner.description, type: "banner" })} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Full Banner"><Maximize2 size={18} /></button>
                            <button onClick={() => handleToggleActive(banner)} className={`p-2 rounded-lg transition-colors ${banner.isActive ? "text-green-600 hover:bg-green-500/10" : "text-muted-foreground hover:bg-muted"}`} title={banner.isActive ? "Deactivate" : "Activate"}>{banner.isActive ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                            <button onClick={() => setEditingBanner(banner)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(banner.id)} disabled={deleteMutation.isPending} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {banners.length > 1 && <p className="mt-4 text-sm text-muted-foreground text-center">Drag and drop to reorder banners</p>}
              </div>
            </div>
          </>
        )}

        {/* Client Logos Tab */}
        {activeTab === "logos" && (
          <>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="text-blue-500 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-foreground">Recommended Logo Size</h3>
                <p className="text-sm text-muted-foreground">Upload company logos at <strong>200×80 pixels</strong> for optimal display. Transparent PNG format works best.</p>
                <p className="text-sm text-muted-foreground mt-1">Minimum 2 logos required to display the scrolling section on the home page.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add New Logo */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="text-primary" size={24} />
                  <h2 className="text-xl font-bold text-foreground">Add New Logo</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Logo Image <span className="text-destructive">*</span></label>
                    {!logoPreviewUrl && !logoImageUrl ? (
                      <div onClick={() => logoFileInputRef.current?.click()} className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 cursor-pointer transition-colors bg-muted/30 hover:bg-muted/50">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><ImagePlus className="text-primary" size={32} /></div>
                          <div className="text-center">
                            <p className="font-medium text-foreground">Click to upload logo image</p>
                            <p className="text-sm text-muted-foreground mt-1">PNG (transparent), JPG, SVG up to 5MB</p>
                            <p className="text-xs text-primary font-medium mt-1">Recommended: 200×80 pixels</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-border bg-white">
                        <img src={logoPreviewUrl || logoImageUrl} alt="Logo preview" className="w-full h-32 object-contain p-4" />
                        {logoUploadState === "uploading" && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="flex items-center gap-2 text-white"><Loader2 className="animate-spin" size={24} /><span>Uploading...</span></div></div>}
                        {logoUploadState === "uploaded" && <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"><Check size={14} /> Uploaded</div>}
                        <button onClick={resetLogoUpload} className="absolute top-2 left-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors" title="Remove image"><X size={16} /></button>
                      </div>
                    )}
                    <input type="file" accept="image/*" ref={logoFileInputRef} onChange={handleLogoFileSelect} className="hidden" />
                    {logoUploadState === "error" && <p className="text-destructive text-sm mt-2 flex items-center gap-1"><AlertCircle size={14} /> Upload failed. Please try again.</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Company Name (Optional)</label>
                    <input type="text" value={logoName} onChange={(e) => setLogoName(e.target.value)} placeholder="Company name" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <button onClick={handleCreateLogo} disabled={!logoImageUrl.trim() || createLogoMutation.isPending || logoUploadState === "uploading"} className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                    {createLogoMutation.isPending ? <><Loader2 className="animate-spin" size={20} /> Adding...</> : <><Upload size={20} /> Add Logo</>}
                  </button>
                  {createLogoMutation.isSuccess && <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-600"><Check size={20} /><span>Logo added successfully!</span></div>}
                  {createLogoMutation.isError && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive"><AlertCircle size={20} /><span>Failed to add logo</span></div>}
                </div>
              </div>

              {/* Current Logos */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><Image className="text-primary" size={24} /><h2 className="text-xl font-bold text-foreground">Current Logos ({logos.length})</h2></div>
                  <button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-client-logos"] })} className="p-2 hover:bg-muted rounded-lg transition-colors"><RefreshCw size={18} /></button>
                </div>
                {isLoadingLogos ? (
                  <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
                ) : logos.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-muted-foreground"><Image size={48} className="mb-2 opacity-50" /><p>No logos yet</p><p className="text-sm">Add at least 2 logos to display on home page</p></div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {logos.map((logo, index) => (
                      <div key={logo.id} draggable onDragStart={() => handleLogoDragStart(logo)} onDragOver={(e) => handleLogoDragOver(e, logo)} onDragEnd={handleLogoDragEnd} className={`relative bg-muted/50 rounded-lg overflow-hidden border border-border cursor-move transition-all ${draggedLogo?.id === logo.id ? "opacity-50" : ""} ${!logo.isActive ? "opacity-60" : ""}`}>
                        <div className="flex items-center gap-3 p-3">
                          <div className="flex items-center gap-2 text-muted-foreground"><GripVertical size={18} /><span className="font-medium w-6">{index + 1}</span></div>
                          <div 
                            onClick={() => setViewingMedia({ url: logo.imageUrl, title: logo.name, type: "logo" })}
                            className="w-20 h-12 bg-white rounded flex items-center justify-center p-1 cursor-pointer relative group/thumb flex-shrink-0"
                            title="Click to view full logo"
                          >
                            <img src={logo.imageUrl} alt={logo.name || `Logo ${index + 1}`} className="max-w-full max-h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded flex items-center justify-center text-white">
                              <Maximize2 size={14} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0"><p className="font-medium text-foreground truncate">{logo.name || "Unnamed Logo"}</p></div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewingMedia({ url: logo.imageUrl, title: logo.name, type: "logo" })} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Full Logo"><Maximize2 size={18} /></button>
                            <button onClick={() => handleToggleLogoActive(logo)} className={`p-2 rounded-lg transition-colors ${logo.isActive ? "text-green-600 hover:bg-green-500/10" : "text-muted-foreground hover:bg-muted"}`} title={logo.isActive ? "Deactivate" : "Activate"}>{logo.isActive ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                            <button onClick={() => setEditingLogo(logo)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button>
                            <button onClick={() => handleDeleteLogo(logo.id)} disabled={deleteLogoMutation.isPending} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {logos.length > 1 && <p className="mt-4 text-sm text-muted-foreground text-center">Drag and drop to reorder logos</p>}
              </div>
            </div>
          </>
        )}

        {/* Edit Banner Modal */}
        {editingBanner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Edit Banner</h3>
                <button onClick={() => setEditingBanner(null)} className="p-2 hover:bg-muted rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Image URL</label>
                  <input type="url" value={editingBanner.imageUrl} onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                  <input type="text" value={editingBanner.title || ""} onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea value={editingBanner.description || ""} onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingBanner(null)} className="flex-1 py-2 px-4 border border-border rounded-lg font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={() => updateMutation.mutate({ id: editingBanner.id, data: { imageUrl: editingBanner.imageUrl, title: editingBanner.title, description: editingBanner.description } })} disabled={updateMutation.isPending} className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Logo Modal */}
        {editingLogo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Edit Logo</h3>
                <button onClick={() => setEditingLogo(null)} className="p-2 hover:bg-muted rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Image URL</label>
                  <input type="url" value={editingLogo.imageUrl} onChange={(e) => setEditingLogo({ ...editingLogo, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
                  <input type="text" value={editingLogo.name || ""} onChange={(e) => setEditingLogo({ ...editingLogo, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingLogo(null)} className="flex-1 py-2 px-4 border border-border rounded-lg font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={() => updateLogoMutation.mutate({ id: editingLogo.id, data: { imageUrl: editingLogo.imageUrl, name: editingLogo.name } })} disabled={updateLogoMutation.isPending} className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {updateLogoMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Media Preview Modal / Lightbox */}
        {viewingMedia && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewingMedia(null)}
          >
            <div 
              className="bg-card rounded-2xl border border-border overflow-hidden max-w-4xl w-full shadow-2xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2 min-w-0">
                  <Image className="text-primary flex-shrink-0" size={20} />
                  <h3 className="font-bold text-foreground truncate">
                    {viewingMedia.title || (viewingMedia.type === "banner" ? "Banner Preview" : "Logo Preview")}
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a 
                    href={viewingMedia.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium"
                    title="Open in new tab"
                  >
                    <ExternalLink size={16} />
                    <span className="hidden sm:inline">Open Original</span>
                  </a>
                  <button 
                    onClick={() => setViewingMedia(null)} 
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    title="Close preview"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-black/40 flex items-center justify-center min-h-[250px] max-h-[65vh] overflow-auto">
                <img 
                  src={viewingMedia.url} 
                  alt={viewingMedia.title || "Full Preview"} 
                  className="max-w-full max-h-[58vh] object-contain rounded-lg shadow-lg border border-white/10"
                />
              </div>

              {viewingMedia.description && (
                <div className="p-4 bg-muted/20 border-t border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed">{viewingMedia.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
