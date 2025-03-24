
import { ImageCountProvider } from "@/context/ImageCountContext";
import { SidebarProvider } from "@/context/SidebarContext";
import DashboardLayout from "@/layouts/dashboardLayout";


export default function Layout({ children }) {

  return(
    <ImageCountProvider>   
      <SidebarProvider>
      <DashboardLayout>{children}</DashboardLayout>;
    </SidebarProvider>
    </ImageCountProvider>
 
  )
  
}
