// tslint:disable deprecation
import {
  ABI,
  ABIEvent,
  ABIFunction,
  Account,
  AccountJSON,
  ActionBaseJSON,
  AddressABIParameter,
  AddressAttribute,
  AddressContractParameter,
  addressToScriptHash,
  ArrayContractParameterJSON,
  Asset,
  AssetJSON,
  AttributeJSON,
  AttributeUsageModel,
  Block,
  BlockJSON,
  BooleanContractParameter,
  BooleanContractParameterJSON,
  BufferAttribute,
  BufferAttributeModel,
  ByteArrayContractParameterJSON,
  CallReceiptJSON,
  ClaimTransaction,
  ClaimTransactionJSON,
  common,
  ConfirmedClaimTransaction,
  ConfirmedContractTransaction,
  ConfirmedEnrollmentTransaction,
  ConfirmedInvocationTransaction,
  ConfirmedIssueTransaction,
  ConfirmedMinerTransaction,
  ConfirmedPublishTransaction,
  ConfirmedRegisterTransaction,
  ConfirmedStateTransaction,
  ConfirmedTransactionBase,
  Contract,
  ContractJSON,
  ContractTransaction,
  ContractTransactionJSON,
  ECPointAttributeModel,
  EnrollmentTransaction,
  EnrollmentTransactionJSON,
  ForwardValue,
  Hash160ContractParameterJSON,
  Hash256Attribute,
  Hash256ContractParameterJSON,
  Header,
  HeaderJSON,
  Input,
  InputJSON,
  InputModel,
  InputOutput,
  IntegerABIParameter,
  IntegerABIReturn,
  IntegerContractParameter,
  IntegerContractParameterJSON,
  InteropInterfaceContractParameterJSON,
  InvocationDataJSON,
  InvocationResultError,
  InvocationResultErrorJSON,
  InvocationResultSuccess,
  InvocationResultSuccessJSON,
  InvocationTransaction,
  InvocationTransactionJSON,
  InvocationTransactionModel,
  InvocationTransactionModelAdd,
  IssueTransaction,
  IssueTransactionJSON,
  LogActionJSON,
  MapContractParameterJSON,
  MinerTransaction,
  MinerTransactionJSON,
  NeoBalanceJSON,
  NeoClaimableJSON,
  NeoInputClaimableJSON,
  NeoUnspentJSON,
  NeoUnspentOutputJSON,
  NetworkSettings,
  NetworkSettingsJSON,
  NotificationActionJSON,
  Output,
  OutputJSON,
  OutputModel,
  Peer,
  PublicKeyAttribute,
  PublicKeyContractParameterJSON,
  PublishTransaction,
  PublishTransactionJSON,
  RawActionBase,
  RawCallReceipt,
  RawInvocationData,
  RawInvocationResultError,
  RawInvocationResultErrorJSON,
  RawInvocationResultSuccess,
  RawInvocationResultSuccessJSON,
  RawInvokeReceipt,
  RawLog,
  RawNotification,
  RegisterTransaction,
  RegisterTransactionJSON,
  SignatureContractParameterJSON,
  SmartContractDefinition,
  StateTransaction,
  StateTransactionJSON,
  StorageItemJSON,
  StringABIParameter,
  StringABIReturn,
  StringContractParameter,
  StringContractParameterJSON,
  TransactionBase,
  TransactionBaseJSON,
  TransactionReceipt,
  TransactionResult,
  Transfer,
  UInt160AttributeModel,
  UInt256AttributeModel,
  UserAccount,
  UserAccountID,
  VerifyScriptResultJSON,
  VerifyTransactionResultJSON,
  VMState,
  VoidContractParameterJSON,
  Witness,
  WitnessJSON,
  WitnessModel,
} from '@neo-one/client-common';
import BigNumber from 'bignumber.js';
import { BN } from 'bn.js';
import { Hash256 } from '../Hash256';
import * as nep5 from '../nep5';
import { LockedWallet, UnlockedWallet } from '../user';
import { data } from './data';
import { keys } from './keys';

const createInputJSON = (options: Partial<InputJSON> = {}): InputJSON => ({
  txid: data.hash256s.a,
  vout: 2,
  ...options,
});

const createAccountJSON = (options: Partial<AccountJSON> = {}): AccountJSON => ({
  version: 0,
  script_hash: keys[0].scriptHashString,
  frozen: false,
  votes: [keys[0].publicKeyString],
  balances: [
    { asset: Hash256.NEO, value: data.bigNumbers.a.toString(10) },
    { asset: Hash256.GAS, value: data.bigNumbers.b.toString(10) },
  ],
  unspent: [
    createInputJSON(),
    {
      txid: data.hash256s.b,
      vout: 0,
    },
  ],
  unclaimed: [
    {
      txid: data.hash256s.c,
      vout: 3,
    },
    {
      txid: data.hash256s.d,
      vout: 0,
    },
  ],
  ...options,
});

const createOutputJSON = (options: Partial<OutputJSON> = {}): OutputJSON => ({
  n: 0,
  asset: Hash256.NEO,
  value: data.bigNumbers.a.toString(10),
  address: keys[0].address,
  ...options,
});

