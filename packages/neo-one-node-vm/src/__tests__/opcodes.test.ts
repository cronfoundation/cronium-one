// tslint:disable no-object-mutation no-any no-loop-statement
import { BinaryWriter, crypto, OpCode, ScriptBuilder, ScriptBuilderParam } from '@neo-one/client-common';
import {
  AttributeUsage,
  Contract,
  ContractParameterType,
  ContractPropertyState,
  NULL_ACTION,
  ScriptContainerType,
  Transaction,
  TriggerType,
  UInt160Attribute,
  utils,
} from '@neo-one/node-core';
import { BN } from 'bn.js';
import _ from 'lodash';
import { keys, transactions } from '../__data__';
import { ExecutionInit, FEES } from '../constants';
import { executeScript } from '../execute';
import {
  ArrayStackItem,
  BooleanStackItem,
  BufferStackItem,
  IntegerStackItem,
  MapStackItem,
  StackItem,
  StructStackItem,
  UInt160StackItem,
  UInt256StackItem,
} from '../stackItem';

const triggerType = TriggerType.Application;
const scriptAttributeHash = keys[0].scriptHash;
const blockTime = Date.now();

interface Op {
  readonly op: OpCode;
  readonly buffer?: Buffer;
}

interface TestCase extends Op {
  readonly preOps?: readonly Op[];
  readonly postOps?: readonly Op[];
  readonly result: readonly StackItem[];
  readonly resultAlt?: readonly StackItem[];
  readonly gas: BN;
  readonly args?: ReadonlyArray<ScriptBuilderParam | undefined>;
  readonly argsAlt?: ReadonlyArray<ScriptBuilderParam | undefined>;
  readonly stackItems?: readonly StackItem[];
  readonly ref?: StackItem;
  // tslint:disable-next-line no-any
  readonly mockBlockchain?: (options: { readonly blockchain: any }) => void;
  // tslint:disable-next-line no-any
  readonly mockTransaction?: (options: { readonly transaction: any }) => void;
  readonly returnValueCount?: number;
}

const setRef = new ArrayStackItem([new IntegerStackItem(new BN(1))]);
const appendRef = new ArrayStackItem([]);
const reverseRef = new ArrayStackItem([
  new IntegerStackItem(new BN(1)),
  new IntegerStackItem(new BN(2)),
  new IntegerStackItem(new BN(3)),
]);

const simpleStruct = new StructStackItem([new IntegerStackItem(new BN(1))]);

const removeRef = new ArrayStackItem([new IntegerStackItem(new BN(1)), new IntegerStackItem(new BN(2))]);

const mapStatic = new MapStackItem({
  referenceKeys: new Map([
    [
      new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(),
      new BufferStackItem(Buffer.from('aaaa', 'hex')),
    ],
    [
      new BufferStackItem(Buffer.from('bbbb', 'hex')).toStructuralKey(),
      new BufferStackItem(Buffer.from('bbbb', 'hex')),
    ],
  ]),
  referenceValues: new Map([
    [new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(1))],
    [new BufferStackItem(Buffer.from('bbbb', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(2))],
  ]),
});

const mapSetRef = new MapStackItem({
  referenceKeys: new Map([
    [
      new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(),
      new BufferStackItem(Buffer.from('aaaa', 'hex')),
    ],
    [
      new BufferStackItem(Buffer.from('bbbb', 'hex')).toStructuralKey(),
      new BufferStackItem(Buffer.from('bbbb', 'hex')),
    ],
  ]),
  referenceValues: new Map([
    [new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(1))],
    [new BufferStackItem(Buffer.from('bbbb', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(2))],
  ]),
});

const mapRemoveRef = new MapStackItem({
  referenceKeys: new Map([
    [
      new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(),
      new BufferStackItem(Buffer.from('aaaa', 'hex')),
    ],
    [
      new BufferStackItem(Buffer.from('bbbb', 'hex')).toStructuralKey(),
      new BufferStackItem(Buffer.from('bbbb', 'hex')),
    ],
  ]),
  referenceValues: new Map([
    [new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(1))],
    [new BufferStackItem(Buffer.from('bbbb', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(2))],
  ]),
});

const contractSB = new ScriptBuilder();
contractSB.emitOp('PUSH3');
contractSB.emitOp('PUSH2');

const contract = new Contract({
  script: contractSB.build(),
  parameterList: [],
  returnType: ContractParameterType.Void,
  name: '',
  codeVersion: '',
  author: '',
  email: '',
  description: '',
  contractProperties: ContractPropertyState.HasDynamicInvoke,
});

const multiplyContractSB = new ScriptBuilder();
multiplyContractSB.emitOp('PUSH2');
multiplyContractSB.emitOp('MUL');

const multiplyContract = new Contract({
  script: multiplyContractSB.build(),
  parameterList: [],
  returnType: ContractParameterType.Void,
  name: '',
  codeVersion: '',
  author: '',
  email: '',
  description: '',
  contractProperties: ContractPropertyState.HasDynamicInvoke,
});

const signature0 = crypto.sign({
  message: Buffer.alloc(32, 10),
  privateKey: keys[0].privateKey,
});

const signature1 = crypto.sign({
  message: Buffer.alloc(32, 10),
  privateKey: keys[1].privateKey,
});

// const hugeBuffer = Buffer.alloc(16843009, 0);

