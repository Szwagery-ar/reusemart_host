"use client";

import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart as ReLineChart,
    Line,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

export function BarChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" />
            </ReBarChart>
        </ResponsiveContainer>
    );
}

export function LineChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" />
            </ReLineChart>
        </ResponsiveContainer>
    );
}

export function PieChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </RePieChart>
        </ResponsiveContainer>
    );
}