const createAssetJSON = (options: Partial<AssetJSON> = {}): AssetJSON => ({
  version: 0,
  id: data.hash256s.c,
  type: 'Token',
  name: 'TheToken',
  amount: '100000000',
  available: '10000000',
  precision: 8,
  owner: keys[0].publicKeyString,
  admin: keys[0].address,
  issuer: keys[1].address,
  expiration: 1534418216,
  frozen: false,
  ...options,
});

const createContractJSON = (options: Partial<ContractJSON> = {}): ContractJSON => ({
  version: 0,
  hash: keys[0].scriptHashString,
  script: data.buffers.b,
  parameters: ['Hash160', 'ByteArray'],
  returntype: 'ByteArray',
  name: 'MyContract',
  code_version: '1.0',
  author: 'dicarlo2',
  email: 'alex.dicarlo@neotracker.io',
  description: 'Hello World',
  properties: {
    storage: true,
    dynamic_invoke: false,
    payable: true,
  },
  ...options,
});

const createActionBaseJSON = (options: Partial<ActionBaseJSON> = {}): ActionBaseJSON => ({
  version: 0,
  index: '10',
  scriptHash: keys[0].scriptHashString,
  ...options,
});

const createNotificationActionJSON = (options: Partial<NotificationActionJSON> = {}): NotificationActionJSON => ({
  ...createActionBaseJSON(),
  type: 'Notification',
  args: [createIntegerContractParameterJSON()],
  ...options,
});

const createLogActionJSON = (options: Partial<LogActionJSON> = {}): LogActionJSON => ({
  ...createActionBaseJSON(),
  type: 'Log',
  message: 'Hello World',
  ...options,
});

const createUInt160AttributeJSON = (options: Partial<AttributeJSON> = {}): AttributeJSON => ({
  usage: 'Script',
  data: keys[0].scriptHashString,
  ...options,
});

const createUInt256AttributeJSON = (options: Partial<AttributeJSON> = {}): AttributeJSON => ({
  usage: 'Hash1',
  data: data.hash256s.b,
  ...options,
});

const createBufferAttributeJSON = (options: Partial<AttributeJSON> = {}): AttributeJSON => ({
  usage: 'Description',
  data: data.buffers.a,
  ...options,
});

const createECPointAttributeJSON = (options: Partial<AttributeJSON> = {}): AttributeJSON => ({
  usage: 'ECDH02',
  data: keys[0].publicKeyString,
  ...options,
});

const createWitnessJSON = (options: Partial<WitnessJSON> = {}): WitnessJSON => ({
  invocation: data.buffers.a,
  verification: data.buffers.b,
  ...options,
});

const createTransactionBaseJSON = (options: Partial<TransactionBaseJSON> = {}): TransactionBaseJSON => ({
  txid: data.hash256s.a,
  size: 256,
  version: 0,
  attributes: [
    createUInt160AttributeJSON(),
    createUInt256AttributeJSON(),
    createBufferAttributeJSON(),
    createECPointAttributeJSON(),
  ],
  vin: [createInputJSON()],
  vout: [createOutputJSON()],
  scripts: [createWitnessJSON()],
  sys_fee: '10',
  net_fee: '5',
  data: {
    blockHash: data.hash256s.b,
    blockIndex: 5,
    transactionIndex: 10,
    globalIndex: '25',
  },
  ...options,
});

const createIntegerContractParameterJSON = (
  options: Partial<IntegerContractParameterJSON> = {},
): IntegerContractParameterJSON => ({
  type: 'Integer',
  value: '20',
  ...options,
});

const createInvocationResultSuccessJSON = (
  options: Partial<InvocationResultSuccessJSON> = {},
): InvocationResultSuccessJSON => ({
  state: VMState.Halt,
  gas_consumed: '20',
  gas_cost: '10',
  stack: [createIntegerContractParameterJSON()],
  ...options,
});

const createInvocationResultErrorJSON = (
  options: Partial<InvocationResultErrorJSON> = {},
): InvocationResultErrorJSON => ({
  state: VMState.Fault,
  gas_consumed: '20',
  gas_cost: '10',
  stack: [createIntegerContractParameterJSON()],
  message: 'failure',
  ...options,
});

const createRawInvocationResultSuccessJSON = (
  options: Partial<RawInvocationResultSuccessJSON> = {},
): RawInvocationResultSuccessJSON => ({
  state: 'HALT',
  gas_consumed: '20',
  gas_cost: '10',
  stack: [createIntegerContractParameterJSON()],
  ...options,
});

const createRawInvocationResultErrorJSON = (
  options: Partial<RawInvocationResultErrorJSON> = {},
): RawInvocationResultErrorJSON => ({
  state: 'FAULT',
  gas_consumed: '20',
  gas_cost: '10',
  stack: [createIntegerContractParameterJSON()],
  message: '',
  ...options,
});

const createInvocationDataJSON = (options: Partial<InvocationDataJSON> = {}): InvocationDataJSON => ({
  result: createInvocationResultSuccessJSON(),
  asset: createAssetJSON(),
  contracts: [createContractJSON()],
  deletedContractHashes: [keys[2].scriptHashString],
  migratedContractHashes: [[keys[0].scriptHashString, keys[1].scriptHashString]],
  voteUpdates: [],
  actions: [createNotificationActionJSON(), createLogActionJSON()],
  storageChanges: [],
  ...options,
});

