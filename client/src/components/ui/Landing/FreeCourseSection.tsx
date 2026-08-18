import CourseCard from "../Cards/CourseCard";

const sampleCourse = {
  id: "1",
  title: "Complete React Developer Course with Hooks and Context",
  description:
    "Learn React from scratch. Build projects, learn hooks, context, and more. Become a React expert with this comprehensive course.",
  image:
    "https://img.freepik.com/free-psd/e-learning-horizontal-banner-template-with-geometric-shapes_23-2149433275.jpg",
  category: "Development",
  subcategory: "Web Development",
  rating: 4.7,
  reviewCount: 1245,
  updatedAt: "2 weeks ago",
  duration: "12 hours",
  price: 89.99,
  originalPrice: 129.99,
  isFeatured: true,
  level: "Intermediate" as const,
};
const sampleCourse2 = {
  id: "1",
  title: "English Language Mastery: From Beginner to Pro",
  description:
    "Learn React from scratch. Build projects, learn hooks, context, and more. Become a React expert with this comprehensive course.",
  image:
    "https://images.all-free-download.com/images/graphiclarge/language_course_banner_template_elegant_realistic_boy_6932480.jpg",
  category: "Development",
  subcategory: "Web Development",
  rating: 4.7,
  reviewCount: 1245,
  updatedAt: "2 weeks ago",
  duration: "12 hours",
  price: 89.99,
  originalPrice: 129.99,
  isFeatured: true,
  level: "Intermediate" as const,
};

export default function FreeCoursesSection() {
  const handleCardClick = (courseId: string) => {
    console.log("Course clicked:", courseId);
  };
  return (
    <div className="w-full flex flex-col my-12 gap-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
          All the skills you need in one place
        </h2>
        <div className="text-[var(--color-muted-foreground)] text-sm">
          From critical skills to technical topics, Udemy supports your
          professional development.
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <CourseCard
          course={sampleCourse}
          onCardClick={handleCardClick}
          className="mb-4"
        />
        <CourseCard
          course={sampleCourse2}
          onCardClick={handleCardClick}
          className="mb-4"
        />
        <CourseCard
          course={sampleCourse}
          onCardClick={handleCardClick}
          className="mb-4"
        />
        <CourseCard
          course={sampleCourse2}
          onCardClick={handleCardClick}
          className="mb-4"
        />
      </div>
    </div>
  );
}
