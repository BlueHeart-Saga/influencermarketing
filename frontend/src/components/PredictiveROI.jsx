// import React, { useState } from "react";
// import "../style/PredictiveROI.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// export default function PredictiveROI() {
//   const [formData, setFormData] = useState({
//     cost: 50000,
//     reach: 10000,
//     engagement_rate: 4.5,
//     conversion_rate: 2.5,
//     average_order_value: 2500,
//   });

//   const [prediction, setPrediction] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const calculateROI = () => {
//     const { cost, reach, engagement_rate, conversion_rate, average_order_value } = formData;
    
//     if (!cost || !reach || !engagement_rate || !conversion_rate || !average_order_value) {
//       setError("Please fill all fields");
//       return;
//     }

//     setLoading(true);
//     setError(null);
    
//     // Simulate API call delay
//     setTimeout(() => {
//       try {
//         // Calculate predicted revenue
//         const estimated_conversions = reach * (conversion_rate / 100);
//         const predicted_revenue = estimated_conversions * average_order_value;
        
//         // Calculate ROI
//         const predicted_roi = ((predicted_revenue - cost) / cost) * 100;
        
//         setPrediction({
//           predicted_revenue,
//           predicted_roi,
//           estimated_conversions
//         });
//       } catch (error) {
//         console.error("Calculation failed", error);
//         setError("Failed to calculate ROI. Please check your inputs.");
//         setPrediction(null);
//       } finally {
//         setLoading(false);
//       }
//     }, 800);
//   };

//   // Determine ROI color
//   const roiColor =
//     prediction && prediction.predicted_roi >= 100
//       ? "#16a34a"
//       : prediction && prediction.predicted_roi >= 50
//       ? "#f59e0b"
//       : "#ef4444";

//   // Prepare chart data
//   const comparisonData =
//     prediction !== null
//       ? [
//           { name: "Cost", value: parseFloat(formData.cost), fill: "#6366f1" },
//           { name: "Revenue", value: prediction.predicted_revenue, fill: roiColor },
//         ]
//       : [];

//   // Prepare ROI trend data (simulated)
//   const roitrendData = [
//     { month: 'Jan', roi: 0 },
//     { month: 'Feb', roi: 15 },
//     { month: 'Mar', roi: 25 },
//     { month: 'Apr', roi: 40 },
//     { month: 'May', roi: prediction ? Math.max(0, prediction.predicted_roi) : 60 },
//   ];

//   // Prepare engagement data
//   const engagementData = [
//     { name: 'Impressions', value: formData.reach, fill: '#6366f1' },
//     { name: 'Engagements', value: formData.reach * (formData.engagement_rate / 100), fill: '#f59e0b' },
//     { name: 'Conversions', value: formData.reach * (formData.conversion_rate / 100), fill: '#10b981' },
//   ];

//   // Simple bar chart component
//   const SimpleBarChart = ({ data, height = 300 }) => {
//     const maxValue = Math.max(...data.map(item => item.value));
    
//     return (
      
//       <div style={{ height: `${height}px`, display: 'flex', alignItems: 'flex-end', gap: '30px', padding: '20px 0' }}>
//         {data.map((item, index) => (
//           <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
//             <div
//               style={{
//                 height: `${(item.value / maxValue) * 80}%`,
//                 width: '100%',
//                 backgroundColor: item.fill,
//                 borderRadius: '6px',
//                 minHeight: '10px'
//               }}
//             />
//             <div style={{ marginTop: '10px', fontWeight: 'bold' }}>{item.name}</div>
//             <div style={{ marginTop: '5px' }}>₹{item.value.toLocaleString()}</div>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   // Simple line chart component
//   const SimpleLineChart = ({ data, height = 300 }) => {
//     const values = data.map(item => item.roi);
//     const maxValue = Math.max(...values);
    
//     return (

//       <div style={{ height: `${height}px`, position: 'relative', padding: '20px 0' }}>
//         <div style={{ display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'space-between' }}>
//           {[0, 25, 50, 75, 100].map((value) => (
//             <div key={value} style={{ display: 'flex', alignItems: 'center' }}>
//               <div style={{ width: '40px', textAlign: 'right', paddingRight: '10px', fontSize: '12px' }}>
//                 {value}%
//               </div>
//               <div style={{ flex: 1, borderTop: '1px solid #e5e7eb' }}></div>
//             </div>
//           ))}
//         </div>
        