const createClaimTransactionJSON = (options: Partial<ClaimTransactionJSON> = {}): ClaimTransactionJSON => ({
  ...createTransactionBaseJSON(),
  type: 'ClaimTransaction',
  claims: [createInputJSON()],
  ...options,
});

const createContractTransactionJSON = (options: Partial<ContractTransactionJSON> = {}): ContractTransactionJSON => ({
  ...createTransactionBaseJSON(),
  type: 'ContractTransaction',
  ...options,
});

const createEnrollmentTransactionJSON = (
  options: Partial<EnrollmentTransactionJSON> = {},
): EnrollmentTransactionJSON => ({
  ...createTransactionBaseJSON(),
  type: 'EnrollmentTransaction',
  pubkey: keys[0].publicKeyString,
  ...options,
});

const createIssueTransactionJSON = (options: Partial<IssueTransactionJSON> = {}): IssueTransactionJSON => ({
  ...createTransactionBaseJSON(),
  type: 'IssueTransaction',
  ...options,
});

const createPublishTransactionJSON = (options: Partial<PublishTransactionJSON> = {}): PublishTransactionJSON => ({
  ...createTransactionBaseJSON(),
  type: 'PublishTransaction',
  contract: createContractJSON(),
  ...options,
});

const createRegisterTransactionJSON = (options: Partial<RegisterTransactionJSON> = {}): RegisterTransactionJSON => ({
  ...createTransactionBaseJSON(),
  type: 'RegisterTransaction',
  asset: createAssetJSON(),
  ...options,
});

const createStateTransactionJSON = (options: Partial<StateTransactionJSON> = {}): StateTransactionJSON => ({
  ...createTransactionBaseJSON(),
  type: 'StateTransaction',
  descriptors: [],
  ...options,
});

const createInvocationTransactionJSON = (
  options: Partial<InvocationTransactionJSON> = {},
): InvocationTransactionJSON => ({
  ...createTransactionBaseJSON(),
  type: 'InvocationTransaction',
  script: data.buffers.a,
  gas: '10',
  invocationData: createInvocationDataJSON(),
  ...options,
});

const createInvocationTransactionModel = (
  options: Partial<InvocationTransactionModelAdd> = {},
): InvocationTransactionModel => {
  const invocation = createInvocationTransactionJSON();
  const uInt160Attribute = createUInt160AttributeJSON();
  const uInt256Attribute = createUInt256AttributeJSON();
  const bufferAttribute = createBufferAttributeJSON();
  const ecPointAttribute = createECPointAttributeJSON();

  return new InvocationTransactionModel({
    gas: new BN(invocation.gas),
    script: Buffer.from(invocation.script, 'hex'),
    version: invocation.version,
    attributes: [
      new UInt160AttributeModel({
        usage: AttributeUsageModel[uInt160Attribute.usage] as 0x20,
        value: common.hexToUInt160(uInt160Attribute.data),
      }),
      new UInt256AttributeModel({
        usage: AttributeUsageModel[uInt256Attribute.usage] as 0xa1,
        value: common.hexToUInt256(uInt256Attribute.data),
      }),
      new BufferAttributeModel({
        usage: AttributeUsageModel[bufferAttribute.usage] as 0x90,
        value: Buffer.from(bufferAttribute.data, 'hex'),
      }),
      new ECPointAttributeModel({
        usage: AttributeUsageModel[ecPointAttribute.usage] as 0x02,
        value: common.hexToECPoint(ecPointAttribute.data),
      }),
    ],
    inputs: invocation.vin.map((input) => new InputModel({ hash: common.hexToUInt256(input.txid), index: input.vout })),
    outputs: invocation.vout.map(
      (output) =>
        new OutputModel({
          asset: common.hexToUInt256(output.asset),
          value: new BN(output.value),
          address: common.hexToUInt160(addressToScriptHash(output.address)),
        }),
    ),
    scripts: invocation.scripts.map(
      (script) =>
        new WitnessModel({
          invocation: Buffer.from(script.invocation, 'hex'),
          verification: Buffer.from(script.verification, 'hex'),
        }),
    ),
    hash: common.hexToUInt256(invocation.txid),
    ...options,
  });
};

const createMinerTransactionJSON = (options: Partial<MinerTransactionJSON> = {}): MinerTransactionJSON => ({
  ...createTransactionBaseJSON(),
  type: 'MinerTransaction',
  nonce: 1234,
  ...options,
});

const createTransactionReceipt = (options: Partial<TransactionReceipt> = {}): TransactionReceipt => ({
  blockHash: data.hash256s.a,
  blockIndex: 0,
  transactionIndex: 3,
  globalIndex: new BigNumber(4),
  ...options,
});

const createCallReceiptJSON = (options: Partial<CallReceiptJSON> = {}): CallReceiptJSON => ({
  result: createInvocationResultSuccessJSON(),
  actions: [createNotificationActionJSON(), createLogActionJSON()],
  ...options,
});

