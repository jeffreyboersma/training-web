function normalizeBasePath(value: string | undefined): string {
  if (!value || value.trim() === '' || value.trim() === '/') {
    return '/';
  }

  const trimmed = value.trim();
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

export const appEnv = {
  appBasePath: normalizeBasePath(import.meta.env.VITE_APP_BASE_PATH),
  edgeFunctionsBaseUrl: import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL?.trim() ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.trim() ?? '',
};

export function hasSupabaseConfig(): boolean {
  return Boolean(appEnv.supabaseUrl && appEnv.supabaseAnonKey);
}

export function toAppPath(path = ''): string {
  const trimmed = path.replace(/^\/+/, '');

  if (!trimmed) {
    return appEnv.appBasePath;
  }

  if (appEnv.appBasePath === '/') {
    return `/${trimmed}`;
  }

  return `${appEnv.appBasePath}${trimmed}`;
}

export function toAppUrl(path = ''): string {
  return new URL(toAppPath(path), window.location.origin).toString();
}

export function getEdgeFunctionUrl(functionName: string): string {
  const base = appEnv.edgeFunctionsBaseUrl
    ? appEnv.edgeFunctionsBaseUrl.replace(/\/+$/, '')
    : `${appEnv.supabaseUrl.replace(/\/+$/, '')}/functions/v1`;

  return `${base}/${functionName}`;
}