//         <div style={{ position: 'absolute', bottom: '20px', left: '50px', right: '0', top: '20px' }}>
//           <div style={{ position: 'relative', height: '100%' }}>
//             {data.map((item, index) => (
//               <div
//                 key={index}
//                 style={{
//                   position: 'absolute',
//                   left: `${(index / (data.length - 1)) * 100}%`,
//                   bottom: `${(item.roi / maxValue) * 100}%`,
//                   transform: 'translateX(-50%)',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center'
//                 }}
//               >
//                 <div
//                   style={{
//                     width: '10px',
//                     height: '10px',
//                     borderRadius: '50%',
//                     backgroundColor: roiColor,
//                     border: `2px solid white`,
//                     boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
//                   }}
//                 />
//                 {index === data.length - 1 && (
//                   <div
//                     style={{
//                       position: 'absolute',
//                       top: '-25px',
//                       backgroundColor: 'rgba(0,0,0,0.8)',
//                       color: 'white',
//                       padding: '4px 8px',
//                       borderRadius: '4px',
//                       fontSize: '12px'
//                     }}
//                   >
//                     {item.roi.toFixed(1)}%
//                   </div>
//                 )}
//                 <div style={{ position: 'absolute', top: '15px', fontSize: '12px' }}>
//                   {item.month}
//                 </div>
//               </div>
//             ))}
            
//             {/* Line connecting the dots */}
//             <div
//               style={{
//                 position: 'absolute',
//                 bottom: 0,
//                 left: 0,
//                 right: 0,
//                 height: '2px',
//                 backgroundColor: roiColor,
//                 clipPath: `polygon(0% 100%, ${(data[0].roi / maxValue) * 100}% 100%, ${(data[1].roi / maxValue) * 100}% ${100 - (data[1].roi / maxValue) * 100}%, ${(data[2].roi / maxValue) * 100}% ${100 - (data[2].roi / maxValue) * 100}%, ${(data[3].roi / maxValue) * 100}% ${100 - (data[3].roi / maxValue) * 100}%, ${(data[4].roi / maxValue) * 100}% ${100 - (data[4].roi / maxValue) * 100}%, 100% ${100 - (data[4].roi / maxValue) * 100}%)`
//               }}
//             ></div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <><HomeTopBar />
//     <div className="roi-dashboard">


//       <header className="dashboard-header">
//         <div className="header-content">
//           <h1 className="dashboard-title">
//             <span className="icon">📈</span>
//             Predictive ROI Dashboard
//           </h1>
//           <p className="dashboard-subtitle">
//             Enter campaign details to see ROI insights in <b>₹ Rupees</b>
//           </p>
//         </div>
//       </header>

//       <div className="dashboard-content">
//         <div className="input-section">
//           <div className="input-card">
//             <div className="card-header">
//               <h3>Campaign Inputs</h3>
//               <div className="card-icon">⚙️</div>
//             </div>
//             <div className="card-body">
//               <div className="input-group">
//                 <label>Campaign Cost (₹)</label>
//                 <input
//                   type="number"
//                   name="cost"
//                   value={formData.cost}
//                   onChange={handleChange}
//                   className="input-field"
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Expected Reach</label>
//                 <input
//                   type="number"
//                   name="reach"
//                   value={formData.reach}
//                   onChange={handleChange}
//                   className="input-field"
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Engagement Rate (%)</label>
//                 <input
//                   type="number"
//                   step="0.1"
//                   name="engagement_rate"
//                   value={formData.engagement_rate}
//                   onChange={handleChange}
//                   className="input-field"
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Conversion Rate (%)</label>
//                 <input
//                   type="number"
//                   step="0.1"
//                   name="conversion_rate"
//                   value={formData.conversion_rate}
//                   onChange={handleChange}
//                   className="input-field"
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Average Order Value (₹)</label>
//                 <input
//                   type="number"
//                   name="average_order_value"
//                   value={formData.average_order_value}
//                   onChange={handleChange}
//                   className="input-field"
//                 />
//               </div>