const createVerifyScriptResultJSON = (options: Partial<VerifyScriptResultJSON> = {}): VerifyScriptResultJSON => ({
  hash: keys[0].scriptHashString,
  witness: factory.createWitness(),
  actions: [createLogActionJSON()],
  ...options,
});

const createVerifyTransactionResultJSON = (
  options: Partial<VerifyTransactionResultJSON> = {},
): VerifyTransactionResultJSON => ({
  verifications: [createVerifyScriptResultJSON()],
  ...options,
});

const createHeaderJSON = (options: Partial<HeaderJSON> = {}): HeaderJSON => ({
  version: 0,
  hash: data.hash256s.a,
  previousblockhash: data.hash256s.b,
  merkleroot: data.hash256s.c,
  time: data.timestamps.past,
  index: 10,
  nonce: '1234',
  nextconsensus: keys[0].address,
  script: createWitnessJSON(),
  size: 256,
  confirmations: 10,
  ...options,
});

const createBlockJSON = (options: Partial<BlockJSON> = {}): BlockJSON => ({
  ...createHeaderJSON(),
  tx: [
    createMinerTransactionJSON(),
    createClaimTransactionJSON(),
    createContractTransactionJSON(),
    createEnrollmentTransactionJSON(),
    createInvocationTransactionJSON(),
    createIssueTransactionJSON(),
    createPublishTransactionJSON(),
    createRegisterTransactionJSON(),
    createStateTransactionJSON(),
  ],
  ...options,
});

const createPeerJSON = (options: Partial<Peer> = {}): Peer => ({
  address: 'localhost',
  port: 1340,
  ...options,
});

const createNetworkSettingsJSON = (options: Partial<NetworkSettingsJSON> = {}): NetworkSettingsJSON => ({
  issueGASFee: data.bigNumbers.a.toString(10),
  ...options,
});

const createStorageItemJSON = (options: Partial<StorageItemJSON> = {}): StorageItemJSON => ({
  hash: keys[0].scriptHashString,
  key: data.buffers.a,
  value: data.buffers.b,
  flags: 'None',
  ...options,
});

const createArrayContractParameterJSON = (
  options: Partial<ArrayContractParameterJSON> = {},
): ArrayContractParameterJSON => ({
  type: 'Array',
  value: [createBooleanContractParameterJSON()],
  ...options,
});

const createBooleanContractParameterJSON = (
  options: Partial<BooleanContractParameterJSON> = {},
): BooleanContractParameterJSON => ({
  type: 'Boolean',
  value: true,
  ...options,
});

const createByteArrayContractParameterJSON = (
  options: Partial<ByteArrayContractParameterJSON> = {},
): ByteArrayContractParameterJSON => ({
  type: 'ByteArray',
  value: Buffer.alloc(1, 0xff).toString(),
  ...options,
});

const createHash160ContractParameterJSON = (
  options: Partial<Hash160ContractParameterJSON> = {},
): Hash160ContractParameterJSON => ({
  type: 'Hash160',
  value: keys[0].scriptHashString,
  ...options,
});

const createHash256ContractParameterJSON = (
  options: Partial<Hash256ContractParameterJSON> = {},
): Hash256ContractParameterJSON => ({
  type: 'Hash256',
  value: data.hash256s.a,
  ...options,
});

const createInteropInterfaceContractParameterJSON = (options: Partial<InteropInterfaceContractParameterJSON> = {}) => ({
  type: 'InteropInterface' as 'InteropInterface',
  ...options,
});

const createMapContractParameterJSON = (options: Partial<MapContractParameterJSON> = {}): MapContractParameterJSON => ({
  type: 'Map',
  value: [[createIntegerContractParameterJSON(), createBooleanContractParameterJSON()]],
  ...options,
});

const createPublicKeyContractParameterJSON = (
  options: Partial<PublicKeyContractParameterJSON> = {},
): PublicKeyContractParameterJSON => ({
  type: 'PublicKey',
  value: keys[0].publicKeyString,
  ...options,
});

const createSignatureContractParameterJSON = (
  options: Partial<SignatureContractParameterJSON> = {},
): SignatureContractParameterJSON => ({
  type: 'Signature',
  value: data.signatures.a,
  ...options,
});

const createStringContractParameterJSON = (
  options: Partial<StringContractParameterJSON> = {},
): StringContractParameterJSON => ({
  type: 'String',
  value: 'test',
  ...options,
});

const createVoidContractParameterJSON = (
  options: Partial<VoidContractParameterJSON> = {},
): VoidContractParameterJSON => ({
  type: 'Void',
  ...options,
});

const createInput = (options: Partial<Input> = {}): Input => ({
  hash: data.hash256s.a,
  index: 0,
  ...options,
});

const createOutput = (options: Partial<Output> = {}): Output => ({
  asset: Hash256.NEO,
  value: data.bigNumbers.a,
  address: keys[0].address,
  ...options,
});

const createInputOutput = (options: Partial<InputOutput> = {}): InputOutput => ({
  ...createInput(),
  ...createOutput(),
  ...options,
});

const createAsset = (options: Partial<Asset> = {}): Asset => ({
  hash: data.hash256s.c,
  type: 'Token',
  name: 'TheToken',
  amount: new BigNumber('100000000'),
  available: new BigNumber('10000000'),
  precision: 8,
  owner: keys[0].publicKeyString,
  admin: keys[0].address,
  issuer: keys[1].address,
  expiration: 1534418216,
  frozen: false,
  ...options,
});

