import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import type { BusinessDomain } from '../../types';

interface BottleneckDashboardProps {
  domain: BusinessDomain;
}

const NODES = [
  { name: 'Узел A', value: 85, color: '#F44336' },
  { name: 'Узел B', value: 45, color: '#4CAF50' },
  { name: 'Узел C', value: 65, color: '#FFC107' },
];

export const BottleneckDashboard = ({ domain }: BottleneckDashboardProps) => {
  return (
    <div className="bg-white border border-red-200 rounded-[2.5rem] p-8 shadow-xl mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-proji-dark uppercase tracking-tight">Дашборд узкого места</h3>
            <p className="text-[10px] font-bold text-proji-secondary uppercase tracking-widest">Аналитика домена: {domain}</p>
          </div>
        </div>
        <div className="px-4 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100">Критично</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {NODES.map((item, i) => (
          <div key={i} className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary mb-3">{item.name}</p>
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 h-32 bg-white rounded-xl border border-slate-200 relative overflow-hidden flex items-end px-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${item.value}%` }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className="w-full rounded-t-lg"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-proji-dark">{item.value}%</p>
                <p className="text-[9px] font-bold text-proji-secondary uppercase">Загрузка</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-proji-sidebar rounded-2xl border border-proji-border text-[13px] text-proji-secondary font-medium leading-relaxed italic">
        Рекомендация: Перераспределить ресурсы с Узла B на Узел A для выравнивания производительности.
      </div>
    </div>
  );
};
