import { useEffect } from 'react';
import { loggingService } from '../services/loggingService';
import { useAuthStore } from '../store/authStore';

// Global logging setup for the entire application
export const useGlobalLogging = () => {
  useEffect(() => {
    // Log application start
    loggingService.info('system', 'application_start', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Log page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        loggingService.info('system', 'page_hidden', {
          timestamp: new Date().toISOString(),
        });
      } else {
        loggingService.info('system', 'page_visible', {
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Log before unload
    const handleBeforeUnload = () => {
      loggingService.info('system', 'application_unload', {
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Log resize events (throttled)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        loggingService.debug('system', 'window_resize', {
          width: window.innerWidth,
          height: window.innerHeight,
          timestamp: new Date().toISOString(),
        });
      }, 500);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
};

// Hook for logging navigation between pages
export const useNavigationLogging = () => {
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Log initial page load
    loggingService.logNavigation('initial', currentPath, {
      timestamp: new Date().toISOString(),
    });

    // Log when user navigates away
    const handleBeforeUnload = () => {
      loggingService.logNavigation(currentPath, 'unload', {
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

// Hook for logging user interactions
export const useInteractionLogging = () => {
  useEffect(() => {
    // Log clicks on important elements
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Only log clicks on interactive elements
      if (target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.classList.contains('clickable') ||
          target.closest('button') ||
          target.closest('a')) {
        
        const elementInfo = {
          tagName: target.tagName,
          className: target.className,
          id: target.id,
          textContent: target.textContent?.slice(0, 100), // Limit text length
          href: (target as HTMLAnchorElement).href,
          timestamp: new Date().toISOString(),
        };

        loggingService.logUserAction('element_click', elementInfo);
      }
    };

    // Log form submissions
    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      loggingService.logUserAction('form_submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
        timestamp: new Date().toISOString(),
      });
    };

    // Log input changes (debounced)
    let inputTimeout: NodeJS.Timeout;
    const handleInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        loggingService.logUserAction('input_change', {
          inputType: input.type,
          inputName: input.name,
          inputId: input.id,
          hasValue: !!input.value,
          timestamp: new Date().toISOString(),
        });
      }, 1000); // Debounce for 1 second
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('input', handleInput);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
      document.removeEventListener('input', handleInput);
      clearTimeout(inputTimeout);
    };
  }, []);
};

const API_HOST = 'http://localhost:3000';

// useGlobalLogging.ts (bagian useApiLogging)

export const useApiLogging = () => {
  useEffect(() => {
    const originalFetch = window.fetch;

    let cachedToken: string | null = useAuthStore.getState().token;
    const unsub = useAuthStore.subscribe((s) => { cachedToken = s.token; });

    const readToken = () => {
      try {
        const raw = localStorage.getItem('auth-store');
        return raw ? JSON.parse(raw)?.state?.token ?? null : null;
      } catch { return null; }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth-store') cachedToken = readToken();
    };
    window.addEventListener('storage', onStorage);

    // ✅ helper aman untuk ambil URL
    const getUrl = (input: RequestInfo | URL) => {
      if (typeof input === 'string') return input;
      if (input instanceof URL) return input.href;
      if (input instanceof Request) return input.url;
      // fallback
      return (input as any)?.url ?? String(input);
    };

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = performance.now();
      const urlStr = getUrl(input);

      const isApi =
        urlStr.startsWith(API_HOST + '/api/') ||
        urlStr.startsWith('/api/');

      // ✅ kalau input adalah Request, bawa headers aslinya juga
      const baseHeaders =
        init?.headers ??
        (input instanceof Request ? input.headers : undefined);

      const opts: RequestInit = { ...init };
      const headers = new Headers(baseHeaders || {});

      if (isApi && !headers.has('Authorization') && cachedToken) {
        headers.set('Authorization', `Bearer ${cachedToken}`);
      }
      if (opts.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      opts.headers = headers;

      try {
        const res = await originalFetch(input, opts);
        const duration = performance.now() - startTime;
        queueMicrotask(() => {
          loggingService.logApiCall(opts.method || 'GET', urlStr, res.status, duration, {
            success: res.ok, timestamp: new Date().toISOString(),
          });
        });
        return res;
      } catch (error) {
        const duration = performance.now() - startTime;
        queueMicrotask(() => {
          loggingService.error('api_call', 'fetch_error', {
            method: opts.method || 'GET', url: urlStr, duration,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          });
        });
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener('storage', onStorage);
      unsub();
    };
  }, []);
};



// export const useApiLogging = () => {
//   useEffect(() => {
//     // Intercept fetch calls
//     const originalFetch = window.fetch;
    
//     window.fetch = async (...args) => {
//       const startTime = performance.now();
//       const url = args[0] as string;
//       const options = args[1] || {};
      
//       try {
//         const response = await originalFetch(...args);
//         const duration = performance.now() - startTime;
        
//         loggingService.logApiCall(
//           options.method || 'GET',
//           url,
//           response.status,
//           duration,
//           {
//             success: response.ok,
//             timestamp: new Date().toISOString(),
//           }
//         );
        
//         return response;
//       } catch (error) {
//         const duration = performance.now() - startTime;
        
//         loggingService.error('api_call', 'fetch_error', {
//           method: options.method || 'GET',
//           url,
//           duration,
//           error: error instanceof Error ? error.message : String(error),
//           timestamp: new Date().toISOString(),
//         });
        
//         throw error;
//       }
//     };

//     return () => {
//       window.fetch = originalFetch;
//     };
//   }, []);
// };