const createContract = (options: Partial<Contract> = {}): Contract => ({
  version: 0,
  address: keys[0].address,
  script: data.buffers.b,
  parameters: ['Address', 'Buffer'],
  returnType: 'Buffer',
  name: 'MyContract',
  codeVersion: '1.0',
  author: 'dicarlo2',
  email: 'alex.dicarlo@neotracker.io',
  description: 'Hello World',
  storage: true,
  dynamicInvoke: false,
  payable: true,
  ...options,
});

const createRawActionBase = (options: Partial<RawActionBase> = {}): RawActionBase => ({
  version: 0,
  blockHash: data.hash256s.a,
  blockIndex: 0,
  transactionHash: data.hash256s.b,
  transactionIndex: 1,
  index: data.numbers.a,
  globalIndex: data.bigNumbers.a,
  address: keys[0].address,
  ...options,
});

const createRawNotification = (options: Partial<RawNotification> = {}): RawNotification => ({
  ...createRawActionBase(),
  type: 'Notification',
  args: [createIntegerContractParameter()],
  ...options,
});

const createRawTransferNotification = (options: Partial<RawNotification> = {}): RawNotification =>
  createRawNotification({
    args: [
      createStringContractParameter({ value: 'transfer' }),
      createAddressContractParameter({ value: keys[0].address }),
      createAddressContractParameter({ value: keys[1].address }),
      createIntegerContractParameter({ value: data.bns.b }),
    ],
    ...options,
  });

const createRawLog = (options: Partial<RawLog> = {}): RawLog => ({
  ...createRawActionBase(),
  type: 'Log',
  message: 'Hello World',
  ...options,
});

const createAddressAttribute = (options: Partial<AddressAttribute> = {}): AddressAttribute => ({
  usage: 'Script',
  data: keys[0].address,
  ...options,
});

const createHash256Attribute = (options: Partial<Hash256Attribute> = {}): Hash256Attribute => ({
  usage: 'Hash1',
  data: data.hash256s.b,
  ...options,
});

const createBufferAttribute = (options: Partial<BufferAttribute> = {}): BufferAttribute => ({
  usage: 'Description',
  data: data.buffers.a,
  ...options,
});

const createPublicKeyAttribute = (options: Partial<PublicKeyAttribute> = {}): PublicKeyAttribute => ({
  usage: 'ECDH02',
  data: keys[0].publicKeyString,
  ...options,
});

const createWitness = (options: Partial<Witness> = {}): Witness => ({
  invocation: data.buffers.a,
  verification: data.buffers.b,
  ...options,
});

const createTransactionBase = (options: Partial<TransactionBase> = {}): TransactionBase => ({
  hash: data.hash256s.a,
  size: 256,
  version: 0,
  attributes: [createAddressAttribute(), createHash256Attribute(), createBufferAttribute(), createPublicKeyAttribute()],
  inputs: [createInput()],
  outputs: [createOutput()],
  scripts: [createWitness()],
  systemFee: new BigNumber('10'),
  networkFee: new BigNumber('5'),
  ...options,
});

const createAddressContractParameter = (options: Partial<AddressContractParameter> = {}): AddressContractParameter => ({
  type: 'Address',
  value: keys[0].address,
  ...options,
});

const createStringContractParameter = (options: Partial<StringContractParameter> = {}): StringContractParameter => ({
  type: 'String',
  value: 'transfer',
  ...options,
});

const createIntegerContractParameter = (options: Partial<IntegerContractParameter> = {}): IntegerContractParameter => ({
  type: 'Integer',
  value: new BN(20),
  ...options,
});

const createBooleanContractParameter = (options: Partial<BooleanContractParameter> = {}): BooleanContractParameter => ({
  type: 'Boolean',
  value: true,
  ...options,
});

const createRawInvocationResultError = (options: Partial<RawInvocationResultError> = {}): RawInvocationResultError => ({
  state: 'FAULT',
  gasConsumed: new BigNumber('10'),
  gasCost: new BigNumber('20'),
  stack: [createIntegerContractParameter()],
  message: 'Failure!',
  ...options,
});

const createRawInvocationResultSuccess = (
  options: Partial<RawInvocationResultSuccess> = {},
): RawInvocationResultSuccess => ({
  state: 'HALT',
  gasConsumed: new BigNumber('10'),
  gasCost: new BigNumber('20'),
  stack: [createIntegerContractParameter()],
  ...options,
});

const createInvocationResultError = (options: Partial<InvocationResultError> = {}): InvocationResultError => ({
  state: 'FAULT',
  gasConsumed: new BigNumber('20'),
  gasCost: new BigNumber('10'),
  message: 'Failed!',
  ...options,
});

const createInvocationResultSuccess = (
  options: Partial<InvocationResultSuccess<boolean>> = {},
): InvocationResultSuccess<boolean> => ({
  state: 'HALT',
  gasConsumed: new BigNumber('20'),
  gasCost: new BigNumber('10'),
  value: true,
  ...options,
});

