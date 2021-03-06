import { ClientDto } from '../dtos';
import { Client } from '../model/client.interface';
import { Status } from '../../shared/status.enum';

export const referrer: Client = {
  id: 123,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'client referrer',
  rif: 'J-30997933-9',
  status: Status.ACTIVE,
};

export const clientDto: ClientDto = {
  name: 'client test',
  rif: 'J-30997934-0',
  referrerId: referrer.id,
};

export const clientDtoSaved: Client = {
  id: 123,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...clientDto,
  referrer: { ...referrer },
  status: Status.ACTIVE,
};

export const referrerDtoSaved: Client = {
  id: 123,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...referrer,
  referrers: [{ ...clientDtoSaved }],
  status: Status.ACTIVE,
};

export const idNoExist = 1000;

export const updateRes = {
  generatedMaps: [],
  raw: [],
  affected: 1,
};

export const deleteRes = {
  raw: [],
  affected: 1,
};
