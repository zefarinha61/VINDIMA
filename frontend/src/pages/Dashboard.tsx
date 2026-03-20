import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Zap, TrendingUp, Package, 
  RefreshCw, Layers, Table as TableIcon,
  Info, ChevronRight
} from 'lucide-react';
import axios from 'axios';

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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
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

  const availableOptions = useMemo(() => {
    const fields = Object.keys(filters) as (keyof typeof filters)[];
    const results: Record<string, string[]> = {};

    fields.forEach(field => {
      results[field] = Array.from(new Set(
        data.filter(item => {
          return fields.every(otherField => {
            if (otherField === field || !filters[otherField]) return true;
            return String(item[otherField as keyof Entrega]) === filters[otherField];
          });
        }).map(item => String(item[field as keyof Entrega]))
      )).filter(Boolean).sort();
    });

    return results;
  }, [data, filters]);

  const stats = useMemo(() => {
    const totalPeso = filteredData.reduce((acc, curr) => acc + curr.PesoLiquido, 0);
    const totalValor = filteredData.reduce((acc, curr) => acc + curr.ValorizacaoTotalUva, 0);
    const totalGrauKilos = filteredData.reduce((acc, curr) => acc + (curr.grau * curr.PesoLiquido), 0);
    const avgGrau = totalPeso > 0 ? totalGrauKilos / totalPeso : 0;
    
    const castas = filteredData.reduce((acc: any, curr) => {
      acc[curr.CastaDesc] = (acc[curr.CastaDesc] || 0) + curr.PesoLiquido;
      return acc;
    }, {});
    const topCasta = Object.entries(castas).sort((a: any, b: any) => b[1] - a[1])[0] || ["-", 0];

    const socios = filteredData.reduce((acc: any, curr) => {
      acc[curr.Nome] = (acc[curr.Nome] || 0) + curr.PesoLiquido;
      return acc;
    }, {});
    const topSocio = Object.entries(socios).sort((a: any, b: any) => b[1] - a[1])[0] || ["-", 0];

    return { 
      totalPeso, 
      totalValor, 
      avgGrau, 
      totalGrauKilos,
      topCastaName: topCasta[0],
      topCastaValue: topCasta[1] as number,
      topSocioName: topSocio[0],
      topSocioValue: topSocio[1] as number,
      count: filteredData.length 
    };
  }, [filteredData]);

  const dataByCasta = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      if (!acc[curr.CastaDesc]) acc[curr.CastaDesc] = { name: curr.CastaDesc, value: 0, grauKg: 0 };
      acc[curr.CastaDesc].value += curr.PesoLiquido;
      acc[curr.CastaDesc].grauKg += (curr.PesoLiquido * curr.grau);
      return acc;
    }, {});
    const sortedByKg = Object.values(grouped).sort((a: any, b: any) => (b as any).value - (a as any).value).slice(0, 7) as any[];
    const sortedByGrauKg = Object.values(grouped).sort((a: any, b: any) => (b as any).grauKg - (a as any).grauKg).slice(0, 7) as any[];
    return { sortedByKg, sortedByGrauKg };
  }, [filteredData]);

  const dataBySocio = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      if (!acc[curr.Nome]) acc[curr.Nome] = { name: curr.Nome, peso: 0, grauKg: 0 };
      acc[curr.Nome].peso += curr.PesoLiquido;
      acc[curr.Nome].grauKg += (curr.PesoLiquido * curr.grau);
      return acc;
    }, {});
    const sortedByKg = Object.values(grouped).sort((a: any, b: any) => (b as any).peso - (a as any).peso).slice(0, 10) as any[];
    const sortedByGrauKg = Object.values(grouped).sort((a: any, b: any) => (b as any).grauKg - (a as any).grauKg).slice(0, 10) as any[];
    return { sortedByKg, sortedByGrauKg };
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
    <div className="bg-slate-50 min-h-screen">
      {/* Top Filter Bar with 'Cor de Vinha' */}
      <header className="filters-top-bar">
        <div className="top-bar-content">
          <div className="flex justify-between items-center mb-6">
            <div className="sidebar-title !mb-0 text-white">
              <Wine className="w-8 h-8 text-orange-400" />
              <span>VINDIMA ANALYTICS</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={clearFilters} className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <RefreshCw className="w-4 h-4" />
                Limpar Filtros
              </button>
              <div className="hidden md:block text-[10px] text-white/30 font-medium uppercase tracking-widest">
                  Adega Cooperativa de Palmela © 2026
              </div>
            </div>
          </div>

          <div className="filters-grid">
            <SidebarSelect 
              label="Campanha Geral" 
              value={filters.Campanha} 
              options={availableOptions.Campanha} 
              onChange={(v) => handleFilterChange('Campanha', v)} 
            />
            <SidebarSelect 
              label="Sócio Cooperante" 
              value={filters.Nome} 
              options={availableOptions.Nome} 
              onChange={(v) => handleFilterChange('Nome', v)} 
            />
            <SidebarSelect 
              label="Variedade (Casta)" 
              value={filters.CastaDesc} 
              options={availableOptions.CastaDesc} 
              onChange={(v) => handleFilterChange('CastaDesc', v)} 
            />
            <SidebarSelect 
              label="Local / Propriedade" 
              value={filters.PropriedadeDesc} 
              options={availableOptions.PropriedadeDesc} 
              onChange={(v) => handleFilterChange('PropriedadeDesc', v)} 
            />
            <SidebarSelect 
              label="Parcela Produção" 
              value={filters.ParcelaDesc} 
              options={availableOptions.ParcelaDesc} 
              onChange={(v) => handleFilterChange('ParcelaDesc', v)} 
            />
            <SidebarSelect 
              label="Cor da Uva" 
              value={filters.CDU_Cor} 
              options={availableOptions.CDU_Cor} 
              onChange={(v) => handleFilterChange('CDU_Cor', v)} 
            />
          </div>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="main-content">
        {/* Compact Summary Ribbon */}
        <section className="summary-ribbon sticky top-[132px] z-[90]">
          <div className="flex flex-col border-r border-slate-100 pr-6 shrink-0">
             <div className="flex items-center gap-2 mb-1">
                <Layers className="w-3 h-3 text-indigo-600" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboard</h2>
             </div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Resumo de Dados</p>
          </div>
          
          <div className="summary-grid">
            <KPICard 
              title="Uva Entregue" 
              value={`${stats.totalPeso.toLocaleString()} Kg`} 
              icon={<Package className="text-indigo-600" />}
              color="indigo"
              subtitle={`Casta: ${stats.topCastaName}`}
            />
            <KPICard 
              title="Grau/Kg Entregue" 
              value={`${Math.round(stats.totalGrauKilos).toLocaleString()} G/K`} 
              icon={<Zap className="text-amber-500" />}
              color="amber"
              subtitle={`Qualid.: ${stats.avgGrau.toFixed(1)}º`}
            />
            <KPICard 
              title="Valorização Total" 
              value={`${stats.totalValor.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`} 
              icon={<TrendingUp className="text-emerald-500" />}
              color="emerald"
              subtitle={`Sócios: ${new Set(filteredData.map(d => d.CodSocio)).size}`}
            />
            <KPICard 
               title="Registos" 
               value={stats.count.toLocaleString()} 
               icon={<RefreshCw className="text-blue-500" />}
               color="blue"
               subtitle="Total Encontrados"
            />
          </div>
        </section>

        {/* Charts Section */}
        {filteredData.length > 0 ? (
          <div className="space-y-12">
            {/* Row 1: Weight Analysis */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-8 w-1 bg-indigo-600 rounded-full" />
                 <h3 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight">Análise de Massa (Kg)</h3>
              </div>
              <div className="chart-grid">
                <div className="chart-container">
                  <div className="chart-header">
                    <h3 className="chart-title flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-indigo-500" />
                        Top Sócios por Entrega (Barras)
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={dataBySocio.sortedByKg} layout="vertical" margin={{ left: 40, right: 40 }}>
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
                        formatter={(value: any) => [`${value?.toLocaleString()} Kg`, 'Peso']}
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
                        data={dataByCasta.sortedByKg}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {dataByCasta.sortedByKg.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                         formatter={(value: any) => [`${value?.toLocaleString()} Kg`, 'Peso']}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Potential Analysis */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-8 w-1 bg-amber-500 rounded-full" />
                 <h3 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight">Análise de Potencial (Grau-Kg)</h3>
              </div>
              <div className="chart-grid">
                <div className="chart-container">
                  <div className="chart-header">
                    <h3 className="chart-title flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-amber-500" />
                        Top Sócios por Qualidade (Grau-Kg)
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={dataBySocio.sortedByGrauKg} layout="vertical" margin={{ left: 40, right: 40 }}>
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
                        formatter={(value: any) => [`${Math.round(value || 0).toLocaleString()} G/K`, 'Potencial']}
                      />
                      <Bar dataKey="grauKg" fill="#f59e0b" radius={[0, 8, 8, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <div className="chart-header">
                    <h3 className="chart-title flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-500" />
                        Distribuição por Potencial (Piza)
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={dataByCasta.sortedByGrauKg}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={4}
                        dataKey="grauKg"
                      >
                        {dataByCasta.sortedByGrauKg.map((_: any, index: number) => (
                          <Cell key={`cell-potential-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                         formatter={(value: any) => [`${Math.round(value || 0).toLocaleString()} G/K`, 'Potencial']}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
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

const SidebarSelect = ({ label, value, options, onChange }: { 
  label: string, value: string, options: string[], onChange: (v: string) => void 
}) => (
  <div className="filter-group">
    <label className="filter-label">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="filter-select"
    >
      <option value="">-- Todos --</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const KPICard = ({ title, value, color, subtitle }: {
  title: string, value: string, icon: React.ReactElement, color: string, subtitle?: string
}) => (
  <div className="kpi-card group hover:translate-y-[-1px] transition-all duration-300 !py-2">
    <div className="min-w-0 flex-1">
      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{title}</p>
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-black text-slate-900 font-outfit truncate">{value}</h2>
        {subtitle && (
          <p className="text-[9px] font-medium text-slate-400 flex items-center gap-1 truncate opacity-70">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className={`absolute bottom-0 left-0 h-0.5 bg-${color}-500 w-full opacity-10 group-hover:opacity-40 transition-opacity`} />
  </div>
);

const Wine = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>
    </svg>
);

export default Dashboard;
