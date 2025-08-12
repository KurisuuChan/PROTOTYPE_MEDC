import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const MonthlySalesChart = ({ data }) => {
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
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip cursor={{ fill: "rgba(239, 246, 255, 0.5)" }} />
        <Bar dataKey="sales" fill="#3B82F6" barSize={30} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

MonthlySalesChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default MonthlySalesChart;


