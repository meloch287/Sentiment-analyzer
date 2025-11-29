import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { validateFile, type ValidationMetrics } from "@/services/api";

const Validation = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Неверный формат файла",
          description: "Пожалуйста, загрузите CSV файл",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setMetrics(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const result = await validateFile(file);
      setMetrics(result);
      toast({
        title: "Валидация завершена",
        description: `Macro-F1: ${(result.macro_f1 * 100).toFixed(2)}%`,
      });
    } catch (err: any) {
      toast({
        title: "Ошибка валидации",
        description: err.response?.data?.detail || "Проверьте формат файла",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.75) return "text-green-500";
    if (score >= 0.65) return "text-yellow-500";
    return "text-red-500";
  };

  const classNames = ["Негативная", "Нейтральная", "Позитивная"];

  const classMetrics = metrics ? classNames.map((name, i) => ({
    name,
    precision: metrics.precision[i] || 0,
    recall: metrics.recall[i] || 0,
    f1: metrics.precision[i] && metrics.recall[i] 
      ? (2 * metrics.precision[i] * metrics.recall[i]) / (metrics.precision[i] + metrics.recall[i])
      : 0,
  })) : [];

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Валидация модели</h1>
          <p className="text-muted-foreground">
            Оценка качества классификации на размеченных данных
          </p>
        </div>

        <Card className="mb-6 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Загрузить тестовые данные</CardTitle>
            <CardDescription>
              CSV файл должен содержать колонки: label (предсказание) и true_label (истинная метка)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => document.getElementById("validation-file-input")?.click()}
              >
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg mb-2 font-medium">
                  Выберите CSV файл с истинными метками
                </p>
                <input
                  id="validation-file-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setFile(null); setMetrics(null); }}
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {!metrics && (
                  <Button onClick={handleValidate} className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Валидация...
                      </>
                    ) : (
                      "Начать валидацию"
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {metrics && (
          <>
            <Card className="mb-6 animate-fade-in hover-lift bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="text-sm text-muted-foreground mb-2">Macro-F1 Score</p>
                  <p className={`text-5xl font-bold ${getScoreColor(metrics.macro_f1)}`}>
                    {(metrics.macro_f1 * 100).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 animate-fade-in hover-lift">
              <CardHeader>
                <CardTitle>Метрики по классам</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Класс</TableHead>
                      <TableHead>Precision</TableHead>
                      <TableHead>Recall</TableHead>
                      <TableHead>F1-Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classMetrics.map((cls, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{(cls.precision * 100).toFixed(1)}%</TableCell>
                        <TableCell>{(cls.recall * 100).toFixed(1)}%</TableCell>
                        <TableCell className={getScoreColor(cls.f1)}>
                          {(cls.f1 * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {metrics.confusion_matrix && (
              <Card className="animate-fade-in hover-lift">
                <CardHeader>
                  <CardTitle>Матрица ошибок</CardTitle>
                  <CardDescription>
                    Строки: истинные метки, Столбцы: предсказанные метки
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="p-2 text-left text-sm font-medium text-muted-foreground"></th>
                          <th className="p-2 text-center text-sm font-medium">Негатив</th>
                          <th className="p-2 text-center text-sm font-medium">Нейтрал</th>
                          <th className="p-2 text-center text-sm font-medium">Позитив</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.confusion_matrix.map((row, i) => (
                          <tr key={i}>
                            <td className="p-2 text-sm font-medium">
                              {["Негатив", "Нейтрал", "Позитив"][i]}
                            </td>
                            {row.map((val, j) => {
                              const total = row.reduce((a, b) => a + b, 0);
                              const intensity = total > 0 ? val / total : 0;
                              return (
                                <td
                                  key={j}
                                  className={`p-4 text-center font-semibold text-lg ${i === j ? 'bg-green-500/20' : 'bg-muted'}`}
                                  style={{
                                    opacity: 0.5 + intensity * 0.5,
                                  }}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Validation;
