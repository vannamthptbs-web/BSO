import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  FileText, 
  PlusCircle, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  ClipboardCheck,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { GENERAL_TASKS, BONUS_CRITERIA } from './constants/kpi-template';
import KPIForm from './components/KPIForm';
import SheetViewer from './components/SheetViewer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'teacher';
  sheet_id?: string;
  total_score?: number;
  assessment_data?: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'teacher';
}

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Users className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">THPT BÌNH SƠN</h1>
          <p className="text-slate-500 text-sm mt-1">Hệ thống đánh giá KPI Cán bộ - Giáo viên</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Tên đăng nhập</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Ví dụ: nam"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Mật khẩu</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-xs">
            Mặc định: Tên (không dấu) / Tên + 123
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [view, setView] = useState<'dashboard' | 'assessment' | 'report'>('dashboard');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsGoogleConnected(true);
        fetchTeachers();
      }
    };
    window.addEventListener('message', handleMessage);
    
    checkGoogleStatus();

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkGoogleStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const { connected } = await res.json();
      setIsGoogleConnected(connected);
    } catch (error) {
      console.error('Failed to check Google status', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeachers();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'teacher' && teachers.length > 0) {
      const self = teachers.find(t => t.id === user.id);
      if (self) {
        setSelectedTeacher(self);
        setView('assessment');
      }
    }
  }, [teachers, user]);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('app_user', JSON.stringify(userData));
  };

  const handleLogoutApp = () => {
    setUser(null);
    localStorage.removeItem('app_user');
    setSelectedTeacher(null);
    setView('dashboard');
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      window.open(url, 'oauth_popup', 'width=600,height=700');
    } catch (error) {
      console.error('Auth error', error);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-text-main font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-surface z-20 hidden md:block shadow-sm">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight text-primary">THPT BÌNH SƠN</h1>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mt-1 font-semibold">Hệ thống đánh giá KPI</p>
        </div>
        
        <nav className="p-4 space-y-1">
          {user.role === 'admin' && (
            <button 
              onClick={() => setView('dashboard')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all",
                view === 'dashboard' ? "bg-primary text-white shadow-md" : "text-text-muted hover:bg-slate-100 hover:text-text-main"
              )}
            >
              <LayoutDashboard size={18} />
              Bảng điều khiển
            </button>
          )}
          <button 
            onClick={() => setView('assessment')}
            disabled={!selectedTeacher}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all",
              view === 'assessment' ? "bg-primary text-white shadow-md" : "text-text-muted hover:bg-slate-100 hover:text-text-main disabled:opacity-30"
            )}
          >
            <ClipboardCheck size={18} />
            {user.role === 'teacher' ? 'Tự đánh giá' : 'Đánh giá mới'}
          </button>
          {selectedTeacher?.sheet_id && (
            <button 
              onClick={() => setView('report')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all",
                view === 'report' ? "bg-primary text-white shadow-md" : "text-text-muted hover:bg-slate-100 hover:text-text-main"
              )}
            >
              <FileSpreadsheet size={18} />
              Báo cáo cá nhân
            </button>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-border space-y-2">
          <div className="px-4 py-2 bg-slate-50 rounded-lg mb-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Đang đăng nhập</p>
            <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
            <p className="text-[10px] text-primary font-bold uppercase">{user.role === 'admin' ? 'Tổ trưởng / BGH' : 'Giáo viên'}</p>
          </div>

          {user.role === 'admin' && (
            isGoogleConnected ? (
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={12} />
                Google Đã kết nối
              </div>
            ) : (
              <button 
                onClick={handleConnectGoogle}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-widest bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm"
              >
                <Users size={14} />
                Kết nối Google
              </button>
            )
          )}

          <button 
            onClick={handleLogoutApp}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {view === 'dashboard' ? 'Danh sách Giáo viên' : view === 'assessment' ? 'Mẫu Đánh giá KPI' : 'Báo cáo KPI'}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {view === 'dashboard' 
                ? 'Chọn giáo viên để bắt đầu quá trình đánh giá.' 
                : view === 'assessment'
                ? `Đang đánh giá: ${selectedTeacher?.name}`
                : `Báo cáo của: ${selectedTeacher?.name}`}
            </p>
          </div>
          
          {user.role === 'admin' && !isGoogleConnected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded border border-amber-200 text-xs font-medium">
              <AlertCircle size={14} />
              Cần kết nối Google để lưu dữ liệu
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {teachers.map((teacher) => (
                <div 
                  key={teacher.id}
                  className="group relative bg-surface border border-border p-6 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div 
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setView(teacher.sheet_id ? 'report' : 'assessment');
                      }}
                      className="flex-1 cursor-pointer"
                    >
                      <h3 className="text-xl font-bold mb-1 text-slate-900 group-hover:text-primary transition-colors">{teacher.name}</h3>
                      <p className="text-sm text-text-muted font-mono">{teacher.email || 'Chưa có email'}</p>
                    </div>
                    <div className="flex gap-2">
                      {teacher.sheet_id ? (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeacher(teacher);
                              setView('report');
                            }}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Xem báo cáo từ Google Sheets"
                          >
                            <FileSpreadsheet size={20} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeacher(teacher);
                              setView('assessment');
                            }}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="Chỉnh sửa đánh giá"
                          >
                            <ClipboardCheck size={20} />
                          </button>
                        </>
                      ) : (
                        <div 
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setView('assessment');
                          }}
                          className="p-2 bg-slate-50 rounded-lg text-text-muted group-hover:bg-primary group-hover:text-white transition-all cursor-pointer"
                        >
                          <ChevronRight size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setView(teacher.sheet_id ? 'report' : 'assessment');
                    }}
                    className="mt-6 pt-6 border-t border-border flex flex-wrap gap-4 items-center cursor-pointer"
                  >
                    <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
                      ID: {teacher.id.toString().padStart(3, '0')}
                    </div>
                    {teacher.sheet_id && (
                      <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        Đã kết nối Sheet
                      </div>
                    )}
                    {teacher.assessment_data && (
                      <div className={cn(
                        "text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded",
                        JSON.parse(teacher.assessment_data).isFinal 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-amber-100 text-amber-700"
                      )}>
                        {JSON.parse(teacher.assessment_data).isFinal ? 'Đã chốt' : 'Lưu tạm'}
                      </div>
                    )}
                    {teacher.total_score !== null && teacher.total_score !== undefined && (
                      <div className="ml-auto text-sm font-bold text-primary">
                        {teacher.total_score.toFixed(2)} điểm
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <button className="border-2 border-dashed border-slate-300 p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-text-muted hover:border-primary hover:text-primary hover:bg-slate-50 transition-all">
                <PlusCircle size={32} />
                <span className="text-sm font-bold uppercase tracking-widest">Thêm giáo viên mới</span>
              </button>
            </motion.div>
          ) : view === 'assessment' ? (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {selectedTeacher && (
                <KPIForm 
                  teacher={selectedTeacher} 
                  user={user}
                  onBack={() => setView(user.role === 'admin' ? 'dashboard' : 'assessment')}
                  onSuccess={() => {
                    setMessage({ type: 'success', text: 'Đã lưu đánh giá thành công!' });
                    fetchTeachers();
                    setView('report');
                    setTimeout(() => setMessage(null), 5000);
                  }}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="report"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {selectedTeacher && (
                <SheetViewer 
                  teacher={selectedTeacher} 
                  onBack={() => setView(user.role === 'admin' ? 'dashboard' : 'assessment')}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3 border",
              message.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
