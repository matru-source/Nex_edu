import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import StudentCourseCard from "../Cards/StudentCourseCard";
import useRouter from "../../../hooks/useRouter";

interface TopCoursesResponse extends Response {
  data: ({
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    categoryId: string;
    published: boolean;
    subCategoryId: string;
    tumbnailUrl: string | null;
  } & {
    category: {
      id: string;
      description: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      updatedBy: string | null;
      name: string;
    };
    subCategory: {
      id: string;
      description: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      updatedBy: string | null;
      name: string;
      categoryId: string;
    };
  })[];
}

export default function TopCourses() {
  const router = useRouter();

  const getTopCourses = useQuery({
    queryKey: ["top-courses"],
    queryFn: async () => {
      const res = await api.get<TopCoursesResponse>(
        API_ROUTES.COURSE.GET_TOP_COURSES
      );
      return res.data;
    },
  });

  const handleCardClick = (courseId: string, courseTitle: string) => {
    router.push(`/course/${courseId}`, courseTitle);
  };

  if (getTopCourses.data?.data.length === 0) {
    return <div className="w-full">No courses available</div>;
  }

  return (
    <div className="w-full flex flex-col my-12 gap-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Ready to enter the Real Business World?
        </h2>
        <div className="text-gray-400 text-sm">
          Explore and scale up your Business Acumen Skills through the gateways that matches with your knowledge, aspiration and dream
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {getTopCourses.data?.data.map((course) => (
          <StudentCourseCard
            key={course.id}
            course={course as any}
            onCardClick={() => handleCardClick(course.id, course.title)}
          />
        ))}
      </div>
    </div>
  );
}
