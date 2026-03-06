import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileSpreadsheet, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SheetViewerProps {
  teacher: { id: number; name: string; sheet_id?: string };
  onBack: () => void;
}

export default function SheetViewer({ teacher, onBack }: SheetViewerProps) {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quarter, setQuarter] = useState('1');
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/get-assessment-from-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: teacher.id, quarter, year })
      });
      
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setRows(data.rows || []);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu từ Google Sheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quarter, year]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </button>

        <div className="flex items-center gap-3">
          <select 
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
          >
            {[1, 2, 3, 4].map(q => <option key={q} value={q}>Quý {q}</option>)}
          </select>
          <select 
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>Năm {y}</option>)}
          </select>
          <button 
            onClick={fetchData}
            className="p-2 bg-slate-100 text-text-muted hover:bg-primary hover:text-white rounded-lg transition-all"
            title="Làm mới"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Báo cáo từ Google Sheets</h3>
              <p className="text-xs text-text-muted">Dữ liệu thực tế được lưu trữ trên file của giáo viên</p>
            </div>
          </div>
          
          {teacher.sheet_id && (
            <a 
              href={`https://docs.google.com/spreadsheets/d/${teacher.sheet_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-bold text-text-main hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={16} />
              Mở file gốc
            </a>
          )}
        </div>

        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <RefreshCw size={40} className="animate-spin text-primary/30" />
              <p className="text-text-muted font-medium animate-pulse">Đang truy xuất dữ liệu từ Google Sheets...</p>
            </div>
          ) : error ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 bg-red-50 text-red-500 rounded-full">
                <AlertCircle size={40} />
              </div>
              <div className="max-w-md">
                <h4 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy dữ liệu</h4>
                <p className="text-text-muted text-sm">{error}</p>
              </div>
              <button 
                onClick={fetchData}
                className="mt-2 px-6 py-2 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  {rows[0]?.map((cell, i) => (
                    <th key={i} className="px-6 py-4 text-left font-bold text-text-muted uppercase tracking-wider text-[10px]">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, i) => {
                  const isTotalRow = row[0]?.includes("TỔNG ĐIỂM");
                  const isStatusRow = row[0]?.includes("TRẠNG THÁI");
                  const isEmptyRow = row.every(c => !c);

                  if (isEmptyRow) return <tr key={i} className="h-4 bg-slate-50/30"></tr>;

                  return (
                    <tr 
                      key={i} 
                      className={cn(
                        "border-b border-border/50 hover:bg-slate-50/50 transition-colors",
                        isTotalRow && "bg-primary/5 font-bold",
                        isStatusRow && "bg-emerald-50/50"
                      )}
                    >
                      {row.map((cell, j) => (
                        <td key={j} className={cn(
                          "px-6 py-4",
                          j === 0 ? "font-medium text-slate-900" : "text-text-main",
                          isTotalRow && j > 1 && "text-primary text-lg",
                          isStatusRow && j === 2 && "text-emerald-600 font-bold"
                        )}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