const OPCODES = ([
  {
    op: 'PUSH0',
    result: [new BufferStackItem(Buffer.from([]))],
    gas: utils.ZERO,
  },
] as readonly TestCase[])
  .concat(
    _.range(0x01, 0x4c).map((idx) => ({
      // tslint:disable-next-line no-any
      op: `PUSHBYTES${idx}` as any,
      buffer: Buffer.alloc(idx, 10),
      result: [new BufferStackItem(Buffer.alloc(idx, 10))],
      gas: utils.ZERO,
    })),
  )
  .concat(
    [
      {
        op: 'PUSHDATA1',
        buffer: Buffer.from([2, 10, 10]),
        result: [new BufferStackItem(Buffer.alloc(2, 10))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSHDATA2',
        buffer: Buffer.concat([Buffer.from([1, 1]), Buffer.alloc(257, 10)]),
        result: [new BufferStackItem(Buffer.alloc(257, 10))],
        gas: utils.ZERO,
      },

      // {
      //   op: 'PUSHDATA4',
      //   buffer: Buffer.concat([Buffer.from([1, 1, 1, 1]), hugeBuffer]),
      //   result: [new BufferStackItem(hugeBuffer)],
      //   gas: utils.ZERO,
      // },

      {
        op: 'PUSHM1',
        result: [new IntegerStackItem(new BN(-1))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH1',
        result: [new IntegerStackItem(new BN(1))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH2',
        result: [new IntegerStackItem(new BN(2))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH3',
        result: [new IntegerStackItem(new BN(3))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH4',
        result: [new IntegerStackItem(new BN(4))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH5',
        result: [new IntegerStackItem(new BN(5))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH6',
        result: [new IntegerStackItem(new BN(6))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH7',
        result: [new IntegerStackItem(new BN(7))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH8',
        result: [new IntegerStackItem(new BN(8))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH9',
        result: [new IntegerStackItem(new BN(9))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH10',
        result: [new IntegerStackItem(new BN(10))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH11',
        result: [new IntegerStackItem(new BN(11))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH12',
        result: [new IntegerStackItem(new BN(12))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH13',
        result: [new IntegerStackItem(new BN(13))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH14',
        result: [new IntegerStackItem(new BN(14))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH15',
        result: [new IntegerStackItem(new BN(15))],
        gas: utils.ZERO,
      },

      {
        op: 'PUSH16',
        result: [new IntegerStackItem(new BN(16))],
        gas: utils.ZERO,
      },

      {
        op: 'NOP',
        result: [],
        gas: utils.ZERO,
      },

      {
        op: 'JMP',
        // Jump 1 ahead + 2 over the jump bytes
        buffer: new ScriptBuilder().emitInt16LE(3).build(),
        postOps: [{ op: 'PUSH2' }, { op: 'PUSH3' }],
        result: [new IntegerStackItem(new BN(3)), new IntegerStackItem(new BN(2))],

        gas: FEES.ONE,
      },

      {
        op: 'JMP',
        // Jump 2 ahead + 2 over the jump bytes
        buffer: new ScriptBuilder().emitInt16LE(4).build(),
        postOps: [{ op: 'PUSH2' }, { op: 'PUSH3' }],
        result: [new IntegerStackItem(new BN(3))],
        gas: FEES.ONE,
      },

      {
        op: 'JMPIF',
        args: [Buffer.alloc(1, 1)],
        // Jump 2 ahead + 2 over the jump bytes
        buffer: new ScriptBuilder().emitInt16LE(4).build(),
        postOps: [{ op: 'PUSH2' }, { op: 'PUSH3' }],
        result: [new IntegerStackItem(new BN(3))],
        gas: FEES.ONE,
      },

      {
        op: 'JMPIF',
        args: [Buffer.alloc(1, 0)],
        // Jump 2 ahead + 2 over the jump bytes
        buffer: new ScriptBuilder().emitInt16LE(4).build(),
        postOps: [{ op: 'PUSH2' }, { op: 'PUSH3' }],
        result: [new IntegerStackItem(new BN(3)), new IntegerStackItem(new BN(2))],

        gas: FEES.ONE,
      },

      {
        op: 'JMPIFNOT',
        args: [Buffer.alloc(1, 0)],
        // Jump 2 ahead + 2 over the jump bytes
        buffer: new ScriptBuilder().emitInt16LE(4).build(),
        postOps: [{ op: 'PUSH2' }, { op: 'PUSH3' }],
        result: [new IntegerStackItem(new BN(3))],
        gas: FEES.ONE,
      },

      {
        op: 'JMPIFNOT',
        args: [Buffer.alloc(1, 1)],
        // Jump 2 ahead + 2 over the jump bytes
        buffer: new ScriptBuilder().emitInt16LE(4).build(),
        postOps: [{ op: 'PUSH2' }, { op: 'PUSH3' }],
        result: [new IntegerStackItem(new BN(3)), new IntegerStackItem(new BN(2))],

        gas: FEES.ONE,
      },

      {
        op: 'CALL',
        // Jump 2 ahead + 2 over the jump bytes
        buffer: new ScriptBuilder().emitInt16LE(4).build(),
        // We jump to PUSH3, then return, then invoke PUSH2 and PUSH3 again.
        postOps: [{ op: 'PUSH2' }, { op: 'PUSH3' }, { op: 'RET' }],
        result: [new IntegerStackItem(new BN(3)), new IntegerStackItem(new BN(2)), new IntegerStackItem(new BN(3))],

        // CALL + RET + RET
        gas: FEES.ONE.add(FEES.ONE).add(FEES.ONE),
      },

      {
        op: 'CALL',
        // Jump 2 behind
        buffer: new ScriptBuilder().emitInt16LE(-2).build(),
        // We jump to PUSH3, then return, then invoke PUSH2 and PUSH3 again.
        preOps: [
          {
            op: 'JMP',
            // Jump 4 ahead + 2 over the jump bytes
            buffer: new ScriptBuilder().emitInt16LE(6).build(),
          },

          { op: 'PUSH2' },
          { op: 'PUSH3' },
          { op: 'RET' },
        ],

        result: [new IntegerStackItem(new BN(3))],
        // JMP + CALL + RET
        gas: FEES.ONE.add(FEES.ONE).add(FEES.ONE),
      },

      {
        op: 'CALL_I',
        // 1 return value, 0 parameters, Jump ahead 2 + 4 over the jump (2) + return (1) + param (1) bytes.
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([0]), new ScriptBuilder().emitInt16LE(6).build()]),
        // jump to PUSH4, then return, then invoke PUSH2, PUSH3, and PUSH4 again
        postOps: [{ op: 'PUSH1' }, { op: 'PUSH2' }, { op: 'PUSH3' }, { op: 'PUSH4' }, { op: 'RET' }],
        result: [
          new IntegerStackItem(new BN(4)),
          new IntegerStackItem(new BN(3)),
          new IntegerStackItem(new BN(2)),
          new IntegerStackItem(new BN(1)),
          new IntegerStackItem(new BN(4)),
        ],
        // CALL_I RET RET
        gas: FEES.ONE.add(FEES.ONE).add(FEES.ONE),
      },

      {
        op: 'CALL_I',
        // 2 return value, 0 parameters, Jump ahead 1 + 4 over the jump (2) + return (1) + param (1) bytes.
        buffer: Buffer.concat([Buffer.from([2]), Buffer.from([0]), new ScriptBuilder().emitInt16LE(5).build()]),
        // jump to PUSH3, PUSH4, then return, then invoke PUSH2, PUSH3, and PUSH4 again
        postOps: [{ op: 'PUSH1' }, { op: 'PUSH2' }, { op: 'PUSH3' }, { op: 'PUSH4' }, { op: 'RET' }],
        result: [
          new IntegerStackItem(new BN(4)),
          new IntegerStackItem(new BN(3)),
          new IntegerStackItem(new BN(2)),
          new IntegerStackItem(new BN(1)),
          new IntegerStackItem(new BN(4)),
          new IntegerStackItem(new BN(3)),
        ],
        // CALL_I RET RET
        gas: FEES.ONE.add(FEES.ONE).add(FEES.ONE),
      },

      {
        op: 'CALL_I',
        // 1 return value, 2 parameters, Jump ahead 1 + 4 over the jump (2) + return (1) + param (1) bytes.
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([2]), new ScriptBuilder().emitInt16LE(5).build()]),
        postOps: [{ op: 'PUSH2' }, { op: 'PUSH3' }, { op: 'ADD' }, { op: 'RET' }],
        // jump to ADD (adds the two args), then return, then invoke PUSH2, PUSH3, and ADD again
        args: [new BN(5), new BN(7)],
        result: [new IntegerStackItem(new BN(5)), new IntegerStackItem(new BN(12))],
        // CALL_I ADD RET ADD RET
        gas: FEES.ONE.add(FEES.ONE).add(FEES.ONE).add(FEES.ONE).add(FEES.ONE),
      },

      {
        op: 'CALL_I',
        // 0 return value, 2 parameters, Jump ahead 1 + 4 over the jump (2) + return (1) + param (1) bytes.
        buffer: Buffer.concat([Buffer.from([0]), Buffer.from([2]), new ScriptBuilder().emitInt16LE(5).build()]),
        postOps: [{ op: 'PUSH2' }, { op: 'PUSH3' }, { op: 'ADD' }, { op: 'RET' }],
        // jump to ADD (adds the two args), then return, then invoke PUSH2, PUSH3, and ADDs again
        args: [new BN(5), new BN(7)],
        result: [new IntegerStackItem(new BN(5))],
        // CALL_I ADD RET ADD RET
        gas: FEES.ONE.add(FEES.ONE).add(FEES.ONE).add(FEES.ONE).add(FEES.ONE),
      },

      // RET is tested above
      {
        op: 'APPCALL',
        buffer: Buffer.alloc(20, 10),
        // Result of Contract Script defined above
        result: [new IntegerStackItem(new BN(2)), new IntegerStackItem(new BN(3))],

        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(contract));
        },
        gas: FEES.TEN,
      },

      {
        op: 'APPCALL',
        buffer: Buffer.alloc(20, 0),
        args: [Buffer.alloc(20, 10)],
        // Result of Contract Script defined above
        result: [new IntegerStackItem(new BN(2)), new IntegerStackItem(new BN(3))],

        // Slightly broken because we're actually running a dynamic invoke
        // directly from a transaction, but it works because we mock return
        // this contract with dynamic invoke enabled
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(contract));
        },
        gas: FEES.TEN,
      },
      {
        op: 'CALL_E',
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([2]), Buffer.alloc(20, 10)]),
        args: [new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
      },
      {
        op: 'CALL_E',
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([1]), Buffer.alloc(20, 10)]),
        args: [new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4)), new IntegerStackItem(new BN(3))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
      },
      {
        op: 'CALL_E',
        buffer: Buffer.concat([Buffer.from([2]), Buffer.from([2]), Buffer.alloc(20, 10)]),
        args: [new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4)), new IntegerStackItem(new BN(3))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
      },
      {
        op: 'CALL_ET',
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([2]), Buffer.alloc(20, 10)]),
        args: [new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
        returnValueCount: 1,
      },
      {
        op: 'CALL_ET',
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([1]), Buffer.alloc(20, 10)]),
        args: [new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4)), new IntegerStackItem(new BN(3))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
        returnValueCount: 1,
      },
      {
        op: 'CALL_ET',
        buffer: Buffer.concat([Buffer.from([2]), Buffer.from([2]), Buffer.alloc(20, 10)]),
        args: [new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4)), new IntegerStackItem(new BN(3))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
        returnValueCount: 2,
      },
      {
        op: 'CALL_ED',
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([2])]),
        args: [Buffer.alloc(20, 10), new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
      },
      {
        op: 'CALL_ED',
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([1])]),
        args: [Buffer.alloc(20, 10), new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4)), new IntegerStackItem(new BN(3))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
      },
      {
        op: 'CALL_ED',
        buffer: Buffer.concat([Buffer.from([2]), Buffer.from([2])]),
        args: [Buffer.alloc(20, 10), new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4)), new IntegerStackItem(new BN(3))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
      },
      {
        op: 'CALL_EDT',
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([2])]),
        args: [Buffer.alloc(20, 10), new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
        returnValueCount: 1,
      },
      {
        op: 'CALL_EDT',
        buffer: Buffer.concat([Buffer.from([1]), Buffer.from([1])]),
        args: [Buffer.alloc(20, 10), new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4)), new IntegerStackItem(new BN(3))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
        returnValueCount: 1,
      },
      {
        op: 'CALL_EDT',
        buffer: Buffer.concat([Buffer.from([2]), Buffer.from([2])]),
        args: [Buffer.alloc(20, 10), new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(4)), new IntegerStackItem(new BN(3))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(multiplyContract));
        },
        gas: FEES.ONE.add(FEES.ONE),
        returnValueCount: 2,
      },

      {
        op: 'SYSCALL',
        buffer: new BinaryWriter().writeVarBytesLE(Buffer.from('Neo.Blockchain.GetHeight', 'ascii')).toBuffer(),
        result: [new IntegerStackItem(new BN(10))],
        mockBlockchain: ({ blockchain }) => {
          blockchain.currentBlock.index = 10;
        },
        gas: FEES.ONE,
      },

      {
        op: 'TAILCALL',
        buffer: Buffer.alloc(20, 10),
        // Result of Contract Script defined above
        result: [new IntegerStackItem(new BN(2)), new IntegerStackItem(new BN(3))],

        mockBlockchain: ({ blockchain }) => {
          blockchain.contract.get = jest.fn(async () => Promise.resolve(contract));
        },
        gas: FEES.TEN,
      },

      {
        op: 'DUPFROMALTSTACK',
        argsAlt: [new BN(1)],
        result: [new IntegerStackItem(new BN(1))],
        resultAlt: [new IntegerStackItem(new BN(1))],
        gas: FEES.ONE,
      },

      {
        op: 'TOALTSTACK',
        args: [new BN(1)],
        result: [],
        resultAlt: [new IntegerStackItem(new BN(1))],
        gas: FEES.ONE,
      },

      {
        op: 'FROMALTSTACK',
        argsAlt: [new BN(1)],
        result: [new IntegerStackItem(new BN(1))],
        gas: FEES.ONE,
      },

      {
        op: 'XDROP',
        args: [new BN(1), Buffer.alloc(1, 1), Buffer.alloc(1, 0)],
        result: [new BufferStackItem(Buffer.alloc(1, 1))],
        gas: FEES.ONE,
      },

      {
        op: 'XSWAP',
        args: [new BN(1), Buffer.alloc(1, 1), Buffer.alloc(1, 0)],
        result: [new BufferStackItem(Buffer.alloc(1, 0)), new BufferStackItem(Buffer.alloc(1, 1))],

        gas: FEES.ONE,
      },

      {
        op: 'XTUCK',
        args: [new BN(2), Buffer.alloc(1, 0), Buffer.alloc(1, 1), Buffer.alloc(1, 2), Buffer.alloc(1, 3)],

        result: [
          new BufferStackItem(Buffer.alloc(1, 0)),
          new BufferStackItem(Buffer.alloc(1, 1)),
          new BufferStackItem(Buffer.alloc(1, 0)),
          new BufferStackItem(Buffer.alloc(1, 2)),
          new BufferStackItem(Buffer.alloc(1, 3)),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'DEPTH',
        args: [Buffer.alloc(1, 0), Buffer.alloc(1, 1)],
        result: [
          new IntegerStackItem(new BN(2)),
          new BufferStackItem(Buffer.alloc(1, 0)),
          new BufferStackItem(Buffer.alloc(1, 1)),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'DROP',
        args: [Buffer.alloc(1, 0)],
        result: [],
        gas: FEES.ONE,
      },

      {
        op: 'DUP',
        args: [Buffer.alloc(1, 0)],
        result: [new BufferStackItem(Buffer.alloc(1, 0)), new BufferStackItem(Buffer.alloc(1, 0))],

        gas: FEES.ONE,
      },

      {
        op: 'NIP',
        args: [Buffer.alloc(1, 0), Buffer.alloc(1, 1)],
        result: [new BufferStackItem(Buffer.alloc(1, 0))],
        gas: FEES.ONE,
      },

      {
        op: 'OVER',
        args: [Buffer.alloc(1, 0), Buffer.alloc(1, 1)],
        result: [
          new BufferStackItem(Buffer.alloc(1, 1)),
          new BufferStackItem(Buffer.alloc(1, 0)),
          new BufferStackItem(Buffer.alloc(1, 1)),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'PICK',
        args: [new BN(1), Buffer.alloc(1, 0), Buffer.alloc(1, 1)],
        result: [
          new BufferStackItem(Buffer.alloc(1, 1)),
          new BufferStackItem(Buffer.alloc(1, 0)),
          new BufferStackItem(Buffer.alloc(1, 1)),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'ROLL',
        args: [new BN(1), Buffer.alloc(1, 0), Buffer.alloc(1, 1), Buffer.alloc(1, 2)],

        result: [
          new BufferStackItem(Buffer.alloc(1, 1)),
          new BufferStackItem(Buffer.alloc(1, 0)),
          new BufferStackItem(Buffer.alloc(1, 2)),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'ROT',
        args: [Buffer.alloc(1, 3), Buffer.alloc(1, 2), Buffer.alloc(1, 1)],
        result: [
          new BufferStackItem(Buffer.alloc(1, 1)),
          new BufferStackItem(Buffer.alloc(1, 3)),
          new BufferStackItem(Buffer.alloc(1, 2)),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'SWAP',
        args: [Buffer.alloc(1, 0), Buffer.alloc(1, 1)],
        result: [new BufferStackItem(Buffer.alloc(1, 1)), new BufferStackItem(Buffer.alloc(1, 0))],

        gas: FEES.ONE,
      },

      {
        op: 'TUCK',
        args: [Buffer.alloc(1, 0), Buffer.alloc(1, 1)],
        result: [
          new BufferStackItem(Buffer.alloc(1, 0)),
          new BufferStackItem(Buffer.alloc(1, 1)),
          new BufferStackItem(Buffer.alloc(1, 0)),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'CAT',
        args: [Buffer.alloc(1, 0), Buffer.alloc(1, 1)],
        result: [new BufferStackItem(Buffer.concat([Buffer.alloc(1, 1), Buffer.alloc(1, 0)]))],

        gas: FEES.ONE,
      },

      {
        op: 'SUBSTR',
        args: [new BN(2), new BN(1), Buffer.from([11, 12, 13, 14, 15])],
        result: [new BufferStackItem(Buffer.from([12, 13]))],
        gas: FEES.ONE,
      },

      {
        op: 'LEFT',
        args: [new BN(2), Buffer.from([11, 12, 13, 14, 15])],
        result: [new BufferStackItem(Buffer.from([11, 12]))],
        gas: FEES.ONE,
      },

      {
        op: 'RIGHT',
        args: [new BN(2), Buffer.from([11, 12, 13, 14, 15])],
        result: [new BufferStackItem(Buffer.from([14, 15]))],
        gas: FEES.ONE,
      },

      {
        op: 'SIZE',
        args: [Buffer.alloc(10, 1)],
        result: [new IntegerStackItem(new BN(10))],
        gas: FEES.ONE,
      },

      {
        op: 'INVERT',
        args: [Buffer.alloc(10, 0x0f)],
        result: [new IntegerStackItem(utils.fromSignedBuffer(Buffer.alloc(10, 0xf0)))],

        gas: FEES.ONE,
      },

      {
        op: 'INVERT',
        args: [Buffer.alloc(1, 0xf0)],
        result: [new IntegerStackItem(utils.fromSignedBuffer(Buffer.alloc(1, 0x0f)))],

        gas: FEES.ONE,
      },

      {
        op: 'AND',
        args: [Buffer.alloc(10, 0x0a), Buffer.alloc(10, 0x0f)],
        result: [new IntegerStackItem(utils.fromSignedBuffer(Buffer.alloc(10, 0x0a)))],

        gas: FEES.ONE,
      },

      {
        op: 'AND',
        args: [Buffer.alloc(1, 0xa0), Buffer.alloc(1, 0xa0)],
        result: [new IntegerStackItem(utils.fromSignedBuffer(Buffer.alloc(1, 0xa0)))],

        gas: FEES.ONE,
      },

      {
        op: 'OR',
        args: [Buffer.alloc(10, 0xa0), Buffer.alloc(10, 0x0a)],
        result: [new IntegerStackItem(utils.fromSignedBuffer(Buffer.alloc(10, 0xaa)))],

        gas: FEES.ONE,
      },

      {
        op: 'OR',
        args: [Buffer.alloc(10, 0xaa), Buffer.alloc(10, 0xaa)],
        result: [new IntegerStackItem(utils.fromSignedBuffer(Buffer.alloc(10, 0xaa)))],

        gas: FEES.ONE,
      },

      {
        op: 'OR',
        args: [2, 128],
        result: [new IntegerStackItem(new BN(130))],
        gas: FEES.ONE,
      },

      {
        op: 'OR',
        args: [128, 2],
        result: [new IntegerStackItem(new BN(130))],
        gas: FEES.ONE,
      },

      {
        op: 'XOR',
        args: [Buffer.alloc(10, 0xa0), Buffer.alloc(10, 0x0a)],
        result: [new IntegerStackItem(utils.fromSignedBuffer(Buffer.alloc(10, 0xaa)))],

        gas: FEES.ONE,
      },

      {
        op: 'XOR',
        args: [Buffer.alloc(10, 0xaa), Buffer.alloc(10, 0xaa)],
        result: [new IntegerStackItem(utils.fromSignedBuffer(Buffer.alloc(10, 0x00)))],

        gas: FEES.ONE,
      },

      {
        op: 'EQUAL',
        args: [Buffer.alloc(10, 0x01), Buffer.alloc(10, 0x01)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'EQUAL',
        args: [Buffer.alloc(10, 0x01), []],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'EQUAL',
        args: [new BN(1), []],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'EQUAL',
        args: [true, []],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      // {
      //   op: 'OP_EQUALVERIFY',
      // },
      // {
      //   op: 'OP_RESERVED1',
      // },
      // {
      //   op: 'OP_RESERVED2',
      // },
      {
        op: 'INC',
        args: [new BN(1)],
        result: [new IntegerStackItem(new BN(2))],
        gas: FEES.ONE,
      },

      {
        op: 'DEC',
        args: [new BN(2)],
        result: [new IntegerStackItem(new BN(1))],
        gas: FEES.ONE,
      },

      {
        op: 'SIGN',
        args: [new BN(0)],
        result: [new IntegerStackItem(utils.ZERO)],
        gas: FEES.ONE,
      },

      {
        op: 'SIGN',
        args: [new BN(-1)],
        result: [new IntegerStackItem(utils.NEGATIVE_ONE)],
        gas: FEES.ONE,
      },

      {
        op: 'SIGN',
        args: [new BN(5)],
        result: [new IntegerStackItem(utils.ONE)],
        gas: FEES.ONE,
      },

      {
        op: 'NEGATE',
        args: [new BN(5)],
        result: [new IntegerStackItem(new BN(-5))],
        gas: FEES.ONE,
      },

      {
        op: 'ABS',
        args: [new BN(-1)],
        result: [new IntegerStackItem(new BN(1))],
        gas: FEES.ONE,
      },

      {
        op: 'NOT',
        args: [true],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'NZ',
        args: [new BN(5)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'NZ',
        args: [new BN(0)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'ADD',
        args: [new BN(1), new BN(5)],
        result: [new IntegerStackItem(new BN(6))],
        gas: FEES.ONE,
      },

      {
        op: 'SUB',
        args: [new BN(1), new BN(5)],
        result: [new IntegerStackItem(new BN(4))],
        gas: FEES.ONE,
      },

      {
        op: 'MUL',
        args: [new BN(2), new BN(5)],
        result: [new IntegerStackItem(new BN(10))],
        gas: FEES.ONE,
      },

      {
        op: 'DIV',
        args: [new BN(2), new BN(11)],
        result: [new IntegerStackItem(new BN(5))],
        gas: FEES.ONE,
      },

      {
        op: 'MOD',
        args: [new BN(2), new BN(5)],
        result: [new IntegerStackItem(new BN(1))],
        gas: FEES.ONE,
      },

      {
        op: 'SHL',
        args: [new BN(2), new BN(1)],
        result: [new IntegerStackItem(new BN(4))],
        gas: FEES.ONE,
      },

      {
        op: 'SHL',
        args: [new BN(2), new BN(-1)],
        result: [new IntegerStackItem(new BN(-4))],
        gas: FEES.ONE,
      },

      {
        op: 'SHR',
        args: [new BN(2), new BN(4)],
        result: [new IntegerStackItem(new BN(1))],
        gas: FEES.ONE,
      },

      {
        op: 'SHR',
        args: [new BN(2), new BN(-4)],
        result: [new IntegerStackItem(new BN(-2))],
        gas: FEES.ONE,
      },

      {
        op: 'BOOLAND',
        args: [true, false],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'BOOLAND',
        args: [true, true],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'BOOLAND',
        args: [false, false],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'BOOLOR',
        args: [true, false],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'BOOLOR',
        args: [true, true],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'BOOLOR',
        args: [false, false],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'NUMEQUAL',
        args: [new BN(4), new BN(4)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'NUMEQUAL',
        args: [new BN(4), new BN(5)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'NUMNOTEQUAL',
        args: [new BN(4), new BN(4)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'NUMNOTEQUAL',
        args: [new BN(4), new BN(5)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'LT',
        args: [new BN(4), new BN(5)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'LT',
        args: [new BN(6), new BN(5)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'GT',
        args: [new BN(4), new BN(5)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'GT',
        args: [new BN(6), new BN(5)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'LTE',
        args: [new BN(4), new BN(5)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'LTE',
        args: [new BN(4), new BN(4)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'LTE',
        args: [new BN(4), new BN(3)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'GTE',
        args: [new BN(4), new BN(5)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'GTE',
        args: [new BN(4), new BN(4)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'GTE',
        args: [new BN(4), new BN(3)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'MIN',
        args: [new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(2))],
        gas: FEES.ONE,
      },

      {
        op: 'MAX',
        args: [new BN(2), new BN(3)],
        result: [new IntegerStackItem(new BN(3))],
        gas: FEES.ONE,
      },

      {
        op: 'WITHIN',
        args: [new BN(2), new BN(3), new BN(4)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'WITHIN',
        args: [new BN(5), new BN(3), new BN(4)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'SHA1',
        args: [Buffer.alloc(1, 1)],
        result: [new BufferStackItem(crypto.sha1(Buffer.alloc(1, 1)))],
        gas: FEES.TEN,
      },

      {
        op: 'SHA256',
        args: [Buffer.alloc(1, 1)],
        result: [new BufferStackItem(crypto.sha256(Buffer.alloc(1, 1)))],
        gas: FEES.TEN,
      },

      {
        op: 'HASH160',
        args: [Buffer.alloc(20, 1)],
        result: [new UInt160StackItem(crypto.hash160(Buffer.alloc(20, 1)))],
        gas: FEES.TWENTY,
      },

      {
        op: 'HASH256',
        args: [Buffer.alloc(32, 1)],
        result: [new UInt256StackItem(crypto.hash256(Buffer.alloc(32, 1)))],
        gas: FEES.TWENTY,
      },

      {
        op: 'CHECKSIG',
        args: [keys[0].publicKey, signature0],
        result: [new BooleanStackItem(true)],
        mockTransaction: ({ transaction }) => {
          transaction.messageInternal = jest.fn(() => Buffer.alloc(32, 10));
        },
        gas: FEES.ONE_HUNDRED,
      },

      {
        op: 'CHECKSIG',
        args: [keys[0].publicKey, Buffer.alloc(64, 10)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE_HUNDRED,
      },

      {
        op: 'VERIFY',
        args: [keys[0].publicKey, signature0, Buffer.alloc(32, 10)],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE_HUNDRED,
      },

      {
        op: 'VERIFY',
        args: [keys[0].publicKey, signature0, Buffer.alloc(32, 1)],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE_HUNDRED,
      },

      {
        op: 'CHECKMULTISIG',
        args: [
          [keys[0].publicKey, keys[1].publicKey],
          [signature0, signature1],
        ],
        result: [new BooleanStackItem(true)],
        mockTransaction: ({ transaction }) => {
          transaction.messageInternal = jest.fn(() => Buffer.alloc(32, 10));
        },
        gas: FEES.ONE_HUNDRED.mul(new BN(2)),
      },

      {
        op: 'CHECKMULTISIG',
        args: [new BN(2), keys[0].publicKey, keys[1].publicKey, new BN(2), signature0, signature1],

        result: [new BooleanStackItem(true)],
        mockTransaction: ({ transaction }) => {
          transaction.messageInternal = jest.fn(() => Buffer.alloc(32, 10));
        },
        gas: FEES.ONE_HUNDRED.mul(new BN(2)),
      },

      {
        op: 'CHECKMULTISIG',
        args: [
          [keys[0].publicKey, keys[2].publicKey, keys[1].publicKey],
          [signature0, signature1],
        ],

        result: [new BooleanStackItem(true)],
        mockTransaction: ({ transaction }) => {
          transaction.messageInternal = jest.fn(() => Buffer.alloc(32, 10));
        },
        gas: FEES.ONE_HUNDRED.mul(new BN(3)),
      },

      {
        op: 'CHECKMULTISIG',
        args: [new BN(3), keys[0].publicKey, keys[2].publicKey, keys[1].publicKey, new BN(2), signature0, signature1],

        result: [new BooleanStackItem(true)],
        mockTransaction: ({ transaction }) => {
          transaction.messageInternal = jest.fn(() => Buffer.alloc(32, 10));
        },
        gas: FEES.ONE_HUNDRED.mul(new BN(3)),
      },

      {
        op: 'CHECKMULTISIG',
        args: [[keys[0].publicKey, keys[1].publicKey], [Buffer.alloc(64, 10)]],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE_HUNDRED.mul(new BN(2)),
      },

      {
        op: 'CHECKMULTISIG',
        args: [new BN(2), keys[0].publicKey, keys[1].publicKey, new BN(1), Buffer.alloc(64, 10)],

        result: [new BooleanStackItem(false)],
        mockTransaction: ({ transaction }) => {
          transaction.messageInternal = jest.fn(() => Buffer.alloc(32, 10));
        },
        gas: FEES.ONE_HUNDRED.mul(new BN(2)),
      },

      {
        op: 'ARRAYSIZE',
        args: [[true, false]],
        result: [new IntegerStackItem(new BN(2))],
        gas: FEES.ONE,
      },

      {
        op: 'PACK',
        args: [new BN(1), Buffer.alloc(1, 0), Buffer.alloc(1, 1), Buffer.alloc(1, 2)],

        result: [
          new ArrayStackItem([new BufferStackItem(Buffer.alloc(1, 0))]),
          new BufferStackItem(Buffer.alloc(1, 1)),
          new BufferStackItem(Buffer.alloc(1, 2)),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'UNPACK',
        args: [[new BN(4), new BN(5)]],
        result: [new IntegerStackItem(new BN(2)), new IntegerStackItem(new BN(4)), new IntegerStackItem(new BN(5))],

        gas: FEES.ONE,
      },

      {
        op: 'PICKITEM',
        args: [new BN(1), [Buffer.alloc(1, 0), Buffer.alloc(1, 1), Buffer.alloc(1, 2)]],

        result: [new BufferStackItem(Buffer.alloc(1, 1))],
        gas: FEES.ONE,
      },

      {
        op: 'PICKITEM',
        stackItems: [new BufferStackItem(Buffer.from('aaaa', 'hex')), mapStatic],
        result: [new IntegerStackItem(new BN(1))],
        gas: FEES.ONE,
      },

      {
        op: 'PICKITEM',
        stackItems: [
          new IntegerStackItem(new BN(1)),
          new StructStackItem([
            new IntegerStackItem(new BN(1)),
            new StructStackItem([new IntegerStackItem(new BN(1))]),
          ]),
        ],
        result: [new StructStackItem([new IntegerStackItem(new BN(1))])],
        gas: FEES.ONE,
      },

      {
        op: 'SETITEM',
        ref: setRef,
        stackItems: [new IntegerStackItem(new BN(5)), new IntegerStackItem(new BN(0)), setRef],

        result: [new ArrayStackItem([new IntegerStackItem(new BN(5))])],
        gas: FEES.ONE,
      },

      {
        op: 'SETITEM',
        ref: mapSetRef,
        stackItems: [new IntegerStackItem(new BN(5)), new BufferStackItem(Buffer.from('dddd', 'hex')), mapSetRef],

        result: [
          new MapStackItem({
            referenceKeys: new Map([
              [
                new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(),
                new BufferStackItem(Buffer.from('aaaa', 'hex')),
              ],
              [
                new BufferStackItem(Buffer.from('bbbb', 'hex')).toStructuralKey(),
                new BufferStackItem(Buffer.from('bbbb', 'hex')),
              ],
              [
                new BufferStackItem(Buffer.from('dddd', 'hex')).toStructuralKey(),
                new BufferStackItem(Buffer.from('dddd', 'hex')),
              ],
            ]),
            referenceValues: new Map([
              [new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(1))],
              [new BufferStackItem(Buffer.from('bbbb', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(2))],
              [new BufferStackItem(Buffer.from('dddd', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(5))],
            ]),
          }),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'NEWARRAY',
        args: [new BN(3)],
        result: [
          new ArrayStackItem([new BooleanStackItem(false), new BooleanStackItem(false), new BooleanStackItem(false)]),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'NEWARRAY',
        args: [[new BN(1), new BN(2), new BN(3)]],
        result: [
          new ArrayStackItem([
            new IntegerStackItem(new BN(1)),
            new IntegerStackItem(new BN(2)),
            new IntegerStackItem(new BN(3)),
          ]),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'NEWARRAY',
        stackItems: [simpleStruct],
        result: [new ArrayStackItem([new IntegerStackItem(new BN(1))])],

        gas: FEES.ONE,
      },

      {
        op: 'NEWSTRUCT',
        args: [new BN(3)],
        result: [
          new StructStackItem([new BooleanStackItem(false), new BooleanStackItem(false), new BooleanStackItem(false)]),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'NEWSTRUCT',
        args: [[new BN(1), new BN(2), new BN(3)]],
        result: [
          new StructStackItem([
            new IntegerStackItem(new BN(1)),
            new IntegerStackItem(new BN(2)),
            new IntegerStackItem(new BN(3)),
          ]),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'NEWSTRUCT',
        stackItems: [simpleStruct],
        result: [new StructStackItem([new IntegerStackItem(new BN(1))])],

        gas: FEES.ONE,
      },

      {
        op: 'NEWMAP',
        result: [new MapStackItem()],
        gas: FEES.ONE,
      },

      {
        op: 'APPEND',
        ref: appendRef,
        stackItems: [new IntegerStackItem(new BN(3)), appendRef],
        result: [new ArrayStackItem([new IntegerStackItem(new BN(3))])],
        gas: FEES.ONE,
      },

      {
        op: 'APPEND',
        stackItems: [simpleStruct, simpleStruct, simpleStruct],
        result: [
          new StructStackItem([
            new IntegerStackItem(new BN(1)),
            new StructStackItem([new IntegerStackItem(new BN(1))]),
          ]),
        ],
        gas: FEES.ONE,
      },

      {
        op: 'REVERSE',
        ref: reverseRef,
        stackItems: [reverseRef],
        result: [
          new ArrayStackItem([
            new IntegerStackItem(new BN(3)),
            new IntegerStackItem(new BN(2)),
            new IntegerStackItem(new BN(1)),
          ]),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'REMOVE',
        ref: removeRef,
        stackItems: [new IntegerStackItem(new BN(1)), removeRef],
        result: [new ArrayStackItem([new IntegerStackItem(new BN(1))])],
        gas: FEES.ONE,
      },

      {
        op: 'REMOVE',
        ref: mapRemoveRef,
        stackItems: [new BufferStackItem(Buffer.from('bbbb', 'hex')), mapRemoveRef],

        result: [
          new MapStackItem({
            referenceKeys: new Map([
              [
                new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(),
                new BufferStackItem(Buffer.from('aaaa', 'hex')),
              ],
            ]),
            referenceValues: new Map([
              [new BufferStackItem(Buffer.from('aaaa', 'hex')).toStructuralKey(), new IntegerStackItem(new BN(1))],
            ]),
          }),
        ],

        gas: FEES.ONE,
      },

      {
        op: 'HASKEY',
        args: [new BN(1), [new BN(0), new BN(1)]],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'HASKEY',
        args: [new BN(2), [new BN(0), new BN(1)]],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'HASKEY',
        stackItems: [new BufferStackItem(Buffer.from('aaaa', 'hex')), mapStatic],
        result: [new BooleanStackItem(true)],
        gas: FEES.ONE,
      },

      {
        op: 'HASKEY',
        stackItems: [new BufferStackItem(Buffer.from('cccc', 'hex')), mapStatic],
        result: [new BooleanStackItem(false)],
        gas: FEES.ONE,
      },

      {
        op: 'KEYS',
        stackItems: [mapStatic],
        result: [mapStatic.keys()],
        gas: FEES.ONE,
      },

      {
        op: 'VALUES',
        args: [[new BN(1), new BN(2)]],
        result: [new ArrayStackItem([new IntegerStackItem(new BN(1)), new IntegerStackItem(new BN(2))])],

        gas: FEES.ONE,
      },

      {
        op: 'VALUES',
        stackItems: [mapStatic],
        result: [new ArrayStackItem(mapStatic.valuesArray())],
        gas: FEES.ONE,
      },
    ],

    // {
    //   op: 'THROW',
    // },
    // {
    //   op: 'THROWIFNOT',
    // },
  ) as readonly TestCase[];

describe('opcodes', () => {
  // tslint:disable-next-line no-any
  const filterMethods = (value: any): any => {
    if (value == undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(filterMethods);
    }

    if (typeof value === 'function') {
      return undefined;
    }

    if (typeof value === 'object') {
      // tslint:disable-next-line no-any
      const result: { [key: string]: any } = {};
      // tslint:disable-next-line no-loop-statement
      for (const [key, val] of Object.entries(value)) {
        if (key !== 'referenceID' && key !== 'mutableCount') {
          result[key] = filterMethods(val);
        }
      }

      return result;
    }

    return value;
  };

  for (const testCase of OPCODES) {
    const {
      op,
      postOps = [],
      result,
      resultAlt,
      gas,
      buffer,
      args = [],
      argsAlt = [],
      preOps = [],
      stackItems = [],
      ref,
      mockBlockchain,
      mockTransaction,
      returnValueCount,
    } = testCase;
    test(op, async () => {
      const sb = new ScriptBuilder();
      for (const { op: preOp, buffer: preBuffer } of preOps) {
        sb.emitOp(preOp, preBuffer);
      }

      sb.emitOp(op, buffer);

      for (const { op: postOp, buffer: postBuffer } of postOps) {
        sb.emitOp(postOp, postBuffer);
      }

      const transaction = transactions.createInvocation({
        script: sb.build(),
        attributes: [
          new UInt160Attribute({
            usage: AttributeUsage.Script,
            value: scriptAttributeHash,
          }),
        ],
      });

      if (mockTransaction !== undefined) {
        mockTransaction({ transaction });
      }

      const blockchain = {
        output: {},
        asset: {},
        action: {
          add: jest.fn(() => {
            // do nothing
          }),
        },

        contract: {},
        currentBlock: {},
      };

      const block = { timestamp: blockTime };
      const init: ExecutionInit = {
        scriptContainer: {
          type: ScriptContainerType.Transaction,
          value: transaction as Transaction,
        },

        triggerType,
        action: NULL_ACTION,
        listeners: {},
        skipWitnessVerify: false,
        persistingBlock: block as any,
      };

      const gasLeft = utils.ONE_HUNDRED_MILLION;
      let stack: readonly StackItem[] = [];
      let stackAlt: readonly StackItem[] = [];
      if (mockBlockchain !== undefined) {
        mockBlockchain({ blockchain });
      }

      if (args.length) {
        const argsSB = new ScriptBuilder();
        argsSB.emitPushParams(...args);
        const argsContext = await executeScript({
          code: argsSB.build(),
          blockchain: blockchain as any,
          init,
          gasLeft,
        });

        ({ stack } = argsContext);
      } else if (stackItems.length) {
        stack = stackItems;
      }

      if (argsAlt.length) {
        const argsAltSB = new ScriptBuilder();
        argsAltSB.emitPushParams(...argsAlt);
        const argsAltContext = await executeScript({
          code: argsAltSB.build(),
          blockchain: blockchain as any,
          init,
          gasLeft,
        });

        stackAlt = argsAltContext.stack;
      }

      const context = await executeScript({
        code: transaction.script,
        blockchain: blockchain as any,
        init,
        gasLeft,
        options: { stack, stackAlt, returnValueCount } as any,
      });

      expect(context.errorMessage).toBeUndefined();
      if (resultAlt) {
        expect(filterMethods(context.stackAlt)).toEqual(filterMethods(resultAlt));
      }

      if (stackItems.length && ref) {
        expect(filterMethods(ref)).toEqual(filterMethods(result[0]));
      } else {
        expect(context.stack.length).toEqual(result.length);
        for (const [idx, item] of context.stack.entries()) {
          const resultItem = result[idx];
          if (item instanceof IntegerStackItem && resultItem instanceof IntegerStackItem) {
            expect(item.asBigInteger().toString(10)).toEqual(resultItem.asBigInteger().toString(10));
          } else {
            expect(filterMethods(item)).toEqual(filterMethods(resultItem));
          }
        }
      }
      expect(gasLeft.sub(context.gasLeft).toString(10)).toEqual(gas.toString(10));
    });
  }
});
