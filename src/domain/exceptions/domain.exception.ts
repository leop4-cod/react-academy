export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message = 'Acceso no autorizado al recurso del dominio') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: number | string) {
    super(`Entidad ${entityName} con ID ${id} no fue encontrada.`);
    this.name = 'EntityNotFoundException';
  }
}
