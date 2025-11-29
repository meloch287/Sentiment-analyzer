import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { uploadFile, getResults } from "@/services/api";
import { useStore } from "@/store/useStore";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading, setLoading, progress, setProgress, setTaskId, setResults, setStats } = useStore();

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
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.csv')) {
        toast({
          title: "Неверный формат файла",
          description: "Пожалуйста, загрузите CSV файл",
          variant: "destructive",
        });
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    setProgress({ current: 0, total: 0 });
    
    try {
      const { task_id } = await uploadFile(file);
      setTaskId(task_id);
      toast({ title: "Анализ запущен", description: "Обработка данных..." });

      const poll = async () => {
        try {
          const result = await getResults(task_id);
          if (result.status === 'processing') {
            setProgress({ current: result.progress || 0, total: result.total || 0 });
            setTimeout(poll, 1000);
          } else {
            setResults(result.data || null);
            setStats(result.stats || null);
            setLoading(false);
            toast({ title: "Анализ завершён", description: "Результаты готовы к просмотру" });
            navigate("/results");
          }
        } catch (err) {
          console.error(err);
          setTimeout(poll, 2000);
        }
      };
      poll();
    } catch (err: any) {
      toast({
        title: "Ошибка загрузки",
        description: err.response?.data?.detail || "Не удалось загрузить файл",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Загрузка данных</h1>
          <p className="text-muted-foreground">
            Загрузите CSV файл с отзывами для анализа тональности
          </p>
        </div>

        <Card className="animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Выберите файл</CardTitle>
            <CardDescription>
              Формат: CSV | Обязательные колонки: text, src
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <UploadIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg mb-2 font-medium">
                  Перетащите CSV файл сюда или нажмите для выбора
                </p>
                <p className="text-sm text-muted-foreground">
                  Максимальный размер файла: 50 МБ
                </p>
                <input
                  id="file-input"
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
                    onClick={() => setFile(null)}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Обработка...</span>
                      <span className="font-medium">
                        {progress.current} / {progress.total} ({progressPercent.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Анализируем..." : "Начать анализ"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFile(null)}
                    disabled={isLoading}
                  >
                    Отменить
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Требования к данным</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• CSV файл должен содержать колонку: <code className="bg-muted px-1 py-0.5 rounded">text</code> (обязательно)</p>
            <p>• Опционально: <code className="bg-muted px-1 py-0.5 rounded">src</code> (источник отзыва)</p>
            <p>• Кодировка: UTF-8</p>
            <p>• Первая строка должна содержать заголовки колонок</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
