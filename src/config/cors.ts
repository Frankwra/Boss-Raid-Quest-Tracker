export interface CorsOptions {
  origin: string;
  credentials: boolean;
  methods: string[];
}

export function buildCorsOptions(frontendUrl: string): CorsOptions {
  return {
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  };
}
