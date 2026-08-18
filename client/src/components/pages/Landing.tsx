import BentoSection from "../ui/Landing/BentoSection";
import CollabrationScroll from "../ui/Landing/CollabrationScroll";
import CourseLevelsSection from "../ui/Landing/CourseLevelsSection";
import CoursesSection from "../ui/Landing/CoursesSection";
import Footer from "../ui/Landing/Footer";
import GetInTouch from "../ui/Landing/GetInTouch";
import NavBar from "../ui/Landing/NavBar";
import SlideShow from "../ui/Landing/SlideShow";
import SuccessStories from "../ui/Landing/SucessStories";

export default function Landing() {
  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <NavBar />
      <div className="w-full mx-auto max-w-[1444px] px-12">
        <div className="py-8 mt-2">
          <SlideShow />
        </div>
        <CoursesSection />
        <CourseLevelsSection />
        <BentoSection />
        
        <div>
          <CollabrationScroll />
        </div>
        <div>
          <SuccessStories />
        </div>
        <GetInTouch />
      </div>
      <Footer />
    </main>
  );
}