import { NavLink } from "@/components/NavLink";
import { BarChart3 } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors">
              <BarChart3 className="w-6 h-6 text-primary" />
              <span>SentimentAnalyzer</span>
            </NavLink>
            
            <div className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeClassName="text-primary bg-muted"
              >
                Главная
              </NavLink>
              <NavLink
                to="/upload"
                className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeClassName="text-primary bg-muted"
              >
                Анализ
              </NavLink>
              <NavLink
                to="/results"
                className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeClassName="text-primary bg-muted"
              >
                Результаты
              </NavLink>
              <NavLink
                to="/dashboard"
                className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeClassName="text-primary bg-muted"
              >
                Дашборд
              </NavLink>
              <NavLink
                to="/validation"
                className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeClassName="text-primary bg-muted"
              >
                Валидация
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
