import React from "react";
import { TailSpin } from 'react-loader-spinner';

const LoaderOnly: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60, width: 60, margin: '0 auto', ...style }}>
    <TailSpin height={40} width={40} color="#ff8400" />
  </div>
);

export default LoaderOnly;