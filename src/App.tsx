import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import CompanyLogin from "./pages/company/CompanyLogin";
import CompanyLayout from "./layouts/CompanyLayout";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import Marketplace from "./pages/company/Marketplace";
import CreditDetail from "./pages/company/CreditDetail";
import CompanyEnquiry from "./pages/company/CompanyEnquiry";
import CompanyCertificates from "./pages/company/CompanyCertificates";
import CompanyTransactions from "./pages/company/CompanyTransactions";
import GovLogin from "./pages/gov/GovLogin";
import GovLayout from "./layouts/GovLayout";
import GovDashboard from "./pages/gov/GovDashboard";
import GovRequests from "./pages/gov/GovRequests";
import GovLedger from "./pages/gov/GovLedger";
import GovCertificates from "./pages/gov/GovCertificates";
import PublicCounter from "./pages/PublicCounter";
import NotFound from "./pages/NotFound";

import CompanyRegister from "./pages/company/CompanyRegister";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,         // consider data stale after 5s
      refetchInterval: 10000,  // poll every 10s for live sync
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/company/login" element={<CompanyLogin />} />
          <Route path="/company/register" element={<CompanyRegister />} />
          <Route path="/company" element={<CompanyLayout />}>
            <Route path="dashboard" element={<CompanyDashboard />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/:landId" element={<CreditDetail />} />
            <Route path="enquire" element={<CompanyEnquiry />} />
            <Route path="certificates" element={<CompanyCertificates />} />
            <Route path="transactions" element={<CompanyTransactions />} />
          </Route>
          <Route path="/gov/login" element={<GovLogin />} />
          <Route path="/gov" element={<GovLayout />}>
            <Route path="dashboard" element={<GovDashboard />} />
            <Route path="requests" element={<GovRequests />} />
            <Route path="ledger" element={<GovLedger />} />
            <Route path="certificates" element={<GovCertificates />} />
          </Route>
          <Route path="/credits" element={<PublicCounter />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