const createRawInvocationData = (options: Partial<RawInvocationData> = {}): RawInvocationData => ({
  result: createRawInvocationResultSuccess(),
  asset: createAsset(),
  contracts: [createContract()],
  deletedContractAddresses: [keys[2].address],
  migratedContractAddresses: [[keys[0].address, keys[1].address]],
  actions: [createRawNotification(), createRawLog()],
  storageChanges: [],
  ...options,
});

const createConfirmedTransactionBase = (options: Partial<ConfirmedTransactionBase> = {}): ConfirmedTransactionBase => ({
  receipt: {
    blockHash: data.hash256s.a,
    blockIndex: 10,
    transactionIndex: 1,
    globalIndex: new BigNumber('11'),
  },
  ...options,
});

const createClaimTransaction = (options: Partial<ClaimTransaction> = {}): ClaimTransaction => ({
  ...createTransactionBase(),
  type: 'ClaimTransaction',
  claims: [createInput()],
  ...options,
});

const createContractTransaction = (options: Partial<ContractTransaction> = {}): ContractTransaction => ({
  ...createTransactionBase(),
  type: 'ContractTransaction',
  ...options,
});

const createEnrollmentTransaction = (options: Partial<EnrollmentTransaction> = {}): EnrollmentTransaction => ({
  ...createTransactionBase(),
  type: 'EnrollmentTransaction',
  publicKey: keys[0].publicKeyString,
  ...options,
});

const createIssueTransaction = (options: Partial<IssueTransaction> = {}): IssueTransaction => ({
  ...createTransactionBase(),
  type: 'IssueTransaction',
  ...options,
});

const createPublishTransaction = (options: Partial<PublishTransaction> = {}): PublishTransaction => ({
  ...createTransactionBase(),
  type: 'PublishTransaction',
  contract: createContract(),
  ...options,
});

const createRegisterTransaction = (options: Partial<RegisterTransaction> = {}): RegisterTransaction => ({
  ...createTransactionBase(),
  type: 'RegisterTransaction',
  asset: createAsset(),
  ...options,
});

const createStateTransaction = (options: Partial<StateTransaction> = {}): StateTransaction => ({
  ...createTransactionBase(),
  type: 'StateTransaction',
  ...options,
});

const createInvocationTransaction = (options: Partial<InvocationTransaction> = {}): InvocationTransaction => ({
  ...createTransactionBase(),
  type: 'InvocationTransaction',
  script: data.buffers.a,
  gas: new BigNumber('10'),
  ...options,
});

const createMinerTransaction = (options: Partial<MinerTransaction> = {}): MinerTransaction => ({
  ...createTransactionBase(),
  type: 'MinerTransaction',
  nonce: 1234,
  ...options,
});

const createConfirmedMinerTransaction = (
  options: Partial<ConfirmedMinerTransaction> = {},
): ConfirmedMinerTransaction => ({
  ...createMinerTransaction(),
  ...createConfirmedTransactionBase(),
  ...options,
});

const createConfirmedClaimTransaction = (
  options: Partial<ConfirmedClaimTransaction> = {},
): ConfirmedClaimTransaction => ({
  ...createClaimTransaction(),
  ...createConfirmedTransactionBase(),
  ...options,
});

const createConfirmedContractTransaction = (
  options: Partial<ConfirmedContractTransaction> = {},
): ConfirmedContractTransaction => ({
  ...createContractTransaction(),
  ...createConfirmedTransactionBase(),
  ...options,
});

const createConfirmedEnrollmentTransaction = (
  options: Partial<ConfirmedEnrollmentTransaction> = {},
): ConfirmedEnrollmentTransaction => ({
  ...createEnrollmentTransaction(),
  ...createConfirmedTransactionBase(),
  ...options,
});

const createConfirmedInvocationTransaction = (
  options: Partial<ConfirmedInvocationTransaction> = {},
): ConfirmedInvocationTransaction => ({
  ...createInvocationTransaction(),
  ...createConfirmedTransactionBase(),
  invocationData: createRawInvocationData(),
  ...options,
});

const createConfirmedIssueTransaction = (
  options: Partial<ConfirmedIssueTransaction> = {},
): ConfirmedIssueTransaction => ({
  ...createIssueTransaction(),
  ...createConfirmedTransactionBase(),
  ...options,
});

const createConfirmedPublishTransaction = (
  options: Partial<ConfirmedPublishTransaction> = {},
): ConfirmedPublishTransaction => ({
  ...createPublishTransaction(),
  ...createConfirmedTransactionBase(),
  ...options,
});

const createConfirmedRegisterTransaction = (
  options: Partial<ConfirmedRegisterTransaction> = {},
): ConfirmedRegisterTransaction => ({
  ...createRegisterTransaction(),
  ...createConfirmedTransactionBase(),
  ...options,
});

const createConfirmedStateTransaction = (
  options: Partial<ConfirmedStateTransaction> = {},
): ConfirmedStateTransaction => ({
  ...createStateTransaction(),
  ...createConfirmedTransactionBase(),
  ...options,
});

const createRawCallReceipt = (options: Partial<RawCallReceipt> = {}): RawCallReceipt => ({
  result: createRawInvocationResultSuccess(),
  actions: [createRawNotification(), createRawLog()],
  ...options,
});

