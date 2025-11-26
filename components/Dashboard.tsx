import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FinancialKpi } from '../types';
import { api } from '../services/api';
import { PortfolioSection } from './Portfolio';

const KpiCard = ({
  title,
  value,
  prefix = '',
  suffix = '',
}: {
  title: string;
  value?: string | number | null;
  prefix?: string;
  suffix?: string;
}) => {
  const isMissing = value === null || value === undefined;

  const formatted = isMissing
    ? '—'
    : typeof value === 'number'
    ? value.toLocaleString('tr-TR')
    : value;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <span className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
        {title}
      </span>
      <span className="text-2xl font-bold text-slate-800">
        {isMissing ? formatted : `${prefix}${formatted}${suffix}`}
      </span>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<FinancialKpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getKpis()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Finansal veriler yükleniyor...
      </div>
    );

  if (!data.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        Gösterilecek finansal veri bulunamadı.
      </div>
    );
  }

  const latest = data[data.length - 1];

  // Grafik için üst limit (max değerin %20 üstü)
  const maxValue = Math.max(
    ...data.map((d) => d.total_assets),
    ...data.map((d) => d.equity),
    0,
  );
  const yMax = maxValue ? maxValue * 1.2 : undefined;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Finansal Özet</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          Dönem: {latest?.period}
        </span>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Toplam Varlıklar"
          value={latest?.total_assets}
          suffix=" TL"
        />
        <KpiCard
          title="Özkaynaklar"
          value={latest?.equity}
          suffix=" TL"
        />
        <KpiCard
          title="Yatırım Amaçlı Gayrimenkuller"
          value={latest?.investment_properties}
          suffix=" TL"
        />
        <KpiCard
          title="Net Kâr"
          value={latest?.net_profit}
          suffix=" TL"
        />
      </div>

      {/* Büyüme Trendi */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6 text-slate-800">
          Büyüme Trendi (Varlıklar vs Özkaynak)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis
                stroke="#94a3b8"
                domain={yMax ? [0, yMax] : undefined}
                tickFormatter={(val) =>
                  `${(val / 1_000_000_000).toFixed(1)}B`
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString('tr-TR') + ' TL'
                }
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow:
                    '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_assets"
                name="Toplam Varlıklar"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="equity"
                name="Özkaynaklar"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Portföy Özeti */}
      <PortfolioSection />
    </div>
  );
};
