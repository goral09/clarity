import blake from 'blakejs';
import * as fs from 'fs';
import { ByteArray, PublicKey } from '../index';
import * as DeployUtil from './DeployUtil';
import { RuntimeArgs } from './RuntimeArgs';
import { CLValue, AccountHash, KeyValue } from './CLValue';
import { AsymmetricKey } from './Keys';
import { DeployParams } from './DeployUtil';

// https://www.npmjs.com/package/tweetnacl-ts
// https://github.com/dcposch/blakejs

/**
 * Use blake2b to compute hash of ByteArray
 *
 * @param x
 */
export function byteHash(x: ByteArray): ByteArray {
  return blake.blake2b(x, null, 32);
}

export class Contract {
  private sessionWasm: ByteArray;
  private paymentWasm: ByteArray;

  /**
   *
   * @param sessionPath
   * @param paymentPath the path of payment contract file, set it undefined if you want use standard payment
   */
  constructor(sessionPath: string, paymentPath?: string) {
    this.sessionWasm = fs.readFileSync(sessionPath);
    if (!paymentPath) {
      this.paymentWasm = Buffer.from('');
    } else {
      this.paymentWasm = fs.readFileSync(paymentPath);
    }
  }

  /**
   * Generate the Deploy message for this contract
   *
   * @param args Arguments
   * @param paymentAmount
   * @param accountPublicKey
   * @param signingKeyPair key pair to sign the deploy
   * @param chainName
   */
  public deploy(
    args: RuntimeArgs,
    paymentAmount: bigint,
    accountPublicKey: PublicKey,
    signingKeyPair: AsymmetricKey,
    chainName: string
  ): DeployUtil.Deploy {
    const session = new DeployUtil.ModuleBytes(
      this.sessionWasm,
      args.toBytes()
    );
    const paymentArgs = RuntimeArgs.fromMap({
      amount: CLValue.u512(paymentAmount.toString())
    });

    const payment = new DeployUtil.ModuleBytes(
      this.paymentWasm,
      paymentArgs.toBytes()
    );

    const deploy = DeployUtil.makeDeploy(
      new DeployParams(accountPublicKey, chainName),
      session,
      payment
    );
    return DeployUtil.signDeploy(deploy, signingKeyPair);
  }
}

/**
 * Always use the same account for deploying and signing.
 */
export class BoundContract {
  constructor(
    private contract: Contract,
    private contractKeyPair: AsymmetricKey
  ) {}

  public deploy(
    args: RuntimeArgs,
    paymentAmount: bigint,
    chainName: string
  ): DeployUtil.Deploy {
    return this.contract.deploy(
      args,
      paymentAmount,
      this.contractKeyPair.publicKey,
      this.contractKeyPair,
      chainName
    );
  }
}

export class Faucet {
  /**
   * Arguments for Faucet smart contract
   *
   * @param accountPublicKeyHash the public key hash that want to be funded
   */
  public static args(accountPublicKeyHash: ByteArray): RuntimeArgs {
    const accountKey = KeyValue.fromAccount(
      new AccountHash(accountPublicKeyHash)
    );
    return RuntimeArgs.fromMap({
      account: CLValue.key(accountKey)
    });
  }
}

export class Transfer {
  /**
   * Arguments for Transfer smart contract
   *
   * @param accountPublicKeyHash the target account to transfer tokens
   * @param amount the amount of tokens to transfer
   */
  public static args(
    accountPublicKeyHash: ByteArray,
    amount: bigint
  ): RuntimeArgs {
    const account = CLValue.key(
      KeyValue.fromAccount(new AccountHash(accountPublicKeyHash))
    );
    return RuntimeArgs.fromMap({
      account,
      amount: CLValue.u512(amount.toString())
    });
  }
}
