import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type {
  Material,
  MaterialQueryResponse,
  Lessons,
} from "../../../../types";
import {
  FileText,
  Video,
  Image,
  Code,
  Link,
  Eye,
} from "lucide-react";
import MaterialViewerModal from "../MaterialViewerModal";

interface MaterialsProps {
  currentLesson: Lessons;
}

const MATERIAL_ICONS: Record<string, React.ReactNode> = {
  PDF: <FileText size={20} className="text-red-500" />,
  DOCUMENT: <FileText size={20} className="text-blue-500" />,
  PRESENTATION: <FileText size={20} className="text-orange-500" />,
  VIDEO: <Video size={20} className="text-purple-500" />,
  AUDIO: <FileText size={20} className="text-green-500" />,
  IMAGE: <Image size={20} className="text-pink-500" />,
  CODE: <Code size={20} className="text-indigo-500" />,
  LINK: <Link size={20} className="text-yellow-500" />,
  OTHER: <FileText size={20} className="text-gray-500" />,
};

export default function Materials({ currentLesson }: MaterialsProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const materialsQuery = useQuery({
    queryKey: ["lesson-materials", currentLesson.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("lessonId", currentLesson.id);

      const res = await api.get<MaterialQueryResponse>(
        `${API_ROUTES.MATERIAL.GET_BY_LEVEL}?${params}`
      );
      return res.data;
    },
  });

  const materials = materialsQuery.data?.data || [];

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  if (materialsQuery.isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm mt-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm mt-6 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Learning Materials
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText
            size={48}
            className="text-muted-foreground mb-4 opacity-50"
          />
          <p className="text-muted-foreground">
            No materials available for this lesson
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm mt-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-primary/10">
          <h3 className="text-lg font-semibold text-foreground">
            Learning Materials
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {materials.length} {materials.length === 1 ? "material" : "materials"}{" "}
            available
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {MATERIAL_ICONS[material.materialType] ||
                      MATERIAL_ICONS.OTHER}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {material.title}
                    </h4>
                    {material.description && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {material.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {material.fileSize && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(material.fileSize)}
                        </span>
                      )}
                      {material.isRequired && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {material.externalUrl || material.fileUrl ? (
                    <button
                      onClick={() => setSelectedMaterial(material)}
                      className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium"
                      title="View material"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Material Viewer Modal */}
      <MaterialViewerModal
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        material={selectedMaterial}
      />
    </>
  );
}
