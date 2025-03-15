
import { SidebarProvider } from "@/context/SidebarContext";
import DashboardLayout from "@/layouts/dashboardLayout";


export default function Layout({ children }) {

  return(
    <SidebarProvider>
      <DashboardLayout>{children}</DashboardLayout>;
    </SidebarProvider>
  )
  
}
