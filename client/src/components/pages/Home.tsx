import useInitNavStackOnce from "../../hooks/useInitNavstack";
import TopBar from "../lazy/TopBar";
import Dashboard from "../ui/Dashboard/Dashboard";

export default function Home() {
  useInitNavStackOnce([{ title: 'Explore Courses', path: '/dashboard' }]);
  return (
    <div className="w-full">
      <TopBar />
      <Dashboard />
    </div>
  )
}