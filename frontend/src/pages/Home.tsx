import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, BarChart3, Download, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-visualization.jpg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Data visualization" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Анализатор тональности отзывов
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Автоматическая классификация русскоязычных текстов с помощью машинного обучения
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/upload")}
              className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8 py-6 h-auto shadow-lg hover-lift"
            >
              <Upload className="mr-2 w-5 h-5" />
              Загрузить CSV
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Автоматический анализ</h3>
              <p className="text-muted-foreground">
                ML-модель классифицирует тысячи отзывов за секунды
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Визуализация данных</h3>
              <p className="text-muted-foreground">
                Интерактивные графики и дашборды
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Экспорт результатов</h3>
              <p className="text-muted-foreground">
                Скачивайте размеченные данные в CSV
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-card border-y border-border py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Как это работает
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { num: "1", title: "Загрузите CSV", desc: "с отзывами" },
                { num: "2", title: "Модель обрабатывает", desc: "тексты" },
                { num: "3", title: "Просмотрите", desc: "результаты" },
                { num: "4", title: "Экспортируйте", desc: "данные" }
              ].map((step, idx) => (
                <div key={idx} className="text-center animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.num}
                  </div>
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
