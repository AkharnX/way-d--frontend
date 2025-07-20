// Utility function to safely log errors
export const logError = (message: string, error: any) => {
  if (error instanceof Error) {
    console.error(message, error.message, error.stack);
  } else if (error?.response) {
    // Axios error
    console.error(message, {
      status: error.response.status,
      data: error.response.data,
      message: error.response.data?.message || error.response.data?.error || 'Unknown error'
    });
  } else if (typeof error === 'object' && error !== null) {
    // Other object - safely stringify with circular reference protection
    try {
      const safeStringify = (obj: any) => {
        const seen = new WeakSet();
        return JSON.stringify(obj, (_, val) => {
          if (val != null && typeof val === 'object') {
            if (seen.has(val)) {
              return '[Circular]';
            }
            seen.add(val);
          }
          return val;
        }, 2);
      };
      console.error(message, safeStringify(error));
    } catch (stringifyError) {
      console.error(message, '[Object - cannot stringify]', Object.prototype.toString.call(error));
    }
  } else {
    // Primitive value
    console.error(message, error);
  }
};

// Extract user-friendly error message from various error types
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Une erreur inattendue est survenue';
};
