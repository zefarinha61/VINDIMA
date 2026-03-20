import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, Users, Zap, TrendingUp, Package, Calendar, 
  RefreshCw, Filter, ChevronRight, Layers, Table as TableIcon,
  Search, Info, Menu, X
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Entrega {
  Campanha: string;
  DataMovimento: string;
  CodSocio: string;
  Nome: string;
  TipoUva: string;
  ArtigoDesc: string;
  grau: number;
  PesoLiquido: number;
  ProcessoDesc: string;
  ValorizacaoValorUnitario: number;
  ValorizacaoCustosCriteriosMultiplos: number;
  ValorizacaoTotalUva: number;
  ValorizacaoTotalTalao: number;
  PropriedadeDesc: string;
  ParcelaDesc: string;
  AreaCategoriasProducao: number;
  CastaDesc: string;
  CDU_Cor: string;
}

const COLORS = ['#4f46e5', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b', '#10b981'];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    Campanha: '',
    Nome: '',
    CastaDesc: '',
    PropriedadeDesc: '',
    ParcelaDesc: '',
    CDU_Cor: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/entregas');
        setData(response.data);
      } catch (err) {
        console.error('Error:', err);
        setError('Erro na ligação à base de dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      Campanha: '',
      Nome: '',
      CastaDesc: '',
      PropriedadeDesc: '',
      ParcelaDesc: '',
      CDU_Cor: ''
    });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return (
        (!filters.Campanha || item.Campanha === filters.Campanha) &&
        (!filters.Nome || item.Nome === filters.Nome) &&
        (!filters.CastaDesc || item.CastaDesc === filters.CastaDesc) &&
        (!filters.PropriedadeDesc || item.PropriedadeDesc === filters.PropriedadeDesc) &&
        (!filters.ParcelaDesc || item.ParcelaDesc === filters.ParcelaDesc) &&
        (!filters.CDU_Cor || item.CDU_Cor === filters.CDU_Cor)
      );
    });
  }, [data, filters]);

  const getUniqueOptions = (key: keyof Entrega) => {
    return Array.from(new Set(data.map(item => String(item[key])))).filter(Boolean).sort();
  };

  const stats = useMemo(() => {
    const totalPeso = filteredData.reduce((acc, curr) => acc + curr.PesoLiquido, 0);
    const totalValor = filteredData.reduce((acc, curr) => acc + curr.ValorizacaoTotalUva, 0);
    const avgGrau = filteredData.length > 0 
      ? filteredData.reduce((acc, curr) => acc + (curr.grau * curr.PesoLiquido), 0) / totalPeso 
      : 0;
    return { totalPeso, totalValor, avgGrau, count: filteredData.length };
  }, [filteredData]);

  const dataByCasta = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      if (!acc[curr.CastaDesc]) acc[curr.CastaDesc] = { name: curr.CastaDesc, value: 0 };
      acc[curr.CastaDesc].value += curr.PesoLiquido;
      return acc;
    }, {});
    return Object.values(grouped).sort((a: any, b: any) => b.value - a.value).slice(0, 7);
  }, [filteredData]);

  const dataBySocio = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      if (!acc[curr.Nome]) acc[curr.Nome] = { name: curr.Nome, peso: 0 };
      acc[curr.Nome].peso += curr.PesoLiquido;
      return acc;
    }, {});
    return Object.values(grouped).sort((a: any, b: any) => b.peso - a.peso).slice(0, 10);
  }, [filteredData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center">
        <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium tracking-wide">A carregar dados analíticos...</p>
      </div>
    </div>
  );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Filters Sidebar */}
      <aside className="auth-sidebar">
        <div className="sidebar-title">
          <Wine className="w-8 h-8 text-indigo-400" />
          VINDIMA
        </div>

        <div className="space-y-6">
          <div className="pb-4 border-b border-white/10 flex justify-between items-center">
             <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Opções de Selecção</h4>
             <button onClick={clearFilters} className="text-white/40 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
             </button>
          </div>

          <SidebarSelect 
            label="Campanha Geral" 
            value={filters.Campanha} 
            options={getUniqueOptions('Campanha')} 
            onChange={(v) => handleFilterChange('Campanha', v)} 
          />
          <SidebarSelect 
            label="Sócio Cooperante" 
            value={filters.Nome} 
            options={getUniqueOptions('Nome')} 
            onChange={(v) => handleFilterChange('Nome', v)} 
          />
          <SidebarSelect 
            label="Variedade (Casta)" 
            value={filters.CastaDesc} 
            options={getUniqueOptions('CastaDesc')} 
            onChange={(v) => handleFilterChange('CastaDesc', v)} 
          />
          <SidebarSelect 
            label="Local / Propriedade" 
            value={filters.PropriedadeDesc} 
            options={getUniqueOptions('PropriedadeDesc')} 
            onChange={(v) => handleFilterChange('PropriedadeDesc', v)} 
          />
          <SidebarSelect 
            label="Parcela Produção" 
            value={filters.ParcelaDesc} 
            options={getUniqueOptions('ParcelaDesc')} 
            onChange={(v) => handleFilterChange('ParcelaDesc', v)} 
          />
          <SidebarSelect 
            label="Cor da Uva" 
            value={filters.CDU_Cor} 
            options={getUniqueOptions('CDU_Cor')} 
            onChange={(v) => handleFilterChange('CDU_Cor', v)} 
          />
        </div>

        <div className="mt-auto pt-10 text-[10px] text-white/20 font-medium uppercase tracking-widest">
            Adega Cooperativa de Palmela © 2026
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="main-content">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 font-outfit uppercase">Exploração de Dados</h2>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Baseado nas selecções de parâmetros à esquerda
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700">
               {stats.count} Registos encontratos
            </div>
          </div>
        </header>

        {/* KPI Grid */}
        <section className="kpi-row">
          <KPICard 
            title="Peso Acumulado (Kg)" 
            value={stats.totalPeso.toLocaleString()} 
            icon={<Package className="text-indigo-600" />}
            color="indigo"
          />
          <KPICard 
            title="Grau Médio (º)" 
            value={stats.avgGrau.toFixed(2)} 
            icon={<Zap className="text-amber-500" />}
            color="amber"
          />
          <KPICard 
            title="Valorização Total (€)" 
            value={stats.totalValor.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} 
            icon={<TrendingUp className="text-emerald-500" />}
            color="emerald"
          />
          <KPICard 
            title="Sócios Activos" 
            value={new Set(filteredData.map(d => d.CodSocio)).size.toString()} 
            icon={<Users className="text-blue-500" />}
            color="blue"
          />
        </section>

        {/* Charts Section */}
        {filteredData.length > 0 ? (
          <div className="chart-grid">
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-indigo-500" />
                    Top Sócios por Entrega (Barras)
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dataBySocio} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    width={140} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="peso" fill="#4f46e5" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Distribuição por Casta (Piza)
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={dataByCasta}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dataByCasta.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-20 text-center">
            <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Sem resultados encontrados</h3>
            <p className="text-slate-500 mt-2">Os filtros selecionados não contêm movimentos registados.</p>
            <button 
                onClick={clearFilters}
                className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                Reiniciar Selecção
            </button>
          </div>
        )}

        {/* Recent Data Table (simplified) */}
        {filteredData.length > 0 && (
          <div className="mt-10 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Registos Detalhados (Top 5)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 italic text-slate-500">
                    <th className="px-6 py-4 font-semibold">Sócio</th>
                    <th className="px-6 py-4 font-semibold">Casta</th>
                    <th className="px-6 py-4 font-semibold">Peso (Kg)</th>
                    <th className="px-6 py-4 font-semibold">Grau</th>
                    <th className="px-6 py-4 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.slice(0, 5).map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{item.Nome}</td>
                      <td className="px-6 py-4 text-slate-600">{item.CastaDesc}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{item.PesoLiquido.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">{item.grau.toFixed(1)}º</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(item.DataMovimento).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SidebarSelect = ({ label, value, options, onChange }: any) => (
  <div className="filter-group">
    <label className="filter-label">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="filter-select"
    >
      <option value="">-- Todos --</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const KPICard = ({ title, value, icon, color }: any) => (
  <div className="kpi-card relative overflow-hidden">
    <div className="flex justify-between items-center mb-4">
      <div className="p-3 bg-slate-50 rounded-xl">
        {icon}
      </div>
      <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-green-100 text-green-700 rounded-lg`}>
        Online
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">{title}</p>
      <h2 className="text-2xl font-black text-slate-900 font-outfit">{value}</h2>
    </div>
    <div className={`absolute bottom-0 left-0 h-1 bg-${color}-600 w-full opacity-10`} />
  </div>
);

const Wine = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>
    </svg>
);

export default Dashboard;
