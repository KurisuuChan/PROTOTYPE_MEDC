import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const SalesByCategoryChart = ({ data }) => {
  const [Recharts, setRecharts] = useState(null);

  useEffect(() => {
    let mounted = true;
    import("recharts").then((mod) => {
      if (mounted) setRecharts(mod);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!Recharts) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        Loading chart...
      </div>
    );
  }

  const { ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar } = Recharts;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart layout="vertical" data={data} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" scale="band" width={80} />
        <Tooltip cursor={{ fill: "rgba(239, 246, 255, 0.5)" }} />
        <Bar dataKey="value" barSize={20} fill="#8B5CF6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

SalesByCategoryChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default SalesByCategoryChart;