//               {error && <div className="error-message">{error}</div>}

//               <button 
//                 onClick={calculateROI} 
//                 className={`calculate-btn ${loading ? 'loading' : ''}`}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner"></span>
//                     Calculating...
//                   </>
//                 ) : (
//                   'Calculate ROI'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {prediction && (
//           <div className="results-section">
//             <div className="metrics-grid">
//               <div className="metric-card">
//                 <div className="metric-icon">💰</div>
//                 <div className="metric-content">
//                   <h4>Predicted Revenue</h4>
//                   <p className="metric-value">₹{prediction.predicted_revenue.toLocaleString()}</p>
//                 </div>
//               </div>

//               <div className="metric-card">
//                 <div className="metric-icon" style={{ color: roiColor }}>📊</div>
//                 <div className="metric-content">
//                   <h4>Predicted ROI</h4>
//                   <p className="metric-value" style={{ color: roiColor }}>
//                     {prediction.predicted_roi.toFixed(2)}%
//                   </p>
//                 </div>
//               </div>

//               <div className="metric-card">
//                 <div className="metric-icon">👥</div>
//                 <div className="metric-content">
//                   <h4>Expected Conversions</h4>
//                   <p className="metric-value">
//                     {Math.round(formData.reach * (formData.conversion_rate / 100)).toLocaleString()}
//                   </p>
//                 </div>
//               </div>

//               <div className="metric-card">
//                 <div className="metric-icon">🔥</div>
//                 <div className="metric-content">
//                   <h4>Expected Engagements</h4>
//                   <p className="metric-value">
//                     {Math.round(formData.reach * (formData.engagement_rate / 100)).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="charts-grid">
//               <div className="chart-card">
//                 <div className="card-header">
//                   <h3>Cost vs Revenue</h3>
//                 </div>
//                 <div className="chart-container">
//                   <SimpleBarChart data={comparisonData} />
//                 </div>
//               </div>

//               <div className="chart-card">
//                 <div className="card-header">
//                   <h3>ROI Trend Projection</h3>
//                 </div>
//                 <div className="chart-container">
//                   <SimpleLineChart data={roitrendData} />
//                 </div>
//               </div>

//               <div className="chart-card">
//                 <div className="card-header">
//                   <h3>Funnel Analysis</h3>
//                 </div>
//                 <div className="chart-container">
//                   <SimpleBarChart data={engagementData} />
//                 </div>
//               </div>

//               <div className="chart-card">
//                 <div className="card-header">
//                   <h3>ROI Analysis</h3>
//                 </div>
//                 <div className="analysis-content">
//                   <div className="roi-analysis">
//                     <div className="analysis-item">
//                       <span className="analysis-label">Campaign Cost:</span>
//                       <span className="analysis-value">₹{formData.cost.toLocaleString()}</span>
//                     </div>
//                     <div className="analysis-item">
//                       <span className="analysis-label">Potential Revenue:</span>
//                       <span className="analysis-value">₹{prediction.predicted_revenue.toLocaleString()}</span>
//                     </div>
//                     <div className="analysis-item">
//                       <span className="analysis-label">Net Profit/Loss:</span>
//                       <span className="analysis-value" style={{color: prediction.predicted_revenue - formData.cost >= 0 ? '#16a34a' : '#ef4444'}}>
//                         ₹{(prediction.predicted_revenue - formData.cost).toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="analysis-item">
//                       <span className="analysis-label">ROI Percentage:</span>
//                       <span className="analysis-value" style={{color: roiColor}}>
//                         {prediction.predicted_roi.toFixed(2)}%
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//     </>
//   );
// }



import React, { useState } from 'react';
import { 
  TrendingUp, Calculator, DollarSign, Users,
  Target, Percent, BarChart3, LineChart,
  PieChart, Zap, AlertCircle, Clock,
  ChevronRight, RefreshCw, Sparkles
} from 'lucide-react';
import HomeTopBar from "../pages/HomePage/HomeTopBar";

