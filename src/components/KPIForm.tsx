import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Calculator,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import { GENERAL_TASKS, PROFESSIONAL_TASKS, BONUS_CRITERIA } from '../constants/kpi-template';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  sheet_id?: string;
  assessment_data?: string;
}

interface User {
  id: number;
  name: string;
  role: 'admin' | 'teacher';
}

interface KPIFormProps {
  teacher: Teacher;
  user: User;
  onBack: () => void;
  onSuccess: () => void;
}

export default function KPIForm({ teacher, user, onBack, onSuccess }: KPIFormProps) {
  const initialData = useMemo(() => {
    if (teacher.assessment_data) {
      try {
        return JSON.parse(teacher.assessment_data);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [teacher.assessment_data]);

  const [quarter, setQuarter] = useState(initialData?.quarter || '1');
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  
  // Convert array of scores back to record
  const [scores, setScores] = useState<Record<string, { self: string, lead: string, boss: string }>>(
    initialData?.rawScores || {}
  );
  const [bonusPoints, setBonusPoints] = useState<Record<string, { self: string, lead: string, boss: string }>>(
    initialData?.rawBonus || {}
  );
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { scores, bonusPoints, totals: roleScores.self } })
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Phân tích thất bại');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Flatten criteria for easier processing
  const allCriteria = useMemo(() => {
    const flat: any[] = [];
    const traverse = (items: any[]) => {
      items.forEach(item => {
        if (item.subCriteria) {
          traverse(item.subCriteria);
        } else {
          flat.push(item);
        }
      });
    };
    traverse([...GENERAL_TASKS, ...PROFESSIONAL_TASKS]);
    return flat;
  }, []);

  const handleScoreChange = (id: string, type: 'self' | 'lead' | 'boss', value: string) => {
    // Allow empty string, numbers, and a single decimal point
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    
    setScores(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: value
      }
    }));
  };

  const handleBonusChange = (id: string, type: 'self' | 'lead' | 'boss', value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    setBonusPoints(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: value
      }
    }));
  };

  const getRoleBonusTotal = (role: 'self' | 'lead' | 'boss') => {
    return Object.values(bonusPoints).reduce((acc, curr) => acc + (parseFloat(curr[role]) || 0), 0);
  };

  const roleScores = useMemo(() => {
    const roles: ('self' | 'lead' | 'boss')[] = ['self', 'lead', 'boss'];
    
    return roles.reduce((acc, role) => {
      let hasAnyScore = false;
      const roleBonusTotal = getRoleBonusTotal(role);
      
      // Calculate Part A
      const totalGeneral = GENERAL_TASKS.reduce((accA, section) => {
        const getSectionScore = (item: any): number => {
          if (item.subCriteria) {
            return item.subCriteria.reduce((a: number, b: any) => a + getSectionScore(b), 0);
          }
          const val = scores[item.id]?.[role];
          if (val !== undefined && val !== '') hasAnyScore = true;
          return parseFloat(val || '0') || 0;
        };
        return accA + getSectionScore(section);
      }, 0);

      // Calculate Part B
      const profScores: number[] = [];
      const collectProfScores = (item: any) => {
        if (item.subCriteria) {
          item.subCriteria.forEach((sub: any) => collectProfScores(sub));
        } else if (item.maxPoints === 100) {
          const val = scores[item.id]?.[role];
          if (val !== undefined && val !== '') hasAnyScore = true;
          profScores.push(parseFloat(val || '0') || 0);
        }
      };
      PROFESSIONAL_TASKS.forEach(task => collectProfScores(task));
      
      const professionalKPItb = profScores.length > 0 
        ? profScores.reduce((a, b) => a + b, 0) / profScores.length 
        : 0;

      const partBWeighted = professionalKPItb * 0.7;
      const totalAB = totalGeneral + partBWeighted;
      const final = totalAB + roleBonusTotal;

      acc[role] = {
        totalGeneral,
        professionalKPItb,
        partBWeighted,
        totalAB,
        final,
        hasAnyScore,
        bonusTotal: roleBonusTotal
      };
      return acc;
    }, {} as Record<string, any>);
  }, [scores, bonusPoints]);

  const totalGeneralScore = roleScores.self.totalGeneral;
  const professionalKPItb = roleScores.self.professionalKPItb;
  const finalScore = roleScores.self.final;

  const handleSave = async (isFinal: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const assessmentScores = allCriteria.map(c => ({
        label: c.label,
        maxPoints: c.maxPoints || 0,
        self: parseFloat(scores[c.id]?.self || '0') || 0,
        lead: parseFloat(scores[c.id]?.lead || '0') || 0,
        boss: parseFloat(scores[c.id]?.boss || '0') || 0
      }));

      // Add bonus points to the payload
      const bonusScores = BONUS_CRITERIA.map(b => ({
        label: `Cộng: ${b.label}`,
        maxPoints: 0,
        self: parseFloat(bonusPoints[b.id]?.self || '0') || 0,
        lead: parseFloat(bonusPoints[b.id]?.lead || '0') || 0,
        boss: parseFloat(bonusPoints[b.id]?.boss || '0') || 0
      }));

      const payload = {
        teacherId: teacher.id,
        quarter,
        year,
        scores: [...assessmentScores, ...bonusScores],
        rawScores: scores,
        rawBonus: bonusPoints,
        totals: {
          self: roleScores.self.final,
          lead: roleScores.lead.final,
          boss: roleScores.boss.final
        },
        isFinal
      };

      const res = await fetch('/api/save-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save assessment');
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 border-b border-border">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Quý</label>
            <select 
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="bg-surface border border-border rounded px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none"
            >
              <option value="1">I</option>
              <option value="2">II</option>
              <option value="3">III</option>
              <option value="4">IV</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Năm</label>
            <input 
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="bg-surface border border-border rounded px-3 py-1.5 text-sm font-bold w-24 focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 text-sm font-bold uppercase tracking-widest rounded-lg hover:opacity-90 shadow-md transition-all disabled:opacity-50"
          >
            {analyzing ? 'Đang phân tích...' : <><Users size={18} /> Phân tích AI</>}
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 text-sm font-bold uppercase tracking-widest rounded-lg hover:opacity-90 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : <><Save size={18} /> Lưu & Xem báo cáo</>}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
          <h4 className="text-indigo-900 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
            <Users size={14} />
            Phân tích từ Gemini AI
          </h4>
          <div className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap italic">
            {analysis}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 rounded flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* KPI Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 bg-slate-800 text-white text-[10px] uppercase tracking-widest font-bold p-4">
          <div className="col-span-6">Tiêu chí đánh giá</div>
          <div className="col-span-1 text-center">Tối đa</div>
          <div className="col-span-5 grid grid-cols-3 gap-2">
            <div className="text-center">Cá nhân</div>
            <div className="text-center">Tổ trưởng</div>
            <div className="text-center">BGH</div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {GENERAL_TASKS.map((section) => (
            <div key={section.id} className="bg-slate-50/50">
              <div className="p-4 font-bold text-slate-900 border-b border-border">
                {section.label}
              </div>
              
              {section.subCriteria?.map((sub) => {
                const renderRow = (item: any) => (
                  <div key={item.id} className="grid grid-cols-12 p-4 hover:bg-slate-50 transition-colors group bg-surface">
                    <div className="col-span-6 pr-4">
                      <div className="text-sm font-medium text-slate-700 leading-relaxed">{item.label}</div>
                      {item.products && (
                        <div className="mt-2 space-y-1">
                          {item.products.map((p: string, idx: number) => (
                            <div key={idx} className="text-[10px] text-text-muted flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                              {p}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center justify-center font-mono font-bold text-sm text-slate-500">
                      {item.maxPoints}
                    </div>
                    <div className="col-span-5 grid grid-cols-3 gap-2 items-center">
                      <input 
                        type="text"
                        inputMode="decimal"
                        placeholder=""
                        value={scores[item.id]?.self || ''}
                        onChange={(e) => handleScoreChange(item.id, 'self', e.target.value)}
                        disabled={user.role !== 'teacher'}
                        className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      />
                      <input 
                        type="text"
                        inputMode="decimal"
                        placeholder=""
                        value={scores[item.id]?.lead || ''}
                        onChange={(e) => handleScoreChange(item.id, 'lead', e.target.value)}
                        disabled={user.role !== 'admin'}
                        className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      />
                      <input 
                        type="text"
                        inputMode="decimal"
                        placeholder=""
                        value={scores[item.id]?.boss || ''}
                        onChange={(e) => handleScoreChange(item.id, 'boss', e.target.value)}
                        disabled={user.role !== 'admin'}
                        className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                  </div>
                );

                if (sub.subCriteria) {
                  return (
                    <div key={sub.id} className="divide-y divide-border">
                      <div className="p-4 bg-slate-50 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        {sub.label}
                      </div>
                      {sub.subCriteria.map(item => renderRow(item))}
                    </div>
                  );
                } else {
                  return renderRow(sub);
                }
              })}
            </div>
          ))}
        </div>

        {/* Summary Row A */}
        <div className="grid grid-cols-12 bg-slate-100 text-slate-900 p-6 font-bold border-t border-border">
          <div className="col-span-6 text-lg uppercase tracking-tight">TỔNG ĐIỂM NHIỆM VỤ CHUNG (PHẦN A)</div>
          <div className="col-span-1 text-center text-xl font-mono">30</div>
          <div className="col-span-5 grid grid-cols-3 gap-2 text-center text-2xl font-mono text-primary">
            <div>{roleScores.self.hasAnyScore ? totalGeneralScore.toFixed(2) : '-'}</div>
            <div>{roleScores.lead.hasAnyScore ? roleScores.lead.totalGeneral.toFixed(2) : '-'}</div>
            <div>{roleScores.boss.hasAnyScore ? roleScores.boss.totalGeneral.toFixed(2) : '-'}</div>
          </div>
        </div>

        {/* Section B */}
        <div className="bg-slate-800 text-white p-6 font-bold border-t border-border">
          <div className="text-xl uppercase tracking-tight">B. NHIỆM VỤ THUỘC CHUYÊN MÔN, NGHIỆP VỤ CỦA CÁC ĐỐI TƯỢNG (KPI = 70%)</div>
        </div>

        <div className="divide-y divide-border">
          {PROFESSIONAL_TASKS.map((section) => (
            <div key={section.id} className="bg-slate-50/50">
              <div className="p-4 font-bold text-slate-900 border-b border-border">
                {section.label}
              </div>
              
              {section.subCriteria?.map((sub) => {
                const renderRow = (item: any) => (
                  <div key={item.id} className="grid grid-cols-12 p-4 hover:bg-slate-50 transition-colors group bg-surface">
                    <div className="col-span-6 pr-4">
                      <div className="text-sm font-medium text-slate-700 leading-relaxed">{item.label}</div>
                      {item.products && (
                        <div className="mt-2 space-y-1">
                          {item.products.map((p: string, idx: number) => (
                            <div key={idx} className="text-[10px] text-text-muted flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                              {p}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center justify-center font-mono font-bold text-sm text-slate-500">
                      {item.maxPoints}%
                    </div>
                    <div className="col-span-5 grid grid-cols-3 gap-2 items-center">
                      <input 
                        type="text"
                        inputMode="decimal"
                        placeholder=""
                        value={scores[item.id]?.self || ''}
                        onChange={(e) => handleScoreChange(item.id, 'self', e.target.value)}
                        disabled={user.role !== 'teacher'}
                        className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      />
                      <input 
                        type="text"
                        inputMode="decimal"
                        placeholder=""
                        value={scores[item.id]?.lead || ''}
                        onChange={(e) => handleScoreChange(item.id, 'lead', e.target.value)}
                        disabled={user.role !== 'admin'}
                        className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      />
                      <input 
                        type="text"
                        inputMode="decimal"
                        placeholder=""
                        value={scores[item.id]?.boss || ''}
                        onChange={(e) => handleScoreChange(item.id, 'boss', e.target.value)}
                        disabled={user.role !== 'admin'}
                        className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                  </div>
                );

                if (sub.subCriteria) {
                  return (
                    <div key={sub.id} className="divide-y divide-border">
                      <div className="p-4 bg-slate-50 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        {sub.label}
                      </div>
                      {sub.subCriteria.map(item => renderRow(item))}
                    </div>
                  );
                } else {
                  return renderRow(sub);
                }
              })}
            </div>
          ))}
        </div>

        {/* Summary Row B */}
        <div className="grid grid-cols-12 bg-slate-100 text-slate-900 p-6 font-bold border-t border-border">
          <div className="col-span-6 text-lg uppercase tracking-tight">KPItb (Trung bình cộng Phần B)</div>
          <div className="col-span-1 text-center text-xl font-mono">100%</div>
          <div className="col-span-5 grid grid-cols-3 gap-2 text-center text-2xl font-mono text-primary">
            <div>{roleScores.self.hasAnyScore ? `${professionalKPItb.toFixed(2)}%` : '-'}</div>
            <div>{roleScores.lead.hasAnyScore ? `${roleScores.lead.professionalKPItb.toFixed(2)}%` : '-'}</div>
            <div>{roleScores.boss.hasAnyScore ? `${roleScores.boss.professionalKPItb.toFixed(2)}%` : '-'}</div>
          </div>
        </div>

        <div className="grid grid-cols-12 bg-slate-100 text-slate-900 p-6 font-bold border-t border-border">
          <div className="col-span-6 text-lg uppercase tracking-tight">ĐIỂM PHẦN B QUY ĐỔI (KPItb x 70%)</div>
          <div className="col-span-1 text-center text-xl font-mono">70</div>
          <div className="col-span-5 grid grid-cols-3 gap-2 text-center text-2xl font-mono text-primary">
            <div>{roleScores.self.hasAnyScore ? (professionalKPItb * 0.7).toFixed(2) : '-'}</div>
            <div>{roleScores.lead.hasAnyScore ? (roleScores.lead.professionalKPItb * 0.7).toFixed(2) : '-'}</div>
            <div>{roleScores.boss.hasAnyScore ? (roleScores.boss.professionalKPItb * 0.7).toFixed(2) : '-'}</div>
          </div>
        </div>
      </div>

      {/* Bonus Points Section */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Calculator size={24} className="text-primary" />
          Phụ lục 1: Điểm cộng thêm
        </h3>
        
        <div className="bg-surface border border-border rounded-xl divide-y divide-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-800 text-white text-[10px] uppercase tracking-widest font-bold p-4">
            <div className="col-span-7">Nội dung cộng điểm</div>
            <div className="col-span-5 grid grid-cols-3 gap-2 text-center">
              <div>Cá nhân</div>
              <div>Tổ trưởng</div>
              <div>BGH</div>
            </div>
          </div>
          {BONUS_CRITERIA.map((bonus) => (
            <div key={bonus.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-7">
                <div className="text-sm font-bold text-slate-800 mb-1">{bonus.id}. {bonus.label}</div>
                {typeof bonus.points === 'object' && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(bonus.points).map(([key, val]) => (
                      <span key={key} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-bold">
                        {key}: +{val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-5 grid grid-cols-3 gap-2">
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder=""
                  value={bonusPoints[bonus.id]?.self || ''}
                  onChange={(e) => handleBonusChange(bonus.id, 'self', e.target.value)}
                  disabled={user.role !== 'teacher'}
                  className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-sm focus:ring-2 focus:ring-primary/10 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder=""
                  value={bonusPoints[bonus.id]?.lead || ''}
                  onChange={(e) => handleBonusChange(bonus.id, 'lead', e.target.value)}
                  disabled={user.role !== 'admin'}
                  className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-sm focus:ring-2 focus:ring-primary/10 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder=""
                  value={bonusPoints[bonus.id]?.boss || ''}
                  onChange={(e) => handleBonusChange(bonus.id, 'boss', e.target.value)}
                  disabled={user.role !== 'admin'}
                  className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-sm focus:ring-2 focus:ring-primary/10 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-8 bg-primary text-white flex justify-between items-center rounded-xl shadow-lg mb-12">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-1">Tổng điểm cuối cùng</div>
            <div className="text-3xl font-bold">Kết quả đánh giá Quý {quarter}</div>
          </div>
          <div className="text-right">
            <div className="text-6xl font-mono font-bold">
              {finalScore.toFixed(2)}
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-70 mt-2">Điểm hệ số 100</div>
          </div>
        </div>

        {/* Summary Table from Image */}
        <div className="mt-12 bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 bg-slate-800 text-white text-[10px] uppercase tracking-widest font-bold p-4">
            <div className="col-span-6">TỔNG HỢP KẾT QUẢ</div>
            <div className="col-span-6 grid grid-cols-3 gap-2 text-center">
              <div>Cá nhân</div>
              <div>Tổ trưởng</div>
              <div>Lãnh đạo</div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {/* Row 1: Orange */}
            <div className="grid grid-cols-12 p-4 bg-orange-100 font-bold text-slate-900">
              <div className="col-span-6 text-xs uppercase">KẾT QUẢ THỰC HIỆN NHIỆM VỤ (KPI-a, b, c, d, e, g) ĐỐI VỚI VC KIÊM NHIỆM</div>
              <div className="col-span-6 grid grid-cols-3 gap-2 text-center font-mono">
                <div>{roleScores.self.hasAnyScore ? roleScores.self.partBWeighted.toFixed(2) : '-'}</div>
                <div>{roleScores.lead.hasAnyScore ? roleScores.lead.partBWeighted.toFixed(2) : '-'}</div>
                <div>{roleScores.boss.hasAnyScore ? roleScores.boss.partBWeighted.toFixed(2) : '-'}</div>
              </div>
            </div>

            {/* Row 2: Yellow */}
            <div className="grid grid-cols-12 p-4 bg-yellow-100 font-bold text-slate-900">
              <div className="col-span-6 text-xs uppercase">Tổng điểm theo dõi, đánh giá tháng, quý</div>
              <div className="col-span-6 grid grid-cols-3 gap-2 text-center font-mono">
                <div>{roleScores.self.hasAnyScore ? roleScores.self.totalAB.toFixed(2) : '-'}</div>
                <div>{roleScores.lead.hasAnyScore ? roleScores.lead.totalAB.toFixed(2) : '-'}</div>
                <div>{roleScores.boss.hasAnyScore ? roleScores.boss.totalAB.toFixed(2) : '-'}</div>
              </div>
            </div>

            {/* Row 3: White */}
            <div className="grid grid-cols-12 p-4 bg-surface font-bold text-slate-900">
              <div className="col-span-6 text-xs uppercase">Điểm cộng thêm (Theo danh mục cộng điểm)</div>
              <div className="col-span-6 grid grid-cols-3 gap-2 text-center font-mono">
                <div>{roleScores.self.bonusTotal > 0 ? roleScores.self.bonusTotal.toFixed(2) : '-'}</div>
                <div>{roleScores.lead.bonusTotal > 0 ? roleScores.lead.bonusTotal.toFixed(2) : '-'}</div>
                <div>{roleScores.boss.bonusTotal > 0 ? roleScores.boss.bonusTotal.toFixed(2) : '-'}</div>
              </div>
            </div>

            {/* Row 4: White */}
            <div className="grid grid-cols-12 p-4 bg-surface font-bold text-slate-900">
              <div className="col-span-6 text-xs uppercase">Tổng điểm đánh giá của quý</div>
              <div className="col-span-6 grid grid-cols-3 gap-2 text-center font-mono text-primary text-lg">
                <div>{roleScores.self.hasAnyScore ? roleScores.self.final.toFixed(2) : '-'}</div>
                <div>{roleScores.lead.hasAnyScore ? roleScores.lead.final.toFixed(2) : '-'}</div>
                <div>{roleScores.boss.hasAnyScore ? roleScores.boss.final.toFixed(2) : '-'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div className="space-y-20">
            <div className="text-sm font-bold uppercase tracking-widest text-slate-900">Chữ ký người tự đánh giá</div>
            <div className="text-xs italic text-text-muted">(Ký và ghi rõ họ tên)</div>
          </div>
          <div className="space-y-20">
            <div className="text-sm font-bold uppercase tracking-widest text-slate-900">Chữ ký tổ trưởng</div>
            <div className="text-xs italic text-text-muted">(Ký và ghi rõ họ tên)</div>
          </div>
          <div className="space-y-20">
            <div className="text-sm font-bold uppercase tracking-widest text-slate-900">Chữ ký của lãnh đạo phụ trách</div>
            <div className="text-xs italic text-text-muted">(Ký và ghi rõ họ tên)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
