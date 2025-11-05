import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  GamepadIcon,
  DollarSign,
  LogOut,
  Menu,
  Image,
  Trophy,
  Mail,
  History,
  Smartphone,
  KeyRound,
  AlertCircle
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    navigate("/al-admin-128900441");
  };

  return (
    <div className="min-h-screen bg-[#121212] flex">
      {/* Sidebar */}
      <aside style={{ height: '100%', overflow: 'auto' }} className={`bg-[#1A1A1A] h-screen ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 fixed left-0 top-0`}>
        <div className="p-4 border-b border-[#2A2A2A] flex justify-between items-center">
          <h4 className={`text-white font-bold ${isSidebarOpen ? 'block' : 'hidden'}`}>Admin Panel</h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-white hover:bg-[#2A2A2A]"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <nav className="p-2 space-y-1">
          <NavLink
            to="/al-dashboard-1289"
            end
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Dashboard</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/banner"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <Image className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Banner</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/matches"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <GamepadIcon className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Matches</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/game-types"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <GamepadIcon className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Game Types</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/game-modes"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <GamepadIcon className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Game Modes</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/users"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <Users className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Users</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/nft-holders"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <Trophy className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">NFT Holders</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/contact-messages"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <Mail className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Contact Messages</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/revenue"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <DollarSign className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Revenue</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/all-transactions"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <History className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">All Transactions</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/apk-management"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <Smartphone className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">APK Management</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/announcement-send"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <KeyRound className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Announcement Send</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/html-announcements"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <AlertCircle className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">HTML Announcements</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/blog"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <AlertCircle className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Blog</span>}
          </NavLink>

          <NavLink
            to="/al-dashboard-1289/sitemap"
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] rounded ${
                isActive ? 'bg-[#2A2A2A]' : ''
              }`
            }
          >
            <AlertCircle className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Sitemap</span>}
          </NavLink>

          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-red-500 hover:text-red-400 hover:bg-[#2A2A2A]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

