export function normalizeBasePath(value: string | undefined): string {
  if (!value || value.trim() === '' || value.trim() === '/') {
    return '/';
  }

  const trimmed = value.trim();
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function normalizeAppOrigin(value: string | undefined): string | undefined {
  if (!value || value.trim() === '') {
    return undefined;
  }

  return value.trim().replace(/\/+$/, '');
}

export const appEnv = {
  appBasePath: normalizeBasePath(import.meta.env.VITE_APP_BASE_PATH),
  appOrigin: normalizeAppOrigin(import.meta.env.VITE_APP_ORIGIN),
  edgeFunctionsBaseUrl: import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL?.trim() ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.trim() ?? '',
};

export function hasSupabaseConfig(): boolean {
  return Boolean(appEnv.supabaseUrl && appEnv.supabaseAnonKey);
}

export function buildAppPath(basePath: string, path = ''): string {
  const trimmed = path.replace(/^\/+/, '');

  if (!trimmed) {
    return basePath;
  }

  if (basePath === '/') {
    return `/${trimmed}`;
  }

  return `${basePath}${trimmed}`;
}

export function toAppPath(path = ''): string {
  return buildAppPath(appEnv.appBasePath, path);
}

export function buildAppUrl(origin: string, basePath: string, path = ''): string {
  return new URL(buildAppPath(basePath, path), origin).toString();
}

export function getAppOrigin(currentOrigin: string): string {
  return appEnv.appOrigin ?? currentOrigin;
}

export function toAppUrl(path = ''): string {
  return buildAppUrl(getAppOrigin(window.location.origin), appEnv.appBasePath, path);
}

export function getEdgeFunctionUrl(functionName: string): string {
  const base = appEnv.edgeFunctionsBaseUrl
    ? appEnv.edgeFunctionsBaseUrl.replace(/\/+$/, '')
    : `${appEnv.supabaseUrl.replace(/\/+$/, '')}/functions/v1`;

  return `${base}/${functionName}`;
}
