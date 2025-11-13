import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, GamepadIcon, Wallet, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartDataPoint {
  date: string;
  currentWeek: number;
  lastWeek: number;
}

interface Summary {
  currentWeek: number;
  lastWeek: number;
  percentageChange: number;
}

interface AnalyticsData {
  users: {
    chartData: ChartDataPoint[];
    lastWeekChartData?: ChartDataPoint[];
    summary: Summary;
  };
  matches: {
    chartData: ChartDataPoint[];
    lastWeekChartData?: ChartDataPoint[];
    summary: Summary;
  };
  revenue: {
    chartData: ChartDataPoint[];
    lastWeekChartData?: ChartDataPoint[];
    summary: Summary;
  };
  addMoney: {
    chartData: ChartDataPoint[];
    lastWeekChartData?: ChartDataPoint[];
    summary: Summary;
  };
  payout: {
    chartData: ChartDataPoint[];
    lastWeekChartData?: ChartDataPoint[];
    summary: Summary;
  };
}

const DashboardAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line'>('line');
  const [selectedWeek, setSelectedWeek] = useState<'current' | 'last'>('current');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard-analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const SummaryCard = ({ 
    title, 
    icon: Icon, 
    summary, 
    formatValue 
  }: { 
    title: string; 
    icon: React.ElementType; 
    summary: Summary;
    formatValue?: (value: number) => string;
  }) => {
    const isPositive = summary.percentageChange >= 0;
    const displayValue = selectedWeek === 'current' 
      ? (formatValue ? formatValue(summary.currentWeek) : summary.currentWeek.toString())
      : (formatValue ? formatValue(summary.lastWeek) : summary.lastWeek.toString());
    const comparisonValue = selectedWeek === 'current'
      ? (formatValue ? formatValue(summary.lastWeek) : summary.lastWeek.toString())
      : (formatValue ? formatValue(summary.currentWeek) : summary.currentWeek.toString());
    const comparisonLabel = selectedWeek === 'current' ? 'Last week' : 'Current week';
    
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
          <Icon className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{displayValue}</div>
          {selectedWeek === 'current' && (
            <div className="flex items-center mt-2 text-xs">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {formatPercentage(summary.percentageChange)} from last week
              </span>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {comparisonLabel}: {comparisonValue}
          </p>
        </CardContent>
      </Card>
    );
  };

  const MetricChart = ({ 
    title, 
    data, 
    summary, 
    formatValue,
    color = '#3b82f6'
  }: { 
    title: string; 
    data: {
      chartData: ChartDataPoint[];
      lastWeekChartData?: ChartDataPoint[];
    }; 
    summary: Summary;
    formatValue?: (value: number) => string;
    color?: string;
  }) => {
    const chartConfig = {
      currentWeek: {
        label: 'Current Week',
        color: color,
      },
      lastWeek: {
        label: 'Last Week',
        color: '#6b7280',
      },
    };

    // Filter data based on selected week
    // If last week is selected and we have lastWeekChartData, use that (14 days)
    // Otherwise use the regular data
    const dataToUse = selectedWeek === 'last' && data.lastWeekChartData 
      ? data.lastWeekChartData 
      : data.chartData;
    
    // Calculate percentage change for each day compared to previous day
    const calculateDayOverDayChange = (dataArray: ChartDataPoint[], key: 'currentWeek' | 'lastWeek') => {
      return dataArray.map((item, index) => {
        const currentValue = item[key] || 0;
        const previousValue = index > 0 ? (dataArray[index - 1][key] || 0) : 0;
        
        let percentageChange = 0;
        if (index === 0) {
          // First day, no comparison
          percentageChange = 0;
        } else if (previousValue > 0) {
          percentageChange = ((currentValue - previousValue) / previousValue) * 100;
        } else if (currentValue > 0 && previousValue === 0) {
          percentageChange = 100; // New data, 100% increase
        } else if (currentValue === 0 && previousValue > 0) {
          percentageChange = -100; // Complete drop
        }
        
        return {
          ...item,
          dayOverDayChange: percentageChange,
          previousValue
        };
      });
    };
    
    const dataWithChanges = selectedWeek === 'current'
      ? calculateDayOverDayChange(dataToUse, 'currentWeek').map((item: any) => {
          const dayChange = item.dayOverDayChange ?? 0;
          return {
            date: formatDate(item.date),
            currentWeek: item.currentWeek || 0,
            lastWeek: 0,
            dayOverDayChange: dayChange
          };
        })
      : calculateDayOverDayChange(dataToUse, 'lastWeek').map((item: any) => {
          const dayChange = item.dayOverDayChange ?? 0;
          return {
            date: formatDate(item.date),
            currentWeek: 0,
            lastWeek: item.lastWeek || 0,
            dayOverDayChange: dayChange
          };
        });
    
    const filteredData = dataWithChanges;

    const displaySummary = selectedWeek === 'current' 
      ? summary.currentWeek 
      : summary.lastWeek;
    const displayPercentage = selectedWeek === 'current'
      ? summary.percentageChange
      : -summary.percentageChange; // Invert for last week view

    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {formatValue ? formatValue(displaySummary) : displaySummary} 
                {selectedWeek === 'current' && (
                  <span className={displayPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {' '}({formatPercentage(displayPercentage)})
                  </span>
                )}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] [&_.recharts-cartesian-axis-tick-value]:fill-white [&_.recharts-cartesian-axis-tick_text]:fill-white [&_text]:fill-white">
            {chartType === 'bar' ? (
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff"
                  tick={{ fill: '#ffffff', fontSize: 12, stroke: '#ffffff' }}
                  style={{ fill: '#ffffff', color: '#ffffff' }}
                  className="text-white"
                />
                <YAxis 
                  stroke="#ffffff"
                  tick={{ fill: '#ffffff', fontSize: 12, stroke: '#ffffff' }}
                  style={{ fill: '#ffffff', color: '#ffffff' }}
                  className="text-white"
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white [&_.text-muted-foreground]:text-gray-300 [&_.text-foreground]:text-white" 
                    />
                  }
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                {selectedWeek === 'current' ? (
                  <>
                    <ChartLegend 
                      content={
                        <ChartLegendContent 
                          className="text-white [&_.text-muted-foreground]:text-gray-300" 
                        />
                      }
                      wrapperStyle={{ color: '#ffffff' }}
                    />
                    <Bar 
                      dataKey="currentWeek" 
                      fill={color}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList 
                        dataKey="currentWeek"
                        position="top"
                        fill="#ffffff"
                        fontSize={11}
                        content={(props: any) => {
                          if (!props) return null;
                          const value = props.value || props.payload?.currentWeek || 0;
                          if (value <= 0) return null;
                          
                          const { x, y, width, payload } = props;
                          const change = payload?.dayOverDayChange ?? 0;
                          const changeText = change !== 0 
                            ? ` (${change >= 0 ? '+' : ''}${change.toFixed(1)}%)`
                            : '';
                          
                          return (
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={Number(y) - 5}
                              fill="#ffffff"
                              fontSize={11}
                              textAnchor="middle"
                              dominantBaseline="bottom"
                            >
                              {`${value}${changeText}`}
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  </>
                ) : (
                  <>
                    <ChartLegend 
                      content={
                        <ChartLegendContent 
                          className="text-white [&_.text-muted-foreground]:text-gray-300" 
                        />
                      }
                      wrapperStyle={{ color: '#ffffff' }}
                    />
                    <Bar 
                      dataKey="lastWeek" 
                      fill="#6b7280"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList 
                        dataKey="lastWeek"
                        position="top"
                        fill="#ffffff"
                        fontSize={11}
                        content={(props: any) => {
                          if (!props) return null;
                          const value = props.value || props.payload?.lastWeek || 0;
                          if (value <= 0) return null;
                          
                          const { x, y, width, payload } = props;
                          const change = payload?.dayOverDayChange ?? 0;
                          const changeText = change !== 0 
                            ? ` (${change >= 0 ? '+' : ''}${change.toFixed(1)}%)`
                            : '';
                          
                          return (
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={Number(y) - 5}
                              fill="#ffffff"
                              fontSize={11}
                              textAnchor="middle"
                              dominantBaseline="bottom"
                            >
                              {`${value}${changeText}`}
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  </>
                )}
              </BarChart>
            ) : (
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff"
                  tick={{ fill: '#ffffff', fontSize: 12, stroke: '#ffffff' }}
                  style={{ fill: '#ffffff', color: '#ffffff' }}
                  className="text-white"
                />
                <YAxis 
                  stroke="#ffffff"
                  tick={{ fill: '#ffffff', fontSize: 12, stroke: '#ffffff' }}
                  style={{ fill: '#ffffff', color: '#ffffff' }}
                  className="text-white"
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white [&_.text-muted-foreground]:text-gray-300 [&_.text-foreground]:text-white" 
                    />
                  }
                />
                {selectedWeek === 'current' ? (
                  <>
                    <ChartLegend 
                      content={
                        <ChartLegendContent 
                          className="text-white [&_.text-muted-foreground]:text-gray-300" 
                        />
                      }
                      wrapperStyle={{ color: '#ffffff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="currentWeek" 
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, r: 4 }}
                    />
                  </>
                ) : (
                  <>
                    <ChartLegend 
                      content={
                        <ChartLegendContent 
                          className="text-white [&_.text-muted-foreground]:text-gray-300" 
                        />
                      }
                      wrapperStyle={{ color: '#ffffff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lastWeek" 
                      stroke="#6b7280"
                      strokeWidth={2}
                      dot={{ fill: '#6b7280', r: 4 }}
                    />
                  </>
                )}
              </LineChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-400 mb-4">{error}</div>
        <Button onClick={fetchAnalytics} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Week Filter and Chart Type Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-1">
          <Button
            variant={selectedWeek === 'current' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedWeek('current')}
            className={selectedWeek === 'current' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}
          >
            Current Week
          </Button>
          <Button
            variant={selectedWeek === 'last' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedWeek('last')}
            className={selectedWeek === 'last' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}
          >
            Last Week
          </Button>
        </div>
        <div className="flex gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-1">
          <Button
            variant={chartType === 'bar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType('bar')}
            className={chartType === 'bar' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}
          >
            Bar
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType('line')}
            className={chartType === 'line' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}
          >
            Line
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Users"
          icon={Users}
          summary={analyticsData.users.summary}
        />
        <SummaryCard
          title="Total Matches"
          icon={GamepadIcon}
          summary={analyticsData.matches.summary}
        />
        <SummaryCard
          title="Total Revenue"
          icon={DollarSign}
          summary={analyticsData.revenue.summary}
          formatValue={formatCurrency}
        />
        <SummaryCard
          title="Add Money"
          icon={Wallet}
          summary={analyticsData.addMoney.summary}
          formatValue={formatCurrency}
        />
        <SummaryCard
          title="Payout"
          icon={ArrowUpDown}
          summary={analyticsData.payout.summary}
          formatValue={formatCurrency}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricChart
          title="Users Growth"
          data={analyticsData.users}
          summary={analyticsData.users.summary}
          color="#3b82f6"
        />
        <MetricChart
          title="Matches Created"
          data={analyticsData.matches}
          summary={analyticsData.matches.summary}
          color="#10b981"
        />
        <MetricChart
          title="Revenue"
          data={analyticsData.revenue}
          summary={analyticsData.revenue.summary}
          formatValue={formatCurrency}
          color="#f59e0b"
        />
        <MetricChart
          title="User Deposits (Add Money)"
          data={analyticsData.addMoney}
          summary={analyticsData.addMoney.summary}
          formatValue={formatCurrency}
          color="#8b5cf6"
        />
        <MetricChart
          title="User Withdrawals (Payout)"
          data={analyticsData.payout}
          summary={analyticsData.payout.summary}
          formatValue={formatCurrency}
          color="#ef4444"
        />
      </div>
    </div>
  );
};

export default DashboardAnalytics;

