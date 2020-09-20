import { InjectRepository } from '@nestjs/typeorm';
import { ClientEntity } from './model/client.entity';
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { Observable, from, of, throwError, merge, concat } from 'rxjs';
import { map, mergeMap, filter, distinct } from 'rxjs/operators';
import { Client } from './model/client.interface';
import {
  ClientDto,
  ClientUpdateDto,
  MessageDto,
  PaginationClientsDto,
  PaginationInDto,
  paginationIntDefault,
} from './dtos';
import { Status } from '../shared/status.enum';

@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly _repository: Repository<ClientEntity>,
  ) {}

  getAll(
    pagination: PaginationInDto = paginationIntDefault,
  ): Observable<[Client[], number]> {
    return from(
      this._repository.findAndCount({
        where: { status: Status.ACTIVE },
        order: { name: 'DESC' },
        take: pagination.take,
        skip: pagination.skip,
        relations: ['referrer'],
      }),
    );
  }

  getAllByReferrer(
    name: string,
    pagination: PaginationInDto = paginationIntDefault,
  ):Observable<[Client[], number]> {
    name = name.toLowerCase();
    return from(this._repository
    .createQueryBuilder('c')
    .where(`LOWER("c"."name") like '%${name}%' `)
    .innerJoinAndSelect('c.referrers', 'refer')
    .offset(pagination.skip || 0)
    .limit(pagination.take || 10)
    .orderBy('"c"."name"')
    .getManyAndCount());
  }

  get(id: number): Observable<Client> {
    return this.validate(
      this.findOne(id),
      undefined,
      new NotFoundException(`Client has not been found`),
    );
  }

  findOne(
    id: number,
    isRelation = true,
    relations: string[] = ['referrer'],
  ): Observable<Client> {
    return isRelation
      ? from(this._repository.findOne({ where: { id }, relations }))
      : from(this._repository.findOne({ where: { id } }));
  }

  findOneRif(
    rif: string,
    isRelation = true,
    relations: string[] = ['referrer'],
  ): Observable<Client> {
    return isRelation
      ? from(this._repository.findOne({ where: { rif }, relations }))
      : from(this._repository.findOne({ where: { rif } }));
  }
  

  saveClient(clientProspect: ClientDto): Observable<Client> {
    const client = this._repository.create(clientProspect);
    return from(this._repository.save(client))
  }

  update(id: number, clientProspect: ClientUpdateDto): Observable<UpdateResult> {
    return from(this._repository.update(id, clientProspect));
  }

  private validate<T>(
    obs: Observable<T>,
    errorFull?: HttpException,
    errorEmpty?: HttpException,
  ): Observable<any> {
    const exeption$ = errorFull
      ? throwError(errorFull)
      : throwError(errorEmpty);
    const empty = obs.pipe(filter(x => x === undefined));
    const full = obs.pipe(filter(x => x !== undefined));
    return merge(
      errorFull ? full.pipe(mergeMap(() => exeption$)) : full,
      errorEmpty ? empty.pipe(mergeMap(() => exeption$)) : empty,
    );
  }

  // delete(id: number): Observable<MessageDto> {
  //   const find = this.findOne(id, false)
  //     .pipe(filter(cli => cli !== undefined))
  //     .pipe(
  //       map(cli => {
  //         cli.status = Status.INACTIVE;
  //         return cli;
  //       }),
  //     )
  //     .pipe(mergeMap(cli => from(this._repository.save(cli))))
  //     .pipe(mergeMap(() => of({ message: 'success' })));

  //   return find;
  // }
}
