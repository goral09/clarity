import { expect } from 'chai';
import {
  decodeBase16,
  I32,
  I64,
  StringValue,
  U128,
  U32,
  U64,
  U8
} from '../../src';
import {
  AccessRights,
  CLValue,
  KeyValue,
  PublicKey,
  URef
} from '../../src/lib';
import {
  toBytesDeployHash,
  toBytesI32,
  toBytesI64,
  toBytesString,
  toBytesU128,
  toBytesU32,
  toBytesU64,
  toBytesU8,
  toBytesVecT
} from '../../src/lib/byterepr';
import { BigNumber } from '@ethersproject/bignumber';

describe(`numbers' toBytes`, () => {
  it('should be able to encode u8', () => {
    let bytesU8 = toBytesU8(10);
    expect(bytesU8).to.deep.eq(Uint8Array.from([0x0a]));
    expect(U8.fromBytes(bytesU8).val!.value).to.eq(10);

    bytesU8 = toBytesU8(255);
    expect(bytesU8).to.deep.eq(Uint8Array.from([0xff]));
    expect(U8.fromBytes(bytesU8).val!.value).to.eq(255);

    expect(() => toBytesU8(256)).to.throws('out');
  });

  it('should be able to encode u32', () => {
    let bytesU32 = toBytesU32(0xf0e0_d0c0);
    expect(bytesU32).to.deep.eq(Uint8Array.from([0xc0, 0xd0, 0xe0, 0xf0]));
    expect(U32.fromBytes(bytesU32).val!.value).to.eq(0xf0e0_d0c0);
    bytesU32 = toBytesU32(100000);
    expect(bytesU32).to.deep.eq(Uint8Array.from([160, 134, 1, 0]));
    expect(U32.fromBytes(bytesU32).val!.value).to.eq(100000);
    bytesU32 = toBytesU32(0);
    expect(bytesU32).to.deep.eq(Uint8Array.from([0, 0, 0, 0]));
    expect(U32.fromBytes(bytesU32).val!.value).to.eq(0);
  });

  it('should be able to encode i32', () => {
    let bytesI32 = toBytesI32(-100000);
    expect(bytesI32).to.deep.eq(Uint8Array.from([96, 121, 254, 255]));
    expect(I32.fromBytes(bytesI32).val!.value).to.eq(-100000);
    bytesI32 = toBytesI32(100000);
    expect(bytesI32).to.deep.eq(Uint8Array.from([160, 134, 1, 0]));
    expect(I32.fromBytes(bytesI32).val!.value).to.eq(100000);
    bytesI32 = toBytesI32(0);
    expect(bytesI32).to.deep.eq(Uint8Array.from([0, 0, 0, 0]));
    expect(I32.fromBytes(bytesI32).val!.value).to.eq(0);
    bytesI32 = toBytesI32(-1);
    expect(bytesI32).to.deep.eq(Uint8Array.from([255, 255, 255, 255]));
    expect(I32.fromBytes(bytesI32).val!.value).to.eq(-1);
  });

  it('should be able to encode i64', () => {
    let bytesI64 = toBytesI64('198572906121139257');
    expect(bytesI64).to.deep.eq(
      Uint8Array.from([57, 20, 94, 139, 1, 121, 193, 2])
    );
    expect(I64.fromBytes(bytesI64).val!.value).to.deep.equal(
      BigNumber.from('198572906121139257')
    );
    bytesI64 = toBytesI64('-4009477689550808');
    expect(bytesI64).to.deep.eq(
      Uint8Array.from([40, 88, 148, 186, 102, 193, 241, 255])
    );

    expect(
      BigNumber.from('-4009477689550808').eq(I64.fromBytes(bytesI64).val!.value)
    ).to.equal(true);
  });

  it('should be able to encode u64', () => {
    let bytesU64 = toBytesU64('14198572906121139257');
    expect(bytesU64).to.deep.eq(
      Uint8Array.from([57, 20, 214, 178, 212, 118, 11, 197])
    );
    expect(U64.fromBytes(bytesU64).val!.value).to.deep.equal(
      BigNumber.from('14198572906121139257')
    );
    bytesU64 = toBytesU64('9834009477689550808');
    expect(bytesU64).to.deep.eq(
      Uint8Array.from([216, 167, 130, 99, 132, 107, 121, 136])
    );
    expect(U64.fromBytes(bytesU64).val!.value).to.deep.equal(
      BigNumber.from('9834009477689550808')
    );
  });

  it('should be able to encode u128', () => {
    let bytesU128 = toBytesU128(100000);
    expect(bytesU128).to.deep.eq(Uint8Array.from([3, 160, 134, 1]));
    expect(U128.fromBytes(bytesU128).val!.value).to.deep.equal(
      BigNumber.from(100000)
    );
    bytesU128 = toBytesU128(0xf0e0_d0c0_0000);
    expect(bytesU128).to.deep.eq(
      Uint8Array.from([6, 0, 0, 0xc0, 0xd0, 0xe0, 0xf0])
    );
    expect(U128.fromBytes(bytesU128).val!.value).to.deep.equal(
      BigNumber.from(0xf0e0_d0c0_0000)
    );
    bytesU128 = toBytesU128(0x0000_f0e0_d0c0_0000);
    expect(bytesU128).to.deep.eq(
      Uint8Array.from([6, 0, 0, 0xc0, 0xd0, 0xe0, 0xf0])
    );
    expect(U128.fromBytes(bytesU128).val!.value).to.deep.equal(
      BigNumber.from(0x0000_f0e0_d0c0_0000)
    );
  });

  it('should be able to encode utf8 string', () => {
    const bytesString = toBytesString('test_测试');
    expect(bytesString).to.deep.eq(
      Uint8Array.from([
        11,
        0,
        0,
        0,
        116,
        101,
        115,
        116,
        95,
        230,
        181,
        139,
        232,
        175,
        149
      ])
    );
    expect(StringValue.fromBytes(bytesString).val!.str).to.equal('test_测试');
  });

  it('should serialize a vector of CLValue correctly', () => {
    const truth = decodeBase16(
      '0100000015000000110000006765745f7061796d656e745f70757273650a'
    );
    const bytes = toBytesVecT([CLValue.string('get_payment_purse')]);
    expect(bytes).to.deep.eq(truth);
  });

  it('should serialize Key of URef variant correctly', () => {
    const truth = decodeBase16(
      '022a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a07'
    );
    const uref = new URef(
      decodeBase16(
        '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
      ),
      AccessRights.READ_ADD_WRITE
    );
    const bytes = KeyValue.fromURef(uref).toBytes();
    expect(bytes).to.deep.eq(truth);

    const bytes2 = KeyValue.fromURef(
      URef.fromFormattedStr(
        'uref-d93dfedfc13180a0ea188841e64e0a1af718a733216e7fae4909dface372d2b0-007'
      )
    ).toBytes();
    expect(bytes2).to.deep.eq(
      Uint8Array.from([
        2,
        217,
        61,
        254,
        223,
        193,
        49,
        128,
        160,
        234,
        24,
        136,
        65,
        230,
        78,
        10,
        26,
        247,
        24,
        167,
        51,
        33,
        110,
        127,
        174,
        73,
        9,
        223,
        172,
        227,
        114,
        210,
        176,
        7
      ])
    );
  });

  it('should serialize DeployHash correctly', () => {
    const deployHash = decodeBase16(
      '7e83be8eb783d4631c3239eee08e95f33396210e23893155b6fb734e9b7f0df7'
    );
    const bytes = toBytesDeployHash(deployHash);
    expect(bytes).to.deep.eq(
      Uint8Array.from([
        126,
        131,
        190,
        142,
        183,
        131,
        212,
        99,
        28,
        50,
        57,
        238,
        224,
        142,
        149,
        243,
        51,
        150,
        33,
        14,
        35,
        137,
        49,
        85,
        182,
        251,
        115,
        78,
        155,
        127,
        13,
        247
      ])
    );
  });
  it('should serialize ByteArray correctly', () => {
    const byteArray = Uint8Array.from(Array(32).fill(42));
    const bytes = CLValue.byteArray(byteArray).toBytes();
    expect(bytes).to.deep.eq(
      Uint8Array.from([
        32,
        0,
        0,
        0,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        15,
        32,
        0,
        0,
        0
      ])
    );
  });

  it('should serialize PublicKey correctly', () => {
    const publicKey = Uint8Array.from(Array(32).fill(42));
    const bytes = PublicKey.fromEd25519(publicKey).toBytes();
    expect(bytes).to.deep.eq(
      Uint8Array.from([
        1,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42
      ])
    );
  });
});
