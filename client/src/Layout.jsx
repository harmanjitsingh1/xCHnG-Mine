import { Outlet } from "react-router-dom";
import Header from "@/components/common/Header.jsx";
import { Tabs } from "@/components/common/Tabs.jsx";

function Layout() {
  return (
    <>
      <Header />
      {/* min-h-screen  */}
      <main className="px-4">
        <Outlet />
      </main>
      <div className="md:hidden">
        <Tabs />
      </div>
    </>
  );
}

export default Layout;
