import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    silentError?: boolean;
    skipAuthRefresh?: boolean;
  }

  interface InternalAxiosRequestConfig {
    silentError?: boolean;
    skipAuthRefresh?: boolean;
  }
}

export {};
