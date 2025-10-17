// Examples of how to use the comprehensive logging system

import React from 'react';
import { useLogging } from '../hooks/useLogging';
import { loggingUtils } from '../utils/loggingIntegration';
import { loggingService } from '../services/loggingService';

// Example 1: Basic component logging
const BasicLoggingExample: React.FC = () => {
  const { logUserAction, logError } = useLogging({
    componentName: 'BasicLoggingExample',
    enablePerformanceLogging: true,
  });

  const handleButtonClick = () => {
    logUserAction('example_button_click', {
      buttonName: 'example_button',
      timestamp: new Date().toISOString(),
    });
  };

  const handleError = () => {
    try {
      throw new Error('Example error for logging');
    } catch (error) {
      logError(error as Error, 'example_error', {
        context: 'BasicLoggingExample',
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Basic Logging Example</h3>
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Log Button Click
      </button>
      <button
        onClick={handleError}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Log Error
      </button>
    </div>
  );
};

// Example 2: Form logging
const FormLoggingExample: React.FC = () => {
  const { logUserAction } = useLogging({
    componentName: 'FormLoggingExample',
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    loggingUtils.logFormSubmit('example_form', {
      formFields: 3,
      timestamp: new Date().toISOString(),
    });
  };

  const handleInputChange = (fieldName: string) => {
    loggingUtils.logFilterChange(fieldName, 'input_changed', {
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Form Logging Example</h3>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          onChange={() => handleInputChange('name')}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          onChange={() => handleInputChange('email')}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit Form
        </button>
      </form>
    </div>
  );
};

// Example 3: Table actions logging
const TableLoggingExample: React.FC = () => {
  const { logUserAction } = useLogging({
    componentName: 'TableLoggingExample',
  });

  const handleEdit = (id: string) => {
    loggingUtils.logTableAction('edit', 'example_table', {
      recordId: id,
      timestamp: new Date().toISOString(),
    });
  };

  const handleDelete = (id: string) => {
    loggingUtils.logTableAction('delete', 'example_table', {
      recordId: id,
      timestamp: new Date().toISOString(),
    });
  };

  const handlePagination = (page: number) => {
    loggingUtils.logPagination(1, page, {
      tableName: 'example_table',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Table Actions Logging Example</h3>
      <div className="space-y-2">
        <button
          onClick={() => handleEdit('1')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          Edit Record 1
        </button>
        <button
          onClick={() => handleDelete('1')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
        >
          Delete Record 1
        </button>
        <button
          onClick={() => handlePagination(2)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go to Page 2
        </button>
      </div>
    </div>
  );
};

// Example 4: Performance logging
const PerformanceLoggingExample: React.FC = () => {
  const { startPerformanceLogging, endPerformanceLogging } = useLogging({
    componentName: 'PerformanceLoggingExample',
    enablePerformanceLogging: true,
  });

  const handleExpensiveOperation = async () => {
    startPerformanceLogging('expensive_operation');
    
    // Simulate expensive operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    endPerformanceLogging('expensive_operation', {
      operationType: 'async',
      timestamp: new Date().toISOString(),
    });
  };

  const handleDataProcessing = () => {
    const startTime = performance.now();
    
    // Simulate data processing
    const data = Array.from({ length: 100000 }, (_, i) => i);
    const processed = data.map(x => x * 2).filter(x => x % 4 === 0);
    
    const duration = performance.now() - startTime;
    
    loggingUtils.logPerformance('data_processing', duration, {
      dataSize: data.length,
      processedSize: processed.length,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Performance Logging Example</h3>
      <button
        onClick={handleExpensiveOperation}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mr-2"
      >
        Expensive Operation (2s)
      </button>
      <button
        onClick={handleDataProcessing}
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
      >
        Data Processing
      </button>
    </div>
  );
};

// Example 5: Modal logging
const ModalLoggingExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    loggingUtils.logModalOpen('example_modal', {
      timestamp: new Date().toISOString(),
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    loggingUtils.logModalClose('example_modal', {
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Modal Logging Example</h3>
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
      >
        Open Modal
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Example Modal</h4>
            <p className="mb-4">This modal opening and closing is being logged.</p>
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Example 6: Direct service usage
const DirectServiceExample: React.FC = () => {
  const handleDirectLogging = () => {
    // Direct service usage
    loggingService.info('user_action', 'direct_service_example', {
      message: 'This is logged directly using the service',
      timestamp: new Date().toISOString(),
    });
  };

  const handleGetStats = () => {
    const stats = loggingService.getLogStats();
    console.log('Logging Statistics:', stats);
    alert(`Total logs: ${stats.total}, Errors: ${stats.errors}, Warnings: ${stats.warnings}`);
  };

  const handleClearLogs = () => {
    loggingService.clearLogs();
    alert('Logs cleared!');
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Direct Service Usage Example</h3>
      <div className="space-y-2">
        <button
          onClick={handleDirectLogging}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          Direct Logging
        </button>
        <button
          onClick={handleGetStats}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
        >
          Get Statistics
        </button>
        <button
          onClick={handleClearLogs}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
};

// Main examples component
const LoggingExamples: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Logging System Examples</h1>
        <p className="text-gray-600">
          Examples demonstrating how to use the comprehensive logging system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BasicLoggingExample />
        <FormLoggingExample />
        <TableLoggingExample />
        <PerformanceLoggingExample />
        <ModalLoggingExample />
        <DirectServiceExample />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How to View Logs</h3>
        <p className="text-blue-800">
          All logged actions will appear in the Logging Monitoring page. 
          Navigate to the sidebar and click on "Logging Monitoring" to see real-time logs.
        </p>
      </div>
    </div>
  );
};

export default LoggingExamples;
