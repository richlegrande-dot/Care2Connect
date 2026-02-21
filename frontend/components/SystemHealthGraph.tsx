"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface HealthSnapshot {
  timestamp: string;
  status: string;
  services: {
    db?: { ok: boolean };
    storage?: { ok: boolean };
  };
  degradedReasons?: string[];
}

interface SystemHealthGraphProps {
  token: string;
}

export default function SystemHealthGraph({ token }: SystemHealthGraphProps) {
  const [history, setHistory] = useState<HealthSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/health/history?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch health history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
        <div className="text-gray-500">Loading health data...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
        <div className="text-gray-500">No health data available</div>
      </div>
    );
  }

  // Transform data for chart
  const chartData = history
    .slice()
    .reverse()
    .map((snapshot, index) => ({
      index,
      time: new Date(snapshot.timestamp).toLocaleTimeString(),
      ready: snapshot.status === "ready" ? 1 : 0,
      degraded: snapshot.status === "degraded" ? 1 : 0,
      dbOk: snapshot.services?.db?.ok ? 1 : 0,
      storageOk: snapshot.services?.storage?.ok ? 1 : 0,
    }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Health Status Timeline
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            domain={[0, 1]}
            ticks={[0, 1]}
            tickFormatter={(value) => (value === 1 ? "OK" : "DOWN")}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
            formatter={(value: any) => (value === 1 ? "OK" : "DOWN")}
          />
          <Legend />
          <Line
            type="stepAfter"
            dataKey="ready"
            stroke="#10b981"
            strokeWidth={2}
            name="Ready"
            dot={false}
          />
          <Line
            type="stepAfter"
            dataKey="degraded"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Degraded"
            dot={false}
          />
          <Line
            type="stepAfter"
            dataKey="dbOk"
            stroke="#3b82f6"
            strokeWidth={1}
            name="Database"
            dot={false}
          />
          <Line
            type="stepAfter"
            dataKey="storageOk"
            stroke="#8b5cf6"
            strokeWidth={1}
            name="Storage"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {chartData.filter((d) => d.ready === 1).length}
          </div>
          <div className="text-gray-600">Ready</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {chartData.filter((d) => d.degraded === 1).length}
          </div>
          <div className="text-gray-600">Degraded</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {chartData.filter((d) => d.dbOk === 1).length}
          </div>
          <div className="text-gray-600">DB OK</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {chartData.filter((d) => d.storageOk === 1).length}
          </div>
          <div className="text-gray-600">Storage OK</div>
        </div>
      </div>
    </div>
  );
}
