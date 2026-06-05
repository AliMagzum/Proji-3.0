import { motion } from 'motion/react';
import { TrendingUp, BarChart3, Target } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ChartCardProps {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: { name: string; value: number }[];
}

export const ChartCard = ({ type, title, data }: ChartCardProps) => {
  return (
    <div className="bg-white border border-proji-border rounded-[2.5rem] p-8 shadow-lg mt-6 flex-1 min-w-[300px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-proji-primary/10 rounded-2xl text-proji-primary">
            {type === 'line' ? <TrendingUp size={20} /> : type === 'bar' ? <BarChart3 size={20} /> : <Target size={20} />}
          </div>
          <h4 className="text-sm font-black uppercase tracking-widest text-proji-dark">{title}</h4>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          ) : (
            <div className="flex items-end justify-between h-full gap-2 px-2">
              {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.value / Math.max(...data.map(x => x.value))) * 100}%` }}
                    className="w-full bg-blue-500/20 border-t-4 border-blue-500 rounded-t-lg"
                  />
                  <span className="text-[9px] font-bold text-proji-secondary">{d.name}</span>
                </div>
              ))}
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