export default function PredictiveROI() {
  const [formData, setFormData] = useState({
    cost: 50000,
    reach: 10000,
    engagement_rate: 4.5,
    conversion_rate: 2.5,
    average_order_value: 2500,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  const calculateROI = () => {
    const { cost, reach, engagement_rate, conversion_rate, average_order_value } = formData;
    
    if (!cost || !reach || !engagement_rate || !conversion_rate || !average_order_value) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      try {
        const estimated_conversions = reach * (conversion_rate / 100);
        const predicted_revenue = estimated_conversions * average_order_value;
        const predicted_roi = ((predicted_revenue - cost) / cost) * 100;
        
        setPrediction({
          predicted_revenue,
          predicted_roi,
          estimated_conversions,
          net_profit: predicted_revenue - cost,
          engagements: reach * (engagement_rate / 100)
        });
      } catch (error) {
        console.error("Calculation failed", error);
        setError("Failed to calculate ROI. Please check your inputs.");
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const roiColor = prediction && prediction.predicted_roi >= 100
    ? "#10B981"
    : prediction && prediction.predicted_roi >= 50
    ? "#F59E0B"
    : "#EF4444";

  const SimpleBarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="roi-bar-chart" style={{ height: `${height}px` }}>
        <div className="roi-bar-chart-bars">
          {data.map((item, index) => (
            <div key={index} className="roi-bar-chart-item">
              <div
                className="roi-bar-chart-bar"
                style={{
                  height: `${(item.value / maxValue) * 80}%`,
                  backgroundColor: item.fill,
                  minHeight: '10px'
                }}
              ></div>
              <div className="roi-bar-chart-label">{item.name}</div>
              <div className="roi-bar-chart-value">₹{item.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SimpleLineChart = ({ data, height = 200 }) => {
    const values = data.map(item => item.roi);
    const maxValue = Math.max(...values);
    
    return (
      <div className="roi-line-chart" style={{ height: `${height}px` }}>
        <div className="roi-line-chart-grid">
          {[0, 25, 50, 75, 100].map((value) => (
            <div key={value} className="roi-line-chart-grid-line">
              <span className="roi-line-chart-grid-label">{value}%</span>
            </div>
          ))}
        </div>
        
        <div className="roi-line-chart-path">
          {data.map((item, index) => (
            <div
              key={index}
              className="roi-line-chart-point"
              style={{
                left: `${(index / (data.length - 1)) * 100}%`,
                bottom: `${(item.roi / maxValue) * 100}%`,
              }}
            >
              <div className="roi-line-chart-dot" style={{ backgroundColor: roiColor }}></div>
              {index === data.length - 1 && (
                <div className="roi-line-chart-tooltip" style={{ backgroundColor: roiColor }}>
                  {item.roi.toFixed(1)}%
                </div>
              )}
              <div className="roi-line-chart-month">{item.month}</div>
            </div>
          ))}
          
          <div
            className="roi-line-chart-line"
            style={{ backgroundColor: roiColor }}
          ></div>
        </div>
      </div>
    );
  };

  const roitrendData = [
    { month: 'Jan', roi: 0 },
    { month: 'Feb', roi: 15 },
    { month: 'Mar', roi: 25 },
    { month: 'Apr', roi: 40 },
    { month: 'May', roi: prediction ? Math.max(0, prediction.predicted_roi) : 60 },
  ];

  const comparisonData = prediction
    ? [
        { name: "Cost", value: formData.cost, fill: "#6366f1" },
        { name: "Revenue", value: prediction.predicted_revenue, fill: roiColor },
      ]
    : [];

  const engagementData = [
    { name: 'Impressions', value: formData.reach, fill: '#3B82F6' },
    { name: 'Engagements', value: formData.reach * (formData.engagement_rate / 100), fill: '#10B981' },
    { name: 'Conversions', value: formData.reach * (formData.conversion_rate / 100), fill: '#F59E0B' },
  ];

  return (
    <>
      {/* <HomeTopBar /> */}
      <div className="roi-wrapper">
        {/* Main Content */}
        <div className="roi-main">
          <div className="roi-container">
            <div className="roi-layout">
              {/* Main Content Area */}
              <main className="roi-content">
                {/* Header */}
                <div className="roi-header-card">
                  <div className="roi-header-content">
                    <div className="roi-header-icon">
                      <TrendingUp size={32} />
                    </div>
                    <div>
                      <h1 className="roi-header-title">Predictive ROI Dashboard</h1>
                      <p className="roi-header-subtitle">
                        Enter campaign details to see ROI insights in <b>₹ Rupees</b>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input Section */}
                <div className="roi-input-section">
                  <div className="roi-input-card">
                    <div className="roi-input-header">
                      <h2 className="roi-input-title">
                        <Calculator size={20} />
                        <span>Campaign Inputs</span>
                      </h2>
                      <div className="roi-input-icon">
                        <Zap size={20} />
                      </div>
                    </div>
                    
                    <div className="roi-input-grid">
                      <div className="roi-input-group">
                        <label className="roi-input-label">
                          <DollarSign size={16} />
                          <span>Campaign Cost (₹)</span>
                        </label>
                        <input
                          type="number"
                          name="cost"
                          value={formData.cost}
                          onChange={handleChange}
                          className="roi-input"
                          min="0"
                        />
                      </div>

                      <div className="roi-input-group">
                        <label className="roi-input-label">
                          <Users size={16} />
                          <span>Expected Reach</span>
                        </label>
                        <input
                          type="number"
                          name="reach"
                          value={formData.reach}
                          onChange={handleChange}
                          className="roi-input"
                          min="0"
                        />
                      </div>

                      <div className="roi-input-group">
                        <label className="roi-input-label">
                          <Target size={16} />
                          <span>Engagement Rate (%)</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="engagement_rate"
                          value={formData.engagement_rate}
                          onChange={handleChange}
                          className="roi-input"
                          min="0"
                          max="100"
                        />
                      </div>

                      <div className="roi-input-group">
                        <label className="roi-input-label">
                          <Percent size={16} />
                          <span>Conversion Rate (%)</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="conversion_rate"
                          value={formData.conversion_rate}
                          onChange={handleChange}
                          className="roi-input"
                          min="0"
                          max="100"
                        />
                      </div>

                      <div className="roi-input-group">
                        <label className="roi-input-label">
                          <DollarSign size={16} />
                          <span>Average Order Value (₹)</span>
                        </label>
                        <input
                          type="number"
                          name="average_order_value"
                          value={formData.average_order_value}
                          onChange={handleChange}
                          className="roi-input"
                          min="0"
                        />
                      </div>
                    </div>

                    {error && <div className="roi-error">{error}</div>}

                    <button 
                      onClick={calculateROI} 
                      className={`roi-calculate-btn ${loading ? 'loading' : ''}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="roi-spinner"></div>
                          <span>Calculating...</span>
                        </>
                      ) : (
                        <>
                          <Calculator size={18} />
                          <span>Calculate ROI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Results Section */}
                {prediction && (
                  <div className="roi-results">
                    {/* Metrics Grid */}
                    <div className="roi-metrics-grid">
                      <div className="roi-metric-card">
                        <div className="roi-metric-icon">
                          <DollarSign size={24} />
                        </div>
                        <div className="roi-metric-content">
                          <div className="roi-metric-title">Predicted Revenue</div>
                          <div className="roi-metric-value">₹{prediction.predicted_revenue.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="roi-metric-card">
                        <div className="roi-metric-icon" style={{ color: roiColor }}>
                          <TrendingUp size={24} />
                        </div>
                        <div className="roi-metric-content">
                          <div className="roi-metric-title">Predicted ROI</div>
                          <div className="roi-metric-value" style={{ color: roiColor }}>
                            {prediction.predicted_roi.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      <div className="roi-metric-card">
                        <div className="roi-metric-icon">
                          <Users size={24} />
                        </div>
                        <div className="roi-metric-content">
                          <div className="roi-metric-title">Expected Conversions</div>
                          <div className="roi-metric-value">
                            {Math.round(prediction.estimated_conversions).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="roi-metric-card">
                        <div className="roi-metric-icon">
                          <Target size={24} />
                        </div>
                        <div className="roi-metric-content">
                          <div className="roi-metric-title">Expected Engagements</div>
                          <div className="roi-metric-value">
                            {Math.round(prediction.engagements).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="roi-charts-grid">
                      <div className="roi-chart-card">
                        <div className="roi-chart-header">
                          <h3 className="roi-chart-title">
                            <BarChart3 size={18} />
                            <span>Cost vs Revenue</span>
                          </h3>
                        </div>
                        <div className="roi-chart-content">
                          <SimpleBarChart data={comparisonData} />
                        </div>
                      </div>

                      <div className="roi-chart-card">
                        <div className="roi-chart-header">
                          <h3 className="roi-chart-title">
                            <LineChart size={18} />
                            <span>ROI Trend Projection</span>
                          </h3>
                        </div>
                        <div className="roi-chart-content">
                          <SimpleLineChart data={roitrendData} />
                        </div>
                      </div>

                      <div className="roi-chart-card">
                        <div className="roi-chart-header">
                          <h3 className="roi-chart-title">
                            <PieChart size={18} />
                            <span>Funnel Analysis</span>
                          </h3>
                        </div>
                        <div className="roi-chart-content">
                          <SimpleBarChart data={engagementData} />
                        </div>
                      </div>

                      <div className="roi-chart-card">
                        <div className="roi-chart-header">
                          <h3 className="roi-chart-title">
                            <Calculator size={18} />
                            <span>ROI Analysis</span>
                          </h3>
                        </div>
                        <div className="roi-analysis-content">
                          <div className="roi-analysis-list">
                            <div className="roi-analysis-item">
                              <span className="roi-analysis-label">Campaign Cost</span>
                              <span className="roi-analysis-value">₹{formData.cost.toLocaleString()}</span>
                            </div>
                            <div className="roi-analysis-item">
                              <span className="roi-analysis-label">Potential Revenue</span>
                              <span className="roi-analysis-value">₹{prediction.predicted_revenue.toLocaleString()}</span>
                            </div>
                            <div className="roi-analysis-item">
                              <span className="roi-analysis-label">Net Profit/Loss</span>
                              <span className="roi-analysis-value" style={{color: prediction.net_profit >= 0 ? '#10B981' : '#EF4444'}}>
                                ₹{prediction.net_profit.toLocaleString()}
                              </span>
                            </div>
                            <div className="roi-analysis-item">
                              <span className="roi-analysis-label">ROI Percentage</span>
                              <span className="roi-analysis-value" style={{color: roiColor}}>
                                {prediction.predicted_roi.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>

              {/* Sidebar */}
              <aside className="roi-sidebar">
                {/* Quick Stats */}
                <div className="roi-sidebar-section">
                  <h3 className="roi-sidebar-title">ROI Benchmarks</h3>
                  <div className="roi-benchmarks">
                    <div className="roi-benchmark">
                      <div className="roi-benchmark-icon">
                        <Target size={16} />
                      </div>
                      <div>
                        <div className="roi-benchmark-value">10-20%</div>
                        <div className="roi-benchmark-label">Good ROI</div>
                      </div>
                    </div>
                    <div className="roi-benchmark">
                      <div className="roi-benchmark-icon">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <div className="roi-benchmark-value">20-50%</div>
                        <div className="roi-benchmark-label">Excellent ROI</div>
                      </div>
                    </div>
                    <div className="roi-benchmark">
                      <div className="roi-benchmark-icon">
                        <Zap size={16} />
                      </div>
                      <div>
                        <div className="roi-benchmark-value">50%+</div>
                        <div className="roi-benchmark-label">Exceptional ROI</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="roi-sidebar-section">
                  <h3 className="roi-sidebar-title">Quick Actions</h3>
                  <div className="roi-actions">
                    <button className="roi-action" onClick={calculateROI}>
                      <Calculator size={16} />
                      <span>Calculate ROI</span>
                    </button>
                    <button className="roi-action" onClick={() => {
                      setFormData({
                        cost: 50000,
                        reach: 10000,
                        engagement_rate: 4.5,
                        conversion_rate: 2.5,
                        average_order_value: 2500,
                      });
                      setPrediction(null);
                    }}>
                      <RefreshCw size={16} />
                      <span>Reset Values</span>
                    </button>
                    <button className="roi-action" onClick={() => {
                      setFormData({
                        cost: 100000,
                        reach: 50000,
                        engagement_rate: 3.5,
                        conversion_rate: 2.0,
                        average_order_value: 5000,
                      });
                    }}>
                      <DollarSign size={16} />
                      <span>Try Premium Campaign</span>
                    </button>
                  </div>
                </div>

                {/* Tips */}
                <div className="roi-sidebar-section">
                  <h3 className="roi-sidebar-title">Tips for Better ROI</h3>
                  <div className="roi-tips">
                    <div className="roi-tip">
                      <AlertCircle size={16} />
                      <span>Increase conversion rate by optimizing landing pages</span>
                    </div>
                    <div className="roi-tip">
                      <AlertCircle size={16} />
                      <span>Focus on high-intent audience segments</span>
                    </div>
                    <div className="roi-tip">
                      <AlertCircle size={16} />
                      <span>Test different creative formats</span>
                    </div>
                  </div>
                </div>

                {/* Recent Calculations */}
                {prediction && (
                  <div className="roi-sidebar-section">
                    <h3 className="roi-sidebar-title">Current Results</h3>
                    <div className="roi-results-summary">
                      <div className="roi-result-item">
                        <span className="roi-result-label">ROI Score</span>
                        <span className="roi-result-value" style={{ color: roiColor }}>
                          {prediction.predicted_roi.toFixed(1)}%
                        </span>
                      </div>
                      <div className="roi-result-item">
                        <span className="roi-result-label">Profit Margin</span>
                        <span className="roi-result-value" style={{ color: prediction.net_profit >= 0 ? '#10B981' : '#EF4444' }}>
                          {((prediction.net_profit / formData.cost) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="roi-result-item">
                        <span className="roi-result-label">Campaign Viability</span>
                        <span className="roi-result-value" style={{ color: prediction.predicted_roi > 0 ? '#10B981' : '#EF4444' }}>
                          {prediction.predicted_roi > 0 ? 'Good' : 'Poor'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .roi-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
          
          /* Main Content */
          .roi-main { padding: 40px 0; }
          .roi-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
          .roi-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; }
          
          /* Content Area */
          .roi-content { display: flex; flex-direction: column; gap: 24px; }
          
          /* Header Card */
          .roi-header-card { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); border-radius: 12px; padding: 32px; color: white; }
          .roi-header-content { display: flex; align-items: center; gap: 16px; }
          .roi-header-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .roi-header-title { font-size: 28px; font-weight: 700; color: white; margin-bottom: 8px; }
          .roi-header-subtitle { font-size: 16px; color: rgba(255,255,255,0.9); }
          
          /* Input Card */
          .roi-input-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .roi-input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .roi-input-title { font-size: 20px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }
          .roi-input-icon { width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
          
          .roi-input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px; }
          .roi-input-group { display: flex; flex-direction: column; gap: 8px; }
          .roi-input-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #374151; }
          .roi-input { padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; transition: 0.2s; }
          .roi-input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
          
          .roi-error { background: #fee2e2; color: #dc2626; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; }
          
          /* Calculate Button */
          .roi-calculate-btn { width: 100%; padding: 16px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .roi-calculate-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .roi-calculate-btn:disabled { opacity: 0.7; cursor: not-allowed; }
          .roi-calculate-btn.loading { background: #3B82F6; }
          .roi-spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          /* Metrics Grid */
          .roi-metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
          .roi-metric-card { background: white; border: 1px solid #e2e8f0; margin:20px; border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: center; }
          .roi-metric-icon { width: 48px; height: 48px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
          .roi-metric-content { flex: 1; }
          .roi-metric-title { font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
          .roi-metric-value { font-size: 20px; font-weight: 700; color: #1e293b; }
          
          /* Charts Grid */
          .roi-charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .roi-chart-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
          .roi-chart-header { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
          .roi-chart-title { font-size: 16px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 8px; }
          
          /* Bar Chart */
          .roi-bar-chart { position: relative; }
          .roi-bar-chart-bars { display: flex; align-items: flex-end; gap: 30px; height: 100%; padding: 20px 0; }
          .roi-bar-chart-item { display: flex; flex-direction: column; align-items: center; flex: 1; }
          .roi-bar-chart-bar { width: 100%; border-radius: 6px; min-height: 10px; transition: height 0.3s ease; }
          .roi-bar-chart-label { margin-top: 12px; font-weight: 600; font-size: 14px; color: #1e293b; }
          .roi-bar-chart-value { margin-top: 4px; font-size: 13px; color: #64748b; }
          
          /* Line Chart */
          .roi-line-chart { position: relative; }
          .roi-line-chart-grid { display: flex; height: 100%; flex-direction: column; justify-content: space-between; padding: 20px 0 40px; }
          .roi-line-chart-grid-line { display: flex; align-items: center; }
          .roi-line-chart-grid-label { width: 40px; text-align: right; padding-right: 10px; font-size: 12px; color: #94a3b8; }
          
          .roi-line-chart-path { position: absolute; bottom: 40px; left: 50px; right: 0; top: 20px; }
          .roi-line-chart-point { position: absolute; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; }
          .roi-line-chart-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
          .roi-line-chart-tooltip { position: absolute; top: -25px; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .roi-line-chart-month { position: absolute; top: 15px; font-size: 12px; color: #64748b; }
          .roi-line-chart-line { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; }
          
          /* Analysis */
          .roi-analysis-content { padding: 16px 0; }
          .roi-analysis-list { display: flex; flex-direction: column; gap: 12px; }
          .roi-analysis-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8fafc; border-radius: 8px; }
          .roi-analysis-label { font-size: 14px; color: #64748b; }
          .roi-analysis-value { font-size: 15px; font-weight: 600; color: #1e293b; }
          
          /* Sidebar */
          .roi-sidebar { position: sticky; top: 20px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
          
          /* Sidebar Sections */
          .roi-sidebar-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .roi-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
          
          /* Benchmarks */
          .roi-benchmarks { display: flex; flex-direction: column; gap: 16px; }
          .roi-benchmark { display: flex; gap: 12px; }
          .roi-benchmark-icon { width: 32px; height: 32px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
          .roi-benchmark-value { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
          .roi-benchmark-label { font-size: 13px; color: #64748b; }
          
          /* Actions */
          .roi-actions { display: flex; flex-direction: column; gap: 8px; }
          .roi-action { padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: #475569; font-size: 14px; cursor: pointer; transition: 0.2s; }
          .roi-action:hover { background: #e2e8f0; border-color: #cbd5e1; color: #3B82F6; }
          
          /* Tips */
          .roi-tips { display: flex; flex-direction: column; gap: 12px; }
          .roi-tip { display: flex; gap: 12px; }
          .roi-tip svg { color: #F59E0B; flex-shrink: 0; margin-top: 2px; }
          .roi-tip span { font-size: 13px; color: #64748b; }
          
          /* Results Summary */
          .roi-results-summary { display: flex; flex-direction: column; gap: 12px; }
          .roi-result-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
          .roi-result-label { font-size: 14px; color: #64748b; }
          .roi-result-value { font-size: 15px; font-weight: 600; }
          
          /* Responsive Design */
          @media (max-width: 1200px) {
            .roi-layout { grid-template-columns: 1fr; }
            .roi-sidebar { position: relative; }
            .roi-metrics-grid { grid-template-columns: repeat(2, 1fr); }
            .roi-charts-grid { grid-template-columns: 1fr; }
            .roi-input-grid { grid-template-columns: 1fr; }
          }
          
          @media (max-width: 768px) {
            .roi-main { padding: 20px 0; }
            .roi-header-card { padding: 24px; }
            .roi-header-title { font-size: 24px; }
            .roi-metrics-grid { grid-template-columns: 1fr; }
            .roi-bar-chart-bars { gap: 16px; }
          }
          
          @media (max-width: 640px) {
            .roi-header-content { flex-direction: column; text-align: center; gap: 16px; }
            .roi-header-icon { width: 56px; height: 56px; }
            .roi-input-card { padding: 24px; }
          }
        `}</style>
      </div>
    </>
  );
}