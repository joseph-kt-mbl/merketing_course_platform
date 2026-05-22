import React, { createContext, useContext, useState, useCallback } from 'react';
import './AlertProvider.css';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, duration);
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="alert-container">
        {alerts.map(alert => (
          <div key={alert.id} className={`custom-alert custom-alert-${alert.type}`}>
            <i className={`fas ${getIcon(alert.type)}`}></i>
            <span>{alert.message}</span>
            <button onClick={() => removeAlert(alert.id)} className="alert-close">
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

const getIcon = (type) => {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || 'fa-info-circle';
};