import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { downloadResults } from "@/services/api";

const Results = () => {
  const { results, stats, taskId } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getSentimentBadge = (label: number) => {
    const sentiments = [
      { label: "Негативная", className: "bg-sentiment-negative text-sentiment-negative-foreground" },
      { label: "Нейтральная", className: "bg-sentiment-neutral text-sentiment-neutral-foreground" },
      { label: "Позитивная", className: "bg-sentiment-positive text-sentiment-positive-foreground" },
    ];
    return sentiments[label] || sentiments[1];
  };

  const sources = useMemo(() => {
    if (!results) return [];
    return [...new Set(results.map(r => r.src).filter(Boolean))];
  }, [results]);

  const filteredData = useMemo(() => {
    if (!results) return [];
    return results.filter(item => {
      if (searchQuery && !item.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (labelFilter !== "all" && item.label !== parseInt(labelFilter)) return false;
      if (sourceFilter !== "all" && item.src !== sourceFilter) return false;
      return true;
    });
  }, [results, searchQuery, labelFilter, sourceFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Нет данных</h2>
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
        <div className="flex justify-between items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-1">Результаты анализа</h1>
            <p className="text-muted-foreground">Главная / Результаты</p>
          </div>
          <Button className="gap-2" onClick={() => taskId && downloadResults(taskId)}>
            <Download className="w-4 h-4" />
            Скачать CSV
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-in hover-lift">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Поиск по текстам..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <Select value={labelFilter} onValueChange={(v) => { setLabelFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Тональность" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все тональности</SelectItem>
                      <SelectItem value="0">Негативная</SelectItem>
                      <SelectItem value="1">Нейтральная</SelectItem>
                      <SelectItem value="2">Позитивная</SelectItem>
                    </SelectContent>
                  </Select>
                  {sources.length > 0 && (
                    <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setCurrentPage(1); }}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Источник" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все источники</SelectItem>
                        {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Текст</TableHead>
                        <TableHead>Источник</TableHead>
                        <TableHead>Тональность</TableHead>
                        <TableHead>Уверенность</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((row, idx) => {
                        const sentiment = getSentimentBadge(row.label);
                        return (
                          <TableRow key={idx}>
                            <TableCell className="font-medium max-w-md">
                              <span className="line-clamp-2">{row.text}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{row.src || '-'}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={sentiment.className}>{sentiment.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden w-16">
                                  <div className="bg-primary h-full" style={{ width: `${row.confidence * 100}%` }} />
                                </div>
                                <span className="text-sm font-medium w-12">
                                  {(row.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Показано {paginatedData.length} из {filteredData.length} записей
                  </p>
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm px-2">{currentPage} / {totalPages || 1}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="animate-fade-in hover-lift">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Статистика</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold">{stats?.total || results.length}</p>
                    <p className="text-sm text-muted-foreground">Всего проанализировано</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover-lift">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Распределение</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-sentiment-negative" />
                      Негативных
                    </span>
                    <span className="font-semibold">
                      {stats?.negative || 0} ({stats ? ((stats.negative / stats.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-sentiment-neutral" />
                      Нейтральных
                    </span>
                    <span className="font-semibold">
                      {stats?.neutral || 0} ({stats ? ((stats.neutral / stats.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-sentiment-positive" />
                      Позитивных
                    </span>
                    <span className="font-semibold">
                      {stats?.positive || 0} ({stats ? ((stats.positive / stats.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
