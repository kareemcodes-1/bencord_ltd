import { getRevenueChart } from "@/actions/admin/revenue-chart.actions";
import {
  getOrders,
  getTotalRevenue,
} from "@/actions/admin/order.actions";

import { SectionCards } from "@/app/components/dashboard/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { getTrafficSources } from "@/actions/admin/traffic-source.actions";
import { TrafficSources } from "@/app/components/dashboard/traffic-sources";
import { getTopCountries } from "@/actions/admin/top-countries.actions";
import { TopCountries } from "@/app/components/dashboard/top-countries";
import { getTopProducts } from "@/actions/admin/top-products.actions";
import { TopSellingProducts } from "@/app/components/dashboard/top-selling-products";

const DashboardPage = async () => {
const [
  ordersResult,
  totalRevenue,
  revenueChart,
  trafficSources,
  topCountries,
  topProducts,
] = await Promise.all([

  getOrders({
    page: 1,
    limit: 1,
  }),

  getTotalRevenue(),

  getRevenueChart("today"),

  getTrafficSources(),

  getTopCountries(),

  getTopProducts(),
]);

  const totalOrders = ordersResult.pagination.total;

  return (
    <main className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
        {/* Dashboard Overview */}
        <SectionCards
          totalOrders={totalOrders}
          revenue={totalRevenue}
        />

        {/* Revenue Chart */}
        <div className="">
          <ChartAreaInteractive initialData={revenueChart} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TrafficSources initialData={trafficSources} />

            <TopCountries initialData={topCountries} />
        </div>

        <div className="">
  <TopSellingProducts initialData={topProducts} />
</div>
      </div>
    </main>
  );
};

export default DashboardPage;