'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

type Props = {
  timeseries: { day: string; avg: number | null }[];
  channelDist: { name: string; count: number }[];
};

export default function Charts({ timeseries, channelDist }: Props) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle>Average Rating Over Time</CardTitle>
        <div className="h-64">
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
        <div className="h-64">
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
    </section>
  );
}
