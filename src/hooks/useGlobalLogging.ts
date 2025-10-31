import { useEffect } from 'react';
import { loggingService } from '../services/loggingService';

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

export const useApiLogging = () => {
  useEffect(() => {
    const originalFetch = window.fetch;

    // ✅ cache token di memori
    let cachedToken: string | null = null;
    const readToken = () => {
      try {
        const raw = localStorage.getItem('auth-store');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
      } catch {
        return null;
      }
    };
    cachedToken = readToken();

    // listen perubahan token (login/logout tab lain)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth-store') cachedToken = readToken();
    };
    window.addEventListener('storage', onStorage);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = performance.now();

      // ⏩ Skip injeksi utk non-API agar asset Vite gak keintersep
      const urlStr = typeof input === 'string' ? input : input.toString();
      const isApi =
        urlStr.startsWith(API_HOST + '/api/') ||
        // kalau kamu pakai path relatif dan proxy, injek juga
        urlStr.startsWith('/api/');

      const opts: RequestInit = { ...init };
      const headers = new Headers(init?.headers || {});
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

        // 🚦 logging non-blocking (masuk queue)
        queueMicrotask(() => {
          loggingService.logApiCall(
            opts.method || 'GET',
            urlStr,
            res.status,
            duration,
            { success: res.ok, timestamp: new Date().toISOString() }
          );
        });

        return res;
      } catch (error) {
        const duration = performance.now() - startTime;
        queueMicrotask(() => {
          loggingService.error('api_call', 'fetch_error', {
            method: opts.method || 'GET',
            url: urlStr,
            duration,
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
