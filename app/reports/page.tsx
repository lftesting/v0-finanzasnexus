import { HeaderWithLogout } from "@/components/header-with-logout"
import OccupancyReport from "@/components/reports/occupancy-report"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ReportsPage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <HeaderWithLogout title="Reportes" />

      <Tabs defaultValue="occupancy" className="mt-6">
        <TabsList>
          <TabsTrigger value="occupancy">Ocupación</TabsTrigger>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy" className="mt-4">
          <OccupancyReport />
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <div className="p-8 text-center text-gray-500">Reportes financieros en desarrollo</div>
        </TabsContent>

        <TabsContent value="operational" className="mt-4">
          <div className="p-8 text-center text-gray-500">Reportes operacionales en desarrollo</div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
