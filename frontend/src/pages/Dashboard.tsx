import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useStore } from "@/store/useStore";

const COLORS = {
  negative: "hsl(0, 84%, 60%)",
  neutral: "hsl(220, 9%, 46%)",
  positive: "hsl(142, 71%, 45%)",
};

const Dashboard = () => {
  const { results, stats } = useStore();

  const sentimentData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Негативные", value: stats.negative, color: COLORS.negative },
      { name: "Нейтральные", value: stats.neutral, color: COLORS.neutral },
      { name: "Позитивные", value: stats.positive, color: COLORS.positive },
    ];
  }, [stats]);

  const sourceData = useMemo(() => {
    if (!results) return [];
    const counts: Record<string, number> = {};
    results.forEach(r => {
      const src = r.src || 'Неизвестно';
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [results]);

  const avgConfidence = useMemo(() => {
    if (!results || results.length === 0) return 0;
    return results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  }, [results]);

  const totalReviews = stats?.total || 0;

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Нет данных для визуализации</h2>
              <p className="text-muted-foreground mb-4">
                Сначала загрузите и проанализируйте CSV файл
              </p>
              <Button asChild>
                <Link to="/upload">Загрузить файл</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Визуализация результатов</h1>
          <p className="text-muted-foreground">
            Интерактивные графики и статистика анализа
          </p>
        </div>

        <div className="grid gap-6">
          {/* Metrics Row */}
          <div className="grid md:grid-cols-4 gap-4 animate-fade-in">
            <Card className="hover-lift">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Всего отзывов</p>
                <p className="text-3xl font-bold">{totalReviews}</p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Средняя уверенность</p>
                <p className="text-3xl font-bold">{(avgConfidence * 100).toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Позитивных</p>
                <p className="text-3xl font-bold text-green-500">{stats?.positive || 0}</p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Негативных</p>
                <p className="text-3xl font-bold text-red-500">{stats?.negative || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="animate-fade-in hover-lift">
              <CardHeader>
                <CardTitle>Распределение тональности</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover-lift">
              <CardHeader>
                <CardTitle>Отзывы по источникам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="source" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card className="animate-fade-in hover-lift">
            <CardHeader>
              <CardTitle>Детальная статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {sentimentData.map((sentiment, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{sentiment.name}</h4>
                      <span className="text-2xl font-bold">{sentiment.value}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${totalReviews > 0 ? (sentiment.value / totalReviews) * 100 : 0}%`,
                          backgroundColor: sentiment.color
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {totalReviews > 0 ? ((sentiment.value / totalReviews) * 100).toFixed(1) : 0}% от общего числа
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