const createRawInvokeReceipt = (options: Partial<RawInvokeReceipt> = {}): RawInvokeReceipt => ({
  blockIndex: 10,
  blockHash: data.hash256s.a,
  transactionIndex: 1,
  globalIndex: new BigNumber(11),
  result: createRawInvocationResultSuccess(),
  actions: [createRawNotification(), createRawLog()],
  ...options,
});

const createNetworkSettings = (options: Partial<NetworkSettings> = {}): NetworkSettings => ({
  issueGASFee: data.bigNumbers.a,
  ...options,
});

const createUserAccountID = (options: Partial<UserAccountID> = {}): UserAccountID => ({
  network: 'main',
  address: keys[1].address,
  ...options,
});

const createUserAccount = (options: Partial<UserAccount> = {}): UserAccount => ({
  id: createUserAccountID(),
  name: 'Mock',
  publicKey: keys[1].publicKeyString,
  ...options,
});

const createLockedWallet = (options: Partial<LockedWallet> = {}): LockedWallet => ({
  type: 'locked',
  userAccount: createUserAccount(),
  nep2: keys[1].encryptedWIF,
  ...options,
});

const createUnlockedWallet = (options: Partial<UnlockedWallet> = {}): UnlockedWallet => ({
  type: 'unlocked',
  userAccount: createUserAccount({
    id: createUserAccountID({
      address: keys[0].address,
    }),
    publicKey: keys[0].publicKeyString,
  }),
  privateKey: keys[0].privateKeyString,
  nep2: keys[0].encryptedWIF,
  ...options,
});

const createOtherWallet = (options: Partial<UnlockedWallet> = {}): UnlockedWallet => ({
  type: 'unlocked',
  userAccount: createUserAccount({
    id: createUserAccountID({
      address: keys[1].address,
    }),
    publicKey: keys[1].publicKeyString,
  }),
  privateKey: keys[1].privateKeyString,
  nep2: keys[1].encryptedWIF,
  ...options,
});

const createTransfer = (options: Partial<Transfer> = {}): Transfer => ({
  to: keys[0].address,
  amount: data.bigNumbers.a,
  asset: Hash256.NEO,
  ...options,
});

const createAddressABIParameter = (options: Partial<AddressABIParameter> = {}): AddressABIParameter => ({
  type: 'Address',
  name: 'from',
  ...options,
});

const createIntegerABIParameter = (options: Partial<IntegerABIParameter> = {}): IntegerABIParameter => ({
  type: 'Integer',
  name: 'amount',
  decimals: 8,
  ...options,
});

const createDeployABIFunction = (options: Partial<ABIFunction> = {}): ABIFunction => ({
  name: 'deploy',
  parameters: [],
  returnType: { type: 'Boolean' },
  ...options,
});

const createABIEvent = (options: Partial<ABIEvent> = {}): ABIEvent => ({
  name: 'transfer',
  parameters: [
    createAddressABIParameter({ name: 'from' }),
    createAddressABIParameter({ name: 'to' }),
    createIntegerABIParameter({ name: 'amount' }),
  ],
  ...options,
});

const createStringABIReturn = (): StringABIReturn => ({
  type: 'String',
});

const createIntegerABIReturn = (): IntegerABIReturn => ({
  type: 'Integer',
  decimals: 0,
});

const createStringABIParameter = (options: Partial<StringABIParameter> = {}): StringABIParameter => ({
  type: 'String',
  name: 'foo',
  ...options,
});

const createABI = (options: Partial<ABI> = {}): ABI => ({
  ...nep5.abi(8),
  ...options,
});

const createForwardValue = (options: Partial<ForwardValue> = {}): ForwardValue =>
  // tslint:disable-next-line:no-object-literal-type-assertion
  ({
    name: 'foo',
    converted: true,
    param: true,
    ...options,
  } as ForwardValue);

const createABIFunction = (options: Partial<ABIFunction> = {}): ABIFunction => ({
  name: 'foo',
  parameters: [],
  returnType: { type: 'Boolean' },
  send: false,
  receive: false,
  sendUnsafe: false,
  refundAssets: false,
  completeSend: false,
  claim: false,
  ...options,
});

const createSmartContractDefinition = (options: Partial<SmartContractDefinition> = {}): SmartContractDefinition => ({
  networks: {
    main: {
      address: keys[0].address,
    },
  },
  abi: createABI(),
  ...options,
});

const createTransactionResult = (options: Partial<TransactionResult> = {}): TransactionResult => ({
  transaction: createContractTransaction(),
  confirmed: jest.fn(async () => createTransactionReceipt()),
  ...options,
});

const createAccount = (options: Partial<Account> = {}): Account => ({
  address: keys[0].address,
  balances: {
    [Hash256.NEO]: data.bigNumbers.a,
    [Hash256.GAS]: data.bigNumbers.b,
  },
  ...options,
});

const createHeader = (options: Partial<Header> = {}): Header => ({
  version: 0,
  hash: data.hash256s.a,
  previousBlockHash: data.hash256s.b,
  merkleRoot: data.hash256s.c,
  time: data.timestamps.past,
  index: 10,
  nonce: '1234',
  nextConsensus: keys[0].address,
  script: createWitnessJSON(),
  size: 256,
  ...options,
});

