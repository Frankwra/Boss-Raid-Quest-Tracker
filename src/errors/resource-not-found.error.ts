export class ResourceNotFoundError extends Error {
  constructor(resource: string, identifier: string) {
    super(`${resource} não encontrada: ${identifier}`);
    this.name = 'ResourceNotFoundError';
  }
}
