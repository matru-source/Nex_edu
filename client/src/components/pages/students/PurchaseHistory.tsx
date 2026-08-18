import { useQuery } from "@tanstack/react-query";
import TopBar from "../../lazy/TopBar";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { Response } from "../../../types";
import { Calendar, DollarSign, BookOpen, CheckCircle2, Play } from "lucide-react";
import useRouter from "../../../hooks/useRouter";

interface Purchase {
  id: string;
  amount: number;
  purchaseAt: string;
  chapter: {
    id: string;
    title: string;
    module: {
      expertise: {
        skillCategory: {
          course: {
            id: string;
            title: string;
            category: { name: string };
            subCategory: { name: string };
          };
        };
      };
    };
  };
}

interface PurchaseHistoryResponse extends Response {
  data: Purchase[];
}

export default function PurchaseHistory() {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: async () => {
      const res = await api.get<PurchaseHistoryResponse>(
        API_ROUTES.PURCHASE.GET_MY_PURCHASES
      );
      return res.data;
    },
  });

  const purchases = data?.data || [];

  if (isLoading) {
    return (
      <div className="w-full">
        <TopBar />
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <TopBar />
        <div className="p-8">
          <div className="text-center py-12">
            <div className="text-destructive text-lg mb-4">
              Failed to load purchase history
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="w-full min-h-screen bg-background">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Purchase History
          </h1>
          <p className="text-muted-foreground">
            View all your course chapter purchases
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-foreground">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                Total Purchases
              </p>
              <p className="text-3xl font-bold text-primary">
                {purchases.length}
              </p>
            </div>
          </div>
        </div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Purchases Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start learning by purchasing course chapters
            </p>
            <button
              onClick={() => router.push("/dashboard", "Explore Courses")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {purchase.chapter.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {
                        purchase.chapter.module.expertise.skillCategory.course
                          .title
                      }
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(purchase.purchaseAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {
                            purchase.chapter.module.expertise.skillCategory
                              .course.category.name
                          }
                        </span>
                        <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                          {
                            purchase.chapter.module.expertise.skillCategory
                              .course.subCategory.name
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-foreground">
                        ${purchase.amount.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/course/lessons/${purchase.chapter.id}`,
                          purchase.chapter.title
                        )
                      }
                      className="flex gap-2 items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 hover:shadow-lg transition-all duration-200"
                    >
                      <Play size={16} />
                      Go to Lessons
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