const createBlock = (options: Partial<Block> = {}): Block => ({
  ...createHeader(),
  transactions: [
    createConfirmedMinerTransaction(),
    createConfirmedClaimTransaction(),
    createConfirmedContractTransaction(),
    createConfirmedEnrollmentTransaction(),
    createConfirmedInvocationTransaction(),
    createConfirmedIssueTransaction(),
    createConfirmedPublishTransaction(),
    createConfirmedRegisterTransaction(),
    createConfirmedStateTransaction(),
  ],
  ...options,
});

const createNeoClaimableInputJSON = (options: Partial<NeoInputClaimableJSON> = {}): NeoInputClaimableJSON => ({
  txid: data.hash256s.a,
  n: 3,
  value: '23',
  start_height: 2000000,
  end_height: 3000000,
  generated: '1.23',
  sys_fee: '.01',
  unclaimed: '1.23',
  ...options,
});

const createNeoClaimableJSON = (options: Partial<NeoClaimableJSON> = {}): NeoClaimableJSON => ({
  claimable: [createNeoClaimableInputJSON()],
  unclaimed: '1.23',
  address: keys[0].address,
  ...options,
});

const createNeoUnspentOutputJSON = (options: Partial<NeoUnspentOutputJSON> = {}): NeoUnspentOutputJSON => ({
  txid: data.hash256s.b,
  n: 0,
  value: '.034',
  ...options,
});

const createNeoBalanceJSON = (options: Partial<NeoBalanceJSON> = {}): NeoBalanceJSON => ({
  unspent: [createNeoUnspentOutputJSON()],
  asset_hash: data.hash256s.c,
  asset: 'Gas',
  asset_symbol: 'GAS',
  amount: '.034',
  ...options,
});

const createNeoUnspentJSON = (options: Partial<NeoUnspentJSON> = {}): NeoUnspentJSON => ({
  balance: [createNeoBalanceJSON()],
  address: keys[0].address,
  ...options,
});

export const factory = {
  createAccountJSON,
  createAssetJSON,
  createContractJSON,
  createInputJSON,
  createOutputJSON,
  createIntegerContractParameterJSON,
  createArrayContractParameterJSON,
  createBooleanContractParameterJSON,
  createByteArrayContractParameterJSON,
  createHash160ContractParameterJSON,
  createHash256ContractParameterJSON,
  createInteropInterfaceContractParameterJSON,
  createMapContractParameterJSON,
  createPublicKeyContractParameterJSON,
  createSignatureContractParameterJSON,
  createStringContractParameterJSON,
  createVoidContractParameterJSON,
  createInvocationDataJSON,
  createInvocationResultSuccessJSON,
  createInvocationResultErrorJSON,
  createInvocationTransactionJSON,
  createMinerTransactionJSON,
  createClaimTransactionJSON,
  createContractTransactionJSON,
  createEnrollmentTransactionJSON,
  createIssueTransactionJSON,
  createPublishTransactionJSON,
  createRegisterTransactionJSON,
  createStateTransactionJSON,
  createTransactionReceipt,
  createCallReceiptJSON,
  createLogActionJSON,
  createVerifyScriptResultJSON,
  createVerifyTransactionResultJSON,
  createBlockJSON,
  createPeerJSON,
  createNetworkSettingsJSON,
  createStorageItemJSON,
  createAsset,
  createContract,
  createInput,
  createOutput,
  createRawInvocationData,
  createInvocationTransaction,
  createConfirmedInvocationTransaction,
  createInvocationResultSuccess,
  createInvocationResultError,
  createMinerTransaction,
  createConfirmedMinerTransaction,
  createInputOutput,
  createRawCallReceipt,
  createNetworkSettings,
  createBufferAttribute,
  createAddressAttribute,
  createHash256Attribute,
  createPublicKeyAttribute,
  createWitness,
  createLockedWallet,
  createUnlockedWallet,
  createOtherWallet,
  createTransfer,
  createContractTransaction,
  createClaimTransaction,
  createRegisterTransaction,
  createDeployABIFunction,
  createPublishTransaction,
  createRawInvocationResultError,
  createRawInvocationResultSuccess,
  createIssueTransaction,
  createRawLog,
  createRawNotification,
  createABIEvent,
  createABIFunction,
  createForwardValue,
  createAddressContractParameter,
  createIntegerContractParameter,
  createStringContractParameter,
  createStringABIReturn,
  createIntegerABIParameter,
  createIntegerABIReturn,
  createStringABIParameter,
  createRawTransferNotification,
  createSmartContractDefinition,
  createRawInvokeReceipt,
  createBooleanContractParameter,
  createUserAccount,
  createUserAccountID,
  createTransactionResult,
  createEnrollmentTransaction,
  createStateTransaction,
  createAccount,
  createBlock,
  createInvocationTransactionModel,
  createNeoClaimableInputJSON,
  createNeoClaimableJSON,
  createNeoUnspentOutputJSON,
  createNeoBalanceJSON,
  createNeoUnspentJSON,
  createRawInvocationResultSuccessJSON,
  createRawInvocationResultErrorJSON,
};
