import { BaseEntity } from '../../shared/database/entities/base.entity';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Client } from './client.interface';

@Entity('clients')
export class ClientEntity extends BaseEntity implements Client {
  @Column('varchar', { length: 100, nullable: false })
  name: string;

  @Column({ type: 'char', unique: true, length: 13, nullable: false })
  rif: string;

  @Column('varchar', { length: 8, default: 'Active' })
  status: string;

  @OneToMany(
    type => ClientEntity,
    client => client.referrer,
    { nullable: true },
  )
  referrers?: ClientEntity[];

  @Column({ nullable: true })
  referrerId?: number;

  @ManyToOne(
    type => ClientEntity,
    client => client.referrers,
    { nullable: true },
  )
  @JoinColumn({ name: 'referrerId' })
  referrer?: ClientEntity;
}
