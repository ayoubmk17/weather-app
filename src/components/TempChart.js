import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function TempChart({ data }) {
  // Préparer les données pour le graphique
  const chartData = data.map(item => ({
    date: new Date(item.dt_txt).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }),
    temp: Math.round(item.main.temp)
  }));

  return (
    <div style={{ width: '100%', height: 250, marginTop: '30px' }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis unit="°C" domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip formatter={value => '${value}°C'} />
          <Line type="monotone" dataKey="temp" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

TempChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      dt_txt: PropTypes.string.isRequired,
      main: PropTypes.shape({
        temp: PropTypes.number.isRequired
      }).isRequired
    })
  ).isRequired
};