"use client";
import React, { useState, useEffect } from 'react';
import { t, Lang } from '@/lib/i18n';
import { checkDatabaseConnection } from '@/app/actions';

interface DatabaseReconnectProps {
  initialCheckThrewError?: boolean;
  initializationCheckFailed?: boolean;
  subsequentOperationFailed?: boolean;
}

const DatabaseReconnect: React.FC<DatabaseReconnectProps> = ({ 
  initialCheckThrewError = false,
  initializationCheckFailed = false,
  subsequentOperationFailed = false 
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const language = 'en';

  useEffect(() => {
    handleReconnect();
  }, []);

  const handleReconnect = async () => {
    setIsLoading(true);
    try {
      const connected = await checkDatabaseConnection();
      setIsConnected(connected);
      
      if (connected) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error(t(language, 'databaseReconnectFailed'), error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = () => {
    if (initialCheckThrewError) {
      return t(language, "databaseInitialConnectionFailed");
    }
    if (initializationCheckFailed) {
      return t(language, "databaseInitializationFailed");
    }
    if (subsequentOperationFailed) {
      return t(language, "databaseOperationFailed");
    }
    return t(language, "databaseConnectionIssue");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-red-600">
          {t(language, "databaseConnectionError")}
        </h2>
        <p className="text-gray-600">
          {getErrorMessage()}
        </p>
        <p className="text-sm">
          {isConnected === null
            ? t(language, "databaseChecking")
            : isConnected
            ? t(language, "databaseConnected")
            : t(language, "databaseDisconnected")}
        </p>
      </div>
      
      <button 
        onClick={handleReconnect} 
        disabled={isLoading || isConnected === true}
        className={`px-4 py-2 rounded-md font-medium ${
          isLoading || isConnected === true
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading 
          ? t(language, 'actionReconnecting') 
          : isConnected === true 
          ? t(language, 'actionReloading')
          : t(language, 'actionReconnect')
        }
      </button>

      {isConnected === true && (
        <p className="text-green-600 text-sm">
          {t(language, "databaseReconnectedReloading")}
        </p>
      )}
    </div>
  );
};

export default DatabaseReconnect;