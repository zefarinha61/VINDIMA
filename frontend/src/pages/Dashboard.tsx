import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, Users, Zap, TrendingUp, Package, Calendar, 
  ArrowUpRight, ArrowDownRight, RefreshCw
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

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

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
        console.error('Error fetching data:', err);
        setError('Erro ao carregar dados do servidor.');
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

  const filteredData = data.filter(item => {
    return (
      (!filters.Campanha || item.Campanha === filters.Campanha) &&
      (!filters.Nome || item.Nome === filters.Nome) &&
      (!filters.CastaDesc || item.CastaDesc === filters.CastaDesc) &&
      (!filters.PropriedadeDesc || item.PropriedadeDesc === filters.PropriedadeDesc) &&
      (!filters.ParcelaDesc || item.ParcelaDesc === filters.ParcelaDesc) &&
      (!filters.CDU_Cor || item.CDU_Cor === filters.CDU_Cor)
    );
  });

  const getUniqueOptions = (key: keyof Entrega) => {
    const options = Array.from(new Set(data.map(item => String(item[key])))).filter(Boolean).sort();
    return options;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-xl font-medium">A carregar dados da vindima...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
        <p className="text-xl text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );

  // Aggregated data for charts (using filteredData)
  const totalPeso = filteredData.reduce((acc, curr) => acc + curr.PesoLiquido, 0);
  const totalValor = filteredData.reduce((acc, curr) => acc + curr.ValorizacaoTotalUva, 0);
  const avgGrau = filteredData.length > 0 ? filteredData.reduce((acc, curr) => acc + curr.grau, 0) / filteredData.length : 0;

  const dataByCasta = Object.values(
    filteredData.reduce((acc: any, curr) => {
      if (!acc[curr.CastaDesc]) {
        acc[curr.CastaDesc] = { name: curr.CastaDesc, value: 0 };
      }
      acc[curr.CastaDesc].value += curr.PesoLiquido;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b.value - a.value).slice(0, 7);

  const dataBySocio = Object.values(
    filteredData.reduce((acc: any, curr) => {
      if (!acc[curr.Nome]) {
        acc[curr.Nome] = { name: curr.Nome, peso: 0, valor: 0 };
      }
      acc[curr.Nome].weight += curr.PesoLiquido;
      acc[curr.Nome].value += curr.ValorizacaoTotalUva;
      return acc;
    }, {})
  ).map((item: any) => ({ ...item, peso: item.weight, valor: item.value }))
  .sort((a: any, b: any) => b.peso - a.peso).slice(0, 10);

  return (
    <div className="dashboard-container">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-indigo-500" />
            VINDIMA <span className="text-indigo-500">2026</span>
          </h1>
          <p className="text-slate-400 mt-1">Análise de Entregas por Sócios</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Limpar Filtros
          </button>
          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Campanha {data[0]?.Campanha || '---'}</span>
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <FilterSelect 
          label="Campanha" 
          value={filters.Campanha} 
          options={getUniqueOptions('Campanha')} 
          onChange={(val) => handleFilterChange('Campanha', val)} 
        />
        <FilterSelect 
          label="Sócio" 
          value={filters.Nome} 
          options={getUniqueOptions('Nome')} 
          onChange={(val) => handleFilterChange('Nome', val)} 
        />
        <FilterSelect 
          label="Casta" 
          value={filters.CastaDesc} 
          options={getUniqueOptions('CastaDesc')} 
          onChange={(val) => handleFilterChange('CastaDesc', val)} 
        />
        <FilterSelect 
          label="Propriedade" 
          value={filters.PropriedadeDesc} 
          options={getUniqueOptions('PropriedadeDesc')} 
          onChange={(val) => handleFilterChange('PropriedadeDesc', val)} 
        />
        <FilterSelect 
          label="Parcela" 
          value={filters.ParcelaDesc} 
          options={getUniqueOptions('ParcelaDesc')} 
          onChange={(val) => handleFilterChange('ParcelaDesc', val)} 
        />
        <FilterSelect 
          label="Cor" 
          value={filters.CDU_Cor} 
          options={getUniqueOptions('CDU_Cor')} 
          onChange={(val) => handleFilterChange('CDU_Cor', val)} 
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Peso Total" 
          value={`${(totalPeso / 1000).toFixed(1)} T`} 
          subValue={`${totalPeso.toLocaleString()} Kg total`}
          icon={<Package className="text-blue-500" />}
          trend={`${filteredData.length} entregas`}
          trendUp={true}
        />
        <StatCard 
          title="Grau Médio" 
          value={`${avgGrau.toFixed(2)}º`} 
          subValue="Média ponderada"
          icon={<Zap className="text-yellow-500" />}
          trend="Estável"
          trendUp={true}
        />
        <StatCard 
          title="Valor Total" 
          value={`${totalValor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}`} 
          subValue="Valorização total"
          icon={<TrendingUp className="text-emerald-500" />}
          trend="Normal"
          trendUp={true}
        />
        <StatCard 
          title="Sócios" 
          value={new Set(filteredData.map(d => d.CodSocio)).size.toString()} 
          subValue="Sócios representados"
          icon={<Users className="text-purple-500" />}
          trend="Ativos"
          trendUp={true}
        />
      </div>

      {/* Charts Grid */}
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 chart-card h-[500px]">
            <h3 className="text-lg font-semibold text-white mb-6">Top Sócios por Entrega (Kg)</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={dataBySocio} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={150} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} Kg`, 'Peso']}
                />
                <Bar dataKey="peso" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card h-[500px]">
            <h3 className="text-lg font-semibold text-white mb-6">Distribuição por Casta</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={dataByCasta}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataByCasta.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} Kg`, 'Total']}
                />
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-slate-900/30 border border-dashed border-slate-700 rounded-3xl mb-8">
          <div className="p-4 bg-slate-800 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white">Nenhum dado encontrado</h3>
          <p className="text-slate-400 mt-2">Tente ajustar os filtros selecionados.</p>
          <button 
            onClick={clearFilters}
            className="mt-6 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white transition-colors"
          >
            Resetar Filtros
          </button>
        </div>
      )}
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, options, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800/80 border border-slate-700/50 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer appearance-none"
    >
      <option value="">Todos</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon, trend, trendUp }) => (
  <div className="stat-card">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700">
        {icon}
      </div>
      <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {trend}
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h2 className="text-2xl font-bold text-white tabular-nums">{value}</h2>
      <p className="text-slate-500 text-xs">{subValue}</p>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
  </div>
);

export default Dashboard;
