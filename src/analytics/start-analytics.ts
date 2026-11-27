/** Web analytics only exist on the web build; see start-analytics.web.ts. */
export function startAnalytics(_vercelEnv?: string): Promise<void> {
  return Promise.resolve();
}

export function track(_event: string, _properties: Record<string, unknown>): void {}
