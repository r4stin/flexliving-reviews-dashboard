'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import type { TimeseriesPoint, ChannelRow } from '../types';

export default function ChartsSidePanel({
  timeseries, channelDist,
}: {
  timeseries: TimeseriesPoint[];
  channelDist: ChannelRow[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Average Rating Over Time</CardTitle>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="avg" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Reviews by Channel</CardTitle>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelDist}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
