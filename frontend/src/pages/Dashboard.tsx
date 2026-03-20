import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, Users, Zap, TrendingUp, Package, Calendar, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Filter, Download,
  ChevronRight, MapPin, Wine
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
];

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
        setError('Erro na ligação ao servidor PRIADEGA. Verifique se o backend está ativo.');
      } finally {
        setTimeout(() => setLoading(false), 800); // Smooth transition
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

  // Analytics Processing
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
    return Object.values(grouped).sort((a: any, b: any) => b.value - a.value).slice(0, 8);
  }, [filteredData]);

  const dataBySocio = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      if (!acc[curr.Nome]) acc[curr.Nome] = { name: curr.Nome, peso: 0 };
      acc[curr.Nome].peso += curr.PesoLiquido;
      return acc;
    }, {});
    return Object.values(grouped).sort((a: any, b: any) => b.peso - a.peso).slice(0, 10);
  }, [filteredData]);

  const dataTrend = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      const date = new Date(curr.DataMovimento).toLocaleDateString('pt-PT');
      if (!acc[date]) acc[date] = { date, peso: 0, count: 0 };
      acc[date].peso += curr.PesoLiquido;
      acc[date].count += 1;
      return acc;
    }, {});
    return Object.values(grouped).sort((a: any, b: any) => {
        const dateA = a.date.split('/').reverse().join('-');
        const dateB = b.date.split('/').reverse().join('-');
        return dateA.localeCompare(dateB);
    });
  }, [filteredData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] text-white overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-24 h-24 mb-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-indigo-500 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-r-2 border-purple-500 rounded-full opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <Wine className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <p className="text-xl font-light tracking-widest text-slate-300">VINDIMA 2026</p>
        <div className="mt-4 w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
            <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-full h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
            />
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="dashboard-container relative">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] -z-10 rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] -z-10 rounded-full" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in pt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-lg shadow-indigo-500/20">
              PRIADEGA Live
            </div>
          </div>
          <h1 className="text-5xl font-extrabold flex items-center gap-4">
            VINDIMA <span className="text-indigo-400 font-light italic">Core</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            Análise Avançada de Entregas por sócios
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearFilters}
            className="flex items-center gap-2 px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md border border-slate-700/50 rounded-2xl text-slate-300 transition-all text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar
          </motion.button>
          <motion.button 
             whileHover={{ scale: 1.05 }}
             className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-600/25 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </motion.button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in [animation-delay:100ms]">
        <StatCard 
          title="Peso Total Entregue" 
          value={`${(stats.totalPeso / 1000).toLocaleString('pt-PT', { maximumFractionDigits: 1 })} T`} 
          subValue={`${stats.totalPeso.toLocaleString()} Kg em armazém`}
          icon={<Package className="text-indigo-400 w-6 h-6" />}
          color="indigo"
          trend="+8% vs ontem"
        />
        <StatCard 
          title="Grau Alcoólico Médio" 
          value={`${stats.avgGrau.toFixed(2)}º`} 
          subValue="Média ponderada por peso"
          icon={<Zap className="text-amber-400 w-6 h-6" />}
          color="amber"
          trend="Equilibrado"
        />
        <StatCard 
          title="Valorização Estimada" 
          value={`${stats.totalValor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}`} 
          subValue="Valor acumulado na campanha"
          icon={<TrendingUp className="text-emerald-400 w-6 h-6" />}
          color="emerald"
          trend="+14% vs C2025"
        />
        <StatCard 
          title="Sócios Activos" 
          value={new Set(filteredData.map(d => d.CodSocio)).size.toString()} 
          subValue={`${stats.count} movimentos de entrega`}
          icon={<Users className="text-purple-400 w-6 h-6" />}
          color="purple"
          trend="Frequência alta"
        />
      </div>

      {/* Filters Area */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white uppercase tracking-widest text-sm">Filtros de Detalhe</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <FilterSelect 
            label="Campanha" 
            value={filters.Campanha} 
            options={getUniqueOptions('Campanha')} 
            onChange={(v) => handleFilterChange('Campanha', v)} 
          />
          <FilterSelect 
            label="Sócio" 
            value={filters.Nome} 
            options={getUniqueOptions('Nome')} 
            onChange={(v) => handleFilterChange('Nome', v)} 
          />
          <FilterSelect 
            label="Casta Principal" 
            value={filters.CastaDesc} 
            options={getUniqueOptions('CastaDesc')} 
            onChange={(v) => handleFilterChange('CastaDesc', v)} 
          />
          <FilterSelect 
            label="Propriedade" 
            value={filters.PropriedadeDesc} 
            options={getUniqueOptions('PropriedadeDesc')} 
            onChange={(v) => handleFilterChange('PropriedadeDesc', v)} 
          />
          <FilterSelect 
            label="Parcela" 
            value={filters.ParcelaDesc} 
            options={getUniqueOptions('ParcelaDesc')} 
            onChange={(v) => handleFilterChange('ParcelaDesc', v)} 
          />
          <FilterSelect 
            label="Cor da Uva" 
            value={filters.CDU_Cor} 
            options={getUniqueOptions('CDU_Cor')} 
            onChange={(v) => handleFilterChange('CDU_Cor', v)} 
          />
        </div>
      </motion.div>

      {/* Main Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Trend Area Chart */}
        <AnimatePresence mode="wait">
            <motion.div 
            key={filteredData.length}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 glass-panel h-[500px]"
            >
            <div className="flex items-center justify-between mb-8">
                <div>
                <h3 className="text-xl font-bold text-white mb-1">Tendência de Entrega (Kg)</h3>
                <p className="text-sm text-slate-500">Volume diário recebido na adega</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1.5 rounded-lg">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                   LIVE FEED
                </div>
            </div>
            <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={dataTrend}>
                <defs>
                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis 
                    stroke="#475569" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v/1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                    type="monotone" 
                    dataKey="peso" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorPeso)" 
                />
                </AreaChart>
            </ResponsiveContainer>
            </motion.div>
        </AnimatePresence>

        {/* Pie Distribution Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 glass-panel h-[500px]"
        >
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-1">Casta Principal</h3>
            <p className="text-sm text-slate-500">Distribuição por relevância</p>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={dataByCasta}
                cx="50%"
                cy="45%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {dataByCasta.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px', fontSize: '11px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Second Row: Bar Chart & List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-panel min-h-[500px]"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Top Sócios por Peso (Kg)</h3>
              <p className="text-sm text-slate-500">Maiores contribuintes da campanha</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={dataBySocio} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#94a3b8" 
                fontSize={10} 
                width={120} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="peso" 
                fill="#6366f1" 
                radius={[0, 10, 10, 0]} 
                barSize={32}
              >
                {dataBySocio.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#barGrad-${index})`} />
                ))}
              </Bar>
              <defs>
                {dataBySocio.map((_, index) => (
                  <linearGradient key={`grad-${index}`} id={`barGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} />
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-panel overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Detalhamento Recente</h3>
              <p className="text-sm text-slate-500">Últimos movimentos filtrados</p>
            </div>
            <button className="text-indigo-400 text-xs font-bold flex items-center gap-1 hover:text-indigo-300 transition-colors">
                Ver Tudo <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredData.slice(0, 8).map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                    {item.Nome.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.Nome}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Wine className="w-2.5 h-2.5" />
                        {item.CastaDesc} • {item.ArtigoDesc}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-400">{item.PesoLiquido.toLocaleString()} Kg</p>
                  <p className="text-[10px] text-slate-500">{new Date(item.DataMovimento).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
            {filteredData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 italic text-sm">
                    Sem movimentos encontrados para os filtros.
                </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">{payload[0].name || payload[0].payload.name || payload[0].payload.date}</p>
        <p className="text-lg font-bold text-white">
          {Number(payload[0].value).toLocaleString()} <span className="text-xs font-light text-slate-400">Kg/Units</span>
        </p>
        {payload[0].payload.count && (
            <p className="text-[10px] text-indigo-400 mt-1">{payload[0].payload.count} Entregas realizadas</p>
        )}
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, subValue, icon, color, trend }: any) => {
  const colorMap: any = {
    indigo: "from-indigo-500/20 to-transparent border-indigo-500/20",
    amber: "from-amber-500/20 to-transparent border-amber-500/20",
    emerald: "from-emerald-500/20 to-transparent border-emerald-500/20",
    purple: "from-purple-500/20 to-transparent border-purple-500/20",
  };

  return (
    <div className={cn("glass-panel !p-6 relative overflow-hidden group")}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", colorMap[color])} />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-white/5 shadow-inner">
            {icon}
          </div>
          <div className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg">
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{title}</p>
          <h2 className="text-3xl font-black text-white stat-value">{value}</h2>
          <p className="text-slate-500 text-[11px] font-medium">{subValue}</p>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ label, value, options, onChange }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">{label}</label>
    <div className="relative group">
        <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 text-slate-200 text-xs rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer appearance-none hover:bg-slate-800/80"
        >
            <option value="">Todos</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-slate-400 transition-colors">
            <ChevronRight className="w-3 h-3 rotate-90" />
        </div>
    </div>
  </div>
);

export default Dashboard;
